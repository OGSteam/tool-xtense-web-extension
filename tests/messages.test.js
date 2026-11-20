import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';

const scripts = [
  '../extension/parsers/OgameConstants.js',
  '../extension/parsers/messages.js',
  '../extension/parsers/controller.js'
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8'));

function combatMessage(id) {
  return `
    <div class="msg" data-msg-id="${id}">
      <div class="rawMessageData" data-raw-messagetype="25"
        data-raw-timestamp="100" data-raw-date="date" data-raw-hashcode="fixture"
        data-raw-coords="1:2:3" data-raw-fleets='[{"id":1}]'
        data-raw-defenderspaceobject='{"id":2}' data-raw-combatrounds='[]'
        data-raw-result='{"winner":"attacker"}'></div>
      <div class="msgHead"><div class="msgTitle">Rapport de combat</div></div>
    </div>
  `;
}

test('detects existing and newly added combat reports when only combat reports are enabled', async () => {
  const dom = new JSDOM(`
    <div id="messagescomponent">
      <div id="messages">
        <div class="tabsWrapper"><div class="innerTabItem active" data-subtab-id="21"></div></div>
        <div class="messagesHolder">${combatMessage('101')}</div>
      </div>
    </div>
  `, {runScripts: 'outside-only'});
  const {window} = dom;
  const storage = new Map([['handle.msg.rc', 'true']]);
  const data = {};
  const sent = [];
  const timers = [];
  let now = 10000;

  window.url = 'https://example.com/game/index.php?page=ingame&component=messages';
  window.log = {info() {}, debug() {}, error() {}, warn() {}};
  window.XLOG_NORMAL = 3;
  window.setStatus = () => {};
  window.xlang = key => key;
  window.glang = key => key === 'messages' ? {'combat of': 'Rapport de combat'} : {messages: ''};
  window.XtenseParseDate = () => 'fixture-date';
  window.storageGetValue = (key, fallback) => storage.has(key) ? storage.get(key) : fallback;
  window.storageSetValue = (key, value) => storage.set(key, value);
  window.XtenseRequest = {
    set: (key, value) => { data[key] = value; },
    send: () => { sent.push(JSON.parse(JSON.stringify(data))); }
  };
  window.setTimeout = (callback, delay) => { timers.push({callback, delay}); return timers.length; };
  window.Date.now = () => now;
  for (const script of scripts) window.eval(script);
  window.initParsers();

  window.handle_current_page();
  assert.equal(timers.length, 1);
  timers.shift().callback();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 'rc');
  assert.deepEqual(sent[0].gamedata.fleets, [{id: 1}]);
  assert.deepEqual(sent[0].gamedata.defenderSpaceObject, {id: 2});
  assert.deepEqual(sent[0].gamedata.result, {winner: 'attacker'});
  assert.equal(sent[0].gamedata.messageId, '101');

  now += 100;
  window.document.querySelector('.messagesHolder').insertAdjacentHTML('beforeend', combatMessage('102'));
  await Promise.resolve();
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 1900);
  now += 1900;
  timers.shift().callback();
  assert.deepEqual(sent.map(message => message.gamedata.messageId), ['101', '102']);
  window.messageObserver.disconnect();
  window.close();
});

test('still detects reports in the previous message container', () => {
  const dom = new JSDOM(`
    <div id="messagecontainercomponent"><div id="messagewrapper">
      <div class="tabsWrapper"><div class="innerTabItem active" data-subtab-id="21"></div></div>
      <div class="messagesHolder">${combatMessage('101')}</div>
    </div></div>
  `, {runScripts: 'outside-only'});
  const {window} = dom;
  const timers = [];
  let parsed = 0;
  window.log = {info() {}, debug() {}, error() {}};
  window.setTimeout = callback => { timers.push(callback); return timers.length; };
  for (const script of scripts) window.eval(script);
  window.initParsers();
  window.parse_messages = () => { parsed++; };

  assert.equal(window.get_tabid(), 'rc');
  assert.equal(window.Xpath.getOrderedSnapshotNodes(window.document, window.XtenseXpaths.messages.shortmessages).snapshotLength, 1);
  window.get_message_content();
  timers.shift()();
  assert.equal(parsed, 1);
  window.messageObserver.disconnect();
  window.close();
});

test('parses a spy report using the raw counter-espionage value', () => {
  const dom = new JSDOM(`
    <div id="messages">
      <div class="tabsWrapper"><div class="innerTabItem active" data-subtab-id="20"></div></div>
      <div class="messagesHolder">
        <div class="msg" data-msg-id="201">
          <div class="rawMessageData" data-raw-counterespionagechance="37"
            data-raw-timestamp="100" data-raw-playername="Player Alpha"
            data-raw-status="i" data-raw-characterclass="-" data-raw-allianceclass="-"
            data-raw-coordinates="1:2:3" data-raw-targetplanettype="1" data-raw-targetplanetid="101"
            data-raw-metal="1000" data-raw-crystal="500" data-raw-deuterium="200"
            data-raw-loot="50" data-raw-fleet='{"202":3}'></div>
          <div class="msgTitle">Rapport d&#96;espionnage de Planète Alpha [1:2:3]</div>
          <div class="msgFilteredHeaderCell_activity">12 min</div>
        </div>
      </div>
    </div>
  `, {runScripts: 'outside-only'});
  const {window} = dom;
  const storage = new Map([['handle.msg.spy', 'true']]);
  const data = {};
  const sent = [];
  window.chrome = {runtime: {onMessage: {addListener() {}}}};
  window.log = {info() {}, debug() {}, error() {}, warn() {}};
  window.setStatus = () => {};
  window.XLOG_NORMAL = 3;
  window.eval(readFileSync(new URL('../extension/utilities.js', import.meta.url), 'utf8'));
  for (const script of scripts) window.eval(script);
  window.glang = () => ({'espionage of': 'Rapport d`espionnage de'});
  window.xlang = key => key;
  window.storageGetValue = (key, fallback) => storage.has(key) ? storage.get(key) : fallback;
  window.storageSetValue = (key, value) => storage.set(key, value);
  window.XtenseRequest = {
    set: (key, value) => { data[key] = value; },
    send: () => { sent.push(JSON.parse(JSON.stringify(data))); }
  };
  window.initParsers();
  window.parse_messages();
  window.parse_messages();

  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 'messages');
  assert.deepEqual(sent[0].gamedata, {
    type: 'spy', proba: '37', activity: '12', date: '100',
    player: {name: 'Player Alpha', status: 'i', class: {character: null, alliance: null}},
    planet: {name: 'Alpha', coordinates: '1:2:3', type: '1', id: '101'},
    resources: {metal: '1000', crystal: '500', deuterium: '200', loot: '50'},
    buildings: {}, lfBuildings: {}, research: {}, lfResearch: {}, fleet: {'202': 3}, defense: {}
  });

  const second = window.document.querySelector('.msg').cloneNode(true);
  second.setAttribute('data-msg-id', '202');
  second.querySelector('.rawMessageData').removeAttribute('data-raw-counterespionagechance');
  const probability = window.document.createElement('div');
  probability.className = 'msgFilteredHeaderCell_counterEspionageChance';
  probability.textContent = '45%';
  second.append(probability);
  window.document.querySelector('.messagesHolder').append(second);
  window.parse_messages();
  assert.equal(sent.length, 2);
  assert.equal(sent[1].gamedata.proba, '45');
  window.close();
});
