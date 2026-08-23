const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert prikbordTab state near activeTab
const tabStateSearch = `  const [activeTab, setActiveTab] = useState<`;
const prikbordTabState = `  const [prikbordTab, setPrikbordTab] = useState<"berichten" | "afmeldhistorie">("berichten");\n`;
app = app.replace(tabStateSearch, prikbordTabState + tabStateSearch);

// Modify the Prikbord section
const prikbordHeaderSearch = `                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare size={24} className="text-emerald-500" />
                    Prikbord
                  </h2>`;
const prikbordHeaderReplace = `                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare size={24} className="text-emerald-500" />
                    Prikbord
                  </h2>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      onClick={() => setPrikbordTab("berichten")}
                      className={cn(
                        "px-4 py-2 text-sm font-bold rounded-md transition-colors",
                        prikbordTab === "berichten"
                          ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      Prikbord
                    </button>
                    <button
                      onClick={() => setPrikbordTab("afmeldhistorie")}
                      className={cn(
                        "px-4 py-2 text-sm font-bold rounded-md transition-colors",
                        prikbordTab === "afmeldhistorie"
                          ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      Afmeldhistorie
                    </button>
                  </div>`;
app = app.replace(prikbordHeaderSearch, prikbordHeaderReplace);

// Render Afmeldhistorie vs Prikbord berichten
// We look for the part where it checks if there are no messages
const prikbordContentSearch = `                {accessibleBoardMessages.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
                    <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Er zijn nog geen berichten op het prikbord.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accessibleBoardMessages.map((msg: BoardMessage) => (
                      <BoardMessageCard 
                        key={msg.id} 
                        message={msg} 
                        currentUser={currentUser} 
                        users={data.users} 
                        onAction={handleBoardMessageAction}
                        onReply={executeAddBoardMessageReply}
                        showKeepOnHomeOption={true}
                      />
                    ))}
                  </div>
                )}`;

const prikbordContentReplace = `                {prikbordTab === "berichten" ? (
                  accessibleBoardMessages.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
                      <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Er zijn nog geen berichten op het prikbord.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {accessibleBoardMessages.map((msg: BoardMessage) => (
                        <BoardMessageCard 
                          key={msg.id} 
                          message={msg} 
                          currentUser={currentUser} 
                          users={data.users} 
                          onAction={handleBoardMessageAction}
                          onReply={executeAddBoardMessageReply}
                          showKeepOnHomeOption={true}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  (() => {
                    const absenceHistory = (data.notifications || [])
                      .filter((n: any) => n.type === 'absence_request')
                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      
                    if (absenceHistory.length === 0) {
                      return (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
                          <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                          <p className="text-slate-500 dark:text-slate-400">Er is nog geen afmeldhistorie.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        {absenceHistory.map((notif: any) => (
                          <div key={notif.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                {notif.title}
                              </h3>
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {new Date(notif.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                              {notif.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}`;

app = app.replace(prikbordContentSearch, prikbordContentReplace);

fs.writeFileSync('src/App.tsx', app);
