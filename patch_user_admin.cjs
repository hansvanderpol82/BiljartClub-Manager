const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldUserHook = `  useEffect(() => {
    if (authUser && data.users) {
      const user = data.users.find(u => u.email === authUser.email);
      if (user) {
        setCurrentUser(user);
      } else if (authUser.email) {
        const newUser: User = {
          id: authUser.uid,
          name: authUser.displayName || authUser.email.split('@')[0],
          email: authUser.email,
          role: "member",
          baseAverage: 20
        };
        setData((prev: any) => ({ ...prev, users: [...prev.users, newUser] }));
        setCurrentUser(newUser);
      }
    }
  }, [authUser, data.users]);`;

const newUserHook = `  useEffect(() => {
    if (authUser && data.users) {
      let user = data.users.find((u: User) => u.email === authUser.email);
      
      // Auto-promote hansvanderpol82 to admin if needed
      const isAdminEmail = authUser.email === "hansvanderpol82@gmail.com";
      
      if (user) {
        if (isAdminEmail && user.role !== "admin") {
          user = { ...user, role: "admin" };
          setData((prev: any) => ({
            ...prev,
            users: prev.users.map((u: User) => u.id === user.id ? user : u)
          }));
        }
        setCurrentUser(user);
      } else if (authUser.email) {
        const newUser: User = {
          id: authUser.uid,
          name: authUser.displayName || authUser.email.split('@')[0],
          email: authUser.email,
          role: isAdminEmail ? "admin" : "member",
          baseAverage: 20
        };
        setData((prev: any) => ({ ...prev, users: [...prev.users, newUser] }));
        setCurrentUser(newUser);
      }
    }
  }, [authUser, data.users]);

  // Handmatige herstel functie
  const restoreLocalData = () => {
    try {
      const saved = localStorage.getItem("biljart_club_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clubs && parsed.clubs.length > 0) {
          if (window.confirm("Wil je je lokale gegevens herstellen naar de database? Dit overschrijft de huidige database.")) {
             setData((prev: any) => ({
                ...prev,
                ...parsed,
                externalMatches: (parsed.externalMatches || prev.externalMatches || []).filter(Boolean),
                matches: (parsed.matches || prev.matches || []).filter(Boolean),
                seasons: (parsed.seasons || prev.seasons || []).filter(Boolean),
                clubs: (parsed.clubs || prev.clubs || []).filter(Boolean),
                users: (parsed.users || prev.users || []).filter(Boolean),
             }));
             alert("Lokale gegevens hersteld! De database wordt nu bijgewerkt.");
          }
        } else {
          alert("Geen lokale gegevens gevonden om te herstellen.");
        }
      } else {
        alert("Geen lokale gegevens gevonden in de browser.");
      }
    } catch(e) {
      alert("Fout bij het herstellen van gegevens.");
    }
  };
`;

code = code.replace(oldUserHook, newUserHook);

// Also add a button in the Settings page to trigger it.
const oldSettings = `<h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">                Applicatie Instellingen              </h2>`;
const newSettings = `<h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">                Applicatie Instellingen              </h2>
              {currentUser?.role === 'admin' && (
                <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                  <h3 className="text-lg font-bold text-orange-800 dark:text-orange-400 mb-2">Noodherstel</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                    Als je gegevens mist nadat de database gekoppeld is, kun je proberen de lokaal opgeslagen gegevens (uit deze browser) te herstellen en opnieuw naar de database te sturen.
                  </p>
                  <button onClick={restoreLocalData} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm">
                    Herstel lokale gegevens
                  </button>
                </div>
              )}`;

code = code.replace(oldSettings, newSettings);

fs.writeFileSync('src/App.tsx', code);
