const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const lines = content.split('\n');

// Find the start line for the internal match
let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('key={match.id}') && lines[i].includes('sm:table-row')) {
    startLine = i;
    break;
  }
}

if (startLine === -1) {
  console.log('tr not found');
  process.exit(1);
}

// Now find all `<td` in the following 350 lines.
let tdIndex = 0;
for (let i = startLine; i < startLine + 350; i++) {
  if (lines[i].includes('<td ')) {
    tdIndex++;
    // 2: P1 Inleg -> hide
    if (tdIndex === 2) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    // 4: P1 HS -> hide
    if (tdIndex === 4) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    // 5: P1 Te Maken -> col-start-2 row-start-1
    if (tdIndex === 5) {
      lines[i] = lines[i].replace('className="', 'className="col-start-2 row-start-1 ');
    }
    // 6: P1 Car -> col-start-3 row-start-1
    if (tdIndex === 6) {
      lines[i] = lines[i].replace('className="', 'className="col-start-3 row-start-1 ');
    }
    // 7: P1 Pnt -> col-start-4 row-start-1
    if (tdIndex === 7) {
      lines[i] = lines[i].replace('className="', 'className="col-start-4 row-start-1 ');
    }
    // 8: P2 Pnt -> col-start-4 row-start-2
    if (tdIndex === 8) {
      lines[i] = lines[i].replace('className="', 'className="col-start-4 row-start-2 ');
    }
    // 9: P2 Car -> col-start-3 row-start-2
    if (tdIndex === 9) {
      lines[i] = lines[i].replace('className="', 'className="col-start-3 row-start-2 ');
    }
    // 10: P2 Te Maken -> col-start-2 row-start-2
    if (tdIndex === 10) {
      lines[i] = lines[i].replace('className="', 'className="col-start-2 row-start-2 ');
    }
    // 11: P2 HS -> hide
    if (tdIndex === 11) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    // 13: P2 Inleg -> hide
    if (tdIndex === 13) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    // 15: Actie -> col-start-5 row-start-1 row-span-2 flex flex-col justify-center
    if (tdIndex === 15) {
      lines[i] = lines[i].replace('className="', 'className="col-start-5 row-start-1 row-span-2 flex flex-col justify-center ');
      break; // done with this row!
    }
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('internal match tds fixed');
