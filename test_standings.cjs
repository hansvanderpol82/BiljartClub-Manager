const fs = require('fs');
import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       
       const season = data.seasons.find(s => s.name.includes("Bandstoten 2026"));
       
       const standings = season.members.map(mem => {
          return { userId: mem.userId };
       });
       console.log("Season members:", season.members.map(m => m.userId));
       const duplicates = season.members.map(m => m.userId).filter((item, index, arr) => arr.indexOf(item) !== index);
       console.log("Duplicates in season members:", duplicates);
       
       process.exit(0);
    });
  })
})
