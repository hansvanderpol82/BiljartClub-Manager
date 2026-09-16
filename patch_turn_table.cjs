const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchMobile = `                                      const isCurrent = idx === activeTurnIndex;
                                      const isPlayed = !!turn || isCurrent;`;
const replaceMobile = `                                      const isCurrent = !isMatchFinished && idx === activeTurnIndex;
                                      const isPlayed = !!turn || isCurrent;`;

const searchDesktop = `                                    const isCurrent = idx === activeTurnIndex;
                                    const isPlayed = !!turn || isCurrent;`;
const replaceDesktop = `                                    const isCurrent = !isMatchFinished && idx === activeTurnIndex;
                                    const isPlayed = !!turn || isCurrent;`;

if (content.includes(searchMobile) || content.includes(searchDesktop)) {
  content = content.replace(new RegExp(searchMobile.replace(/[.*+?^$\/{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replaceMobile);
  content = content.replace(new RegExp(searchDesktop.replace(/[.*+?^$\/{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replaceDesktop);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched turn table.");
} else {
  console.log("Not found.");
}
