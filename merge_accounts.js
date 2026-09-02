import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function replaceId(obj, oldId, newId) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return obj === oldId ? newId : obj;
    }
    
    if (Array.isArray(obj)) {
        // First map all elements
        let newArr = obj.map(item => replaceId(item, oldId, newId));
        // If it's an array of strings, deduplicate it
        if (newArr.length > 0 && typeof newArr[0] === 'string') {
            newArr = [...new Set(newArr)];
        } else if (newArr.length > 0 && typeof newArr[0] === 'object' && newArr[0] !== null && 'userId' in newArr[0]) {
            // Deduplicate object arrays based on userId (like season.members)
            const seen = new Set();
            newArr = newArr.filter(item => {
                if (item.userId) {
                    if (seen.has(item.userId)) return false;
                    seen.add(item.userId);
                }
                return true;
            });
        }
        return newArr;
    }
    
    if (typeof obj === 'object') {
        const newObj = {};
        for (const [key, val] of Object.entries(obj)) {
            newObj[key] = replaceId(val, oldId, newId);
        }
        return newObj;
    }
    
    return obj;
}

async function run() {
    const docRef = doc(db, "appData", "main");
    const snap = await getDoc(docRef);
    const rawData = snap.data().data;
    const data = JSON.parse(rawData);
    
    const targetId = 'oomczifke';
    const sourceId = 'x5teh1x0o';
    
    const target = data.users.find(u => u.id === targetId);
    const source = data.users.find(u => u.id === sourceId);
    
    if (!target || !source) {
        console.error("Missing one of the users");
        process.exit(1);
    }
    
    // Update target role if source was admin
    if (source.role === 'admin' || source.role === 'applicatiebeheerder') {
        target.role = source.role;
    }
    
    // Remove source from users array
    data.users = data.users.filter(u => u.id !== sourceId);
    
    // Replace all references
    const newData = replaceId(data, sourceId, targetId);
    
    // Backup before saving
    fs.writeFileSync('backup_appData.json', rawData);
    
    // Update document
    await updateDoc(docRef, {
        data: JSON.stringify(newData)
    });
    
    console.log("Merge completed successfully!");
    process.exit(0);
}
run();
