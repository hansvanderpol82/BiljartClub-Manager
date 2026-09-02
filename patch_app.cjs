const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const cleanupCode = `
  useEffect(() => {
    if (dataLoaded && currentUser && currentUser.role === "applicatiebeheerder" && data?.matches?.length > 0) {
      const hansJrId = "9yaorw2vb";
      const frankId = data.users.find(u => u.name.toLowerCase().includes("frank"))?.id;
      
      if (frankId) {
        const hasBadMatches = data.matches.some(m => 
          m.date.startsWith("2026-04-09") && 
          ((m.player1Id === hansJrId && m.player2Id === frankId) || 
           (m.player2Id === hansJrId && m.player1Id === frankId))
        );
        
        if (hasBadMatches) {
          console.log("Removing bad matches for Hans jr and Frank on 2026-04-09");
          setData(prev => ({
            ...prev,
            matches: prev.matches.filter(m => !(
              m.date.startsWith("2026-04-09") && 
              ((m.player1Id === hansJrId && m.player2Id === frankId) || 
               (m.player2Id === hansJrId && m.player1Id === frankId))
            ))
          }));
        }
      }
    }
  }, [dataLoaded, currentUser, data]);
`;

if (!content.includes('Removing bad matches for Hans jr and Frank')) {
  content = content.replace(
    '  useEffect(() => { dataRef.current = data; }, [data]);',
    '  useEffect(() => { dataRef.current = data; }, [data]);\n' + cleanupCode
  );
  fs.writeFileSync('src/App.tsx', content);
  console.log("App.tsx patched");
}
