const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/navigator\.presentation/g, '(navigator as any).presentation');

fs.writeFileSync('src/App.tsx', content);
console.log('done ts fix');
