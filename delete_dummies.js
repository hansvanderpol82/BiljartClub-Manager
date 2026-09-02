import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const docRef = doc(db, "appData", "main");
    const snap = await getDoc(docRef);
    const data = JSON.parse(snap.data().data);
    
    // Remove the fake club
    data.clubs = data.clubs.filter(c => c.name !== "'t Blaauw tûpke");
    
    // Remove the fake seasons
    data.seasons = data.seasons.filter(s => s.name !== "testseizoen 2026" && s.name !== "bandstoten 2026 seizoen");
    
    // Remove the fake external matches
    data.externalMatches = data.externalMatches.filter(em => em.name !== "Thuis tegen 't Blaauw tûpke" && em.name !== "Uit tegen 't Blaauw tûpke");
    
    await updateDoc(docRef, { data: JSON.stringify(data) });
    console.log("Dummy data removed.");
    process.exit(0);
}
run();
