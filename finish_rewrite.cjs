const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const oldBlock = fs.readFileSync('tr_block.txt', 'utf-8');
const newBlock = fs.readFileSync('tr_block_fixed.txt', 'utf-8');

// Replace the tr block
if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
} else {
  console.log('Error: Could not find old block in App.tsx');
}

// Remove the Actie column header
content = content.replace(
  /<th className="py-2 sm:py-4 px-2 sm:px-4 text-center exclude-from-share">\s*Actie\s*<\/th>/,
  ''
);

// Add width to Caramboles and Punten columns
content = content.replace(
  /<th className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30">\s*Caramboles\s*<\/th>/g,
  '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">\n                                          Caramboles\n                                        </th>'
);
content = content.replace(
  /<th className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30 bg-black\/20">\s*Punten\s*<\/th>/g,
  '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]">\n                                          Punten\n                                        </th>'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Success');
