const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetEffect = `  useEffect(() => {
    const channel = new BroadcastChannel("biljart_cast_channel");
    channel.onmessage = (e) => {
      if (e.data && e.data.type === "UPDATE_CAST_STATE") {
        setCastState(e.data.payload);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "biljart_cast_state" && e.newValue) {
        try {
          setCastState(JSON.parse(e.newValue));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);`;

const replacementEffect = `  useEffect(() => {
    const channel = new BroadcastChannel("biljart_cast_channel");
    channel.onmessage = (e) => {
      if (e.data && e.data.type === "UPDATE_CAST_STATE") {
        setCastState(e.data.payload);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "biljart_cast_state" && e.newValue) {
        try {
          setCastState(JSON.parse(e.newValue));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Presentation API receiver logic
    if (navigator.presentation && navigator.presentation.receiver) {
      navigator.presentation.receiver.connectionList.then(list => {
        list.connections.forEach(connection => {
          connection.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'UPDATE_CAST_STATE') {
                setCastState(data.payload);
              }
            } catch (e) {}
          };
        });
        list.onconnectionavailable = (event) => {
          event.connection.onmessage = (msgEvent) => {
            try {
              const data = JSON.parse(msgEvent.data);
              if (data.type === 'UPDATE_CAST_STATE') {
                setCastState(data.payload);
              }
            } catch (e) {}
          };
        };
      }).catch(() => {});
    }

    return () => {
      channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);`;

content = content.replace(targetEffect, replacementEffect);

const targetUpdateGlobalCastState = `  const updateGlobalCastState = (newState: {
    viewType: "match" | "standings" | "extMatch" | "nextMatchDay";
    seasonId?: string;
    extMatchId?: string;
    matchId?: string;
  }) => {
    setCastState(newState);
    localStorage.setItem("biljart_cast_state", JSON.stringify(newState));
    const channel = new BroadcastChannel("biljart_cast_channel");
    channel.postMessage({ type: "UPDATE_CAST_STATE", payload: newState });
    channel.close();
  };`;

const replacementUpdateGlobalCastState = `  const updateGlobalCastState = (newState: {
    viewType: "match" | "standings" | "extMatch" | "nextMatchDay";
    seasonId?: string;
    extMatchId?: string;
    matchId?: string;
  }) => {
    setCastState(newState);
    localStorage.setItem("biljart_cast_state", JSON.stringify(newState));
    const channel = new BroadcastChannel("biljart_cast_channel");
    channel.postMessage({ type: "UPDATE_CAST_STATE", payload: newState });
    channel.close();
    
    if (presentationConnRef.current) {
      try {
        presentationConnRef.current.send(JSON.stringify({ type: "UPDATE_CAST_STATE", payload: newState }));
      } catch (e) {
        console.error("Failed to send via presentation connection", e);
      }
    }
  };`;

content = content.replace(targetUpdateGlobalCastState, replacementUpdateGlobalCastState);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
