import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';

const scripts = [
  '../extension/utilities.js',
  '../extension/parsers/OgameConstants.js',
  '../extension/parsers/pages.js'
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8'));

function setup(loading = false) {
  const dom = new JSDOM(`
    <div id="galaxyLoading" style="display: ${loading ? 'block' : 'none'}"></div>
    <input id="galaxy_input" value="1"><input id="system_input" value="42">
    <div class="galaxyRow">
      <div class="cellPosition">1</div>
      <div class="cellPlanet"><a><div class="microplanet" data-planet-id="101"><div class="activity">23</div></div></a></div>
      <div class="cellPlanetName"><span>Alpha</span></div>
      <div class="cellMoon"><a><div class="micromoon" data-moon-id="201"></div></a></div>
      <div class="cellPlayerName"><span rel="player301">Player One</span></div>
      <div class="cellAlliance"><span rel="alliance401">TAG</span></div>
      <ul><li class="debris-content">1.000</li><li class="debris-content">200</li><li class="debris-content">30</li></ul>
    </div>
    <div class="galaxyRow">
      <div class="cellPosition">2</div>
      <div class="cellPlanetName"><a>Beta</a></div>
      <div class="cellPlayerName"><span rel="player302">Player Two</span></div>
    </div>
    <div class="galaxyRow">
      <div class="cellPosition">3</div>
      <ul><li class="debris-content">400</li><li class="debris-content">50</li></ul>
    </div>
  `, {runScripts: 'outside-only'});
  const {window} = dom;
  const data = {};
  const sent = [];
  let lastAction = '';

  window.log = {info() {}, debug() {}};
  window.chrome = {runtime: {onMessage: {addListener() {}}}};
  window.XtenseDatabase = {
    debris: {701: 'metal', 702: 'cristal', 703: 'deuterium'},
    resources: {601: 'metal', 602: 'cristal', 603: 'deuterium'}
  };
  window.XtenseMetas = {getPlayerId: () => 999};
  window.XtenseRequest = {
    set: (key, value) => { data[key] = value; },
    send: () => { sent.push(JSON.parse(JSON.stringify(data))); return Promise.resolve(); }
  };
  window.setStatus = () => {};
  window.XLOG_NORMAL = 3;
  for (const script of scripts) window.eval(script);
  window.xlang = key => key;
  window.storageGetValue = () => lastAction;
  window.storageSetValue = (key, value) => { lastAction = value; };
  window.initParsers();
  return {window, sent};
}

test('parses occupied galaxy positions and skips a repeated system', async () => {
  const {window, sent} = setup();
  window.parse_galaxy_system_inserted();
  await Promise.resolve();
  window.parse_galaxy_system_inserted();

  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 'system');
  assert.equal(sent[0].gamedata.galaxy, '1');
  assert.equal(sent[0].gamedata.system, '42');
  assert.deepEqual(sent[0].gamedata.rows[1], {
    player_id: 301, planet_name: 'Alpha', planet_id: 101, moon_id: 201,
    moon: 1, player_name: 'Player One', status: '', ally_id: 401, ally_tag: 'TAG',
    debris: {metal: 1000, cristal: 200, deuterium: 30}, activity: '23', activityMoon: -1
  });
  assert.equal(sent[0].gamedata.rows[2].planet_name, 'Beta');
  assert.equal(sent[0].gamedata.rows[2].player_id, 302);
  assert.deepEqual(sent[0].gamedata.rows[2].debris, {metal: 0, cristal: 0});
  window.close();
});

test('parses debris independently from planets and covers the complete system', async () => {
  const {window, sent} = setup();
  window.parse_galaxy_system_inserted();
  await Promise.resolve();

  assert.deepEqual(sent[0].gamedata.rows[3].debris, {metal: 400, cristal: 50});
  assert.deepEqual(sent[0].gamedata.rows[15].debris, {metal: 0, cristal: 0});
  assert.deepEqual(sent[0].gamedata.rows[16].debris, {metal: 0, cristal: 0});
  window.close();
});

test('reports every position when the system has no debris', async () => {
  const {window, sent} = setup();
  for (const cell of window.document.querySelectorAll('.debris-content')) cell.remove();

  window.parse_galaxy_system_inserted();
  await Promise.resolve();

  for (let position = 1; position <= 16; position++) {
    assert.deepEqual(sent[0].gamedata.rows[position].debris, {metal: 0, cristal: 0});
  }
  window.close();
});

test('does not parse while the galaxy is loading', () => {
  const {window, sent} = setup(true);
  window.parse_galaxy_system_inserted();
  assert.equal(sent.length, 0);
  window.close();
});

test('parses deuterium debris in deep space', async () => {
  const {window, sent} = setup();
  window.document.body.insertAdjacentHTML('beforeend', `
    <div id="galaxyRow16"><div><div>0</div><div>0</div><div>30</div></div></div>
  `);

  window.parse_galaxy_system_inserted();
  await Promise.resolve();

  assert.deepEqual(sent[0].gamedata.rows[16].debris, {metal: 0, cristal: 0, deuterium: 30});
  window.close();
});

test('omits unavailable deuterium from debris observations', async () => {
  const {window, sent} = setup();
  window.document.body.insertAdjacentHTML('beforeend', `
    <div id="galaxyRow16"><div><div>10</div><div>20</div></div></div>
  `);

  window.parse_galaxy_system_inserted();
  await Promise.resolve();

  assert.deepEqual(sent[0].gamedata.rows[16].debris, {metal: 10, cristal: 20});
  window.close();
});
