const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `const isClubAdmin = (club: Club | null | undefined, user: User | null | undefined) => {
  if (!club || !user) return false;
  if (user.role === 'applicatiebeheerder' && club.allowAppAdminAccess) return true;
  return club.adminId === user.id || (club.coAdminEmails || []).includes(user.email);
};`;

const replace = `const isClubAdmin = (club: Club | null | undefined, user: User | null | undefined) => {
  if (!club || !user) return false;
  if (user.role === 'applicatiebeheerder' && club.allowAppAdminAccess) return true;
  return club.adminId === user.id || (club.coAdminEmails || []).includes(user.email);
};

const isUserInClub = (club: Club | null | undefined, user: User | null | undefined) => {
  if (!club || !user) return false;
  return (club.memberIds || []).includes(user.id) || isClubAdmin(club, user);
};`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched isUserInClub");
} else {
  console.log("Failed to find isClubAdmin");
}
