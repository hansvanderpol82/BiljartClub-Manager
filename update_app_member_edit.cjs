const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Settings with Pencil on member/club edits
appContent = appContent.replace(/<Settings size=\{14\} \/>/g, '<Pencil size={14} />');
appContent = appContent.replace(/<Settings size=\{18\} \/>/g, '<Pencil size={18} />');

// Insert newMemberActive checkbox in member edit modal
const targetCheckbox = `                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberParticipatesExternal}
                      onChange={(e) =>
                        setNewMemberParticipatesExternal(e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Meedoen aan uit- en thuiswedstrijden
                    </span>
                  </label>
                </div>`;

const replacementCheckbox = `                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberParticipatesExternal}
                      onChange={(e) =>
                        setNewMemberParticipatesExternal(e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Meedoen aan uit- en thuiswedstrijden
                    </span>
                  </label>
                </div>
                {editingMemberId && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMemberActive}
                        onChange={(e) =>
                          setNewMemberActive(e.target.checked)
                        }
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Actief (Lid kan wedstrijden spelen)
                      </span>
                    </label>
                  </div>
                )}`;

appContent = appContent.replace(targetCheckbox, replacementCheckbox);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
