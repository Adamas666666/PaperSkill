#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`Source cache validation failed: ${message}`);
  process.exit(1);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${label} must be a non-empty string.`);
  }
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array.`);
  }
  value.forEach((item, index) => requireString(item, `${label}[${index}]`));
}

const cacheArg = process.argv[2];
if (!cacheArg) {
  fail('usage: node validate-source-cache.js <source-cache-directory>');
}

const cacheRoot = path.resolve(cacheArg);
if (!fs.existsSync(cacheRoot) || !fs.statSync(cacheRoot).isDirectory()) {
  fail(`directory does not exist: ${cacheRoot}`);
}
const cacheRootReal = fs.realpathSync(cacheRoot);

function resolveCacheFile(relativePath, label) {
  requireString(relativePath, label);
  if (path.isAbsolute(relativePath)) {
    fail(`${label} must be relative to the source cache.`);
  }
  const candidate = path.resolve(cacheRoot, relativePath);
  const prefix = `${cacheRoot}${path.sep}`;
  if (!candidate.startsWith(prefix)) {
    fail(`${label} escapes the source cache: ${relativePath}`);
  }
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    fail(`${label} does not exist: ${relativePath}`);
  }
  const real = fs.realpathSync(candidate);
  const realPrefix = `${cacheRootReal}${path.sep}`;
  if (!real.startsWith(realPrefix)) {
    fail(`${label} resolves outside the source cache: ${relativePath}`);
  }
  return real;
}

const manifestPath = path.join(cacheRoot, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  fail('manifest.json is missing.');
}
const manifest = readJson(manifestPath, 'manifest.json');

if (manifest.schemaVersion !== 1) {
  fail('manifest.schemaVersion must be 1.');
}

const sourceKinds = new Set(['pdf', 'latex', 'text', 'url', 'description']);
if (!sourceKinds.has(manifest.sourceKind)) {
  fail('manifest.sourceKind must be pdf, latex, text, url, or description.');
}
requireString(manifest.origin, 'manifest.origin');
if (typeof manifest.sourceSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(manifest.sourceSha256)) {
  fail('manifest.sourceSha256 must be a SHA-256 digest.');
}
requireString(manifest.locatorScheme, 'manifest.locatorScheme');

if (manifest.sourceKind === 'pdf') {
  if (!Number.isInteger(manifest.pageCount) || manifest.pageCount < 1) {
    fail('manifest.pageCount must be a positive integer for PDF input.');
  }
} else if (manifest.pageCount !== null && manifest.pageCount !== undefined) {
  if (!Number.isInteger(manifest.pageCount) || manifest.pageCount < 1) {
    fail('manifest.pageCount must be null or a positive integer.');
  }
}

const contentPath = resolveCacheFile(manifest.contentFile, 'manifest.contentFile');
if (fs.readFileSync(contentPath, 'utf8').trim() === '') {
  fail('the normalized content file is empty.');
}

if (!manifest.metadata || typeof manifest.metadata !== 'object' || Array.isArray(manifest.metadata)) {
  fail('manifest.metadata must be an object.');
}
requireString(manifest.metadata.title, 'manifest.metadata.title');
requireStringArray(manifest.metadata.authors, 'manifest.metadata.authors');
requireString(manifest.metadata.venue, 'manifest.metadata.venue');
requireString(String(manifest.metadata.year ?? ''), 'manifest.metadata.year');

if (!Array.isArray(manifest.figures)) {
  fail('manifest.figures must be an array, which may be empty.');
}
const figureIds = new Set();
manifest.figures.forEach((figure, index) => {
  const label = `manifest.figures[${index}]`;
  if (!figure || typeof figure !== 'object' || Array.isArray(figure)) {
    fail(`${label} must be an object.`);
  }
  requireString(figure.id, `${label}.id`);
  if (figureIds.has(figure.id)) {
    fail(`${label}.id is duplicated: ${figure.id}`);
  }
  figureIds.add(figure.id);
  requireString(figure.locator, `${label}.locator`);
  requireString(figure.caption, `${label}.caption`);
  if (figure.file !== null && figure.file !== undefined && figure.file !== '') {
    resolveCacheFile(figure.file, `${label}.file`);
  }
});

const evidencePath = resolveCacheFile(manifest.evidenceFile, 'manifest.evidenceFile');
const evidence = readJson(evidencePath, 'evidence file');
if (!Array.isArray(evidence.claims) || evidence.claims.length === 0) {
  fail('evidence.claims must be a non-empty array.');
}
evidence.claims.forEach((claim, index) => {
  const label = `evidence.claims[${index}]`;
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    fail(`${label} must be an object.`);
  }
  requireString(claim.claim, `${label}.claim`);
  requireString(claim.locator, `${label}.locator`);
  requireString(claim.conditions, `${label}.conditions`);
  requireString(claim.protocol, `${label}.protocol`);
  requireString(claim.allowedWording, `${label}.allowedWording`);
});

console.log(`Source cache validation passed: ${cacheRoot}`);
