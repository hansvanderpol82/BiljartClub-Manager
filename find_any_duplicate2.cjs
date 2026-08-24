const fs = require('fs');
import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       
       let countUser = 0;
       data.users.forEach(u => { if (u.id === 'yw26qzyci') countUser++; });
       console.log("Users with yw26qzyci:", countUser);
       
       let countMemberIds = 0;
       data.clubs.forEach(c => {
         const matches = (c.memberIds || []).filter(id => id === 'yw26qzyci');
         if (matches.length > 1) console.log("Club memberIds dups:", matches.length);
       });
       
       data.seasons.forEach(s => {
         const matches = (s.members || []).filter(m => m.userId === 'yw26qzyci');
         if (matches.length > 1) console.log("Season members dups:", matches.length);
       });
       
       process.exit(0);
    });
  })
})
