const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add state
const stateTarget = `  const [isHomeSubmenuOpen, setIsHomeSubmenuOpen] = useState(true);`;
const stateRep = `  const [isHomeSubmenuOpen, setIsHomeSubmenuOpen] = useState(true);
  const [isManageSubmenuOpen, setIsManageSubmenuOpen] = useState(false);`;
content = content.replace(stateTarget, stateRep);

// 2. Sidebar Item
const sidebarTarget = `          {currentUser.role === 'applicatiebeheerder' && (
            <SidebarItem
              icon={<Settings size={20} />}
              label="Gebruikersinstellingen"
              active={activeTab === "manage"}
              onClick={() => setActiveTab("manage")}
              collapsed={isSidebarCollapsed}
            />
          )}`;

const sidebarRep = `          {currentUser.role === 'applicatiebeheerder' && (
            <>
              <SidebarItem
                icon={<Settings size={20} />}
                label="Beheren"
                active={activeTab === "manage" || activeTab === "manage-accounts"}
                onClick={() => {
                  if (activeTab !== "manage" && activeTab !== "manage-accounts") {
                    setActiveTab("manage");
                  }
                  setIsManageSubmenuOpen(!isManageSubmenuOpen);
                }}
                collapsed={isSidebarCollapsed}
                hasSubmenu={true}
                submenuOpen={isManageSubmenuOpen}
              />
              <AnimatePresence initial={false}>
                {isManageSubmenuOpen && (
                  <motion.div
                    key="manage-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pl-4"
                  >
                    <SidebarItem
                      icon={<Users size={16} />}
                      label="Accounts"
                      active={activeTab === "manage-accounts"}
                      onClick={() => setActiveTab("manage-accounts")}
                      collapsed={isSidebarCollapsed}
                      isSubItem
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}`;

content = content.replace(sidebarTarget, sidebarRep);

// 3. Mobile menu
const mobileTarget = `                      {currentUser.role === 'applicatiebeheerder' && (
                        <button 
                          className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "manage" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                          onClick={() => { setActiveTab("manage"); setMobileSubmenu(null); }}
                        >
                          <Users size={20} />
                          Gebruikersinstellingen
                        </button>
                      )}`;

const mobileRep = `                      {currentUser.role === 'applicatiebeheerder' && (
                        <>
                          <button 
                            className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold", activeTab === "manage" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("manage"); setMobileSubmenu(null); }}
                          >
                            <Settings size={20} />
                            Beheren
                          </button>
                          <button 
                            className={cn("flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold ml-4", activeTab === "manage-accounts" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
                            onClick={() => { setActiveTab("manage-accounts"); setMobileSubmenu(null); }}
                          >
                            <Users size={20} />
                            Accounts
                          </button>
                        </>
                      )}`;

content = content.replace(mobileTarget, mobileRep);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx sidebar and menus");
