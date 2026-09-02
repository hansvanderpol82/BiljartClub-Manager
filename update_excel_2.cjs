const fs = require('fs');
let content = fs.readFileSync('src/components/ExcelModule.tsx', 'utf8');

const oldTemplateGen = `    // Sheet 3: Wedstrijden
    const wedstrijdenHeaders = [
      "Datum (YYYY-MM-DD)",
      "Speler 1",
      "Speler 2",
      "Arbiter",
      "Schrijver",
      "Inleg 1 Betaald (Ja/Nee)",
      "Inleg 2 Betaald (Ja/Nee)",
      "Moyenne 1",
      "Moyenne 2"
    ];
    for (let i = 1; i <= beurtenPerWedstrijd; i++) wedstrijdenHeaders.push(\`Car. \${i} S1\`);
    for (let i = 1; i <= beurtenPerWedstrijd; i++) wedstrijdenHeaders.push(\`Car. \${i} S2\`);
    const wedstrijdenData = [wedstrijdenHeaders];
    const wedstrijdenSheet = XLSX.utils.aoa_to_sheet(wedstrijdenData);`;

const newTemplateGen = `    // Sheet 3: Wedstrijden
    const wedstrijdenHeaders = [
      "Datum (DD-MM-YYYY)",
      "Speler 1",
      "Speler 2",
      "Arbiter",
      "Schrijver",
      "Inleg 1 Betaald (Ja/Nee)",
      "Inleg 2 Betaald (Ja/Nee)",
      "Moyenne 1",
      "Moyenne 2"
    ];
    for (let i = 1; i <= beurtenPerWedstrijd; i++) wedstrijdenHeaders.push(\`Car. \${i} S1\`);
    for (let i = 1; i <= beurtenPerWedstrijd; i++) wedstrijdenHeaders.push(\`Car. \${i} S2\`);
    const wedstrijdenData = [wedstrijdenHeaders];

    // Pre-fill matches based on matchesPerPair
    for (let m = 0; m < matchesPerPair; m++) {
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

    const wedstrijdenSheet = XLSX.utils.aoa_to_sheet(wedstrijdenData);`;

content = content.replace(oldTemplateGen, newTemplateGen);

fs.writeFileSync('src/components/ExcelModule.tsx', content);
console.log("Updated Excel module generation successfully!");
