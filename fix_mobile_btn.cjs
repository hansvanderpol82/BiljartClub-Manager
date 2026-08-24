const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const mobileBtn = `
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
`;

content = content.replace('                      <button \n                        className="flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"\n                        onClick={() => { auth.signOut(); setMobileSubmenu(null); }}\n                      >', mobileBtn.trimStart() + '                        className="flex items-center gap-3 px-2 sm:px-4 py-3 rounded-xl transition-colors font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"\n                        onClick={() => { auth.signOut(); setMobileSubmenu(null); }}\n                      >');

fs.writeFileSync(path, content);
