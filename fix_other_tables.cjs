const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Members Table (line 6736) - hide Email and Start Gemiddelde
content = content.replace(
  /<th className="py-2 sm:py-4 text-left">Email<\/th>/g,
  '<th className="py-2 sm:py-4 text-left hidden sm:table-cell">Email</th>'
);
content = content.replace(
  /<th className="py-2 sm:py-4 text-left">Start Gemiddelde<\/th>/g,
  '<th className="py-2 sm:py-4 text-left hidden sm:table-cell">Start Gemiddelde</th>'
);

// We need to also add `hidden sm:table-cell` to the `td`s in the Members table.
// The `td`s are:
// <td className="py-4 text-slate-500 dark:text-slate-400">{member?.email || "-"}</td>
// <td className="py-4 text-slate-500 dark:text-slate-400">{member?.baseAverage || 0}</td>
content = content.replace(
  /<td className="py-4 text-slate-500 dark:text-slate-400">\{member\?\.email \|\| "-"}<\/td>/g,
  '<td className="py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{member?.email || "-"}</td>'
);
content = content.replace(
  /<td className="py-4 text-slate-500 dark:text-slate-400">\{member\?\.baseAverage \|\| 0\}<\/td>/g,
  '<td className="py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{member?.baseAverage || 0}</td>'
);

// Payments table (line 12548)
// Hide Gebruiker (Admin)
content = content.replace(
  /<th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400">Gebruiker \(Admin\)<\/th>/g,
  '<th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">Gebruiker (Admin)</th>'
);

// The td for User is: <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400">{user?.name || "Onbekend"}</td>
content = content.replace(
  /<td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400">\{user\?\.name \|\| "Onbekend"\}<\/td>/g,
  '<td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{user?.name || "Onbekend"}</td>'
);

fs.writeFileSync('src/App.tsx', content);
console.log('fixed other tables');
