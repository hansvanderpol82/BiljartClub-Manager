const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `<div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <CreditCard size={18} />
                                          </div>`;

const target2 = `<div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <Users size={18} />
                                          </div>`;

if (content.includes(target1)) {
  content = content.replace(target1, "");
  console.log("Removed CreditCard icon.");
}

if (content.includes(target2)) {
  content = content.replace(target2, "");
  console.log("Removed Users icon.");
}

fs.writeFileSync('src/App.tsx', content);
