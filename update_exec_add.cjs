const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetExec = `  const executeAddNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
  ) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      shortName,
      email,
      role,
      baseAverage,
      participatesInExternalMatches,
    };`;

const replacementExec = `  const executeAddNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
    active: boolean = true,
  ) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      shortName,
      email,
      role,
      baseAverage,
      participatesInExternalMatches,
      active,
    };`;

const targetAddNew = `  const addNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
  ) => {
    setPaymentConfig({
      isOpen: true,
      amount: 100, // 1 euro
      description: "Aanmaken van een nieuw lid",
      onSuccess: () => {
        executeAddNewMember(
          name,
          email,
          baseAverage,
          shortName,
          role,
          participatesInExternalMatches,
          sendInvite,
        );
      },
    });
  };`;

const replacementAddNew = `  const addNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
    active: boolean = true,
  ) => {
    setPaymentConfig({
      isOpen: true,
      amount: 100, // 1 euro
      description: "Aanmaken van een nieuw lid",
      onSuccess: () => {
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
      },
    });
  };`;

appContent = appContent.replace(targetExec, replacementExec);
appContent = appContent.replace(targetAddNew, replacementAddNew);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
