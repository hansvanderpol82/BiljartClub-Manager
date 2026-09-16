import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const docRef = doc(db, "appData", "main");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const dataStr = docSnap.data().data;
    const data = JSON.parse(dataStr);
    
    let totalAvatarSize = 0;
    if (data.users) {
       for (const u of data.users) {
         if (u.avatar) {
           console.log("User " + u.email + " has avatar of length " + u.avatar.length);
           totalAvatarSize += u.avatar.length;
         }
       }
    }
    
    let totalLogoSize = 0;
    if (data.clubs) {
       for (const c of data.clubs) {
         if (c.logo) {
           console.log("Club " + c.name + " has logo of length " + c.logo.length);
           totalLogoSize += c.logo.length;
         }
       }
    }
    
    console.log("Total avatar size:", totalAvatarSize);
    console.log("Total club logo size:", totalLogoSize);
  } else {
    console.log("No document!");
  }
}
check().catch(console.error).then(() => process.exit(0));
