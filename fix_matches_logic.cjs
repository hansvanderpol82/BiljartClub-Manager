const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLogic = `                {!selectedSeasonId && !selectedExternalMatchId ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                    <Calendar
                      size={48}
                      className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      Selecteer eerst een seizoen of een uit/thuis wedstrijd om
                      de wedstrijden te bekijken.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setActiveTab("seasons")}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Naar Seizoenen
                      </button>
                      {activeClub?.participatesInExternalMatches && (
                        <button
                          onClick={() => setActiveTab("external-matches")}
                          className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                        >
                          Naar Uit & Thuis
                        </button>
                      )}
                    </div>
                  </div>
                ) : selectedExternalMatchId ? (`;

const newLogic = `                {(activeTab === "matches" && !selectedSeasonId) ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                    <Calendar
                      size={48}
                      className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      Selecteer eerst een seizoen om de wedstrijden te bekijken.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setActiveTab("seasons")}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Naar Seizoenen
                      </button>
                    </div>
                  </div>
                ) : (activeTab === "external-matches-games" && !selectedExternalMatchId) ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                    <Calendar
                      size={48}
                      className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      Selecteer eerst een uit/thuis wedstrijd om de wedstrijden te bekijken.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setActiveTab("external-matches")}
                        className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                      >
                        Naar Uit & Thuis
                      </button>
                    </div>
                  </div>
                ) : activeTab === "external-matches-games" ? (`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced logic.");
} else {
  console.log("Could not find old logic.");
}
