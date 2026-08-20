const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                          <button
                            onClick={() => {
                              setData((prev: any) => ({
                                ...prev,
                                clubs: prev.clubs.map((c: Club) =>
                                  c.id === activeClub.id
                                    ? { ...c, allowAppAdminAccess: !c.allowAppAdminAccess }
                                    : c
                                )
                              }));
                            }}
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                              activeClub.allowAppAdminAccess ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                activeClub.allowAppAdminAccess ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>`;

const replacement = `                          <button
                            onClick={() => {
                              setData((prev: any) => ({
                                ...prev,
                                clubs: prev.clubs.map((c: Club) =>
                                  c.id === activeClub.id
                                    ? { ...c, allowAppAdminAccess: !c.allowAppAdminAccess }
                                    : c
                                )
                              }));
                            }}
                            className={cn(
                              "w-14 h-7 shrink-0 flex items-center rounded-full p-1 transition-colors duration-300",
                              activeClub.allowAppAdminAccess ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            )}
                          >
                            <div
                              className={cn(
                                "bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300",
                                activeClub.allowAppAdminAccess ? "translate-x-7" : "translate-x-0"
                              )}
                            />
                          </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
