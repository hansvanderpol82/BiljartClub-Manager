const sharp = require('sharp');
sharp('public/favicon.png')
  .resize(192, 192)
  .toFile('public/favicon-192.png')
  .then(() => console.log('Resized to 192x192'))
  .catch(err => console.error(err));
