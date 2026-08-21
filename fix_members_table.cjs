const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetTable = `                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="py-2 sm:py-4 pl-6 text-left">Naam</th>
                        <th className="py-2 sm:py-4 text-left">Rol</th>
                        <th className="py-2 sm:py-4 text-left hidden sm:table-cell">Email</th>
                        <th className="py-2 sm:py-4 text-left hidden sm:table-cell">Start Gemiddelde</th>
                        <th className="py-2 sm:py-4 pr-6 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {(activeClub.memberIds || []).map((memberId) => {
                        const member = data.users.find(
                          (u: User) => u.id === memberId,
                        );
                        return (
                          <tr
                            key={memberId}
                            className={cn(
                              "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors",
                              member?.active === false ? "opacity-50 grayscale bg-slate-50/50 dark:bg-slate-900/50" : ""
                            )}
                          >
                            <td className="py-4 pl-6">
                              <div className="flex flex-col">
                                <button
                                  onClick={() => {
                                    setSelectedProfileId(memberId);
                                    setActiveTab("profile");
                                  }}
                                  className="font-medium text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                                >
                                  {member?.shortName || member?.name}
                                </button>
                                {member?.shortName &&
                                  member?.name &&
                                  member.shortName !== member.name && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                      {member.name}
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                {member?.role === "admin" && (
                                  <div
                                    className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"
                                    title="Beheerder"
                                  >
                                    <ShieldCheck size={16} />
                                  </div>
                                )}
                                {member?.role === "planner" && (
                                  <div
                                    className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
                                    title="Planner"
                                  >
                                    <Calendar size={16} />
                                  </div>
                                )}
                                {member?.role === "member" && (
                                  <div
                                    className="p-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-lg"
                                    title="Speler"
                                  >
                                    <UserIcon size={16} />
                                  </div>
                                )}
                                {member?.active === false && (
                                  <div
                                    className="p-1.5 px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold"
                                    title="Inactief"
                                  >
                                    Inactief
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400">
                              {member?.email}
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400">
                              {formatNumber(member?.baseAverage || 0)}
                            </td>
                            <td className="py-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedProfileId(memberId);
                                    setActiveTab("profile");
                                  }}
                                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                  title="Bekijk Profiel"
                                >
                                  <UserCircle size={18} />
                                </button>
                                {(isClubAdmin(activeClub, currentUser) ||
                                  currentUser.role === "admin" ||
                                  currentUser.role === "planner") &&
                                  member?.id !== currentUser.id && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingMemberId(member!.id);
                                          setNewMemberName(member!.name);
                                          setNewMemberShortName(
                                            member!.shortName || "",
                                          );
                                          setNewMemberEmail(member!.email);
                                          setNewMemberAvg(member!.baseAverage);
                                          setNewMemberRole(member!.role);
                                          setNewMemberParticipatesExternal(
                                            member!
                                              .participatesInExternalMatches ??
                                              false,
                                          );
                                          setNewMemberActive(member!.active ?? true);
                                          setIsMemberModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                        title="Wijzigen"
                                      >
                                        <Pencil size={18} />
                                      </button>
                                      {member?.email && (
                                        <button
                                          onClick={() => sendInviteEmail(activeClub, member)}
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                          title="Stuur Uitnodiging"
                                        >
                                          <Mail size={18} />
                                        </button>
                                      )}
                                      {currentUser.role === 'applicatiebeheerder' && (
                                        <button
                                          onClick={() =>
                                            removeMemberFromClub(
                                              activeClub.id,
                                              member!.id,
                                            )
                                          }
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                          title="Verwijderen"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      )}
                                    </>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>`;

