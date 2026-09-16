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
    console.log("Document length in bytes:", new Blob([dataStr]).size);
  } else {
    console.log("No document!");
  }
}
check().catch(console.error).then(() => process.exit(0));
