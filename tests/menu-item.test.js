import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {jQueryFactory} from 'jquery/factory';
import {JSDOM} from 'jsdom';

const scriptUrl = new URL('../extension/ui/menu_item.js', import.meta.url);
const scriptPath = fileURLToPath(scriptUrl);
const script = readFileSync(scriptUrl, 'utf8');

test('connection buttons retain localized labels, placement and handlers', () => {
  const dom = new JSDOM('<div><div id="middle"></div></div>', {runScripts: 'outside-only'});
  const {window} = dom;
  window.$ = jQueryFactory(window);
  window.chrome = {
    runtime: {getURL: path => path},
    i18n: {getMessage: key => key === 'XtenseServer_TestConnection' ? 'Test connection' : key}
  };
  window.storageGetValue = (key, fallback) => key === 'backup.link' ? 'true' : fallback;
  window.numUnivers = '1';
  window.VERSION = '3.4.0';
  window.CSS = {escape: value => value.replaceAll('.', '\\.')};
  window.validateServerUrl = () => ({valid: false});
  const savedSettings = [];
  window.storageSetValue = (key, value) => savedSettings.push([key, value]);
  new Script(script, {filename: scriptPath}).runInContext(dom.getInternalVMContext());
  window.displayOptions();

  for (const [buttonId, passwordId, resultId] of [
    ['btn_test_primary', 'server.pwd', 'server.test.primary.result'],
    ['btn_test_backup', 'server_backup.pwd', 'server.test.backup.result']
  ]) {
    const button = window.document.getElementById(buttonId);
    const password = window.document.getElementById(passwordId);
    assert.equal(button.tagName, 'A');
    assert.equal(button.getAttribute('role'), 'button');
    assert.equal(button.closest('td').cellIndex, 1);
    assert.equal(button.style.position, 'relative');
    assert.match(button.textContent, /Test connection/);
    assert.ok(password.compareDocumentPosition(button) & window.Node.DOCUMENT_POSITION_FOLLOWING);
    button.click();
    assert.match(window.document.getElementById(resultId).textContent, /URL invalide/);
  }
  const serverUrl = window.document.getElementById('server.url.plugin');
  serverUrl.value = 'https://ogspy.example';
  serverUrl.dispatchEvent(new window.Event('input', {bubbles: true}));
  const backupEnabled = window.document.getElementById('backup.link');
  backupEnabled.checked = true;
  backupEnabled.dispatchEvent(new window.Event('change', {bubbles: true}));
  assert.deepEqual(savedSettings, [
    ['server.url.plugin', 'https://ogspy.example'],
    ['backup.link', true]
  ]);
  assert.notEqual(window.document.getElementById('btn_test_backup').closest('tr').style.display, 'none');
  window.close();
});

test('connection label is available in every bundled locale', () => {
  for (const locale of ['en', 'en_US', 'es', 'fr', 'it', 'pt_BR']) {
    const messages = JSON.parse(readFileSync(new URL(`../extension/_locales/${locale}/messages.json`, import.meta.url), 'utf8'));
    assert.ok(messages.XtenseServer_TestConnection.message, locale);
  }
});
