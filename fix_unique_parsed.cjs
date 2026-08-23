const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `          if (parsed.users) {
            // Lowercase all emails first`;

const repStr = `          parsed.externalMatches = uniqueById((parsed.externalMatches || initialData.externalMatches).filter(Boolean));
          parsed.matches = uniqueById((parsed.matches || initialData.matches).filter(Boolean));
          parsed.seasons = uniqueById((parsed.seasons || initialData.seasons).filter(Boolean));
          parsed.clubs = uniqueById((parsed.clubs || initialData.clubs).filter(Boolean));
          parsed.users = uniqueById((parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean));
          parsed.notifications = uniqueById((parsed.notifications || []).filter(Boolean));
          parsed.boardMessages = uniqueById((parsed.boardMessages || []).filter(Boolean));
          
          if (parsed.users) {
            // Lowercase all emails first`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Applied uniqueById directly to parsed");
