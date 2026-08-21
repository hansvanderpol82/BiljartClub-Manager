const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldExtDelete = `                                      {match.isBlocked
                                        ? "Uit & Thuis voltooid ongedaan maken"
                                        : "Uit & Thuis voltooid"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setExternalMatchToDeleteId(match.id);
                                        setIsDeleteExternalMatchModalOpen(true);
                                      }}
                                      className="px-2 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-bold flex items-center gap-2"
                                    >
                                      <Trash2 size={16} />
                                      Uit & Thuis verwijderen
                                    </button>
                                  </div>`;

const newExtDelete = `                                      {match.isBlocked
                                        ? "Uit & Thuis voltooid ongedaan maken"
                                        : "Uit & Thuis voltooid"}
                                    </button>
                                    {currentUser.role === 'applicatiebeheerder' && (
                                      <button
                                        onClick={() => {
                                          setExternalMatchToDeleteId(match.id);
                                          setIsDeleteExternalMatchModalOpen(true);
                                        }}
                                        className="px-2 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-bold flex items-center gap-2"
                                      >
                                        <Trash2 size={16} />
                                        Uit & Thuis verwijderen
                                      </button>
                                    )}
                                  </div>`;

if (content.includes(oldExtDelete)) {
  content = content.replace(oldExtDelete, newExtDelete);
  fs.writeFileSync('src/App.tsx', content);
  console.log("External delete button updated.");
} else {
  console.log("Could not find oldExtDelete block.");
}
