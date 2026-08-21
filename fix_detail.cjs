const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldDetail = `<div className="flex items-center justify-between w-full mt-4 mb-2">
                              <div className="flex items-center gap-2 flex-1 justify-start">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-left">
                                  {homeClub?.name}
                                </h3>
                                <span className="text-emerald-500 font-black text-lg md:text-xl ml-1">
                                  ({viewExtHomePointsTotal})
                                </span>
                              </div>

                              <div className="flex items-center justify-center gap-2 px-2 sm:px-4 shrink-0 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Gespeeld: {finishedGames.length}{" "}
                                &nbsp;&bull;&nbsp; Resterend:{" "}
                                {plannedGames.length}
                              </div>

                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-right">
                                  {awayClub?.name}
                                </h3>
                                <span className="text-amber-500 font-black text-lg md:text-xl ml-1">
                                  ({viewExtAwayPointsTotal})
                                </span>
                              </div>
                            </div>`;

const newDetail = `<div className="flex flex-col md:flex-row items-center justify-between w-full mt-4 mb-2 gap-2 md:gap-0">
                              <div className="flex items-center gap-2 flex-1 justify-center md:justify-start">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-left">
                                  {homeClub?.name}
                                </h3>
                                <span className="text-emerald-500 font-black text-lg md:text-xl ml-1">
                                  ({viewExtHomePointsTotal})
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-1 justify-center md:justify-end order-2 md:order-3">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase truncate md:text-right md:order-2">
                                  {awayClub?.name}
                                </h3>
                                <span className="text-amber-500 font-black text-lg md:text-xl ml-1 md:order-1">
                                  ({viewExtAwayPointsTotal})
                                </span>
                              </div>

                              <div className="flex items-center justify-center gap-2 px-2 sm:px-4 shrink-0 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest order-3 md:order-2 mt-1 md:mt-0">
                                <span>Gespeeld: {finishedGames.length}</span>
                                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                                <span>Resterend: {plannedGames.length}</span>
                              </div>
                            </div>`;

if (content.includes(oldDetail)) {
  content = content.replace(oldDetail, newDetail);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Detail replaced successfully.");
} else {
  console.log("Could not find oldDetail.");
}
