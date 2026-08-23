import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Club } from "../types";
import { Search, Filter, ShieldBan, Trash2, Unlink, UserX, Edit2, ImageOff } from "lucide-react";
import { cn } from "../lib/utils";

export const ManageAccountsTab = ({ data, setData, currentUser }: { data: any, setData: any, currentUser: User }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClubId, setFilterClubId] = useState("all");

  const handleUnlink = (userId: string, clubId: string) => {
    if (window.confirm("Weet je zeker dat je dit lid wilt loskoppelen van deze club?")) {
      setData((prev: any) => ({
        ...prev,
        clubs: prev.clubs.map((c: Club) => 
          c.id === clubId ? { ...c, memberIds: (c.memberIds || []).filter(id => id !== userId) } : c
        )
      }));
    }
  };

  const handleToggleBlock = (userId: string, currentActive: boolean) => {
    const action = currentActive ? "blokkeren" : "deblokkeren";
    if (window.confirm(`Weet je zeker dat je dit account wilt ${action}?`)) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => 
          u.id === userId ? { ...u, active: !currentActive } : u
        )
      }));
    }
  };

  const handleEditName = (user: User) => {
    const newName = window.prompt("Voer een nieuwe naam in voor dit account:", user.name);
    if (newName && newName.trim() !== "" && newName !== user.name) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => 
          u.id === user.id ? { ...u, name: newName.trim() } : u
        )
      }));
    }
  };

  const handleRemoveAvatar = (user: User) => {
    if (window.confirm(`Weet je zeker dat je de profielfoto van ${user.name} wilt verwijderen?`)) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => 
          u.id === user.id ? { ...u, avatar: undefined } : u
        )
      }));
    }
  };

  const handlePrivacyRequest = (user: User) => {
    if (window.confirm(`Weet je zeker dat je een "Verzoek persoonsgegevens verwijderen" wilt sturen naar de beheerders van de clubs van ${user.name}?`)) {
      
      const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(user.id));
      const clubIds = userClubs.map((c: Club) => c.id).join(",");
      
      if (!clubIds) {
        alert("Deze gebruiker is niet gekoppeld aan clubs.");
        return;
      }

      const newNotification = {
        id: "notif_" + Date.now().toString(),
        type: 'privacy_deletion_request',
        title: 'Verzoek persoonsgegevens verwijderen',
        message: `Applicatiebeheerder heeft namens lid '${user.name}' (${user.email}) een verzoek ingediend om persoonsgegevens te verwijderen (i.v.m. privacywet/AVG). Maak het e-mailadres leeg, verwijder eventueel de profielfoto, en anonimiseer de naam (bijv. van 'Jan Jansen' naar 'Jan J.'). Je hebt hiervoor 14 dagen de tijd.`,
        forRole: ['admin'],
        forUserId: user.id, // The user to be anonymized
        readBy: [],
        createdAt: new Date().toISOString(),
        relatedEntityId: clubIds, // Store club ids here so we know which clubs it belongs to
      };

      setData((prev: any) => ({
        ...prev,
        notifications: [...(prev.notifications || []), newNotification]
      }));
      
      alert("Verzoek is verstuurd naar de beheerders.");
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Weet je HEEEL ZEKER dat je dit account volledig wilt verwijderen? Dit kan onverwachte effecten hebben als de speler in uitslagen of seizoenen staat.")) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.filter((u: User) => u.id !== userId),
        clubs: prev.clubs.map((c: Club) => ({
          ...c,
          memberIds: (c.memberIds || []).filter(id => id !== userId),
          coAdminEmails: (c.coAdminEmails || []).filter(e => e !== data.users.find((u:User) => u.id === userId)?.email)
        })),
        seasons: prev.seasons.map((s: any) => ({
          ...s,
          members: (s.members || []).filter((m: any) => m.userId !== userId)
        }))
      }));
    }
  };

  const filteredUsers = data.users.filter((u: User) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterClubId !== "all") {
      const club = data.clubs.find((c: Club) => c.id === filterClubId);
      if (!club || !(club.memberIds || []).includes(u.id)) return false;
    }
    
    return true;
  });

  return (
    <motion.div
      key="manage-accounts"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Accounts Beheren
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Overzicht van alle geregistreerde accounts. Koppel ze los van clubs, blokkeer ze of verwijder ze.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Zoeken op naam of e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-slate-400" />
            </div>
            <select
              value={filterClubId}
              onChange={(e) => setFilterClubId(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
            >
              <option value="all">Alle clubs</option>
              {data.clubs.map((c: Club) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400">Naam</th>
                <th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">E-mail</th>
                <th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400">Clubs</th>
                <th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                <th className="pb-3 pt-4 px-2 sm:px-4 font-bold text-sm text-slate-500 dark:text-slate-400 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user: User) => {
                const userClubs = data.clubs.filter((c: Club) => (c.memberIds || []).includes(user.id));
                const isActive = user.active !== false;

                return (
                  <tr key={user.id} className={cn("hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors", !isActive && "opacity-60")}>
                    <td className="py-4 px-2 sm:px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {user.name}
                      <div className="sm:hidden text-xs text-slate-500 mt-1">{user.email}</div>
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 text-sm hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 text-sm">
                      {userClubs.length > 0 ? (
                        <div className="space-y-1">
                          {userClubs.map(c => (
                            <div key={c.id} className="flex items-center gap-2">
                              <span>{c.name}</span>
                              <button
                                onClick={() => handleUnlink(user.id, c.id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                                title="Loskoppelen van club"
                              >
                                <Unlink size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Geen clubs</span>
                      )}
                    </td>
                    <td className="py-4 px-2 sm:px-4">
                      {isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Actief
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          Geblokkeerd
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditName(user)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Naam wijzigen"
                        >
                          <Edit2 size={18} />
                        </button>
                        {user.avatar && (
                          <button
                            onClick={() => handleRemoveAvatar(user)}
                            className="p-2 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                            title="Profielfoto verwijderen"
                          >
                            <ImageOff size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrivacyRequest(user)}
                          className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Verzoek persoonsgegevens verwijderen"
                        >
                          <UserX size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user.id, isActive)}
                          className={cn("p-2 rounded-lg transition-colors", isActive ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20")}
                          title={isActive ? "Account blokkeren" : "Account deblokkeren"}
                        >
                          <ShieldBan size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          title="Account verwijderen"
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Geen accounts gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
