const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `<div className="text-center">
                                  <div className="relative">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0 md:absolute md:-left-14 md:top-1/2 md:-translate-y-1/2 md:flex-col justify-center">
                                      <button
                                        onClick={triggerNiceBallAnimation}
                                        title="Mooie bal!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center text-2xl hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        ✨
                                      </button>
                                      <button
                                        onClick={triggerPigAnimation}
                                        title="Varken!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-2xl hover:bg-pink-100 dark:hover:bg-pink-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        🐷
                                      </button>
                                    </div>`;

const repStr = `<div className="text-center">
                                  <div className="relative flex justify-center items-center gap-3 md:block">
                                    <div className="flex flex-col gap-3 md:absolute md:-left-14 md:top-1/2 md:-translate-y-1/2 justify-center">
                                      <button
                                        onClick={triggerNiceBallAnimation}
                                        title="Mooie bal!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center text-2xl hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        ✨
                                      </button>
                                      <button
                                        onClick={triggerPigAnimation}
                                        title="Varken!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-2xl hover:bg-pink-100 dark:hover:bg-pink-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        🐷
                                      </button>
                                    </div>`;

content = content.replace(targetStr, repStr);

const targetRightStr = `                                    <div className="flex items-center gap-4 mt-4 md:mt-0 md:absolute md:-right-14 md:top-1/2 md:-translate-y-1/2 md:flex-col">
                                      <button
                                        onClick={() => {
                                          if (activeScoringPlayer === 1)
                                            setCurrentTurnP1(
                                              (prev) => prev + 1,
                                            );
                                          else
                                            setCurrentTurnP2(
                                              (prev) => prev + 1,
                                            );
                                        }}
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                      >
                                        <Plus size={20} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (activeScoringPlayer === 1)
                                            setCurrentTurnP1((prev) =>
                                              Math.max(0, prev - 1),
                                            );
                                          else
                                            setCurrentTurnP2((prev) =>
                                              Math.max(0, prev - 1),
                                            );
                                        }}
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                      >
                                        <Minus size={20} />
                                      </button>
                                    </div>`;

const repRightStr = `                                    <div className="flex flex-col gap-3 md:absolute md:-right-14 md:top-1/2 md:-translate-y-1/2 justify-center">
                                      <button
                                        onClick={() => {
                                          if (activeScoringPlayer === 1)
                                            setCurrentTurnP1(
                                              (prev) => prev + 1,
                                            );
                                          else
                                            setCurrentTurnP2(
                                              (prev) => prev + 1,
                                            );
                                        }}
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                      >
                                        <Plus size={20} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (activeScoringPlayer === 1)
                                            setCurrentTurnP1((prev) =>
                                              Math.max(0, prev - 1),
                                            );
                                          else
                                            setCurrentTurnP2((prev) =>
                                              Math.max(0, prev - 1),
                                            );
                                        }}
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                      >
                                        <Minus size={20} />
                                      </button>
                                    </div>`;

content = content.replace(targetRightStr, repRightStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Replaced");
