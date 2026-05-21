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
  { id: 'wed', short: 'Wed 5/27' },
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
  if (iso === '2026-05-27') return 'wed';
  if (iso === '2026-05-29') return 'fri';
  return 'thu';
}

export function AttendeePage() {
  const { state } = useSchedule();
  const [now, setNow] = useState(() => getPT());
  const [dayId, setDayId] = useState<DayId>(() => activeDayId(getPT()));
  const nowRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  // Clock ticks every second — never auto-override the user's day selection
  useEffect(() => {
    const id = setInterval(() => setNow(getPT()), 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll to NOW once on initial mount only
  useEffect(() => {
    if (didInitialScroll.current) return;
    didInitialScroll.current = true;
    const t = setTimeout(() => {
      nowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return () => clearTimeout(t);
  }, []);

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
        <div className="guide-header-logo">
          <img src="/canvas-logo.webp" alt="Canvas by Franklin Templeton" className="guide-logo" />
        </div>
        <div className="guide-header-wifi">
          <svg className="guide-wifi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <circle cx="12" cy="20" r="1" fill="currentColor"/>
          </svg>
          <span className="guide-header-wifi-row"><span className="guide-header-wifi-key">Network</span> basis_northwest_2026</span>
          <span className="guide-header-wifi-row"><span className="guide-header-wifi-key">Password</span> tax_alpha_insider</span>
        </div>
        <div className="guide-header-back">
          <a href="/northwest-2026" className="guide-back-link">← Event Info</a>
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
                  <span className="guide-now-label">NOW</span>
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
                        {(() => {
                          const badgeText = 'badge' in slot ? slot.badge : venue?.short;
                          if (!badgeText) return null;
                          return (
                            <span
                              className="guide-venue-badge"
                              style={{ color: venue?.accent ?? '#6B7280', background: venue?.dim ?? '#F3F4F6' }}
                            >
                              {badgeText}
                            </span>
                          );
                        })()}
                        {slot.type === 'event' ? (<>
                          {slot.title && (
                            <div className="guide-card-company">{slot.title}</div>
                          )}
                          {slot.company && (
                            <div className="guide-card-hosted">Hosted by {slot.company}</div>
                          )}
                        </>) : (<>
                          {slot.company && (
                            <div className="guide-card-company">{slot.company}</div>
                          )}
                          {slot.title && (
                            <div className="guide-card-title">{slot.title}</div>
                          )}
                          {speakers.length > 0 && (
                            <div className="guide-card-speakers">{speakers.join(', ')}</div>
                          )}
                        </>)}
                        {slot.location && (
                          <a
                            className="guide-card-location"
                            href={`https://maps.google.com/?q=${encodeURIComponent(slot.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                          >
                            📍 {slot.location}
                          </a>
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
        <div className="guide-footer">
          <img src="/canvas-logo.webp" alt="Canvas by Franklin Templeton" className="guide-footer-logo" />
          <span>Basis Northwest 2026 · Seattle, WA</span>
        </div>
      </div>
    </div>
  );
}
