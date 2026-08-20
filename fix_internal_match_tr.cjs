const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The `tr` has className={cn("hover:...", isMatchBlocked..., isCancelled...)}
// Let's add the grid classes to the first string.
content = content.replace(
  /"hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0"/g,
  '"hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_auto_auto_auto_auto] sm:table-row"'
);
fs.writeFileSync('src/App.tsx', content);
console.log('tr class updated');
