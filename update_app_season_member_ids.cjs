const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    if (isSeasonModalOpen && activeClub) {
      setNewSeasonMemberIds(activeClub.memberIds || []);
    }
  }, [isSeasonModalOpen, activeClub]);`;

const replacementEffect = `  useEffect(() => {
    if (isSeasonModalOpen && activeClub) {
      const activeIds = (activeClub.memberIds || []).filter(id => {
        const u = data.users.find((user) => user.id === id);
        return u && u.active !== false;
      });
      setNewSeasonMemberIds(activeIds);
    }
  }, [isSeasonModalOpen, activeClub, data.users]);`;

appContent = appContent.replace(targetEffect, replacementEffect);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
