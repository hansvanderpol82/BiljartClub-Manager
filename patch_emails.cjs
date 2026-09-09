const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const theadSearch = `<th className="py-2 sm:py-4 text-left">Rol</th>
                        <th className="py-2 sm:py-4 text-left">Email</th>`;
const theadReplace = `<th className="py-2 sm:py-4 text-left">Rol</th>
                        {(currentUser.role !== "member" || isClubAdmin(activeClub, currentUser)) && (
                          <th className="py-2 sm:py-4 text-left">Email</th>
                        )}`;
content = content.replace(theadSearch, theadReplace);

const mobileSearch = `{member?.email && (
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {member.email}
                                </div>
                              )}`;
const mobileReplace = `{member?.email && (currentUser.role !== "member" || isClubAdmin(activeClub, currentUser)) && (
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {member.email}
                                </div>
                              )}`;
content = content.replace(mobileSearch, mobileReplace);

const desktopSearch = `<td className="py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                              {member?.email}
                            </td>`;
const desktopReplace = `{(currentUser.role !== "member" || isClubAdmin(activeClub, currentUser)) && (
                              <td className="py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                                {member?.email}
                              </td>
                            )}`;
content = content.replace(desktopSearch, desktopReplace);

// Let's also check if there is an empty `<td>` if the condition fails, to keep columns aligned?
// No, we removed the `<th>` for the Email column conditionally as well. 
// Let's verify that the table has the correct number of columns in the header and the body.
// The header has: Naam, Rol, Email(conditional), Acties
// The body has: Naam+Roles (mobile view, combined into one <td> with class sm:hidden),
// Desktop layout has:
// Naam <td>
// Rol <td>
// Email <td>
// Acties <td>
// Wait, the mobile view renders the whole row in one <td>, and then desktop renders 4 <td>. Let's make sure the number of `<td>`s matches.

fs.writeFileSync('src/App.tsx', content);
console.log("Patched emails");
