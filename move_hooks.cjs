const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf-8');

const hooksToMove = `
  const appUserClubs = useMemo(() => {
    if (!currentUser || !data?.clubs) return [];
    return data.clubs.filter((c: Club) => 
      (c.memberIds || []).includes(currentUser.id) || 
      (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess)
    );
  }, [currentUser, data?.clubs]);

  const accessibleBoardMessages = useMemo(() => {
    if (!currentUser || !data?.boardMessages) return [];
    return data.boardMessages.filter((m: BoardMessage) => {
      if (m.deletedBy?.includes(currentUser.id) || m.archivedBy?.includes(currentUser.id)) return false;
      if (m.targetClubId && !appUserClubs.some((c: Club) => c.id === m.targetClubId) && currentUser.role !== "applicatiebeheerder") return false;
      if (m.targetRoles && m.targetRoles.length > 0 && !m.targetRoles.includes(currentUser.role)) return false;
      return true;
    }).sort((a: BoardMessage, b: BoardMessage) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, data?.boardMessages, appUserClubs]);
`;

// Make sure we're replacing the exact string by matching it carefully
let newCode = code.replace(hooksToMove, '');

// Insert it right before "const isCastQuery ="
const targetAnchor = '  const isCastQuery = new URLSearchParams(window.location.search).get("cast") === "true";';
newCode = newCode.replace(targetAnchor, hooksToMove + '\n' + targetAnchor);

if (code !== newCode) {
  fs.writeFileSync('src/App.tsx', newCode);
  console.log('Hooks moved successfully.');
} else {
  console.log('Failed to find strings for replacement.');
}
