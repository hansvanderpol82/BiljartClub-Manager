const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `  const [isContributionsDetailModalOpen, setIsContributionsDetailModalOpen] =
    useState(false);`;
const repStr = `  const [isContributionsDetailModalOpen, setIsContributionsDetailModalOpen] = useState(false);
  const [contributionsDetailSeasonId, setContributionsDetailSeasonId] = useState<string | null>(null);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Added contributionsDetailSeasonId state");
