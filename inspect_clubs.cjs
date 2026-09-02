const fs = require('fs');
const data = JSON.parse(fs.readFileSync('backup_appData.json', 'utf8'));
console.log(data.clubs);
