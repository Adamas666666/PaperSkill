#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT } = require('./lib/repository');

function git(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} 执行失败`);
  return result.stdout.split(/\r?\n/).filter(Boolean).map((file) => file.replace(/\\/g, '/'));
}

function nodeScript(name, args = []) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', name), ...args], { cwd: ROOT, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exit(result.status || 0);
}

const base = process.env.GITHUB_BASE_REF || process.argv[2] || 'main';
const baseRef = base.startsWith('origin/') ? base : `origin/${base}`;
const changedFiles = git(['diff', '--name-only', `${baseRef}...HEAD`]);
const paperNames = [...new Set(changedFiles.map((file) => file.match(/^html_output\/([^/]+)\//)?.[1]).filter(Boolean))];
const fullBuildPrefixes = ['scripts/', 'paper-skill/', 'schemas/'];
const fullBuildFiles = new Set(['package.json', '.github/workflows/validate-pr.yml', '.github/workflows/deploy-pages.yml']);
const needsFullBuild = changedFiles.some((file) => fullBuildPrefixes.some((prefix) => file.startsWith(prefix)) || fullBuildFiles.has(file));

if (needsFullBuild) {
  console.log('检测到共享构建、Skill 或校验逻辑变化，执行全量站点构建。');
  nodeScript('build-site.js');
}
if (paperNames.length > 0) {
  console.log(`仅构建本次变更的教程：${paperNames.join(', ')}`);
  nodeScript('build-all.js', ['--output', 'site/papers', ...paperNames.flatMap((paperName) => ['--paper', paperName])]);
}

console.log('本次变更不涉及教程或共享构建逻辑，跳过教程构建。');
