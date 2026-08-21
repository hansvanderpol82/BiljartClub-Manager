const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The external matches card in HomeTab
const card1Search = 'className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative"';
const card1Replace = 'className="bg-white dark:bg-slate-900 sm:rounded-3xl shadow-lg border-y sm:border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative -mx-4 sm:mx-0"';

content = content.replace(card1Search, card1Replace);

// The table inside the first card (around line 7203)
const table1Search = 'className="overflow-x-auto -mx-4 sm:mx-0 bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] rounded-2xl shadow-sm border border-[#2b6e2b]"';
const table1Replace = 'className="overflow-x-auto -mx-4 sm:mx-0 bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] sm:rounded-2xl shadow-sm border-y sm:border border-[#2b6e2b]"';

content = content.replace(table1Search, table1Replace);

// The external matches card in MatchesTab (around 9474)
const card2Search = 'className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col items-center relative"';
const card2Replace = 'className="bg-white dark:bg-slate-900 sm:rounded-2xl p-4 sm:p-6 shadow-sm border-y sm:border border-slate-200 dark:border-slate-800 mb-8 flex flex-col items-center relative -mx-4 sm:mx-0"';

content = content.replace(card2Search, card2Replace);

// The table inside the second card (around line 9540)
// wait, let's just do a global replace for the table since they might be identical
const tableSearchG = /className="overflow-x-auto -mx-4 sm:mx-0 bg-\[#064e3b\] bg-linear-to-br from-\[#065f46\] via-\[#064e3b\] to-\[#042f24\] rounded-2xl shadow-sm border border-\[#2b6e2b\]"/g;
const tableReplaceG = 'className="overflow-x-auto -mx-4 sm:mx-0 bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] sm:rounded-2xl shadow-sm border-y sm:border border-[#2b6e2b]"';

content = content.replace(tableSearchG, tableReplaceG);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced cards and tables.");
