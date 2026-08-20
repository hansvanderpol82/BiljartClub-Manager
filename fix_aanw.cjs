const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The headers to hide: Aanw.
const thRegex = /<th(\s+className="[^"]*)"([^>]*>\s*(?:Aanw\.)\s*<\/th>)/g;
content = content.replace(thRegex, '<th$1 hidden sm:table-cell"$2');

fs.writeFileSync('src/App.tsx', content);
console.log('done aanw headers');
