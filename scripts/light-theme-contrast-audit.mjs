import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/styles/light-mode.css', import.meta.url), 'utf8');
const failures = [];

const pairs = [
  ['primary text', '#2c211a', '#fffdf9', 7],
  ['body text', '#46372d', '#fffdf9', 7],
  ['muted text', '#5f4e40', '#fffdf9', 4.5],
  ['small labels', '#756353', '#fffdf9', 4.5],
  ['links', '#9c321f', '#fffdf9', 4.5],
  ['accent text', '#4b190f', '#f4ddcc', 4.5],
  ['primary button', '#fff7ea', '#bd4325', 4.5],
  ['official evidence', '#7a4b00', '#fffdf9', 4.5],
  ['success state', '#23653b', '#fffdf9', 4.5],
  ['community evidence', '#285b7a', '#fffdf9', 4.5],
  ['provisional evidence', '#8a4d23', '#fffdf9', 4.5],
  ['warning state', '#7a5200', '#fffdf9', 4.5],
  ['error state', '#992d22', '#fffdf9', 4.5],
];

function rgb(hex) {
  const clean = hex.slice(1);
  return [0, 2, 4].map((start) => Number.parseInt(clean.slice(start, start + 2), 16) / 255);
}

function linear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [red, green, blue] = rgb(hex).map(linear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

for (const [label, foreground, background, minimum] of pairs) {
  const ratio = contrast(foreground, background);
  if (ratio < minimum) failures.push(`${label}: ${ratio.toFixed(2)}:1 is below ${minimum}:1`);
}

const required = [
  ".cd-home .cd-hero",
  '.guide-title',
  '.spoiler-reveal',
  '.completion-tracker',
  '.tech-centre__hero',
  '.evidence--official',
  ".completion-status[data-tone='error']",
];

for (const selector of required) {
  if (!css.includes(selector)) failures.push(`Missing light-theme override for ${selector}`);
}

if (failures.length) {
  console.error('Light-theme contrast audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Light-theme contrast audit passed ${pairs.length} colour pairs and ${required.length} component scopes.`);
}
