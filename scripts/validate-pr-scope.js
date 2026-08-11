#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT } = require('./lib/repository');

const pullRequestBase = process.env.GITHUB_BASE_REF;
const base = pullRequestBase || process.argv[2];
if (!base) {
  console.log('非 Pull Request 环境，跳过变更范围检查。');
  process.exit(0);
}

const baseRef = base.startsWith('origin/') ? base : `origin/${base}`;

function readGitFiles(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || '无法读取 Pull Request 变更范围。');
    process.exit(1);
  }
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

const changedFiles = pullRequestBase
  ? readGitFiles(['diff', '--name-only', `${baseRef}...HEAD`])
  : [
      ...readGitFiles(['diff', '--name-only', baseRef]),
      ...readGitFiles(['ls-files', '--others', '--exclude-standard']),
    ];
const files = [...new Set(changedFiles.map((file) => file.replace(/\\/g, '/')))].sort();
const paperDirs = new Set(files.map((file) => file.match(/^html_output\/([^/]+)\//)?.[1]).filter(Boolean));
const touchesSkill = files.some((file) => file.startsWith('paper-skill/'));
const touchesPaper = paperDirs.size > 0;

function existsInBase(paperDir) {
  const result = spawnSync('git', ['cat-file', '-e', `${baseRef}:html_output/${paperDir}`], { cwd: ROOT });
  return result.status === 0;
}

function hasPresentation(paperDir) {
  const submissionDir = path.join(ROOT, 'html_output', paperDir);
  const presentation = path.join(submissionDir, 'presentation.pptx');
  return fs.existsSync(presentation) && fs.statSync(presentation).isFile();
}

if (paperDirs.size > 1) {
  console.error(`一份 PR 只能修改一篇论文，当前涉及：${[...paperDirs].join(', ')}`);
  process.exit(1);
}
if (touchesSkill && touchesPaper) {
  console.error('paper-skill 修改与论文内容参与任务必须拆成不同 Pull Request。');
  process.exit(1);
}
if (paperDirs.size === 1) {
  const paperDir = [...paperDirs][0];
  if (!existsInBase(paperDir) && !hasPresentation(paperDir)) {
    console.error(`新增作品目录 html_output/${paperDir}/ 中缺少 presentation.pptx。`);
    process.exit(1);
  }
}
console.log(`PR 范围检查通过（${files.length} 个文件${paperDirs.size ? `，论文：${[...paperDirs][0]}` : ''}）。`);
