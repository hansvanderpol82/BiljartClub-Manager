const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const searchLiveMatchDef = `  const liveMatch = useMemo(() => {`;
const lockedLogic = `
  const isLiveMatchLocked = useMemo(() => {
    if (!liveMatch || !currentUser) return false;
    return liveMatch.activeScorerId && liveMatch.activeScorerId !== currentUser.id;
  }, [liveMatch, currentUser]);
`;
if (app.indexOf('isLiveMatchLocked') === -1) {
    app = app.replace(searchLiveMatchDef, searchLiveMatchDef + lockedLogic);
    fs.writeFileSync('src/App.tsx', app);
}
