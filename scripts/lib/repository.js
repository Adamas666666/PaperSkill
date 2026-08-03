'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_ROOT = path.join(ROOT, 'html_output');
const PAPER_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SOURCE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*_[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${path.relative(ROOT, file)} 不是有效 JSON：${error.message}`);
  }
}

function listSubmissions() {
  if (!fs.existsSync(OUTPUT_ROOT)) return [];
  return fs.readdirSync(OUTPUT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => ({ slug: entry.name, dir: path.join(OUTPUT_ROOT, entry.name) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function validateMetadata(meta, expectedSlug) {
  const errors = [];
  const requiredStrings = ['slug', 'paperSlug', 'source', 'sourceBranch', 'title', 'titleZh', 'paperUrl', 'skillVersion', 'status', 'entry'];
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return ['paper.json 必须是对象'];
  if (meta.schemaVersion !== 1) errors.push('schemaVersion 必须为 1');
  for (const key of requiredStrings) {
    if (typeof meta[key] !== 'string' || meta[key].trim() === '') errors.push(`${key} 必须是非空字符串`);
  }
  if (!SLUG_RE.test(meta.slug || '')) errors.push('slug 必须使用 <paperSlug>_<source> 格式');
  if (!PAPER_SLUG_RE.test(meta.paperSlug || '')) errors.push('paperSlug 只能包含小写字母、数字和中间连字符');
  if (!SOURCE_RE.test(meta.source || '')) errors.push('source 只能包含小写字母、数字和中间连字符');
  if (meta.slug !== `${meta.paperSlug}_${meta.source}`) errors.push('slug 必须等于 paperSlug + "_" + source');
  if (meta.slug !== expectedSlug) errors.push(`slug 必须与目录名一致（期望 ${expectedSlug}）`);
  if (!/^https:\/\//.test(meta.paperUrl || '')) errors.push('paperUrl 必须是 https:// 链接');
  if (!/^\d+\.\d+\.\d+$/.test(meta.skillVersion || '')) errors.push('skillVersion 必须是 x.y.z');
  if (!['draft', 'review', 'published'].includes(meta.status)) errors.push('status 必须是 draft、review 或 published');
  if (meta.entry !== 'index.html') errors.push('entry 必须是 index.html');
  if (!Array.isArray(meta.participants) || meta.participants.length === 0) {
    errors.push('participants 至少包含一位参与者');
  } else {
    meta.participants.forEach((item, index) => {
      if (!item || typeof item.name !== 'string' || !item.name.trim()) errors.push(`participants[${index}].name 不能为空`);
    });
  }
  if (!Array.isArray(meta.topics)) errors.push('topics 必须是数组');
  if (meta.year !== undefined && meta.year !== null && (!Number.isInteger(meta.year) || meta.year < 1900 || meta.year > 2100)) {
    errors.push('year 必须是 1900–2100 的整数或 null');
  }
  return errors;
}

function metadataFor(submission) {
  const file = path.join(submission.dir, 'paper.json');
  if (!fs.existsSync(file)) throw new Error(`${path.relative(ROOT, file)} 不存在`);
  return readJson(file);
}

function catalogRecord(meta) {
  return {
    slug: meta.slug,
    paperSlug: meta.paperSlug,
    source: meta.source,
    sourceBranch: meta.sourceBranch,
    title: meta.title,
    titleZh: meta.titleZh,
    authors: meta.authors || [],
    year: meta.year ?? null,
    venue: meta.venue || '',
    paperUrl: meta.paperUrl,
    participants: meta.participants,
    topics: meta.topics,
    skillVersion: meta.skillVersion,
    status: meta.status,
    tutorialUrl: `papers/${meta.slug}/`,
  };
}

module.exports = { ROOT, OUTPUT_ROOT, SLUG_RE, PAPER_SLUG_RE, SOURCE_RE, readJson, listSubmissions, validateMetadata, metadataFor, catalogRecord };
