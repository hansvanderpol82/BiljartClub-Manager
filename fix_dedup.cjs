const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startStr = '// DATA MIGRATION & DEDUPLICATION';
const endStr = '// ---------------------------------------------------------';

let lines = content.split('\n');
let newLines = [];
let inBlock = false;
let blockCount = 0;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startStr)) {
        inBlock = true;
        // Also remove the previous line if it is the start of the block '          // --------...'
        if (newLines.length > 0 && newLines[newLines.length - 1].includes('// -------')) {
            newLines.pop();
        }
        continue;
    }
    
    if (inBlock) {
        if (lines[i].includes(endStr)) {
            inBlock = false;
        }
        continue;
    }
    
    newLines.push(lines[i]);
}

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
console.log("Removed deduplication block");
