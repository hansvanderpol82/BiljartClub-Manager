const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The headers to hide: Inleg, Hoogste Serie, Gemiddelde
const brokenThRegex = /<th(\s+className="[^"]*)" hidden sm:table-cell([^>]*>\s*(?:Inleg|Hoogste Serie|Gemiddelde)\s*<\/th>)/g;
content = content.replace(brokenThRegex, '<th$1 hidden sm:table-cell"$2');

fs.writeFileSync('src/App.tsx', content);
console.log('done fixing headers');
