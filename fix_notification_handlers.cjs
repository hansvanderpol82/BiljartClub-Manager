const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const processTarget = `  const handleProcessNotification = () => {
    if (!activeNotification) return;`;
const processRep = `  const handleProcessNotification = () => {
    if (!activeNotification) return;

    if (activeNotification.type === 'privacy_deletion_request') {
      setData((prev: any) => {
        const newNotifs = (prev.notifications || []).map((n: any) => {
          if (n.id === activeNotification.id) {
            return { ...n, readBy: [...n.readBy, currentUser.id] };
          }
          return n;
        });
        return { ...prev, notifications: newNotifs };
      });
      setActiveNotification(null);
      return;
    }`;
content = content.replace(processTarget, processRep);

const renderTarget = `  const renderNotificationAction = () => {
    if (!activeNotification) return null;
    const [seasonId, dateStr] = activeNotification.relatedEntityId.split("_");`;
const renderRep = `  const renderNotificationAction = () => {
    if (!activeNotification) return null;

    if (activeNotification.type === 'privacy_deletion_request') {
      const userToAnonymize = data.users.find((u: User) => u.id === activeNotification.forUserId);
      return (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Er is een verzoek ingediend om persoonsgegevens te verwijderen.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
            Ga naar het <strong>Beheren &gt; Accounts</strong> scherm (als applicatiebeheerder) of stuur een e-mail naar de applicatiebeheerder om dit account te bewerken en het e-mailadres te wissen.
          </div>
          {userToAnonymize && (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm">
              <p>Huidige naam: <strong>{userToAnonymize.name}</strong></p>
              <p>Huidig e-mailadres: <strong>{userToAnonymize.email}</strong></p>
            </div>
          )}
          <button onClick={handleProcessNotification} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors">
            Markeer als afgehandeld
          </button>
        </div>
      );
    }

    const [seasonId, dateStr] = activeNotification.relatedEntityId.split("_");`;
content = content.replace(renderTarget, renderRep);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated notification handlers");
