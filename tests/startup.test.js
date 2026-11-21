import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {JSDOM} from 'jsdom';

const scriptUrl = new URL('../extension/xtense.user.js', import.meta.url);
const scriptPath = fileURLToPath(scriptUrl);
const script = readFileSync(scriptUrl, 'utf8');

function setup(initializeSettingsStorage) {
  const dom = new JSDOM('', {
    runScripts: 'outside-only',
    url: 'https://s123-fr.ogame.gameforge.com/game/index.php?page=ingame&component=overview'
  });
  const {window} = dom;
  const calls = [];
  const settings = new Map([
    ['server.url.plugin', 'https://ogspy.example/mod/xtense/xtense.php'],
    ['debug.messages', false]
  ]);
  window.chrome = {runtime: {getManifest: () => ({version: '3.4.1'})}};
  window.log = {
    info: message => calls.push(['log.info', message]),
    error: message => calls.push(['log.error', message])
  };
  window.initializeSettingsStorage = (language, universe) => {
    calls.push(['initializeSettingsStorage', language, universe]);
    return initializeSettingsStorage(language, universe);
  };
  window.storageGetValue = (key, fallback) => settings.has(key) ? settings.get(key) : fallback;
  window.storageSetValue = (key, value) => { settings.set(key, value); };
  for (const name of [
    'setlogLevel', 'initOGSpyCommunication', 'initParsers', 'initLocales',
    'enableMessageDebug', 'displayXtense', 'handle_current_page'
  ]) {
    window[name] = () => calls.push([name]);
  }
  window.setStatus = (...args) => calls.push(['setStatus', ...args]);
  window.xlang = key => key;
  new Script(script, {filename: scriptPath}).runInContext(dom.getInternalVMContext());
  return {dom, window, calls, settings};
}

test('starts Xtense after extension settings have loaded', async () => {
  const context = setup(() => Promise.resolve());
  await new Promise(resolve => context.window.setTimeout(resolve, 0));

  assert.equal(context.settings.get('server.url.plugin'), 'https://ogspy.example');
  assert.ok(context.calls.some(([name]) => name === 'initOGSpyCommunication'));
  assert.ok(context.calls.some(([name]) => name === 'handle_current_page'));
  context.dom.window.close();
});

test('does not start parsers when extension settings cannot be loaded', async () => {
  const context = setup(() => Promise.reject(new Error('storage unavailable')));
  await new Promise(resolve => context.window.setTimeout(resolve, 0));

  assert.ok(context.calls.some(([name, message]) =>
    name === 'log.error' && message.includes('storage unavailable')));
  assert.ok(!context.calls.some(([name]) => name === 'initParsers'));
  context.dom.window.close();
});
