const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  useEffect\(\(\) => \{\n    if \(dataLoaded && currentUser && currentUser\.role === "applicatiebeheerder" && data\?\.matches\?\.length > 0\) \{[\s\S]*?\}, \[dataLoaded, currentUser, data\]\);/;

const newCode = `  useEffect(() => {
    if (dataLoaded && currentUser && currentUser.role === "applicatiebeheerder" && data?.matches?.length > 0) {
      const hansJrId = "9yaorw2vb";
      const frankId = data.users.find(u => u.name.toLowerCase().includes("frank"))?.id;
      
      if (frankId) {
        const badMatches = data.matches.filter(m => 
          m.date.startsWith("2026-04-09") && 
          ((m.player1Id === hansJrId && m.player2Id === frankId) || 
           (m.player2Id === hansJrId && m.player1Id === frankId))
        );
        
        if (badMatches.length > 0) {
          console.log("Removing bad matches for Hans jr and Frank on 2026-04-09", badMatches);
          
          const newMatches = data.matches.filter(m => !(
            m.date.startsWith("2026-04-09") && 
            ((m.player1Id === hansJrId && m.player2Id === frankId) || 
             (m.player2Id === hansJrId && m.player1Id === frankId))
          ));
          
          const newData = { ...data, matches: newMatches };
          
          // Actually persist to firestore
          import("firebase/firestore").then(({ doc, updateDoc }) => {
            const { db } = require("./lib/firebase");
            const docRef = doc(db, "appData", "main");
            updateDoc(docRef, { data: JSON.stringify(newData) })
              .then(() => console.log("Successfully removed bad matches from Firestore"))
              .catch(e => console.error("Error removing bad matches", e));
          });
        }
      }
    }
  }, [dataLoaded, currentUser, data]);`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Cleanup script updated with Firestore persistence.");
} else {
    console.log("Could not find the script to replace.");
}
