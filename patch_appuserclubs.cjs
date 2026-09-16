const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  const appUserClubs = useMemo(() => {
    if (!currentUser || !data?.clubs) return [];
    return data.clubs.filter((c: Club) => 
      (c.memberIds || []).includes(currentUser.id) || 
      (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess)
    );
  }, [currentUser, data?.clubs]);`;

const replace = `  const appUserClubs = useMemo(() => {
    if (!currentUser || !data?.clubs) return [];
    return data.clubs.filter((c: Club) => isUserInClub(c, currentUser));
  }, [currentUser, data?.clubs]);`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched appUserClubs");
} else {
  console.log("Failed to find appUserClubs");
}
