const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchP1 = `                            {Array.from({ length: maxTurns }).map((_, idx) => {
                              const turn = match?.turns[idx];
                              const isCurrent = idx === activeTurnIndex;`;
const replaceP1 = `                            {Array.from({ length: maxTurns }).map((_, idx) => {
                              const turn = match?.turns[idx];
                              const isCurrent = !isMatchFinished && idx === activeTurnIndex;`;

content = content.replace(searchP1, replaceP1); // Both P1 and P2 use the exact same code structure, wait...
// No, they are identical lines! So doing it with a global replace should work if we use RegExp.

content = content.replace(/const isCurrent = idx === activeTurnIndex;\s*if \(\!turn && \!isCurrent\) return null;/g, `const isCurrent = !isMatchFinished && idx === activeTurnIndex;
                              if (!turn && !isCurrent) return null;`);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched desktop side columns.");
