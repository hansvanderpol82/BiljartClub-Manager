const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const returnStatement = `  // --- Views ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">`;

const welcomeScreen = `  // --- Views ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <AnimatePresence>
        {showInviteWelcome && inviteClubId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="text-emerald-600 dark:text-emerald-400" size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                    Welkom bij de Club!
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Je bent succesvol ingelogd. 
                    {data.clubs.find((c: any) => c.id === inviteClubId) 
                      ? \` Je kunt nu meespelen met \${data.clubs.find((c: any) => c.id === inviteClubId)?.name}.\` 
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInviteWelcome(false);
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                    setSelectedClubId(inviteClubId);
                    setActiveTab('clubs');
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20 text-lg"
                >
                  Ga naar het Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace(returnStatement, welcomeScreen);
fs.writeFileSync('src/App.tsx', code);
