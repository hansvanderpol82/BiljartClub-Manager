const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    const userClubs = data.clubs.filter((c: Club) => 
      (c.memberIds || []).includes(currentUser.id) ||
      isClubAdmin(c, currentUser) ||
      (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess)
    );`;

const replace = `    const userClubs = data.clubs.filter((c: Club) => isUserInClub(c, currentUser));`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched executeCreateBoardMessage userClubs");
} else {
  console.log("Failed to find executeCreateBoardMessage userClubs");
}
