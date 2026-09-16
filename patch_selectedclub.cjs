const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  useEffect(() => {
    localStorage.setItem("selectedClubId", selectedClubId || "");
  }, [selectedClubId]);`;

const replace = `  useEffect(() => {
    localStorage.setItem("selectedClubId", selectedClubId || "");
  }, [selectedClubId]);

  useEffect(() => {
    if (dataLoaded && currentUser && data.clubs) {
      const allowed = data.clubs.filter((c: Club) => isUserInClub(c, currentUser));
      if (selectedClubId) {
        if (!allowed.find((c: Club) => c.id === selectedClubId)) {
           setSelectedClubId(allowed.length > 0 ? allowed[0].id : null);
        }
      } else if (allowed.length > 0) {
        setSelectedClubId(allowed[0].id);
      }
    }
  }, [dataLoaded, currentUser, data.clubs, selectedClubId]);`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched selectedClubId validation");
} else {
  console.log("Failed to find selectedClubId useEffect");
}
