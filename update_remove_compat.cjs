const fs = require('fs');
let content = fs.readFileSync('src/components/ExcelModule.tsx', 'utf8');

const regex = /\/\/ Backwards compatibility with old template[\s\S]*?p2BeurtCount = parseInt\(w\["Beurten 2"\]\) \|\| sBeurten;\n\s*\}/;

content = content.replace(regex, '');
fs.writeFileSync('src/components/ExcelModule.tsx', content);
console.log("Removed backwards compatibility");
