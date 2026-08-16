const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetHome2 = `                                    .filter(
                                      (user): user is User =>
                                        !!user &&
                                        !!user.participatesInExternalMatches,
                                    )`;

const replacementHome2 = `                                    .filter(
                                      (user): user is User =>
                                        !!user &&
                                        !!user.participatesInExternalMatches &&
                                        user.active !== false,
                                    )`;

appContent = appContent.replace(targetHome2, replacementHome2);
appContent = appContent.replace(targetHome2, replacementHome2); // Replace the second instance below

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
