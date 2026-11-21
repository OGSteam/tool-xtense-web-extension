import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';

const scripts = [
  '../extension/utilities.js',
  '../extension/parsers/OgameConstants.js',
  '../extension/parsers/pages.js'
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8'));

function setup(rows, category = 'alliance', type = 'points') {
  const dom = new JSDOM(`
    <div id="categoryButtons"><a id="${category}" class="active"></a></div>
    <div id="typeButtons"><a id="${type}" class="active"></a></div>
    <table id="ranks"><tbody>${rows}</tbody></table>
  `, {runScripts: 'outside-only'});
  const {window} = dom;
  const data = {};
  const sent = [];
  let lastAction = '';

  window.log = {info() {}, debug() {}};
  window.chrome = {runtime: {onMessage: {addListener() {}}}};
  window.XtenseMetas = {getAllyId: () => 789};
  window.XtenseRequest = {
    set: (key, value) => { data[key] = value; },
    send: () => { sent.push(JSON.parse(JSON.stringify(data))); }
  };
  for (const script of scripts) window.eval(script);
  window.storageGetValue = () => lastAction;
  window.storageSetValue = (key, value) => { lastAction = value; };
  window.initParsers();
  return {window, sent};
}

test('parses alliance ranking rows and avoids duplicate sends', () => {
  const {window, sent} = setup(`
    <tr>
      <td class="position"><div class="highscorePositionIcon position1"></div></td>
      <td class="name"><div class="ally-name"><span>Alliance Alpha</span></div><div class="ally-tag"><a href="?allianceId=123">[AAA]</a></div></td>
      <td class="member_count">12</td>
      <td class="score">1.200<div class="small">100</div></td>
    </tr>
    <tr>
      <td class="position">2</td>
      <td class="name"><div class="ally-name"><span>Alliance Beta</span></div><div class="ally-tag"><a href="?allianceId=456">[BBB]</a></div></td>
      <td class="member_count">5</td>
      <td class="score">900<div class="small">180</div></td>
    </tr>
  `);
  window.parse_ranking_inserted();
  window.parse_ranking_inserted();

  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, 'ranking');
  assert.equal(sent[0].gamedata.type1, 'ally');
  assert.equal(sent[0].gamedata.type2, 'points');
  assert.equal(sent[0].gamedata.offset, 1);
  assert.deepEqual(sent[0].gamedata.n, [
    {rank: 1, ally_id: '123', ally_tag: 'AAA', ally: 'Alliance Alpha', members: 12, points: 1200, mean: 100},
    {rank: 2, ally_id: '456', ally_tag: 'BBB', ally: 'Alliance Beta', members: 5, points: 900, mean: 180}
  ]);
  window.close();
});

test('does not send an empty ranking', () => {
  const {window, sent} = setup('');
  window.parse_ranking_inserted();
  assert.equal(sent.length, 0);
  window.close();
});

test('parses military ship counts from current and legacy tooltip attributes', () => {
  const {window, sent} = setup(`
    <tr>
      <td class="position"><div class="highscorePositionIcon position1"></div></td>
      <td class="name"><a href="?galaxy=1&amp;system=2"><span>Player Alpha</span></a></td>
      <td class="sendmsg"><div><div id="player123"></div></div></td>
      <td class="score tooltip" data-tooltip-title="Vaisseaux: 12.345">1.200</td>
    </tr>
    <tr>
      <td class="position">2</td>
      <td class="name"><a href="?galaxy=2&amp;system=3"><span>Player Beta</span></a></td>
      <td class="sendmsg"><div><div id="player456"></div></div></td>
      <td class="score" title="Ships: 678">900</td>
    </tr>
  `, 'player', 'fleet');
  window.parse_ranking_inserted();

  assert.equal(sent.length, 1);
  assert.equal(sent[0].gamedata.type1, 'player');
  assert.equal(sent[0].gamedata.type2, 'fleet');
  assert.deepEqual(sent[0].gamedata.n.map(row => ({
    rank: row.rank, name: row.player_name, points: row.points, ships: row.nb_spacecraft
  })), [
    {rank: 1, name: 'Player Alpha', points: 1200, ships: 12345},
    {rank: 2, name: 'Player Beta', points: 900, ships: 678}
  ]);
  window.close();
});
