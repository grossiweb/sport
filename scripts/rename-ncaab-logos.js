// Batch-rename all PNG logos in public/ncaab to the pattern: ncaab-[id].png
// Usage (from project root):
//   node scripts/rename-ncaab-logos.js

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'public', 'ncaab');

if (!fs.existsSync(logosDir)) {
  console.error(`\n[rename-ncaab-logos] Directory not found: ${logosDir}\n`);
  process.exit(1);
}

const files = fs.readdirSync(logosDir);
const pngFiles = files.filter((f) => f.toLowerCase().endsWith('.png'));

if (!pngFiles.length) {
  console.log('[rename-ncaab-logos] No .png files found in public/ncaab');
  process.exit(0);
}

console.log(`[rename-ncaab-logos] Found ${pngFiles.length} PNG files. Renaming...`);

for (const file of pngFiles) {
  const oldPath = path.join(logosDir, file);
  const base = file.replace(/\.png$/i, '');

  // If it is already in the desired format, skip
  if (/^ncaab-\w+$/i.test(base)) {
    console.log(`  • Skipping (already named): ${file}`);
    continue;
  }

  // Try to use trailing numeric ID if present; otherwise use full base name
  const idMatch = base.match(/(\d+)$/);
  const id = idMatch ? idMatch[1] : base;

  const newName = `ncaab-${id}.png`;
  const newPath = path.join(logosDir, newName);

  if (fs.existsSync(newPath)) {
    console.warn(`  ! Skipping ${file} -> ${newName} (target already exists)`);
    continue;
  }

  try {
    fs.renameSync(oldPath, newPath);
    console.log(`  ✓ ${file} -> ${newName}`);
  } catch (err) {
    console.error(`  ✗ Failed to rename ${file}:`, err.message);
  }
}

console.log('\n[rename-ncaab-logos] Done.');


