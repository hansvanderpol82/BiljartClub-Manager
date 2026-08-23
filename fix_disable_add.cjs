const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetAddBtn = `                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    In- en Uitgaven
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setTransactionSeasonId(season.id);
                                      setTransactionReceipt(null);
                                      setTransactionReceiptError("");
                                      setIsTransactionModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                  >
                                    <PlusCircle size={14} />
                                    Toevoegen
                                  </button>
                                </div>`;

const replaceAddBtn = `                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    In- en Uitgaven
                                  </h4>
                                  {season.status !== 'closed' && (
                                    <button
                                      onClick={() => {
                                        setTransactionSeasonId(season.id);
                                        setTransactionReceipt(null);
                                        setTransactionReceiptError("");
                                        setIsTransactionModalOpen(true);
                                      }}
                                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                      <PlusCircle size={14} />
                                      Toevoegen
                                    </button>
                                  )}
                                </div>`;

content = content.replace(targetAddBtn, replaceAddBtn);
fs.writeFileSync('src/App.tsx', content);
