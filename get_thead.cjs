const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');
let inThead = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<thead className="hidden sm:table-header-group">')) {
    inThead = true;
  }
  if (inThead) {
    console.log(lines[i]);
    if (lines[i].includes('</thead>')) break;
  }
}
