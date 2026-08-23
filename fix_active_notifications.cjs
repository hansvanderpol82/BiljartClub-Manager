const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `  const activeNotifications = notifications.filter(
    (n: any) => 
      n.type === 'absence_request' && 
      n.forRole?.includes(currentUser.role) && 
      !n.readBy.includes(currentUser.id)
  );`;

const repStr = `  const activeNotifications = notifications.filter((n: any) => {
    if ((n.readBy || []).includes(currentUser.id)) return false;

    if (n.type === 'absence_request') {
      return n.forRole?.includes(currentUser.role);
    }

    if (n.type === 'privacy_deletion_request') {
      // It's a privacy request for admins of the specific clubs.
      // relatedEntityId contains comma separated club IDs
      const clubIds = (n.relatedEntityId || "").split(",");
      
      const isClubAdmin = data.clubs.some((c: Club) => 
        clubIds.includes(c.id) && 
        (c.adminId === currentUser.id || (c.coAdminEmails || []).includes(currentUser.email))
      );
      
      if (isClubAdmin) return true;

      // Escalate to applicatiebeheerder if older than 14 days and still not read
      if (currentUser.role === 'applicatiebeheerder') {
        const daysOld = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld > 14) {
          return true;
        }
      }

      return false;
    }

    return false;
  });`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Updated activeNotifications filter");
