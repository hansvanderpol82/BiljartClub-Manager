const fs = require('fs');
import("firebase/app").then(firebaseApp => {
  import("firebase/firestore").then(firestore => {
    const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    firestore.getDoc(firestore.doc(db, "appData", "main")).then(snap => {
       const data = JSON.parse(snap.data().data);
       
       const findDups = (obj, path) => {
          if (Array.isArray(obj)) {
             const ys = obj.filter(x => x === "yw26qzyci");
             if (ys.length > 1) {
                console.log(`Found duplicate in array at ${path} (length ${obj.length})`);
             }
             obj.forEach((v, i) => findDups(v, `${path}[${i}]`));
          } else if (obj !== null && typeof obj === 'object') {
             Object.keys(obj).forEach(k => {
                findDups(obj[k], `${path}.${k}`);
             });
          }
       };
       findDups(data, 'data');
       console.log("Done");
       process.exit(0);
    });
  })
})
