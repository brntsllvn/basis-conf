import type { SlotType, VenueId } from '../types/schedule';

export interface SlotColor {
  bg: string;
  border: string;
  text: string;
}

export const VENUE_COLORS: Record<VenueId, SlotColor> = {
  'main-stage': { bg: '#DFC070', border: '#3D1F10', text: '#1B2E1A' },
  'll-a':       { bg: '#6EA2D8', border: '#2E52A8', text: '#0E1E40' },
  'll-b':       { bg: '#7DB876', border: '#2E4823', text: '#0E2010' },
};

export const BG_SLOT_COLOR: SlotColor = {
  bg: 'rgba(234,224,203,0.45)',
  border: 'rgba(160,136,64,0.45)',
  text: '#5A4E42',
};

export const BREAK_SLOT_COLOR: SlotColor = {
  bg: '#D0D0C8',
  border: '#989890',
  text: '#4A4A44',
};

export const SLOT_COLORS: Record<SlotType, SlotColor> = {
  keynote:      { bg: '#1E3A8A', border: '#1E40AF', text: '#FFFFFF' },
  solo:         { bg: '#0F766E', border: '#115E59', text: '#FFFFFF' },
  panel:        { bg: '#6B21A8', border: '#581C87', text: '#FFFFFF' },
  break:        { bg: '#D0D0C8', border: '#989890', text: '#4A4A44' },
  event:        { bg: '#B45309', border: '#92400E', text: '#FFFFFF' },
  emcee:        { bg: '#047857', border: '#065F46', text: '#FFFFFF' },
  open:         { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151' },
  'load-in':    { bg: '#374151', border: '#1F2937', text: '#FFFFFF' },
  'not-in-use': { bg: '#F9FAFB', border: '#D1D5DB', text: '#9CA3AF' },
};
