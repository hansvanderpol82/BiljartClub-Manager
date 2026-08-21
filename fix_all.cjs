const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Fix Table 1's Speler header which got hidden:
content = content.replace(
  '<th className="hidden sm:table-cell py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">\n                                          <span className="sm:hidden">Speler</span><span className="hidden sm:inline">Speler (Thuis)</span>',
  '<th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">\n                                          <span className="sm:hidden">Speler</span><span className="hidden sm:inline">Speler (Thuis)</span>'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
