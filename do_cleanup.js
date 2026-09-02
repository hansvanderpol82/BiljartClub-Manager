import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const docRef = doc(db, "appData", "main");
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = JSON.parse(snap.data().data);
    
    const seasonsToRemove = ["Seizoen 2026", "Driebanden 2026"];
    const seasonIdsToRemove = data.seasons.filter(s => seasonsToRemove.includes(s.name)).map(s => s.id);
    
    data.seasons = data.seasons.filter(s => !seasonsToRemove.includes(s.name));
    data.matches = data.matches.filter(m => !seasonIdsToRemove.includes(m.seasonId));
    
    data.externalMatches = (data.externalMatches || []).filter(em => {
        const matchDate = new Date(em.date);
        // 14 juni 2026 (Month is 0-indexed, so 5 = June)
        if (matchDate.getFullYear() === 2026 && matchDate.getMonth() === 5 && matchDate.getDate() === 14) {
            return false;
        }
        return true;
    });
    
    await updateDoc(docRef, { data: JSON.stringify(data) });
    console.log("Database cleanup successful!");
    process.exit(0);
}
run();
