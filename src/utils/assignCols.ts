import type { TimeSlot } from '../types/schedule';

const VENUE_ORDER: Record<string, number> = { 'main-stage': 0, 'll-a': 1, 'll-b': 2 };

export function isBg(s: TimeSlot): boolean {
  return s.type === 'break' ||
    (s.type === 'event' && /doors|lunch/i.test(s.title || ''));
}

export interface SlotWithCol extends TimeSlot {
  col: number;
  totalCols: number;
}

export function assignCols(slots: TimeSlot[]): SlotWithCol[] {
  return slots.map(s => {
    if (isBg(s)) return { ...s, col: 0, totalCols: 1 };
    const concurrent = slots
      .filter(o => !isBg(o))
      .filter(o => o.startSlot < s.startSlot + s.durationSlots &&
                   o.startSlot + o.durationSlots > s.startSlot)
      .sort((a, b) =>
        (VENUE_ORDER[a.venueId] ?? 3) - (VENUE_ORDER[b.venueId] ?? 3) ||
        a.startSlot - b.startSlot
      );
    return { ...s, col: concurrent.indexOf(s), totalCols: concurrent.length };
  });
}
