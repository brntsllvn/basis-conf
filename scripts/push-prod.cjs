#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const TOKEN      = process.env.BLOB_READ_WRITE_TOKEN;
const STATE_PATH = path.join(__dirname, '..', 'conf-planner.json');
const BLOB_NAME  = 'conf-state.json';

if (!TOKEN) {
  process.stderr.write('Error: BLOB_READ_WRITE_TOKEN not set. Run: vercel env pull .env.local\n');
  process.exit(1);
}

if (!fs.existsSync(STATE_PATH)) {
  process.stderr.write(`Error: ${STATE_PATH} not found. Run: npm run pull-prod first.\n`);
  process.exit(1);
}

async function main() {
  const { list, put } = await import('@vercel/blob');

  // Snapshot current PROD state before overwriting
  const { blobs } = await list({ prefix: BLOB_NAME, token: TOKEN });
  if (blobs.length) {
    const res = await fetch(blobs[0].url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    });
    const current = await res.text();
    const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const snapName = `snapshots/conf-state-${stamp}.json`;
    await put(snapName, current, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: TOKEN,
    });
    process.stdout.write(`snapshot: ${snapName}\n`);
  }

  const data = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  await put(BLOB_NAME, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: TOKEN,
  });

  process.stdout.write(`pushed: conf-planner.json → PROD (${data.slots?.length ?? '?'} slots, ${data.contacts?.length ?? '?'} contacts)\n`);
}

main().catch(e => { process.stderr.write(e.message + '\n'); process.exit(1); });
