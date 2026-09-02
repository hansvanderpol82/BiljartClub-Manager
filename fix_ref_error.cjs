const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const effectCode = `  useEffect(() => {
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
  }, [dataLoaded, currentUser, data]);\n`;

// Remove it from its current position
content = content.replace(effectCode, '');
// If it has a different indentation or whitespace, we can do a regex replace
content = content.replace(/  useEffect\(\(\) => \{\n    if \(dataLoaded && currentUser && currentUser\.role[\s\S]*?\}, \[dataLoaded, currentUser, data\]\);\n/, '');

// Add it after currentUser declaration
content = content.replace(
  '  const [currentUser, setCurrentUser] = useState<User>(data.users[0]);',
  '  const [currentUser, setCurrentUser] = useState<User>(data.users[0]);\n\n' + effectCode
);

fs.writeFileSync('src/App.tsx', content);
