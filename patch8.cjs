const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "                    const absenceHistory = (data.notifications || [])\\n                      .filter((n: any) => n.type === 'absence_request')\\n                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());",
  "                    const absenceHistory = (data.notifications || [])\\n                      .filter((n: any) => n.type === 'absence_request')\\n                      .filter((n: any) => !n.targetClubId || appUserClubs.some((c: Club) => c.id === n.targetClubId) || currentUser.role === 'applicatiebeheerder')\\n                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched absenceHistory");
