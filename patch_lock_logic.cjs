const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert isLiveMatchLocked logic
const searchLiveMatchDef = `  const liveMatch = useMemo(() => {`;
const lockedLogic = `
  const isLiveMatchLocked = useMemo(() => {
    if (!liveMatch || !currentUser) return false;
    return liveMatch.activeScorerId && liveMatch.activeScorerId !== currentUser.id;
  }, [liveMatch, currentUser]);
`;
app = app.replace(searchLiveMatchDef, lockedLogic + searchLiveMatchDef);

fs.writeFileSync('src/App.tsx', app);
