import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {JSDOM} from 'jsdom';

const scriptUrl = new URL('../extension/background-service.js', import.meta.url);
const scriptPath = fileURLToPath(scriptUrl);
const script = readFileSync(scriptUrl, 'utf8');

function setup(stored, permissionGranted = true) {
  const dom = new JSDOM('', {runScripts: 'outside-only'});
  const {window} = dom;
  const replies = [];
  const requests = [];
  let listener;
  window.chrome = {
    runtime: {
      onMessage: {addListener: callback => { listener = callback; }}
    },
    action: {setIcon() {}, setTitle() {}},
    permissions: {
      contains: (_permissions, callback) => callback(permissionGranted),
      getAll: callback => callback({origins: []})
    },
    storage: {local: {get: (_keys, callback) => callback(stored)}},
    tabs: {sendMessage: (_tabId, payload, _options, callback) => {
      replies.push(payload);
      callback();
    }}
  };
  window.fetch = async (url, options) => {
    requests.push({url, options});
    return {status: 200, text: async () => '{"status":1}'};
  };
  new Script(script, {filename: scriptPath}).runInContext(dom.getInternalVMContext());
  return {window, replies, requests, listener};
}

async function send(context, url) {
  context.listener({
    action: 'xhttp',
    messageId: 'test-request',
    url,
    data: '{}',
    dataType: 'text/plain; charset=UTF-8'
  }, {tab: {id: 1}, frameId: 0}, () => {});
  await new Promise(resolve => context.window.setTimeout(resolve, 0));
}

test('allows the primary server from any stored universe profile', async () => {
  const context = setup({
    'xtense.settings.fr.123.server.url.plugin': 'https://ogspy.example/base',
    'xtense.settings.en.456.server.url.plugin': 'https://other.example'
  });
  await send(context, 'https://ogspy.example/base/mod/xtense/xtense.php');
  assert.equal(context.requests.length, 1);
  assert.equal(context.replies.at(-1).status, 200);
  context.window.close();
});

test('blocks a backup server unless backup sending is enabled', async () => {
  const stored = {
    'xtense.settings.fr.123.server.url.plugin': 'https://ogspy.example',
    'xtense.settings.fr.123.backup.link': false,
    'xtense.settings.fr.123.server_backup.url.plugin': 'https://backup.example'
  };
  const disabled = setup(stored);
  await send(disabled, 'https://backup.example/mod/xtense/xtense.php');
  assert.equal(disabled.requests.length, 0);
  assert.equal(disabled.replies.at(-1).status, 403);
  disabled.window.close();

  stored['xtense.settings.fr.123.backup.link'] = true;
  const enabled = setup(stored);
  await send(enabled, 'https://backup.example/mod/xtense/xtense.php');
  assert.equal(enabled.requests.length, 1);
  assert.equal(enabled.replies.at(-1).status, 200);
  enabled.window.close();
});

test('blocks a configured server when browser host permission is missing', async () => {
  const context = setup({
    'xtense.settings.fr.123.server.url.plugin': 'https://ogspy.example'
  }, false);
  await send(context, 'https://ogspy.example/mod/xtense/xtense.php');
  assert.equal(context.requests.length, 0);
  assert.equal(context.replies.at(-1).error, 'Host permission not granted');
  context.window.close();
});
