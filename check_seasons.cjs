const fs = require('fs');

// Load backup
const data = JSON.parse(fs.readFileSync('backup_appData.json', 'utf8'));

console.log("Seasons in backup:");
(data.seasons || []).forEach(s => console.log(s.id, s.name));

const seasonIdsInBackup = new Set((data.seasons || []).map(s => s.id));
const missingSeasonIds = new Set();
(data.matches || []).forEach(m => {
    if (!seasonIdsInBackup.has(m.seasonId)) {
        missingSeasonIds.add(m.seasonId);
    }
});

console.log("\nMatches referring to missing season IDs in backup:");
missingSeasonIds.forEach(id => {
    const matchesCount = (data.matches || []).filter(m => m.seasonId === id).length;
    console.log(`Missing Season ID: ${id}, Matches Count: ${matchesCount}`);
});

