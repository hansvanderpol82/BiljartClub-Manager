const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetActions = `                                          <td className="py-1 sm:py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                              <button
                                                onClick={() => {`;

const replaceActions = `                                          <td className="py-1 sm:py-2 text-right">
                                            {season.status !== 'closed' && (
                                              <div className="flex justify-end gap-1">
                                                <button
                                                  onClick={() => {`;

// we need to close the conditional as well.
// Let's replace the whole block.
const fullTarget = `                                          <td className="py-1 sm:py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                              <button
                                                onClick={() => {
                                                  setTransactionSeasonId(
                                                    season.id,
                                                  );
                                                  setEditingTransactionId(t.id);
                                                  setTransactionDescription(
                                                    t.description,
                                                  );
                                                  if (t.amount >= 0) {
                                                    setTransactionIncome(
                                                      t.amount.toString(),
                                                    );
                                                    setTransactionExpense("");
                                                  } else {
                                                    setTransactionExpense(
                                                      Math.abs(
                                                        t.amount,
                                                      ).toString(),
                                                    );
                                                    setTransactionIncome("");
                                                  }
                                                  setTransactionDate(t.date);
                                                  setTransactionReceipt(t.receiptData || null);
                                                  setTransactionReceiptError("");
                                                  setIsTransactionModalOpen(
                                                    true,
                                                  );
                                                }}
                                                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                                title="Wijzigen"
                                              >
                                                <Pencil size={14} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  showConfirm(
                                                    "Transactie Verwijderen",
                                                    "Weet je zeker dat je deze transactie wilt verwijderen?",
                                                    () =>
                                                      deleteTransaction(
                                                        season.id,
                                                        t.id,
                                                      ),
                                                  );
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                title="Verwijderen"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </td>`;

const fullReplace = `                                          <td className="py-1 sm:py-2 text-right">
                                            {season.status !== 'closed' && (
                                              <div className="flex justify-end gap-1">
                                                <button
                                                  onClick={() => {
                                                    setTransactionSeasonId(
                                                      season.id,
                                                    );
                                                    setEditingTransactionId(t.id);
                                                    setTransactionDescription(
                                                      t.description,
                                                    );
                                                    if (t.amount >= 0) {
                                                      setTransactionIncome(
                                                        t.amount.toString(),
                                                      );
                                                      setTransactionExpense("");
                                                    } else {
                                                      setTransactionExpense(
                                                        Math.abs(
                                                          t.amount,
                                                        ).toString(),
                                                      );
                                                      setTransactionIncome("");
                                                    }
                                                    setTransactionDate(t.date);
                                                    setTransactionReceipt(t.receiptData || null);
                                                    setTransactionReceiptError("");
                                                    setIsTransactionModalOpen(
                                                      true,
                                                    );
                                                  }}
                                                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                                  title="Wijzigen"
                                                >
                                                  <Pencil size={14} />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    showConfirm(
                                                      "Transactie Verwijderen",
                                                      "Weet je zeker dat je deze transactie wilt verwijderen?",
                                                      () =>
                                                        deleteTransaction(
                                                          season.id,
                                                          t.id,
                                                        ),
                                                    );
                                                  }}
                                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                  title="Verwijderen"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </div>
                                            )}
                                          </td>`;
content = content.replace(fullTarget, fullReplace);
fs.writeFileSync('src/App.tsx', content);
