const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Hide HS in internal match headers
content = content.replace(
  /<th\s+className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30"\s+title="Hoogste Serie"\s*>/g,
  '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">'
);

// Now for the TDs...
// The internal match `td`s have NO unique identifiers, they all share `className="py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30"`
// This is exactly why regex replacing them blindly won't work.
// I will use a stateful replacer that tracks the index within the row!
let tdCount = 0;
content = content.replace(/<td className="py-1 sm:py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30(?: hidden sm:table-cell)?">([\s\S]*?)<\/td>/g, (match, inner) => {
  // Let's first identify if this td is inside the internal match block.
  // Actually, wait, some external match tds use this same class?
  // External match uses:
  // Inleg: hidden sm:table-cell
  // But wait, I already replaced external match P1/P2 Name, P1/P2 Car, P1/P2 Pnt.
  // The remaining `td`s with exactly this class might be internal match ones OR remaining external ones.
  return match;
});

// Since doing it globally is dangerous, I will just apply grid to the internal match `tr` and give it 5 columns: Speler | Te Maken | Car | Pnt | Actie
// P1 row: Speler (col 1), Te Maken (col 2), Car (col 3), Pnt (col 4)
// P2 row: Speler (col 1), Te Maken (col 2), Car (col 3), Pnt (col 4)
// Actie: col 5, row-span-2

// I will just use a regex that matches the entire `tr` of the internal match and rebuilds its `td`s.
// Wait, rebuilding the `td`s means I have to match the complex JSX inside them (the buttons, etc).
