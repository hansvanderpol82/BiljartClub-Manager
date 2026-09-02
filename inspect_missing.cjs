const fs = require('fs');

const rawData = fs.readFileSync('backup_appData.json', 'utf8');
const data = JSON.parse(rawData);

console.log("Seasons in backup:");
data.seasons.forEach(s => console.log(s.id, s.name, s.type));

console.log("\nExternal matches in backup:");
if (data.externalMatches) {
    data.externalMatches.forEach(m => console.log(m.id, m.name, m.opponent));
}
