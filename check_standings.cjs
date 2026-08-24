const fs = require('fs');
import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       
       data.seasons.forEach(season => {
         // Re-implement getSeasonStandings roughly, or just check members
         // Standings are usually just mapped from season.members.
       });
       process.exit(0);
    });
  })
})
