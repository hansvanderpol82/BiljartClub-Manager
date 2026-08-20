const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `  const [selectedClubId, setSelectedClubId] = useState<string | null>(() =>`;
const replacement = `  const [mobileSubmenu, setMobileSubmenu] = useState<"home" | "clubs" | "profile" | "settings" | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(() =>`;
code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
