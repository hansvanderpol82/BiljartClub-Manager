const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add isExternalMatchesSubmenuOpen
if (!content.includes('isExternalMatchesSubmenuOpen')) {
  content = content.replace(
    'const [isSeasonsSubmenuOpen, setIsSeasonsSubmenuOpen] = useState(true);',
    'const [isSeasonsSubmenuOpen, setIsSeasonsSubmenuOpen] = useState(true);\n  const [isExternalMatchesSubmenuOpen, setIsExternalMatchesSubmenuOpen] = useState(false);'
  );
}

// 2. Replace the Sidebar section
const oldSidebar = `<SidebarItem
                icon={<Calendar size={20} />}
                label="Seizoenen"
                isSubItem
                active={activeTab === "seasons"}
                onClick={() => {
                  setActiveTab("seasons");
                  setIsSeasonsSubmenuOpen(!isSeasonsSubmenuOpen);
                }}
                collapsed={isSidebarCollapsed}
                hasSubmenu={true}
                submenuOpen={isSeasonsSubmenuOpen}
              />
              <AnimatePresence initial={false}>
                {isSeasonsSubmenuOpen && (
                  <motion.div
                    key="seasons-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pl-4"
                  >
                    {activeClub?.participatesInExternalMatches && (
                      <SidebarItem
                        icon={<Trophy size={20} />}
                        label="Uit & Thuis"
                        isSubItem
                        active={activeTab === "external-matches"}
                        onClick={() => setActiveTab("external-matches")}
                        collapsed={isSidebarCollapsed}
                      />
                    )}
                    <SidebarItem
                      icon={<History size={20} />}
                      label="Wedstrijden"
                      isSubItem
                      active={activeTab === "matches"}
                      onClick={() => setActiveTab("matches")}
                      collapsed={isSidebarCollapsed}
                    />
                  </motion.div>
                )}
              </AnimatePresence>`;

const newSidebar = `<SidebarItem
                icon={<Calendar size={20} />}
                label="Seizoenen"
                isSubItem
                active={activeTab === "seasons"}
                onClick={() => {
                  setActiveTab("seasons");
                  setIsSeasonsSubmenuOpen(!isSeasonsSubmenuOpen);
                }}
                collapsed={isSidebarCollapsed}
                hasSubmenu={true}
                submenuOpen={isSeasonsSubmenuOpen}
              />
              <AnimatePresence initial={false}>
                {isSeasonsSubmenuOpen && (
                  <motion.div
                    key="seasons-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pl-4"
                  >
                    <SidebarItem
                      icon={<History size={20} />}
                      label="Wedstrijden"
                      isSubItem
                      active={activeTab === "matches"}
                      onClick={() => setActiveTab("matches")}
                      collapsed={isSidebarCollapsed}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {activeClub?.participatesInExternalMatches && (
                <>
                  <SidebarItem
                    icon={<Trophy size={20} />}
                    label="Uit & Thuis"
                    isSubItem
                    active={activeTab === "external-matches"}
                    onClick={() => {
                      setActiveTab("external-matches");
                      setIsExternalMatchesSubmenuOpen(!isExternalMatchesSubmenuOpen);
                    }}
                    collapsed={isSidebarCollapsed}
                    hasSubmenu={true}
                    submenuOpen={isExternalMatchesSubmenuOpen}
                  />
                  <AnimatePresence initial={false}>
                    {isExternalMatchesSubmenuOpen && (
                      <motion.div
                        key="external-matches-submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-2 pl-4"
                      >
                        <SidebarItem
                          icon={<History size={20} />}
                          label="Wedstrijden"
                          isSubItem
                          active={activeTab === "external-matches-games"}
                          onClick={() => setActiveTab("external-matches-games")}
                          collapsed={isSidebarCollapsed}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}`;

if (content.includes(oldSidebar)) {
  content = content.replace(oldSidebar, newSidebar);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Sidebar updated.");
} else {
  console.log("Could not find old sidebar.");
}
