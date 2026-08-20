const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = content.indexOf('key={match.id}');
// Wait, we need the one around line 10847.
const startStr = '{/* Player 1 Details */}';
const targetStart = content.indexOf(startStr);
const endStr = '{/* Player 2 Name */}';
const targetEnd = content.indexOf(endStr, targetStart);

const block = content.substring(targetStart, targetEnd + 500); // include P2 name and action
const tds = [...block.matchAll(/<td[^>]*>/g)];
tds.forEach((t, i) => console.log(i, t[0]));
