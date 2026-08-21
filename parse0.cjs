const fs = require('fs');
let block = fs.readFileSync('tr2_block.txt', 'utf-8');
const trStart = block.indexOf('<tr');
let currentIndex = trStart;
let count = 0;
while (true) {
  const start = block.indexOf('<td', currentIndex);
  if (start === -1) break;
  const end = block.indexOf('</td>', start) + 5;
  if (count === 0) {
    console.log(block.slice(start, end));
  }
  currentIndex = end;
  count++;
}
