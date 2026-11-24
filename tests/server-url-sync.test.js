import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {JSDOM} from 'jsdom';

const scriptUrl = new URL('../extension/utilities.js', import.meta.url);
const scriptPath = fileURLToPath(scriptUrl);
const script = readFileSync(scriptUrl, 'utf8');

function runScript(dom) {
  new Script(script, {filename: scriptPath}).runInContext(dom.getInternalVMContext());
}

function initialize(window, language, universe) {
  return new Promise((resolve, reject) => {
    window.initializeSettingsStorage(language, universe, resolve, reject);
  });
}

test('loads universe settings from extension storage and deletes legacy settings', async () => {
  const dom = new JSDOM('', {runScripts: 'outside-only', url: 'https://s123-fr.ogame.gameforge.com/game/'});
  const {window} = dom;
  const writes = [];
  const removals = [];
  window.localStorage.setItem('fr123.server.url.plugin', 'https://legacy.example');
  window.localStorage.setItem('fr123.server.pwd', 'legacy-secret');
  window.localStorage.setItem('en1.server.pwd', 'other-universe');
  window.chrome = {
    runtime: {onMessage: {addListener() {}}},
    storage: {local: {
      get: (_keys, callback) => callback({
        'xtense.settings.fr.123.server.url.plugin': 'https://ogspy.example/path',
        'xtense.settings.fr.123.backup.link': false,
        'xtense.settings.en.1.server.pwd': 'stored-other-secret'
      }),
      set: (value, callback) => { writes.push({...value}); callback(); },
      remove: (key, callback) => { removals.push(Array.isArray(key) ? [...key] : key); callback(); }
    }}
  };
  runScript(dom);
  await initialize(window, 'fr', '123');

  assert.equal(window.storageGetValue('server.url.plugin', ''), 'https://ogspy.example/path');
  assert.equal(window.storageGetValue('backup.link', true), false);
  assert.equal(window.localStorage.getItem('fr123.server.url.plugin'), null);
  assert.equal(window.localStorage.getItem('fr123.server.pwd'), null);
  assert.equal(window.localStorage.getItem('en1.server.pwd'), 'other-universe');

  window.storageSetValue('server.pwd', 'new-secret');
  window.storageSetValue('server.pwd', 'new-secret');
  assert.deepEqual(writes, [{ 'xtense.settings.fr.123.server.pwd': 'new-secret' }]);
  window.storageDeleteValue('server.pwd');
  assert.deepEqual(removals, [
    ['serverUrl', 'serverBackupUrl'],
    'xtense.settings.fr.123.server.pwd'
  ]);
  window.close();
});

test('does not delete legacy settings when extension storage cannot be loaded', async () => {
  const dom = new JSDOM('', {runScripts: 'outside-only', url: 'https://s123-fr.ogame.gameforge.com/game/'});
  const {window} = dom;
  window.localStorage.setItem('fr123.server.pwd', 'keep-on-failure');
  window.chrome = {
    runtime: {onMessage: {addListener() {}}, lastError: {message: 'storage failure'}},
    storage: {local: {get: (_keys, callback) => callback({})}}
  };
  runScript(dom);
  await assert.rejects(initialize(window, 'fr', '123'), /storage failure/);
  assert.equal(window.localStorage.getItem('fr123.server.pwd'), 'keep-on-failure');
  window.close();
});

test('rolls back failed writes so the setting can be retried', async () => {
  const dom = new JSDOM('', {runScripts: 'outside-only', url: 'https://s123-fr.ogame.gameforge.com/game/'});
  const {window} = dom;
  let attempts = 0;
  window.log = {error() {}};
  window.chrome = {
    runtime: {onMessage: {addListener() {}}},
    storage: {local: {
      get: (_keys, callback) => callback({}),
      remove: (_keys, callback) => callback(),
      set: (_value, callback) => { attempts++; callback(); }
    }}
  };
  runScript(dom);
  await initialize(window, 'fr', '123');

  window.chrome.runtime.lastError = {message: 'write failure'};
  window.storageSetValue('server.pwd', 'secret');
  assert.equal(window.storageGetValue('server.pwd', 'missing'), 'missing');

  window.chrome.runtime.lastError = undefined;
  window.storageSetValue('server.pwd', 'secret');
  assert.equal(attempts, 2);
  assert.equal(window.storageGetValue('server.pwd', 'missing'), 'secret');
  window.close();
});

test('accepts HTTPS and loopback HTTP but rejects remote plaintext servers', () => {
  const dom = new JSDOM('', {runScripts: 'outside-only'});
  const {window} = dom;
  window.chrome = {runtime: {onMessage: {addListener() {}}}};
  runScript(dom);

  assert.equal(window.validateServerUrl('https://ogspy.example/base').valid, true);
  assert.equal(window.validateServerUrl('http://localhost:8080/ogspy').valid, true);
  assert.equal(window.validateServerUrl('http://127.0.0.1:8080/ogspy').valid, true);
  assert.equal(window.validateServerUrl('http://ogspy.example/base').error, 'server_url_protocol');
  window.close();
});
