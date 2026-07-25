import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const failures = [];
let htmlCount = 0;
let assetReferenceCount = 0;
let optionalCodeStylesheetCount = 0;

const optionalCodeStylesheet = /^\/_astro\/ec\.[A-Za-z0-9_-]+\.css$/;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }

  return files;
}

function getAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'),
  );
  return match ? match[1] ?? match[2] ?? '' : '';
}

function localAssetPath(url) {
  if (!url.startsWith('/')) return null;
  const clean = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  return path.join(dist, clean.replace(/^\/+/, ''));
}

for (const file of await walk(dist)) {
  if (!file.endsWith('.html')) continue;
  htmlCount += 1;

  const relative = path.relative(dist, file);
  const source = await readFile(file, 'utf8');

  if (!/<meta\s+name=["']viewport["']/i.test(source)) {
    failures.push(`${relative}: missing mobile viewport metadata`);
  }

  const inlineStyleBytes = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .reduce((total, match) => total + Buffer.byteLength(match[1]), 0);

  // The complete Starlight shell and custom responsive theme currently exceed
  // 79 KB on every route. This floor allows modest minification changes while
  // preventing a future build from moving critical layout CSS back outside.
  if (inlineStyleBytes < 70_000) {
    failures.push(
      `${relative}: only ${inlineStyleBytes} bytes of inline CSS; critical responsive styles are not self-contained`,
    );
  }

  const tags = source.match(/<(?:link|script)\b[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const rel = getAttribute(tag, 'rel').toLowerCase().split(/\s+/);
    const media = getAttribute(tag, 'media').toLowerCase();
    const href = getAttribute(tag, 'href');
    const src = getAttribute(tag, 'src');

    if (rel.includes('stylesheet') && media !== 'print') {
      if (optionalCodeStylesheet.test(href)) {
        optionalCodeStylesheetCount += 1;
      } else {
        failures.push(
          `${relative}: depends on an unexpected external screen stylesheet (${href || 'unknown href'})`,
        );
      }
    }

    for (const url of [href, src]) {
      const asset = localAssetPath(url);
      if (!asset) continue;
      assetReferenceCount += 1;
      try {
        await access(asset);
      } catch {
        failures.push(`${relative}: referenced asset does not exist in dist: ${url}`);
      }
    }
  }
}

if (htmlCount === 0) failures.push('dist: no generated HTML pages found');

if (failures.length > 0) {
  console.error('Deployment smoke test failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Deployment smoke test passed for ${htmlCount} HTML pages, ${assetReferenceCount} local asset references and ${optionalCodeStylesheetCount} optional Expressive Code stylesheet references.`,
);
