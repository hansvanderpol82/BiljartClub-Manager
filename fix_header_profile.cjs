const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetProfile = `              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  {(currentUser.shortName || currentUser.name)?.[0] || "?"}
                </div>
              )}`;

const replacementProfile = `              <button
                onClick={() => {
                  setUserSettingsEmail(currentUser.email);
                  setUserSettingsShortName(currentUser.shortName || "");
                  setUserSettingsAvg(currentUser.baseAverage);
                  setUserSettingsAvatar(currentUser.avatar || "");
                  setUserSettingsParticipatesExternal(
                    currentUser.participatesInExternalMatches ?? false,
                  );
                  setIsUserSettingsModalOpen(true);
                }}
                className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full shrink-0"
                title="Gebruikersinstellingen"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    {(currentUser.shortName || currentUser.name)?.[0] || "?"}
                  </div>
                )}
              </button>`;

if (content.includes(targetProfile)) {
  content = content.replace(targetProfile, replacementProfile);
  console.log("Wrapped profile picture in settings button.");
} else {
  console.log("Could not find targetProfile.");
}

fs.writeFileSync('src/App.tsx', content);
