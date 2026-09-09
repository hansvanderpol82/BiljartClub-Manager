const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  'if (numMembers === 0 || currentUser?.role === "applicatiebeheerder") {',
  'if (numMembers === 0 || currentUser?.role === "applicatiebeheerder" || currentUser?.role === "admin") {'
);
fs.writeFileSync('src/App.tsx', content);
console.log("Patched createSeason");
