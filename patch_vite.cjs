const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
code = code.replace(
  `src: '/favicon-192.png',
              sizes: '512x512',`,
  `src: '/favicon.png',
              sizes: '512x512',`
);
fs.writeFileSync('vite.config.ts', code);
