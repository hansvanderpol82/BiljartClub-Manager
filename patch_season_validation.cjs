const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  const activeSeason = useMemo(
    () => data.seasons.find((s: Season) => s.id === selectedSeasonId),
    [data.seasons, selectedSeasonId],
  );`;

const replace = `  const activeSeason = useMemo(
    () => data.seasons.find((s: Season) => s.id === selectedSeasonId),
    [data.seasons, selectedSeasonId],
  );

  useEffect(() => {
    if (activeSeason && selectedClubId) {
      if (activeSeason.clubId !== selectedClubId) {
        setSelectedSeasonId(null);
      }
    }
  }, [activeSeason, selectedClubId]);`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched season validation");
} else {
  console.log("Failed to find season validation");
}
