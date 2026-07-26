import { readFile, stat } from 'node:fs/promises';

const componentUrl = new URL('../src/components/SoundtrackPlayer.astro', import.meta.url);
const footerUrl = new URL('../src/components/GuideFooter.astro', import.meta.url);
const audioUrl = new URL('../public/media/hymn-for-the-unsung-blade.m4a', import.meta.url);

const [component, footer] = await Promise.all([
  readFile(componentUrl, 'utf8'),
  readFile(footerUrl, 'utf8'),
]);

const failures = [];
const componentRequirements = [
  'media/hymn-for-the-unsung-blade.m4a',
  'preload="metadata"',
  'audio.loop = false',
  'audio.volume = 0.62',
  'crimson-desert-guide.soundtrack.played.v1',
  'crimson-desert-guide.soundtrack.autoplay-attempted.v1',
  "audio.addEventListener('ended'",
  "window.addEventListener('pagehide'",
  "document.addEventListener('astro:page-load'",
  "@media (max-width: 42rem)",
  'PearlAbyssMusic · featuring Clara Sorace',
  'https://open.spotify.com/track/3A82SEymCONlwWKxODggiE',
];

for (const requirement of componentRequirements) {
  if (!component.includes(requirement)) failures.push(`Soundtrack player is missing: ${requirement}`);
}

if (/<audio[^>]*\bloop(?:\s|=|>)/i.test(component)) {
  failures.push('Soundtrack audio must not include the loop attribute.');
}

const footerRequirements = [
  "import SoundtrackPlayer from './SoundtrackPlayer.astro'",
  '<SoundtrackPlayer />',
  'Hymn for the Unsung Blade',
  'PearlAbyssMusic',
  'Clara Sorace',
  '© and ℗ 2026 PEARL ABYSS, under license to VOSTOK',
  'https://crimsondesert.pearlabyss.com/en-US/Policy?_policyNo=130',
];

for (const requirement of footerRequirements) {
  if (!footer.includes(requirement)) failures.push(`Soundtrack attribution is missing: ${requirement}`);
}

try {
  const audioStats = await stat(audioUrl);
  const audio = await readFile(audioUrl);
  if (!audioStats.isFile()) failures.push('Soundtrack media path is not a file.');
  if (audioStats.size < 500_000) failures.push(`Soundtrack file is unexpectedly small: ${audioStats.size} bytes.`);
  if (audioStats.size > 15_000_000) failures.push(`Soundtrack file exceeds the 15 MB delivery budget: ${audioStats.size} bytes.`);
  if (audio.length < 12 || audio.subarray(4, 8).toString('ascii') !== 'ftyp') {
    failures.push('Soundtrack file is not recognisable as an MP4/M4A media container.');
  }
} catch (error) {
  failures.push(`Soundtrack media is missing at public/media/hymn-for-the-unsung-blade.m4a: ${error.message}`);
}

if (failures.length > 0) {
  console.error('Soundtrack player audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Soundtrack player audit passed player behaviour, mobile placement, official attribution and media integrity checks.');
