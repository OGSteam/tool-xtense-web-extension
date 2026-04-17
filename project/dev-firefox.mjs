/**
 * Wrapper for `web-ext run` that resolves the real filesystem path of the
 * project root before building the Firefox profile path.
 *
 * This is required because the project directory may be a junction/symlink,
 * and some Node.js fs operations (used internally by web-ext / firefox-profile)
 * fail when the path goes through a directory junction on Windows.
 * Using `realpathSync` gives the canonical path where writes succeed.
 */
import { realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = realpathSync(resolve(__dirname, '..'));
const profileDir = join(projectRoot, 'xtense-profile');
const extensionDir = join(projectRoot, 'extension');

const child = spawn(
  'npx',
  [
    'web-ext', 'run',
    '--start-url', 'www.ogame.fr',
    '--keep-profile-changes',
    `--firefox-profile=${profileDir}`,
    '--profile-create-if-missing',
  ],
  { cwd: extensionDir, stdio: 'inherit', shell: true }
);

child.on('exit', code => process.exit(code ?? 0));
