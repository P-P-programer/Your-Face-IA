//Arhcivo para generar los iconos a partir de un SVG usando Sharp

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SVG de tu logo
const svgLogo = `
<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#0b1220" rx="45"/>
  <circle cx="96" cy="96" r="50" fill="#10b981"/>
  <path d="M96 60V132M60 96H132" stroke="#0b1220" stroke-width="8" stroke-linecap="round"/>
</svg>
`;

const outputDir = path.join(__dirname, '../public');

// Asegúrate que exista la carpeta
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar icon-192.png
sharp(Buffer.from(svgLogo))
  .resize(192, 192)
  .png()
  .toFile(path.join(outputDir, 'icon-192.png'))
  .then(() => console.log('✓ icon-192.png generado'))
  .catch(err => console.error('Error:', err));

// Generar icon-512.png
sharp(Buffer.from(svgLogo))
  .resize(512, 512)
  .png()
  .toFile(path.join(outputDir, 'icon-512.png'))
  .then(() => console.log('✓ icon-512.png generado'))
  .catch(err => console.error('Error:', err));