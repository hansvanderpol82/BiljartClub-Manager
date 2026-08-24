const fs = require('fs');

import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       console.log("Users:", data.users.filter(u => u.id === "yw26qzyci"));
       console.log("Matches:", data.matches.filter(m => m.id === "yw26qzyci"));
       console.log("Seasons:", data.seasons.filter(s => s.id === "yw26qzyci"));
       process.exit(0);
    });
  })
})
