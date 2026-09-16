const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                                      const turn = match?.turns[idx];
                                      const isCurrent = idx === activeTurnIndex;
                                      const isPlayed = !!turn || isCurrent;`;
const replace = `                                      const turn = match?.turns[idx];
                                      const isCurrent = !isMatchFinished && idx === activeTurnIndex;
                                      const isPlayed = !!turn || isCurrent;`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched mobile turn table.");
} else {
  console.log("Not found.");
}
