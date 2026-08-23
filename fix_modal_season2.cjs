const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const lines = content.split('\n');

for (let i = 16500; i < 16800; i++) {
  if (lines[i] && lines[i].includes('isContributionsDetailModalOpen')) {
    lines[i] = lines[i].replace('isContributionsDetailModalOpen && activeSeason', 'isContributionsDetailModalOpen && (data.seasons.find((s: Season) => s.id === contributionsDetailSeasonId) || activeSeason)');
  } else if (lines[i]) {
    lines[i] = lines[i].replace(/activeSeason\./g, '(data.seasons.find((s: Season) => s.id === contributionsDetailSeasonId) || activeSeason).');
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log("Updated activeSeason in modal");
