const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetRow = `                          <tr
                            key={memberId}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >`;

const replacementRow = `                          <tr
                            key={memberId}
                            className={cn(
                              "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors",
                              member?.active === false ? "opacity-50 grayscale bg-slate-50/50 dark:bg-slate-900/50" : ""
                            )}
                          >`;

appContent = appContent.replace(targetRow, replacementRow);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
