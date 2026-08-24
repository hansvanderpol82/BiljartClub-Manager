import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    const season = data.seasons.find(s => s.name.includes("Bandstoten 2026"));
    const antoon = data.users.find(u => u.name === "Antoon");
    const matches = data.matches.filter(m => m.seasonId === season.id && (m.player1Id === antoon.id || m.player2Id === antoon.id));
    const sevenSlots = [];
    matches.forEach(m => {
        if (m.player1AvgBefore === 7 && m.player1Id === antoon.id) {
            let car = 0; let hs = 0;
            (m.turns || []).forEach(t => { car += t.player1; if (t.player1 > hs) hs = t.player1; });
            sevenSlots.push({ match: m.id, car, hs });
        }
        if (m.player2AvgBefore === 7 && m.player2Id === antoon.id) {
            let car = 0; let hs = 0;
            (m.turns || []).forEach(t => { car += t.player2; if (t.player2 > hs) hs = t.player2; });
            sevenSlots.push({ match: m.id, car, hs });
        }
    });
    console.log(JSON.stringify(sevenSlots, null, 2));
    process.exit(0);
}
run();
