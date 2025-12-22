// Simple one-off utility to convert all SVG logos in public/ncaab to PNG
// Usage (from project root):
//   1) npm install sharp --save-dev
//   2) node scripts/convert-ncaab-svgs-to-png.js

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error(
    '\n[convert-ncaab-svgs-to-png] Missing dependency: sharp.\n' +
      'Install it first with:\n' +
      '  npm install sharp --save-dev\n'
  );
  process.exit(1);
}

const logosDir = path.join(__dirname, '..', 'public', 'ncaab');

if (!fs.existsSync(logosDir)) {
  console.error(`\n[convert-ncaab-svgs-to-png] Directory not found: ${logosDir}\n`);
  process.exit(1);
}

async function convertAll() {
  const files = fs.readdirSync(logosDir);
  const svgFiles = files.filter((f) => f.toLowerCase().endsWith('.svg'));

  if (!svgFiles.length) {
    console.log('[convert-ncaab-svgs-to-png] No .svg files found in public/ncaab');
    return;
  }

  console.log(`[convert-ncaab-svgs-to-png] Found ${svgFiles.length} SVG files. Converting to PNG...`);

  for (const file of svgFiles) {
    const inputPath = path.join(logosDir, file);
    const outputPath = path.join(
      logosDir,
      file.replace(/\.svg$/i, '.png')
    );

    try {
      await sharp(inputPath)
        .png({ quality: 90 })
        .toFile(outputPath);

      console.log(`  ✓ ${file} -> ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`  ✗ Failed to convert ${file}:`, err.message);
    }
  }

  console.log('\n[convert-ncaab-svgs-to-png] Done.');
}

convertAll().catch((err) => {
  console.error('[convert-ncaab-svgs-to-png] Unexpected error:', err);
  process.exit(1);
});


