#!/usr/bin/env node
/**
 * tools/checkStyle.js
 * Style compliance checker for Оборона Ланчина assets.
 *
 * Inspects every PNG in /public/assets/sprites/raw/ and reports:
 *   - Missing / thin outlines  (samples edge pixels for near-black colours)
 *   - Missing glow bake        (checks whether bright neon pixels exist)
 *   - Off-palette colours      (warns if dominant hues deviate from Art Bible)
 *
 * NOTE: This is a heuristic check using raw PNG pixel data — it catches
 * obvious style violations but is not a substitute for human art review.
 *
 * Usage:  node tools/checkStyle.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.resolve(__dirname, '../public/assets/sprites/raw');

// ─── Art Bible palette (RGB, Art Bible §2 / AI_PROMPTS.md) ──────────────────

const PALETTE = [
  { name: 'Electric Blue',  r: 0,   g: 191, b: 255 },
  { name: 'Neon Pink',      r: 255, g: 0,   b: 170 },
  { name: 'Toxic Green',    r: 57,  g: 255, b: 20  },
  { name: 'Ultra-Violet',   r: 127, g: 0,   b: 255 },
  { name: 'Black Outline',  r: 0,   g: 0,   b: 0   },
  { name: 'White Core',     r: 255, g: 255, b: 255 },
];

const PALETTE_TOLERANCE = 80; // max Euclidean RGB distance to nearest palette colour

// ─── Minimal PNG decoder (IDAT → raw pixels) ─────────────────────────────────
// We use Node's built-in `zlib` to decompress IDAT chunks.

import zlib from 'zlib';

/**
 * Decodes a PNG file into an object: { width, height, pixels }
 * where pixels is a Uint8Array of interleaved RGBA bytes.
 * Supports only 8-bit RGBA (colour type 6) — the required format for game assets.
 */
function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);

  // Validate PNG magic
  const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buf.slice(0, 8).equals(PNG_MAGIC)) return null;

  let offset = 8;
  let width = 0, height = 0, colourType = 0, bitDepth = 0;
  const idatChunks = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString('ascii');
    const data = buf.slice(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colourType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 4 + 4 + length + 4; // length + type + data + CRC
  }

  if (colourType !== 6 || bitDepth !== 8) {
    // Only RGBA 8-bit supported for style checks
    return { width, height, pixels: null, colourType, bitDepth };
  }

  // Decompress IDAT
  const compressed = Buffer.concat(idatChunks);
  let raw;
  try {
    raw = zlib.inflateSync(compressed);
  } catch {
    return null;
  }

  // Un-filter rows (PNG filter method 0)
  const stride = width * 4; // RGBA
  const pixels = new Uint8Array(height * stride);

  for (let y = 0; y < height; y++) {
    const filterType = raw[y * (stride + 1)];
    const rowSrc = y * (stride + 1) + 1;
    const rowDst = y * stride;
    const prev = y > 0 ? pixels.slice((y - 1) * stride, y * stride) : new Uint8Array(stride);

    for (let x = 0; x < stride; x++) {
      const a = raw[rowSrc + x];
      switch (filterType) {
        case 0: pixels[rowDst + x] = a; break;
        case 1: pixels[rowDst + x] = (a + (x >= 4 ? pixels[rowDst + x - 4] : 0)) & 0xff; break;
        case 2: pixels[rowDst + x] = (a + prev[x]) & 0xff; break;
        case 3: pixels[rowDst + x] = (a + Math.floor(((x >= 4 ? pixels[rowDst + x - 4] : 0) + prev[x]) / 2)) & 0xff; break;
        case 4: {
          const pa = x >= 4 ? pixels[rowDst + x - 4] : 0;
          const pb = prev[x];
          const pc = x >= 4 ? prev[x - 4] : 0;
          const p = pa + pb - pc;
          const da = Math.abs(p - pa), db = Math.abs(p - pb), dc = Math.abs(p - pc);
          pixels[rowDst + x] = (a + (da <= db && da <= dc ? pa : db <= dc ? pb : pc)) & 0xff;
          break;
        }
        default: pixels[rowDst + x] = a;
      }
    }
  }

  return { width, height, pixels };
}

// ─── Colour distance ─────────────────────────────────────────────────────────

function colourDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function nearestPalette(r, g, b) {
  let best = null, bestDist = Infinity;
  for (const c of PALETTE) {
    const d = colourDist(r, g, b, c.r, c.g, c.b);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return { colour: best, dist: bestDist };
}

// ─── Style checks ────────────────────────────────────────────────────────────

/**
 * Checks for black outline pixels along the outermost opaque edge of the sprite.
 * A "good outline" means the first opaque pixel on each edge row/col is near-black.
 */
function checkOutline(pixels, width, height) {
  const stride = width * 4;
  let outlinePixels = 0;
  let darkPixels = 0;
  const DARKNESS_THRESHOLD = 60; // max channel value to be considered "black"

  // Sample left and right edges of every row
  for (let y = 0; y < height; y++) {
    for (let dir = 0; dir <= 1; dir++) {
      const x = dir === 0 ? 0 : width - 1;
      const i = y * stride + x * 4;
      const a = pixels[i + 3];
      if (a > 128) {
        outlinePixels++;
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        if (r < DARKNESS_THRESHOLD && g < DARKNESS_THRESHOLD && b < DARKNESS_THRESHOLD) {
          darkPixels++;
        }
      }
    }
  }

  if (outlinePixels === 0) return { ok: false, reason: 'no opaque edge pixels found' };
  const ratio = darkPixels / outlinePixels;
  return {
    ok: ratio >= 0.4,
    reason: ratio >= 0.4
      ? `${Math.round(ratio * 100)}% of edge pixels are dark (outline OK)`
      : `only ${Math.round(ratio * 100)}% of edge pixels are dark — outline may be missing or too thin`,
  };
}

/**
 * Checks whether the sprite contains at least some bright neon pixels
 * (high saturation, high brightness) — indicating glow is baked in.
 */
function checkGlow(pixels, width, height) {
  const stride = width * 4;
  const SAMPLE_STEP = 8; // check every 8th pixel for performance
  let neonCount = 0;
  let total = 0;

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const i = y * stride + x * 4;
      const a = pixels[i + 3];
      if (a < 64) continue; // skip transparent pixels
      total++;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const brightness = max / 255;
      if (saturation > 0.6 && brightness > 0.6) neonCount++;
    }
  }

  if (total === 0) return { ok: false, reason: 'no opaque pixels found' };
  const ratio = neonCount / total;
  return {
    ok: ratio >= 0.05,
    reason: ratio >= 0.05
      ? `${Math.round(ratio * 100)}% neon pixels — glow detected`
      : `only ${Math.round(ratio * 100)}% neon pixels — glow may be missing`,
  };
}

/**
 * Checks that the dominant colours match the Art Bible palette within tolerance.
 */
function checkPalette(pixels, width, height) {
  const stride = width * 4;
  const SAMPLE_STEP = 16;
  let offPalette = 0;
  let total = 0;

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const i = y * stride + x * 4;
      const a = pixels[i + 3];
      if (a < 128) continue;
      total++;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const { dist } = nearestPalette(r, g, b);
      if (dist > PALETTE_TOLERANCE) offPalette++;
    }
  }

  if (total === 0) return { ok: true, reason: 'no opaque pixels — skip' };
  const ratio = offPalette / total;
  return {
    ok: ratio <= 0.3,
    reason: ratio <= 0.3
      ? `${Math.round((1 - ratio) * 100)}% pixels match Art Bible palette`
      : `${Math.round(ratio * 100)}% pixels are off-palette — check Art Bible colours`,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function run() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`[checkStyle] Raw assets directory not found:\n  ${RAW_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(RAW_DIR).filter((f) => f.toLowerCase().endsWith('.png'));

  if (files.length === 0) {
    console.log('[checkStyle] No PNG files found — nothing to check.');
    return;
  }

  console.log(`[checkStyle] Checking ${files.length} PNG file(s) for style compliance...\n`);

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(RAW_DIR, file);
    console.log(`  📄 ${file}`);

    const img = decodePng(filePath);
    if (!img) {
      console.error(`     ✗ Could not decode PNG — skipping`);
      failed++;
      continue;
    }

    if (!img.pixels) {
      console.warn(`     ⚠ Colour type ${img.colourType} bit-depth ${img.bitDepth} — only RGBA 8-bit is fully checked`);
      console.warn(`     ⚠ Re-export as PNG-32 (RGBA) for full style validation`);
      continue;
    }

    const outline = checkOutline(img.pixels, img.width, img.height);
    const glow = checkGlow(img.pixels, img.width, img.height);
    const palette = checkPalette(img.pixels, img.width, img.height);

    const checks = [
      { name: 'Outline', ...outline },
      { name: 'Glow',    ...glow    },
      { name: 'Palette', ...palette },
    ];

    let filePassed = true;
    for (const c of checks) {
      const icon = c.ok ? '✓' : '✗';
      const log = c.ok ? console.log : console.error;
      log(`     ${icon} [${c.name}] ${c.reason}`);
      if (!c.ok) filePassed = false;
    }

    if (filePassed) { passed++; } else { failed++; }
    console.log('');
  }

  if (failed === 0) {
    console.log(`[checkStyle] ✅  All ${passed} asset(s) passed style checks.`);
  } else {
    console.error(`[checkStyle] ✗  ${failed} asset(s) failed style checks. Review errors above.`);
    process.exit(1);
  }
}

run();
