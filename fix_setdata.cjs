const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `            setData({
              ...initialData,
              ...parsed,
              externalMatches: uniqueById((parsed.externalMatches || initialData.externalMatches).filter(Boolean)),
              matches: uniqueById((parsed.matches || initialData.matches).filter(Boolean)),
              seasons: uniqueById((parsed.seasons || initialData.seasons).filter(Boolean)),
              clubs: uniqueById((parsed.clubs || initialData.clubs).filter(Boolean)),
              users: uniqueById((parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean)),
              notifications: uniqueById((parsed.notifications || []).filter(Boolean)),
              boardMessages: uniqueById((parsed.boardMessages || []).filter(Boolean)),
            });`;

const repStr = `            setData(parsed);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Cleaned up setData in App.tsx");
