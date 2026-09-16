import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ADDS, COPY, PLATES } from '../app/src/core/content';
import { BANNED, findBannedWords, stringLeaves } from '../app/src/core/lint';

describe('copy-lint — the compassionate-flexibility gate (I5)', () => {
  it('the denylist has 22 tokens', () => {
    expect(BANNED.length).toBe(22);
  });

  it('matches on word boundaries, case-insensitively', () => {
    expect(findBannedWords([['x', 'Count your Calories']])).toHaveLength(1);
    expect(findBannedWords([['x', 'a low-FAT option']])).toHaveLength(1);
    expect(findBannedWords([['x', 'fatigue is not a hit']])).toHaveLength(0);
    expect(findBannedWords([['x', 'a loser, a closet, a slimmer']])).toHaveLength(0);
    expect(findBannedWords([['x', 'a burning question']])).toHaveLength(0);
  });

  it('no banned word appears in plates.json', () => {
    expect(findBannedWords(stringLeaves(PLATES))).toEqual([]);
  });

  it('no banned word appears in addons.json', () => {
    expect(findBannedWords(stringLeaves(ADDS))).toEqual([]);
  });

  it('no banned word appears in copy.en.json', () => {
    expect(findBannedWords(stringLeaves(COPY))).toEqual([]);
  });

  it('no banned word appears in the dashboard paywall copy (docs/paywall-copy.md)', () => {
    const p = resolve(__dirname, '../docs/paywall-copy.md');
    expect(existsSync(p)).toBe(true);
    const body = readFileSync(p, 'utf8')
      .split('\n')
      // the header block explains the rule and may name the denylist file; strings start after "---"
      .filter((l) => !l.startsWith('>'))
      .join('\n');
    expect(findBannedWords([['docs/paywall-copy.md', body]])).toEqual([]);
  });

  it('no banned word appears in any screen or component source string', () => {
    // A cheap scan of the UI source: every quoted string literal in screens/ and components/.
    const dirs = ['screens', 'components'].map((d) => resolve(__dirname, '../app/src', d));
    const entries: [string, string][] = [];
    for (const dir of dirs) {
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).filter((f) => /\.tsx?$/.test(f))) {
        const src = readFileSync(resolve(dir, f), 'utf8');
        // Lines that are comments are not user-facing.
        const code = src
          .split('\n')
          .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
          .join('\n');
        for (const m of code.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g))
          entries.push([`${f}`, m[0]]);
      }
    }
    expect(findBannedWords(entries)).toEqual([]);
  });

  it('stringLeaves walks nested objects and arrays', () => {
    const leaves = [...stringLeaves({ a: ['x', { b: 'y' }], c: 3 })];
    expect(leaves).toEqual([
      ['$.a[0]', 'x'],
      ['$.a[1].b', 'y'],
    ]);
  });
});
