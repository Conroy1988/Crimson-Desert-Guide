import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

function normaliseBasePath(value) {
  const candidate = String(value ?? '/').trim();
  if (!candidate || candidate === '/') return '/';
  return `/${candidate.replace(/^\/+|\/+$/g, '')}/`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const base = normaliseBasePath(process.env.CD_GUIDE_BASE_PATH);
const distRootName = String(process.env.CD_GUIDE_DIST_ROOT ?? 'dist')
  .replace(/^\.\//, '')
  .replace(/\/+$/g, '');
const distRoot = path.resolve(repositoryRoot, distRootName);
const dist =
  base === '/'
    ? distRoot
    : path.join(distRoot, ...base.split('/').filter(Boolean));
const failures = [];
let htmlCount = 0;
let assetReferenceCount = 0;
let optionalCodeStylesheetCount = 0;

const optionalCodeStylesheet = new RegExp(
  `^${escapeRegExp(base)}_astro/ec\\.[A-Za-z0-9_-]+\\.css$`,
);

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
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  if (base !== '/' && !url.startsWith(base)) return { escapedBase: true };

  const withoutBase = base === '/' ? url.slice(1) : url.slice(base.length);
  const clean = decodeURIComponent(withoutBase.split(/[?#]/, 1)[0]);
  return { absolute: path.join(dist, clean) };
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

  for (const match of source.matchAll(
    /\b(?:href|src|action|poster|data|content)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
  )) {
    const url = match[1] ?? match[2] ?? '';
    if (
      base !== '/' &&
      url.startsWith('/') &&
      !url.startsWith('//') &&
      !url.startsWith(base)
    ) {
      failures.push(`${relative}: root-relative URL escapes configured base path: ${url}`);
    }
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
      if (asset.escapedBase) {
        failures.push(`${relative}: referenced asset escapes configured base path: ${url}`);
        continue;
      }

      assetReferenceCount += 1;
      try {
        await access(asset.absolute);
      } catch {
        failures.push(`${relative}: referenced asset does not exist in output: ${url}`);
      }
    }
  }
}

if (htmlCount === 0) failures.push(`${path.relative(repositoryRoot, dist)}: no generated HTML pages found`);

if (failures.length > 0) {
  console.error('Deployment smoke test failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Deployment smoke test passed for ${htmlCount} HTML pages at base ${base}, ${assetReferenceCount} local asset references and ${optionalCodeStylesheetCount} optional Expressive Code stylesheet references.`,
);
