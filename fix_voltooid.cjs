const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix toggle UI
const targetToggle = `                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showClosedSeasons}
                          onChange={(e) => setShowClosedSeasons(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                          Voltooide seizoenen tonen
                        </span>
                      </label>`;

const replaceToggle = `                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={() => setShowClosedSeasons(!showClosedSeasons)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors shadow-sm text-sm font-bold",
                          showClosedSeasons
                            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                        )}
                        title={
                          showClosedSeasons
                            ? "Voltooide seizoenen verbergen"
                            : "Voltooide seizoenen tonen"
                        }
                      >
                        {showClosedSeasons ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                        <span className="hidden sm:inline">
                          {showClosedSeasons ? "Verbergen" : "Tonen"}
                        </span>
                      </button>`;
content = content.replace(targetToggle, replaceToggle);

// Fix dropdown options filter
const targetDropdown = `                          {data.seasons
                            .filter((s: Season) => s.clubId === activeClub.id && (showClosedSeasons || s.status !== 'closed'))
                            .sort((a: Season, b: Season) => new Date(b.id).getTime() - new Date(a.id).getTime())
                            .map((s: Season) => (`;

const replaceDropdown = `                          {data.seasons
                            .filter((s: Season) => s.clubId === activeClub.id && (showClosedSeasons || (!s.isBlocked && s.status !== 'closed')))
                            .sort((a: Season, b: Season) => new Date(b.id).getTime() - new Date(a.id).getTime())
                            .map((s: Season) => (`;
content = content.replace(targetDropdown, replaceDropdown);

// Fix cashbook sections filter
const targetFilter = `                  <div className="space-y-6">
                    {data.seasons
                      .filter(
                        (s: Season) =>
                          s.clubId === activeClub.id &&
                          (cashbookSelectedSeasonId === "all" ? true : s.id === cashbookSelectedSeasonId) &&
                          (cashbookSelectedSeasonId !== "all" || showClosedSeasons || s.status !== 'closed'),
                      )`;

const replaceFilter = `                  <div className="space-y-6">
                    {data.seasons
                      .filter(
                        (s: Season) =>
                          s.clubId === activeClub.id &&
                          (cashbookSelectedSeasonId === "all" ? true : s.id === cashbookSelectedSeasonId) &&
                          (cashbookSelectedSeasonId !== "all" || showClosedSeasons || (!s.isBlocked && s.status !== 'closed')),
                      )`;
content = content.replace(targetFilter, replaceFilter);

fs.writeFileSync('src/App.tsx', content);
