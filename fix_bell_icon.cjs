const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                {(currentUser.shortName || currentUser.name)?.[0] || "?"}
              </div>
            )}`;

const replacement = `            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("home")}
                className="relative p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                title="Meldingen"
              >
                <Bell size={20} />
                {accessibleBoardMessages.filter((m: BoardMessage) => !m.readBy?.includes(currentUser.id)).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                    {accessibleBoardMessages.filter((m: BoardMessage) => !m.readBy?.includes(currentUser.id)).length}
                  </span>
                )}
              </button>
              
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  {(currentUser.shortName || currentUser.name)?.[0] || "?"}
                </div>
              )}
            </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
