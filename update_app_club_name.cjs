const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetSpan = `<span className="whitespace-nowrap truncate">
              {activeClub?.name || "BiljartClub"}
            </span>`;

const replacementSpan = `<span className="whitespace-normal break-words leading-tight">
              {activeClub?.name || "BiljartClub"}
            </span>`;

appContent = appContent.replace(targetSpan, replacementSpan);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
