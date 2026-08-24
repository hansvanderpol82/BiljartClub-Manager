import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    
    const names = ["Antoon", "Martien", "Ad", "Jo", "Mustafa", "Hassan", "Yusuf", "Yasar"];
    
    names.forEach(name => {
        const u = data.users.find(u => u.name === name || u.shortName === name);
        console.log(`Found ${name}:`, !!u, u ? `(ID: ${u.id})` : "");
    });
    
    const antoonFixApplied = data.users.find(u => u.name === "Ad") && data.matches.some(m => m.player1Id === data.users.find(u => u.name === "Ad")?.id);
    console.log("Fix already applied in backend?:", !!antoonFixApplied);

    process.exit(0);
}
run();
