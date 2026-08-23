const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Banner
const bannerPos = `                  {liveMatch.status === "finished" && (
                    <div className="mb-4 sm:mb-6 lg:mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-300">
                          Wedstrijd is voltooid
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Deze wedstrijd is afgerond. Je kunt de details nog
                          wel inzien, maar niet meer bewerken.
                        </p>
                      </div>
                    </div>
                  )}`;
const bannerHtml = `
                  {isLiveMatchLocked && liveMatch.status !== "finished" && (
                    <div className="mb-4 sm:mb-6 lg:mb-8 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3">
                      <Lock className="text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-rose-800 dark:text-rose-300">
                          Alleen-lezen Modus
                        </h4>
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                          Wedstrijd wordt al ingevuld door {liveMatch.activeScorerName || 'een andere gebruiker'}.
                        </p>
                      </div>
                    </div>
                  )}
`;
app = app.replace(bannerPos, bannerPos + bannerHtml);

// Hide plus/min
app = app.replace(/\{\(\(\!isCastMode && liveMatch\.status \!\=\= "finished"\) \|\| activeTurnIndex > 0\) && \(/g, '{((!isCastMode && liveMatch.status !== "finished" && !isLiveMatchLocked) || (activeTurnIndex > 0 && !isLiveMatchLocked)) && (');

// Hide animatie
const animationBtns = `                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={triggerNiceShotAnimation}
                                        title="Mooie bal!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center text-2xl hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        ✨
                                      </button>
                                      <button
                                        onClick={triggerPigAnimation}
                                        title="Varken!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-2xl hover:bg-pink-100 dark:hover:bg-pink-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        🐷
                                      </button>
                                    </div>`;
app = app.replace(animationBtns, `{!isLiveMatchLocked && (` + animationBtns + `)}`);

// Action buttons (Volgende / Vorige)
// We have `{!isCastMode && liveMatch.status !== "finished" && (`
app = app.replace(/\{\!isCastMode && liveMatch\.status \!\=\= "finished" && \(/g, '{!isCastMode && liveMatch.status !== "finished" && !isLiveMatchLocked && (');

// "Score Opslaan & Volgende"
app = app.replace(/\{\!isCastMode &&\s+liveMatch\.status \!\=\= "finished" &&\s+!isDriebandenLive && \(/g, '{!isCastMode && liveMatch.status !== "finished" && !isDriebandenLive && !isLiveMatchLocked && (');

fs.writeFileSync('src/App.tsx', app);
