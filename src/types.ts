export interface User {
  id: string;
  name: string;
  shortName?: string;
  email: string;
  role: 'admin' | 'planner' | 'member';
  baseAverage: number; // Starting average for the user
  avatar?: string;
  participatesInExternalMatches?: boolean;
}

export interface Club {
  id: string;
  name: string;
  logo?: string;
  adminId: string;
  memberIds: string[];
  participatesInExternalMatches?: boolean;
}

export interface SeasonMember {
  userId: string;
  currentAverage: number;
  paidContributie: boolean;
  manualAverageOverride?: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for income, negative for expense
  type: 'manual' | 'contribution' | 'match_fee';
  userId?: string; // Optional: who performed the transaction or who it's for
}

export interface Season {
  id: string;
  clubId: string;
  name: string;
  members: SeasonMember[];
  matchesPerPair: number;
  speeldagen: string[]; // ['maandag', 'woensdag']
  wedstrijdenPerSpeeldag: number;
  beurtenPerWedstrijd: number;
  herzieningenPerSeizoen: number; // How many times to auto-recalculate
  contributie: number;
  inlegPerWedstrijd: number;
  aantalTafels: number;
  status: 'open' | 'closed';
  isBlocked?: boolean;
  attendance?: Record<string, string[]>; // date string -> array of userIds who are PRESENT
  cancelledDays?: Record<string, string>; // date string -> reason
  initialBalanceType?: 'manual' | 'carryover';
  initialBalanceAmount?: number;
  carryoverSeasonId?: string;
  transactions?: Transaction[];
  scoringSystem?: 'default' | 'driebanden';
}

export interface Match {
  id: string;
  seasonId: string;
  clubId: string;
  date: string;
  player1Id: string;
  player2Id: string;
  arbiterId?: string;
  writerId?: string;
  tafelNummer?: number;
  status: 'planned' | 'started' | 'finished' | 'cancelled';
  player1AvgBefore: number;
  player2AvgBefore: number;
  turns: { player1: number; player2: number }[];
  player1Paid: boolean;
  player2Paid: boolean;
}

export interface MemberStats {
  memberId: string;
  matchesPlayed: number;
  totalCaramboles: number;
  highestSerie: number;
  average: number;
  points: number;
  paidContributie: boolean;
}

export interface ExternalMatchGame {
  id: string;
  homePlayerId: string;
  awayPlayerId: string;
  homeScore: number;
  awayScore: number;
  homeTarget?: number;
  awayTarget?: number;
  homePoints: number; // calculated points for the game
  awayPoints: number; // calculated points for the game
  status: 'planned' | 'started' | 'finished';
  arbiterId?: string;
  writerId?: string;
  tafelNummer?: number;
  turns?: { player1: number; player2: number }[];
  date?: string;
  homePlayerPaid?: boolean;
  awayPlayerPaid?: boolean;
}

export interface ExternalMatch {
  id: string;
  homeClubId: string;
  awayClubId: string;
  date: string;
  games: ExternalMatchGame[];
  status: 'planned' | 'started' | 'finished';
  isBlocked?: boolean;
  scoringSystem?: 'default' | 'driebanden';
  aantalTafels?: number;
  beurtenPerWedstrijd?: number;
  seasonId?: string;
  homePlayerFee?: number;
  awayPlayerFee?: number;
}
