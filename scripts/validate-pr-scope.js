#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const { ROOT } = require('./lib/repository');

const base = process.env.GITHUB_BASE_REF || process.argv[2];
if (!base) {
  console.log('非 Pull Request 环境，跳过变更范围检查。');
  process.exit(0);
}

const result = spawnSync('git', ['diff', '--name-only', `origin/${base}...HEAD`], { cwd: ROOT, encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || '无法读取 Pull Request 变更范围。');
  process.exit(1);
}

const files = result.stdout.split(/\r?\n/).filter(Boolean).map((file) => file.replace(/\\/g, '/'));
const paperDirs = new Set(files.map((file) => file.match(/^html_output\/([^/]+)\//)?.[1]).filter(Boolean));
const touchesSkill = files.some((file) => file.startsWith('paper-skill/'));
const touchesPaper = paperDirs.size > 0;

if (paperDirs.size > 1) {
  console.error(`一份 PR 只能修改一篇论文，当前涉及：${[...paperDirs].join(', ')}`);
  process.exit(1);
}
if (touchesSkill && touchesPaper) {
  console.error('paper-skill 修改与论文内容参与任务必须拆成不同 Pull Request。');
  process.exit(1);
}
console.log(`PR 范围检查通过（${files.length} 个文件${paperDirs.size ? `，论文：${[...paperDirs][0]}` : ''}）。`);
