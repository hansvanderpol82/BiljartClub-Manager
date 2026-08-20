const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const addMemberTarget = `  const addNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
    active: boolean = true,
  ) => {
    setPaymentConfig({`;

const addMemberReplacement = `  const addNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
    active: boolean = true,
  ) => {
    if (currentUser?.role === "applicatiebeheerder") {
      executeAddNewMember(
        name,
        email,
        baseAverage,
        shortName,
        role,
        participatesInExternalMatches,
        sendInvite,
        active
      );
      return;
    }
    setPaymentConfig({`;

code = code.replace(addMemberTarget, addMemberReplacement);

const createSeasonTarget = `  const createSeason = (seasonData: Partial<Season>) => {
    const numMembers = ((seasonData.members as any) || []).length;
    if (numMembers === 0) {
      executeCreateSeason(seasonData);
      return;
    }`;

const createSeasonReplacement = `  const createSeason = (seasonData: Partial<Season>) => {
    const numMembers = ((seasonData.members as any) || []).length;
    if (numMembers === 0 || currentUser?.role === "applicatiebeheerder") {
      executeCreateSeason(seasonData);
      return;
    }`;

code = code.replace(createSeasonTarget, createSeasonReplacement);

const createHomeMatchTarget = `  const createHomeMatch = () => {
    const numMembers = homeMatchPairings.length;
    if (numMembers === 0) {
      executeCreateHomeMatch();
      return;
    }`;

const createHomeMatchReplacement = `  const createHomeMatch = () => {
    const numMembers = homeMatchPairings.length;
    if (numMembers === 0 || currentUser?.role === "applicatiebeheerder") {
      executeCreateHomeMatch();
      return;
    }`;

code = code.replace(createHomeMatchTarget, createHomeMatchReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log('done billing fix');
