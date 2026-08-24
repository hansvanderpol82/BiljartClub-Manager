const fs = require('fs');
import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       
       const getSeasonStandings = (season, data) => {
         const matches = (data.matches || []).filter(m => m.seasonId === season.id && m.status === 'completed');
         return season.members.map(mem => {
           let played = 0, won = 0, drawn = 0, lost = 0, points = 0, totalCaramboles = 0, totalBeurten = 0;
           matches.forEach(m => {
             if (m.player1Id === mem.userId || m.player2Id === mem.userId) {
               played++;
               const isP1 = m.player1Id === mem.userId;
               const score = isP1 ? m.score1 : m.score2;
               const oppScore = isP1 ? m.score2 : m.score1;
               const target = isP1 ? m.target1 : m.target2;
               const oppTarget = isP1 ? m.target2 : m.target1;
               
               if (score >= target) won++;
               else if (score / target === oppScore / oppTarget) drawn++;
               else lost++;
               
               if (score >= target) points += 2;
               else if (score / target === oppScore / oppTarget) points += 1;
               
               totalCaramboles += score;
               totalBeurten += (m.beurten || 0);
             }
           });
           const average = totalBeurten > 0 ? (totalCaramboles / totalBeurten) : 0;
           const perc = target => target > 0 ? (totalCaramboles / (target * played)) * 100 : 0;
           
           return {
             userId: mem.userId,
             played, won, drawn, lost, points,
             average: parseFloat(average.toFixed(3)),
             perc: parseFloat(perc(mem.target || 0).toFixed(1)) || 0
           };
         }).sort((a, b) => b.points - a.points || b.perc - a.perc || b.average - a.average);
       };
       
       data.seasons.forEach(season => {
         const standings = getSeasonStandings(season, data);
         const ids = standings.map(s => s.userId);
         const dups = ids.filter((id, index) => ids.indexOf(id) !== index);
         if (dups.length > 0) console.log("Season standings dups:", dups);
       });
       process.exit(0);
    });
  })
})
