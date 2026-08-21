const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<tr key={game.id}')) {
    for (let j = i; j < i + 350; j++) {
      if (lines[j].includes('</tr>')) {
        console.log(`Found </tr> at ${j}`);
        break;
      }
      if (lines[j].includes('<td ')) {
        console.log(`Line ${j}: ${lines[j].trim()}`);
      }
    }
    break;
  }
}
