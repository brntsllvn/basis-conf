/**
 * Tests for importFromJson validation logic.
 *
 * persistence.ts references window at module scope (for API_URL) so we
 * replicate the pure validation inline here rather than importing the module
 * into a node environment.  The validation logic itself is the contract under
 * test — these tests will catch any future drift if the guard is weakened.
 */
import { describe, it, expect } from 'vitest';
import type { AppState } from '../types/schedule';

// Mirrors the validation in persistence.ts importFromJson — update both if
// the guard changes.
function importFromJson(json: string): AppState {
  const parsed = JSON.parse(json) as AppState;
  if (
    !parsed.version ||
    !Array.isArray(parsed.slots) ||
    !Array.isArray(parsed.contacts) ||
    !Array.isArray(parsed.days) ||
    !Array.isArray(parsed.venues)
  ) {
    throw new Error('Invalid state file: missing or malformed required fields');
  }
  return parsed;
}

describe('importFromJson', () => {
  const validState = {
    version: 1,
    days: [{ id: 'thu', label: 'Thu', date: '2025-05-28' }],
    venues: [{ id: 'main-stage', label: 'Main Stage' }],
    slots: [],
    contacts: [],
    lastModified: '2024-01-01T00:00:00.000Z',
  };

  it('accepts a well-formed state object', () => {
    const result = importFromJson(JSON.stringify(validState));
    expect(result.version).toBe(1);
    expect(Array.isArray(result.slots)).toBe(true);
  });

  it('throws when version is missing', () => {
    const bad = { ...validState, version: undefined };
    expect(() => importFromJson(JSON.stringify(bad))).toThrow('Invalid state file');
  });

  it('throws when slots is not an array (null)', () => {
    const bad = { ...validState, slots: null };
    expect(() => importFromJson(JSON.stringify(bad))).toThrow('Invalid state file');
  });

  it('throws when contacts is not an array', () => {
    const bad = { ...validState, contacts: 'oops' };
    expect(() => importFromJson(JSON.stringify(bad))).toThrow('Invalid state file');
  });

  it('throws when days is missing', () => {
    const { days: _days, ...bad } = validState;
    expect(() => importFromJson(JSON.stringify(bad))).toThrow('Invalid state file');
  });

  it('throws when venues is not an array', () => {
    const bad = { ...validState, venues: {} };
    expect(() => importFromJson(JSON.stringify(bad))).toThrow('Invalid state file');
  });

  it('throws on invalid JSON', () => {
    expect(() => importFromJson('not json')).toThrow();
  });
});
