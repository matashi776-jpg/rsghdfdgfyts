#!/usr/bin/env node
/**
 * tools/cleanAssets.js
 * Asset pipeline validator for Оборона Ланчина.
 *
 * Checks all PNG files in /public/assets/sprites/raw/ and reports:
 *   - Duplicate files (same content hash)
 *   - Non-standard dimensions (must be 2048x2048 or 1024x1024)
 *   - Files missing an alpha (transparency) channel
 *
 * Usage:  node tools/cleanAssets.js [--fix]
 *   --fix  Automatically delete detected duplicates.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.resolve(__dirname, '../public/assets/sprites/raw');
const FIX_MODE = process.argv.includes('--fix');

const ALLOWED_SIZES = [
  { w: 2048, h: 2048 },
  { w: 1024, h: 1024 },
];

// ─── Minimal PNG header parser ───────────────────────────────────────────────

/**
 * Reads width, height, and colour-type from a PNG file's IHDR chunk.
 * Returns null if the file is not a valid PNG.
 */
function readPngHeader(filePath) {
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(33);
    const bytesRead = fs.readSync(fd, buf, 0, 33, 0);
    if (bytesRead < 33) return null;

    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    for (let i = 0; i < 8; i++) {
      if (buf[i] !== PNG_MAGIC[i]) return null;
    }

    // IHDR chunk starts at byte 8 (4 length + 4 "IHDR" + data)
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const colourType = buf[25]; // 2=RGB, 3=indexed, 4=grey+alpha, 6=RGBA

    return { width, height, colourType };
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/**
 * Returns true if the PNG colour-type includes an alpha channel.
 * Type 4 = greyscale + alpha; type 6 = RGB + alpha (RGBA).
 */
function hasAlpha(colourType) {
  return colourType === 4 || colourType === 6;
}

// ─── Hash helper ─────────────────────────────────────────────────────────────

function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ─── Main ────────────────────────────────────────────────────────────────────

function run() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`[cleanAssets] Raw assets directory not found:\n  ${RAW_DIR}`);
    console.error('  Create it and add PNG files before running this script.');
    process.exit(1);
  }

  const files = fs.readdirSync(RAW_DIR).filter((f) => f.toLowerCase().endsWith('.png'));

  if (files.length === 0) {
    console.log('[cleanAssets] No PNG files found in raw directory — nothing to check.');
    return;
  }

  console.log(`[cleanAssets] Scanning ${files.length} PNG file(s) in:\n  ${RAW_DIR}\n`);

  let errors = 0;
  let warnings = 0;
  const hashMap = new Map(); // hash → first file path

  for (const file of files) {
    const filePath = path.join(RAW_DIR, file);

    // ── 1. Duplicate detection ───────────────────────────────────────────────
    const hash = fileHash(filePath);
    if (hashMap.has(hash)) {
      warnings++;
      const original = hashMap.get(hash);
      console.warn(`  ⚠  DUPLICATE  ${file}`);
      console.warn(`       → same content as ${path.basename(original)}`);
      if (FIX_MODE) {
        fs.unlinkSync(filePath);
        console.warn(`       ✓ Deleted ${file}`);
      }
      continue; // skip further checks for duplicates
    }
    hashMap.set(hash, filePath);

    // ── 2. PNG header validation ─────────────────────────────────────────────
    const header = readPngHeader(filePath);
    if (!header) {
      errors++;
      console.error(`  ✗  NOT A VALID PNG  ${file}`);
      continue;
    }

    // ── 3. Dimension check ───────────────────────────────────────────────────
    const sizeOk = ALLOWED_SIZES.some(
      (s) => s.w === header.width && s.h === header.height
    );
    if (!sizeOk) {
      errors++;
      console.error(
        `  ✗  BAD SIZE  ${file}  (${header.width}×${header.height})` +
        `  — expected 2048×2048 or 1024×1024`
      );
    } else {
      console.log(`  ✓  ${file}  (${header.width}×${header.height})`);
    }

    // ── 4. Transparency check ────────────────────────────────────────────────
    if (!hasAlpha(header.colourType)) {
      errors++;
      console.error(
        `  ✗  NO ALPHA  ${file}  (colour type ${header.colourType})` +
        `  — asset must have a transparent background`
      );
    }
  }

  console.log('');
  if (errors === 0 && warnings === 0) {
    console.log('[cleanAssets] ✅  All assets passed validation.');
  } else {
    if (warnings > 0) console.warn(`[cleanAssets] ⚠  ${warnings} duplicate(s) found.`);
    if (errors > 0) {
      console.error(`[cleanAssets] ✗  ${errors} error(s) found.`);
      process.exit(1);
    }
  }
}

run();
