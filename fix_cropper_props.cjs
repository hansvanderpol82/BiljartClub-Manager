const fs = require('fs');
let content = fs.readFileSync('src/components/ImageCropperModal.tsx', 'utf-8');

// We need to add minZoom={0.2} and maxZoom={1.8} to <Cropper ... />
content = content.replace(
  /<Cropper restrictPosition=\{false\}/g,
  '<Cropper restrictPosition={false} minZoom={0.2} maxZoom={1.8}'
);

fs.writeFileSync('src/components/ImageCropperModal.tsx', content);
console.log('fixed cropper props');
