const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetRegex = /<div className="flex items-start justify-between w-full mt-8 md:mt-10 mb-1">[\s\S]*?(?=<div className="p-8 border-t border-slate-100 dark:border-slate-800)/;

const replacement = `<div className="flex flex-col gap-4 w-full mt-6 md:mt-10 mb-1">
                                  {/* Teams and Stats row */}
                                  <div className="flex flex-row items-center justify-between w-full">
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
                                  </div>

                                  {/* Buttons row */}
                                  <div className="flex flex-row items-center justify-center md:justify-end gap-2 w-full mt-2">
                                    <button
                                      onClick={() => {
                                        setSelectedSeasonId(null);
                                        setSelectedExternalMatchId(match.id);
                                        setActiveTab("matches"); // Assuming "matches" will show games for the external match if selectedExternalMatchId is set
                                      }}
                                      className="flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-[11px] md:text-xs font-bold border bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center justify-center gap-1.5 md:gap-2"
                                    >
                                      <History size={14} />
                                      Wedstrijden
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedExternalMatchId(
                                          selectedExternalMatchId === match.id
                                            ? null
                                            : match.id,
                                        );
                                        setSelectedSeasonId(null);
                                      }}
                                      className={cn(
                                        "flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-[11px] md:text-xs font-bold border flex items-center justify-center gap-1.5 md:gap-2",
                                        selectedExternalMatchId === match.id
                                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                          : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
                                      )}
                                    >
                                      {selectedExternalMatchId === match.id
                                        ? "Dichtvouwen"
                                        : "Details & Stand"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {selectedExternalMatchId === match.id && (
`;

const match = content.match(targetRegex);
if (match) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully replaced with regex.');
} else {
  console.log('Regex did not match.');
}
