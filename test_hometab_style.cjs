const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Aankomende Wedstrijden card
content = content.replace(
  'className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"',
  'className="bg-white dark:bg-slate-900 sm:rounded-2xl p-4 sm:p-6 border-y sm:border border-slate-200 dark:border-slate-800 shadow-sm -mx-4 sm:mx-0"'
);

// Contributie card
content = content.replace(
  'className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"',
  'className="bg-white dark:bg-slate-900 sm:rounded-2xl p-4 sm:p-6 border-y sm:border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between -mx-4 sm:mx-0"'
);

// Tussenstand card
content = content.replace(
  'className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"',
  'className="bg-white dark:bg-slate-900 sm:rounded-2xl p-4 sm:p-6 border-y sm:border border-slate-200 dark:border-slate-800 shadow-sm -mx-4 sm:mx-0"'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated HomeTab cards");
