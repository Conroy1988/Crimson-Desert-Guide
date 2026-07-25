import { mkdir, readFile, writeFile } from 'node:fs/promises';

const config = JSON.parse(
  await readFile(new URL('../data/steam-sections.json', import.meta.url), 'utf8'),
);

const canonicalSite = 'https://crimson-desert-guide.dannyconroy.workers.dev';

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function convertTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const headerLine = lines[index];
    const separatorLine = lines[index + 1];

    if (
      headerLine?.trim().startsWith('|') &&
      headerLine.trim().endsWith('|') &&
      separatorLine &&
      isTableSeparator(separatorLine)
    ) {
      const headers = parseTableRow(headerLine);
      const rows = [];
      index += 2;

      while (
        index < lines.length &&
        lines[index].trim().startsWith('|') &&
        lines[index].trim().endsWith('|')
      ) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      index -= 1;
      output.push('[table]');
      output.push(`[tr]${headers.map((cell) => `[th]${cell}[/th]`).join('')}[/tr]`);
      for (const row of rows) {
        output.push(`[tr]${row.map((cell) => `[td]${cell}[/td]`).join('')}[/tr]`);
      }
      output.push('[/table]');
      continue;
    }

    output.push(headerLine);
  }

  return output.join('\n');
}

function protectCodeBlocks(markdown) {
  const blocks = [];
  const text = markdown.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code) => {
    const token = `@@STEAM_CODE_BLOCK_${blocks.length}@@`;
    blocks.push(`[code]${code.replace(/\s+$/, '')}[/code]`);
    return token;
  });

  return { text, blocks };
}

function restoreCodeBlocks(text, blocks) {
  return blocks.reduce(
    (result, block, index) => result.replace(`@@STEAM_CODE_BLOCK_${index}@@`, block),
    text,
  );
}

function convertAdmonitions(markdown) {
  return markdown.replace(
    /^:::\w+(?:\[([^\]]+)\])?\r?\n([\s\S]*?)\r?\n:::/gm,
    (_, title, body) => `${title ? `[b]${title}[/b]\n` : ''}${body.trim()}`,
  );
}

function convertBlockquotes(markdown) {
  return markdown.replace(/(?:^> ?.*(?:\r?\n|$))+/gm, (block) => {
    const body = block
      .split(/\r?\n/)
      .map((line) => line.replace(/^> ?/, ''))
      .join('\n')
      .trim();
    return `[quote]${body}[/quote]\n`;
  });
}

function convertLists(markdown) {
  const withChecks = markdown
    .replace(/^- \[ \] (.+)$/gm, '[*]☐ $1')
    .replace(/^- \[[xX]\] (.+)$/gm, '[*]☑ $1')
    .replace(/^- (.+)$/gm, '[*]$1');

  return withChecks.replace(
    /(?:^\[\*\].+(?:\r?\n|$))+/gm,
    (block) => `[list]\n${block.trimEnd()}\n[/list]\n`,
  );
}

function convertInline(markdown) {
  return markdown
    .replace(/^###\s+(.+)$/gm, '[h3]$1[/h3]')
    .replace(/^##\s+(.+)$/gm, '[h2]$1[/h2]')
    .replace(/^#\s+(.+)$/gm, '[h1]$1[/h1]')
    .replace(/\*\*(.+?)\*\*/g, '[b]$1[/b]')
    .replace(/\*(.+?)\*/g, '[i]$1[/i]')
    .replace(/`([^`\n]+)`/g, '[code]$1[/code]')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '[url=$2]$1[/url]')
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, `[url=${canonicalSite}$2]$1[/url]`)
    .replace(/^---+$/gm, '[hr][/hr]');
}

function toSteamBbcode(markdown) {
  const stripped = stripFrontmatter(markdown);
  const { text, blocks } = protectCodeBlocks(stripped);
  const converted = convertInline(
    convertLists(convertBlockquotes(convertAdmonitions(convertTables(text)))),
  ).trim();

  return restoreCodeBlocks(converted, blocks);
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
