const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  /label="Beheren"/g,
  'label="Gebruikersinstellingen"'
);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
