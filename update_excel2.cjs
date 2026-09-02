const fs = require('fs');
let content = fs.readFileSync('src/components/ExcelModule.tsx', 'utf8');

const regex = /\/\/ Parse turns[\s\S]*?as Match\);\s*\}/;

const newMatchProcessing = `// Parse turns
          const turns = [];
          let p1Total = 0;
          let p2Total = 0;
          let p1BeurtCount = 0;
          let p2BeurtCount = 0;
          
          for (let i = 1; i <= sBeurten; i++) {
             const c1Str = w[\`Car. \${i} S1\`];
             const c2Str = w[\`Car. \${i} S2\`];
             
             let p1 = 0;
             let p2 = 0;
             let hasTurn = false;
             
             if (c1Str !== undefined && c1Str !== '') {
                 p1 = parseInt(c1Str) || 0;
                 p1Total += p1;
                 p1BeurtCount++;
                 hasTurn = true;
             }
             if (c2Str !== undefined && c2Str !== '') {
                 p2 = parseInt(c2Str) || 0;
                 p2Total += p2;
                 p2BeurtCount++;
                 hasTurn = true;
             }
             
             if (hasTurn) {
                 turns.push({ player1: p1, player2: p2 });
             }
          }
          
          // Backwards compatibility with old template
          if (turns.length === 0) {
              p1Total = parseInt(w["Score 1"]) || 0;
              p2Total = parseInt(w["Score 2"]) || 0;
              p1BeurtCount = parseInt(w["Beurten 1"]) || sBeurten;
              p2BeurtCount = parseInt(w["Beurten 2"]) || sBeurten;
          }

          const mId = 'match_' + Math.random().toString(36).substr(2, 9);
          newMatches.push({
            id: mId,
            seasonId: newSeasonId,
            clubId: activeClub.id,
            date: w["Datum (YYYY-MM-DD)"] || new Date().toISOString().split('T')[0],
            player1Id: p1Id,
            player2Id: p2Id,
            arbiterId: arbiterId,
            writerId: writerId,
            status: 'finished',
            player1AvgBefore: p1Avg,
            player2AvgBefore: p2Avg,
            player1Score: p1Total,
            player2Score: p2Total,
            player1Beurten: p1BeurtCount,
            player2Beurten: p2BeurtCount,
            turns: turns,
            player1Paid: w["Inleg 1 Betaald (Ja/Nee)"]?.toString().toLowerCase() === 'ja',
            player2Paid: w["Inleg 2 Betaald (Ja/Nee)"]?.toString().toLowerCase() === 'ja'
          } as Match);
        }`;

content = content.replace(regex, newMatchProcessing);
fs.writeFileSync('src/components/ExcelModule.tsx', content);
console.log("Updated ExcelModule.tsx again for correct totals");
