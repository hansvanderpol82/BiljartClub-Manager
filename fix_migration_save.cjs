const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `          if (firestoreClubs.length === 0 && localClubs.length > 0) {
            console.log("Migrating local data to Firestore...");
            setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) }).catch(console.error);
          } else if (parsedDataStr !== JSON.stringify(dataRef.current)) {`;

const repStr = `          const migratedDataStr = JSON.stringify(parsed);
          
          if (firestoreClubs.length === 0 && localClubs.length > 0) {
            console.log("Migrating local data to Firestore...");
            setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) }).catch(console.error);
          } else if (parsedDataStr !== migratedDataStr) {
            // A migration modified 'parsed'. Force save to Firestore immediately.
            console.log("Applying data migration/deduplication to Firestore...");
            setDoc(doc(db, "appData", "main"), { data: migratedDataStr }).catch(console.error);
            setData(parsed);
          } else if (parsedDataStr !== JSON.stringify(dataRef.current)) {`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Updated migration save logic");
