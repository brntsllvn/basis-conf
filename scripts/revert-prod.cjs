#!/usr/bin/env node
'use strict';

const TOKEN    = process.env.BLOB_READ_WRITE_TOKEN;
const SNAP_PREFIX = 'snapshots/conf-state-';
const BLOB_NAME   = 'conf-state.json';

if (!TOKEN) {
  process.stderr.write('Error: BLOB_READ_WRITE_TOKEN not set. Run: vercel env pull .env.local\n');
  process.exit(1);
}

const target = process.argv[2]; // optional: timestamp prefix to restore

async function main() {
  const { list, put } = await import('@vercel/blob');

  const { blobs } = await list({ prefix: SNAP_PREFIX, token: TOKEN });

  if (!blobs.length) {
    process.stdout.write('No snapshots found.\n');
    return;
  }

  // Sort newest first
  const sorted = blobs.sort((a, b) => b.uploadedAt - a.uploadedAt);

  if (!target) {
    process.stdout.write('Available snapshots (newest first):\n');
    sorted.forEach((b, i) => {
      const name = b.pathname.replace(SNAP_PREFIX, '').replace('.json', '');
      process.stdout.write(`  ${i + 1}. ${name}  (${(b.size / 1024).toFixed(1)}kb)\n`);
    });
    process.stdout.write('\nUsage: npm run revert-prod <timestamp>\n');
    process.stdout.write('Example: npm run revert-prod 2026-05-07T18-09-00\n');
    return;
  }

  const match = sorted.find(b => b.pathname.includes(target));
  if (!match) {
    process.stderr.write(`No snapshot matching "${target}"\n`);
    process.exit(1);
  }

  const res = await fetch(match.url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  });
  const data = await res.json();

  // Snapshot current state before reverting
  const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const { blobs: current } = await list({ prefix: BLOB_NAME, token: TOKEN });
  if (current.length) {
    const cur = await fetch(current[0].url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    });
    await put(`${SNAP_PREFIX}${stamp}.json`, await cur.text(), {
      access: 'private', addRandomSuffix: false, allowOverwrite: true, token: TOKEN,
    });
    process.stdout.write(`snapshot: current state saved as ${stamp}\n`);
  }

  await put(BLOB_NAME, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: TOKEN,
  });

  process.stdout.write(`reverted: PROD → ${match.pathname.replace(SNAP_PREFIX, '').replace('.json', '')} (${data.slots?.length ?? '?'} slots)\n`);
}

main().catch(e => { process.stderr.write(e.message + '\n'); process.exit(1); });
