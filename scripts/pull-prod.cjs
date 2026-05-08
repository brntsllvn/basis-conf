#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const TOKEN     = process.env.BLOB_READ_WRITE_TOKEN;
const STATE_PATH = path.join(__dirname, '..', 'conf-planner.json');
const BLOB_NAME  = 'conf-state.json';

if (!TOKEN) {
  process.stderr.write('Error: BLOB_READ_WRITE_TOKEN not set. Run: vercel env pull .env.local\n');
  process.exit(1);
}

async function main() {
  const { list } = await import('@vercel/blob');

  const { blobs } = await list({ prefix: BLOB_NAME, token: TOKEN });
  if (!blobs.length) {
    process.stderr.write('No blob found — PROD has no state yet.\n');
    process.exit(1);
  }

  const res = await fetch(blobs[0].url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  });
  const data = await res.json();

  fs.writeFileSync(STATE_PATH, JSON.stringify(data, null, 2) + '\n');
  process.stdout.write(`pulled: ${blobs[0].url}\n  → ${path.relative(process.cwd(), STATE_PATH)} (${data.slots?.length ?? '?'} slots)\n`);
}

main().catch(e => { process.stderr.write(e.message + '\n'); process.exit(1); });
