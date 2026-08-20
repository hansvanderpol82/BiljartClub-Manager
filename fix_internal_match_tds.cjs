const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the block corresponding to the internal match tr
const startStr = '<tr key={match.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto_auto] sm:table-row">';
const startIdx = content.indexOf(startStr);
if (startIdx === -1) {
  console.log('tr not found');
  process.exit(1);
}

const endStr = '</tr>';
let trEndIdx = content.indexOf(endStr, startIdx);

// The `tr` is quite long, so we just extract it.
// Actually, it contains nested elements. We should just find all `<td className="py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30">` inside this block.
let block = content.substring(startIdx, trEndIdx + 5);

// The `td` sequence inside the row for identical classes:
// 1. Inleg (hidden) -> wait, is it hidden? Let's check `App.tsx`
// I'll print the `td`s found in this block first.
const tds = [...block.matchAll(/<td[^>]*>/g)];
tds.forEach((t, i) => console.log(i, t[0]));

