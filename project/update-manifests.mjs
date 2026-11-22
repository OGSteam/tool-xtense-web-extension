import {readFileSync, writeFileSync} from 'node:fs';

const {version} = JSON.parse(readFileSync('package.json', 'utf8'));
if (typeof version !== 'string' || version.length === 0) {
  throw new Error('package.json must contain a version');
}

for (const path of ['extension/manifest.json', 'extension/manifest.chrome.json', 'extension/manifest.firefox.json']) {
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  manifest.version = version;
  writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
}
