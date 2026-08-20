const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex1 = /<td className="py-1 sm:py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30">(\s*<button[^>]*title=\{p1Absent \? "Afwezig" : "Aanwezig"\})/g;
content = content.replace(regex1, '<td className="py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">$1');

const regex2 = /<td className="py-1 sm:py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30">(\s*<button[^>]*title=\{p2Absent \? "Afwezig" : "Aanwezig"\})/g;
content = content.replace(regex2, '<td className="py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">$1');

fs.writeFileSync('src/App.tsx', content);
console.log('done aanw td fix');
