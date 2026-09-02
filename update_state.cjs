const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \[newSeasonCarryoverSeasonId, setNewSeasonCarryoverSeasonId\] =\s*useState<string>\(""\);\n  const \[newSeasonScoringSystem, setNewSeasonScoringSystem\] = useState<\n    "default" \| "driebanden"\n  >\("default"\);/;

content = content.replace(regex, \`const [newSeasonCarryoverSeasonId, setNewSeasonCarryoverSeasonId] =
    useState<string>("");
  const [newSeasonScoringSystem, setNewSeasonScoringSystem] = useState<
    "default" | "driebanden"
  >("default");
  const [showScoringInfoModal, setShowScoringInfoModal] = useState(false);\`);

fs.writeFileSync('src/App.tsx', content);
