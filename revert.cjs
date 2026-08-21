const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The best way is to fetch the original content if possible. Did I break it irreversibly? No, I can fix it.
content = content.replace(/col-start-2 row-start-1 sm:col-auto sm:row-auto/g, '');
content = content.replace(/col-start-1 row-start-1 sm:col-auto sm:row-auto/g, 'col-start-1 row-start-1');

fs.writeFileSync('src/App.tsx', content);
