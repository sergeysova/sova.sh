import {getDeploymentTarget} from './target-manifest.mjs';

const [command, target] = process.argv.slice(2);
if (!target || !['start', 'finish'].includes(command)) {
  console.error('Usage: node scripts/deployment-ledger.mjs <start|finish> <target>');
  process.exit(2);
}
const deploymentTarget = getDeploymentTarget(
  target,
  process.env.BRAND_EN_CUSTOM_DOMAIN_READY === 'true',
);

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const apiRoot = `https://api.github.com/repos/${repository}`;
const headers = {
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'x-github-api-version': '2022-11-28',
  'content-type': 'application/json',
};

async function api(path, body) {
  const response = await fetch(`${apiRoot}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`GitHub deployment API returned ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

if (command === 'start') {
  const deployment = await api('/deployments', {
    ref: process.env.GITHUB_SHA,
    environment: deploymentTarget.environment,
    description: `Deploy ${target} from ${process.env.GITHUB_SHA}`,
    production_environment: deploymentTarget.production,
    transient_environment: false,
    auto_merge: false,
    required_contexts: [],
  });
  await api(`/deployments/${deployment.id}/statuses`, {
    state: 'in_progress',
    description: `Deploying ${target}; post-deploy smoke checks are pending.`,
    log_url: `${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  });
  const {appendFile} = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_OUTPUT, `deployment_id=${deployment.id}\n`);
} else {
  const state = process.env.GITHUB_JOB_STATUS === 'success' ? 'success' : 'failure';
  const version = process.env.WORKER_VERSION || 'not reported';
  const description = `${target} ${state}; Worker version ${version}`;
  await api(`/deployments/${process.env.DEPLOYMENT_ID}/statuses`, {
    state,
    description,
    environment_url: process.env.DEPLOYMENT_URL || undefined,
    log_url: `${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  });
  if (state !== 'success') {
    throw new Error(`${target} deployment marked ${state}; no automatic rollback was attempted`);
  }
}
