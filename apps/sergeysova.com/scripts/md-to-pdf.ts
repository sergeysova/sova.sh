#!/usr/bin/env node --no-warnings --loader ts-node/esm --watch

import {globSync} from 'glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import {mdToPdf} from 'md-to-pdf';

const list = globSync('./src/*.pdf.md');

for (const page of list) {
  const filename = path.basename(page, '.pdf.md');
  const target = `./dist/${filename}.pdf`;

  console.log('processing', page, 'into', target);
  const content = await fs.readFile(page, 'utf-8');
  console.log({content});
  await mdToPdf({content}, {as_html: false, basedir: './dist', dest: target, devtools: true});
}
