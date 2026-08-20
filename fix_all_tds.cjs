const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We have 3 tables:
// Table 1 (extMatch in matches): line ~7200
// Table 2 (extMatch in extMatches): line ~9560
// Table 3 (internal match): line ~10670

// -----------------------------------------
// Fix External Matches (Table 1 and 2)
// -----------------------------------------
// To target the exact td elements, let's look at the class patterns.

// P1 Name
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-\[#2b6e2b\]\/30 text-left">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-[#2b6e2b]/30 text-left col-start-1 row-start-1">'
);

// P2 Name
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 text-right border-r border-\[#2b6e2b\]\/30">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 text-left sm:text-right border-r border-[#2b6e2b]/30 col-start-1 row-start-2">'
);

// P1/P2 Caramboles
// There are multiple `<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden">`
let carambolesCount = 0;
content = content.replace(/<td className="relative py-1 sm:py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30 overflow-hidden">/g, (match) => {
  carambolesCount++;
  // Every match row has 2 of these (P1 and P2).
  // Table 1 has them, Table 2 has them.
  // We can just alternate.
  const isP1 = carambolesCount % 2 !== 0;
  if (isP1) {
    return '<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden col-start-2 row-start-1">';
  } else {
    return '<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden col-start-2 row-start-2">';
  }
});

// P1/P2 Punten
// `<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black\/20 overflow-hidden">`
let puntenCount = 0;
content = content.replace(/<td className="relative py-1 sm:py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30 bg-black\/20 overflow-hidden">/g, (match) => {
  puntenCount++;
  const isP1 = puntenCount % 2 !== 0;
  if (isP1) {
    return '<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 overflow-hidden col-start-3 row-start-1">';
  } else {
    // Note: in extMatch, P2 Punten comes BEFORE P2 Caramboles in DOM order!
    return '<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 overflow-hidden col-start-3 row-start-2">';
  }
});

// Action button
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 text-center exclude-from-share">/g,
  '<td className="py-1 sm:py-2 px-2 text-center exclude-from-share col-start-4 row-start-1 row-span-2 flex flex-col justify-center">'
);

// -----------------------------------------
// Fix Internal Match (Table 3)
// -----------------------------------------
// P2 Name for internal match
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-\[#2b6e2b\]\/30 text-right">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 text-left sm:text-right border-r border-[#2b6e2b]/30 col-start-1 row-start-2">'
);

// The internal match `td` elements for HS, Te Maken, Car:
// `<td className="py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30">`
// Wait! There are 6 of these per internal match row!
// 1. P1 HS
// 2. P1 Te Maken
// 3. P1 Car
// 4. P2 Car
// 5. P2 Te Maken
// 6. P2 HS
// AND there is the Action button? (Wait, action button is `<td className="py-1 sm:py-2 px-2 text-center exclude-from-share">` which we already covered).
// AND there are Inleg buttons? Inleg is `<td className="py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30">`?
// Let's verify how many per row!
