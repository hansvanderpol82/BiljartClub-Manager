const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const badBlock = `  const liveMatch = useMemo(() => {
  const isLiveMatchLocked = useMemo(() => {
    if (!liveMatch || !currentUser) return false;
    return liveMatch.activeScorerId && liveMatch.activeScorerId !== currentUser.id;
  }, [liveMatch, currentUser]);
`;
const goodBlock = `  const liveMatch = useMemo(() => {\n`;
app = app.replace(badBlock, goodBlock);

const endOfLiveMatch = `    return null;
  }, [data.matches, data.externalMatches, actualCastMatchId]);`;
const lockedLogic = `
  const isLiveMatchLocked = useMemo(() => {
    if (!liveMatch || !currentUser) return false;
    return liveMatch.activeScorerId && liveMatch.activeScorerId !== currentUser.id;
  }, [liveMatch, currentUser]);
`;
app = app.replace(endOfLiveMatch, endOfLiveMatch + lockedLogic);
fs.writeFileSync('src/App.tsx', app);