const replacementTable = `                  <table className="w-full text-left">
                    <thead className="hidden sm:table-header-group">
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="py-2 sm:py-4 pl-6 text-left">Naam</th>
                        <th className="py-2 sm:py-4 text-left">Rol</th>
                        <th className="py-2 sm:py-4 text-left">Email</th>
                        <th className="py-2 sm:py-4 pr-6 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="flex flex-col sm:table-row-group divide-y divide-slate-50 dark:divide-slate-800 w-full">
                      {(activeClub.memberIds || []).map((memberId) => {
                        const member = data.users.find(
                          (u: User) => u.id === memberId,
                        );
                        return (
                          <tr
                            key={memberId}
                            className={cn(
                              "flex flex-col sm:table-row p-4 sm:p-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors w-full",
                              member?.active === false ? "opacity-50 grayscale bg-slate-50/50 dark:bg-slate-900/50" : ""
                            )}
                          >
                            <td className="sm:hidden flex flex-col gap-2 w-full">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                  {member?.shortName || member?.name}
                                </span>
                                {member?.shortName && member?.name && member.shortName !== member.name && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    ({member.name})
                                  </span>
                                )}
                                <div className="flex items-center gap-1 ml-auto sm:ml-1">
                                  {member?.role === "admin" && (
                                    <div className="p-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md" title="Beheerder"><ShieldCheck size={14} /></div>
                                  )}
                                  {member?.role === "planner" && (
                                    <div className="p-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md" title="Planner"><Calendar size={14} /></div>
                                  )}
                                  {member?.role === "member" && (
                                    <div className="p-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-md" title="Speler"><UserIcon size={14} /></div>
                                  )}
                                  {member?.active === false && (
                                    <div className="p-1 px-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-[10px] font-bold" title="Inactief">Inactief</div>
                                  )}
                                </div>
                              </div>
                              
                              {member?.email && (
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {member.email}
                                </div>
                              )}
                              
                              <div className="flex justify-start gap-2 mt-2">
                                {(isClubAdmin(activeClub, currentUser) ||
                                  currentUser.role === "admin" ||
                                  currentUser.role === "planner") &&
                                  member?.id !== currentUser.id && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingMemberId(member!.id);
                                          setNewMemberName(member!.name);
                                          setNewMemberShortName(member!.shortName || "");
                                          setNewMemberEmail(member!.email);
                                          setNewMemberAvg(member!.baseAverage);
                                          setNewMemberRole(member!.role);
                                          setNewMemberParticipatesExternal(member!.participatesInExternalMatches ?? false);
                                          setNewMemberActive(member!.active ?? true);
                                          setIsMemberModalOpen(true);
                                        }}
                                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2 px-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors bg-slate-100 dark:bg-slate-800"
                                        title="Wijzigen"
                                      >
                                        <Pencil size={16} />
                                        <span className="text-xs font-bold">Wijzigen</span>
                                      </button>
                                      {member?.email && (
                                        <button
                                          onClick={() => sendInviteEmail(activeClub, member)}
                                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2 px-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors bg-slate-100 dark:bg-slate-800"
                                          title="Stuur Uitnodiging"
                                        >
                                          <Mail size={16} />
                                          <span className="text-xs font-bold">Uitnodigen</span>
                                        </button>
                                      )}
                                      {currentUser.role === 'applicatiebeheerder' && (
                                        <button
                                          onClick={() => removeMemberFromClub(activeClub.id, member!.id)}
                                          className="p-2 px-3 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors bg-slate-100 dark:bg-slate-800"
                                          title="Verwijderen"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </>
                                  )}
                              </div>
                            </td>

                            {/* Desktop Layout */}
                            <td className="py-4 pl-6 hidden sm:table-cell">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800 dark:text-slate-100 text-left">
                                  {member?.shortName || member?.name}
                                </span>
                                {member?.shortName &&
                                  member?.name &&
                                  member.shortName !== member.name && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                      {member.name}
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className="py-4 hidden sm:table-cell">
                              <div className="flex items-center gap-2">
                                {member?.role === "admin" && (
                                  <div
                                    className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"
                                    title="Beheerder"
                                  >
                                    <ShieldCheck size={16} />
                                  </div>
                                )}
                                {member?.role === "planner" && (
                                  <div
                                    className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
                                    title="Planner"
                                  >
                                    <Calendar size={16} />
                                  </div>
                                )}
                                {member?.role === "member" && (
                                  <div
                                    className="p-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-lg"
                                    title="Speler"
                                  >
                                    <UserIcon size={16} />
                                  </div>
                                )}
                                {member?.active === false && (
                                  <div
                                    className="p-1.5 px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold"
                                    title="Inactief"
                                  >
                                    Inactief
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                              {member?.email}
                            </td>
                            <td className="py-4 pr-6 text-right hidden sm:table-cell">
                              <div className="flex justify-end gap-2">
                                {(isClubAdmin(activeClub, currentUser) ||
                                  currentUser.role === "admin" ||
                                  currentUser.role === "planner") &&
                                  member?.id !== currentUser.id && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingMemberId(member!.id);
                                          setNewMemberName(member!.name);
                                          setNewMemberShortName(
                                            member!.shortName || "",
                                          );
                                          setNewMemberEmail(member!.email);
                                          setNewMemberAvg(member!.baseAverage);
                                          setNewMemberRole(member!.role);
                                          setNewMemberParticipatesExternal(
                                            member!
                                              .participatesInExternalMatches ??
                                              false,
                                          );
                                          setNewMemberActive(member!.active ?? true);
                                          setIsMemberModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                        title="Wijzigen"
                                      >
                                        <Pencil size={18} />
                                      </button>
                                      {member?.email && (
                                        <button
                                          onClick={() => sendInviteEmail(activeClub, member)}
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                          title="Stuur Uitnodiging"
                                        >
                                          <Mail size={18} />
                                        </button>
                                      )}
                                      {currentUser.role === 'applicatiebeheerder' && (
                                        <button
                                          onClick={() =>
                                            removeMemberFromClub(
                                              activeClub.id,
                                              member!.id,
                                            )
                                          }
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                          title="Verwijderen"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      )}
                                    </>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>`;

if (content.includes(targetTable)) {
  content = content.replace(targetTable, replacementTable);
  console.log("Successfully replaced the members table layout.");
} else {
  console.log("Could not find the target members table content.");
}

fs.writeFileSync('src/App.tsx', content);
