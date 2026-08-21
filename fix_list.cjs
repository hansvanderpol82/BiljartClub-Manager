const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldList = `<div className="flex flex-row items-center justify-between w-full">
                                    {/* Home */}
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2 flex-1 justify-start overflow-hidden">
                                      <h3 className="text-sm md:text-xl font-black text-slate-800 dark:text-white uppercase truncate max-w-full">
                                        {homeClub?.name}
                                      </h3>
                                      <span className="text-emerald-500 font-black text-sm md:text-xl shrink-0">
                                        ({listExtHomePointsTotal})
                                      </span>
                                    </div>

                                    {/* Center Stats */}
                                    <div className="flex flex-col items-center justify-center shrink-0 px-2 md:px-4">
                                      <div className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                                        Gespeeld: {fGames.length} <span className="hidden md:inline">&nbsp;&bull;&nbsp;</span><br className="md:hidden" /> Resterend: {pGames.length}
                                      </div>
                                    </div>

                                    {/* Away */}
                                    <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-2 flex-1 justify-end overflow-hidden">
                                      <span className="text-amber-500 font-black text-sm md:text-xl md:order-1 shrink-0">
                                        ({listExtAwayPointsTotal})
                                      </span>
                                      <h3 className="text-sm md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-right md:order-2 max-w-full">
                                        {awayClub?.name}
                                      </h3>
                                    </div>
                                  </div>`;

const newList = `<div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-0">
                                    {/* Home */}
                                    <div className="flex flex-row items-center gap-2 flex-1 justify-center md:justify-start overflow-hidden">
                                      <h3 className="text-sm md:text-xl font-black text-slate-800 dark:text-white uppercase truncate max-w-full">
                                        {homeClub?.name}
                                      </h3>
                                      <span className="text-emerald-500 font-black text-sm md:text-xl shrink-0">
                                        ({listExtHomePointsTotal})
                                      </span>
                                    </div>

                                    {/* Away */}
                                    <div className="flex flex-row items-center gap-2 flex-1 justify-center md:justify-end overflow-hidden order-2 md:order-3">
                                      <h3 className="text-sm md:text-xl font-black text-slate-800 dark:text-white uppercase truncate md:text-right max-w-full md:order-2">
                                        {awayClub?.name}
                                      </h3>
                                      <span className="text-amber-500 font-black text-sm md:text-xl shrink-0 md:order-1">
                                        ({listExtAwayPointsTotal})
                                      </span>
                                    </div>

                                    {/* Center Stats */}
                                    <div className="flex flex-row items-center justify-center shrink-0 px-2 md:px-4 order-3 md:order-2 mt-1 md:mt-0">
                                      <div className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center flex flex-row items-center gap-2">
                                        <span>Gespeeld: {fGames.length}</span>
                                        <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                                        <span>Resterend: {pGames.length}</span>
                                      </div>
                                    </div>
                                  </div>`;

if (content.includes(oldList)) {
  content = content.replace(oldList, newList);
  fs.writeFileSync('src/App.tsx', content);
  console.log("List replaced successfully.");
} else {
  console.log("Could not find oldList.");
}
