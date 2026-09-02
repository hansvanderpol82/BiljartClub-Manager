import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        const docRef = doc(db, "appData", "main");
        const snap = await getDoc(docRef);
        const data = JSON.parse(snap.data().data);
        
        const hansJrId = "9yaorw2vb";
        const frankId = "oomczifke";

        const originalLength = data.matches.length;
        data.matches = data.matches.filter(m => !(
          m.date.startsWith("2026-04-09") && 
          (m.player1Id === hansJrId || m.player2Id === hansJrId)
        ));
        
        console.log(`Deleted ${originalLength - data.matches.length} matches`);
        
        await setDoc(docRef, { data: JSON.stringify(data) });
        console.log("Successfully updated database");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
run();
