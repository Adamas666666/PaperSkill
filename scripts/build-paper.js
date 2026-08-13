#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, SLUG_RE } = require('./lib/repository');

const slugs = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
if (slugs.length === 0) {
  console.error('用法：npm run build:paper -- <paper-slug>_<source>');
  process.exit(1);
}
for (const slug of slugs) {
  if (!SLUG_RE.test(slug)) {
    console.error(`论文目录标识格式无效：${slug}`);
    process.exit(1);
  }
}

const args = [path.join(ROOT, 'scripts', 'build-all.js'), '--output', 'site/papers'];
for (const slug of slugs) args.push('--paper', slug);
const result = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status || 0);
