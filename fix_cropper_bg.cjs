const fs = require('fs');
let content = fs.readFileSync('src/components/ImageCropperModal.tsx', 'utf-8');

// We want to fill the canvas with white before drawing, just in case they zoom out and leave empty space.
// Wait, for logos, transparency might be desired. If they save as PNG, transparency is preserved.
// Let's check how it's saved.
content = content.replace(
  "return canvas.toDataURL('image/jpeg', 0.8);",
  "return canvas.toDataURL('image/png');"
);

// If they save as PNG, transparent pixels remain transparent.
fs.writeFileSync('src/components/ImageCropperModal.tsx', content);
console.log('fixed cropper export');
