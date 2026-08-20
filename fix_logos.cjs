const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// activeClub?.logo
content = content.replace(
  /className="h-8 w-8 rounded-lg object-contain shrink-0"/g,
  'className="h-8 w-8 rounded-full object-contain shrink-0 bg-white/10 p-0.5 border border-white/10 shadow-sm"'
);
content = content.replace(
  /className="h-8 w-8 rounded-lg object-contain mx-auto"/g,
  'className="h-8 w-8 rounded-full object-contain mx-auto bg-white/10 p-0.5 border border-white/10 shadow-sm"'
);
content = content.replace(
  /className="h-6 w-6 md:h-8 md:w-8 rounded-lg object-contain shrink-0"/g,
  'className="h-6 w-6 md:h-8 md:w-8 rounded-full object-contain shrink-0 bg-white/10 p-0.5 border border-white/10 shadow-sm"'
);

// club.logo containers
content = content.replace(
  /className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900\/30 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors"/g,
  'className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors p-0.5"'
);

content = content.replace(
  /className="w-6 h-6 rounded bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden"/g,
  'className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5"'
);

fs.writeFileSync('src/App.tsx', content);
console.log('fixed logos');
