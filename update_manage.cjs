const fs = require('fs');
let content = fs.readFileSync('src/components/ManageAccountsTab.tsx', 'utf-8');

// 1. Add new icons
content = content.replace(
  'import { Search, Filter, ShieldBan, Trash2, Unlink } from "lucide-react";',
  'import { Search, Filter, ShieldBan, Trash2, Unlink, UserX, Edit2 } from "lucide-react";'
);

// 2. Add handlers
const handlersTarget = `  const handleDelete = (userId: string) => {`;
const handlersRep = `  const handleEditName = (user: User) => {
    const newName = window.prompt("Voer een nieuwe naam in voor dit account:", user.name);
    if (newName && newName.trim() !== "" && newName !== user.name) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => 
          u.id === user.id ? { ...u, name: newName.trim() } : u
        )
      }));
    }
  };

  const handlePrivacyRequest = (user: User) => {
    if (window.confirm(\`Weet je zeker dat je een "Verzoek persoonsgegevens verwijderen" wilt sturen naar de beheerders van de clubs van \${user.name}?\`)) {
      
      const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(user.id));
      const clubIds = userClubs.map((c: Club) => c.id).join(",");
      
      if (!clubIds) {
        alert("Deze gebruiker is niet gekoppeld aan clubs.");
        return;
      }

      const newNotification = {
        id: "notif_" + Date.now().toString(),
        type: 'privacy_deletion_request',
        title: 'Verzoek persoonsgegevens verwijderen',
        message: \`Applicatiebeheerder heeft namens lid '\${user.name}' (\${user.email}) een verzoek ingediend om persoonsgegevens te verwijderen (i.v.m. privacywet/AVG). Maak het e-mailadres leeg en anonimiseer de naam (bijv. van 'Jan Jansen' naar 'Jan J.'). Je hebt hiervoor 14 dagen de tijd.\`,
        forRole: ['admin'],
        forUserId: user.id, // The user to be anonymized
        readBy: [],
        createdAt: new Date().toISOString(),
        relatedEntityId: clubIds, // Store club ids here so we know which clubs it belongs to
      };

      setData((prev: any) => ({
        ...prev,
        notifications: [...(prev.notifications || []), newNotification]
      }));
      
      alert("Verzoek is verstuurd naar de beheerders.");
    }
  };

  const handleDelete = (userId: string) => {`;

content = content.replace(handlersTarget, handlersRep);

// 3. Add buttons to row
const actionsTarget = `                        <button
                          onClick={() => handleToggleBlock(user.id, isActive)}`;
const actionsRep = `                        <button
                          onClick={() => handleEditName(user)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Naam wijzigen"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handlePrivacyRequest(user)}
                          className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Verzoek persoonsgegevens verwijderen"
                        >
                          <UserX size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user.id, isActive)}`;

content = content.replace(actionsTarget, actionsRep);

fs.writeFileSync('src/components/ManageAccountsTab.tsx', content);
console.log("Updated ManageAccountsTab.tsx");
