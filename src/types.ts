export interface User {
  id: string;
  name: string;
  shortName?: string;
  email: string;
  role: 'admin' | 'planner' | 'member';
  baseAverage: number;
  avatar?: string;
  participatesInExternalMatches?: boolean;
}

export interface Club {
  id: string;
  name: string;
  logo?: string;
  adminId: string;
  coAdminEmails?: string[];
  memberIds: string[];
  participatesInExternalMatches?: boolean;
  inviteEmailTemplate?: string;
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
  amount: number;
  type: 'manual' | 'contribution' | 'match_fee';
  userId?: string;
}

export interface Season {
  id: string;
  clubId: string;
  name: string;
  startDate?: string;
  members: SeasonMember[];
  matchesPerPair: number;
  speeldagen: string[];
  wedstrijdenPerSpeeldag: number;
  beurtenPerWedstrijd: number;
  herzieningenPerSeizoen: number;
  contributie: number;
  inlegPerWedstrijd: number;
  aantalTafels: number;
  status: 'open' | 'closed';
  isBlocked?: boolean;
  attendance?: Record<string, string[]>;
  cancelledDays?: Record<string, string>;
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
  homePoints: number;
  awayPoints: number;
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
