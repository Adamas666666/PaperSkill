#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, PAPER_NAME_RE } = require('./lib/repository');

const paperNames = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
if (paperNames.length === 0) {
  console.error('用法：npm run build:paper -- <paper-name>');
  process.exit(1);
}
for (const paperName of paperNames) {
  if (!PAPER_NAME_RE.test(paperName)) {
    console.error(`论文目录标识格式无效：${paperName}`);
    process.exit(1);
  }
}

const args = [path.join(ROOT, 'scripts', 'build-all.js'), '--output', 'site/papers'];
for (const paperName of paperNames) args.push('--paper', paperName);
const result = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status || 0);
