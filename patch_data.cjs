const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialData,
          ...parsed,
          externalMatches: (
            parsed.externalMatches || initialData.externalMatches
          )
            .filter(Boolean)
            .filter(
              (m: any) => m && (!m.date || !isNaN(new Date(m.date).getTime())),
            ),
          matches: (parsed.matches || initialData.matches)
            .filter(Boolean)
            .filter(
              (m: any) => m && m.date && !isNaN(new Date(m.date).getTime()),
            ),
          seasons: (parsed.seasons || initialData.seasons)
            .filter(Boolean)
            .map((s: any) => ({
              ...s,
              inlegPerWedstrijd: s.inlegPerWedstrijd || 0,
              contributie: s.contributie || 0,
            })),
          clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
          users: (parsed.users?.length > 0
            ? parsed.users
            : initialData.users
          ).filter(Boolean),
        };
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });`;

const newState = `  const [data, setData] = useState<any>(initialData);
  const [dataLoaded, setDataLoaded] = useState(false);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
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

code = code.replace(oldState, newState);

const oldSave = `  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);`;

const newSave = `  useEffect(() => {
    if (dataLoaded) {
      setDoc(doc(db, "appData", "main"), { data: JSON.stringify(data) }).catch(console.error);
    }
  }, [data, dataLoaded]);`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('src/App.tsx', code);
