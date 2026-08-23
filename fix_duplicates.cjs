const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `  const [data, setData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("biljart_club_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clubs && parsed.clubs.length > 0) {
          return {
            ...initialData,
            ...parsed,
            externalMatches: (parsed.externalMatches || initialData.externalMatches).filter(Boolean),
            matches: (parsed.matches || initialData.matches).filter(Boolean),
            seasons: (parsed.seasons || initialData.seasons).filter(Boolean),
            clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
            users: (parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean),
          };
        }
      }
    } catch(e) {}
    return initialData;
  });`;

const repStr = `  const uniqueById = (arr: any[]) => {
    if (!arr) return [];
    const seen = new Set();
    return arr.filter(item => {
      if (!item || !item.id) return true;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const [data, setData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("biljart_club_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clubs && parsed.clubs.length > 0) {
          return {
            ...initialData,
            ...parsed,
            externalMatches: uniqueById((parsed.externalMatches || initialData.externalMatches).filter(Boolean)),
            matches: uniqueById((parsed.matches || initialData.matches).filter(Boolean)),
            seasons: uniqueById((parsed.seasons || initialData.seasons).filter(Boolean)),
            clubs: uniqueById((parsed.clubs || initialData.clubs).filter(Boolean)),
            users: uniqueById((parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean)),
            notifications: uniqueById((parsed.notifications || []).filter(Boolean)),
            boardMessages: uniqueById((parsed.boardMessages || []).filter(Boolean)),
          };
        }
      }
    } catch(e) {}
    return initialData;
  });`;

content = content.replace(targetStr, repStr);

const targetFsStr = `          if (firestoreClubs.length === 0 && localClubs.length > 0) {
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
          }`;

const repFsStr = `          if (firestoreClubs.length === 0 && localClubs.length > 0) {
            console.log("Migrating local data to Firestore...");
            setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) }).catch(console.error);
          } else if (parsedDataStr !== JSON.stringify(dataRef.current)) {
            setData({
              ...initialData,
              ...parsed,
              externalMatches: uniqueById((parsed.externalMatches || initialData.externalMatches).filter(Boolean)),
              matches: uniqueById((parsed.matches || initialData.matches).filter(Boolean)),
              seasons: uniqueById((parsed.seasons || initialData.seasons).filter(Boolean)),
              clubs: uniqueById((parsed.clubs || initialData.clubs).filter(Boolean)),
              users: uniqueById((parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean)),
              notifications: uniqueById((parsed.notifications || []).filter(Boolean)),
              boardMessages: uniqueById((parsed.boardMessages || []).filter(Boolean)),
            });
          }`;

content = content.replace(targetFsStr, repFsStr);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed duplicates");
