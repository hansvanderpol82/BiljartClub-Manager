const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetNewMember = `  const executeAddNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
    active: boolean = true,
  ) => {
    const newUser: User = {`;

const repNewMember = `  const executeAddNewMember = (
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role: "admin" | "planner" | "member" = "member",
    participatesInExternalMatches?: boolean,
    sendInvite: boolean = true,
    active: boolean = true,
  ) => {
    email = email.toLowerCase().trim();
    const newUser: User = {`;

content = content.replace(targetNewMember, repNewMember);

const targetUpdateMember = `  const updateMember = (
    id: string,
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role?: "admin" | "planner" | "member",
    participatesInExternalMatches?: boolean,
    active?: boolean,
  ) => {
    setData((prev: any) => ({`;

const repUpdateMember = `  const updateMember = (
    id: string,
    name: string,
    email: string,
    baseAverage: number,
    shortName?: string,
    role?: "admin" | "planner" | "member",
    participatesInExternalMatches?: boolean,
    active?: boolean,
  ) => {
    email = email.toLowerCase().trim();
    setData((prev: any) => ({`;

content = content.replace(targetUpdateMember, repUpdateMember);

const targetInputEmail = `onChange={(e) => setNewMemberEmail(e.target.value)}`;
const repInputEmail = `onChange={(e) => setNewMemberEmail(e.target.value.toLowerCase().trim())}`;
content = content.replace(targetInputEmail, repInputEmail);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx member functions");
