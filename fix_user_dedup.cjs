const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `          const parsed = JSON.parse(parsedDataStr);
          if (!parsed.notifications) parsed.notifications = [];`;

const repStr = `          const parsed = JSON.parse(parsedDataStr);
          if (!parsed.notifications) parsed.notifications = [];

          // ---------------------------------------------------------
          // DATA MIGRATION & DEDUPLICATION (Fix for Frank de Bruijn)
          // ---------------------------------------------------------
          if (parsed.users) {
            // Lowercase all emails first
            parsed.users = parsed.users.map(u => ({ ...u, email: (u.email || "").toLowerCase().trim() }));
            
            // Find duplicates by email
            const emailMap = new Map();
            const idReplacements = new Map(); // duplicateId -> keptId
            const keptUsers = [];

            for (const user of parsed.users) {
              if (emailMap.has(user.email)) {
                // It's a duplicate. Map its ID to the first found user's ID.
                idReplacements.set(user.id, emailMap.get(user.email).id);
              } else {
                emailMap.set(user.email, user);
                keptUsers.push(user);
              }
            }

            if (idReplacements.size > 0) {
              console.log("Merging duplicate users:", idReplacements);
              parsed.users = keptUsers;

              const replaceId = (id) => idReplacements.get(id) || id;
              const replaceIdList = (list) => {
                 if (!list) return [];
                 return [...new Set(list.map(id => replaceId(id)))];
              };

              // Update Clubs
              if (parsed.clubs) {
                parsed.clubs = parsed.clubs.map(c => ({
                  ...c,
                  adminId: replaceId(c.adminId),
                  memberIds: replaceIdList(c.memberIds)
                }));
              }

              // Update Seasons
              if (parsed.seasons) {
                parsed.seasons = parsed.seasons.map(s => {
                  const newMembers = [];
                  const seenMembers = new Set();
                  (s.members || []).forEach(m => {
                    const mappedId = replaceId(m.userId);
                    if (!seenMembers.has(mappedId)) {
                      seenMembers.add(mappedId);
                      newMembers.push({ ...m, userId: mappedId });
                    }
                  });
                  return { ...s, members: newMembers };
                });
              }

              // Update Matches
              if (parsed.matches) {
                parsed.matches = parsed.matches.map(m => ({
                  ...m,
                  player1Id: replaceId(m.player1Id),
                  player2Id: replaceId(m.player2Id),
                  arbiterId: m.arbiterId ? replaceId(m.arbiterId) : undefined,
                  writerId: m.writerId ? replaceId(m.writerId) : undefined,
                }));
              }

              // Update External Matches
              if (parsed.externalMatches) {
                parsed.externalMatches = parsed.externalMatches.map(em => ({
                  ...em,
                  games: (em.games || []).map(g => ({
                    ...g,
                    homePlayerId: replaceId(g.homePlayerId),
                    awayPlayerId: replaceId(g.awayPlayerId),
                    arbiterId: g.arbiterId ? replaceId(g.arbiterId) : undefined,
                    writerId: g.writerId ? replaceId(g.writerId) : undefined,
                  }))
                }));
              }

              // Update Board Messages
              if (parsed.boardMessages) {
                parsed.boardMessages = parsed.boardMessages.map(bm => ({
                  ...bm,
                  authorId: replaceId(bm.authorId),
                  readBy: replaceIdList(bm.readBy),
                  keptOnHomeBy: replaceIdList(bm.keptOnHomeBy),
                  archivedBy: replaceIdList(bm.archivedBy),
                  deletedBy: replaceIdList(bm.deletedBy),
                  replies: (bm.replies || []).map(r => ({ ...r, authorId: replaceId(r.authorId) }))
                }));
              }

              // Update Notifications
              if (parsed.notifications) {
                parsed.notifications = parsed.notifications.map(n => ({
                  ...n,
                  forUserId: n.forUserId ? replaceId(n.forUserId) : undefined,
                  readBy: replaceIdList(n.readBy)
                }));
              }
            }
          }
          // ---------------------------------------------------------`;

content = content.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Applied deduplication migration");
