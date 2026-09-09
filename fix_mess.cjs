const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `        }));
      },
    const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(currentUser.id) || isClubAdmin(c, currentUser) || (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess));
    const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(currentUser.id) || isClubAdmin(c, currentUser) || (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess));
    const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(currentUser.id) || isClubAdmin(c, currentUser) || (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess));
    const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(currentUser.id) || isClubAdmin(c, currentUser) || (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess));
    if (!newBoardMessageTitle || !newBoardMessageContent) return;
    const userClubs = data.clubs.filter((c: Club) => 
      (c.memberIds || []).includes(currentUser.id) || 
      (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess)
    );`;

const replace = `        }));
      },
    });
  };

  const executeCreateBoardMessage = () => {
    if (!newBoardMessageTitle || !newBoardMessageContent) return;

    const userClubs = data.clubs.filter((c: Club) => 
      (c.memberIds || []).includes(currentUser.id) || 
      isClubAdmin(c, currentUser) ||
      (currentUser.role === 'applicatiebeheerder' && c.allowAppAdminAccess)
    );`;

content = content.replace(search, replace);
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed mess");
