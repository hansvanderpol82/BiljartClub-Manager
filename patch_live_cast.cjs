const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchLiveMatch = `          >
            <X size={24} />
          </button>

          {/* Header / Game Info - Centered and Slimmer */}`;
const replaceLiveMatch = `          >
            <X size={24} />
          </button>
          
          {activeClub?.logo && (
            <div className="absolute top-8 left-8 z-50">
              <img src={activeClub.logo} alt={activeClub.name} className="h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
            </div>
          )}

          {/* Header / Game Info - Centered and Slimmer */}`;

if (content.includes(searchLiveMatch)) {
  content = content.replace(searchLiveMatch, replaceLiveMatch);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched Live Match Cast Logo.");
} else {
  console.log("Live Match search block not found.");
}
