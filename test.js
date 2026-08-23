const fs = require('fs');
const types = fs.readFileSync('src/types.ts', 'utf-8');
if (!types.includes('activeScorerId')) {
  fs.writeFileSync('src/types.ts', types.replace('turns?: { player1: number; player2: number }[];', 'turns?: { player1: number; player2: number }[];\n  activeScorerId?: string;\n  activeScorerName?: string;').replace('turns?: { player1: number; player2: number }[];', 'turns?: { player1: number; player2: number }[];\n  activeScorerId?: string;\n  activeScorerName?: string;'));
}
