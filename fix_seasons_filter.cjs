const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetSelect = `                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Seizoen:
                      </label>
                      <select
                        value={cashbookSelectedSeasonId}
                        onChange={(e) => setCashbookSelectedSeasonId(e.target.value)}
                        className="px-2 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="all">Alle seizoenen</option>
                        {data.seasons
                          .filter((s: Season) => s.clubId === activeClub.id)
                          .sort((a: Season, b: Season) => new Date(b.id).getTime() - new Date(a.id).getTime())
                          .map((s: Season) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {data.seasons
                      .filter(
                        (s: Season) =>
                          s.clubId === activeClub.id &&
                          (cashbookSelectedSeasonId === "all" ? true : s.id === cashbookSelectedSeasonId),
                      )`;

const replaceSelect = `                    <div className="flex items-center gap-4 flex-wrap">
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
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Seizoen:
                        </label>
                        <select
                          value={cashbookSelectedSeasonId}
                          onChange={(e) => setCashbookSelectedSeasonId(e.target.value)}
                          className="px-2 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="all">Alle seizoenen</option>
                          {data.seasons
                            .filter((s: Season) => s.clubId === activeClub.id && (showClosedSeasons || s.status !== 'closed'))
                            .sort((a: Season, b: Season) => new Date(b.id).getTime() - new Date(a.id).getTime())
                            .map((s: Season) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {data.seasons
                      .filter(
                        (s: Season) =>
                          s.clubId === activeClub.id &&
                          (cashbookSelectedSeasonId === "all" ? true : s.id === cashbookSelectedSeasonId) &&
                          (cashbookSelectedSeasonId !== "all" || showClosedSeasons || s.status !== 'closed'),
                      )`;

content = content.replace(targetSelect, replaceSelect);
fs.writeFileSync('src/App.tsx', content);
