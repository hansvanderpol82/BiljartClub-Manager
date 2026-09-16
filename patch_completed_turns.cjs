const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  const p1CompletedTurns =
    activeScoringPlayer === 2 ? activeTurnIndex + 1 : activeTurnIndex;
  const p2CompletedTurns = activeTurnIndex;`;

const replace = `  const p1CompletedTurns = isMatchFinished 
    ? (liveMatch?.turns?.length || 0)
    : (activeScoringPlayer === 2 ? activeTurnIndex + 1 : activeTurnIndex);
  const p2CompletedTurns = isMatchFinished
    ? (liveMatch?.turns?.length || 0)
    : activeTurnIndex;`;

if (content.includes('const p1CompletedTurns =')) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched completed turns.");
} else {
  console.log("Not found.");
}
