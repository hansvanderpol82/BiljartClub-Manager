const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetContent = `                                    {isSameDay(date, new Date()) &&
                                      activeSeason &&
                                      !cancelledReason && (
                                        <button
                                          onClick={() => showConfirm(
                                            "Speeldag Voltooien",
                                            "Nog niet gespeelde- en afgemelde wedstrijden worden naar de volgende speeldag verplaats en alles wordt opnieuw ingedeeld.",
                                            () => completeMatchDay(activeSeason.id, date.toISOString())
                                          )}
                                          className="bg-white dark:bg-slate-900 px-2 sm:px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-sm flex items-center gap-2 font-bold text-sm h-[42px]"
                                        >
                                          <CheckCircle2 size={16} />
                                          Speeldag voltooien
                                        </button>
                                      )}`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, "");
  fs.writeFileSync('src/App.tsx', content);
  console.log("Speeldag voltooien button removed.");
} else {
  console.log("Could not find target content.");
}
