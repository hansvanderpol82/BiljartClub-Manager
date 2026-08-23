const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const targetStr = `onChange={(e) => setEmail(e.target.value)}`;
const repStr = `onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/components/Login.tsx', content);
console.log("Updated Login.tsx");
