const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// replace all instances of {activeTab === "external-matches-games" && `Uit & Thuis Wedstrijden`} with nothing, then add it exactly once.
content = content.replace(/\{activeTab === "external-matches-games" &&\s*\`Uit & Thuis Wedstrijden\`\}/g, '');

content = content.replace(/\{activeTab === "matches" &&\s*\`Wedstrijden \$\{activeSeason \? \`\(\$\{activeSeason\.name\}\)\` : ""\}\`\}/, match => {
  return match + '\n              {activeTab === "external-matches-games" && "Uit & Thuis Wedstrijden"}';
});

fs.writeFileSync('src/App.tsx', content);
