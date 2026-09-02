const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = "{/* Club Creation Modal */}";
const modalJSX = `
      {/* Scoring System Info Modal */}
      <AnimatePresence>
        {showScoringInfoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScoringInfoModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <Info className="text-emerald-500" size={24} />
                  Puntentelling Systemen
                </h3>
                <button
                  onClick={() => setShowScoringInfoModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                    <Trophy size={16} className="text-emerald-500" />
                    Standaard (10 punten systeem)
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Bij dit systeem speelt men een van tevoren vastgesteld aantal caramboles of beurten. Het resulterende moyenne bepaalt het aantal punten. Winnaar krijgt altijd 10 punten.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    Driebanden
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Bij dit systeem wordt gekeken naar een berekening van procentueel gemaakte caramboles ten opzichte van het op te leggen aantal caramboles, gebaseerd op het basis moyenne van de speler. 
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <button
                  onClick={() => setShowScoringInfoModal(false)}
                  className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      `;

content = content.replace(anchor, modalJSX + anchor);
fs.writeFileSync('src/App.tsx', content);
console.log("Modal injected!");
