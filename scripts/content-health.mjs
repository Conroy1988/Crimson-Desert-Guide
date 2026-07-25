import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const staleAfterDays = 45;
const now = new Date();
const warnings = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(item)));
    else if (/\.(md|mdx)$/i.test(entry.name)) result.push(item);
  }
  return result;
}

for (const file of await walk(root)) {
  const source = await readFile(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const dateLine = match?.[1].match(/^lastVerified:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
  if (!dateLine) continue;

  const verified = new Date(`${dateLine[1]}T00:00:00Z`);
  const age = Math.floor((now - verified) / 86_400_000);
  if (age > staleAfterDays) {
    warnings.push(`${path.relative(root, file)} is ${age} days old`);
  }
}

if (warnings.length) {
  for (const warning of warnings) {
    console.log(`::warning title=Content verification overdue::${warning}`);
  }
} else {
  console.log('No pages are beyond the verification threshold.');
}
