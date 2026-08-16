const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetCheck = `                  </label>
                </div>

                {!editingMemberId && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">`;

const replacementCheck = `                  </label>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
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

                {!editingMemberId && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">`;

appContent = appContent.replace(targetCheck, replacementCheck);

const targetSave = `                      updateMember(
                        editingMemberId,
                        newMemberName,
                        newMemberEmail,
                        newMemberAvg,
                        newMemberShortName,
                        newMemberRole,
                        newMemberParticipatesExternal,
                      );
                    } else {
                      addNewMember(
                        newMemberName,
                        newMemberEmail,
                        newMemberAvg,
                        newMemberShortName,
                        newMemberRole,
                        newMemberParticipatesExternal,
                        newMemberSendInvite,
                      );
                    }`;

const replacementSave = `                      updateMember(
                        editingMemberId,
                        newMemberName,
                        newMemberEmail,
                        newMemberAvg,
                        newMemberShortName,
                        newMemberRole,
                        newMemberParticipatesExternal,
                        newMemberActive
                      );
                    } else {
                      addNewMember(
                        newMemberName,
                        newMemberEmail,
                        newMemberAvg,
                        newMemberShortName,
                        newMemberRole,
                        newMemberParticipatesExternal,
                        newMemberSendInvite,
                        newMemberActive
                      );
                    }`;

appContent = appContent.replace(targetSave, replacementSave);

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
