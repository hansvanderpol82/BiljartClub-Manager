const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetNav = `<MobileNavTab
            icon={<UserCircle size={22} />}
            label="Profiel"
            active={activeTab === "profile"}
            onClick={() => setMobileSubmenu(mobileSubmenu === "profile" ? null : "profile")}
          />`;

const replaceNav = `<MobileNavTab
            icon={<UserCircle size={22} />}
            label="Profiel"
            active={activeTab === "profile"}
            onClick={() => { setSelectedProfileId(currentUser.id); setActiveTab("profile"); setMobileSubmenu(null); }}
          />`;

const targetSub = `                  {mobileSubmenu === "profile" && (
                    <>
                      <button 
                        className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "profile" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={() => { setSelectedProfileId(currentUser.id); setActiveTab("profile"); setMobileSubmenu(null); }}
                      >
                        <UserCircle size={20} />
                        Mijn Profiel
                      </button>
                    </>
                  )}`;

if (content.includes(targetNav)) {
  content = content.replace(targetNav, replaceNav);
  console.log("Replaced nav button.");
} else {
  console.log("Could not find targetNav.");
}

if (content.includes(targetSub)) {
  content = content.replace(targetSub, "");
  console.log("Removed submenu for profile.");
} else {
  console.log("Could not find targetSub.");
}

fs.writeFileSync('src/App.tsx', content);
