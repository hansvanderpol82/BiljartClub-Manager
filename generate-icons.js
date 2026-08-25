import sharp from 'sharp';
import fs from 'fs';
const svg = fs.readFileSync('public/icon.svg');
sharp(svg).resize(192, 192).toFile('public/icon-192.png');
sharp(svg).resize(512, 512).toFile('public/icon-512.png');
