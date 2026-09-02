const fs = require('fs');

const rawData = fs.readFileSync('backup_appData.json', 'utf8');
const data = JSON.parse(rawData);

console.log("External Matches in Backup:", JSON.stringify(data.externalMatches, null, 2));

