import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    const antoon = data.users.find(u => u.name === "Antoon");
    
    console.log("Antoon matches:");
    const matches = data.matches.filter(m => m.player1Id === antoon.id || m.player2Id === antoon.id);
    console.log(matches.length);
    process.exit(0);
}
run();
