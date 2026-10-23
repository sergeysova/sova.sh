import {readFile, writeFile} from 'node:fs/promises';
import {getTarget} from './target-manifest.mjs';

const brand = getTarget('brand-en');
const configPath = brand.wranglerConfig;
const previewPath = brand.previewConfig;
const config = await readFile(configPath, 'utf8');
const withoutRoute = config.replace(/^\s*"routes"\s*:\s*\[[\s\S]*?^\s*\],\s*$/m, '');
if (withoutRoute === config)
  throw new Error('Could not remove the custom-domain route from brand preview config');
const previewConfig = withoutRoute.replace(
  new RegExp(`("name"\\s*:\\s*)"${brand.workerName}"`),
  `$1"${brand.previewWorkerName}"`,
);
if (previewConfig === withoutRoute)
  throw new Error('Could not isolate the EN brand preview Worker name');
await writeFile(previewPath, previewConfig);
console.log(previewPath);
