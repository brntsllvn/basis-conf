import type { AppState } from '../types/schedule';
import { createInitialState } from '../seed/initialSchedule';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/state'
  : '/api/state';
const LS_KEY = 'conf-planner-v1';

// Tracks whether the server was reachable at load time.
// Once false, we skip the server on subsequent loads to avoid repeated
// failures on startup, but saves always retry the server so a transient
// failure during load doesn't permanently disable writes.
let serverReachable = true;

export async function loadState(): Promise<AppState> {
  if (serverReachable) {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
        return data as AppState;
      }
    } catch {
      serverReachable = false;
      console.warn('Server unavailable, falling back to localStorage');
    }
  }

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }

  return createInitialState();
}

export async function saveState(state: AppState): Promise<void> {
  // Always attempt the server on save; a transient load failure shouldn't
  // permanently disable writes for the session.
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    serverReachable = true; // restore if it recovered
  } catch {
    console.warn('Server save failed, state persisted to localStorage only');
  }

  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function importFromJson(json: string): AppState {
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

export function downloadJson(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const env = window.location.hostname === 'localhost' ? 'DEV' : 'PROD';
  const ts  = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
  a.download = `conf-schedule-${env}-${ts}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
