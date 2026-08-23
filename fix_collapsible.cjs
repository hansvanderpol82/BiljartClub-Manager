const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetHeader = `                        return (
                          <div
                            key={season.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                          >
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                  {season.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Kasoverzicht voor dit seizoen
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  Saldo Seizoen
                                </p>
                                <p
                                  className={cn(`;

const replaceHeader = `                        const isCollapsed = collapsedCashbookSeasons.includes(season.id);
                        return (
                          <div
                            key={season.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
                          >
                            <div 
                              className={cn(
                                "p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                                !isCollapsed && "border-b border-slate-200 dark:border-slate-800"
                              )}
                              onClick={() => setCollapsedCashbookSeasons(prev => prev.includes(season.id) ? prev.filter(id => id !== season.id) : [...prev, season.id])}
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {season.name}
                                  </h3>
                                  {season.status === 'closed' && (
                                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded-full tracking-widest">
                                      Voltooid
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Kasoverzicht voor dit seizoen
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    Saldo Seizoen
                                  </p>
                                  <p
                                    className={cn(`;

content = content.replace(targetHeader, replaceHeader);

// We need to also wrap the rest of the card in a conditional block `{!isCollapsed && ( ... )}`.
// Let's find where the header ends.
const targetBodyStart = `                                  {formatCurrency(totalBalance)}
                                </p>
                              </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">`;

const replaceBodyStart = `                                  {formatCurrency(totalBalance)}
                                </p>
                              </div>
                              <div className="text-slate-400">
                                {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                              </div>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {!isCollapsed && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">`;

content = content.replace(targetBodyStart, replaceBodyStart);

// Now find where the card ends to close the div and the conditional.
const targetBodyEnd = `                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {data.seasons.filter(`;

const replaceBodyEnd = `                                </div>
                              </div>
                            </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    {data.seasons.filter(`;

content = content.replace(targetBodyEnd, replaceBodyEnd);

fs.writeFileSync('src/App.tsx', content);
