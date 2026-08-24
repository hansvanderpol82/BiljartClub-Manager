import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "biljart-club-manager",
  appId: "1:744239322101:web:6ac63c76581cebb03486bc",
  apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ",
  authDomain: "biljart-club-manager.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    if (snap.exists()) {
        const data = JSON.parse(snap.data().data);
        console.log("Users count:", data.users?.length);
        console.log("Matches count:", data.matches?.length);
        console.log("Seasons count:", data.seasons?.length);
        
        const kot = data.clubs?.find(c => c.name.includes("K.O.T."));
        console.log("KOT Member count:", kot?.memberIds?.length);
        
        const missingNames = ["Martien", "Yasar", "Yusuf"];
        for (const name of missingNames) {
            const user = data.users?.find(u => u.name.includes(name) || u.shortName?.includes(name));
            console.log("Found", name, ":", !!user);
            if (user) {
                console.log("  in KOT:", kot?.memberIds?.includes(user.id));
                const bandSeasons = data.seasons.filter(s => s.name.includes("Bandstoten 2026"));
                bandSeasons.forEach(s => {
                    const inSeason = s.members?.some(m => m.userId === user.id);
                    console.log(`  in season ${s.name}:`, inSeason);
                });
            }
        }
    } else {
        console.log("No data found");
    }
    process.exit(0);
}
run();
