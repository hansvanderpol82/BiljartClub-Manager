const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. When adding a new transaction
let targetAdd = `                                    onClick={() => {
                                      setTransactionSeasonId(season.id);
                                      setIsTransactionModalOpen(true);
                                    }}`;
let replaceAdd = `                                    onClick={() => {
                                      setTransactionSeasonId(season.id);
                                      setTransactionReceipt(null);
                                      setTransactionReceiptError("");
                                      setIsTransactionModalOpen(true);
                                    }}`;
content = content.replace(targetAdd, replaceAdd);

// 2. When editing a transaction
let targetEdit = `                                                  setTransactionDate(t.date);
                                                  setIsTransactionModalOpen(
                                                    true,
                                                  );`;
let replaceEdit = `                                                  setTransactionDate(t.date);
                                                  setTransactionReceipt(t.receiptData || null);
                                                  setTransactionReceiptError("");
                                                  setIsTransactionModalOpen(
                                                    true,
                                                  );`;
content = content.replace(targetEdit, replaceEdit);

// 3. Modifying the add/update calls
let targetSave = `                    if (editingTransactionId) {
                      updateTransaction(
                        transactionSeasonId!,
                        editingTransactionId,
                        {
                          description: transactionDescription,
                          amount: amount,
                          date: transactionDate,
                          type: "manual",
                        },
                      );
                    } else {
                      addTransaction(transactionSeasonId!, {
                        description: transactionDescription,
                        amount: amount,
                        date: transactionDate,
                        type: "manual",
                      });
                    }
                    setIsTransactionModalOpen(false);
                    setEditingTransactionId(null);
                    setTransactionDescription("");
                    setTransactionIncome("");
                    setTransactionExpense("");
                    setTransactionDate(format(new Date(), "yyyy-MM-dd"));`;
let replaceSave = `                    if (editingTransactionId) {
                      updateTransaction(
                        transactionSeasonId!,
                        editingTransactionId,
                        {
                          description: transactionDescription,
                          amount: amount,
                          date: transactionDate,
                          type: "manual",
                          receiptData: transactionReceipt || undefined,
                        },
                      );
                    } else {
                      addTransaction(transactionSeasonId!, {
                        description: transactionDescription,
                        amount: amount,
                        date: transactionDate,
                        type: "manual",
                        receiptData: transactionReceipt || undefined,
                      });
                    }
                    setIsTransactionModalOpen(false);
                    setEditingTransactionId(null);
                    setTransactionDescription("");
                    setTransactionIncome("");
                    setTransactionExpense("");
                    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
                    setTransactionReceipt(null);`;
content = content.replace(targetSave, replaceSave);

fs.writeFileSync('src/App.tsx', content);
