const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/col-start-1 row-start-1 sm:col-auto sm:row-auto (.*?) col-start-1 row-start-1/g, 'col-start-1 row-start-1 sm:col-auto sm:row-auto $1');
content = content.replace(/col-start-1 row-start-2 sm:col-auto sm:row-auto (.*?) col-start-1 row-start-2/g, 'col-start-1 row-start-2 sm:col-auto sm:row-auto $1');
fs.writeFileSync('src/App.tsx', content);
