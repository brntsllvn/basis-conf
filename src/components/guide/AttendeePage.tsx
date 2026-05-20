import { useState, useEffect, useRef, useMemo } from 'react';
import { useSchedule } from '../../state/ScheduleContext';
import { slotToTime, timeToSlot, slotsToDuration } from '../../utils/time';
import type { TimeSlot, DayId } from '../../types/schedule';
import './AttendeePage.css';

const HIDDEN_TYPES = new Set(['not-in-use', 'load-in', 'emcee', 'open']);

const VENUE: Record<string, { label: string; short: string; accent: string; dim: string }> = {
  'main-stage': { label: 'Main Stage', short: 'MAIN STAGE', accent: '#92400E', dim: '#FEF3C7' },
  'll-a':       { label: 'Marina',     short: 'MARINA',     accent: '#14532D', dim: '#DCFCE7' },
  'll-b':       { label: 'Cove',       short: 'COVE',       accent: '#1E3A8A', dim: '#DBEAFE' },
};

const CONF_DAYS: { id: DayId; short: string }[] = [
  { id: 'thu', short: 'Thu 5/28' },
  { id: 'fri', short: 'Fri 5/29' },
];

function getPT(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
}

function clockStr(d: Date): string {
  const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const period = h >= 12 ? 'PM' : 'AM';
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${period}`;
}

function activeDayId(pt: Date): DayId {
  const iso = pt.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  return iso === '2026-05-29' ? 'fri' : 'thu';
}

export function AttendeePage() {
  const { state } = useSchedule();
  const [now, setNow] = useState(() => getPT());
  const [dayId, setDayId] = useState<DayId>(() => activeDayId(getPT()));
  const nowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const pt = getPT();
      setNow(pt);
      setDayId(activeDayId(pt));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll to NOW line whenever the day tab changes
  useEffect(() => {
    const t = setTimeout(() => {
      nowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => clearTimeout(t);
  }, [dayId]);

  const currentSlot = timeToSlot(now.getHours(), now.getMinutes());

  const slotStatus = (s: TimeSlot): 'past' | 'active' | 'upcoming' => {
    if (currentSlot >= s.startSlot + s.durationSlots) return 'past';
    if (currentSlot >= s.startSlot) return 'active';
    return 'upcoming';
  };

  // Group slots by startSlot, sorted by venue priority within each group
  const timeBlocks = useMemo(() => {
    const venueOrder: Record<string, number> = { 'main-stage': 0, 'll-a': 1, 'll-b': 2 };
    const daySlots = state.slots
      .filter(s => s.dayId === dayId && !HIDDEN_TYPES.has(s.type))
      .sort((a, b) =>
        a.startSlot !== b.startSlot
          ? a.startSlot - b.startSlot
          : (venueOrder[a.venueId] ?? 9) - (venueOrder[b.venueId] ?? 9)
      );

    const map = new Map<number, TimeSlot[]>();
    for (const slot of daySlots) {
      const arr = map.get(slot.startSlot) ?? [];
      arr.push(slot);
      map.set(slot.startSlot, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [state.slots, dayId]);

  // First block that has any non-past session: this is where the NOW line goes
  const nowInsertBefore = useMemo(() => {
    for (const [startSlot, slots] of timeBlocks) {
      if (slots.some(s => slotStatus(s) !== 'past')) return startSlot;
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBlocks, currentSlot]);

  const getSpeakers = (slot: TimeSlot) =>
    slot.assignments
      .map(a => state.contacts.find(c => c.id === a.contactId))
      .filter(Boolean)
      .map(c => c!.name);

  return (
    <div className="guide-root">
      <header className="guide-header">
        <div className="guide-header-top">
          <span className="guide-conf-name">Basis Northwest 2026</span>
          <span className="guide-clock">{clockStr(now)}</span>
        </div>
        <div className="guide-day-tabs">
          {CONF_DAYS.map(d => (
            <button
              key={d.id}
              className={`guide-day-tab${dayId === d.id ? ' active' : ''}`}
              onClick={() => setDayId(d.id)}
            >
              {d.short}
            </button>
          ))}
        </div>
      </header>

      <div className="guide-scroll">
        {timeBlocks.map(([startSlot, slots]) => {
          const isNowAnchor = startSlot === nowInsertBefore;
          const blockStatus = slots.some(s => slotStatus(s) === 'active')
            ? 'active'
            : slots.every(s => slotStatus(s) === 'past')
            ? 'past'
            : 'upcoming';

          return (
            <div key={startSlot}>
              {isNowAnchor && (
                <div className="guide-now-line" ref={nowRef}>
                  <div className="guide-now-rule" />
                  <span className="guide-now-label">NOW · {clockStr(now)}</span>
                  <div className="guide-now-rule" />
                </div>
              )}
              <div className={`guide-block guide-block--${blockStatus}`}>
                <div className="guide-time-col">
                  <span className="guide-time-label">{slotToTime(startSlot)}</span>
                </div>
                <div className="guide-sessions">
                  {slots.map(slot => {
                    const status = slotStatus(slot);
                    const venue = VENUE[slot.venueId];
                    const speakers = getSpeakers(slot);
                    const duration = slotsToDuration(slot.durationSlots);

                    if (slot.type === 'break') {
                      return (
                        <div key={slot.id} className={`guide-break guide-break--${status}`}>
                          {slot.title || 'BREAK'} · {duration} min
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.id}
                        className={`guide-card guide-card--${status}`}
                        style={{ borderLeftColor: venue?.accent ?? '#6B7280' }}
                      >
                        {venue && (
                          <span
                            className="guide-venue-badge"
                            style={{ color: venue.accent, background: venue.dim }}
                          >
                            {venue.short}
                          </span>
                        )}
                        {slot.company && (
                          <div className="guide-card-company">{slot.company}</div>
                        )}
                        {slot.title && (
                          <div className="guide-card-title">{slot.title}</div>
                        )}
                        {speakers.length > 0 && (
                          <div className="guide-card-speakers">{speakers.join(', ')}</div>
                        )}
                        {status === 'active' && (
                          <div className="guide-active-pill">Happening now</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div className="guide-footer">Basis Northwest 2026 · Seattle, WA</div>
      </div>
    </div>
  );
}
