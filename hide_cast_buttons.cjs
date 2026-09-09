const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard cast buttons
content = content.replace(
  /className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg active:scale-95"\s*>\s*<Tv size={18} \/>\s*<span className="hidden sm:inline">Cast Menu<\/span>/g,
  'className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg active:scale-95"\\n                  >\\n                    <Tv size={18} />\\n                    <span>Cast Menu</span>'
);

content = content.replace(
  /className="flex items-center gap-1\.5 px-3 py-1\.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold"\s*title="Cast Menu"\s*>\s*<Tv size={16} \/>\s*<span className="hidden sm:inline">Cast Menu<\/span>/g,
  'className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold"\\n                  title="Cast Menu"\\n                >\\n                  <Tv size={16} />\\n                  <span>Cast Menu</span>'
);

// Replace dropdown items
content = content.replace(
  /className="px-2 sm:px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"\s*>\s*Cast Menu/g,
  'className="hidden sm:block px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"\\n                                        >\\n                                          Cast Menu'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced");
