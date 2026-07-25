import { mkdir, readFile, writeFile } from 'node:fs/promises';

const config = JSON.parse(
  await readFile(new URL('../data/steam-sections.json', import.meta.url), 'utf8'),
);

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function toSteamBbcode(markdown) {
  return stripFrontmatter(markdown)
    .replace(/:::.*?\n([\s\S]*?)\n:::/g, '$1')
    .replace(/^###\s+(.+)$/gm, '[h3]$1[/h3]')
    .replace(/^##\s+(.+)$/gm, '[h2]$1[/h2]')
    .replace(/^#\s+(.+)$/gm, '[h1]$1[/h1]')
    .replace(/\*\*(.+?)\*\*/g, '[b]$1[/b]')
    .replace(/\*(.+?)\*/g, '[i]$1[/i]')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '[url=$2]$1[/url]')
    .replace(/^- (.+)$/gm, '[*]$1')
    .replace(/(?:^\[\*\].+(?:\r?\n|$))+/gm, (block) => `[list]\n${block}[/list]\n`)
    .trim();
}

const output = [`[h1]${config.title}[/h1]`, ''];

for (const section of config.sections) {
  const markdown = await readFile(new URL(`../${section.source}`, import.meta.url), 'utf8');
  output.push(`[h1]${section.heading}[/h1]`);
  output.push(toSteamBbcode(markdown));
  output.push('');
}

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../artifacts/steam-guide.bbcode', import.meta.url),
  `${output.join('\n').trim()}\n`,
);

console.log('Generated artifacts/steam-guide.bbcode');
