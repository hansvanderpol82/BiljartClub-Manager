const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const searchTR = `                                          <td className="py-1 sm:py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {t.description}
                                          </td>`;
const replaceTR = `                                          <td className="py-1 sm:py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                              {t.description}
                                              {t.receiptData && (
                                                <button
                                                  onClick={() => setReceiptToView(t.receiptData)}
                                                  className="text-slate-400 hover:text-emerald-600 transition-colors"
                                                  title="Bekijk bonnetje"
                                                >
                                                  <FileText size={14} />
                                                </button>
                                              )}
                                            </div>
                                          </td>`;
content = content.replace(searchTR, replaceTR);

fs.writeFileSync('src/App.tsx', content);
