import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {JSDOM} from 'jsdom';

const scriptUrl = new URL('../extension/ui/popup.js', import.meta.url);
const scriptPath = fileURLToPath(scriptUrl);
const script = readFileSync(scriptUrl, 'utf8');

function setup(stored, granted = false) {
  const dom = new JSDOM('<p id="permission_status"></p><button id="btn_grant_permission"></button>', {runScripts: 'outside-only'});
  const {window} = dom;
  const checks = [];
  const requests = [];
  let onChanged;
  window.chrome = {
    runtime: {},
    storage: {
      local: {get: (_keys, callback) => callback(stored)},
      onChanged: {addListener: listener => { onChanged = listener; }}
    },
    permissions: {
      contains: (permissions, callback) => { checks.push([...permissions.origins]); callback(granted); },
      request: (permissions, callback) => { requests.push([...permissions.origins]); callback(granted); }
    }
  };
  new Script(script, {filename: scriptPath}).runInContext(dom.getInternalVMContext());
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return {
    window, checks, requests,
    status: window.document.getElementById('permission_status'),
    button: window.document.getElementById('btn_grant_permission'),
    change: changes => onChanged(changes, 'local')
  };
}

test('requests only the configured primary and backup hosts', () => {
  const popup = setup({
    'xtense.settings.fr.123.server.url.plugin': 'https://ogspy.example:8443/ogspy',
    'xtense.settings.fr.123.backup.link': true,
    'xtense.settings.fr.123.server_backup.url.plugin': 'http://backup.example:8080/ogspy'
  });
  assert.deepEqual(popup.checks[0], ['https://ogspy.example/*', 'http://backup.example/*']);
  popup.button.click();
  assert.deepEqual(popup.requests[0], popup.checks[0]);
  assert.match(popup.status.textContent, /Permission refusée/);
  popup.window.close();
});

test('deduplicates hosts, recognizes existing grants and refreshes changed configuration', () => {
  const stored = {
    'xtense.settings.fr.123.server.url.plugin': 'ogspy.example/path',
    'xtense.settings.fr.123.backup.link': true,
    'xtense.settings.fr.123.server_backup.url.plugin': 'https://ogspy.example/backup',
    'xtense.settings.en.456.server.url.plugin': 'https://ogspy.example/other'
  };
  const popup = setup(stored, true);
  assert.deepEqual(popup.checks[0], ['https://ogspy.example/*']);
  assert.match(popup.status.textContent, /autorisé/);
  assert.equal(popup.button.style.display, 'none');

  stored['xtense.settings.fr.123.server_backup.url.plugin'] = 'http://localhost:8080';
  popup.change({'xtense.settings.fr.123.server_backup.url.plugin': {}});
  assert.deepEqual(popup.checks[1], ['https://ogspy.example/*', 'http://localhost/*']);
  popup.window.close();
});

test('does not request wildcard permissions for missing or invalid configuration', () => {
  for (const stored of [
    {},
    {'xtense.settings.fr.123.server.url.plugin': 'https://VOTRESITE/VOTREOGSPY'},
    {'xtense.settings.fr.123.server.url.plugin': 'https://*/*'},
    {'xtense.settings.fr.123.server.url.plugin': 'ftp://example.com'},
    {'xtense.settings.fr.123.server.url.plugin': 'https://user:password@example.com'}
  ]) {
    const popup = setup(stored);
    popup.button.click();
    assert.equal(popup.requests.length, 0);
    assert.equal(popup.checks.length, 0);
    assert.equal(popup.button.style.display, 'none');
    popup.window.close();
  }
});

test('ignores a configured backup server while backup sending is disabled', () => {
  const popup = setup({
    'xtense.settings.fr.123.server.url.plugin': 'https://ogspy.example',
    'xtense.settings.fr.123.backup.link': false,
    'xtense.settings.fr.123.server_backup.url.plugin': 'https://backup.example'
  });
  assert.deepEqual(popup.checks[0], ['https://ogspy.example/*']);
  popup.window.close();
});

test('permission controls are included in every packaged browser popup', () => {
  for (const browser of ['chrome', 'firefox', 'edge']) {
    const html = readFileSync(new URL(`../extension/ui/${browser}/xtense.html`, import.meta.url), 'utf8');
    assert.match(html, /id="permission_status"/);
    assert.match(html, /id="btn_grant_permission"/);
    assert.match(html, /<script src="ui\/popup\.js"><\/script>/);
  }
});
