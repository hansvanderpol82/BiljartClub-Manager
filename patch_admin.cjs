const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Make Hans an applicatiebeheerder
content = content.replace(
  'const isAppAdminEmail = authUser.email === "info@hans-apps.com";',
  'const isAppAdminEmail = authUser.email === "info@hans-apps.com" || authUser.email === "hansvanderpol82@gmail.com";'
);

// 2. Safely replace `currentUser.role === "admin"` with `(currentUser.role === "admin" || currentUser.role === "applicatiebeheerder")`
// We will do this carefully using a regex, avoiding places we might double-replace.
content = content.replace(/currentUser\.role === "admin"/g, '(currentUser.role === "admin" || currentUser.role === "applicatiebeheerder")');

// 3. Fix double replacements if they occurred:
content = content.replace(/\(\(currentUser\.role === "admin" \|\| currentUser\.role === "applicatiebeheerder"\) \|\| currentUser\.role === "applicatiebeheerder"\)/g, '(currentUser.role === "admin" || currentUser.role === "applicatiebeheerder")');

// 4. Ensure "Nieuw Seizoen" is visible to applicatiebeheerder even if not isClubAdmin
// Around line 6663: {isClubAdmin(activeClub, currentUser) && ( ... <Plus size={16} /> <span className="hidden lg:inline">Nieuw Seizoen</span>
content = content.replace(
  /\{isClubAdmin\(activeClub, currentUser\) && \(\s*<button\s*onClick=\{\(\) => setIsSeasonModalOpen\(true\)\}/g,
  '{(isClubAdmin(activeClub, currentUser) || currentUser.role === "applicatiebeheerder") && (\\n                  <button\\n                    onClick={() => setIsSeasonModalOpen(true)}'
);

// 5. Ensure "Seizoen verwijderen" wrapper allows applicatiebeheerder to see it
// Around line 10036: {isClubAdmin(activeClub, currentUser) && ( ... <button onClick={() => toggleBlockSeason(season.id)}
content = content.replace(
  /\{isClubAdmin\(activeClub, currentUser\) && \(\s*<div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">/g,
  '{(isClubAdmin(activeClub, currentUser) || currentUser.role === "applicatiebeheerder") && (\\n                              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched roles");
