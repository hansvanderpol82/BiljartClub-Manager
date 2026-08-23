const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

const targetEffect = `  useEffect(() => {
    if (liveMatchId) {
      localStorage.setItem("liveMatchId", liveMatchId);
    } else {
      localStorage.removeItem("liveMatchId");
    }
  }, [liveMatchId]);`;

const replacementEffect = `  useEffect(() => {
    if (liveMatchId) {
      localStorage.setItem("liveMatchId", liveMatchId);
    } else {
      localStorage.removeItem("liveMatchId");
    }
  }, [liveMatchId]);

  useEffect(() => {
    if (liveMatchId && currentUser && !isCastMode) {
      // Set lock when opening match
      setData((prev: any) => {
        let updated = false;
        const updateLock = (matches: any[]) => {
          return matches.map((m: any) => {
            if (m.id === liveMatchId && m.status === 'started' && (!m.activeScorerId || m.activeScorerId === currentUser.id)) {
              if (m.activeScorerId !== currentUser.id) updated = true;
              return { ...m, activeScorerId: currentUser.id, activeScorerName: currentUser.name };
            }
            return m;
          });
        };

        const newMatches = updateLock(prev.matches || []);
        let newExternalMatches = prev.externalMatches || [];
        
        if (!updated && newExternalMatches.length > 0) {
          newExternalMatches = newExternalMatches.map((em: any) => ({
            ...em,
            games: updateLock(em.games || [])
          }));
        }
        
        return updated ? { ...prev, matches: newMatches, externalMatches: newExternalMatches } : prev;
      });

      // Clear lock on cleanup
      return () => {
        setData((prev: any) => {
          let updated = false;
          const clearLock = (matches: any[]) => {
            return matches.map((m: any) => {
              if (m.id === liveMatchId && m.activeScorerId === currentUser.id) {
                updated = true;
                return { ...m, activeScorerId: null, activeScorerName: null };
              }
              return m;
            });
          };

          const newMatches = clearLock(prev.matches || []);
          let newExternalMatches = prev.externalMatches || [];
          
          if (!updated && newExternalMatches.length > 0) {
            newExternalMatches = newExternalMatches.map((em: any) => ({
              ...em,
              games: clearLock(em.games || [])
            }));
          }
          
          return updated ? { ...prev, matches: newMatches, externalMatches: newExternalMatches } : prev;
        });
      };
    }
  }, [liveMatchId, currentUser, isCastMode]);
`;

app = app.replace(targetEffect, replacementEffect);
fs.writeFileSync('src/App.tsx', app);
