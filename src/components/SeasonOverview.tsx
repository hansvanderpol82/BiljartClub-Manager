import React, { useState } from 'react';
import { Match, Season, Club, User } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Filter, LayoutGrid } from 'lucide-react';

interface SeasonOverviewProps {
  data: any;
  activeSeason: Season;
  activeClub: Club;
  calculatePoints: (made: number, target: number, oppMade?: number, oppTarget?: number, system?: string) => number;
}

export function SeasonOverview({ data, activeSeason, activeClub, calculatePoints }: SeasonOverviewProps) {
  // get all members in this season
  const seasonMembers = (activeSeason.members || [])
    .map((sm: any) => data.users.find((u: User) => u.id === sm.userId))
    .filter(Boolean)
    .sort((a: User, b: User) => a.name.localeCompare(b.name));

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("all");

  const matches = data.matches.filter((m: Match) => m.seasonId === activeSeason.id && m.status !== 'cancelled');

  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') return num;
    return num.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getPlayerStatsAsWhite = (playerId: string) => {
    return matches.filter((m: Match) => m.player1Id === playerId).map((m: Match) => {
      const opp = data.users.find((u: User) => u.id === m.player2Id);
      const isFinished = m.status === 'finished';
      const target = m.player1AvgBefore;
      const made = m.turns.reduce((sum, t) => sum + (t.player1 || 0), 0);
      const oppMade = m.turns.reduce((sum, t) => sum + (t.player2 || 0), 0);
      const turns = m.turns.length;
      const hs = m.turns.length > 0 ? Math.max(...m.turns.map(t => t.player1 || 0)) : 0;
      const points = calculatePoints(made, target, oppMade, m.player2AvgBefore, activeSeason.scoringSystem);
      const avg = turns > 0 ? made / turns : 0;
      return {
        opponentName: opp ? opp.name : 'Onbekend',
        target: isFinished ? target : '-',
        made: isFinished ? made : '-',
        turns: isFinished ? turns : '-',
        hs: isFinished ? hs : '-',
        points: isFinished ? points : '-',
        avg: isFinished ? avg : '-'
      };
    });
  };

  const getPlayerStatsAsYellow = (playerId: string) => {
    return matches.filter((m: Match) => m.player2Id === playerId).map((m: Match) => {
      const opp = data.users.find((u: User) => u.id === m.player1Id);
      const isFinished = m.status === 'finished';
      const target = m.player2AvgBefore;
      const made = m.turns.reduce((sum, t) => sum + (t.player2 || 0), 0);
      const oppMade = m.turns.reduce((sum, t) => sum + (t.player1 || 0), 0);
      const turns = m.turns.length;
      const hs = m.turns.length > 0 ? Math.max(...m.turns.map(t => t.player2 || 0)) : 0;
      const points = calculatePoints(made, target, oppMade, m.player1AvgBefore, activeSeason.scoringSystem);
      const avg = turns > 0 ? made / turns : 0;
      return {
        opponentName: opp ? opp.name : 'Onbekend',
        target: isFinished ? target : '-',
        made: isFinished ? made : '-',
        turns: isFinished ? turns : '-',
        hs: isFinished ? hs : '-',
        points: isFinished ? points : '-',
        avg: isFinished ? avg : '-'
      };
    });
  };

  const playersToRender = selectedPlayerId === "all" 
    ? seasonMembers 
    : seasonMembers.filter((u: User) => u.id === selectedPlayerId);

  return (
    <motion.div
      key="season-overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <LayoutGrid size={24} className="text-emerald-500" />
          Seizoen Overzicht
        </h2>
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-1 sm:flex-none items-center gap-4 w-full sm:w-auto">
          <Filter className="text-slate-400 shrink-0" size={20} />
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
          >
            <option value="all">Alle spelers</option>
            {seasonMembers.map((u: User) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {playersToRender.map((player: User) => {
          const statsWhite = getPlayerStatsAsWhite(player.id);
          const statsYellow = getPlayerStatsAsYellow(player.id);

          if (statsWhite.length === 0 && statsYellow.length === 0 && selectedPlayerId === "all") {
             // skip rendering players with 0 matches when viewing all to save space?
             // Actually, let's just render them as it shows who is in the season.
          }

          return (
            <div key={player.id} className="space-y-4">
              <h2 className="text-xl font-black text-center text-slate-800 dark:text-white bg-emerald-100 dark:bg-emerald-900/30 py-2 rounded-t-xl border border-emerald-200 dark:border-emerald-800">
                {player.name}
              </h2>

              {/* White ball table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 text-center text-sm font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  {activeSeason.name} (Witte bal)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-2 py-3 text-left font-semibold">Tegenstander</th>
                        <th className="px-2 py-3 text-right font-semibold" title="Startgemiddelde">Gemiddelde</th>
                        <th className="px-2 py-3 text-right font-semibold">Caramboles</th>
                        <th className="px-2 py-3 text-right font-semibold">Beurten</th>
                        <th className="px-2 py-3 text-right font-semibold">Hoogste serie</th>
                        <th className="px-2 py-3 text-right font-semibold">Punten</th>
                        <th className="px-2 py-3 text-right font-semibold" title="Gespeeld gemiddelde">Gemiddelde</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {statsWhite.length === 0 ? (
                        <tr><td colSpan={7} className="px-2 py-4 text-center text-slate-500">Geen wedstrijden gespeeld</td></tr>
                      ) : (
                        statsWhite.map((stat, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-2 py-2 font-medium text-slate-700 dark:text-slate-300">{stat.opponentName}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.target}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.made}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.turns}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.hs}</td>
                            <td className="px-2 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">{stat.points}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(stat.avg)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Yellow ball table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 text-center text-sm font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  {activeSeason.name} (Gele bal)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-2 py-3 text-left font-semibold">Tegenstander</th>
                        <th className="px-2 py-3 text-right font-semibold" title="Startgemiddelde">Gemiddelde</th>
                        <th className="px-2 py-3 text-right font-semibold">Caramboles</th>
                        <th className="px-2 py-3 text-right font-semibold">Beurten</th>
                        <th className="px-2 py-3 text-right font-semibold">Hoogste serie</th>
                        <th className="px-2 py-3 text-right font-semibold">Punten</th>
                        <th className="px-2 py-3 text-right font-semibold" title="Gespeeld gemiddelde">Gemiddelde</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {statsYellow.length === 0 ? (
                        <tr><td colSpan={7} className="px-2 py-4 text-center text-slate-500">Geen wedstrijden gespeeld</td></tr>
                      ) : (
                        statsYellow.map((stat, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-2 py-2 font-medium text-slate-700 dark:text-slate-300">{stat.opponentName}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.target}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.made}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.turns}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{stat.hs}</td>
                            <td className="px-2 py-2 text-right font-bold text-amber-600 dark:text-amber-400">{stat.points}</td>
                            <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(stat.avg)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
