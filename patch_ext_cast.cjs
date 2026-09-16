const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchExtMatch = `          >
            <X size={24} />
          </button>
          <div className="w-[95vw] h-[95vh] max-w-[1920px] max-h-[1080px] bg-[#064e3b]`;
const replaceExtMatch = `          >
            <X size={24} />
          </button>
          {activeClub?.logo && (
            <div className="absolute top-8 left-8 z-50">
              <img src={activeClub.logo} alt={activeClub.name} className="h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
            </div>
          )}
          <div className="w-[95vw] h-[95vh] max-w-[1920px] max-h-[1080px] bg-[#064e3b]`;

if (content.includes(searchExtMatch)) {
  content = content.replace(searchExtMatch, replaceExtMatch);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched Ext Match Cast Logo.");
} else {
  console.log("Ext Match search block not found.");
}
