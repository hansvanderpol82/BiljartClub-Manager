const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetEdit = `                                          setEditingMemberId(member!.id);
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
                                          setIsMemberModalOpen(true);`;

const replacementEdit = `                                          setEditingMemberId(member!.id);
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
                                          setIsMemberModalOpen(true);`;

appContent = appContent.replace(targetEdit, replacementEdit);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
