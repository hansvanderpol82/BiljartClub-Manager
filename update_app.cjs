const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const oldBlock = fs.readFileSync('tr2_block.txt', 'utf-8');
const newBlock = fs.readFileSync('tr2_block_fixed.txt', 'utf-8');

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log("Successfully replaced block.");
} else {
  console.log("Error: oldBlock not found in App.tsx!");
}

fs.writeFileSync('src/App.tsx', content);
