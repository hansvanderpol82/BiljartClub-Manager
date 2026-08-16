const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetArbiter = `                          {(activeClub?.memberIds || [])
                            .filter((id) => id !== p1Id && id !== p2Id)
                            .map((id) => {
                              const user = data.users.find(
                                (u: User) => u.id === id,
                              );`;

const replacementArbiter = `                          {(activeClub?.memberIds || [])
                            .filter((id) => id !== p1Id && id !== p2Id)
                            .map((id) => {
                              const user = data.users.find(
                                (u: User) => u.id === id,
                              );
                              if (user?.active === false) return null;`;

appContent = appContent.replace(targetArbiter, replacementArbiter);

const targetWriter = `                          {(activeClub?.memberIds || [])
                            .filter(
                              (id) =>
                                id !== p1Id &&
                                id !== p2Id &&
                                id !== selectedArbiterId,
                            )
                            .map((id) => {
                              const user = data.users.find(
                                (u: User) => u.id === id,
                              );`;

const replacementWriter = `                          {(activeClub?.memberIds || [])
                            .filter(
                              (id) =>
                                id !== p1Id &&
                                id !== p2Id &&
                                id !== selectedArbiterId,
                            )
                            .map((id) => {
                              const user = data.users.find(
                                (u: User) => u.id === id,
                              );
                              if (user?.active === false) return null;`;

appContent = appContent.replace(targetWriter, replacementWriter);

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
