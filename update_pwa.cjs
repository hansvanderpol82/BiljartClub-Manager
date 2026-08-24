const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state for deferredPrompt
const stateToAdd = `
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };
`;

if (!content.includes('deferredPrompt')) {
  content = content.replace('const [prikbordTab', stateToAdd + '\n  const [prikbordTab');
}

// 2. Add button in sidebar
const installButtonDesktop = `
          {isInstallable && (
            <SidebarItem
              icon={<Download size={20} />}
              label="Installeer App"
              onClick={handleInstallClick}
              collapsed={isSidebarCollapsed}
            />
          )}
          <SidebarItem
            icon={<LogOut size={20} />}
`;

if (!content.includes('label="Installeer App"')) {
  content = content.replace(/<SidebarItem\s+icon={<LogOut size={20} \/>}\s+label="Uitloggen"/s, installButtonDesktop.trim());
}

// 3. Add button in mobile menu
const installButtonMobile = `
                      {isInstallable && (
                        <button 
                          className="flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => { handleInstallClick(); setMobileSubmenu(null); }}
                        >
                          <Download size={20} />
                          Installeer App
                        </button>
                      )}
                      <button 
                        className="flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
`;

if (!content.includes('Installeer App</button>')) {
  content = content.replace(/<button \s+className="flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold text-red-600[^>]+>\s*<LogOut size=\{20\} \/>\s*Uitloggen\s*<\/button>/s, installButtonMobile.trim() + '\n                        <LogOut size={20} />\n                        Uitloggen\n                      </button>');
}

fs.writeFileSync(path, content);
console.log('updated src/App.tsx');
