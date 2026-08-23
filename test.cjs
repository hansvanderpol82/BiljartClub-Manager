const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');
const start = lines.findIndex(l => l.includes('liveMatch && !isCastMode && ('));
console.log(`Live view start line: ${start}`);
