const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"',
  'className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"'
);
content = content.replace(
  '<span>Nieuw Lid Toevoegen</span>',
  '<span className="hidden sm:inline">Nieuw Lid</span>'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched mobile Nieuw Lid button again");
