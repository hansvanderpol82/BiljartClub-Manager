const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const iosModal = `
      {/* iOS Install Modal */}
      <AnimatePresence>
        {showIosInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowIosInstallModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="text-emerald-500" size={24} />
                    App Installeren
                  </h3>
                  <button
                    onClick={() => setShowIosInstallModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4 text-slate-600 dark:text-slate-300">
                  <p>Om deze app op je iPhone of iPad te installeren:</p>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>Tik op het <strong>Deel</strong> icoon onderaan in je browser (het vierkantje met het pijltje omhoog).</li>
                    <li>Scroll naar beneden in het menu.</li>
                    <li>Kies voor <strong>Zet op beginscherm</strong> (of 'Add to Home Screen').</li>
                    <li>Tik rechtsboven op <strong>Voeg toe</strong>.</li>
                  </ol>
                  <p className="mt-4 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    Daarna open je de BiljartClub Manager direct vanaf je startscherm, zonder adresbalk!
                  </p>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowIosInstallModal(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                  >
                    Begrepen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Club Creation Modal */}
`;

code = code.replace('{/* Club Creation Modal */}', iosModal);
fs.writeFileSync('src/App.tsx', code);
