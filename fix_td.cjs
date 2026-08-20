const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Hide Hoogste Serie cells
content = content.replace(/<td className="relative py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30 overflow-hidden text-white\/50">/g, '<td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-white/50 hidden sm:table-cell">');

// Hide Gemiddelde cells
content = content.replace(/<td className="relative py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30 overflow-hidden text-\[#f1c40f\]">/g, '<td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-[#f1c40f] hidden sm:table-cell">');

fs.writeFileSync('src/App.tsx', content);
console.log('done td fix');
