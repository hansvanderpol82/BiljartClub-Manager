const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Update updateMember
let targetUpdate = `  const updateMember = (
    id: string,
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role?: "admin" | "planner" | "member",
    participatesInExternalMatches?: boolean,
  ) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) =>
        u.id === id
          ? {
              ...u,
              name,
              email,
              baseAverage,
              shortName,
              role: role || u.role,
              participatesInExternalMatches,
            }
          : u,
      ),
    }));
    setIsMemberModalOpen(false);
    setEditingMemberId(null);
    setNewMemberName("");
    setNewMemberShortName("");
    setNewMemberEmail("");
    setNewMemberAvg(20);
    setNewMemberRole("member");
    setNewMemberParticipatesExternal(false);
  };`;

let replacementUpdate = `  const updateMember = (
    id: string,
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role?: "admin" | "planner" | "member",
    participatesInExternalMatches?: boolean,
    active?: boolean,
  ) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) =>
        u.id === id
          ? {
              ...u,
              name,
              email,
              baseAverage,
              shortName,
              role: role || u.role,
              participatesInExternalMatches,
              active: active ?? u.active,
            }
          : u,
      ),
    }));
    setIsMemberModalOpen(false);
    setEditingMemberId(null);
    setNewMemberName("");
    setNewMemberShortName("");
    setNewMemberEmail("");
    setNewMemberAvg(20);
    setNewMemberRole("member");
    setNewMemberParticipatesExternal(false);
    setNewMemberActive(true);
  };`;

appContent = appContent.replace(targetUpdate, replacementUpdate);

// Update addNewMember calls and logic inside payment modal success handling. Wait, addNewMember sets a paymentConfig! 
// Let's just find the exact function implementation.
