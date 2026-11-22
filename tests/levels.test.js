import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';

const scripts = [
  '../extension/parsers/OgameConstants.js',
  '../extension/parsers/pages.js'
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8'));

function setup(technologies, values = technologies.map((_, index) => String(index))) {
  const dom = new JSDOM(`
    <div><ul>
      ${technologies.map((id, index) => `
        <li class="technology" data-technology="${id}">
          <span class="${id === 212 || id === 217 || id >= 400 ? 'amount' : 'level'}" data-value="${values[index]}"></span>
          <span class="targetlevel" data-value="99"></span>
        </li>
      `).join('')}
    </ul></div>
  `, {runScripts: 'outside-only'});
  const {window} = dom;
  const data = {};
  let sends = 0;
  const planet = {id: '100', name: 'Alpha', coords: '1:2:3', type: '0'};

  window.setStatus = () => {};
  window.xlang = key => key;
  window.XLOG_NORMAL = 3;
  window.getPlanetData = () => planet;
  window.XtenseMetas = {getPlanetType: () => 'planet'};
  window.XtenseRequest = {
    set: (key, value) => { data[key] = value; },
    send: () => { sends++; }
  };
  for (const script of scripts) window.eval(script);
  window.initParsers();
  return {window, data, planet, getSends: () => sends};
}

test('parses research levels in display order without including target levels', () => {
  const technologies = [113, 120, 121, 114, 122, 115, 117, 118, 106, 108, 124, 123, 199, 109, 110, 111];
  const {window, data, planet, getSends} = setup(technologies);
  window.parse_researchs();

  assert.equal(getSends(), 1);
  assert.equal(data.type, 'researchs');
  assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata)), {
    planet,
    researchs: {
      NRJ: '0', Laser: '1', Ions: '2', Hyp: '3', Plasma: '4',
      RC: '5', RI: '6', PH: '7', Esp: '8', Ordi: '9',
      Astrophysique: '10', RRI: '11', Graviton: '12',
      Armes: '13', Bouclier: '14', Protection: '15'
    }
  });
  window.close();
});

test('parses planet facilities in display order', () => {
  const technologies = [14, 21, 31, 34, 44, 15, 33, 36, 45];
  const {window, data, planet, getSends} = setup(technologies);
  window.parse_station();

  assert.equal(getSends(), 1);
  assert.equal(data.type, 'buildings');
  assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata)), {
    planet,
    buildings: {
      UdR: '0', CSp: '1', Lab: '2', DdR: '3',
      Silo: '4', UdN: '5', Ter: '6', Dock: '7'
    }
  });
  window.close();
});

test('parses planet resources including formatted satellite and crawler counts', () => {
  const technologies = [1, 2, 3, 4, 12, 212, 217, 22, 23, 24];
  const values = ['1', '2', '3', '4', '5', '1.234', '2.345', '8', '9', '10'];
  const {window, data, planet, getSends} = setup(technologies, values);
  window.parse_buildings();

  assert.equal(getSends(), 1);
  assert.equal(data.type, 'buildings');
  assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata)), {
    planet,
    buildings: {
      M: '1', C: '2', D: '3', CES: '4', CEF: '5',
      SAT: '1234', FOR: '2345', HM: '8', HC: '9', HD: '10'
    }
  });
  window.close();
});

test('parses defense amounts in display order', () => {
  const technologies = [401, 402, 403, 404, 405, 406, 407, 408, 502, 503];
  const values = ['1.234', '2', '3', '4', '5', '6', '1', '1', '9', '10'];
  const {window, data, planet, getSends} = setup(technologies, values);
  window.parse_defense();

  assert.equal(getSends(), 1);
  assert.equal(data.type, 'defense');
  assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata)), {
    planet,
    defense: {
      LM: '1234', LLE: '2', LLO: '3', CG: '4', AI: '5',
      LP: '6', PB: '1', GB: '1', MIC: '9', MIP: '10'
    }
  });
  window.close();
});

function setupLifeforms(slots) {
  const fixture = setup([]);
  fixture.window.document.body.innerHTML = `
    <span class="level" data-value="999"></span>
    <div id="technologies"><ul class="icons">
      ${slots.map(slot => `
        <li class="technology" data-technology="${slot.id}">
          <span class="icon">
            ${slot.level === undefined ? '' : `<span class="level" data-value="${slot.level}"></span>`}
            <span class="targetlevel" data-value="99"></span>
          </span>
        </li>
      `).join('')}
    </ul></div>
  `;
  const warnings = [];
  fixture.window.log = {info() {}, warn: message => warnings.push(message)};
  fixture.window.XLOG_WARNING = 2;
  return {...fixture, warnings};
}

test('parses actual building IDs for all lifeform species regardless of order', () => {
  for (const prefix of [111, 121, 131, 141]) {
    const slots = Array.from({length: 12}, (_, i) => ({
      id: `${prefix}${String(12 - i).padStart(2, '0')}`,
      level: i === 0 ? '1.234' : String(i)
    }));
    const {window, data, planet, getSends} = setupLifeforms(slots);
    window.parse_lfBuildings();
    assert.equal(getSends(), 1);
    assert.equal(data.type, 'lf_buildings');
    assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata)), {
      planet,
      lfBuildings: Object.fromEntries(slots.map(({id, level}) => [id, level.replaceAll('.', '')]))
    });
    window.close();
  }
});

test('parses all selected mixed-species research IDs, including the last three slots', () => {
  const prefixes = [112, 122, 132, 142];
  const slots = Array.from({length: 18}, (_, i) => ({
    id: `${prefixes[i % prefixes.length]}${String(i + 1).padStart(2, '0')}`,
    level: String(i)
  }));
  const {window, data, planet, getSends} = setupLifeforms(slots);
  window.parse_lfResearch();
  assert.equal(getSends(), 1);
  assert.equal(data.type, 'lf_research');
  assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata)), {
    planet,
    lfResearch: Object.fromEntries(slots.map(({id, level}) => [id, level]))
  });
  window.close();
});

test('skips locked research slots without inventing IDs or levels', () => {
  const {window, data, getSends} = setupLifeforms([
    {id: '', level: undefined}, {id: '12201', level: '4'}, {id: '', level: undefined}
  ]);
  window.parse_lfResearch();
  assert.deepEqual(JSON.parse(JSON.stringify(data.gamedata.lfResearch)), {'12201': '4'});
  assert.equal(getSends(), 1);
  window.close();

  const locked = setupLifeforms(Array.from({length: 18}, () => ({id: ''})));
  locked.window.parse_lfResearch();
  assert.equal(locked.getSends(), 0);
  locked.window.close();
});

test('does not send partial lifeform data when a technology or level is invalid', () => {
  for (const slots of [
    [{id: '11101', level: '2'}, {id: '11102'}],
    [{id: '11101', level: '2'}, {id: '', level: '3'}],
    [{id: '11101', level: '2'}, {id: '11101', level: '3'}],
    []
  ]) {
    const {window, getSends, warnings} = setupLifeforms(slots);
    window.parse_lfBuildings();
    assert.equal(getSends(), 0);
    assert.equal(warnings.length, 1);
    window.close();
  }
});
