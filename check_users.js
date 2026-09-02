import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        const docRef = doc(db, "appData", "main");
        const snap = await getDoc(docRef);
        const data = JSON.parse(snap.data().data);
        
        const hansJr = data.users.find(u => u.name.toLowerCase().includes("hans jr") || u.name.toLowerCase().includes("hans junior"));
        const frank = data.users.find(u => u.name.toLowerCase().includes("frank"));
        
        console.log("Hans Jr:", hansJr);
        console.log("Frank:", frank);
        
        const allMatches = data.matches.filter(m => m.date.startsWith("2026-04-09"));
        console.log("Matches on 2026-04-09:", allMatches);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
