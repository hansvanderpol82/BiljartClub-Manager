const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const t1 = `                                    onClick={() => {
                                      setContributionsDetailType(
                                        "contributions",
                                      );
                                      setIsContributionsDetailModalOpen(true);
                                    }}`;
const r1 = `                                    onClick={() => {
                                      setContributionsDetailSeasonId(season.id);
                                      setContributionsDetailType(
                                        "contributions",
                                      );
                                      setIsContributionsDetailModalOpen(true);
                                    }}`;

const t2 = `                                    onClick={() => {
                                      setContributionsDetailType("matchfees");
                                      setIsContributionsDetailModalOpen(true);
                                    }}`;
const r2 = `                                    onClick={() => {
                                      setContributionsDetailSeasonId(season.id);
                                      setContributionsDetailType("matchfees");
                                      setIsContributionsDetailModalOpen(true);
                                    }}`;

const t3 = `                                    onClick={() => {
                                      setContributionsDetailType(
                                        "externalmatchfees",
                                      );
                                      setIsContributionsDetailModalOpen(true);
                                    }}`;
const r3 = `                                    onClick={() => {
                                      setContributionsDetailSeasonId(season.id);
                                      setContributionsDetailType(
                                        "externalmatchfees",
                                      );
                                      setIsContributionsDetailModalOpen(true);
                                    }}`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);
content = content.replace(t3, r3);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated click handlers");
