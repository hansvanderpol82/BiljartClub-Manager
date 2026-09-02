const fs = require('fs');
let content = fs.readFileSync('src/components/ExcelModule.tsx', 'utf8');

const anchor = 'const wedstrijdenData = [wedstrijdenHeaders];';
const toAdd = `
    // Pre-fill matches based on matchesPerPair
    const matchesPerPairNum = parseInt(matchesPerPair, 10) || 1;
    for (let m = 0; m < matchesPerPairNum; m++) {
      for (let i = 0; i < clubMembers.length; i++) {
        for (let j = i + 1; j < clubMembers.length; j++) {
          const row = Array(wedstrijdenHeaders.length).fill("");
          row[1] = clubMembers[i].name;
          row[2] = clubMembers[j].name;
          row[5] = "Ja"; // Inleg 1 Betaald
          row[6] = "Ja"; // Inleg 2 Betaald
          row[7] = clubMembers[i].baseAverage.toString();
          row[8] = clubMembers[j].baseAverage.toString();
          wedstrijdenData.push(row);
        }
      }
    }
`;

if(content.includes(anchor) && !content.includes('Pre-fill matches based on matchesPerPair')) {
    content = content.replace(anchor, anchor + toAdd);
}
content = content.replace('"Datum (YYYY-MM-DD)"', '"Datum (DD-MM-YYYY)"');

fs.writeFileSync('src/components/ExcelModule.tsx', content);
console.log("Updated!");
