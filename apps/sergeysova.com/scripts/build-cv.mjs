#!/usr/bin/env node
// Compiles src/*.typ into public/*.pdf using the `typst` npm package
// (bundles the typst binary directly — no browser/puppeteer involved).

import {globSync} from 'glob';
import path from 'node:path';
import * as typst from 'typst';

const list = globSync('./src/*.typ');

for (const source of list) {
  const filename = path.basename(source, '.typ');
  const target = `./public/${filename}.pdf`;

  console.log('compiling', source, '->', target);
  await typst.compile(source, target);
}
