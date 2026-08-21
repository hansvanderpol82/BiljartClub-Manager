const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove the "Actie" column from theader
content = content.replace(
  /<th className="py-2 sm:py-4 px-2 sm:px-4 text-center exclude-from-share">\s*Actie\s*<\/th>/,
  ''
);

// 2. Set width on Caramboles & Punten headers
content = content.replace(
  /<th className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30">\s*Caramboles\s*<\/th>/g,
  '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">\n                                          Caramboles\n                                        </th>'
);
content = content.replace(
  /<th className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30 bg-black\/20">\s*Punten\s*<\/th>/g,
  '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]">\n                                          Punten\n                                        </th>'
);

// 3. Update the <tr> definition
content = content.replace(
  /<tr key=\{game\.id\} className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0 grid grid-cols-\[1fr_auto_auto_auto\] sm:table-row"\s*>/g,
  `<tr key={game.id} onClick={() => { if (isFinished) setLiveMatchId(game.id); }} className={cn("transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_72px_72px] sm:table-row", isFinished ? "cursor-pointer hover:bg-white/10" : "hover:bg-white/5")}>`
);

// 4. Update the <td> elements for grid placements

// Speler (Thuis) - ALREADY HAS `col-start-1 row-start-1` but let's make sure it resets on sm
content = content.replace(
  /<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-\[#2b6e2b\]\/30 text-left col-start-1 row-start-1">/g,
  '<td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-[#2b6e2b]/30 text-left col-start-1 row-start-1 sm:col-auto sm:row-auto">'
);

// Caramboles (Thuis) 
content = content.replace(
  /<td className="relative py-1 sm:py-2 px-2 text-center border-r border-\[#2b6e2b\]\/30 overflow-hidden">/g,
  '<td className="relative py-1 sm:py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden col-start-2 row-start-1 sm:col-auto sm:row-auto">'
);

// Punten (Thuis)
// Note: It's the first bg-black/20 td. I need to be careful with replace, there are two!
// I'll replace all matching first, then undo for the others if needed, or better use regex step by step.
fs.writeFileSync('src/App.tsx', content);
