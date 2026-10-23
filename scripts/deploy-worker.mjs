import {spawn} from 'node:child_process';
import {appendFile} from 'node:fs/promises';
import {getDeploymentTarget} from './target-manifest.mjs';

const [target] = process.argv.slice(2);
if (!target) {
  console.error('Usage: node scripts/deploy-worker.mjs <target>');
  process.exit(2);
}

const deploymentTarget = getDeploymentTarget(
  target,
  process.env.BRAND_EN_CUSTOM_DOMAIN_READY === 'true',
);
const child = spawn(
  'pnpm',
  ['exec', 'wrangler', 'deploy', '--config', deploymentTarget.wranglerConfig],
  {stdio: ['inherit', 'pipe', 'pipe']},
);
let output = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString();
    output += text;
    process[stream === child.stdout ? 'stdout' : 'stderr'].write(text);
  });
}
const exitCode = await new Promise((resolve) => child.on('close', resolve));

const version = output.match(/Version ID:\s*([a-f0-9-]+)/i)?.[1] ?? 'not reported';
const previewUrl = output.match(/https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)+\.workers\.dev/i)?.[0];
const url = deploymentTarget.url ?? previewUrl ?? '';
if (exitCode === 0 && !url) {
  throw new Error(`Could not determine the smoke-check URL for ${target}`);
}

await appendFile(process.env.GITHUB_OUTPUT, `version=${version}\nurl=${url}\n`);
await appendFile(
  process.env.GITHUB_STEP_SUMMARY,
  `### ${target} deployment attempt\n\n- Wrangler result: ${exitCode === 0 ? 'success' : `failed (exit ${exitCode ?? 'unknown'})`}\n- Commit: \`${process.env.GITHUB_SHA}\`\n- Worker version: \`${version}\`\n- Smoke-check URL: ${url || 'not reported'}\n${deploymentTarget.preview ? '- Classification: workers.dev preview; production domain remains on GitHub Pages pending DNS correction.\n' : ''}`,
);
if (exitCode !== 0) process.exit(exitCode ?? 1);
