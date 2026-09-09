const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update first block
content = content.replace(
  '    if (m.targetRoles && m.targetRoles.length > 0 && !m.targetRoles.includes(currentUser.role)) return false;',
  '    if (m.targetRoles && m.targetRoles.length > 0) {\\n      const isClubAdminForMsg = m.targetClubId ? isClubAdmin(data.clubs.find((c: Club) => c.id === m.targetClubId), currentUser) : false;\\n      if (!m.targetRoles.includes(currentUser.role) && !isClubAdminForMsg) return false;\\n    }'
);

// Update second block (useMemo)
content = content.replace(
  '      if (m.targetRoles && m.targetRoles.length > 0 && !m.targetRoles.includes(currentUser.role)) return false;',
  '      if (m.targetRoles && m.targetRoles.length > 0) {\\n        const isClubAdminForMsg = m.targetClubId ? isClubAdmin(data.clubs.find((c: Club) => c.id === m.targetClubId), currentUser) : false;\\n        if (!m.targetRoles.includes(currentUser.role) && !isClubAdminForMsg) return false;\\n      }'
);

// We need to also ensure activeNotifications is visible to co-admins
content = content.replace(
  '  const activeNotifications = notifications.filter((n: any) => {\\n    if (n.deletedBy?.includes(currentUser.id) || n.archivedBy?.includes(currentUser.id)) return false;\\n    \\n    if (n.targetClubId && !userClubs.some((c: Club) => c.id === n.targetClubId) && currentUser.role !== "applicatiebeheerder") return false;\\n\\n    if (n.targetRoles && n.targetRoles.length > 0 && !n.targetRoles.includes(currentUser.role)) return false;\\n\\n    return !n.readBy?.includes(currentUser.id) || n.keptOnHomeBy?.includes(currentUser.id);\\n  });',
  '  const activeNotifications = notifications.filter((n: any) => {\\n    if (n.deletedBy?.includes(currentUser.id) || n.archivedBy?.includes(currentUser.id)) return false;\\n    \\n    if (n.targetClubId && !userClubs.some((c: Club) => c.id === n.targetClubId) && currentUser.role !== "applicatiebeheerder") return false;\\n\\n    if (n.targetRoles && n.targetRoles.length > 0) {\\n      const isClubAdminForNotif = n.targetClubId ? isClubAdmin(data.clubs.find((c: Club) => c.id === n.targetClubId), currentUser) : false;\\n      if (!n.targetRoles.includes(currentUser.role) && !isClubAdminForNotif) return false;\\n    }\\n\\n    return !n.readBy?.includes(currentUser.id) || n.keptOnHomeBy?.includes(currentUser.id);\\n  });'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched targetRoles");
