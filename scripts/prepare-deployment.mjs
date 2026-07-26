import { access, readFile, readdir, writeFile } from 'node:fs/promises';
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

const base = normaliseBasePath(process.env.CD_GUIDE_BASE_PATH);
const site = String(
  process.env.CD_GUIDE_SITE ?? 'https://crimson-desert-guide.dannyconroy.workers.dev',
).replace(/\/+$/g, '');
const distRootName = String(process.env.CD_GUIDE_DIST_ROOT ?? 'dist')
  .replace(/^\.\//, '')
  .replace(/\/+$/g, '');
const distRoot = path.resolve(repositoryRoot, distRootName);
const outputDirectory =
  base === '/'
    ? distRoot
    : path.join(distRoot, ...base.split('/').filter(Boolean));

await access(outputDirectory);

let rewrittenFiles = 0;
let rewrittenReferences = 0;
const failures = [];

if (base !== '/') {
  const baseName = base.slice(1);
  const escapedBaseName = escapeRegExp(baseName);
  const attributePattern = new RegExp(
    `\\b(href|src|action|poster|data|content)\\s*=\\s*(['"])/(?!/|${escapedBaseName})`,
    'gi',
  );
  const escapedAttributePattern = new RegExp(
    `\\b(?:href|src|action|poster|data|content)\\s*=\\s*['"]/(?!/|${escapedBaseName})`,
    'i',
  );
  const srcsetPattern = /\bsrcset\s*=\s*(['"])([^'"]*)\1/gi;

  for (const file of await walk(outputDirectory)) {
    if (!file.endsWith('.html') && !file.endsWith('.xml')) continue;

    const source = await readFile(file, 'utf8');
    let next = source.replace(attributePattern, (_match, attribute, quote) => {
      rewrittenReferences += 1;
      return `${attribute}=${quote}${base}`;
    });

    next = next.replace(srcsetPattern, (match, quote, value) => {
      let changed = false;
      const rewritten = value
        .split(',')
        .map((candidate) => {
          const leadingWhitespace = candidate.match(/^\s*/)?.[0] ?? '';
          const trimmed = candidate.trim();
          if (!trimmed) return candidate;

          const [url, ...descriptor] = trimmed.split(/\s+/);
          if (
            !url.startsWith('/') ||
            url.startsWith('//') ||
            url.startsWith(base)
          ) {
            return candidate;
          }

          changed = true;
          rewrittenReferences += 1;
          return `${leadingWhitespace}${base}${url.slice(1)}${
            descriptor.length ? ` ${descriptor.join(' ')}` : ''
          }`;
        })
        .join(',');

      return changed ? `srcset=${quote}${rewritten}${quote}` : match;
    });

    if (escapedAttributePattern.test(next)) {
      failures.push(
        `${path.relative(outputDirectory, file)} still contains a root-relative deployment reference`,
      );
    }

    if (next !== source) {
      await writeFile(file, next);
      rewrittenFiles += 1;
    }
  }
}

const robotsPath = path.join(outputDirectory, 'robots.txt');
try {
  const robots = await readFile(robotsPath, 'utf8');
  const sitemapUrl = `${site}${base}sitemap-index.xml`;
  const nextRobots = robots
    .replace(/^Allow:.*$/m, `Allow: ${base}`)
    .replace(/^Sitemap:.*$/m, `Sitemap: ${sitemapUrl}`);

  if (nextRobots !== robots) {
    await writeFile(robotsPath, nextRobots);
    rewrittenFiles += 1;
  }
} catch (error) {
  failures.push(`robots.txt could not be prepared: ${error.message}`);
}

if (failures.length > 0) {
  console.error('Deployment preparation failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Deployment output prepared at ${path.relative(repositoryRoot, outputDirectory) || '.'} for ${site}${base} (${rewrittenFiles} files, ${rewrittenReferences} references rewritten).`,
);
