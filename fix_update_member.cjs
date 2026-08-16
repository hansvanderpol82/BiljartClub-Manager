const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetUpdate = `  const updateMember = (
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

const replacementUpdate = `  const updateMember = (
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
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
