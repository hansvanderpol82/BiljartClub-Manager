const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. P1 Name
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-\[#2b6e2b\]\/30 text-left">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-[#2b6e2b]/30 text-left col-start-1 row-start-1">'
);

// 2. P1 Caramboles (Wait, there are two Caramboles columns without specific identifiers except their order).
// The first one is P1, the second is P2.
// Let's replace P1 Caramboles:
// <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden">
// Wait, I already changed py-2 to py-1 sm:py-2 in the previous step? Let's check!
