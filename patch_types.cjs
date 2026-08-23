const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf-8');
if (!types.includes('activeScorerId')) {
  types = types.replace('turns?: { player1: number; player2: number }[];', 'turns?: { player1: number; player2: number }[];\n  activeScorerId?: string;\n  activeScorerName?: string;');
  types = types.replace('turns?: { player1: number; player2: number }[];', 'turns?: { player1: number; player2: number }[];\n  activeScorerId?: string;\n  activeScorerName?: string;'); // Just replacing both occurrences if there are two
  fs.writeFileSync('src/types.ts', types);
}
