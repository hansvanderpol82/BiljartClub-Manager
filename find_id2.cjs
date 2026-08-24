const fs = require('fs');

import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       console.log("Clubs with yw26qzyci:", data.clubs.filter(c => c.memberIds && c.memberIds.filter(id => id === "yw26qzyci").length > 1));
       console.log("Seasons with yw26qzyci:", data.seasons.filter(s => s.members && s.members.filter(m => m.userId === "yw26qzyci").length > 1));
       process.exit(0);
    });
  })
})
