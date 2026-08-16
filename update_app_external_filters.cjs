const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetHome = `      .filter(
        (user): user is User => !!user && !!user.participatesInExternalMatches,
      )`;

const replacementHome = `      .filter(
        (user): user is User => !!user && !!user.participatesInExternalMatches && user.active !== false,
      )`;

appContent = appContent.replace(targetHome, replacementHome);
appContent = appContent.replace(targetHome, replacementHome); // Do it twice (once for awayMembers too)

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
