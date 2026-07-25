import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(
  await readFile(new URL('../data/technical-issues.json', import.meta.url), 'utf8'),
);
const sourceUrl = data.knownIssuesSource.url;

const response = await fetch(sourceUrl, {
  headers: {
    'user-agent':
      'Crimson-Desert-Guide known-issues monitor (+https://github.com/Conroy1988/Crimson-Desert-Guide)',
  },
});
if (!response.ok) throw new Error(`Known Issues notice returned HTTP ${response.status}`);

const html = await response.text();
const updatedMatch = html.match(/Last updated:\s*(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+UTC)/i);
if (!updatedMatch) throw new Error('Could not find the official Last updated timestamp');
const lastUpdated = updatedMatch[1].replace(/\s+/g, ' ').trim();

const start = html.indexOf(updatedMatch[0]);
const endCandidate = html.indexOf('View List', start);
const segment = html.slice(start, endCandidate > start ? endCandidate : undefined);
const tokens = segment.match(/<\/?ul\b[^>]*>|<\/?li\b[^>]*>/gi) ?? [];
let depth = 0;
let issueCount = 0;
for (const token of tokens) {
  if (/^<ul\b/i.test(token)) depth += 1;
  else if (/^<\/ul/i.test(token)) depth = Math.max(0, depth - 1);
  else if (/^<li\b/i.test(token) && depth === 1) issueCount += 1;
}
if (issueCount === 0) {
  throw new Error('Could not count top-level issues in the official notice');
}

const fingerprint = createHash('sha256')
  .update(`${lastUpdated}|${issueCount}`)
  .digest('hex');

console.log(
  `Baseline: ${data.knownIssuesSource.lastUpdated} / ${data.knownIssuesSource.issueCount} / ${data.knownIssuesSource.fingerprint}`,
);
console.log(`Official: ${lastUpdated} / ${issueCount} / ${fingerprint}`);

if (fingerprint === data.knownIssuesSource.fingerprint) {
  console.log('Known Issues notice is unchanged.');
  process.exit(0);
}

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (!repository || !token) {
  throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
}

const apiHeaders = {
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'x-github-api-version': '2022-11-28',
  'content-type': 'application/json',
};
const issueTitle = `[Known Issues Watch] Official notice changed: ${lastUpdated}`;
const searchQuery = `repo:${repository} is:issue is:open in:title "${issueTitle}"`;
const search = await fetch(
  `https://api.github.com/search/issues?q=${encodeURIComponent(searchQuery)}`,
  { headers: apiHeaders },
);
if (!search.ok) throw new Error(`Issue search failed: HTTP ${search.status}`);
const searchResult = await search.json();
if (searchResult.total_count > 0) {
  console.log('An open review issue already exists.');
  process.exit(0);
}

const created = await fetch(`https://api.github.com/repos/${repository}/issues`, {
  method: 'POST',
  headers: apiHeaders,
  body: JSON.stringify({
    title: issueTitle,
    labels: ['content-review'],
    body: [
      'The official Crimson Desert Known Issues notice has materially changed.',
      '',
      `- Baseline revision: **${data.knownIssuesSource.lastUpdated}**`,
      `- Detected revision: **${lastUpdated}**`,
      `- Baseline issue count: **${data.knownIssuesSource.issueCount}**`,
      `- Detected issue count: **${issueCount}**`,
      `- Baseline fingerprint: \`${data.knownIssuesSource.fingerprint}\``,
      `- Detected fingerprint: \`${fingerprint}\``,
      `- Detected at: **${new Date().toISOString()}**`,
      `- Official notice: ${sourceUrl}`,
      '',
      '### Required review',
      '',
      '- [ ] Compare additions, removals and revised workarounds.',
      '- [ ] Update `data/technical-issues.json`.',
      '- [ ] Retire resolved records without reusing stable IDs.',
      '- [ ] Re-check overlapping Combat, Settings, Save and Completion guidance.',
      '- [ ] Update the fingerprint, revision timestamp and issue count.',
      '- [ ] Add an Update Log entry.',
    ].join('\n'),
  }),
});
if (!created.ok) throw new Error(`Issue creation failed: HTTP ${created.status}`);
const issue = await created.json();
console.log(`Created issue #${issue.number}: ${issue.html_url}`);
