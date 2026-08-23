const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const search = `
  const isLiveMatchLocked = useMemo(() => {
    if (!liveMatch || !currentUser) return false;
    return liveMatch.activeScorerId && liveMatch.activeScorerId !== currentUser.id;
  }, [liveMatch, currentUser]);
`;
app = app.replace(search, '');
const target = `  const isDriebandenLive = liveMatch?.scoringSystem === 'driebanden' || liveCurrentSeason?.scoringSystem === 'driebanden';`;
app = app.replace(target, target + search);
fs.writeFileSync('src/App.tsx', app);
