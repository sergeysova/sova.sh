import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDeploymentTarget, TARGET_NAMES, TARGETS} from './target-manifest.mjs';

const ALL = new Set(TARGET_NAMES);

const rootBuildFiles = new Set([
  'package.json',
  '.npmrc',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
  '.nvmrc',
]);

function isDocumentation(path) {
  return (
    path === 'README.md' ||
    path === 'AGENTS.md' ||
    path === 'CLAUDE.md' ||
    path === 'DESKCHAT.md' ||
    path.startsWith('docs/') ||
    /(^|\/)README\.md$/.test(path)
  );
}

function addAppTargets(targets, app) {
  for (const [name, target] of Object.entries(TARGETS)) {
    if (target.appGroup === app) targets.add(name);
  }
}

function addTargetsForGroups(targets, groups) {
  for (const group of groups) addAppTargets(targets, group);
}

export function selectTargets(paths) {
  if (!Array.isArray(paths) || paths.length === 0) return new Set(ALL);

  const selected = new Set();
  for (const path of paths) {
    if (
      typeof path !== 'string' ||
      path.length === 0 ||
      path.startsWith('/') ||
      path.includes('..')
    ) {
      return new Set(ALL);
    }
    if (isDocumentation(path)) continue;
    const appGroups = new Set(
      Object.values(TARGETS)
        .filter(({appPath}) => path.startsWith(`${appPath}/`))
        .map(({appGroup}) => appGroup),
    );
    if (appGroups.size) {
      addTargetsForGroups(selected, appGroups);
      continue;
    }
    if (
      rootBuildFiles.has(path) ||
      path.startsWith('packages/content/') ||
      path.startsWith('packages/ui/')
    ) {
      return new Set(ALL);
    }
    if (path.startsWith('content/news/')) {
      addTargetsForGroups(selected, ['news', 'sova', 'brand']);
    } else if (/^content\/(articles|projects|interests)\//.test(path)) {
      addTargetsForGroups(selected, ['sova', 'brand']);
    } else if (path.startsWith('content/')) {
      return new Set(ALL);
    } else if (path.startsWith('.github/workflows/') || path.startsWith('scripts/')) {
      return new Set(ALL);
    } else {
      return new Set(ALL);
    }
  }
  return selected;
}

async function changedFiles(from, to = 'HEAD') {
  const {execFileSync} = await import('node:child_process');
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', from, to], {stdio: 'ignore'});
    return execFileSync('git', ['diff', '--no-renames', '--name-only', `${from}..${to}`], {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);
  } catch {
    return null;
  }
}

async function lastSuccessfulTargetCommits({repository, token}) {
  if (!repository || !token) return null;
  const headers = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'x-github-api-version': '2022-11-28',
  };
  const request = async (url) => {
    const response = await fetch(url, {headers});
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    return response.json();
  };
  try {
    const commits = {};
    for (const target of TARGET_NAMES) {
      const deploymentTarget = getDeploymentTarget(
        target,
        process.env.BRAND_EN_CUSTOM_DOMAIN_READY === 'true',
      );
      const environment = encodeURIComponent(deploymentTarget.environment);
      const deployments = await request(
        `https://api.github.com/repos/${repository}/deployments?environment=${environment}&per_page=100`,
      );
      for (const deployment of deployments) {
        const statuses = await request(
          `https://api.github.com/repos/${repository}/deployments/${deployment.id}/statuses?per_page=1`,
        );
        if (statuses[0]?.state === 'success') {
          commits[target] = deployment.sha;
          break;
        }
      }
    }
    return commits;
  } catch {
    return null;
  }
}

async function main() {
  const event = process.env.GITHUB_EVENT_NAME;
  let selected;
  if (event === 'schedule') {
    selected = new Set(TARGET_NAMES.filter((target) => TARGETS[target].refreshExternalData));
  } else if (event === 'workflow_dispatch') {
    selected = new Set(TARGETS);
  } else {
    const baselines = await lastSuccessfulTargetCommits({
      repository: process.env.GITHUB_REPOSITORY,
      token: process.env.GITHUB_TOKEN,
    });
    if (!baselines || TARGET_NAMES.some((target) => !baselines[target])) {
      selected = new Set(ALL);
    } else {
      selected = new Set();
      for (const target of TARGET_NAMES) {
        const paths = await changedFiles(baselines[target]);
        if (!paths) {
          selected = new Set(ALL);
          break;
        }
        if (selectTargets(paths).has(target)) selected.add(target);
      }
    }
  }

  const targets = TARGET_NAMES.filter((target) => selected.has(target));
  const output = process.env.GITHUB_OUTPUT;
  if (output) {
    const {appendFile} = await import('node:fs/promises');
    await appendFile(output, `matrix=${JSON.stringify(targets)}\n`);
  } else {
    console.log(JSON.stringify(targets));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === 'github-output') {
    const target = TARGETS[process.argv[3]];
    if (!target) throw new Error(`Unknown target: ${process.argv[3] ?? ''}`);
    const output = `cache_path=${target.cachePath ?? ''}\npreview_config_path=${target.previewConfig ?? ''}\n`;
    if (process.env.GITHUB_OUTPUT) {
      const {appendFile} = await import('node:fs/promises');
      await appendFile(process.env.GITHUB_OUTPUT, output);
    } else {
      process.stdout.write(output);
    }
  } else if (process.env.TARGET_FILES_JSON) {
    const paths = JSON.parse(await readFile(process.env.TARGET_FILES_JSON, 'utf8'));
    console.log(JSON.stringify([...selectTargets(paths)]));
  } else {
    await main();
  }
}
