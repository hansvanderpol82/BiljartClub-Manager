const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldUser = `  const [currentUser, setCurrentUser] = useState<User>(data.users[0]);`;

const newUser = `  const [currentUser, setCurrentUser] = useState<User>(data.users[0]);

  useEffect(() => {
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
  }, [authUser, data.users]);

  const [inviteClubId, setInviteClubId] = useState(() => new URLSearchParams(window.location.search).get('invite') || null);
  const [showInviteWelcome, setShowInviteWelcome] = useState(!!inviteClubId);
`;

code = code.replace(oldUser, newUser);
fs.writeFileSync('src/App.tsx', code);
