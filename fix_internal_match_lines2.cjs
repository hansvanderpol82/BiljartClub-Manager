const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const lines = content.split('\n');

let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Player 1 Details */}')) {
    startLine = i;
    break;
  }
}

if (startLine === -1) {
  console.log('not found');
  process.exit(1);
}

let tdIndex = 0;
for (let i = startLine; i < startLine + 350; i++) {
  if (lines[i].includes('<td ')) {
    tdIndex++;
    // Note: Since I am searching AFTER `{/* Player 1 Details */}`, the 1st td is P1 Name.
    if (tdIndex === 2) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    if (tdIndex === 4) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    if (tdIndex === 5) {
      lines[i] = lines[i].replace('className="', 'className="col-start-2 row-start-1 ');
    }
    if (tdIndex === 6) {
      lines[i] = lines[i].replace('className="', 'className="col-start-3 row-start-1 ');
    }
    if (tdIndex === 7) {
      lines[i] = lines[i].replace('className="', 'className="col-start-4 row-start-1 ');
    }
    if (tdIndex === 8) {
      lines[i] = lines[i].replace('className="', 'className="col-start-4 row-start-2 ');
    }
    if (tdIndex === 9) {
      lines[i] = lines[i].replace('className="', 'className="col-start-3 row-start-2 ');
    }
    if (tdIndex === 10) {
      lines[i] = lines[i].replace('className="', 'className="col-start-2 row-start-2 ');
    }
    if (tdIndex === 11) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    if (tdIndex === 13) {
      lines[i] = lines[i].replace('className="', 'className="hidden sm:table-cell ');
    }
    if (tdIndex === 15) {
      lines[i] = lines[i].replace('className="', 'className="col-start-5 row-start-1 row-span-2 flex flex-col justify-center ');
      break; 
    }
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('internal match tds fixed');
