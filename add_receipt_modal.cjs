const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const modalCode = `      <AnimatePresence>
        {receiptToView && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceiptToView(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white">Bonnetje / Factuur</h3>
                <button
                  onClick={() => setReceiptToView(null)}
                  className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
                {receiptToView.startsWith('data:image') ? (
                  <img src={receiptToView} alt="Receipt" className="max-w-full h-auto rounded-lg shadow-sm" />
                ) : (
                  <iframe src={receiptToView} className="w-full h-[60vh] rounded-lg" title="Receipt PDF" />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

const insertPoint = `      <AnimatePresence>
        {isTransactionModalOpen && transactionSeasonId && (`;

content = content.replace(insertPoint, modalCode + insertPoint);
fs.writeFileSync('src/App.tsx', content);
