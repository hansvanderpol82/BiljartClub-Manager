const fs = require('fs');
let content = fs.readFileSync('src/components/ManageAccountsTab.tsx', 'utf-8');

// 1. Add ImageOff icon
content = content.replace(
  'import { Search, Filter, ShieldBan, Trash2, Unlink, UserX, Edit2 } from "lucide-react";',
  'import { Search, Filter, ShieldBan, Trash2, Unlink, UserX, Edit2, ImageOff } from "lucide-react";'
);

// 2. Add handleRemoveAvatar function
const handlersTarget = `  const handlePrivacyRequest = (user: User) => {`;
const handlersRep = `  const handleRemoveAvatar = (user: User) => {
    if (window.confirm(\`Weet je zeker dat je de profielfoto van \${user.name} wilt verwijderen?\`)) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => 
          u.id === user.id ? { ...u, avatar: undefined } : u
        )
      }));
    }
  };

  const handlePrivacyRequest = (user: User) => {`;

content = content.replace(handlersTarget, handlersRep);

// 3. Update the privacy message to mention the avatar
content = content.replace(
  "Maak het e-mailadres leeg en anonimiseer de naam (bijv. van 'Jan Jansen' naar 'Jan J.'). Je hebt hiervoor 14 dagen de tijd.",
  "Maak het e-mailadres leeg, verwijder eventueel de profielfoto, en anonimiseer de naam (bijv. van 'Jan Jansen' naar 'Jan J.'). Je hebt hiervoor 14 dagen de tijd."
);

// 4. Add the button to the row
const buttonsTarget = `                        <button
                          onClick={() => handlePrivacyRequest(user)}`;
const buttonsRep = `                        {user.avatar && (
                          <button
                            onClick={() => handleRemoveAvatar(user)}
                            className="p-2 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                            title="Profielfoto verwijderen"
                          >
                            <ImageOff size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrivacyRequest(user)}`;

content = content.replace(buttonsTarget, buttonsRep);

fs.writeFileSync('src/components/ManageAccountsTab.tsx', content);
console.log("Updated ManageAccountsTab.tsx with avatar removal");
