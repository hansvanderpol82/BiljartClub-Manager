const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStart = `        {/* Mobile Navigation */}`;
const targetEnd = `        </nav>
      </main>`;

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd) + targetEnd.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find the target range.");
  process.exit(1);
}

const replacement = `        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-50 px-2 h-16 transition-colors shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <MobileNavTab
            icon={<Home size={22} />}
            label="Home"
            active={["home", "notifications"].includes(activeTab)}
            onClick={() => setMobileSubmenu(mobileSubmenu === "home" ? null : "home")}
          />
          <MobileNavTab
            icon={<Building2 size={22} />}
            label="Clubs"
            active={["clubs", "members", "seasons", "external-matches", "matches", "cashbook"].includes(activeTab)}
            onClick={() => setMobileSubmenu(mobileSubmenu === "clubs" ? null : "clubs")}
          />
          <MobileNavTab
            icon={<UserCircle size={22} />}
            label="Profiel"
            active={activeTab === "profile"}
            onClick={() => setMobileSubmenu(mobileSubmenu === "profile" ? null : "profile")}
          />
          <MobileNavTab
            icon={<Settings size={22} />}
            label="Meer"
            active={["settings", "manage"].includes(activeTab)}
            onClick={() => setMobileSubmenu(mobileSubmenu === "settings" ? null : "settings")}
          />
        </nav>

        {/* Mobile Submenu Overlay */}
        <AnimatePresence>
          {mobileSubmenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
                onClick={() => setMobileSubmenu(null)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 pb-6"
              >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                <div className="flex flex-col gap-2">
                  {mobileSubmenu === "home" && (
                    <>
                      <button 
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "home" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={() => { setActiveTab("home"); setMobileSubmenu(null); }}
                      >
                        <Home size={20} />
                        Overzicht
                      </button>
                      <button 
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "notifications" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={() => { setActiveTab("notifications"); setMobileSubmenu(null); }}
                      >
                        <MessageSquare size={20} />
                        Prikbord
                      </button>
                    </>
                  )}

                  {mobileSubmenu === "clubs" && (
                    <>
                      <button 
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "clubs" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={() => { setActiveTab("clubs"); setMobileSubmenu(null); }}
                      >
                        <Building2 size={20} />
                        Mijn Clubs
                      </button>
                      {selectedClubId && (
                        <>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          <button 
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "members" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("members"); setMobileSubmenu(null); }}
                          >
                            <Users size={20} />
                            Leden
                          </button>
                          <button 
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "seasons" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("seasons"); setMobileSubmenu(null); }}
                          >
                            <Calendar size={20} />
                            Seizoenen
                          </button>
                          {activeClub?.participatesInExternalMatches && (
                            <button 
                              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "external-matches" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                              onClick={() => { setActiveTab("external-matches"); setMobileSubmenu(null); }}
                            >
                              <Trophy size={20} />
                              Uit & Thuis
                            </button>
                          )}
                          <button 
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "matches" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("matches"); setMobileSubmenu(null); }}
                          >
                            <History size={20} />
                            Wedstrijden
                          </button>
                          {currentUser.role === "admin" && (
                            <button 
                              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold pl-8", activeTab === "cashbook" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                              onClick={() => { setActiveTab("cashbook"); setMobileSubmenu(null); }}
                            >
                              <Wallet size={20} />
                              Kasboek
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {mobileSubmenu === "profile" && (
                    <>
                      <button 
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "profile" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={() => { setSelectedProfileId(currentUser.id); setActiveTab("profile"); setMobileSubmenu(null); }}
                      >
                        <UserCircle size={20} />
                        Mijn Profiel
                      </button>
                    </>
                  )}

                  {mobileSubmenu === "settings" && (
                    <>
                      <button 
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "settings" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={() => { setActiveTab("settings"); setMobileSubmenu(null); }}
                      >
                        <Settings size={20} />
                        Instellingen
                      </button>
                      {currentUser.role === 'applicatiebeheerder' && (
                        <button 
                          className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "manage" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                          onClick={() => { setActiveTab("manage"); setMobileSubmenu(null); }}
                        >
                          <Users size={20} />
                          Gebruikersinstellingen
                        </button>
                      )}
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      <button 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => { auth.signOut(); setMobileSubmenu(null); }}
                      >
                        <LogOut size={20} />
                        Uitloggen
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
