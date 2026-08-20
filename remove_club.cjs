const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Specifieke Club (Optioneel)</label>
                  <select
                    value={newBoardMessageTargetClub}
                    onChange={(e) => setNewBoardMessageTargetClub(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Alle clubs (geen specifieke keuze)</option>
                    {data.clubs.map((c: Club) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>`;
code = code.replace(target, '');
fs.writeFileSync('src/App.tsx', code);
console.log('done');
