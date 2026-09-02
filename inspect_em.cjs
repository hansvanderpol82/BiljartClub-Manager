const fs = require('fs');
const data = JSON.parse(fs.readFileSync('backup_appData.json', 'utf8'));
console.log(JSON.stringify(data.externalMatches, null, 2));
