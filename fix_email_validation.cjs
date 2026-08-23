const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `                  disabled={!newMemberName || !newMemberEmail}`;
const repStr = `                  disabled={!newMemberName || !newMemberEmail || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(newMemberEmail)}`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Updated email validation");
