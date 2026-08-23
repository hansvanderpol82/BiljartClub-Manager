const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetUI = `                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>`;

const replaceUI = `                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Bonnetje / Factuur (Optioneel)
                  </label>
                  {transactionReceipt ? (
                    <div className="flex items-center gap-4">
                      {transactionReceipt.startsWith("data:image") ? (
                        <div className="h-20 w-20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          <img src={transactionReceipt} alt="Receipt" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <FileText size={24} />
                        </div>
                      )}
                      <button
                        onClick={() => setTransactionReceipt(null)}
                        className="px-4 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                      >
                        Verwijderen
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setTransactionReceiptError("");
                          
                          if (file.size > 5 * 1024 * 1024) {
                            setTransactionReceiptError("Bestand is te groot (max 5MB).");
                            e.target.value = '';
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            let dataUrl = event.target?.result as string;
                            
                            // Simple compression for images
                            if (file.type.startsWith("image/")) {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const MAX_WIDTH = 800;
                                let width = img.width;
                                let height = img.height;

                                if (width > MAX_WIDTH) {
                                  height = Math.round((height * MAX_WIDTH) / width);
                                  width = MAX_WIDTH;
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                ctx?.drawImage(img, 0, 0, width, height);
                                
                                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
                                setTransactionReceipt(compressedDataUrl);
                              };
                              img.src = dataUrl;
                            } else {
                              // PDF
                              setTransactionReceipt(dataUrl);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 transition-colors cursor-pointer"
                      />
                      {transactionReceiptError && (
                        <p className="mt-2 text-xs text-rose-500 font-medium">{transactionReceiptError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>`;

content = content.replace(targetUI, replaceUI);
fs.writeFileSync('src/App.tsx', content);
