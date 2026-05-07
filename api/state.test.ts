import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('@vercel/blob', () => ({
  list: vi.fn(),
  put: vi.fn(),
}));

import { list, put } from '@vercel/blob';
import handler from './state';

const FAKE_URL = 'https://blob.vercel.com/conf-state.json';
const FAKE_STATE = { version: 1, slots: [], contacts: [] };

function makeReq(method: string, body?: unknown): VercelRequest {
  return { method, body } as unknown as VercelRequest;
}

function makeRes() {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as VercelResponse;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(list).mockResolvedValue({ blobs: [{ url: FAKE_URL } as never], cursor: '', hasMore: false });
  vi.mocked(put).mockResolvedValue({} as never);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: () => Promise.resolve(FAKE_STATE),
  }));
});

describe('GET /api/state', () => {
  it('fetches blob with cache: no-store to bypass CDN', async () => {
    await handler(makeReq('GET'), makeRes());
    expect(fetch).toHaveBeenCalledWith(FAKE_URL, { cache: 'no-store' });
  });

  it('returns null when no blobs exist', async () => {
    vi.mocked(list).mockResolvedValue({ blobs: [], cursor: '', hasMore: false });
    const res = makeRes();
    await handler(makeReq('GET'), res);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it('returns parsed blob contents', async () => {
    const res = makeRes();
    await handler(makeReq('GET'), res);
    expect(res.json).toHaveBeenCalledWith(FAKE_STATE);
  });
});

describe('PUT /api/state', () => {
  it('writes state to blob storage', async () => {
    const newState = { version: 1, slots: [{ id: 'test' }], contacts: [] };
    const res = makeRes();
    await handler(makeReq('PUT', newState), res);
    expect(put).toHaveBeenCalledWith(
      'conf-state.json',
      JSON.stringify(newState),
      expect.objectContaining({ allowOverwrite: true, addRandomSuffix: false })
    );
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});

describe('PUT then GET roundtrip', () => {
  it('GET after PUT returns the new state, not stale cache', async () => {
    const newState = { version: 2, slots: [{ id: 'updated' }], contacts: [] };

    // PUT new state
    await handler(makeReq('PUT', newState), makeRes());

    // Simulate fetch returning the new state (as storage would after overwrite)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(newState),
    }));

    // GET should return new state, not old cached state
    const res = makeRes();
    await handler(makeReq('GET'), res);
    expect(fetch).toHaveBeenCalledWith(FAKE_URL, { cache: 'no-store' });
    expect(res.json).toHaveBeenCalledWith(newState);
  });
});
