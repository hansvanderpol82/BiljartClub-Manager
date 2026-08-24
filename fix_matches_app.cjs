const fs = require('fs');

const script = `
  // ONE-TIME FIX FOR MERGED ANTOON
  useEffect(() => {
    if ((currentUser?.role === 'admin' || currentUser?.role === 'applicatiebeheerder') && data?.matches && !localStorage.getItem('antoon_fix_applied_3')) {
      const antoon = data.users.find(u => u.name === 'Antoon');
      if (!antoon) return;
      
      const bandSeason = data.seasons.find(s => s.name.includes('Bandstoten 2026'));
      if (!bandSeason) return;

      const nameToAvg = { "Antoon": 34, "Martien": 30, "Ad": 7, "Jo": 7, "Mustafa": 16, "Hassan": 26, "Yusuf": 15, "Yasar": 38 };
      
      const missingNames = Object.keys(nameToAvg).filter(name => !data.users.some(u => u.name === name || u.shortName === name));
      if (missingNames.length > 0) {
        console.log("Waiting for user to add missing users:", missingNames);
        return; // wait until they are added
      }
      
      const avgToUserId = {};
      Object.keys(nameToAvg).forEach(name => {
        const u = data.users.find(u => u.name === name || u.shortName === name);
        if (u) avgToUserId[nameToAvg[name]] = u.id;
      });
      
      const adId = data.users.find(u => u.name === 'Ad' || u.shortName === 'Ad').id;
      const joId = data.users.find(u => u.name === 'Jo' || u.shortName === 'Jo').id;

      // The exact assignment of Ad vs Jo for the 18 slots of average 7
      const assignment = ['Ad', 'Ad', 'Ad', 'Ad', 'Ad', 'Jo', 'Ad', 'Ad', 'Jo', 'Ad', 'Jo', 'Jo', 'Jo', 'Jo', 'Jo', 'Jo', 'Ad', 'Jo'];
      let slotIdx = 0;
      
      let matchesChanged = false;
      const newMatches = data.matches.map(m => {
        if (m.seasonId !== bandSeason.id) return m;
        let changed = false;
        const mCopy = { ...m };
        
        if (mCopy.player1Id === antoon.id) {
          if (mCopy.player1AvgBefore === 7) {
             mCopy.player1Id = assignment[slotIdx] === 'Ad' ? adId : joId;
             slotIdx++;
          } else {
             mCopy.player1Id = avgToUserId[mCopy.player1AvgBefore] || antoon.id;
          }
          changed = true;
        }
        if (mCopy.player2Id === antoon.id) {
          if (mCopy.player2AvgBefore === 7) {
             mCopy.player2Id = assignment[slotIdx] === 'Ad' ? adId : joId;
             slotIdx++;
          } else {
             mCopy.player2Id = avgToUserId[mCopy.player2AvgBefore] || antoon.id;
          }
          changed = true;
        }
        if (changed) matchesChanged = true;
        return mCopy;
      });
      
      if (matchesChanged) {
        // We also need to fix the members in the season
        const newSeasonMembers = [...bandSeason.members];
        Object.keys(nameToAvg).forEach(name => {
           const u = data.users.find(u => u.name === name || u.shortName === name);
           if (u && !newSeasonMembers.some(sm => sm.userId === u.id)) {
               newSeasonMembers.push({ userId: u.id, currentAverage: nameToAvg[name], paidContributie: false });
           }
        });
        
        const newSeasons = data.seasons.map(s => s.id === bandSeason.id ? { ...s, members: newSeasonMembers } : s);
        
        console.log("Applying Antoon matches fix...");
        setData(prev => ({ ...prev, matches: newMatches, seasons: newSeasons }));
        localStorage.setItem('antoon_fix_applied_3', 'true');
      }
    }
  }, [currentUser, data]);
`;

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const target = '  useEffect(() => {';
content = content.replace(target, script + '\n' + target);
fs.writeFileSync('src/App.tsx', content);
