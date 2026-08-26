const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /const \[deferredPrompt, setDeferredPrompt\] = useState<any>\(null\);\s*const \[isInstallable, setIsInstallable\] = useState\(false\);\s*useEffect\(\(\) => \{\s*const handleBeforeInstallPrompt = \(e: any\) => \{\s*e\.preventDefault\(\);\s*setDeferredPrompt\(e\);\s*setIsInstallable\(true\);\s*\};\s*window\.addEventListener\('beforeinstallprompt', handleBeforeInstallPrompt\);\s*return \(\) => \{\s*window\.removeEventListener\('beforeinstallprompt', handleBeforeInstallPrompt\);\s*\};\s*\}, \[\]\);\s*const handleInstallClick = async \(\) => \{\s*if \(\!deferredPrompt\) return;\s*deferredPrompt\.prompt\(\);\s*const \{ outcome \} = await deferredPrompt\.userChoice;\s*if \(outcome === 'accepted'\) \{\s*setIsInstallable\(false\);\s*\}\s*\};/g,
  `const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = ('standalone' in window.navigator) && !!(window.navigator as any).standalone;
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIos && !isStandalone && !isPWA) {
      setIsInstallable(true);
    }

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
    if (!deferredPrompt) {
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIos) {
        setShowIosInstallModal(true);
      } else {
        alert("Je browser ondersteunt automatische installatie niet direct. Kijk in het menu (vaak drie puntjes of lijntjes) of daar een 'Installeren' of 'Toevoegen aan startscherm' optie staat.");
      }
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };`
);
fs.writeFileSync('src/App.tsx', code);
