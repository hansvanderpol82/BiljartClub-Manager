import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const docRef = doc(db, "appData", "main");
    const snap = await getDoc(docRef);
    let data = { users: [], clubs: [], seasons: [], matches: [], externalMatches: [], boardMessages: [], notifications: [] };
    if (snap.exists()) {
        data = JSON.parse(snap.data().data);
    }
    
    // Keep ONLY the admin user
    const adminUser = (data.users || []).find(u => u.email && u.email.toLowerCase() === 'info@hans-apps.com');
    
    const newData = {
        users: adminUser ? [adminUser] : [],
        clubs: [],
        seasons: [],
        matches: [],
        externalMatches: [],
        boardMessages: [],
        notifications: []
    };
    
    await updateDoc(docRef, { data: JSON.stringify(newData) });
    console.log("Database wiped successfully.");
    if (adminUser) {
        console.log("Kept admin user:", adminUser.email, "(ID:", adminUser.id + ")");
    } else {
        console.log("WARNING: Admin user 'info@hans-apps.com' not found! Users array is empty.");
    }
    process.exit(0);
}
run();
