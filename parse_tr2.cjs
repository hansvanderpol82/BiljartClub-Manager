const fs = require('fs');
const content = fs.readFileSync('tr2_block.txt', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<td')) {
     console.log(`Line ${i}: ${lines[i].trim().slice(0, 100)}`);
  }
}
