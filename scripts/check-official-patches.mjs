import { readFile } from 'node:fs/promises';

const announcementsUrl =
  'https://crimsondesert.pearlabyss.com/en-US/News/Notice?_categoryNo=2';
const baseline = JSON.parse(
  await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'),
);

function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

const response = await fetch(announcementsUrl, {
  headers: {
    'user-agent':
      'Crimson-Desert-Guide patch monitor (+https://github.com/Conroy1988/Crimson-Desert-Guide)',
  },
});

if (!response.ok) {
  throw new Error(`Official announcements returned HTTP ${response.status}`);
}

const html = await response.text();
const versions = [
  ...html.matchAll(/Patch Notes Version\s+(\d+\.\d+\.\d+)/gi),
].map((match) => match[1]);

if (!versions.length) {
  throw new Error('No patch versions were found on the official update page');
}

const latest = [...new Set(versions)].sort(compareVersions).at(-1);
console.log(`Baseline: ${baseline.version}; official listing: ${latest}`);

if (compareVersions(latest, baseline.version) <= 0) {
  console.log('No newer patch detected.');
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

const issueTitle = `[Patch Watch] Official version ${latest} detected`;
const search = await fetch(
  `https://api.github.com/search/issues?q=${encodeURIComponent(
    `repo:${repository} is:issue is:open in:title "${issueTitle}"`,
  )}`,
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
    body: [
      'A newer version appears on the official Crimson Desert update listing.',
      '',
      `- Repository baseline: **${baseline.version}**`,
      `- Detected version: **${latest}**`,
      `- Detected at: **${new Date().toISOString()}**`,
      `- Official listing: ${announcementsUrl}`,
      '',
      '### Required review',
      '',
      '- [ ] Confirm the official patch notice and platform rollout.',
      '- [ ] Update `data/current-patch.json`.',
      '- [ ] Identify affected guide pages.',
      '- [ ] Move affected pages to `review-required`.',
      '- [ ] Retest recommendations before returning them to `current`.',
      '- [ ] Add an Update Log entry.',
    ].join('\n'),
  }),
});

if (!created.ok) {
  throw new Error(`Issue creation failed: HTTP ${created.status}`);
}

const issue = await created.json();
console.log(`Created issue #${issue.number}: ${issue.html_url}`);
