const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `  const [activeTab, setActiveTab] = useState("home");`;
const replacement = `  const [activeTab, setActiveTab] = useState("home");

  // Notificatie logica voor nieuwe prikbord berichten
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !currentUser.pushNotificationsEnabled) return;
    if (!data || !data.boardMessages || data.boardMessages.length === 0) return;
    
    const latestMessage = data.boardMessages[0];
    
    if (lastSeenMessageId === null) {
      // First load, just record the latest message id
      setLastSeenMessageId(latestMessage.id);
      return;
    }

    if (latestMessage.id !== lastSeenMessageId && latestMessage.authorId !== currentUser.id) {
      // It's a new message not created by us!
      setLastSeenMessageId(latestMessage.id);
      
      // We assume Notification permission is already granted if pushNotificationsEnabled is true
      if (Notification.permission === 'granted') {
        const notification = new Notification("Nieuw Prikbord Bericht", {
          body: latestMessage.title,
          icon: '/icon.png' // assuming there might be an icon
        });
        
        notification.onclick = () => {
          window.focus();
          setActiveTab("home");
        };
      }
    }
  }, [data?.boardMessages, currentUser, lastSeenMessageId]);
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
