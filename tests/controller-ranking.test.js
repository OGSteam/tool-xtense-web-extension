import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {createContext, runInContext} from 'node:vm';

const controller = readFileSync(new URL('../extension/parsers/controller.js', import.meta.url), 'utf8');

function detectedPage(url) {
  const calls = [];
  const context = createContext({
    url,
    setStatus: () => calls.push('unknown'),
    xlang: key => key,
    XLOG_NORMAL: 3
  });
  runInContext(controller, context);
  context.handle_page = page => calls.push(page);
  context.handle_current_page();
  return calls;
}

test('detects the ranking component', () => {
  assert.deepEqual(detectedPage('https://example.com/game/index.php?page=ingame&component=highscore&site=18'), ['stats']);
});

test('does not detect unrelated highscore-like parameters', () => {
  assert.deepEqual(detectedPage('https://example.com/game/index.php?page=ingame&component=highscoreDetails'), ['unknown']);
  assert.deepEqual(detectedPage('https://example.com/game/index.php?page=highscore'), ['unknown']);
});
