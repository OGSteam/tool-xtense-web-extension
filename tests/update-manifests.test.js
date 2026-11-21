import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, mkdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

test('synchronizes all manifest versions from package.json', () => {
  const root = mkdtempSync(join(tmpdir(), 'xtense-manifests-'));
  const extension = join(root, 'extension');
  const files = ['manifest.json', 'manifest.chrome.json', 'manifest.firefox.json'];
  mkdirSync(extension);
  try {
    writeFileSync(join(root, 'package.json'), JSON.stringify({version: '2.3.4'}));
    for (const file of files) {
      writeFileSync(join(extension, file), JSON.stringify({manifest_version: 3, version: '1.0.0', name: file}));
    }

    execFileSync(process.execPath, [fileURLToPath(new URL('../project/update-manifests.mjs', import.meta.url))], {cwd: root});

    for (const file of files) {
      assert.deepEqual(JSON.parse(readFileSync(join(extension, file), 'utf8')), {
        manifest_version: 3, version: '2.3.4', name: file
      });
    }
  } finally {
    for (const file of files) {
      if (existsSync(join(extension, file))) unlinkSync(join(extension, file));
    }
    if (existsSync(join(root, 'package.json'))) unlinkSync(join(root, 'package.json'));
    rmdirSync(extension);
    rmdirSync(root);
  }
});
