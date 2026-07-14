const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `  const [data, setData] = useState<any>(initialData);`;

const newState = `  const [data, setData] = useState<any>(() => {
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

code = code.replace(oldState, newState);
fs.writeFileSync('src/App.tsx', code);
