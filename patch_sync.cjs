const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldListener = `  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "main"), (docSnap) => {
      if (docSnap.exists()) {
        try {
          const parsedDataStr = docSnap.data().data;
          if (parsedDataStr !== JSON.stringify(dataRef.current)) {
            const parsed = JSON.parse(parsedDataStr);
            setData({
              ...initialData,
              ...parsed,
              externalMatches: (parsed.externalMatches || initialData.externalMatches).filter(Boolean),
              matches: (parsed.matches || initialData.matches).filter(Boolean),
              seasons: (parsed.seasons || initialData.seasons).filter(Boolean),
              clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
              users: (parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean),
            });
          }
        } catch(e) {}
      } else {
        setDoc(doc(db, "appData", "main"), { data: JSON.stringify(initialData) });
      }
      setDataLoaded(true);
    });
    return () => unsub();
  }, []);`;

const newListener = `  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "main"), (docSnap) => {
      if (docSnap.exists()) {
        try {
          const parsedDataStr = docSnap.data().data;
          const parsed = JSON.parse(parsedDataStr);
          
          // Migrate logic: if Firestore is empty (0 clubs) and local has clubs, push local to Firestore instead of overwriting
          const firestoreClubs = parsed.clubs || [];
          const localClubs = dataRef.current.clubs || [];
          
          if (firestoreClubs.length === 0 && localClubs.length > 0) {
            console.log("Migrating local data to Firestore...");
            setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) }).catch(console.error);
          } else if (parsedDataStr !== JSON.stringify(dataRef.current)) {
            setData({
              ...initialData,
              ...parsed,
              externalMatches: (parsed.externalMatches || initialData.externalMatches).filter(Boolean),
              matches: (parsed.matches || initialData.matches).filter(Boolean),
              seasons: (parsed.seasons || initialData.seasons).filter(Boolean),
              clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
              users: (parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean),
            });
          }
        } catch(e) {}
      } else {
        setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) });
      }
      setDataLoaded(true);
    });
    return () => unsub();
  }, []);`;

code = code.replace(oldListener, newListener);
fs.writeFileSync('src/App.tsx', code);
