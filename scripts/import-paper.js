#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, OUTPUT_ROOT, PAPER_SLUG_RE, SOURCE_RE } = require('./lib/repository');

function usage() {
  console.error('用法: npm run import -- <生成目录> <paper-slug> --source <来源标识> --source-branch <来源分支> --title "..." --title-zh "..." --paper-url "https://..." --participant "..." [--github "..."] [--year 2024] [--venue "..."] [--topics "CV,CNN"]');
  process.exit(2);
}

function options(tokens) {
  const result = {};
  for (let i = 0; i < tokens.length; i += 2) {
    if (!tokens[i].startsWith('--') || tokens[i + 1] === undefined) usage();
    result[tokens[i].slice(2)] = tokens[i + 1];
  }
  return result;
}

function copyFiltered(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'dist-ssr', 'paper.json', '.git'].includes(entry.name)) continue;
    const src = path.join(source, entry.name);
    const dest = path.join(target, entry.name);
    if (entry.isDirectory()) copyFiltered(src, dest);
    else if (entry.isFile()) fs.copyFileSync(src, dest);
  }
}

const [sourceArg, paperSlug, ...rest] = process.argv.slice(2);
if (!sourceArg || !paperSlug) usage();
if (!PAPER_SLUG_RE.test(paperSlug)) throw new Error('paper-slug 只能包含小写字母、数字和中间连字符');
const opts = options(rest);
for (const key of ['source', 'source-branch', 'title', 'title-zh', 'paper-url', 'participant']) {
  if (!opts[key]) throw new Error(`缺少 --${key}`);
}
if (!SOURCE_RE.test(opts.source)) throw new Error('--source 只能包含小写字母、数字和中间连字符');
if (!/^https:\/\//.test(opts['paper-url'])) throw new Error('--paper-url 必须是 https:// 链接');

const source = path.resolve(ROOT, sourceArg);
const slug = `${paperSlug}_${opts.source}`;
const target = path.join(OUTPUT_ROOT, slug);
if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) throw new Error(`找不到源目录：${source}`);
if (!fs.existsSync(path.join(source, 'package.json'))) throw new Error('源目录不是 paper-skill 输出：缺少 package.json');
if (fs.existsSync(target)) throw new Error(`目标已存在：${target}`);
if (target === source || target.startsWith(`${source}${path.sep}`)) throw new Error('目标目录不能位于源目录内部');

copyFiltered(source, target);
const participant = { name: opts.participant };
if (opts.github) participant.github = opts.github.replace(/^@/, '');
const meta = {
  schemaVersion: 1,
  slug,
  paperSlug,
  source: opts.source,
  sourceBranch: opts['source-branch'],
  title: opts.title,
  titleZh: opts['title-zh'],
  authors: [],
  year: opts.year ? Number(opts.year) : null,
  venue: opts.venue || '',
  paperUrl: opts['paper-url'],
  participants: [participant],
  topics: opts.topics ? opts.topics.split(',').map((item) => item.trim()).filter(Boolean) : [],
  skillVersion: '1.0.0',
  status: 'review',
  entry: 'index.html',
};
fs.writeFileSync(path.join(target, 'paper.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
console.log(`已导入：${path.relative(ROOT, target)}`);
console.log('下一步：核对 paper.json，然后运行 npm run validate && npm run catalog。');
