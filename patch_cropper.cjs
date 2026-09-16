const fs = require('fs');
let content = fs.readFileSync('src/components/ImageCropperModal.tsx', 'utf8');

const search = `  const MAX_DIMENSION = 400;
  let finalWidth = pixelCrop.width;
  let finalHeight = pixelCrop.height;

  if (finalWidth > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / finalWidth;
    finalWidth = MAX_DIMENSION;
    finalHeight *= scale;
  }

  canvas.width = finalWidth;
  canvas.height = finalHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    finalWidth,
    finalHeight
  );

  return canvas.toDataURL('image/png');`;

const replace = `  const MAX_DIMENSION = 250;
  let finalWidth = pixelCrop.width;
  let finalHeight = pixelCrop.height;

  if (finalWidth > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / finalWidth;
    finalWidth = MAX_DIMENSION;
    finalHeight *= scale;
  }

  canvas.width = finalWidth;
  canvas.height = finalHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    finalWidth,
    finalHeight
  );

  return canvas.toDataURL('image/webp', 0.8);`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/components/ImageCropperModal.tsx', content);
  console.log("Patched ImageCropperModal.tsx");
} else {
  console.log("Could not find the target string");
}
