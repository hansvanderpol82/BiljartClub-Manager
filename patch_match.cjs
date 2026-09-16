const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The block starts around line 2590.
// Let's replace the useMemos for p1PreviousTotal, p2PreviousTotal, p1Confirmed, p2Confirmed.

const search = `  const p1PreviousTotal = useMemo(() => {
    if (!liveMatch) return 0;
    return (liveMatch.turns || [])
      .slice(0, activeTurnIndex)
      .reduce((acc: number, t: any) => acc + (t.player1 || 0), 0);
  }, [liveMatch, activeTurnIndex]);

  const p2PreviousTotal = useMemo(() => {
    if (!liveMatch) return 0;
    return (liveMatch.turns || [])
      .slice(0, activeTurnIndex)
      .reduce((acc: number, t: any) => acc + (t.player2 || 0), 0);
  }, [liveMatch, activeTurnIndex]);

  const p1Total = p1PreviousTotal + currentTurnP1;
  const p2Total = p2PreviousTotal + currentTurnP2;

  // Refined confirmed and progress tracking
  const p1LiveSerie = currentTurnP1;
  const p2LiveSerie = currentTurnP2;

  const p1Confirmed = useMemo(() => {
    if (!liveMatch) return 0;
    const turns =
      activeScoringPlayer === 2 ? activeTurnIndex + 1 : activeTurnIndex;
    return (liveMatch.turns || [])
      .slice(0, turns)
      .reduce((acc: number, t: any) => acc + (t.player1 || 0), 0);
  }, [liveMatch, activeTurnIndex, activeScoringPlayer]);

  const p2Confirmed = useMemo(() => {
    if (!liveMatch) return 0;
    const turns = activeTurnIndex;
    return (liveMatch.turns || [])
      .slice(0, turns)
      .reduce((acc: number, t: any) => acc + (t.player2 || 0), 0);
  }, [liveMatch, activeTurnIndex]);`;

const replace = `  const isMatchFinished = liveMatch?.status === 'finished' || liveMatch?.status === 'completed' || liveMatch?.status === 'cancelled';

  const p1PreviousTotal = useMemo(() => {
    if (!liveMatch) return 0;
    if (isMatchFinished) {
      return (liveMatch.turns || []).reduce((acc: number, t: any) => acc + (t.player1 || 0), 0);
    }
    return (liveMatch.turns || [])
      .slice(0, activeTurnIndex)
      .reduce((acc: number, t: any) => acc + (t.player1 || 0), 0);
  }, [liveMatch, activeTurnIndex, isMatchFinished]);

  const p2PreviousTotal = useMemo(() => {
    if (!liveMatch) return 0;
    if (isMatchFinished) {
      return (liveMatch.turns || []).reduce((acc: number, t: any) => acc + (t.player2 || 0), 0);
    }
    return (liveMatch.turns || [])
      .slice(0, activeTurnIndex)
      .reduce((acc: number, t: any) => acc + (t.player2 || 0), 0);
  }, [liveMatch, activeTurnIndex, isMatchFinished]);

  const p1Total = isMatchFinished ? p1PreviousTotal : (p1PreviousTotal + currentTurnP1);
  const p2Total = isMatchFinished ? p2PreviousTotal : (p2PreviousTotal + currentTurnP2);

  // Refined confirmed and progress tracking
  const p1LiveSerie = isMatchFinished ? 0 : currentTurnP1;
  const p2LiveSerie = isMatchFinished ? 0 : currentTurnP2;

  const p1Confirmed = useMemo(() => {
    if (!liveMatch) return 0;
    if (isMatchFinished) {
      return (liveMatch.turns || []).reduce((acc: number, t: any) => acc + (t.player1 || 0), 0);
    }
    const turns =
      activeScoringPlayer === 2 ? activeTurnIndex + 1 : activeTurnIndex;
    return (liveMatch.turns || [])
      .slice(0, turns)
      .reduce((acc: number, t: any) => acc + (t.player1 || 0), 0);
  }, [liveMatch, activeTurnIndex, activeScoringPlayer, isMatchFinished]);

  const p2Confirmed = useMemo(() => {
    if (!liveMatch) return 0;
    if (isMatchFinished) {
      return (liveMatch.turns || []).reduce((acc: number, t: any) => acc + (t.player2 || 0), 0);
    }
    const turns = activeTurnIndex;
    return (liveMatch.turns || [])
      .slice(0, turns)
      .reduce((acc: number, t: any) => acc + (t.player2 || 0), 0);
  }, [liveMatch, activeTurnIndex, isMatchFinished]);`;

if (content.includes('const p1PreviousTotal = useMemo(() => {')) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched totals.");
} else {
  console.log("Not found.");
}
