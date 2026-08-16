const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetTableRole = `                                {member?.role === "member" && (
                                  <div
                                    className="p-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-lg"
                                    title="Speler"
                                  >
                                    <UserIcon size={16} />
                                  </div>
                                )}`;

const replacementTableRole = `                                {member?.role === "member" && (
                                  <div
                                    className="p-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-lg"
                                    title="Speler"
                                  >
                                    <UserIcon size={16} />
                                  </div>
                                )}
                                {member?.active === false && (
                                  <div
                                    className="p-1.5 px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold"
                                    title="Inactief"
                                  >
                                    Inactief
                                  </div>
                                )}`;

appContent = appContent.replace(targetTableRole, replacementTableRole);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
