const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldUI = `<label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Puntentelling Systeem
                          </label>`;
const newUI = `<div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              Puntentelling Systeem
                            </label>
                            <button type="button" onClick={() => setShowScoringInfoModal(true)} className="text-slate-400 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                              <Info size={14} /> <span className="text-[10px] uppercase font-bold">Info</span>
                            </button>
                          </div>`;

content = content.replace(oldUI, newUI);
fs.writeFileSync('src/App.tsx', content);
console.log("Updated home match UI successfully");
