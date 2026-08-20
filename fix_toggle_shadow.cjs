const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  '"inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform",',
  '"inline-block h-4 w-4 transform rounded-full bg-white transition-transform",'
);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
