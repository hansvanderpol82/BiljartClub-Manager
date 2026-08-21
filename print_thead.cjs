const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const startIndex = content.indexOf('<table className="w-full border-collapse">', 9000);
const endIndex = content.indexOf('</thead>', startIndex);
console.log(content.substring(startIndex, endIndex));
