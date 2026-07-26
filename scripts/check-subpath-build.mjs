import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = {
  ...process.env,
  CD_GUIDE_SITE: 'https://tkb-gaming.scot',
  CD_GUIDE_BASE_PATH: '/games/crimson-desert/guides/',
  CD_GUIDE_DIST_ROOT: 'dist-subpath',
};

async function run(script) {
  await new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ['run', script], {
      cwd: repositoryRoot,
      env,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          signal
            ? `npm run ${script} terminated by ${signal}`
            : `npm run ${script} exited with code ${code}`,
        ),
      );
    });
  });
}

await rm(path.join(repositoryRoot, 'dist-subpath'), {
  recursive: true,
  force: true,
});

await run('build');
await run('smoke:deployment');

console.log(
  'Subpath deployment validation passed for https://tkb-gaming.scot/games/crimson-desert/guides/.',
);
