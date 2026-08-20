const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<td className="py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30">(\s*(?:<div|<button|{isClubAdmin)[\s\S]*?toggleExternalMatchPayment[\s\S]*?)<\/td>/g;
content = content.replace(regex, '<td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">$1</td>');

fs.writeFileSync('src/App.tsx', content);
console.log('done inleg fix');
