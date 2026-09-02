const fs = require('fs');
let content = fs.readFileSync('src/components/ExcelModule.tsx', 'utf8');
content = content.replace(/^`/gm, '');
fs.writeFileSync('src/components/ExcelModule.tsx', content);
