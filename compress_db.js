import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";
import { Canvas, Image } from "canvas";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resizeBase64(base64, maxDim) {
  if (!base64 || !base64.startsWith("data:image")) return base64;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim) {
        height = height * (maxDim / width);
        width = maxDim;
      }
      if (height > maxDim) {
         width = width * (maxDim / height);
         height = maxDim;
      }
      const canvas = new Canvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', { quality: 0.8 }));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

async function run() {
  const docRef = doc(db, "appData", "main");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const dataStr = docSnap.data().data;
    const data = JSON.parse(dataStr);
    
    let modified = false;
    
    if (data.users) {
       for (let i=0; i<data.users.length; i++) {
         const u = data.users[i];
         if (u.avatar && u.avatar.length > 50000) {
           console.log("Compressing avatar for " + u.email + ", old size: " + u.avatar.length);
           u.avatar = await resizeBase64(u.avatar, 250);
           console.log("New size: " + u.avatar.length);
           modified = true;
         }
       }
    }
    if (data.clubs) {
       for (let i=0; i<data.clubs.length; i++) {
         const c = data.clubs[i];
         if (c.logo && c.logo.length > 50000) {
           console.log("Compressing logo for " + c.name + ", old size: " + c.logo.length);
           c.logo = await resizeBase64(c.logo, 250);
           console.log("New size: " + c.logo.length);
           modified = true;
         }
       }
    }
    
    if (modified) {
      console.log("Saving compressed data...");
      await setDoc(docRef, { data: JSON.stringify(data) });
      console.log("Saved.");
    } else {
      console.log("No compression needed.");
    }
  }
}
run().catch(console.error).then(() => process.exit(0));
