const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf-8');
types = types.replace(/activeScorerId\?: string;\s*activeScorerName\?: string;\s*/g, '');
types = types.replace('player2Paid?: boolean;', 'player2Paid?: boolean;\n  activeScorerId?: string;\n  activeScorerName?: string;');
types = types.replace('awayPlayerPaid?: boolean;', 'awayPlayerPaid?: boolean;\n  activeScorerId?: string;\n  activeScorerName?: string;');
fs.writeFileSync('src/types.ts', types);
