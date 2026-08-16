const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetRender = `                        {(activeClub?.memberIds || []).map((memberId) => {
                          const member = data.users.find(
                            (u: User) => u.id === memberId,
                          );
                          const isSelected =
                            newSeasonMemberIds.includes(memberId);`;

const replacementRender = `                        {(activeClub?.memberIds || []).map((memberId) => {
                          const member = data.users.find(
                            (u: User) => u.id === memberId,
                          );
                          if (member?.active === false) return null;
                          const isSelected =
                            newSeasonMemberIds.includes(memberId);`;

appContent = appContent.replace(targetRender, replacementRender);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
