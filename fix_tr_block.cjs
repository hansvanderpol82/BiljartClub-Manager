const fs = require('fs');
let block = fs.readFileSync('tr_block.txt', 'utf-8');

// 1. Update the opening <tr>
block = block.replace(
  /<tr key=\{game\.id\} className={cn\("transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0 grid grid-cols-\[1fr_72px_72px\] sm:table-row", isFinished \? "cursor-pointer hover:bg-white\/10" : "hover:bg-white\/5"\)}>/,
  '<tr key={game.id} onClick={() => { if (isFinished) setLiveMatchId(game.id); }} className={cn("transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_72px_72px] sm:table-row", isFinished ? "cursor-pointer hover:bg-white/10" : "hover:bg-white/5")}>'
);

// If it was already replaced:
block = block.replace(
  /<tr key=\{game\.id\} className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0 grid grid-cols-\[1fr_auto_auto_auto\] sm:table-row"\s*>/,
  '<tr key={game.id} onClick={() => { if (isFinished) setLiveMatchId(game.id); }} className={cn("transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_72px_72px] sm:table-row", isFinished ? "cursor-pointer hover:bg-white/10" : "hover:bg-white/5")}>'
);

// We need to add placement classes to the TDs. Let's find the TDs by their content.
// There are exactly 13 TDs in this block.
let tds = [];
let currentIndex = 0;
while (true) {
  const start = block.indexOf('<td', currentIndex);
  if (start === -1) break;
  const end = block.indexOf('</td>', start) + 5;
  tds.push({ start, end, content: block.slice(start, end) });
  currentIndex = end;
}

// td[0] = Speler Thuis
// td[4] = Caramboles Thuis
// td[5] = Punten Thuis
// td[6] = Punten Uit
// td[7] = Caramboles Uit
// td[11] = Speler Uit
// td[12] = Actie

const addClass = (html, cls) => html.replace(/<td className="/, `<td className="${cls} `);

tds[0].newContent = addClass(tds[0].content, 'col-start-1 row-start-1 sm:col-auto sm:row-auto');
tds[4].newContent = addClass(tds[4].content, 'col-start-2 row-start-1 sm:col-auto sm:row-auto');
tds[5].newContent = addClass(tds[5].content, 'col-start-3 row-start-1 sm:col-auto sm:row-auto');
tds[6].newContent = addClass(tds[6].content, 'col-start-3 row-start-2 sm:col-auto sm:row-auto');
tds[7].newContent = addClass(tds[7].content, 'col-start-2 row-start-2 sm:col-auto sm:row-auto');
tds[11].newContent = addClass(tds[11].content, 'col-start-1 row-start-2 sm:col-auto sm:row-auto');
// Remove td[12] completely (Actie)
tds[12].newContent = '';

// Reassemble the block from the back to preserve indices
for (let i = 12; i >= 0; i--) {
  if (tds[i].newContent !== undefined) {
    block = block.slice(0, tds[i].start) + tds[i].newContent + block.slice(tds[i].end);
  }
}

fs.writeFileSync('tr_block_fixed.txt', block);
