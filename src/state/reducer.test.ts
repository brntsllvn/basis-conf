import { describe, it, expect } from 'vitest';
import { scheduleReducer } from './reducer';
import { createInitialState } from '../seed/initialSchedule';
import type { AppState } from '../types/schedule';

function makeState(overrides: Partial<AppState> = {}): AppState {
  return { ...createInitialState(), ...overrides };
}

describe('scheduleReducer', () => {
  describe('IMPORT_STATE', () => {
    it('preserves lastModified from the imported state', () => {
      const current = makeState();
      const imported = makeState({ lastModified: '2024-01-01T00:00:00.000Z' });
      const next = scheduleReducer(current, { type: 'IMPORT_STATE', state: imported });
      expect(next.lastModified).toBe('2024-01-01T00:00:00.000Z');
    });

    it('replaces state wholesale from the imported payload', () => {
      const current = makeState();
      const imported = makeState({ version: 999 });
      const next = scheduleReducer(current, { type: 'IMPORT_STATE', state: imported });
      expect(next.version).toBe(999);
    });
  });

  describe('ADD_SLOT', () => {
    it('updates lastModified when a slot is added', () => {
      const before = new Date().toISOString();
      const state = makeState();
      const slot = { ...state.slots[0], id: 'new-slot-id' };
      // Use a venue/time that won't overlap
      slot.startSlot = 0;
      slot.durationSlots = 1;
      const next = scheduleReducer(state, { type: 'ADD_SLOT', slot });
      expect(next.lastModified >= before).toBe(true);
    });

    it('rejects a slot that would overlap an existing slot in the same venue', () => {
      const state = makeState();
      const existing = state.slots.find((s) => s.dayId === 'thu');
      if (!existing) return; // seed has no thu slots, skip
      const overlap = {
        ...existing,
        id: 'overlap-test',
        startSlot: existing.startSlot, // exact same position
      };
      const next = scheduleReducer(state, { type: 'ADD_SLOT', slot: overlap });
      expect(next.slots).toHaveLength(state.slots.length); // rejected
    });
  });

  describe('DELETE_CONTACT', () => {
    it('removes contact from all slot assignments', () => {
      const state = makeState();
      const contact = state.contacts[0];
      if (!contact) return;
      // Give that contact an assignment on the first slot
      const slotWithAssignment = {
        ...state.slots[0],
        assignments: [{ contactId: contact.id, slotRole: 'Speaker' as const }],
      };
      const stateWithAssignment: AppState = {
        ...state,
        slots: [slotWithAssignment, ...state.slots.slice(1)],
      };
      const next = scheduleReducer(stateWithAssignment, {
        type: 'DELETE_CONTACT',
        contactId: contact.id,
      });
      expect(next.contacts.find((c) => c.id === contact.id)).toBeUndefined();
      expect(next.slots[0].assignments).toHaveLength(0);
    });
  });
});
