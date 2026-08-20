const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// For the 3 tables, let's inject grid classes into the tr elements.
// External Match `tr`:
// <tr key={game.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0">
// Replace with:
// <tr key={game.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto] sm:table-row">
content = content.replace(
  /<tr\s+key=\{game\.id\}\s+className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0"/g,
  '<tr key={game.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto] sm:table-row"'
);

// What about internal match? 
// <tr key={match.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0">
content = content.replace(
  /<tr\s+key=\{match\.id\}\s+className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0"/g,
  '<tr key={match.id} className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto_auto_auto] sm:table-row"'
);

// Now for the Theads:
// <thead className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
// Wait, the tr inside the thead has these classes. 
content = content.replace(
  /<thead>\s*<tr className="bg-\[#163a16\] text-\[#f1c40f\] text-\[10px\] sm:text-xs font-black uppercase tracking-widest border-b border-\[#2b6e2b\]">/g,
  '<thead className="hidden sm:table-header-group">\n<tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">'
);

// Tbody block
content = content.replace(
  /<tbody>\s*\{\(\(\) => \{/g,
  '<tbody className="block sm:table-row-group">\n{(() => {'
);
content = content.replace(
  /<tbody>\s*\{\[\.\.\.matches\]/g,
  '<tbody className="block sm:table-row-group">\n{[...matches]'
);

fs.writeFileSync('src/App.tsx', content);
console.log('done grid setup');
