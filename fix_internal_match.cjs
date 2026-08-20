const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Hide HS in headers
content = content.replace(
  /<th\s+className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30"\s+title="Hoogste Serie"\s*>/g,
  '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">'
);

// We need to inject `hidden sm:table-cell` into the 4th and 11th `td` of the internal match row (the HS columns).
// Since doing this globally is tough, let's locate the internal match render block.
// It starts around "match.scoringSystem" and "Speler (Wit)".
// Let's use a regex to find the internal match `tr`:
// <tr key={match.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto_auto_auto] sm:table-row">
// Wait, I didn't change the internal match `tr` class to `grid-cols-5` yet. Let me do that properly.

// First, restore the original `tr` class just in case my previous scripts messed it up.
content = content.replace(
  /<tr\s+key=\{match\.id\}\s+className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0[^"]*"/g,
  '<tr key={match.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto_auto] sm:table-row"'
);

// P1 Name
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-\[#2b6e2b\]\/30 text-left(?: col-start-1 row-start-1)?">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-[#2b6e2b]/30 text-left col-start-1 row-start-1">'
);

// P2 Name
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 text-left sm:text-right border-r border-\[#2b6e2b\]\/30 col-start-1 row-start-2">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 text-left sm:text-right border-r border-[#2b6e2b]/30 col-start-1 row-start-2">'
);
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-\[#2b6e2b\]\/30 text-right">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 text-left sm:text-right border-r border-[#2b6e2b]/30 col-start-1 row-start-2">'
);

// For Te Maken and Caramboles, they share the exact same class `py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30`
// This class is also used for Inleg (hidden) and Aanw (hidden) and HS!
// Let's replace ALL of them by counting their occurrence inside the mapped function.
// Actually, it's easier to find them by their surrounding context, but there are multiple.

fs.writeFileSync('src/App.tsx', content);
console.log('internal match fixed part 1');
