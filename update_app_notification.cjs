const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `Ga naar het <strong>Beheren &gt; Accounts</strong> scherm (als applicatiebeheerder) of stuur een e-mail naar de applicatiebeheerder om dit account te bewerken en het e-mailadres te wissen.`;
const repStr = `Ga naar het <strong>Beheren &gt; Accounts</strong> scherm (als applicatiebeheerder) of stuur een e-mail naar de applicatiebeheerder om dit account te bewerken, de profielfoto te verwijderen, en het e-mailadres te wissen.`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx notification text");
