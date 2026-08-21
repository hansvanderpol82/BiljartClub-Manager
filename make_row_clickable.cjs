const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetRowStart = `                          <tr
                            key={memberId}
                            className={cn(
                              "flex flex-col sm:table-row p-4 sm:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors w-full",
                              member?.active === false ? "opacity-50 grayscale bg-slate-50/50 dark:bg-slate-900/50" : ""
                            )}
                          >`;

const replaceRowStart = `                          <tr
                            key={memberId}
                            onClick={() => {
                              setSelectedProfileId(memberId);
                              setActiveTab("profile");
                            }}
                            className={cn(
                              "flex flex-col sm:table-row p-4 sm:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors w-full cursor-pointer",
                              member?.active === false ? "opacity-50 grayscale bg-slate-50/50 dark:bg-slate-900/50" : ""
                            )}
                          >`;

content = content.replace(targetRowStart, replaceRowStart);

content = content.replace(/onClick=\{\(\) => \{\n                                          setEditingMemberId\(member!\.id\);/g, `onClick={(e) => {\n                                          e.stopPropagation();\n                                          setEditingMemberId(member!.id);`);

content = content.replace(/onClick=\{\(\) => sendInviteEmail\(activeClub, member\)\}/g, `onClick={(e) => { e.stopPropagation(); sendInviteEmail(activeClub, member); }}`);

content = content.replace(/onClick=\{\(\) => removeMemberFromClub\(activeClub\.id, member!\.id\)\}/g, `onClick={(e) => { e.stopPropagation(); removeMemberFromClub(activeClub.id, member!.id); }}`);
content = content.replace(/onClick=\{\(\) =>\n                                            removeMemberFromClub\(\n                                              activeClub\.id,\n                                              member!\.id,\n                                            \)\n                                          \}/g, `onClick={(e) => { e.stopPropagation(); removeMemberFromClub(activeClub.id, member!.id); }}`);

fs.writeFileSync('src/App.tsx', content);
console.log("Made row clickable.");
