const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\{isClubAdmin\(activeClub, currentUser\) && \(\s*<button\s*onClick=\{\(\) => setIsMemberModalOpen\(true\)\}/g,
  '{(isClubAdmin(activeClub, currentUser) || currentUser.role === "applicatiebeheerder") && (\\n                      <button\\n                        onClick={() => setIsMemberModalOpen(true)}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched Nieuw Lid button");
