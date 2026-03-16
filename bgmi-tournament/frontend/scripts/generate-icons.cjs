const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Regular icon — solid dark bg, logo centered
const svgIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="36" fill="#0f0f17"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  <path d="M100 22 L158 48 L158 108 C158 142 132 168 100 182 C68 168 42 142 42 108 L42 48 Z" fill="#1a1a2e" stroke="url(#g)" stroke-width="4"/>
  <circle cx="100" cy="104" r="28" fill="none" stroke="url(#g)" stroke-width="4"/>
  <circle cx="100" cy="104" r="6" fill="url(#g)"/>
  <line x1="100" y1="62" x2="100" y2="80" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
  <line x1="100" y1="128" x2="100" y2="146" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
  <line x1="58" y1="104" x2="76" y2="104" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
  <line x1="124" y1="104" x2="142" y2="104" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
</svg>`;

// Maskable icon — solid bg, logo scaled smaller to fit safe zone (center 80%)
const svgMaskable = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#0f0f17"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  <!-- Scaled to 70% and centered for maskable safe zone -->
  <g transform="translate(30, 30) scale(0.7)">
    <path d="M100 22 L158 48 L158 108 C158 142 132 168 100 182 C68 168 42 142 42 108 L42 48 Z" fill="#1a1a2e" stroke="url(#g)" stroke-width="5"/>
    <circle cx="100" cy="104" r="28" fill="none" stroke="url(#g)" stroke-width="5"/>
    <circle cx="100" cy="104" r="7" fill="url(#g)"/>
    <line x1="100" y1="62" x2="100" y2="80" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="100" y1="128" x2="100" y2="146" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="58" y1="104" x2="76" y2="104" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="124" y1="104" x2="142" y2="104" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`;

async function generate() {
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon(size)))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }
  // Maskable versions for 192 and 512
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svgMaskable(size)))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}-maskable.png`));
    console.log(`✓ icon-${size}-maskable.png`);
  }
  console.log('\nAll icons generated!');
}

generate().catch(console.error);
