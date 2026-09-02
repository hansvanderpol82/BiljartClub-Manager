const fs = require('fs');
let content = fs.readFileSync('src/components/ExcelModule.tsx', 'utf8');

// I need to find console.warn(\`Kan speler niet vinden voor wedstrijd: \${p1Name} vs \${p2Name}\`);
content = content.replace(
  "console.warn(\\`Kan speler niet vinden voor wedstrijd: \\${p1Name} vs \\${p2Name}\\`);",
  "console.warn(`Kan speler niet vinden voor wedstrijd: ${p1Name} vs ${p2Name}`);"
);

fs.writeFileSync('src/components/ExcelModule.tsx', content);
