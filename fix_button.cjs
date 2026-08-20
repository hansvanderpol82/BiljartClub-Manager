const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `                  {(currentUser.role === 'applicatiebeheerder' || currentUser.role === 'admin') && (
                    <button
                      onClick={() => setIsBoardMessageModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold"
                    >
                      <Plus size={20} />
                      <span>Bericht aanmaken</span>
                    </button>
                  )}`;
const replacement = `                  <button
                    onClick={() => setIsBoardMessageModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold"
                  >
                    <Plus size={20} />
                    <span>Bericht aanmaken</span>
                  </button>`;
code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
