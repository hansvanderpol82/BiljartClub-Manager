const fs = require('fs');
import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       data.seasons.forEach(s => {
         const ids = s.members.map(m => m.userId);
         const dups = ids.filter((id, index) => ids.indexOf(id) !== index);
         if (dups.length > 0) console.log("Season", s.name, "duplicates:", dups);
       });
       process.exit(0);
    });
  })
})
