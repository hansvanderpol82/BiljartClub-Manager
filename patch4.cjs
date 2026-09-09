const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Patch 1: appUserClubs
content = content.replace(
  /const appUserClubs = useMemo\(\(\) => \{\n    if \(!currentUser \|\| !data\?\.clubs\) return \[\];\n    return data\.clubs\.filter\(\(c: Club\) => \n      \(c\.memberIds \|\| \[\]\)\.includes\(currentUser\.id\) \|\|\n      \(currentUser\.role === 'applicatiebeheerder' && c\.allowAppAdminAccess\)\n    \);\n  \}, \[currentUser, data\?\.clubs\]\);/g,
  'const appUserClubs = useMemo(() => {\\n    if (!currentUser || !data?.clubs) return [];\\n    return data.clubs.filter((c: Club) => \\n      (c.memberIds || []).includes(currentUser.id) ||\\n      isClubAdmin(c, currentUser) ||\\n      (currentUser.role === "applicatiebeheerder" && c.allowAppAdminAccess)\\n    );\\n  }, [currentUser, data?.clubs]);'
);

// Patch 2: userClubs
content = content.replace(
  /const userClubs = data\.clubs\.filter\(\(c: Club\) => \n    \(c\.memberIds \|\| \[\]\)\.includes\(currentUser\.id\) \|\|\n    \(currentUser\.role === 'applicatiebeheerder' && c\.allowAppAdminAccess\)\n  \);/g,
  'const userClubs = data.clubs.filter((c: Club) => \\n    (c.memberIds || []).includes(currentUser.id) ||\\n    isClubAdmin(c, currentUser) ||\\n    (currentUser.role === "applicatiebeheerder" && c.allowAppAdminAccess)\\n  );'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched userClubs");
