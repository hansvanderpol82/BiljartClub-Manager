const fs = require('fs');
let content = fs.readFileSync('src/components/SeasonOverview.tsx', 'utf8');

const search = `  const matches = data.matches.filter((m: Match) => m.seasonId === activeSeason.id && m.status === 'finished');

  const formatNumber = (num: number) => {
    return num.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getPlayerStatsAsWhite = (playerId: string) => {
    return matches.filter((m: Match) => m.player1Id === playerId).map((m: Match) => {
      const opp = data.users.find((u: User) => u.id === m.player2Id);
      const target = m.player1AvgBefore;
      const made = m.turns.reduce((sum, t) => sum + (t.player1 || 0), 0);
      const oppMade = m.turns.reduce((sum, t) => sum + (t.player2 || 0), 0);
      const turns = m.turns.length;
      const hs = m.turns.length > 0 ? Math.max(...m.turns.map(t => t.player1 || 0)) : 0;
      const points = calculatePoints(made, target, oppMade, m.player2AvgBefore, activeSeason.scoringSystem);
      const avg = turns > 0 ? made / turns : 0;
      return {
        opponentName: opp ? opp.name : 'Onbekend',
        target,
        made,
        turns,
        hs,
        points,
        avg
      };
    });
  };

  const getPlayerStatsAsYellow = (playerId: string) => {
    return matches.filter((m: Match) => m.player2Id === playerId).map((m: Match) => {
      const opp = data.users.find((u: User) => u.id === m.player1Id);
      const target = m.player2AvgBefore;
      const made = m.turns.reduce((sum, t) => sum + (t.player2 || 0), 0);
      const oppMade = m.turns.reduce((sum, t) => sum + (t.player1 || 0), 0);
      const turns = m.turns.length;
      const hs = m.turns.length > 0 ? Math.max(...m.turns.map(t => t.player2 || 0)) : 0;
      const points = calculatePoints(made, target, oppMade, m.player1AvgBefore, activeSeason.scoringSystem);
      const avg = turns > 0 ? made / turns : 0;
      return {
        opponentName: opp ? opp.name : 'Onbekend',
        target,
        made,
        turns,
        hs,
        points,
        avg
      };
    });
  };`;

const replace = `  const matches = data.matches.filter((m: Match) => m.seasonId === activeSeason.id && m.status !== 'cancelled');

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
  };`;

if (content.includes("const matches = data.matches.filter((m: Match) => m.seasonId === activeSeason.id && m.status === 'finished');")) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/components/SeasonOverview.tsx', content);
  console.log("Patched successfully.");
} else {
  console.log("String not found.");
}
