const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldMobile = `                          <button 
                            className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "seasons" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("seasons"); setMobileSubmenu(null); }}
                          >
                            <Calendar size={20} />
                            Seizoenen
                          </button>
                          {activeClub?.participatesInExternalMatches && (
                            <button 
                              className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "external-matches" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                              onClick={() => { setActiveTab("external-matches"); setMobileSubmenu(null); }}
                            >
                              <Trophy size={20} />
                              Uit & Thuis
                            </button>
                          )}
                          <button 
                            className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "matches" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("matches"); setMobileSubmenu(null); }}
                          >
                            <History size={20} />
                            Wedstrijden
                          </button>`;

const newMobile = `                          <button 
                            className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "seasons" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("seasons"); setMobileSubmenu(null); }}
                          >
                            <Calendar size={20} />
                            Seizoenen
                          </button>
                          <button 
                            className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-12", activeTab === "matches" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("matches"); setMobileSubmenu(null); }}
                          >
                            <History size={20} />
                            Wedstrijden
                          </button>
                          {activeClub?.participatesInExternalMatches && (
                            <>
                              <button 
                                className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "external-matches" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                                onClick={() => { setActiveTab("external-matches"); setMobileSubmenu(null); }}
                              >
                                <Trophy size={20} />
                                Uit & Thuis
                              </button>
                              <button 
                                className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold pl-12", activeTab === "external-matches-games" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                                onClick={() => { setActiveTab("external-matches-games"); setMobileSubmenu(null); }}
                              >
                                <History size={20} />
                                Wedstrijden
                              </button>
                            </>
                          )}`;

if (content.includes(oldMobile)) {
  content = content.replace(oldMobile, newMobile);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Mobile menu updated.");
} else {
  console.log("Could not find old mobile menu.");
}
