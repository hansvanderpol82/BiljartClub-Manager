const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  'alert("Er ging iets mis bij het activeren van push meldingen.");',
  'alert("Er ging iets mis bij het activeren van push meldingen: " + (e instanceof Error ? e.message : String(e)));'
);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
