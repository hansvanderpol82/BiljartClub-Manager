const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const desktopBtn = `
          {isInstallable && (
            <SidebarItem
              icon={<Download size={20} />}
              label="Installeer App"
              onClick={handleInstallClick}
              collapsed={isSidebarCollapsed}
            />
          )}
          <SidebarItem
`;

content = content.replace('          <SidebarItem\n            icon={<LogOut size={20} />}', desktopBtn.trimStart() + '            icon={<LogOut size={20} />}');

fs.writeFileSync(path, content);
