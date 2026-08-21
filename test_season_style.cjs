const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The external seasons outer div (around line 8708)
const seasonCardSearch = 'className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors"';
const seasonCardReplace = 'className="bg-white dark:bg-slate-900 sm:rounded-xl border-y sm:border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors -mx-4 sm:mx-0"';

content = content.replace(seasonCardSearch, seasonCardReplace);

// The div that holds the season expanded content (around line 8765)
const expandSearch = 'className="p-6 space-y-8"';
const expandReplace = 'className="py-6 sm:p-6 space-y-8"';

content = content.replace(expandSearch, expandReplace);

// The Standings card (around line 8769)
const standingsCardSearch = 'className="bg-white dark:bg-slate-900 rounded-2xl p-6"';
const standingsCardReplace = 'className="bg-white dark:bg-slate-900 sm:rounded-2xl p-4 sm:p-6"';

content = content.replace(standingsCardSearch, standingsCardReplace);

// The table wrapper inside standings card (around line 8816)
const tableWrapperSearch = 'className="rounded-xl border border-[#2b6e2b] shadow-sm overflow-hidden"';
const tableWrapperReplace = 'className="sm:rounded-xl border-y sm:border border-[#2b6e2b] shadow-sm overflow-hidden -mx-4 sm:mx-0"';

content = content.replace(tableWrapperSearch, tableWrapperReplace);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated season styles");
