import React, { useState, useEffect, useMemo, useRef } from "react";
import { PaymentModal } from "./components/PaymentModal";
import {
  Trophy,
  Users,
  Calendar,
  Settings,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Minus,
  ArrowLeft,
  Sun,
  Moon,
  LayoutDashboard,
  UserCircle,
  LogOut,
  Image as ImageIcon,
  Clock,
  Tv,
  Table as TableIcon,
  UserPlus,
  CreditCard,
  History,
  Trash2,
  Lock,
  Unlock,
  Monitor,
  Search,
  TrendingUp,
  Eye,
  Gift,
  XCircle,
  X,
  Building2,
  ShieldCheck,
  User as UserIcon,
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Save,
  Share2,
  MonitorPlay,
  Banknote,
  RefreshCw,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toJpeg } from "html-to-image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "./lib/utils";
import { auth, googleProvider, db, storage } from "./lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signInWithPopup, User as FirebaseUser, onAuthStateChanged, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Login } from "./components/Login";
import {
  User,
  Club,
  Season,
  Match,
  MemberStats,
  SeasonMember,
  Transaction,
} from "./types";

// --- Mock Data & Storage ---
const STORAGE_KEY = "biljart_club_data";
const DAYS_OF_WEEK = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
];

// --- Formatting Helpers ---
const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDecimal = (num: number, decimals: number = 2) => {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

const formatCurrency = (amount?: number) =>
  currencyFormatter.format(amount || 0);
const formatNumber = (num?: number) => numberFormatter.format(num || 0);

// --- Holiday Helper ---
const getEaster = (year: number) => {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
};

const getHolidays = (year: number) => {
  const easter = getEaster(year);
  const addDaysToDate = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const holidays: Record<string, string> = {
    [`${year}-01-01`]: "Nieuwjaarsdag",
    [`${year}-04-27`]: "Koningsdag",
    [`${year}-05-05`]: "Bevrijdingsdag",
    [`${year}-12-25`]: "1e Kerstdag",
    [`${year}-12-26`]: "2e Kerstdag",
  };

  // Variable holidays
  const goodFriday = addDaysToDate(easter, -2);
  const easterMonday = addDaysToDate(easter, 1);
  const ascension = addDaysToDate(easter, 39);
  const pentecostMonday = addDaysToDate(easter, 50);

  holidays[format(goodFriday, "yyyy-MM-dd")] = "Goede Vrijdag";
  holidays[format(easter, "yyyy-MM-dd")] = "1e Paasdag";
  holidays[format(easterMonday, "yyyy-MM-dd")] = "2e Paasdag";
  holidays[format(ascension, "yyyy-MM-dd")] = "Hemelvaartsdag";
  holidays[format(addDaysToDate(pentecostMonday, -1), "yyyy-MM-dd")] =
    "1e Pinksterdag";
  holidays[format(pentecostMonday, "yyyy-MM-dd")] = "2e Pinksterdag";

  return holidays;
};

const getHolidayForDate = (date: Date) => {
  const holidays = getHolidays(date.getFullYear());
  const dateStr = format(date, "yyyy-MM-dd");
  return holidays[dateStr] || null;
};

const initialData = {
  users: [
    {
      id: "1",
      name: "Hans de Beheerder",
      email: "hans@example.com",
      role: "admin",
      baseAverage: 25,
    },
    {
      id: "2",
      name: "Piet Speler",
      email: "piet@example.com",
      role: "member",
      baseAverage: 18,
    },
    {
      id: "3",
      name: "Jan Schrijver",
      email: "jan@example.com",
      role: "member",
      baseAverage: 22,
    },
    {
      id: "4",
      name: "Klaas Arbiter",
      email: "klaas@example.com",
      role: "member",
      baseAverage: 20,
    },
  ] as User[],
  clubs: [] as Club[],
  seasons: [] as Season[],
  matches: [] as Match[],
  externalMatches: [] as any[],
};

// --- Helper Functions ---
const calculatePoints = (
  made: number,
  target: number,
  opponentMade?: number,
  opponentTarget?: number,
  system: "default" | "driebanden" = "default",
) => {
  if (system === "driebanden") {
    if (made === 0) return 0;
    const carambolePoints = Math.min(10, Math.floor((made / target) * 10));

    // Bonus points
    let bonus = 0;
    if (opponentMade !== undefined && opponentTarget !== undefined) {
      const myPct = made / target;
      const oppPct = opponentMade / opponentTarget;

      if (myPct > oppPct) {
        bonus = 2;
      } else if (myPct === oppPct && myPct > 0) {
        // Only give draw bonus if some progress was made or they actually played
        bonus = 1;
      }
    }

    return carambolePoints + bonus;
  }

  // Default system
  if (made === 0) return 0;
  if (made < target) {
    return Math.floor((made / target) * 10);
  }
  if (made < target * 1.5) {
    return Math.floor(10 + ((made - target) / target) * 10);
  }
  return 15;
};

const RingGirlSVG = () => (
  <svg
    width="240"
    height="360"
    viewBox="0 0 100 150"
    className="drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
  >
    {/* Body Skin Tone */}
    <circle cx="50" cy="20" r="12" fill="#ffdcb7" />
    {/* Hair */}
    <path d="M 38 20 C 38 -5 62 -5 62 20 L 68 45 L 32 45 Z" fill="#2d1b15" />
    <circle cx="50" cy="18" r="10" fill="#ffdcb7" />
    {/* Eyes & Smile */}
    <ellipse cx="45" cy="17" rx="1.5" ry="2" fill="#000" />
    <ellipse cx="55" cy="17" rx="1.5" ry="2" fill="#000" />
    <path
      d="M 46 23 Q 50 28 54 23"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 43 14 Q 45 12 47 14"
      stroke="#000"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 53 14 Q 55 12 57 14"
      stroke="#000"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
    />

    {/* Torso */}
    <path d="M 40 32 L 60 32 L 55 80 L 45 80 Z" fill="#ffdcb7" />

    {/* Bikini Top (Red with white trim) */}
    <path d="M 38 38 Q 50 45 62 38 L 62 48 Q 50 55 38 48 Z" fill="#e60000" />
    <path
      d="M 38 38 Q 50 45 62 38"
      fill="none"
      stroke="#fff"
      strokeWidth="1.5"
    />

    {/* Belly Button & Abs */}
    <circle cx="50" cy="65" r="1" fill="#cfa885" />
    <path
      d="M 48 55 L 48 60 M 52 55 L 52 60"
      stroke="#e0bc98"
      strokeWidth="1"
      strokeLinecap="round"
    />

    {/* Bikini Bottom */}
    <path d="M 42 80 L 58 80 L 50 95 Z" fill="#e60000" />
    <path d="M 42 80 L 58 80" fill="none" stroke="#fff" strokeWidth="1.5" />

    {/* Arms (holding up the board) */}
    <path
      d="M 41 35 Q 15 45 22 5"
      fill="none"
      stroke="#ffdcb7"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <path
      d="M 59 35 Q 85 45 78 5"
      fill="none"
      stroke="#ffdcb7"
      strokeWidth="8"
      strokeLinecap="round"
    />

    {/* Legs */}
    <path
      d="M 46 90 L 38 135"
      fill="none"
      stroke="#ffdcb7"
      strokeWidth="9"
      strokeLinecap="round"
    />
    <path
      d="M 54 90 L 62 135"
      fill="none"
      stroke="#ffdcb7"
      strokeWidth="9"
      strokeLinecap="round"
    />

    {/* High Heels */}
    <path d="M 33 135 L 43 135 L 41 148 L 35 145 Z" fill="#111" />
    <path d="M 57 135 L 67 135 L 65 148 L 59 145 Z" fill="#111" />
  </svg>
);

const isClubAdmin = (club: Club | null | undefined, user: User | null | undefined) => {
  if (!club || !user) return false;
  return club.adminId === user.id || (club.coAdminEmails || []).includes(user.email);
};

export default function App() {
  const [data, setData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("biljart_club_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clubs && parsed.clubs.length > 0) {
          return {
            ...initialData,
            ...parsed,
            externalMatches: (parsed.externalMatches || initialData.externalMatches).filter(Boolean),
            matches: (parsed.matches || initialData.matches).filter(Boolean),
            seasons: (parsed.seasons || initialData.seasons).filter(Boolean),
            clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
            users: (parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean),
          };
        }
      }
    } catch(e) {}
    return initialData;
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) {
      setDataLoaded(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "appData", "main"), (docSnap) => {
      if (docSnap.exists()) {
        try {
          const parsedDataStr = docSnap.data().data;
          const parsed = JSON.parse(parsedDataStr);
          
          // Migrate logic: if Firestore is empty (0 clubs) and local has clubs, push local to Firestore instead of overwriting
          const firestoreClubs = parsed.clubs || [];
          const localClubs = dataRef.current.clubs || [];
          
          if (firestoreClubs.length === 0 && localClubs.length > 0) {
            console.log("Migrating local data to Firestore...");
            setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) }).catch(console.error);
          } else if (parsedDataStr !== JSON.stringify(dataRef.current)) {
            setData({
              ...initialData,
              ...parsed,
              externalMatches: (parsed.externalMatches || initialData.externalMatches).filter(Boolean),
              matches: (parsed.matches || initialData.matches).filter(Boolean),
              seasons: (parsed.seasons || initialData.seasons).filter(Boolean),
              clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
              users: (parsed.users?.length > 0 ? parsed.users : initialData.users).filter(Boolean),
            });
          }
        } catch(e) {}
      } else {
        setDoc(doc(db, "appData", "main"), { data: JSON.stringify(dataRef.current) }).catch(console.error);
      }
      setDataLoaded(true);
    }, (error) => {
      console.error("Error listening to appData:", error);
    });
    return () => unsub();
  }, [authUser]);

  const [currentUser, setCurrentUser] = useState<User>(data.users[0]);

  useEffect(() => {
    if (authUser && data.users) {
      let user = data.users.find((u: User) => u.email === authUser.email);
      
      // Auto-promote administrators if needed
      const isAdminEmail = authUser.email === "hansvanderpol82@gmail.com" || authUser.email === "biljartclubkot@gmail.com" || authUser.email === "bijartclubkot@gmail.com";
      
      if (user) {
        if (isAdminEmail && user.role !== "admin") {
          user = { ...user, role: "admin" };
          setData((prev: any) => ({
            ...prev,
            users: prev.users.map((u: User) => u.id === user.id ? user : u)
          }));
        }
        setCurrentUser(user);
      } else if (authUser.email) {
        const newUser: User = {
          id: authUser.uid,
          name: authUser.displayName || authUser.email.split('@')[0],
          email: authUser.email,
          role: isAdminEmail ? "admin" : "member",
          baseAverage: 20
        };
        setData((prev: any) => ({ ...prev, users: [...prev.users, newUser] }));
        setCurrentUser(newUser);
      }
    }
  }, [authUser, data.users]);


  const [inviteClubId, setInviteClubId] = useState(() => new URLSearchParams(window.location.search).get('invite') || null);
  const [showInviteWelcome, setShowInviteWelcome] = useState(!!inviteClubId);

  const [activeTab, setActiveTab] = useState<
    | "clubs"
    | "seasons"
    | "matches"
    | "members"
    | "settings"
    | "dashboard"
    | "profile"
    | "cashbook"
  >(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cast") === "true" || params.get("matchId"))
      return "matches";
    return "clubs";
  });
  const [selectedClubId, setSelectedClubId] = useState<string | null>(() =>
    localStorage.getItem("selectedClubId"),
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [selectedExternalMatchId, setSelectedExternalMatchId] = useState<
    string | null
  >(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    () => {
      const params = new URLSearchParams(window.location.search);
      const mId = params.get("matchId");
      if (mId) {
        const saved = localStorage.getItem(STORAGE_KEY);
        let appData = initialData;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            appData = {
              ...initialData,
              ...parsed,
              externalMatches: (
                parsed.externalMatches || initialData.externalMatches
              )
                .filter(Boolean)
                .filter(
                  (m: any) =>
                    m && (!m.date || !isNaN(new Date(m.date).getTime())),
                ),
              matches: (parsed.matches || initialData.matches)
                .filter(Boolean)
                .filter(
                  (m: any) => m && m.date && !isNaN(new Date(m.date).getTime()),
                ),
              seasons: (parsed.seasons || initialData.seasons)
                .filter(Boolean)
                .map((s: any) => ({
                  ...s,
                  inlegPerWedstrijd: s.inlegPerWedstrijd || 0,
                  contributie: s.contributie || 0,
                })),
              clubs: (parsed.clubs || initialData.clubs).filter(Boolean),
              users: (parsed.users?.length > 0
                ? parsed.users
                : initialData.users
              ).filter(Boolean),
            };
          } catch (e) {}
        }
        const m = appData.matches.find((match: Match) => match.id === mId);
        return m?.seasonId || null;
      }
      return localStorage.getItem("selectedSeasonId");
    },
  );
  const [liveMatchId, setLiveMatchId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const mId = params.get("matchId");
    if (mId) return mId;
    return localStorage.getItem("liveMatchId");
  });

  // Cast State Sync
  const [castState, setCastState] = useState<{
    viewType: "match" | "standings" | "extMatch" | "nextMatchDay";
    seasonId?: string;
    extMatchId?: string;
    matchId?: string;
  } | null>(() => {
    const saved = localStorage.getItem("biljart_cast_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    const channel = new BroadcastChannel("biljart_cast_channel");
    channel.onmessage = (e) => {
      if (e.data && e.data.type === "UPDATE_CAST_STATE") {
        setCastState(e.data.payload);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "biljart_cast_state" && e.newValue) {
        try {
          setCastState(JSON.parse(e.newValue));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [castMenuTarget, setCastMenuTarget] = useState<{
    type: "season" | "extMatch";
    id: string;
  } | null>(null);
  const [showPastCastMatches, setShowPastCastMatches] = useState(false);
  const [collapsedCastMatchDates, setCollapsedCastMatchDates] = useState<
    string[]
  >([]);

  const updateGlobalCastState = (newState: {
    viewType: "match" | "standings" | "extMatch" | "nextMatchDay";
    seasonId?: string;
    extMatchId?: string;
    matchId?: string;
  }) => {
    setCastState(newState);
    localStorage.setItem("biljart_cast_state", JSON.stringify(newState));
    const channel = new BroadcastChannel("biljart_cast_channel");
    channel.postMessage({ type: "UPDATE_CAST_STATE", payload: newState });
    channel.close();
  };

  const [isCastMode, setIsCastMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("cast") === "true";
  });
  const [castViewType, setCastViewType] = useState<
    "match" | "standings" | "extMatch" | "nextMatchDay"
  >(() => {
    const viewParams = new URLSearchParams(window.location.search).get("view");
    if (viewParams === "standings") return "standings";
    if (viewParams === "extMatch") return "extMatch";
    if (viewParams === "nextMatchDay") return "nextMatchDay";
    return "match";
  });
  const [castStandingsSeasonId, setCastStandingsSeasonId] = useState<
    string | null
  >(() => {
    return new URLSearchParams(window.location.search).get("seasonId");
  });
  const [castStandingsExternalId, setCastStandingsExternalId] = useState<
    string | null
  >(() => {
    return new URLSearchParams(window.location.search).get("extMatchId");
  });
  const [activeShareDropdown, setActiveShareDropdown] = useState<string | null>(
    null,
  );
  const [showPigAnimation, setShowPigAnimation] = useState(false);
  const [niceBallNotification, setNiceBallNotification] = useState<
    "white" | "yellow" | null
  >(null);
  const scoringInputRef = React.useRef<HTMLInputElement>(null);

  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubLogo, setNewClubLogo] = useState("");
  const [newClubLogoFile, setNewClubLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [newClubParticipatesExternal, setNewClubParticipatesExternal] =
    useState(false);
  const [newClubCoAdminEmails, setNewClubCoAdminEmails] = useState("");
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [newSeasonSpeeldagen, setNewSeasonSpeeldagen] = useState<string[]>([
    "maandag",
  ]);
  const [newSeasonMatchesPerPair, setNewSeasonMatchesPerPair] = useState(1);
  const [newSeasonBeurten, setNewSeasonBeurten] = useState(30);
  const [newSeasonMatchesPerDay, setNewSeasonMatchesPerDay] = useState(2);
  const [newSeasonContributie, setNewSeasonContributie] = useState("50,00");
  const [newSeasonInleg, setNewSeasonInleg] = useState("0,50");
  const [newSeasonAantalTafels, setNewSeasonAantalTafels] = useState(1);
  const [newSeasonMemberIds, setNewSeasonMemberIds] = useState<string[]>([]);
  const [newSeasonInitialBalanceType, setNewSeasonInitialBalanceType] =
    useState<"manual" | "carryover">("manual");
  const [newSeasonInitialBalanceAmount, setNewSeasonInitialBalanceAmount] =
    useState<string>("0,00");
  const [newSeasonCarryoverSeasonId, setNewSeasonCarryoverSeasonId] =
    useState<string>("");
  const [newSeasonScoringSystem, setNewSeasonScoringSystem] = useState<
    "default" | "driebanden"
  >("default");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionSeasonId, setTransactionSeasonId] = useState<string | null>(
    null,
  );
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [transactionDescription, setTransactionDescription] = useState("");
  const [transactionIncome, setTransactionIncome] = useState<string>("");
  const [transactionExpense, setTransactionExpense] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [showBlockedSeasons, setShowBlockedSeasons] = useState(false);
  const [showBlockedExternalMatches, setShowBlockedExternalMatches] =
    useState(false);
  const [isDeleteSeasonModalOpen, setIsDeleteSeasonModalOpen] = useState(false);
  const [seasonToDeleteId, setSeasonToDeleteId] = useState<string | null>(null);
  const [rescheduleOpponentModal, setRescheduleOpponentModal] = useState<{
    isOpen: boolean;
    dateStr: string;
    absentUserId: string;
    opponentUserId: string;
    seasonId: string;
    originalMatchId: string;
  } | null>(null);
  const [isDeleteExternalMatchModalOpen, setIsDeleteExternalMatchModalOpen] =
    useState(false);
  const [externalMatchToDeleteId, setExternalMatchToDeleteId] = useState<
    string | null
  >(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [exportCastData, setExportCastData] = useState<{
    type: "standings" | "extMatch" | "nextMatchDay";
    id: string;
  } | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberShortName, setNewMemberShortName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberAvg, setNewMemberAvg] = useState(20);
  const [newMemberRole, setNewMemberRole] = useState<
    "admin" | "planner" | "member"
  >("member");
  const [newMemberParticipatesExternal, setNewMemberParticipatesExternal] =
    useState(false);
  const [newMemberSendInvite, setNewMemberSendInvite] = useState(true);

  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [userSettingsEmail, setUserSettingsEmail] = useState(currentUser.email);
  const [userSettingsShortName, setUserSettingsShortName] = useState(
    currentUser.shortName || "",
  );
  const [userSettingsAvg, setUserSettingsAvg] = useState(
    currentUser.baseAverage,
  );
  const [userSettingsAvatar, setUserSettingsAvatar] = useState(
    currentUser.avatar || "",
  );
  const [
    userSettingsParticipatesExternal,
    setUserSettingsParticipatesExternal,
  ] = useState(currentUser.participatesInExternalMatches ?? false);
  const [isStartMatchModalOpen, setIsStartMatchModalOpen] = useState(false);
  const [matchToStartId, setMatchToStartId] = useState<string | null>(null);
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [isMatchSearchDropdownOpen, setIsMatchSearchDropdownOpen] =
    useState(false);
  const [isHomeMatchModalOpen, setIsHomeMatchModalOpen] = useState(false);
  const [newHomeMatchDate, setNewHomeMatchDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [newHomeMatchAwayClubId, setNewHomeMatchAwayClubId] = useState("");
  const [newHomeMatchScoringSystem, setNewHomeMatchScoringSystem] = useState<
    "default" | "driebanden"
  >("default");
  const [newHomeMatchAantalTafels, setNewHomeMatchAantalTafels] = useState(1);
  const [newHomeMatchBeurten, setNewHomeMatchBeurten] = useState(30);
  const [newHomeMatchSeasonId, setNewHomeMatchSeasonId] = useState<string>("");
  const [newHomeMatchHomeFee, setNewHomeMatchHomeFee] = useState<number>(0);
  const [newHomeMatchAwayFee, setNewHomeMatchAwayFee] = useState<number>(0);
  const [homeMatchStep, setHomeMatchStep] = useState<1 | 2>(1);
  const [homeMatchPairings, setHomeMatchPairings] = useState<
    { id: string; homePlayerId: string; awayPlayerId: string }[]
  >([]);
  const [paymentConfig, setPaymentConfig] = useState<{
    isOpen: boolean;
    amount: number;
    description: string;
    onSuccess: () => void;
  } | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const hasPromptedRescheduleRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMatchSearchDropdownOpen(false);
      }
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveShareDropdown(null);
      }
    };

    if (isMatchSearchDropdownOpen || activeShareDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMatchSearchDropdownOpen, activeShareDropdown]);
  const [matchDateFilter, setMatchDateFilter] = useState("");
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isCancelDayModalOpen, setIsCancelDayModalOpen] = useState(false);
  const [cancelDayDate, setCancelDayDate] = useState<string | null>(null);
  const [cancelDayReason, setCancelDayReason] = useState("");
  const [selectedArbiterId, setSelectedArbiterId] = useState<string>("");
  const [selectedWriterId, setSelectedWriterId] = useState<string>("");
  const [lastArbiterId, setLastArbiterId] = useState<string>(
    () => localStorage.getItem("lastArbiterId") || "",
  );
  const [lastWriterId, setLastWriterId] = useState<string>(
    () => localStorage.getItem("lastWriterId") || "",
  );
  const [selectedTafelNummer, setSelectedTafelNummer] = useState<number>(1);
  const [isFinishMatchModalOpen, setIsFinishMatchModalOpen] = useState(false);
  const [isCancelMatchModalOpen, setIsCancelMatchModalOpen] = useState(false);
  const [p1Paid, setP1Paid] = useState(true);
  const [p2Paid, setP2Paid] = useState(true);
  const [isMatchDetailModalOpen, setIsMatchDetailModalOpen] = useState(false);
  const [showFinishedMatches, setShowFinishedMatches] = useState(false);
  const [isMatchesExpanded, setIsMatchesExpanded] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalDate, setAttendanceModalDate] = useState<string | null>(
    null,
  );
  const [isDailyMatchFeesModalOpen, setIsDailyMatchFeesModalOpen] =
    useState(false);
  const [dailyMatchFeesDate, setDailyMatchFeesDate] = useState<string | null>(
    null,
  );
  const [selectedMatchIdForDetail, setSelectedMatchIdForDetail] = useState<
    string | null
  >(null);
  const [historyClubFilter, setHistoryClubFilter] = useState("");
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  const [historyOpponentFilter, setHistoryOpponentFilter] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "light" | "dark") || "light";
  });
  const [isContributionsDetailModalOpen, setIsContributionsDetailModalOpen] =
    useState(false);
  const [contributionsDetailType, setContributionsDetailType] = useState<
    "contributions" | "matchfees" | "externalmatchfees"
  >("contributions");
  const [matchfeesGroupView, setMatchfeesGroupView] = useState<
    "player" | "date"
  >("player");

  useEffect(() => {
    // URL parsing for cast mode removed
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [activeScoringPlayer, setActiveScoringPlayer] = useState<1 | 2>(() => {
    const saved = localStorage.getItem("activeScoringPlayer");
    return (saved as "1" | "2") === "2" ? 2 : 1;
  });

  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(() => {
    const saved = localStorage.getItem("activeTurnIndex");
    return saved ? parseInt(saved) : 0;
  });

  const [turnNotification, setTurnNotification] = useState<string | null>(null);

  // Remove the auto-clear useEffect for turnNotification
  // useEffect(() => {
  //   if (turnNotification) {
  //     const timer = setTimeout(() => setTurnNotification(null), 4000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [turnNotification]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptModalConfig, setPromptModalConfig] = useState<{
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  } | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [isEditSpeeldagenModalOpen, setIsEditSpeeldagenModalOpen] = useState(false);
  const [editSeasonSpeeldagen, setEditSeasonSpeeldagen] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => {
    setConfirmModalConfig({ title, message, onConfirm, onCancel });
    setIsConfirmModalOpen(true);
  };

  const handleUpdateMatchAverage = (match: Match, playerNum: 1 | 2) => {
    if (match.status !== "planned") return;
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "planner" &&
      !isClubAdmin(activeClub, currentUser)
    )
      return;

    const currentVal =
      playerNum === 1 ? match.player1AvgBefore : match.player2AvgBefore;
    const player = data.users.find(
      (u: User) =>
        u.id === (playerNum === 1 ? match.player1Id : match.player2Id),
    );
    const playerName =
      player?.shortName ||
      player?.name ||
      (playerNum === 1 ? "Speler 1" : "Speler 2");

    showPrompt(
      `Gemiddelde aanpassen`,
      `Nieuw gemiddelde voor ${playerName}:`,
      currentVal.toString(),
      (newValStr) => {
        const newVal = parseFloat(newValStr.replace(",", "."));
        if (isNaN(newVal)) return;

        showConfirm(
          "Alle wedstrijden bijwerken?",
          `Wil je het gemiddelde van ${playerName} ook aanpassen voor alle andere nog niet gespeelde wedstrijden in dit seizoen?`,
          () => {
            // Update all upcoming matches and season member info
            const playerId =
              playerNum === 1 ? match.player1Id : match.player2Id;
            setData((prev: any) => ({
              ...prev,
              matches: prev.matches.map((m: Match) => {
                if (m.seasonId === match.seasonId && m.status === "planned") {
                  const isP1 = m.player1Id === playerId;
                  const isP2 = m.player2Id === playerId;
                  if (isP1 || isP2) {
                    return {
                      ...m,
                      player1AvgBefore: isP1 ? newVal : m.player1AvgBefore,
                      player2AvgBefore: isP2 ? newVal : m.player2AvgBefore,
                    };
                  }
                }
                return m;
              }),
              seasons: prev.seasons.map((s: Season) => {
                if (s.id === match.seasonId) {
                  return {
                    ...s,
                    members: (s.members || []).map((sm: SeasonMember) =>
                      sm.userId === playerId
                        ? { ...sm, manualAverageOverride: newVal }
                        : sm,
                    ),
                  };
                }
                return s;
              }),
            }));
          },
          () => {
            // Update only this match
            setData((prev: any) => ({
              ...prev,
              matches: prev.matches.map((m: Match) =>
                m.id === match.id
                  ? {
                      ...m,
                      [playerNum === 1
                        ? "player1AvgBefore"
                        : "player2AvgBefore"]: newVal,
                    }
                  : m,
              ),
            }));
          },
        );
      },
    );
  };

  const handleUpdateExternalMatchTarget = (
    extMatch: any,
    game: any,
    myClubIsHome: boolean,
    playerNum: 1 | 2,
  ) => {
    if (game.status !== "planned") return;
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "planner" &&
      !isClubAdmin(activeClub, currentUser)
    )
      return;

    const isHomePlayer =
      (myClubIsHome && playerNum === 1) || (!myClubIsHome && playerNum === 2);
    const player = data.users.find(
      (u: User) =>
        u.id === (isHomePlayer ? game.homePlayerId : game.awayPlayerId),
    );

    let currentVal = isHomePlayer ? game.homeTarget : game.awayTarget;
    if (currentVal === undefined) {
      currentVal = player?.baseAverage || 0;
    }
    const playerName =
      player?.shortName || player?.name || "Speler " + playerNum;

    showPrompt(
      `Te spelen caramboles aanpassen`,
      `Nieuw aantal caramboles voor ${playerName}:`,
      currentVal.toString(),
      (newValStr) => {
        const newVal = parseFloat(newValStr.replace(",", "."));
        if (isNaN(newVal)) return;

        setData((prev: any) => ({
          ...prev,
          externalMatches: prev.externalMatches.map((em: any) => {
            if (em.id === extMatch.id) {
              return {
                ...em,
                games: (em.games || []).map((g: any) => {
                  if (g.id === game.id) {
                    return {
                      ...g,
                      [isHomePlayer ? "homeTarget" : "awayTarget"]: newVal,
                    };
                  }
                  return g;
                }),
              };
            }
            return em;
          }),
        }));
      },
    );
  };

  const handleSwapPlayers = (match: Match) => {
    if (match.status !== "planned") return;
    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "planner" &&
      !isClubAdmin(activeClub, currentUser)
    )
      return;

    setData((prev: any) => ({
      ...prev,
      matches: prev.matches.map((m: Match) => {
        if (m.id === match.id) {
          return {
            ...m,
            player1Id: m.player2Id,
            player2Id: m.player1Id,
            player1AvgBefore: m.player2AvgBefore,
            player2AvgBefore: m.player1AvgBefore,
          };
        }
        return m;
      }),
    }));
  };

  const showPrompt = (
    title: string,
    message: string,
    defaultValue: string,
    onConfirm: (value: string) => void,
  ) => {
    setPromptValue(defaultValue);
    setPromptModalConfig({ title, message, defaultValue, onConfirm });
    setIsPromptModalOpen(true);
  };

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "desc" };
    });
  };

  const standingsRef = useRef<HTMLDivElement>(null);
  const extMatchRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const exportStandings = async () => {
    if (!selectedSeasonId) return;
    setExportCastData({ type: "standings", id: selectedSeasonId });
    setTimeout(async () => {
      const node = document.getElementById("cast-standings-export-node");
      if (node) {
        try {
          const dataUrl = await toJpeg(node, {
            quality: 0.95,
            backgroundColor: "#064e3b",
          });

          const link = document.createElement("a");
          link.download = `cast-tussenstand-${activeClub?.name?.toLowerCase().replace(/\s+/g, "-") || "club"}.jpg`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error("Error sharing standings:", err);
        }
      }
      setExportCastData(null);
    }, 500);
  };

  const exportNextMatchDay = async (seasonId: string) => {
    if (!seasonId) return;
    setExportCastData({ type: "nextMatchDay", id: seasonId });
    setTimeout(async () => {
      const node = document.getElementById("cast-nextmatchday-export-node");
      if (node) {
        try {
          const dataUrl = await toJpeg(node, {
            quality: 1,
            backgroundColor: "#064e3b",
          });
          const link = document.createElement("a");
          link.download = `volgende-speeldag-${format(new Date(), "yyyy-MM-dd")}.jpg`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error("Error sharing next match day:", err);
        }
      }
      setExportCastData(null);
    }, 500);
  };

  const exportExtMatch = async (matchId: string) => {
    setExportCastData({ type: "extMatch", id: matchId });
    setTimeout(async () => {
      const node = document.getElementById("cast-extmatch-export-node");
      if (node) {
        try {
          const dataUrl = await toJpeg(node, {
            quality: 0.95,
            backgroundColor: "#064e3b",
          });
          const link = document.createElement("a");
          link.download = `cast-wedstrijd.jpg`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error("Error exporting image:", err);
        }
      }
      setExportCastData(null);
    }, 500);
  };

  const [currentTurnP1, setCurrentTurnP1] = useState(() => {
    const saved = localStorage.getItem("currentTurnP1");
    return saved ? parseInt(saved) : 0;
  });
  const [currentTurnP2, setCurrentTurnP2] = useState(() => {
    const saved = localStorage.getItem("currentTurnP2");
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    if (liveMatchId) {
      localStorage.setItem("liveMatchId", liveMatchId);
    } else {
      localStorage.removeItem("liveMatchId");
    }
  }, [liveMatchId]);

  useEffect(() => {
    if (dataLoaded) {
      setDoc(doc(db, "appData", "main"), { data: JSON.stringify(data) }).catch(console.error);
    }
  }, [data, dataLoaded]);

  useEffect(() => {
    localStorage.setItem("selectedClubId", selectedClubId || "");
  }, [selectedClubId]);

  useEffect(() => {
    localStorage.setItem("selectedSeasonId", selectedSeasonId || "");
  }, [selectedSeasonId]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (liveMatchId && scoringInputRef.current) {
      scoringInputRef.current.focus();
    }
  }, [liveMatchId, activeTurnIndex, activeScoringPlayer]);

  useEffect(() => {
    localStorage.setItem("currentTurnP1", currentTurnP1.toString());
  }, [currentTurnP1]);

  useEffect(() => {
    localStorage.setItem("currentTurnP2", currentTurnP2.toString());
  }, [currentTurnP2]);

  useEffect(() => {
    localStorage.setItem("activeScoringPlayer", activeScoringPlayer.toString());
  }, [activeScoringPlayer]);

  useEffect(() => {
    localStorage.setItem("activeTurnIndex", activeTurnIndex.toString());
  }, [activeTurnIndex]);

  useEffect(() => {
    if (turnNotification) {
      localStorage.setItem("turnNotification", turnNotification);
    } else {
      localStorage.removeItem("turnNotification");
    }
  }, [turnNotification]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setData(JSON.parse(e.newValue));
      }
      if (e.key === "currentTurnP1" && e.newValue) {
        setCurrentTurnP1(parseInt(e.newValue));
      }
      if (e.key === "currentTurnP2" && e.newValue) {
        setCurrentTurnP2(parseInt(e.newValue));
      }
      if (e.key === "activeScoringPlayer" && e.newValue) {
        setActiveScoringPlayer((e.newValue as "1" | "2") === "2" ? 2 : 1);
      }
      if (e.key === "activeTurnIndex" && e.newValue) {
        setActiveTurnIndex(parseInt(e.newValue));
      }
      if (e.key === "liveMatchId") {
        setLiveMatchId(e.newValue);
      }
      if (e.key === "selectedClubId") {
        setSelectedClubId(e.newValue || null);
      }
      if (e.key === "selectedSeasonId") {
        setSelectedSeasonId(e.newValue || null);
      }
      if (e.key === "activeTab") {
        setActiveTab(e.newValue as any);
      }
      if (e.key === "turnNotification") {
        setTurnNotification(e.newValue);
      }
      if (e.key === "pigAnimationTrigger") {
        setShowPigAnimation(true);
        setTimeout(() => setShowPigAnimation(false), 5000);
      }
      if (e.key === "niceBallAnimationTrigger" && e.newValue) {
        const color = e.newValue.split("|")[0] as "white" | "yellow";
        setNiceBallNotification(color);
        setTimeout(() => setNiceBallNotification(null), 5000);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const activeClub = useMemo(
    () => data.clubs.find((c: Club) => c.id === selectedClubId),
    [data.clubs, selectedClubId],
  );
  const activeSeason = useMemo(
    () => data.seasons.find((s: Season) => s.id === selectedSeasonId),
    [data.seasons, selectedSeasonId],
  );

  useEffect(() => {
    if (activeTab === "matches" && selectedSeasonId && activeSeason) {
      if (
        isClubAdmin(activeClub, currentUser) ||
        currentUser.role === "admin" ||
        currentUser.role === "planner"
      ) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const hasPastUnplayedMatches = (data.matches || []).some((m: Match) => {
          if (m.seasonId !== selectedSeasonId) return false;
          if (m.status !== "planned" && m.status !== "cancelled") return false;
          const matchDate = new Date(m.date);
          if (isNaN(matchDate.getTime())) return false;
          return isBefore(matchDate, now);
        });

        if (
          hasPastUnplayedMatches &&
          !hasPromptedRescheduleRef.current[selectedSeasonId]
        ) {
          hasPromptedRescheduleRef.current[selectedSeasonId] = true;
          showConfirm(
            "Herindelen",
            "Wil je de nog niet gespeelde wedstrijden herindelen?",
            () => handleRescheduleUnplayedMatches(selectedSeasonId),
          );
        }
      }
    }
  }, [
    activeTab,
    selectedSeasonId,
    data.matches,
    activeSeason,
    activeClub,
    currentUser,
  ]);

  // Global derivation for Live and Cast views
  const actualCastViewType = exportCastData
    ? exportCastData.type
    : isCastMode
      ? castState?.viewType || castViewType
      : castViewType;
  const actualCastSeasonId =
    exportCastData?.type === "standings" || exportCastData?.type === "nextMatchDay"
      ? exportCastData.id
      : isCastMode
        ? castState?.seasonId || castStandingsSeasonId
        : castStandingsSeasonId;
  const actualCastExtMatchId =
    exportCastData?.type === "extMatch"
      ? exportCastData.id
      : isCastMode
        ? castState?.extMatchId || castStandingsExternalId
        : castStandingsExternalId;
  const actualCastMatchId =
    isCastMode && actualCastViewType === "match"
      ? castState?.matchId || liveMatchId
      : liveMatchId;

  const liveMatch = useMemo(() => {
    let match = data.matches.find((m: Match) => m.id === actualCastMatchId);
    if (match) return match;

    if (data.externalMatches) {
      for (const em of data.externalMatches) {
        const game = em.games?.find((g: any) => g.id === actualCastMatchId);
        if (game) {
          const myClubIsHome = em.homeClubId === selectedClubId;
          const p1Id = myClubIsHome ? game.homePlayerId : game.awayPlayerId;
          const p2Id = myClubIsHome ? game.awayPlayerId : game.homePlayerId;
          return {
            id: game.id,
            seasonId: "external",
            clubId: em.homeClubId,
            date: em.date,
            player1Id: p1Id,
            player2Id: p2Id,
            player1Score: myClubIsHome ? game.homeScore : game.awayScore,
            player2Score: myClubIsHome ? game.awayScore : game.homeScore,
            status: game.status,
            arbiterId: game.arbiterId,
            writerId: game.writerId,
            tafelNummer: game.tafelNummer,
            turns: game.turns || [{ player1: 0, player2: 0 }],
            isExternal: true,
            extMatchId: em.id,
            scoringSystem: em.scoringSystem,
            beurtenPerWedstrijd: em.beurtenPerWedstrijd || 30,
            player1AvgBefore:
              (myClubIsHome ? game.homeTarget : game.awayTarget) ??
              (data.users.find((u: User) => u.id === p1Id)?.baseAverage || 0),
            player2AvgBefore:
              (myClubIsHome ? game.awayTarget : game.homeTarget) ??
              (data.users.find((u: User) => u.id === p2Id)?.baseAverage || 0),
          };
        }
      }
    }
    return undefined;
  }, [data.matches, data.externalMatches, actualCastMatchId, selectedClubId]);
  const p1 = useMemo(
    () => data.users.find((u: User) => u.id === liveMatch?.player1Id),
    [data.users, liveMatch],
  );
  const p2 = useMemo(
    () => data.users.find((u: User) => u.id === liveMatch?.player2Id),
    [data.users, liveMatch],
  );
  const arbiter = useMemo(
    () => data.users.find((u: User) => u.id === liveMatch?.arbiterId),
    [data.users, liveMatch],
  );
  const writer = useMemo(
    () => data.users.find((u: User) => u.id === liveMatch?.writerId),
    [data.users, liveMatch],
  );

  const p1PreviousTotal = useMemo(() => {
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
  }, [liveMatch, activeTurnIndex]);

  const p1CompletedTurns =
    activeScoringPlayer === 2 ? activeTurnIndex + 1 : activeTurnIndex;
  const p2CompletedTurns = activeTurnIndex;
  const p1CompletedTurnsCalc = p1CompletedTurns;
  const p2CompletedTurnsCalc = p2CompletedTurns;

  const liveCurrentSeason = useMemo(
    () => data.seasons.find((s: Season) => s.id === liveMatch?.seasonId),
    [data.seasons, liveMatch],
  );
  const isDriebandenLive = liveMatch?.isExternal
    ? liveMatch.scoringSystem === "driebanden"
    : liveCurrentSeason?.scoringSystem === "driebanden";
  const liveMaxTurns = isDriebandenLive
    ? liveMatch?.isExternal
      ? liveMatch.beurtenPerWedstrijd || 30
      : liveCurrentSeason?.beurtenPerWedstrijd || 30
    : liveMatch?.isExternal
      ? liveMatch.beurtenPerWedstrijd || 30
      : liveCurrentSeason?.beurtenPerWedstrijd || 30;

  const triggerPigAnimation = () => {
    localStorage.setItem("pigAnimationTrigger", Date.now().toString());
    setShowPigAnimation(true);
    setTimeout(() => setShowPigAnimation(false), 5000);
  };

  const triggerNiceBallAnimation = () => {
    const color = activeScoringPlayer === 1 ? "white" : "yellow";
    localStorage.setItem("niceBallAnimationTrigger", `${color}|${Date.now()}`);
    setNiceBallNotification(color);
    setTimeout(() => setNiceBallNotification(null), 5000);
  };

  const matchToStart = useMemo(() => {
    let match = data.matches.find((m: Match) => m.id === matchToStartId);
    if (match) return match;

    if (data.externalMatches) {
      for (const em of data.externalMatches) {
        const game = em.games?.find((g: any) => g.id === matchToStartId);
        if (game) {
          const myClubIsHome = em.homeClubId === selectedClubId;
          return {
            id: game.id,
            seasonId: "external",
            clubId: em.homeClubId,
            date: em.date,
            player1Id: myClubIsHome ? game.homePlayerId : game.awayPlayerId,
            player2Id: myClubIsHome ? game.awayPlayerId : game.homePlayerId,
            player1Score: myClubIsHome ? game.homeScore : game.awayScore,
            player2Score: myClubIsHome ? game.awayScore : game.homeScore,
            status: game.status,
            arbiterId: game.arbiterId,
            writerId: game.writerId,
            tafelNummer: game.tafelNummer,
            turns: game.turns || [{ player1: 0, player2: 0 }],
            isExternal: true,
            extMatchId: em.id,
            scoringSystem: em.scoringSystem,
            aantalTafels: em.aantalTafels || 1,
            player1Target: myClubIsHome ? game.homeTarget : game.awayTarget,
            player2Target: myClubIsHome ? game.awayTarget : game.homeTarget,
          };
        }
      }
    }
    return undefined;
  }, [data.matches, data.externalMatches, matchToStartId, selectedClubId]);

  const seasonOfMatch = useMemo(() => {
    if (matchToStart?.isExternal)
      return { id: "external", aantalTafels: matchToStart.aantalTafels };
    return data.seasons.find((s: Season) => s.id === matchToStart?.seasonId);
  }, [data.seasons, matchToStart]);

  const occupiedTables = useMemo(() => {
    if (matchToStart?.isExternal) {
      const extMatchId = matchToStart.extMatchId;
      const externalOccupied: number[] = [];
      if (data.externalMatches) {
        data.externalMatches.forEach((em: any) => {
          if (em.id === extMatchId && em.games) {
            (em.games || []).forEach((g: any) => {
              if (
                g.status === "started" &&
                g.tafelNummer &&
                g.id !== matchToStart.id
              ) {
                externalOccupied.push(g.tafelNummer);
              }
            });
          }
        });
      }
      return externalOccupied;
    }

    const season = seasonOfMatch || activeSeason;
    if (!season) return [];

    return data.matches
      .filter(
        (m: Match) =>
          m.seasonId === season.id &&
          m.status === "started" &&
          m.id !== matchToStart?.id,
      )
      .map((m: Match) => m.tafelNummer)
      .filter(Boolean) as number[];
  }, [
    data.matches,
    data.externalMatches,
    activeSeason,
    seasonOfMatch,
    matchToStart,
  ]);

  useEffect(() => {
    if (isSeasonModalOpen && activeClub) {
      setNewSeasonMemberIds(activeClub.memberIds || []);
    }
  }, [isSeasonModalOpen, activeClub]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Laden...</h2>
      </div>
    );
  }

  if (!authUser) {
    return <Login />;
  }

  // --- Actions ---
  const createClub = (
    name: string,
    logo?: string,
    participatesInExternalMatches?: boolean,
    coAdminEmailsStr?: string
  ) => {
    const coAdminEmails = coAdminEmailsStr ? coAdminEmailsStr.split(',').map(e => e.trim()).filter(e => e) : [];
    if (editingClubId) {
      setData((prev: any) => ({
        ...prev,
        clubs: prev.clubs.map((c: Club) =>
          c.id === editingClubId
            ? { ...c, name, logo, participatesInExternalMatches, coAdminEmails }
            : c,
        ),
      }));
      setEditingClubId(null);
    } else {
      const newClub: Club = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        logo,
        adminId: currentUser.id,
        memberIds: [currentUser.id],
        participatesInExternalMatches,
        coAdminEmails
      };
      setData((prev: any) => ({ ...prev, clubs: [...prev.clubs, newClub] }));
      setSelectedClubId(newClub.id);
    }
    setIsClubModalOpen(false);
    setNewClubName("");
    setNewClubLogo("");
    setNewClubParticipatesExternal(false);
    setNewClubCoAdminEmails("");
  };

  const sendInviteEmail = (club: Club, user: User) => {
    const defaultTemplate = `Beste {naam},\n\nJe bent uitgenodigd om lid te worden van biljartclub {clubNaam}.\n\nKlik op de onderstaande link om de uitnodiging te accepteren en een account aan te maken:\n{inviteLink}\n\nMet vriendelijke groet,\nDe beheerder`;
    const template = club.inviteEmailTemplate || defaultTemplate;
    const inviteLink = `${window.location.origin}/?invite=${club.id}`;
    
    const body = template
      .replace(/{naam}/g, user.name)
      .replace(/{clubNaam}/g, club.name)
      .replace(/{inviteLink}/g, inviteLink);
      
    const subject = `Uitnodiging voor biljartclub ${club.name}`;
    const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const executeAddNewMember = (
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
    };

    setData((prev: any) => ({
      ...prev,
      users: [...prev.users, newUser],
      clubs: prev.clubs.map((c: Club) =>
        c.id === selectedClubId
          ? { ...c, memberIds: [...(c.memberIds || []), newUser.id] }
          : c,
      ),
    }));

    if (sendInvite && activeClub) {
      sendInviteEmail(activeClub, newUser);
    }

    setIsMemberModalOpen(false);
    setNewMemberName("");
    setNewMemberShortName("");
    setNewMemberEmail("");
    setNewMemberAvg(20);
    setNewMemberRole("member");
    setNewMemberParticipatesExternal(false);
    setNewMemberSendInvite(true);
  };

  const addNewMember = (
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
  };

  const updateUserSettings = (
    email: string,
    baseAverage: number,
    avatar: string,
    shortName?: string,
    participatesInExternalMatches?: boolean,
  ) => {
    const updatedUser = {
      ...currentUser,
      email,
      baseAverage,
      avatar,
      shortName,
      participatesInExternalMatches,
    };
    setCurrentUser(updatedUser);
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) =>
        u.id === currentUser.id ? updatedUser : u,
      ),
    }));
    setIsUserSettingsModalOpen(false);
  };

  const updateMember = (
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
  };

  const removeMemberFromClub = (clubId: string, userId: string) => {
    showConfirm(
      "Lid verwijderen?",
      "Weet je zeker dat je dit lid wilt verwijderen uit de club?",
      () => {
        setData((prev: any) => ({
          ...prev,
          clubs: prev.clubs.map((c: Club) =>
            c.id === clubId
              ? {
                  ...c,
                  memberIds: (c.memberIds || []).filter((id) => id !== userId),
                }
              : c,
          ),
        }));
      },
    );
  };

  const executeCreateSeason = (seasonData: Partial<Season>) => {
    const members: SeasonMember[] = ((seasonData.members as any) || []).map(
      (userId: string) => ({
        userId,
        currentAverage:
          data.users.find((u: User) => u.id === userId)?.baseAverage || 20,
        paidContributie: false,
      }),
    );

    const newSeason: Season = {
      id: Math.random().toString(36).substr(2, 9),
      clubId: selectedClubId!,
      name: seasonData.name || "Nieuw Seizoen",
      members,
      matchesPerPair: seasonData.matchesPerPair || 1,
      speeldagen: seasonData.speeldagen || ["maandag"],
      wedstrijdenPerSpeeldag: seasonData.wedstrijdenPerSpeeldag || 2,
      beurtenPerWedstrijd: seasonData.beurtenPerWedstrijd || 30,
      herzieningenPerSeizoen: seasonData.herzieningenPerSeizoen || 2,
      contributie: seasonData.contributie ?? 50,
      inlegPerWedstrijd: seasonData.inlegPerWedstrijd ?? 2,
      aantalTafels: seasonData.aantalTafels ?? 1,
      status: "open",
      isBlocked: false,
      initialBalanceType: seasonData.initialBalanceType,
      initialBalanceAmount: seasonData.initialBalanceAmount,
      carryoverSeasonId: seasonData.carryoverSeasonId,
      scoringSystem: newSeasonScoringSystem,
      transactions: [],
    };
    setData((prev: any) => ({
      ...prev,
      seasons: [...prev.seasons, newSeason],
    }));

    // Auto-planning
    generatePlanning(newSeason);
    setIsSeasonModalOpen(false);
    setNewSeasonName("");
    setNewSeasonSpeeldagen(["maandag"]);
    setNewSeasonMatchesPerPair(1);
    setNewSeasonBeurten(30);
    setNewSeasonMatchesPerDay(2);
    setNewSeasonContributie(50);
    setNewSeasonInleg(2);
    setNewSeasonAantalTafels(2);
    setNewSeasonMemberIds([]);
    setNewSeasonInitialBalanceType("manual");
    setNewSeasonInitialBalanceAmount(0);
    setNewSeasonCarryoverSeasonId("");
    setNewSeasonScoringSystem("default");
  };

  const createSeason = (seasonData: Partial<Season>) => {
    const numMembers = ((seasonData.members as any) || []).length;
    if (numMembers === 0) {
      executeCreateSeason(seasonData);
      return;
    }
    setPaymentConfig({
      isOpen: true,
      amount: numMembers * 100, // 1 euro per member
      description: `Aanmaken nieuw seizoen (${numMembers} leden)`,
      onSuccess: () => {
        executeCreateSeason(seasonData);
      },
    });
  };

  const deleteSeason = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.filter((s: Season) => s.id !== id),
      matches: prev.matches.filter((m: Match) => m.seasonId !== id),
    }));
    if (selectedSeasonId === id) setSelectedSeasonId(null);
    setIsDeleteSeasonModalOpen(false);
    setSeasonToDeleteId(null);
  };

  const deleteExternalMatch = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      externalMatches: prev.externalMatches.filter((m: any) => m.id !== id),
    }));
    if (selectedExternalMatchId === id) setSelectedExternalMatchId(null);
    setIsDeleteExternalMatchModalOpen(false);
    setExternalMatchToDeleteId(null);
  };

  const addTransaction = (
    seasonId: string,
    transaction: Omit<Transaction, "id">,
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
    };

    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === seasonId
          ? { ...s, transactions: [...(s.transactions || []), newTransaction] }
          : s,
      ),
    }));
  };

  const updateTransaction = (
    seasonId: string,
    transactionId: string,
    updatedTransaction: Omit<Transaction, "id">,
  ) => {
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === seasonId
          ? {
              ...s,
              transactions: (s.transactions || []).map((t) =>
                t.id === transactionId
                  ? { ...updatedTransaction, id: transactionId }
                  : t,
              ),
            }
          : s,
      ),
    }));
  };

  const deleteTransaction = (seasonId: string, transactionId: string) => {
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === seasonId
          ? {
              ...s,
              transactions: (s.transactions || []).filter(
                (t) => t.id !== transactionId,
              ),
            }
          : s,
      ),
    }));
  };

  const getSeasonTotalBalance = (season: Season): number => {
    let total = 0;

    // Initial balance
    if (season.initialBalanceType === "manual") {
      total += season.initialBalanceAmount || 0;
    } else if (
      season.initialBalanceType === "carryover" &&
      season.carryoverSeasonId
    ) {
      const prevSeason = data.seasons.find(
        (s: Season) => s.id === season.carryoverSeasonId,
      );
      if (prevSeason) {
        total += getSeasonTotalBalance(prevSeason);
      }
    }

    // Manual transactions
    if (season.transactions) {
      total += season.transactions.reduce((acc, t) => acc + t.amount, 0);
    }

    // Contributions
    const contributionTotal =
      (season.members || []).filter((m) => m.paidContributie).length *
      season.contributie;
    total += contributionTotal;

    // Match fees
    const matchFeesTotal = data.matches
      .filter((m: Match) => m.seasonId === season.id && m.status === "finished")
      .reduce((acc: number, m: Match) => {
        let matchAcc = 0;
        if (m.player1Paid) matchAcc += season.inlegPerWedstrijd;
        if (m.player2Paid) matchAcc += season.inlegPerWedstrijd;
        return acc + matchAcc;
      }, 0);
    total += matchFeesTotal;

    // External Match fees
    const externalMatchFeesTotal =
      data.externalMatches
        ?.filter((em: any) => em.seasonId === season.id)
        .reduce((acc: number, em: any) => {
          let emTotal = 0;
          (em.games || []).forEach((g: any) => {
            if (g.homePlayerPaid) emTotal += em.homePlayerFee || 0;
            if (g.awayPlayerPaid) emTotal += em.awayPlayerFee || 0;
          });
          return acc + emTotal;
        }, 0) || 0;
    total += externalMatchFeesTotal;

    return total;
  };

  const toggleBlockSeason = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === id ? { ...s, isBlocked: !s.isBlocked } : s,
      ),
    }));
  };

  const toggleBlockExternalMatch = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      externalMatches: prev.externalMatches.map((m: any) =>
        m.id === id ? { ...m, isBlocked: !m.isBlocked } : m,
      ),
    }));
  };

  const completeMatchDay = (seasonId: string, isoDateString: string) => {
    const season = data.seasons.find((s: Season) => s.id === seasonId);
    if (!season) return;

    // 1. Find the next speeldag
    const sortedSpeeldagen = [...(season.speeldagen || [])].sort();
    const nextSpeeldagStr = sortedSpeeldagen.find((d: string) => d > isoDateString);
    
    setData((prev: any) => {
      const sIndex = prev.seasons.findIndex((s: Season) => s.id === seasonId);
      if (sIndex === -1) return prev;
      
      const prevSeason = prev.seasons[sIndex];
      const currentAttendance = { ...(prevSeason.attendance || {}) };
      const allMembers = (prevSeason.members || []).map((m: any) => m.userId);
      
      const dateAttendance = currentAttendance[isoDateString] || allMembers;
      const absentUsers = allMembers.filter((id: string) => !dateAttendance.includes(id));
      
      currentAttendance[isoDateString] = allMembers;
      
      if (nextSpeeldagStr && absentUsers.length > 0) {
        const nextDateAttendance = currentAttendance[nextSpeeldagStr] || [...allMembers];
        const updatedNextAttendance = nextDateAttendance.filter((id: string) => !absentUsers.includes(id));
        currentAttendance[nextSpeeldagStr] = updatedNextAttendance;
      }
      
      const updatedSeasons = [...prev.seasons];
      updatedSeasons[sIndex] = { ...prevSeason, attendance: currentAttendance };
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });

    setTimeout(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      handleRescheduleUnplayedMatches(seasonId, undefined, tomorrow);
    }, 100);
  };

  const toggleAttendance = (seasonId: string, date: string, userId: string) => {
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) => {
        if (s.id !== seasonId) return s;
        const currentAttendance = s.attendance || {};
        // If no attendance recorded for this date yet, default to everyone present
        const dateAttendance =
          currentAttendance[date] || (s.members || []).map((m) => m.userId);
        const newDateAttendance = dateAttendance.includes(userId)
          ? dateAttendance.filter((id) => id !== userId)
          : [...dateAttendance, userId];
        return {
          ...s,
          attendance: {
            ...currentAttendance,
            [date]: newDateAttendance,
          },
        };
      }),
    }));
  };

  const cancelSpeeldag = (
    seasonId: string,
    dateStr: string,
    reason: string,
  ) => {
    setData((prev: any) => {
      const season = prev.seasons.find((s: Season) => s.id === seasonId);
      if (!season) return prev;

      const newCancelledDays = {
        ...(season.cancelledDays || {}),
        [dateStr]: reason,
      };
      const updatedSeason = { ...season, cancelledDays: newCancelledDays };

      // Get all planned matches for this season
      const plannedMatches = prev.matches.filter(
        (m: Match) => m.seasonId === seasonId && m.status === "planned",
      );
      const finishedMatches = prev.matches.filter(
        (m: Match) => m.seasonId === seasonId && m.status !== "planned",
      );
      const otherMatches = prev.matches.filter(
        (m: Match) => m.seasonId !== seasonId,
      );

      // Re-plan the planned matches
      const newPlannedMatches = generatePlanning(
        updatedSeason,
        plannedMatches,
        new Date(),
      );

      return {
        ...prev,
        seasons: prev.seasons.map((s: Season) =>
          s.id === seasonId ? updatedSeason : s,
        ),
        matches: [...otherMatches, ...finishedMatches, ...newPlannedMatches],
      };
    });
    setIsCancelDayModalOpen(false);
    setCancelDayReason("");
    setCancelDayDate(null);
  };

  const generatePlanning = (
    season: Season,
    existingMatches?: Match[],
    startFrom?: Date,
  ): Match[] => {
    const memberIds = (season.members || []).map((m) => m.userId);
    let pairs: [string, string][] = [];

    if (existingMatches) {
      pairs = existingMatches.map((m) => [m.player1Id, m.player2Id]);
    } else {
      for (let i = 0; i < memberIds.length; i++) {
        for (let j = i + 1; j < memberIds.length; j++) {
          for (let k = 0; k < (season.matchesPerPair || 1); k++) {
            if (k % 2 === 1) {
              pairs.push([memberIds[j], memberIds[i]]);
            } else {
              pairs.push([memberIds[i], memberIds[j]]);
            }
          }
        }
      }
      // Shuffle all pairs initially
      pairs = [...pairs].sort(() => Math.random() - 0.5);
    }

    const dayMap: Record<string, number> = {
      zondag: 0,
      maandag: 1,
      dinsdag: 2,
      woensdag: 3,
      donderdag: 4,
      vrijdag: 5,
      zaterdag: 6,
    };

    let speeldagen = season.speeldagen;
    if (!speeldagen || speeldagen.length === 0) speeldagen = ["maandag"];

    const targetDays = speeldagen
      .map((d) => dayMap[d?.toLowerCase?.()] ?? 1)
      .sort((a, b) => {
        const valA = a === 0 ? 7 : a;
        const valB = b === 0 ? 7 : b;
        return valA - valB;
      });

    if (targetDays.length === 0) targetDays.push(1);

    let parsedMatchesPerSpeeldag = parseInt(
      season.wedstrijdenPerSpeeldag as any,
      10,
    );
    if (isNaN(parsedMatchesPerSpeeldag)) parsedMatchesPerSpeeldag = 2;
    const matchesPerSpeeldag = Math.max(1, parsedMatchesPerSpeeldag);
    const newMatches: Match[] = [];
    let weekOffset = 0;
    let remainingPairs = [...pairs];
    const startDate = startFrom || new Date();

    while (remainingPairs.length > 0) {
      for (const targetDay of targetDays) {
        if (remainingPairs.length === 0) break;

        // Start of current week (Monday)
        let date = startOfWeek(addDays(startDate, weekOffset * 7), {
          weekStartsOn: 1,
        });
        const dayDiff = targetDay === 0 ? 6 : targetDay - 1;
        date = addDays(date, dayDiff);

        // Skip if date is in the past
        if (isBefore(date, startOfDay(startDate))) {
          continue;
        }

        const dateStr = date.toISOString();

        // Skip if date is cancelled
        if (season.cancelledDays?.[dateStr]) {
          continue;
        }

        // Pick matches for this day
        const playersPlayedTonight = new Set<string>();
        for (let m = 0; m < matchesPerSpeeldag; m++) {
          if (remainingPairs.length === 0) break;

          // Find a pair where neither has played tonight
          let pairIdx = remainingPairs.findIndex(
            (p) =>
              !playersPlayedTonight.has(p[0]) &&
              !playersPlayedTonight.has(p[1]),
          );

          if (pairIdx === -1) {
            pairIdx = remainingPairs.findIndex(
              (p) =>
                !playersPlayedTonight.has(p[0]) ||
                !playersPlayedTonight.has(p[1]),
            );
          }

          if (pairIdx === -1) pairIdx = 0;

          const pair = remainingPairs.splice(pairIdx, 1)[0];
          playersPlayedTonight.add(pair[0]);
          playersPlayedTonight.add(pair[1]);

          const p1SeasonInfo = (season.members || []).find(
            (sm) => sm.userId === pair[0],
          );
          const p2SeasonInfo = (season.members || []).find(
            (sm) => sm.userId === pair[1],
          );

          newMatches.push({
            id: Math.random().toString(36).substr(2, 9),
            seasonId: season.id,
            clubId: season.clubId,
            date: dateStr,
            player1Id: pair[0],
            player2Id: pair[1],
            status: "planned",
            player1AvgBefore:
              p1SeasonInfo?.manualAverageOverride ||
              p1SeasonInfo?.currentAverage ||
              20,
            player2AvgBefore:
              p2SeasonInfo?.manualAverageOverride ||
              p2SeasonInfo?.currentAverage ||
              20,
            turns: [],
            player1Paid: false,
            player2Paid: false,
          });
        }
      }
      weekOffset++;
    }

    if (!existingMatches) {
      setData((prev: any) => ({
        ...prev,
        matches: [...prev.matches, ...newMatches],
      }));
    }

    return newMatches;
  };

  const handleRescheduleUnplayedMatches = (seasonId: string, overrideSpeeldagen?: string[], startFromDate?: Date) => {
    const season = data.seasons.find((s: Season) => s.id === seasonId);
    if (!season) return;

    const allMatches = data.matches.filter(
      (m: Match) => m.seasonId === seasonId,
    );
    // Keep finished/started matches
    const keepMatches = allMatches.filter(
      (m) =>
        m.status === "finished" ||
        m.status === "started" ||
        m.status === "busy",
    );
    // Remove planned/cancelled matches
    const matchesToReschedule = allMatches.filter(
      (m) => m.status === "planned" || m.status === "cancelled",
    );

    if (matchesToReschedule.length === 0) return;

    // Count how many matches per pair need to be scheduled
    const pairCounts: Record<string, number> = {};
    matchesToReschedule.forEach((m) => {
      const pairKey = [m.player1Id, m.player2Id].sort().join("-");
      pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
    });

    // Create a pool of pairs to schedule
    const remainingPairs: [string, string][] = [];
    Object.entries(pairCounts).forEach(([key, count]) => {
      const [p1, p2] = key.split("-");
      for (let i = 0; i < count; i++) {
        // Alternate home/away based on index to balance it out if possible, though original generation did it too.
        if (i % 2 === 0) remainingPairs.push([p1, p2]);
        else remainingPairs.push([p2, p1]);
      }
    });

    const dayMap: Record<string, number> = {
      zondag: 0,
      maandag: 1,
      dinsdag: 2,
      woensdag: 3,
      donderdag: 4,
      vrijdag: 5,
      zaterdag: 6,
    };

    let speeldagen = overrideSpeeldagen || season.speeldagen;
    if (!speeldagen || speeldagen.length === 0) speeldagen = ["maandag"];

    const targetDays = speeldagen
      .map((d) => dayMap[d?.toLowerCase?.()] ?? 1)
      .sort((a, b) => {
        const valA = a === 0 ? 7 : a;
        const valB = b === 0 ? 7 : b;
        return valA - valB;
      });

    if (targetDays.length === 0) targetDays.push(1); // Failsafe

    let parsedMatchesPerSpeeldag = parseInt(
      season.wedstrijdenPerSpeeldag as any,
      10,
    );
    if (isNaN(parsedMatchesPerSpeeldag)) parsedMatchesPerSpeeldag = 2;
    const matchesPerSpeeldag = Math.max(1, parsedMatchesPerSpeeldag);
    const newMatches: Match[] = [];
    let weekOffset = 0;

    const startDate = startFromDate || new Date(); // Start from today or provided date
    startDate.setHours(0, 0, 0, 0);

    // Track last played date for each pair to space them out
    const lastPlayedPairDate: Record<string, number> = {};
    keepMatches.forEach((m) => {
      const pairKey = [m.player1Id, m.player2Id].sort().join("-");
      const mDate = new Date(m.date).getTime();
      if (!lastPlayedPairDate[pairKey] || mDate > lastPlayedPairDate[pairKey]) {
        lastPlayedPairDate[pairKey] = mDate;
      }
    });

    while (remainingPairs.length > 0) {
      for (const targetDay of targetDays) {
        if (remainingPairs.length === 0) break;

        let date = startOfWeek(addDays(startDate, weekOffset * 7), {
          weekStartsOn: 1,
        });
        const dayDiff = targetDay === 0 ? 6 : targetDay - 1;
        date = addDays(date, dayDiff);

        if (isBefore(date, startDate)) {
          continue;
        }

        const dateStr = date.toISOString();
        const dateTime = date.getTime();

        if (season.cancelledDays?.[dateStr]) {
          continue;
        }

        const playersPlayedTonight = new Set<string>();

        for (let m = 0; m < matchesPerSpeeldag; m++) {
          if (remainingPairs.length === 0) break;

          // Score each pair
          // We want:
          // 1. Players not playing tonight (highest priority)
          // 2. Maximize time since they last played each other
          let bestIdx = -1;
          let bestScore = -Infinity;

          for (let i = 0; i < remainingPairs.length; i++) {
            const pair = remainingPairs[i];
            const p1 = pair[0];
            const p2 = pair[1];

            const playingTonight =
              playersPlayedTonight.has(p1) || playersPlayedTonight.has(p2);
            let score = 0;

            // Heavy penalty for playing tonight to avoid duplicates
            if (playingTonight) {
              score -= 10000;
            }

            const pairKey = [p1, p2].sort().join("-");
            const lastPlayed = lastPlayedPairDate[pairKey];

            if (lastPlayed) {
              const daysSinceLastMatch =
                (dateTime - lastPlayed) / (1000 * 60 * 60 * 24);
              // We want to maximize days since last match, so score increases with days.
              // Cap at e.g. 30 days to avoid extreme values
              score += Math.min(daysSinceLastMatch, 30);
            } else {
              score += 50; // Never played before, give it a good bonus
            }

            if (score > bestScore) {
              bestScore = score;
              bestIdx = i;
            }
          }

          if (bestIdx === -1) bestIdx = 0;

          const pair = remainingPairs.splice(bestIdx, 1)[0];
          playersPlayedTonight.add(pair[0]);
          playersPlayedTonight.add(pair[1]);

          const pairKey = [pair[0], pair[1]].sort().join("-");
          lastPlayedPairDate[pairKey] = dateTime;

          const p1SeasonInfo = (season.members || []).find(
            (sm) => sm.userId === pair[0],
          );
          const p2SeasonInfo = (season.members || []).find(
            (sm) => sm.userId === pair[1],
          );

          newMatches.push({
            id: Math.random().toString(36).substr(2, 9),
            seasonId: season.id,
            clubId: season.clubId,
            date: dateStr,
            player1Id: pair[0],
            player2Id: pair[1],
            status: "planned",
            player1AvgBefore:
              p1SeasonInfo?.manualAverageOverride ||
              p1SeasonInfo?.currentAverage ||
              20,
            player2AvgBefore:
              p2SeasonInfo?.manualAverageOverride ||
              p2SeasonInfo?.currentAverage ||
              20,
            turns: [],
            player1Paid: false,
            player2Paid: false,
          });
        }
      }
      weekOffset++;
    }

    setData((prev: any) => ({
      ...prev,
      matches: [
        ...(prev.matches || []).filter(
          (m: Match) =>
            !(
              m.seasonId === seasonId &&
              (m.status === "planned" || m.status === "cancelled")
            ),
        ),
        ...newMatches,
      ],
    }));
  };

  const togglePayment = (seasonId: string, userId: string) => {
    if (currentUser.role !== "admin" && currentUser.role !== "planner") return;
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === seasonId
          ? {
              ...s,
              members: (s.members || []).map((m) =>
                m.userId === userId
                  ? { ...m, paidContributie: !m.paidContributie }
                  : m,
              ),
            }
          : s,
      ),
    }));
  };

  const updateSeasonSpeeldagen = (seasonId: string, newSpeeldagen: string[], requireReschedule: boolean) => {
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === seasonId ? { ...s, speeldagen: newSpeeldagen } : s
      ),
    }));
    
    if (requireReschedule) {
      handleRescheduleUnplayedMatches(seasonId, newSpeeldagen);
    }
  };

  const toggleMatchPayment = (matchId: string, playerNum: 1 | 2) => {
    if (currentUser.role !== "admin" && currentUser.role !== "planner") return;
    setData((prev: any) => ({
      ...prev,
      matches: prev.matches.map((m: Match) =>
        m.id === matchId
          ? {
              ...m,
              [playerNum === 1 ? "player1Paid" : "player2Paid"]:
                !m[playerNum === 1 ? "player1Paid" : "player2Paid"],
            }
          : m,
      ),
    }));
  };

  const toggleExternalMatchPayment = (
    matchId: string,
    gameId: string,
    isHomePlayer: boolean,
  ) => {
    if (currentUser.role !== "admin" && currentUser.role !== "planner") return;
    setData((prev: any) => ({
      ...prev,
      externalMatches: prev.externalMatches?.map((em: any) =>
        em.id === matchId
          ? {
              ...em,
              games: (em.games || []).map((g: any) =>
                g.id === gameId
                  ? {
                      ...g,
                      [isHomePlayer ? "homePlayerPaid" : "awayPlayerPaid"]:
                        !g[isHomePlayer ? "homePlayerPaid" : "awayPlayerPaid"],
                    }
                  : g,
              ),
            }
          : em,
      ),
    }));
  };

  const updateManualAverage = (
    seasonId: string,
    userId: string,
    newAvg: number | undefined,
  ) => {
    if (currentUser.role !== "admin" && currentUser.role !== "planner") return;
    setData((prev: any) => ({
      ...prev,
      seasons: prev.seasons.map((s: Season) =>
        s.id === seasonId
          ? {
              ...s,
              members: (s.members || []).map((m) =>
                m.userId === userId
                  ? { ...m, manualAverageOverride: newAvg }
                  : m,
              ),
            }
          : s,
      ),
    }));
  };

  const rescheduleMatches = (seasonId: string, fromDateStr: string) => {
    const season = data.seasons.find((s: Season) => s.id === seasonId);
    if (!season) return;

    const fromDate = startOfDay(new Date(fromDateStr));

    // 1. Get all planned matches from this date onwards
    const matchesToReschedule = data.matches
      .filter(
        (m: Match) =>
          m.seasonId === seasonId &&
          m.status === "planned" &&
          !isBefore(new Date(m.date), fromDate),
      )
      .sort((a: Match, b: Match) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.id.localeCompare(b.id);
      });

    if (matchesToReschedule.length === 0) return;

    // 2. Prepare scheduling parameters
    const dayMap: Record<string, number> = {
      zondag: 0,
      maandag: 1,
      dinsdag: 2,
      woensdag: 3,
      donderdag: 4,
      vrijdag: 5,
      zaterdag: 6,
    };
    const targetDays = (season.speeldagen || ["maandag"])
      .map((d) => (d ? dayMap[d.toLowerCase()] : dayMap["maandag"]))
      .sort((a, b) => {
        const valA = a === 0 ? 7 : a;
        const valB = b === 0 ? 7 : b;
        return valA - valB;
      });
    const limit = season.wedstrijdenPerSpeeldag || 2;

    // 3. Calculate new dates
    let currentDate = addDays(fromDate, 1);
    let matchIndex = 0;
    const updatedMatchesMap: Record<string, string> = {};

    while (matchIndex < matchesToReschedule.length) {
      // Find next valid speeldag
      while (
        !targetDays.includes(currentDate.getDay()) ||
        season.cancelledDays?.[currentDate.toISOString()]
      ) {
        currentDate = addDays(currentDate, 1);
      }

      const dateStr = currentDate.toISOString();
      // Assign up to 'limit' matches to this day
      for (
        let i = 0;
        i < limit && matchIndex < matchesToReschedule.length;
        i++
      ) {
        updatedMatchesMap[matchesToReschedule[matchIndex].id] = dateStr;
        matchIndex++;
      }

      // Move to next day for the next batch
      currentDate = addDays(currentDate, 1);
    }

    // 4. Update data
    setData((prev: any) => ({
      ...prev,
      matches: prev.matches.map((m: Match) =>
        updatedMatchesMap[m.id] ? { ...m, date: updatedMatchesMap[m.id] } : m,
      ),
    }));
  };

  const handleNextStepHomeMatch = () => {
    if (!activeClub || !newHomeMatchAwayClubId || !newHomeMatchDate) return;

    // Find participating members of home club, sort by baseAverage desc
    const homeMembers = (activeClub.memberIds || [])
      .map((userId) => data.users.find((u: User) => u.id === userId))
      .filter(
        (user): user is User => !!user && !!user.participatesInExternalMatches,
      )
      .sort((a, b) => b.baseAverage - a.baseAverage);

    // Find participating members of away club, sort by baseAverage desc
    const awayClub = data.clubs.find(
      (c: Club) => c.id === newHomeMatchAwayClubId,
    );
    if (!awayClub) return;

    const awayMembers = (awayClub.memberIds || [])
      .map((userId) => data.users.find((u: User) => u.id === userId))
      .filter(
        (user): user is User => !!user && !!user.participatesInExternalMatches,
      )
      .sort((a, b) => b.baseAverage - a.baseAverage);

    if (homeMembers.length === 0 || awayMembers.length === 0) {
      setHomeMatchPairings([]);
      setHomeMatchStep(2);
      return;
    }

    const matchCount = Math.max(homeMembers.length, awayMembers.length);
    const initialPairings = [];
    for (let i = 0; i < matchCount; i++) {
      const homePlayer = homeMembers[i % homeMembers.length];
      const awayPlayer = awayMembers[i % awayMembers.length];
      initialPairings.push({
        id: Math.random().toString(36).substr(2, 9),
        homePlayerId: homePlayer.id,
        awayPlayerId: awayPlayer.id,
      });
    }

    setHomeMatchPairings(initialPairings);
    setHomeMatchStep(2);
  };

  const executeCreateHomeMatch = () => {
    if (
      !activeClub ||
      !newHomeMatchAwayClubId ||
      !newHomeMatchDate ||
      homeMatchPairings.length === 0
    )
      return;

    const games = homeMatchPairings.map((pairing) => ({
      id: pairing.id,
      homePlayerId: pairing.homePlayerId,
      awayPlayerId: pairing.awayPlayerId,
      homeScore: 0,
      awayScore: 0,
      homePoints: 0,
      awayPoints: 0,
      status: "planned" as const,
      homePlayerPaid: false,
      awayPlayerPaid: false,
    }));

    const newExternalMatch = {
      id: Math.random().toString(36).substr(2, 9),
      homeClubId: activeClub.id,
      awayClubId: newHomeMatchAwayClubId,
      date: newHomeMatchDate,
      games,
      status: "planned",
      scoringSystem: newHomeMatchScoringSystem,
      aantalTafels: newHomeMatchAantalTafels,
      beurtenPerWedstrijd: newHomeMatchBeurten,
      seasonId: newHomeMatchSeasonId || undefined,
      homePlayerFee: newHomeMatchSeasonId ? newHomeMatchHomeFee : 0,
      awayPlayerFee: newHomeMatchSeasonId ? newHomeMatchAwayFee : 0,
    };

    setData((prev: any) => ({
      ...prev,
      externalMatches: [...(prev.externalMatches || []), newExternalMatch],
    }));

    setIsHomeMatchModalOpen(false);
    setNewHomeMatchAwayClubId("");
    setNewHomeMatchDate(format(new Date(), "yyyy-MM-dd"));
    setNewHomeMatchScoringSystem("default");
    setNewHomeMatchBeurten(30);
    setHomeMatchStep(1);
    setHomeMatchPairings([]);
  };

  const createHomeMatch = () => {
    const numMembers = homeMatchPairings.length;
    if (numMembers === 0) {
      executeCreateHomeMatch();
      return;
    }
    setPaymentConfig({
      isOpen: true,
      amount: numMembers * 100, // 1 euro per pair
      description: `Uit/thuis wedstrijd aanmaken (${numMembers} spelers)`,
      onSuccess: () => {
        executeCreateHomeMatch();
      },
    });
  };

  const startMatch = (
    matchId: string,
    arbiterId: string,
    writerId: string,
    tafelNummer: number,
  ) => {
    setLastArbiterId(arbiterId);
    setLastWriterId(writerId);
    localStorage.setItem("lastArbiterId", arbiterId);
    localStorage.setItem("lastWriterId", writerId);
    setData((prev: any) => {
      let isExternal = false;
      const nextExt = prev.externalMatches?.map((em: any) => {
        if (em.games?.some((g: any) => g.id === matchId)) {
          isExternal = true;
          return {
            ...em,
            status: "started",
            games: (em.games || []).map((g: any) =>
              g.id === matchId
                ? {
                    ...g,
                    status: "started",
                    arbiterId,
                    writerId,
                    tafelNummer,
                    date: new Date().toISOString(),
                    turns: [{ player1: 0, player2: 0 }],
                  }
                : g,
            ),
          };
        }
        return em;
      });

      if (isExternal) {
        return { ...prev, externalMatches: nextExt };
      }

      return {
        ...prev,
        matches: prev.matches.map((m: Match) =>
          m.id === matchId
            ? {
                ...m,
                status: "started",
                arbiterId,
                writerId,
                tafelNummer,
                date: new Date().toISOString(),
                turns: [{ player1: 0, player2: 0 }],
              }
            : m,
        ),
      };
    });
    setActiveTurnIndex(0);
    setActiveScoringPlayer(1);
    setCurrentTurnP1(0);
    setCurrentTurnP2(0);
    setLiveMatchId(matchId);
  };

  const saveTurn = (matchId: string, index: number, p1: number, p2: number) => {
    setData((prev: any) => {
      let isExternal = false;
      const nextExt = prev.externalMatches?.map((em: any) => {
        if (em.games?.some((g: any) => g.id === matchId)) {
          isExternal = true;
          return {
            ...em,
            games: (em.games || []).map((g: any) => {
              if (g.id === matchId) {
                const newTurns = [...(g.turns || [])];
                if (index < newTurns.length) {
                  newTurns[index] = { player1: p1, player2: p2 };
                } else {
                  newTurns.push({ player1: p1, player2: p2 });
                }
                return { ...g, turns: newTurns };
              }
              return g;
            }),
          };
        }
        return em;
      });

      if (isExternal) {
        return { ...prev, externalMatches: nextExt };
      }

      return {
        ...prev,
        matches: prev.matches.map((m: Match) => {
          if (m.id === matchId) {
            const newTurns = [...m.turns];
            if (index < newTurns.length) {
              newTurns[index] = { player1: p1, player2: p2 };
            } else {
              newTurns.push({ player1: p1, player2: p2 });
            }
            return { ...m, turns: newTurns };
          }
          return m;
        }),
      };
    });
  };

  const openFinishMatchModal = () => {
    setP1Paid(true);
    setP2Paid(true);
    setIsFinishMatchModalOpen(true);
  };

  const finishMatch = (matchId: string, p1Paid: boolean, p2Paid: boolean) => {
    setData((prev: any) => {
      let isExternal = false;
      const nextExt = prev.externalMatches?.map((em: any) => {
        if (em.games?.some((g: any) => g.id === matchId)) {
          isExternal = true;
          const myClubIsHome = em.homeClubId === selectedClubId;
          return {
            ...em,
            games: (em.games || []).map((g: any) => {
              if (g.id === matchId) {
                const p1Total =
                  g.turns?.reduce(
                    (acc: number, t: any) => acc + (t.player1 || 0),
                    0,
                  ) || 0;
                const p2Total =
                  g.turns?.reduce(
                    (acc: number, t: any) => acc + (t.player2 || 0),
                    0,
                  ) || 0;
                return {
                  ...g,
                  status: "finished",
                  homeScore: myClubIsHome ? p1Total : p2Total,
                  awayScore: myClubIsHome ? p2Total : p1Total,
                  homePlayerPaid: myClubIsHome ? p1Paid : p2Paid,
                  awayPlayerPaid: myClubIsHome ? p2Paid : p1Paid,
                };
              }
              return g;
            }),
          };
        }
        return em;
      });

      if (isExternal) {
        return { ...prev, externalMatches: nextExt };
      }

      return {
        ...prev,
        matches: prev.matches.map((m: Match) =>
          m.id === matchId
            ? {
                ...m,
                status: "finished",
                player1Paid: p1Paid,
                player2Paid: p2Paid,
              }
            : m,
        ),
      };
    });
    setLiveMatchId(null);
  };

  const cancelMatch = (matchId: string, p1Paid: boolean, p2Paid: boolean) => {
    setData((prev: any) => {
      let isExternal = false;
      const nextExt = prev.externalMatches?.map((em: any) => {
        if (em.games?.some((g: any) => g.id === matchId)) {
          isExternal = true;
          return {
            ...em,
            games: (em.games || []).map((g: any) =>
              g.id === matchId ? { ...g, status: "planned", turns: [] } : g,
            ),
          }; // for external match, cancelling usually means reverting to planned or similar.
        }
        return em;
      });

      if (isExternal) return { ...prev, externalMatches: nextExt };

      return {
        ...prev,
        matches: prev.matches.map((m: Match) =>
          m.id === matchId
            ? {
                ...m,
                status: "cancelled",
                player1Paid: p1Paid,
                player2Paid: p2Paid,
              }
            : m,
        ),
      };
    });
    setLiveMatchId(null);
  };

  const restartMatch = (matchId: string) => {
    setData((prev: any) => {
      let isExternal = false;
      const nextExt = prev.externalMatches?.map((em: any) => {
        if (em.games?.some((g: any) => g.id === matchId)) {
          isExternal = true;
          return {
            ...em,
            games: (em.games || []).map((g: any) =>
              g.id === matchId ? { ...g, status: "planned", turns: [] } : g,
            ),
          };
        }
        return em;
      });

      if (isExternal) return { ...prev, externalMatches: nextExt };

      return {
        ...prev,
        matches: prev.matches.map((m: Match) =>
          m.id === matchId
            ? {
                ...m,
                status: "planned",
                player1Paid: false,
                player2Paid: false,
              }
            : m,
        ),
      };
    });
  };

  const moveMatchToDate = (matchId: string, targetDateStr: string) => {
    setData((prev: any) => {
      return {
        ...prev,
        matches: prev.matches.map((m: Match) => {
          if (m.id === matchId) {
            return { ...m, date: targetDateStr };
          }
          return m;
        }),
      };
    });
  };

  const moveMatchToToday = (matchId: string) => {
    setData((prev: any) => {
      const todayStr = format(new Date(), "yyyy-MM-dd") + "T12:00:00.000Z"; // Approximate time
      return {
        ...prev,
        matches: prev.matches.map((m: Match) => {
          if (m.id === matchId) {
            return { ...m, date: todayStr };
          }
          return m;
        }),
      };
    });
  };

  // --- Views ---

  let castStandingsNodeToRender: React.ReactNode = null;
  let castExtMatchNodeToRender: React.ReactNode = null;
  let castNextMatchDayNodeToRender: React.ReactNode = null;

  if (
    (isCastMode || exportCastData?.type === "standings") &&
    actualCastViewType === "standings" &&
    actualCastSeasonId
  ) {
    const season = data.seasons.find(
      (s: Season) => s.id === actualCastSeasonId,
    );
    if (season) {
      const club = data.clubs.find((c: Club) => c.id === season.clubId);

      const memberStats = (season.members || []).map((memberInfo) => {
        const memberId = memberInfo.userId;
        const member = data.users.find((u: User) => u.id === memberId);
        const memberMatches = data.matches.filter(
          (m: Match) =>
            m.seasonId === season.id &&
            m.status === "finished" &&
            (m.player1Id === memberId || m.player2Id === memberId),
        );

        let totalCar = 0;
        let highest = 0;
        let totalPoints = 0;

        memberMatches.forEach((m: Match) => {
          const isP1 = m.player1Id === memberId;
          const made = (m.turns || []).reduce(
            (acc: number, t: any) => acc + (isP1 ? t.player1 : t.player2),
            0,
          );
          const target = isP1 ? m.player1AvgBefore : m.player2AvgBefore;
          const opponentMade = isP1
            ? (m.turns || []).reduce(
                (acc: number, t: any) => acc + t.player2,
                0,
              )
            : (m.turns || []).reduce(
                (acc: number, t: any) => acc + t.player1,
                0,
              );
          const opponentTarget = isP1 ? m.player2AvgBefore : m.player1AvgBefore;

          totalCar += made;
          totalPoints += calculatePoints(
            made,
            target,
            opponentMade,
            opponentTarget,
            season.scoringSystem,
          );

          (m.turns || []).forEach((t: any) => {
            const val = isP1 ? t.player1 : t.player2;
            if (val > highest) highest = val;
          });
        });

        const matchAvg =
          memberMatches.length > 0
            ? totalCar / memberMatches.length
            : memberInfo.manualAverageOverride || memberInfo.currentAverage;
        return {
          ...memberInfo,
          name: member?.shortName || member?.name || "",
          matchesCount: memberMatches.length,
          totalCar,
          highest,
          currentAvg: matchAvg,
          totalPoints,
        };
      });

      const sortedStats = [...memberStats].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints)
          return b.totalPoints - a.totalPoints;
        if (b.totalCar !== a.totalCar) return b.totalCar - a.totalCar;
        if (b.highest !== a.highest) return b.highest - a.highest;
        return a.matchesCount - b.matchesCount;
      });

      const maxStats = {
        caramboles: Math.max(...memberStats.map((s) => s.totalCar), 1),
        matches: Math.max(...memberStats.map((s) => s.matchesCount), 1),
        highest: Math.max(...memberStats.map((s) => s.highest), 1),
        points: Math.max(...memberStats.map((s) => s.totalPoints), 1),
        average: Math.max(...memberStats.map((s) => s.currentAvg), 1),
      };

      const nodeToRender = (
        <div
          id={exportCastData ? "cast-standings-export-node" : undefined}
          className={
            exportCastData
              ? "relative w-[1920px] h-[1080px] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex overflow-hidden font-sans p-8 flex-col"
              : "fixed inset-0 z-[100] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex overflow-hidden selection:bg-yellow-500/30 font-sans p-8 flex-col overflow-y-auto w-full"
          }
        >
          <button
            onClick={() => {
              setIsCastMode(false);
              if (
                new URLSearchParams(window.location.search).get("cast") ===
                "true"
              ) {
                window.close();
              }
            }}
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all backdrop-blur-md z-50 border border-white/10"
          >
            <X size={24} />
          </button>

          <div className="flex items-center justify-center gap-4 pt-6 pb-6 animate-in fade-in slide-in-from-top duration-700 w-full relative z-10 shrink-0">
            <h2 className="text-white text-2xl md:text-3xl font-black capitalize tracking-widest">
              {club?.name}
            </h2>
            <span className="text-white/30 text-2xl font-light">|</span>
            <div className="flex items-center gap-2 bg-black/20 px-5 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
              <Trophy size={18} className="text-[#f1c40f]" />
              <span className="text-white/80 font-bold tracking-widest text-base md:text-lg">
                {season.name}
              </span>
            </div>
          </div>

          <div className="w-full max-w-[1400px] mx-auto bg-black/30 rounded-3xl border border-white/10 backdrop-blur-lg overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 shadow-2xl relative z-10 shrink-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#163a16]/80 text-[#f1c40f] text-sm font-black uppercase tracking-widest border-b border-white/10">
                    <th className="py-4 pl-6 text-center w-16 border-r border-white/10">
                      #
                    </th>
                    <th className="py-4 px-6 text-left border-r border-white/10">
                      Naam
                    </th>
                    <th className="py-4 px-4 text-center border-r border-white/10">
                      Caramboles
                    </th>
                    <th className="py-4 px-4 text-center border-r border-white/10">
                      Wedstrijden
                    </th>
                    <th className="py-4 px-4 text-center border-r border-white/10">
                      Hoogste Serie
                    </th>
                    <th className="py-4 px-4 text-center border-r border-white/10">
                      Punten
                    </th>
                    <th className="py-4 px-6 text-center">Gemiddelde</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {sortedStats.map((memberInfo, index) => {
                    const StatCell = ({
                      value,
                      max,
                      format = (v: any) => formatNumber(v),
                    }: {
                      value: number;
                      max: number;
                      format?: (v: any) => any;
                    }) => (
                      <td className="relative py-4 px-4 text-center text-white/90 font-black text-xl border-r border-white/10 overflow-hidden">
                        <div
                          className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                          style={{
                            width: `calc(${(value / max) * 100}% - 8px)`,
                          }}
                        />
                        <span className="relative z-10">{format(value)}</span>
                      </td>
                    );
                    return (
                      <tr
                        key={memberInfo.userId}
                        className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 relative"
                      >
                        <td className="py-4 pl-6 text-center text-[#f1c40f] font-black text-xl border-r border-white/10">
                          {index === 0 ? (
                            <Trophy
                              size={20}
                              className="mx-auto text-[#f1c40f]"
                            />
                          ) : index === 1 ? (
                            <Trophy
                              size={20}
                              className="mx-auto text-slate-300"
                            />
                          ) : index === 2 ? (
                            <Trophy
                              size={20}
                              className="mx-auto text-amber-600"
                            />
                          ) : (
                            index + 1
                          )}
                        </td>
                        <td className="py-4 px-6 font-black text-white text-xl capitalize tracking-widest border-r border-white/10">
                          {memberInfo.name}
                        </td>
                        <StatCell
                          value={memberInfo.totalCar}
                          max={maxStats.caramboles}
                        />
                        <StatCell
                          value={memberInfo.matchesCount}
                          max={maxStats.matches}
                        />
                        <StatCell
                          value={memberInfo.highest}
                          max={maxStats.highest}
                        />
                        <td className="relative py-4 px-4 text-center text-[#f1c40f] font-black text-2xl border-r border-white/10 overflow-hidden">
                          <div
                            className="absolute inset-y-1 my-1 left-1 rounded-md bg-[#f1c40f]/15 backdrop-blur-sm transition-all duration-500"
                            style={{
                              width: `calc(${(memberInfo.totalPoints / maxStats.points) * 100}% - 8px)`,
                            }}
                          />
                          <span className="relative z-10">
                            {formatNumber(memberInfo.totalPoints)}
                          </span>
                        </td>
                        <StatCell
                          value={memberInfo.currentAvg}
                          max={maxStats.average}
                          format={(v) => formatDecimal(v)}
                        />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
      if (isCastMode) return nodeToRender;
      else castStandingsNodeToRender = nodeToRender;
    }
  }

  if (
    (isCastMode || exportCastData?.type === "nextMatchDay") &&
    actualCastViewType === "nextMatchDay" &&
    actualCastSeasonId
  ) {
    const season = data.seasons.find(
      (s: Season) => s.id === actualCastSeasonId,
    );
    if (season) {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const futureMatches = data.matches.filter(
        (m: Match) => m.seasonId === season.id && m.status === "planned" && format(new Date(m.date), "yyyy-MM-dd") >= todayStr
      );
      
      const futureSpeeldagen = Array.from(new Set(futureMatches.map((m: Match) => format(new Date(m.date), "yyyy-MM-dd")))).sort();
      const nextSpeeldag = futureSpeeldagen[0] as string | undefined;

      let nodeToRender: React.ReactNode;

      if (!nextSpeeldag) {
        nodeToRender = (
          <div
            id={exportCastData ? "cast-nextmatchday-export-node" : undefined}
            className={
              exportCastData
                ? "relative w-[1920px] h-[1080px] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex items-center justify-center p-8 flex-col"
                : "fixed inset-0 z-[100] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex items-center justify-center p-8 flex-col w-full"
            }
          >
            <h1 className="text-4xl text-white font-bold opacity-50">Geen toekomstige wedstrijden meer</h1>
            <button
              onClick={() => {
                setIsCastMode(false);
                if (new URLSearchParams(window.location.search).get("cast") === "true") window.close();
              }}
              className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all backdrop-blur-md z-50 border border-white/10"
            >
              <X size={24} />
            </button>
          </div>
        );
      } else {
        const nextMatches = data.matches.filter(
          (m: Match) => m.seasonId === season.id && format(new Date(m.date), "yyyy-MM-dd") === nextSpeeldag && m.status === "planned"
        );
        const nextDate = new Date(nextSpeeldag + "T12:00:00");
        
        // Use member averages
        const getPlayerDetails = (playerId: string) => {
          const user = data.users.find((u: User) => u.id === playerId);
          const memberInfo = season.members?.find((m) => m.userId === playerId);
          return {
            name: user?.shortName || user?.name || "Onbekend",
            avg: memberInfo?.currentAverage || 0
          };
        };

        nodeToRender = (
          <div
            id={exportCastData ? "cast-nextmatchday-export-node" : undefined}
            className={
              exportCastData
                ? "relative w-[1920px] h-[1080px] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex overflow-hidden font-sans p-8 flex-col"
                : "fixed inset-0 z-[100] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex overflow-hidden selection:bg-yellow-500/30 font-sans p-8 flex-col overflow-y-auto w-full"
            }
          >
            <button
              onClick={() => {
                setIsCastMode(false);
                if (new URLSearchParams(window.location.search).get("cast") === "true") window.close();
              }}
              className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all backdrop-blur-md z-50 border border-white/10"
            >
              <X size={24} />
            </button>

            <div className="flex-none mb-12 relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center justify-center p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl mb-6 shadow-2xl">
                <Calendar className="text-purple-400 mr-4" size={48} />
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight leading-none drop-shadow-md capitalize">
                    {format(nextDate, "EEEE d MMMM", { locale: nl })}
                  </h1>
                  <h2 className="text-xl font-bold text-white/60 tracking-wider mt-2">
                    Volgende speeldag
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col justify-center max-w-6xl w-full mx-auto relative z-10 space-y-6">
              {nextMatches.length === 0 ? (
                <div className="text-center text-white/50 text-2xl font-bold p-12 bg-white/5 rounded-3xl border border-white/10">
                  Geen wedstrijden gepland voor deze dag
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                  {nextMatches.map((match: Match, idx: number) => {
                    const p1 = getPlayerDetails(match.player1Id);
                    const p2 = getPlayerDetails(match.player2Id);
                    return (
                      <div key={match.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                        <div className="flex w-full items-center justify-between gap-4">
                          <div className="flex-1 flex flex-col items-end">
                            <span className="text-3xl font-black text-white truncate w-full text-right drop-shadow-md">{p1.name}</span>
                            <span className="text-lg font-bold text-white bg-white/20 px-3 py-1 rounded-lg mt-2">Gemiddelde: {p1.avg}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center px-4">
                            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/50 rounded-full flex items-center justify-center shadow-inner shadow-purple-500/20">
                              <span className="text-purple-300 font-black text-3xl leading-none">-</span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col items-start">
                            <span className="text-3xl font-black text-yellow-400 truncate w-full text-left drop-shadow-md">{p2.name}</span>
                            <span className="text-lg font-bold text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-lg mt-2">Gemiddelde: {p2.avg}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      }

      if (isCastMode) return nodeToRender;
      else castNextMatchDayNodeToRender = nodeToRender;
    }
  }

  if (
    (isCastMode || exportCastData?.type === "extMatch") &&
    actualCastViewType === "extMatch" &&
    actualCastExtMatchId
  ) {
    const extMatch = data.externalMatches.find(
      (m: any) => m.id === actualCastExtMatchId,
    );
    if (extMatch) {
      const extHomeClub = data.clubs.find(
        (c: Club) => c.id === extMatch.homeClubId,
      );
      const extAwayClub = data.clubs.find(
        (c: Club) => c.id === extMatch.awayClubId,
      );
      let extHomePointsTotal = 0;
      let extAwayPointsTotal = 0;

      (extMatch.games || []).forEach((g: any) => {
        const p1 = data.users.find((u: User) => u.id === g.homePlayerId);
        const p2 = data.users.find((u: User) => u.id === g.awayPlayerId);
        const gHomeTarget = g.homeTarget ?? p1?.baseAverage ?? 1;
        const gAwayTarget = g.awayTarget ?? p2?.baseAverage ?? 1;

        let gHomeScore = 0;
        let gAwayScore = 0;

        if (g.status === "finished") {
          gHomeScore = g.homeScore || 0;
          gAwayScore = g.awayScore || 0;
        } else if (g.status === "started") {
          let p1Calc = 0;
          let p2Calc = 0;
          if (g.id === liveMatchId) {
            p1Calc =
              (g.turns?.reduce(
                (acc: number, t: any, i: number) =>
                  acc + (i === activeTurnIndex ? 0 : t.player1 || 0),
                0,
              ) || 0) + currentTurnP1;
            p2Calc =
              (g.turns?.reduce(
                (acc: number, t: any, i: number) =>
                  acc + (i === activeTurnIndex ? 0 : t.player2 || 0),
                0,
              ) || 0) + currentTurnP2;
          } else {
            p1Calc =
              g.turns?.reduce(
                (acc: number, t: any) => acc + (t.player1 || 0),
                0,
              ) || 0;
            p2Calc =
              g.turns?.reduce(
                (acc: number, t: any) => acc + (t.player2 || 0),
                0,
              ) || 0;
          }
          const myClubIsHome = extMatch.homeClubId === selectedClubId;
          gHomeScore = myClubIsHome ? p1Calc : p2Calc;
          gAwayScore = myClubIsHome ? p2Calc : p1Calc;
        }

        if (g.status === "finished" || g.status === "started") {
          extHomePointsTotal += calculatePoints(
            gHomeScore,
            gHomeTarget,
            gAwayScore,
            gAwayTarget,
            extMatch.scoringSystem,
          );
          extAwayPointsTotal += calculatePoints(
            gAwayScore,
            gAwayTarget,
            gHomeScore,
            gHomeTarget,
            extMatch.scoringSystem,
          );
        }
      });

      const nodeToRender = (
        <div
          id={exportCastData ? "cast-extmatch-export-node" : undefined}
          className={
            exportCastData
              ? "relative w-[1920px] h-[1080px] bg-black flex flex-col items-center justify-center p-4"
              : "fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
          }
        >
          <button
            onClick={() => {
              setIsCastMode(false);
              if (
                new URLSearchParams(window.location.search).get("cast") ===
                "true"
              ) {
                window.close();
              }
            }}
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all backdrop-blur-md z-50 border border-white/10"
          >
            <X size={24} />
          </button>
          <div className="w-[95vw] h-[95vh] max-w-[1920px] max-h-[1080px] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-emerald-900/50 flex flex-col relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="px-8 py-8 bg-black/20 flex flex-col items-center justify-center border-b border-black/20 relative">
                <div className="text-white/80 text-lg md:text-xl font-bold uppercase tracking-[0.2em] mb-6">
                  {extMatch.date
                    ? format(new Date(extMatch.date), "EEEE d MMMM yyyy", {
                        locale: nl,
                      })
                    : "Wedstrijd Tussenstand"}
                </div>
                <div className="flex items-center justify-between w-full px-8">
                  <div className="flex items-center gap-4 flex-1 justify-start">
                    {extHomeClub?.logo ? (
                      <img
                        src={extHomeClub.logo}
                        alt={extHomeClub.name}
                        className="h-16 w-16 object-contain rounded-full bg-white/10 p-1 border border-white/10 shadow-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                        <Trophy size={32} className="text-white/40" />
                      </div>
                    )}
                    <span className="text-white text-xl md:text-2xl lg:text-3xl font-black capitalize tracking-wider">
                      {extHomeClub?.name}{" "}
                      <span className="text-emerald-400 opacity-90 ml-2">
                        ({extHomePointsTotal})
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 px-10 py-2 shrink-0">
                    <span className="text-white/40 text-xs md:text-sm font-bold tracking-widest uppercase">
                      Gespeeld:{" "}
                      {
                        (extMatch.games || []).filter(
                          (g: any) => g.status === "finished",
                        ).length
                      }{" "}
                      &nbsp;&bull;&nbsp; Resterend:{" "}
                      {
                        (extMatch.games || []).filter(
                          (g: any) => g.status !== "finished",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <span className="text-white text-xl md:text-2xl lg:text-3xl font-black capitalize tracking-wider text-right">
                      {extAwayClub?.name}{" "}
                      <span className="text-[#f1c40f] opacity-90 ml-2">
                        ({extAwayPointsTotal})
                      </span>
                    </span>
                    {extAwayClub?.logo ? (
                      <img
                        src={extAwayClub.logo}
                        alt={extAwayClub.name}
                        className="h-16 w-16 object-contain rounded-full bg-white/10 p-1 border border-white/10 shadow-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                        <Trophy size={32} className="text-white/40" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <table className="w-full text-left border-collapse flex-1 flex flex-col">
                  <thead>
                    <tr className="bg-black/30 border-b border-white/10 flex w-full">
                      <th className="py-4 px-8 font-black text-[#f1c40f] text-xs md:text-sm uppercase tracking-widest text-left flex-1">
                        Speler (Thuis)
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-32">
                        Hoogste Serie
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-32">
                        Gemiddelde
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-32">
                        Caramboles
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-28 bg-black/20">
                        Punten
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-28 bg-black/20">
                        Punten
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-32">
                        Caramboles
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-32">
                        Gemiddelde
                      </th>
                      <th className="py-4 px-2 font-black text-[#f1c40f] text-[10px] md:text-xs uppercase tracking-widest text-center w-32">
                        Hoogste Serie
                      </th>
                      <th className="py-4 px-8 font-black text-[#f1c40f] text-xs md:text-sm uppercase tracking-widest text-right flex-1">
                        Speler (Uit)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="flex-1 flex flex-col overflow-y-auto w-full">
                    {(() => {
                      let maxPoints =
                        extMatch.scoringSystem === "driebanden" ? 2 : 12;
                      let maxCar = 1;
                      let maxAvg = 0.1;
                      let maxHighest = 1;

                      (extMatch.games || []).forEach((g: any) => {
                        const isFinished = g.status === "finished";
                        const isStarted = g.status === "started";
                        const p1TurnTotal =
                          g.turns?.reduce(
                            (acc: number, t: any) => acc + (t.player1 || 0),
                            0,
                          ) || 0;
                        const p2TurnTotal =
                          g.turns?.reduce(
                            (acc: number, t: any) => acc + (t.player2 || 0),
                            0,
                          ) || 0;
                        const homeScore = isFinished
                          ? g.homeScore || 0
                          : isStarted
                            ? p1TurnTotal
                            : g.homeScore || 0;
                        const awayScore = isFinished
                          ? g.awayScore || 0
                          : isStarted
                            ? p2TurnTotal
                            : g.awayScore || 0;
                        maxCar = Math.max(maxCar, homeScore, awayScore);

                        const homeAvg =
                          g.turns?.length > 0
                            ? homeScore / (g.turns || []).length
                            : 0;
                        const awayAvg =
                          g.turns?.length > 0
                            ? awayScore / (g.turns || []).length
                            : 0;
                        maxAvg = Math.max(maxAvg, homeAvg, awayAvg);

                        const p1H =
                          g.turns && (g.turns || []).length > 0
                            ? Math.max(
                                ...(g.turns || []).map(
                                  (t: any) => t.player1 || 0,
                                ),
                              )
                            : 0;
                        const p2H =
                          g.turns && (g.turns || []).length > 0
                            ? Math.max(
                                ...(g.turns || []).map(
                                  (t: any) => t.player2 || 0,
                                ),
                              )
                            : 0;
                        maxHighest = Math.max(maxHighest, p1H, p2H);
                      });

                      return (extMatch.games || []).map((g: any) => {
                        const p1 = data.users.find(
                          (u: User) => u.id === g.homePlayerId,
                        );
                        const p2 = data.users.find(
                          (u: User) => u.id === g.awayPlayerId,
                        );
                        const isFinished = g.status === "finished";
                        const isStarted = g.status === "started";

                        const p1TurnTotal =
                          g.turns?.reduce(
                            (acc: number, t: any) => acc + (t.player1 || 0),
                            0,
                          ) || 0;
                        const p2TurnTotal =
                          g.turns?.reduce(
                            (acc: number, t: any) => acc + (t.player2 || 0),
                            0,
                          ) || 0;
                        const p1HighestInfo =
                          g.turns && (g.turns || []).length > 0
                            ? Math.max(
                                ...(g.turns || []).map(
                                  (t: any) => t.player1 || 0,
                                ),
                              )
                            : 0;
                        const p2HighestInfo =
                          g.turns && (g.turns || []).length > 0
                            ? Math.max(
                                ...(g.turns || []).map(
                                  (t: any) => t.player2 || 0,
                                ),
                              )
                            : 0;

                        // For extMatch rendering, we use home as left, away as right directly
                        const homeScore = isFinished
                          ? g.homeScore || 0
                          : isStarted
                            ? p1TurnTotal
                            : g.homeScore || 0;
                        const awayScore = isFinished
                          ? g.awayScore || 0
                          : isStarted
                            ? p2TurnTotal
                            : g.awayScore || 0;
                        const homeAvg =
                          g.turns?.length > 0
                            ? homeScore / (g.turns || []).length
                            : 0;
                        const awayAvg =
                          g.turns?.length > 0
                            ? awayScore / (g.turns || []).length
                            : 0;

                        const homeTargetForCalc =
                          g.homeTarget ?? p1?.baseAverage ?? 1;
                        const awayTargetForCalc =
                          g.awayTarget ?? p2?.baseAverage ?? 1;

                        let displayHomePoints: number | string = "-";
                        let displayAwayPoints: number | string = "-";
                        if (isFinished || isStarted) {
                          displayHomePoints = calculatePoints(
                            homeScore,
                            homeTargetForCalc,
                            awayScore,
                            awayTargetForCalc,
                            extMatch.scoringSystem,
                          );
                          displayAwayPoints = calculatePoints(
                            awayScore,
                            awayTargetForCalc,
                            homeScore,
                            homeTargetForCalc,
                            extMatch.scoringSystem,
                          );
                        }

                        return (
                          <tr
                            key={g.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors flex w-full flex-1 min-h-[50px] items-center"
                          >
                            <td className="py-2 px-6 text-left flex-1 items-center flex">
                              <span className="font-bold text-white text-lg md:text-xl xl:text-3xl mr-2 whitespace-nowrap capitalize">
                                {p1?.shortName || p1?.name || "Onbekend"}
                              </span>
                              <span className="text-xs md:text-sm text-emerald-300/80 font-bold tracking-widest">
                                ({g.homeTarget ?? p1?.baseAverage ?? 0})
                              </span>
                            </td>

                            <td className="relative py-2 px-2 text-center w-32 overflow-hidden text-white/50 text-xl md:text-2xl">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${(p1HighestInfo / maxHighest) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10">
                                {g.turns?.length > 0 ? (
                                  <span className="font-bold text-white">
                                    {p1HighestInfo}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-32 overflow-hidden text-[#f1c40f] text-xl md:text-2xl">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${(homeAvg / maxAvg) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10">
                                {g.turns?.length > 0 ? (
                                  <span className="font-bold">
                                    {homeAvg.toFixed(3)}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-32 overflow-hidden">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${(homeScore / maxCar) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10">
                                {isStarted || isFinished ? (
                                  <span className="font-black text-white text-3xl md:text-4xl">
                                    {homeScore || 0}
                                  </span>
                                ) : (
                                  <span className="text-white/40 text-2xl">
                                    -
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-28 border-r border-white/5 bg-black/10 overflow-hidden h-full flex items-center justify-center">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-[#f1c40f]/15 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${((typeof displayHomePoints === "number" ? displayHomePoints : 0) / maxPoints) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10 font-black text-[#f1c40f] text-3xl md:text-4xl">
                                {displayHomePoints}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-28 border-r border-white/5 bg-black/10 overflow-hidden h-full flex items-center justify-center">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-[#f1c40f]/15 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${((typeof displayAwayPoints === "number" ? displayAwayPoints : 0) / maxPoints) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10 font-black text-[#f1c40f] text-3xl md:text-4xl">
                                {displayAwayPoints}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-32 overflow-hidden">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${(awayScore / maxCar) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10">
                                {isStarted || isFinished ? (
                                  <span className="font-black text-white text-3xl md:text-4xl">
                                    {awayScore || 0}
                                  </span>
                                ) : (
                                  <span className="text-white/40 text-2xl">
                                    -
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-32 overflow-hidden text-[#f1c40f] text-xl md:text-2xl">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${(awayAvg / maxAvg) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10">
                                {g.turns?.length > 0 ? (
                                  <span className="font-bold">
                                    {awayAvg.toFixed(3)}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </span>
                            </td>
                            <td className="relative py-2 px-2 text-center w-32 overflow-hidden text-white/50 text-xl md:text-2xl">
                              <div
                                className="absolute inset-y-1 my-1 left-1 rounded-md bg-emerald-500/20 backdrop-blur-sm transition-all duration-500"
                                style={{
                                  width: `calc(${(p2HighestInfo / maxHighest) * 100}% - 8px)`,
                                }}
                              />
                              <span className="relative z-10">
                                {g.turns?.length > 0 ? (
                                  <span className="font-bold text-white">
                                    {p2HighestInfo}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </span>
                            </td>

                            <td className="py-2 px-6 text-right flex-1 items-center flex justify-end">
                              <span className="text-xs md:text-sm text-emerald-300/80 font-bold tracking-widest mr-2">
                                ({g.awayTarget ?? p2?.baseAverage ?? 0})
                              </span>
                              <span className="font-bold text-white text-lg md:text-xl xl:text-3xl whitespace-nowrap capitalize">
                                {p2?.shortName || p2?.name || "Onbekend"}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Logo Watermark */}
            <div className="absolute right-[-10%] bottom-[-20%] opacity-[0.03] pointer-events-none rotate-[-15deg]">
              <Trophy size={600} />
            </div>
          </div>
        </div>
      );
      if (isCastMode) return nodeToRender;
      else castExtMatchNodeToRender = nodeToRender;
    }
  }

  if (isCastMode && liveMatch) {
    const isCompleted = liveMatch.status === "completed";
    const isActiveAdminMatch = liveMatch.id === liveMatchId;

    // Calculate Stats
    const turns = liveMatch.turns || [];
    const p1Total =
      turns.reduce(
        (sum, t, i) =>
          sum +
          (isActiveAdminMatch && i === activeTurnIndex ? 0 : t.player1 || 0),
        0,
      ) + (isActiveAdminMatch ? currentTurnP1 : 0);
    const p2Total =
      turns.reduce(
        (sum, t, i) =>
          sum +
          (isActiveAdminMatch && i === activeTurnIndex ? 0 : t.player2 || 0),
        0,
      ) + (isActiveAdminMatch ? currentTurnP2 : 0);
    const p1Serie = Math.max(
      ...turns.map((t) => t.player1 || 0),
      isActiveAdminMatch ? currentTurnP1 : 0,
    );
    const p2Serie = Math.max(
      ...turns.map((t) => t.player2 || 0),
      isActiveAdminMatch ? currentTurnP2 : 0,
    );
    const totalTurns = turns.length;
    const p1Avg = totalTurns > 0 ? (p1Total / totalTurns).toFixed(3) : "0.000";
    const p2Avg = totalTurns > 0 ? (p2Total / totalTurns).toFixed(3) : "0.000";

    let extMatch: any;
    let extHomePointsTotal = 0;
    let extAwayPointsTotal = 0;
    let extHomeClub: Club | undefined;
    let extAwayClub: Club | undefined;

    if (liveMatch.isExternal) {
      extMatch = data.externalMatches?.find(
        (em: any) => em.id === liveMatch.extMatchId,
      );
      if (extMatch) {
        extHomeClub = data.clubs.find(
          (c: Club) => c.id === extMatch.homeClubId,
        );
        extAwayClub = data.clubs.find(
          (c: Club) => c.id === extMatch.awayClubId,
        );
        const isHome = extMatch.homeClubId === selectedClubId;

        (extMatch.games || []).forEach((g: any) => {
          const gHomeTarget =
            g.homeTarget ??
            data.users.find((u: User) => u.id === g.homePlayerId)
              ?.baseAverage ??
            1;
          const gAwayTarget =
            g.awayTarget ??
            data.users.find((u: User) => u.id === g.awayPlayerId)
              ?.baseAverage ??
            1;

          let gHomeScore = 0;
          let gAwayScore = 0;

          if (g.status === "finished") {
            gHomeScore = g.homeScore || 0;
            gAwayScore = g.awayScore || 0;
          } else if (g.status === "started" || g.status === "planned") {
            let p1Calc = 0;
            let p2Calc = 0;
            if (g.id === liveMatchId) {
              p1Calc =
                (g.turns?.reduce(
                  (acc: number, t: any, i: number) =>
                    acc + (i === activeTurnIndex ? 0 : t.player1 || 0),
                  0,
                ) || 0) + currentTurnP1;
              p2Calc =
                (g.turns?.reduce(
                  (acc: number, t: any, i: number) =>
                    acc + (i === activeTurnIndex ? 0 : t.player2 || 0),
                  0,
                ) || 0) + currentTurnP2;
            } else {
              p1Calc =
                g.turns?.reduce(
                  (acc: number, t: any) => acc + (t.player1 || 0),
                  0,
                ) || 0;
              p2Calc =
                g.turns?.reduce(
                  (acc: number, t: any) => acc + (t.player2 || 0),
                  0,
                ) || 0;
            }

            gHomeScore = isHome ? p1Calc : p2Calc;
            gAwayScore = isHome ? p2Calc : p1Calc;
          }

          if (g.status === "finished" || g.status === "started") {
            extHomePointsTotal += calculatePoints(
              gHomeScore,
              gHomeTarget,
              gAwayScore,
              gAwayTarget,
              extMatch.scoringSystem,
            );
            extAwayPointsTotal += calculatePoints(
              gAwayScore,
              gAwayTarget,
              gHomeScore,
              gHomeTarget,
              extMatch.scoringSystem,
            );
          }
        });
      }
    }

    return (
      <div className="fixed inset-0 z-[100] bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] flex overflow-hidden selection:bg-yellow-500/30 font-sans">
        <AnimatePresence>
          {showPigAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            >
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{
                    rotate: [0, -15, 15, -15, 15, 0],
                    x: [-1000, 0, 1000],
                  }}
                  transition={{ duration: 4, ease: "backInOut" }}
                  className="text-[25rem] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                >
                  🐷
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", damping: 12 }}
                  className="bg-yellow-400 text-slate-900 px-12 py-6 rounded-[3rem] font-black text-7xl border-8 border-white shadow-2xl uppercase tracking-tighter -mt-20"
                >
                  Varken!
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nice Ball Animation */}
        <AnimatePresence mode="wait">
          {niceBallNotification && (
            <div
              key="niceBall"
              className="fixed inset-0 z-[600] pointer-events-none overflow-hidden flex flex-col justify-center items-center"
            >
              {/* The Banner (Mooie bal!!!) */}
              <motion.div
                initial={{ y: "100vh", opacity: 0 }}
                animate={{
                  y: ["100vh", "100vh", "0vh", "0vh", "-100vh"],
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: 5,
                  times: [0, 0.5, 0.6, 0.9, 1],
                  ease: "easeInOut",
                }}
                className="absolute top-32 md:top-48 z-30 pointer-events-none"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black text-5xl md:text-7xl shadow-[0_20px_50px_rgba(79,70,229,0.5)] border-4 border-blue-200 text-center uppercase tracking-widest w-max whitespace-nowrap">
                  Mooie bal!!!
                </div>
              </motion.div>

              {/* The Ball */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
                transition={{ duration: 5, times: [0, 0.16, 0.5, 0.9, 1] }}
                className="relative z-10 flex justify-center items-center h-64 mt-20"
              >
                <motion.div
                  animate={
                    niceBallNotification === "white"
                      ? { rotate: 360 }
                      : { rotate: -360 }
                  }
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className={`w-56 h-56 rounded-full shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.3),_0_20px_40px_rgba(0,0,0,0.4)] relative flex items-center justify-center border border-slate-200/50 ${niceBallNotification === "white" ? "bg-white" : "bg-yellow-400"}`}
                >
                  <div className="absolute top-6 left-8 w-16 h-8 bg-white/60 rounded-full blur-[2px] transform -rotate-45" />
                </motion.div>

                {/* Sparkles */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0, 1, 1, 0] }}
                  transition={{ duration: 5, times: [0, 0.5, 0.55, 0.9, 1] }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: 2,
                        delay: 2.5 + i * 0.15,
                        ease: "easeInOut",
                      }}
                      className="absolute text-yellow-300 text-5xl drop-shadow-lg"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        transform: `translate(-50%, -50%)`,
                      }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* The Girl polishing */}
              <motion.div
                initial={{ x: "100vw" }}
                animate={{ x: ["100vw", "0vw", "0vw", "100vw", "100vw"] }}
                transition={{
                  duration: 5,
                  times: [0, 0.16, 0.5, 0.66, 1],
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 z-20 flex justify-center ml-48 md:ml-64 mt-10"
              >
                {/* Polishing arm movement */}
                <motion.div
                  animate={{
                    y: [0, 30, 0],
                    rotate: [0, -15, 0],
                    x: [0, -20, 0],
                  }}
                  transition={{ duration: 0.3, repeat: 6, delay: 0.8 }}
                  className="scale-[1.5] origin-bottom"
                >
                  <RingGirlSVG />
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Ring Girl Announcement */}
        <AnimatePresence mode="wait">
          {turnNotification && (
            <div
              key={turnNotification}
              className="fixed inset-0 z-[500] pointer-events-none overflow-hidden flex justify-center"
            >
              {/* The Board */}
              <motion.div
                initial={{ x: "100vw" }}
                animate={{ x: 0 }}
                exit={{ opacity: 0, y: -40, scale: 0.9 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-12 md:top-24 z-20 pointer-events-none"
              >
                <div className="bg-yellow-400 text-slate-900 px-8 lg:px-16 py-4 lg:py-8 rounded-[2rem] font-black text-3xl md:text-5xl lg:text-7xl shadow-[0_30px_70px_rgba(250,204,21,0.5)] border-8 border-white text-center uppercase tracking-tighter w-max whitespace-nowrap">
                  {turnNotification}
                </div>
              </motion.div>

              {/* The Girl */}
              <motion.div
                initial={{ x: "100vw" }}
                animate={{ x: ["100vw", "0vw", "-100vw"] }}
                transition={{
                  duration: 4,
                  times: [0, 0.375, 1],
                  ease: ["easeOut", "easeIn"],
                }}
                className="absolute top-24 md:top-40 z-10 flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mt-8 md:mt-16"
                >
                  <RingGirlSVG />
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Results Overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-xl flex items-center justify-center p-12 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-6xl"
              >
                <div className="text-center mb-12">
                  <h2 className="text-yellow-400 text-2xl font-bold uppercase tracking-[0.4em] mb-2">
                    Wedstrijd Voltooid
                  </h2>
                  <h3 className="text-white text-6xl font-black">
                    {liveCurrentSeason?.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  {/* Player 1 Stats */}
                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-white/5 text-9xl font-black select-none pointer-events-none group-hover:text-white/10 transition-colors">
                      1
                    </div>
                    <div className="relative z-10">
                      <div className="text-white/40 text-xl font-bold uppercase tracking-widest mb-4">
                        Speler 1
                      </div>
                      <div className="text-white text-7xl font-black mb-12 capitalize">
                        {liveMatch.player1Name}
                      </div>

                      <div className="space-y-8">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                          <span className="text-white/50 text-2xl">
                            Caramboles
                          </span>
                          <span className="text-white text-5xl font-black">
                            {p1Total}{" "}
                            <span className="text-white/30 text-2xl font-bold">
                              / {liveMatch.player1Target}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                          <span className="text-white/50 text-2xl">
                            Gemiddelde
                          </span>
                          <span className="text-white text-5xl font-black text-emerald-400">
                            {p1Avg}
                          </span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                          <span className="text-white/50 text-2xl">
                            Hoogste Serie
                          </span>
                          <span className="text-white text-5xl font-black">
                            {p1Serie}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 Stats */}
                  <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-[3rem] p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-yellow-400/5 text-9xl font-black select-none pointer-events-none group-hover:text-yellow-400/10 transition-colors">
                      2
                    </div>
                    <div className="relative z-10">
                      <div className="text-yellow-400/40 text-xl font-bold uppercase tracking-widest mb-4">
                        Speler 2
                      </div>
                      <div className="text-yellow-400 text-7xl font-black mb-12 capitalize">
                        {liveMatch.player2Name}
                      </div>

                      <div className="space-y-8">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                          <span className="text-white/50 text-2xl">
                            Caramboles
                          </span>
                          <span className="text-yellow-400 text-5xl font-black">
                            {p2Total}{" "}
                            <span className="text-yellow-400/30 text-2xl font-bold">
                              / {liveMatch.player2Target}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                          <span className="text-white/50 text-2xl">
                            Gemiddelde
                          </span>
                          <span className="text-yellow-400 text-5xl font-black">
                            {p2Avg}
                          </span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                          <span className="text-white/50 text-2xl">
                            Hoogste Serie
                          </span>
                          <span className="text-yellow-400 text-5xl font-black">
                            {p2Serie}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16 text-center">
                  <div className="inline-block px-12 py-6 bg-white/5 rounded-full border border-white/10">
                    <span className="text-white/40 text-2xl font-bold uppercase tracking-widest mr-4">
                      Totaal Aantal Beurten:
                    </span>
                    <span className="text-white text-4xl font-black">
                      {totalTurns}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Felt Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>

        {/* P1 Progression Panel - Full Height */}
        <div className="hidden xl:flex w-72 bg-black/40 border-r border-white/10 flex-col backdrop-blur-md animate-in slide-in-from-left duration-1000 h-full relative z-20">
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            <div
              className={cn(
                "grid gap-4 h-full",
                liveMatch?.turns?.length > 15 || activeTurnIndex > 14
                  ? "grid-cols-2"
                  : "grid-cols-1",
              )}
            >
              {[0, 1].map((colIdx) => {
                const turnsPerCol = 20;
                const startIdx = colIdx * turnsPerCol;
                const endIdx = startIdx + turnsPerCol;
                const visibleTurns = Array.from({ length: turnsPerCol })
                  .map((_, i) => startIdx + i)
                  .filter(
                    (idx) =>
                      idx < liveMaxTurns &&
                      (liveMatch?.turns[idx] || idx === activeTurnIndex),
                  );

                if (visibleTurns.length === 0 && colIdx > 0) return null;

                return (
                  <table
                    key={colIdx}
                    className="w-full text-center border-separate border-spacing-y-1 self-start"
                  >
                    <thead>
                      <tr className="text-xs md:text-sm font-bold text-white/30 uppercase border-b border-white/5">
                        <th className="py-1">#</th>
                        <th className="py-1">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTurns.map((idx) => {
                        const turn = liveMatch?.turns[idx];
                        const isCurrent = idx === activeTurnIndex;
                        const score =
                          isCurrent && activeScoringPlayer === 1
                            ? currentTurnP1
                            : turn?.player1;
                        return (
                          <tr
                            key={idx}
                            className={cn(
                              "transition-all duration-300 rounded-xl overflow-hidden",
                              isCurrent
                                ? "bg-emerald-700 text-white shadow-2xl scale-105"
                                : "text-white/60 hover:bg-white/5",
                            )}
                          >
                            <td className="py-0.5 text-base md:text-lg font-bold opacity-50">
                              {idx + 1}
                            </td>
                            <td className="py-0.5 text-3xl font-black">
                              {score || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Section: Header, Scoreboard, Footer */}
        <div className="flex-1 flex flex-col items-center justify-between p-2 md:p-6 relative z-10 overflow-hidden h-full">
          {/* Exit Button */}
          <button
            onClick={() => {
              setIsCastMode(false);
              if (
                new URLSearchParams(window.location.search).get("cast") ===
                "true"
              ) {
                window.close();
              }
            }}
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all backdrop-blur-md z-50 border border-white/10"
          >
            <X size={24} />
          </button>

          {/* Header / Game Info - Centered and Slimmer */}
          <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-top duration-700 relative mb-2">
            <div className="inline-flex items-center gap-4 px-4 py-1.5 bg-black/30 rounded-full border border-white/10 mb-2 backdrop-blur-sm">
              <span className="text-emerald-400 font-bold text-sm md:text-base uppercase tracking-[0.2em]">
                {liveCurrentSeason?.name}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-white/40 font-medium text-sm md:text-base uppercase tracking-[0.2em]">
                {isDriebandenLive ? "Driebanden" : "Libre"}
              </span>
            </div>

            <h1 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tight">
              Beurt{" "}
              <span className="text-yellow-400">{activeTurnIndex + 1}</span>
              <span className="text-white/20 ml-4 font-normal">
                van {liveMaxTurns}
              </span>
            </h1>
          </div>

          {/* Center Scoreboard - Concentrated */}
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 items-center justify-center mt-2">
            {/* Player 1 Card */}
            <div
              className={cn(
                "flex-1 w-full bg-black/40 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 border-[6px] transition-all duration-700 flex flex-col items-center justify-center relative group",
                activeScoringPlayer === 1
                  ? "border-white shadow-[0_40px_120px_rgba(255,255,255,0.15)] scale-[1.02]"
                  : "border-white/5 opacity-40 grayscale-[0.2]",
              )}
            >
              {/* White Ball - Player 1 */}
              <div
                className="absolute -top-16 left-0 md:-top-20 md:left-4 w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center text-slate-800 font-black text-4xl md:text-6xl z-20 border-[3px] border-white/10"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #ffffff 0%, #f0f0f0 30%, #c0c0c0 70%, #606060 100%)",
                  boxShadow:
                    "inset -8px -8px 20px rgba(0,0,0,0.4), inset 5px 5px 15px rgba(255,255,255,1), 10px 15px 25px rgba(0,0,0,0.6)",
                }}
              >
                {formatNumber(liveMatch?.player1AvgBefore || 0)}
              </div>

              {activeScoringPlayer === 1 && (
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-40 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.6)] animate-pulse" />
              )}
              <div className="text-white text-5xl md:text-[5rem] leading-[1.1] font-black mb-4 truncate w-full text-center drop-shadow-2xl capitalize tracking-tight">
                {p1?.shortName || p1?.name || "Speler 1"}
              </div>
              <div className="flex items-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="text-[4.5rem] md:text-[7rem] font-black text-white leading-none tracking-tighter">
                    {p1Confirmed}
                  </div>
                  <div className="text-white/30 text-lg md:text-xl font-bold uppercase tracking-[0.2em] mt-2">
                    Caramboles
                  </div>
                  {activeScoringPlayer === 1 && (
                    <div className="text-4xl font-black text-white mt-2 animate-bounce">
                      <span className="text-2xl mr-1 font-normal opacity-50">
                        +
                      </span>
                      {p1LiveSerie}
                    </div>
                  )}
                </div>
                <div className="w-px h-20 md:h-32 bg-white/10" />
                <div className="text-center">
                  <div className="text-[4.5rem] md:text-[7rem] font-black text-white leading-none tracking-tighter">
                    {calculatePoints(
                      p1Confirmed,
                      liveMatch?.player1AvgBefore || 1,
                      p2Confirmed,
                      liveMatch?.player2AvgBefore || 1,
                      liveCurrentSeason?.scoringSystem,
                    )}
                  </div>
                  <div className="text-white/30 text-lg md:text-xl font-bold uppercase tracking-[0.2em] mt-2">
                    Matchpunten
                  </div>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 mt-6 pt-4 border-t border-white/5 px-2">
                <div className="text-center border-r border-white/10">
                  <div className="text-5xl md:text-7xl font-black text-white">
                    {Math.max(
                      0,
                      ...(liveMatch?.turns
                        ?.slice(0, p1CompletedTurnsCalc)
                        .map((t: any) => t.player1) || []),
                    )}
                  </div>
                  <div className="text-base md:text-lg font-bold text-white/20 uppercase tracking-widest mt-1">
                    Hoogste Serie
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-7xl font-black text-white">
                    {formatDecimal(
                      p1CompletedTurnsCalc > 0
                        ? p1Confirmed / p1CompletedTurnsCalc
                        : 0,
                      2,
                    )}
                  </div>
                  <div className="text-base md:text-lg font-bold text-white/20 uppercase tracking-widest mt-1">
                    Gemiddelde
                  </div>
                </div>
              </div>
            </div>

            {/* Player 2 Card */}
            <div
              className={cn(
                "flex-1 w-full bg-black/40 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 border-[6px] transition-all duration-700 flex flex-col items-center justify-center relative group",
                activeScoringPlayer === 2
                  ? "border-yellow-400 shadow-[0_40px_120px_rgba(250,204,21,0.15)] scale-[1.02]"
                  : "border-white/5 opacity-40 grayscale-[0.2]",
              )}
            >
              {/* Yellow Ball - Player 2 */}
              <div
                className="absolute -top-16 right-0 md:-top-20 md:right-4 w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center text-amber-900 font-black text-4xl md:text-6xl z-20 border-[3px] border-yellow-400/20"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #ffffcc 0%, #ffcc00 30%, #b8860b 70%, #664d00 100%)",
                  boxShadow:
                    "inset -8px -8px 20px rgba(0,0,0,0.4), inset 5px 5px 15px rgba(255,255,255,0.9), 10px 15px 25px rgba(0,0,0,0.6)",
                }}
              >
                {formatNumber(liveMatch?.player2AvgBefore || 0)}
              </div>

              {activeScoringPlayer === 2 && (
                <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-40 bg-yellow-400 rounded-full shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-pulse" />
              )}
              <div className="text-white text-5xl md:text-[5rem] leading-[1.1] font-black mb-4 truncate w-full text-center drop-shadow-2xl capitalize tracking-tight">
                {p2?.shortName || p2?.name || "Speler 2"}
              </div>
              <div className="flex items-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="text-[4.5rem] md:text-[7rem] font-black text-white leading-none tracking-tighter">
                    {p2Confirmed}
                  </div>
                  <div className="text-white/30 text-lg md:text-xl font-bold uppercase tracking-[0.2em] mt-2">
                    Caramboles
                  </div>
                  {activeScoringPlayer === 2 && (
                    <div className="text-4xl font-black text-yellow-400 mt-2 animate-bounce">
                      <span className="text-2xl mr-1 font-normal opacity-50">
                        +
                      </span>
                      {p2LiveSerie}
                    </div>
                  )}
                </div>
                <div className="w-px h-20 md:h-32 bg-white/10" />
                <div className="text-center">
                  <div className="text-[4.5rem] md:text-[7rem] font-black text-white leading-none tracking-tighter">
                    {calculatePoints(
                      p2Confirmed,
                      liveMatch?.player2AvgBefore || 1,
                      p1Confirmed,
                      liveMatch?.player1AvgBefore || 1,
                      liveCurrentSeason?.scoringSystem,
                    )}
                  </div>
                  <div className="text-white/30 text-lg md:text-xl font-bold uppercase tracking-[0.2em] mt-2">
                    Matchpunten
                  </div>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 mt-6 pt-4 border-t border-white/5 px-2">
                <div className="text-center border-r border-white/10">
                  <div className="text-5xl md:text-7xl font-black text-white">
                    {Math.max(
                      0,
                      ...(liveMatch?.turns
                        ?.slice(0, p2CompletedTurnsCalc)
                        .map((t: any) => t.player2) || []),
                    )}
                  </div>
                  <div className="text-base md:text-lg font-bold text-white/20 uppercase tracking-widest mt-1">
                    Hoogste Serie
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl md:text-7xl font-black text-white">
                    {formatDecimal(
                      p2CompletedTurnsCalc > 0
                        ? p2Confirmed / p2CompletedTurnsCalc
                        : 0,
                      2,
                    )}
                  </div>
                  <div className="text-base md:text-lg font-bold text-white/20 uppercase tracking-widest mt-1">
                    Gemiddelde
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* External Match Info */}
          {extMatch && extHomeClub && extAwayClub && (
            <div className="w-full max-w-[800px] mt-4 px-8 py-4 bg-black/20 rounded-[2rem] border border-white/10 flex flex-col gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-700">
              <div className="flex justify-between items-center w-full">
                <span className="text-white/80 text-xl md:text-2xl font-black capitalize tracking-widest truncate max-w-[400px] text-left">
                  {extHomeClub.name}
                </span>
                <span className="text-white font-black text-3xl md:text-4xl text-right">
                  {extHomePointsTotal}{" "}
                  <span className="text-white/20 text-sm md:text-base uppercase tracking-wide">
                    pnt
                  </span>
                </span>
              </div>
              <div className="w-full h-px bg-white/10"></div>
              <div className="flex justify-between items-center w-full">
                <span className="text-white/80 text-xl md:text-2xl font-black capitalize tracking-widest truncate max-w-[400px] text-left">
                  {extAwayClub.name}
                </span>
                <span className="text-yellow-400 font-black text-3xl md:text-4xl text-right">
                  {extAwayPointsTotal}{" "}
                  <span className="text-yellow-400/20 text-sm md:text-base uppercase tracking-wide">
                    pnt
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Footer info - Club, Arbiter & Writer horizontal - WIDER */}
          <div className="w-full max-w-[1400px] flex justify-between items-center bg-black/20 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-700 mt-4">
            {/* Club Info */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Trophy className="text-emerald-400" size={40} />
              </div>
              <div className="text-left">
                <div className="text-white/20 text-sm md:text-base font-black uppercase tracking-widest mb-0.5">
                  Vereniging
                </div>
                <div className="text-white/80 text-3xl md:text-4xl font-black capitalize tracking-tight">
                  {activeClub?.name || "Biljart Vereniging"}
                </div>
              </div>
            </div>

            {/* Personnel Info - Stacked vertically */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-white/20 text-base md:text-lg font-black uppercase tracking-widest w-24">
                  Arbiter
                </span>
                <span className="text-white/70 text-3xl md:text-4xl font-bold capitalize tracking-tight">
                  {arbiter?.shortName || arbiter?.name || "Vrij"}
                </span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-white/20 text-base md:text-lg font-black uppercase tracking-widest w-24">
                  Schrijver
                </span>
                <span className="text-white/70 text-3xl md:text-4xl font-bold capitalize tracking-tight">
                  {writer?.shortName || writer?.name || "Vrij"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* P2 Progression Panel - Full Height */}
        <div className="hidden xl:flex w-72 bg-black/40 border-l border-white/10 flex-col backdrop-blur-md animate-in slide-in-from-right duration-1000 h-full relative z-20">
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            <div
              className={cn(
                "grid gap-4 h-full",
                liveMatch?.turns?.length > 15 || activeTurnIndex > 14
                  ? "grid-cols-2"
                  : "grid-cols-1",
              )}
            >
              {[0, 1].map((colIdx) => {
                const turnsPerCol = 20;
                const startIdx = colIdx * turnsPerCol;
                const endIdx = startIdx + turnsPerCol;
                const visibleTurns = Array.from({ length: turnsPerCol })
                  .map((_, i) => startIdx + i)
                  .filter(
                    (idx) =>
                      idx < liveMaxTurns &&
                      (liveMatch?.turns[idx] || idx === activeTurnIndex),
                  );

                if (visibleTurns.length === 0 && colIdx > 0) return null;

                return (
                  <table
                    key={colIdx}
                    className="w-full text-center border-separate border-spacing-y-1 self-start"
                  >
                    <thead>
                      <tr className="text-xs md:text-sm font-bold text-white/30 uppercase border-b border-white/5">
                        <th className="py-1">#</th>
                        <th className="py-1">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTurns.map((idx) => {
                        const turn = liveMatch?.turns[idx];
                        const isCurrent = idx === activeTurnIndex;
                        const score =
                          isCurrent && activeScoringPlayer === 2
                            ? currentTurnP2
                            : turn?.player2;
                        return (
                          <tr
                            key={idx}
                            className={cn(
                              "transition-all duration-300 rounded-xl overflow-hidden",
                              isCurrent
                                ? "bg-emerald-700 text-yellow-400 shadow-2xl scale-105"
                                : "text-white/60 hover:bg-white/5",
                            )}
                          >
                            <td className="py-0.5 text-base md:text-lg font-bold opacity-50">
                              {idx + 1}
                            </td>
                            <td className="py-0.5 text-3xl font-black">
                              {score || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Views ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-xl overflow-hidden transition-all",
              isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            {activeClub?.logo ? (
              <img
                src={activeClub.logo}
                alt={activeClub.name}
                className="h-8 w-8 rounded-lg object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Trophy size={28} className="shrink-0" />
            )}
            <span className="whitespace-nowrap truncate">
              {activeClub?.name || "BiljartClub"}
            </span>
          </div>
          {isSidebarCollapsed &&
            (activeClub?.logo ? (
              <img
                src={activeClub.logo}
                alt={activeClub.name}
                className="h-8 w-8 rounded-lg object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Trophy
                size={28}
                className="text-emerald-600 dark:text-emerald-400 mx-auto"
              />
            ))}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<Building2 size={20} />}
            label="Clubs"
            active={activeTab === "clubs"}
            onClick={() => setActiveTab("clubs")}
            collapsed={isSidebarCollapsed}
          />
          {selectedClubId && (
            <>
              <SidebarItem
                icon={<Users size={20} />}
                label="Leden"
                active={activeTab === "members"}
                onClick={() => setActiveTab("members")}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={<Calendar size={20} />}
                label="Seizoenen"
                active={activeTab === "seasons"}
                onClick={() => setActiveTab("seasons")}
                collapsed={isSidebarCollapsed}
              />
              {activeClub?.participatesInExternalMatches && (
                <SidebarItem
                  icon={<Trophy size={20} />}
                  label="Uit & Thuis"
                  active={activeTab === "external-matches"}
                  onClick={() => setActiveTab("external-matches")}
                  collapsed={isSidebarCollapsed}
                />
              )}
              <SidebarItem
                icon={<History size={20} />}
                label="Wedstrijden"
                active={activeTab === "matches"}
                onClick={() => setActiveTab("matches")}
                collapsed={isSidebarCollapsed}
              />
              {currentUser.role === "admin" && (
                <SidebarItem
                  icon={<Wallet size={20} />}
                  label="Kasboek"
                  active={activeTab === "cashbook"}
                  onClick={() => setActiveTab("cashbook")}
                  collapsed={isSidebarCollapsed}
                />
              )}
            </>
          )}
          <SidebarItem
            icon={<UserCircle size={20} />}
            label="Profiel"
            active={
              activeTab === "profile" && selectedProfileId === currentUser.id
            }
            onClick={() => {
              setSelectedProfileId(currentUser.id);
              setActiveTab("profile");
            }}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label="Instellingen"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Uitloggen"
            onClick={() => auth.signOut()}
            collapsed={isSidebarCollapsed}
          />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setUserSettingsEmail(currentUser.email);
              setUserSettingsShortName(currentUser.shortName || "");
              setUserSettingsAvg(currentUser.baseAverage);
              setUserSettingsAvatar(currentUser.avatar || "");
              setUserSettingsParticipatesExternal(
                currentUser.participatesInExternalMatches ?? false,
              );
              setIsUserSettingsModalOpen(true);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left",
              isSidebarCollapsed && "justify-center",
            )}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserCircle className="text-slate-400 shrink-0" size={32} />
            )}
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {currentUser.shortName || currentUser.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                  {currentUser.role}
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            {activeClub?.logo && (
              <img
                src={activeClub.logo}
                alt={activeClub.name}
                className="h-6 w-6 md:h-8 md:w-8 rounded-lg object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <h1 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white truncate">
              {activeTab === "clubs" && "Mijn Clubs"}
              {activeTab === "seasons" && (activeClub?.name || "Seizoenen")}
              {activeTab === "matches" &&
                `Wedstrijden ${activeSeason ? `(${activeSeason.name})` : ""}`}
              {activeTab === "members" && `Leden`}
              {activeTab === "profile" && "Profiel"}
              {activeTab === "settings" && "Instellingen"}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {liveMatchId && (
              <>
                <button
                  onClick={() => {
                    let targetType: "season" | "extMatch" = "season";
                    let targetId = "";
                    const match = data.matches.find(
                      (m: Match) => m.id === liveMatchId,
                    );
                    if (match) {
                      targetId = match.seasonId;
                    } else if (data.externalMatches) {
                      const extMatch = data.externalMatches.find(
                        (em: any) =>
                          em.games &&
                          (em.games || []).some(
                            (g: any) => g.id === liveMatchId,
                          ),
                      );
                      if (extMatch) {
                        targetType = "extMatch";
                        targetId = extMatch.id;
                      }
                    }
                    if (targetId)
                      setCastMenuTarget({ type: targetType, id: targetId });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg active:scale-95"
                >
                  <Tv size={18} />
                  <span>Cast Menu</span>
                </button>
                <button
                  onClick={() => setLiveMatchId(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-sm"
                >
                  <ArrowLeft size={18} />
                  <span>Ga terug naar wedstrijden</span>
                </button>
              </>
            )}

            {/* Matches overview buttons moved to top */}
            {activeTab === "matches" &&
              !liveMatchId &&
              (selectedSeasonId || selectedExternalMatchId) && (
                <>
                  <button
                    onClick={() => {
                      if (selectedSeasonId) {
                        setCastMenuTarget({
                          type: "season",
                          id: selectedSeasonId,
                        });
                      } else if (selectedExternalMatchId) {
                        setCastMenuTarget({
                          type: "extMatch",
                          id: selectedExternalMatchId,
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg active:scale-95"
                  >
                    <Tv size={18} />
                    <span>Cast Menu</span>
                  </button>
                  {selectedSeasonId &&
                    (isClubAdmin(activeClub, currentUser) ||
                      currentUser.role === "admin" ||
                      currentUser.role === "planner") && (
                      <button
                        onClick={() =>
                          showConfirm(
                            "Herindelen",
                            "Weet je zeker dat je alle niet-gestarte en afgemelde wedstrijden wilt herindelen?",
                            () =>
                              handleRescheduleUnplayedMatches(selectedSeasonId),
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50"
                      >
                        <RefreshCw size={18} />
                        <span>Herindelen</span>
                      </button>
                    )}
                  {selectedSeasonId && (
                    <button
                      onClick={() =>
                        setShowFinishedMatches(!showFinishedMatches)
                      }
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold border",
                        showFinishedMatches
                          ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300"
                          : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50",
                      )}
                    >
                      <History size={18} />
                      <span>
                        {showFinishedMatches
                          ? "Verberg voltooide"
                          : "Toon voltooide"}
                      </span>
                    </button>
                  )}
                </>
              )}

            {/* Seasons overview buttons moved to top */}
            {activeTab === "seasons" && activeClub && (
              <>
                <button
                  onClick={() => setShowBlockedSeasons(!showBlockedSeasons)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors shadow-sm text-sm font-bold",
                    showBlockedSeasons
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                  )}
                  title={
                    showBlockedSeasons
                      ? "Voltooide seizoenen verbergen"
                      : "Voltooide seizoenen tonen"
                  }
                >
                  {showBlockedSeasons ? (
                    <Lock size={16} />
                  ) : (
                    <Unlock size={16} />
                  )}
                  <span className="hidden sm:inline">
                    {showBlockedSeasons ? "Verbergen" : "Tonen"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    const seasonsForClub = data.seasons
                      .filter((s: Season) => s.clubId === activeClub.id)
                      .sort(
                        (a: Season, b: Season) =>
                          new Date(b.startDate).getTime() -
                          new Date(a.startDate).getTime()
                      );
                    const targetSeason =
                      seasonsForClub.find((s: Season) => !s.isBlocked) ||
                      seasonsForClub[0];
                    if (targetSeason) {
                      setCastMenuTarget({
                        type: "season",
                        id: targetSeason.id,
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold"
                  title="Cast Menu"
                >
                  <Tv size={16} />
                  <span className="hidden sm:inline">Cast Menu</span>
                </button>
                {isClubAdmin(activeClub, currentUser) && (
                  <button
                    onClick={() => setIsForecastModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold"
                  >
                    <TrendingUp size={16} />
                    <span className="hidden lg:inline">Vooruitblikken</span>
                  </button>
                )}
                {isClubAdmin(activeClub, currentUser) && (
                  <button
                    onClick={() => setIsSeasonModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold"
                  >
                    <Plus size={16} />
                    <span className="hidden lg:inline">Nieuw Seizoen</span>
                  </button>
                )}
              </>
            )}

            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                {(currentUser.shortName || currentUser.name)?.[0] || "?"}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "clubs" && (
              <motion.div
                key="clubs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Mijn Biljartclubs
                  </h2>
                  <button
                    onClick={() => {
                        setIsClubModalOpen(true);
                        setEditingClubId(null);
                        setNewClubName("");
                        setNewClubLogo("");
                        setNewClubLogoFile(null);
                        setLogoError("");
                        setIsUploadingLogo(false);
                        setNewClubCoAdminEmails("");
                        setNewClubParticipatesExternal(false);
                      }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Plus size={20} />
                    <span>Nieuwe Club</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.clubs.map((club: Club) => (
                    <div
                      key={club.id}
                      className={cn(
                        "bg-white dark:bg-slate-900 p-6 rounded-xl border transition-all cursor-pointer group",
                        selectedClubId === club.id
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700",
                      )}
                      onClick={() => {
                        setSelectedClubId(club.id);
                        setActiveTab("seasons");
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                          {club.logo ? (
                            <img
                              src={club.logo}
                              alt={club.name}
                              className="h-full w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <ImageIcon size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-slate-800 dark:text-white truncate">
                              {club.name}
                            </h3>
                            {isClubAdmin(club, currentUser) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingClubId(club.id);
                                  setNewClubName(club.name);
                                  setNewClubLogo(club.logo || "");
                                  setNewClubParticipatesExternal(
                                    club.participatesInExternalMatches ?? false,
                                  );
                                  setNewClubCoAdminEmails((club.coAdminEmails || []).join(", "));
                                  setIsClubModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                title="Club wijzigen"
                              >
                                <Settings size={14} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {(club.memberIds || []).length} leden
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClubId(club.id);
                                setActiveTab("members");
                              }}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              Leden beheren
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {isClubAdmin(club, currentUser)
                            ? "Beheerder"
                            : "Lid"}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 dark:text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                  {data.clubs.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <Users
                        size={48}
                        className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                      />
                      <p className="text-slate-500 dark:text-slate-400">
                        Je bent nog geen lid van een club.
                      </p>
                      <button
                        onClick={() => {
                        setIsClubModalOpen(true);
                        setEditingClubId(null);
                        setNewClubName("");
                        setNewClubLogo("");
                        setNewClubLogoFile(null);
                        setLogoError("");
                        setIsUploadingLogo(false);
                        setNewClubCoAdminEmails("");
                        setNewClubParticipatesExternal(false);
                      }}
                        className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Maak je eerste club aan
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "cashbook" &&
              currentUser.role === "admin" &&
              activeClub && (
                <motion.div
                  key="cashbook"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                      Kasboek van {activeClub.name}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {data.seasons
                      .filter(
                        (s: Season) =>
                          s.clubId === activeClub.id &&
                          s.id === selectedSeasonId,
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.id).getTime() - new Date(a.id).getTime(),
                      ) // Assuming id prefix or just sort by name? Sort by current if possible
                      .map((season: Season) => {
                        const totalBalance = getSeasonTotalBalance(season);
                        const contributions =
                          (season.members || []).filter(
                            (m) => m.paidContributie,
                          ).length * season.contributie;
                        const matchFees = data.matches
                          .filter(
                            (m: Match) =>
                              m.seasonId === season.id &&
                              m.status === "finished",
                          )
                          .reduce((acc: number, m: Match) => {
                            let matchAcc = 0;
                            if (m.player1Paid)
                              matchAcc += season.inlegPerWedstrijd;
                            if (m.player2Paid)
                              matchAcc += season.inlegPerWedstrijd;
                            return acc + matchAcc;
                          }, 0);

                        const externalMatchFees =
                          data.externalMatches
                            ?.filter((em: any) => em.seasonId === season.id)
                            .reduce((acc: number, em: any) => {
                              let total = 0;
                              (em.games || []).forEach((g: any) => {
                                if (g.homePlayerPaid)
                                  total += em.homePlayerFee || 0;
                                if (g.awayPlayerPaid)
                                  total += em.awayPlayerFee || 0;
                              });
                              return acc + total;
                            }, 0) || 0;

                        const manualTransactions = season.transactions || [];

                        return (
                          <div
                            key={season.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                          >
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                  {season.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Kasoverzicht voor dit seizoen
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  Saldo Seizoen
                                </p>
                                <p
                                  className={cn(
                                    "text-2xl font-black",
                                    totalBalance >= 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-600 dark:text-rose-400",
                                  )}
                                >
                                  {formatCurrency(totalBalance)}
                                </p>
                              </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                  Contributie & inleg
                                </h4>
                                <div className="space-y-2">
                                  <div
                                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => {
                                      setContributionsDetailType(
                                        "contributions",
                                      );
                                      setIsContributionsDetailModalOpen(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <CreditCard
                                        size={16}
                                        className="text-slate-400"
                                      />
                                      <span className="text-sm text-slate-600 dark:text-slate-300">
                                        Contributies (
                                        {
                                          (season.members || []).filter(
                                            (m) => m.paidContributie,
                                          ).length
                                        }
                                        )
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">
                                      {formatCurrency(contributions)}
                                    </span>
                                  </div>
                                  <div
                                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => {
                                      setContributionsDetailType("matchfees");
                                      setIsContributionsDetailModalOpen(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Trophy
                                        size={16}
                                        className="text-slate-400"
                                      />
                                      <span className="text-sm text-slate-600 dark:text-slate-300">
                                        Inleggeld Wedstrijden
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">
                                      {formatCurrency(matchFees)}
                                    </span>
                                  </div>
                                  <div
                                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => {
                                      setContributionsDetailType(
                                        "externalmatchfees",
                                      );
                                      setIsContributionsDetailModalOpen(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Banknote
                                        size={16}
                                        className="text-slate-400"
                                      />
                                      <span className="text-sm text-slate-600 dark:text-slate-300">
                                        Inleggeld Thuiswedstrijd
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">
                                      {formatCurrency(externalMatchFees)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="md:col-span-2 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    In- en Uitgaven
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setTransactionSeasonId(season.id);
                                      setIsTransactionModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                  >
                                    <PlusCircle size={14} />
                                    Toevoegen
                                  </button>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-2">Datum</th>
                                        <th className="pb-2">Omschrijving</th>
                                        <th className="pb-2 text-right">
                                          Bedrag
                                        </th>
                                        <th className="pb-2 text-right">
                                          Acties
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                      {season.initialBalanceType && (
                                        <tr>
                                          <td className="py-2 text-[10px] text-slate-400">
                                            Start
                                          </td>
                                          <td className="py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {season.initialBalanceType ===
                                            "manual"
                                              ? "Beginbalans"
                                              : "Overname vorig seizoen"}
                                          </td>
                                          <td className="py-2 text-xs font-bold text-blue-600 text-right">
                                            {formatCurrency(
                                              season.initialBalanceType ===
                                                "manual"
                                                ? season.initialBalanceAmount ||
                                                    0
                                                : data.seasons.find(
                                                      (s: Season) =>
                                                        s.id ===
                                                        season.carryoverSeasonId,
                                                    )
                                                  ? getSeasonTotalBalance(
                                                      data.seasons.find(
                                                        (s: Season) =>
                                                          s.id ===
                                                          season.carryoverSeasonId,
                                                      )!,
                                                    )
                                                  : 0,
                                            )}
                                          </td>
                                          <td className="py-2 text-right"></td>
                                        </tr>
                                      )}
                                      {manualTransactions.map((t) => (
                                        <tr key={t.id}>
                                          <td className="py-2 text-[10px] text-slate-400">
                                            {format(
                                              new Date(t.date),
                                              "dd-MM-yy",
                                            )}
                                          </td>
                                          <td className="py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {t.description}
                                          </td>
                                          <td
                                            className={cn(
                                              "py-2 text-xs font-bold text-right",
                                              t.amount >= 0
                                                ? "text-emerald-600"
                                                : "text-rose-600",
                                            )}
                                          >
                                            {formatCurrency(t.amount)}
                                          </td>
                                          <td className="py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                              <button
                                                onClick={() => {
                                                  setTransactionSeasonId(
                                                    season.id,
                                                  );
                                                  setEditingTransactionId(t.id);
                                                  setTransactionDescription(
                                                    t.description,
                                                  );
                                                  if (t.amount >= 0) {
                                                    setTransactionIncome(
                                                      t.amount.toString(),
                                                    );
                                                    setTransactionExpense("");
                                                  } else {
                                                    setTransactionExpense(
                                                      Math.abs(
                                                        t.amount,
                                                      ).toString(),
                                                    );
                                                    setTransactionIncome("");
                                                  }
                                                  setTransactionDate(t.date);
                                                  setIsTransactionModalOpen(
                                                    true,
                                                  );
                                                }}
                                                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                                title="Wijzigen"
                                              >
                                                <Settings size={14} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  showConfirm(
                                                    "Transactie Verwijderen",
                                                    "Weet je zeker dat je deze transactie wilt verwijderen?",
                                                    () =>
                                                      deleteTransaction(
                                                        season.id,
                                                        t.id,
                                                      ),
                                                  );
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                title="Verwijderen"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                      {manualTransactions.length === 0 &&
                                        !season.initialBalanceType && (
                                          <tr>
                                            <td
                                              colSpan={3}
                                              className="py-4 text-center text-xs text-slate-400 italic"
                                            >
                                              Geen handmatige transacties
                                            </td>
                                          </tr>
                                        )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {data.seasons.filter(
                      (s: Season) =>
                        s.clubId === activeClub.id && s.id === selectedSeasonId,
                    ).length === 0 && (
                      <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <CreditCard
                          size={48}
                          className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                        />
                        <p className="text-slate-500 dark:text-slate-400">
                          Selecteer een actief seizoen om het kasboek te
                          bekijken.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            {activeTab === "members" && activeClub && (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Leden van {activeClub.name}
                  </h2>
                  {isClubAdmin(activeClub, currentUser) && (
                    <button
                      onClick={() => setIsMemberModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <UserPlus size={20} />
                      <span>Nieuw Lid Toevoegen</span>
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="py-4 pl-6 text-left">Naam</th>
                        <th className="py-4 text-left">Rol</th>
                        <th className="py-4 text-left">Email</th>
                        <th className="py-4 text-left">Start Gemiddelde</th>
                        <th className="py-4 pr-6 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {(activeClub.memberIds || []).map((memberId) => {
                        const member = data.users.find(
                          (u: User) => u.id === memberId,
                        );
                        return (
                          <tr
                            key={memberId}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-4 pl-6">
                              <div className="flex flex-col">
                                <button
                                  onClick={() => {
                                    setSelectedProfileId(memberId);
                                    setActiveTab("profile");
                                  }}
                                  className="font-medium text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                                >
                                  {member?.shortName || member?.name}
                                </button>
                                {member?.shortName &&
                                  member?.name &&
                                  member.shortName !== member.name && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                      {member.name}
                                    </span>
                                  )}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                {member?.role === "admin" && (
                                  <div
                                    className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"
                                    title="Beheerder"
                                  >
                                    <ShieldCheck size={16} />
                                  </div>
                                )}
                                {member?.role === "planner" && (
                                  <div
                                    className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
                                    title="Planner"
                                  >
                                    <Calendar size={16} />
                                  </div>
                                )}
                                {member?.role === "member" && (
                                  <div
                                    className="p-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-lg"
                                    title="Speler"
                                  >
                                    <UserIcon size={16} />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400">
                              {member?.email}
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400">
                              {formatNumber(member?.baseAverage || 0)}
                            </td>
                            <td className="py-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedProfileId(memberId);
                                    setActiveTab("profile");
                                  }}
                                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                  title="Bekijk Profiel"
                                >
                                  <UserCircle size={18} />
                                </button>
                                {(isClubAdmin(activeClub, currentUser) ||
                                  currentUser.role === "admin" ||
                                  currentUser.role === "planner") &&
                                  member?.id !== currentUser.id && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingMemberId(member!.id);
                                          setNewMemberName(member!.name);
                                          setNewMemberShortName(
                                            member!.shortName || "",
                                          );
                                          setNewMemberEmail(member!.email);
                                          setNewMemberAvg(member!.baseAverage);
                                          setNewMemberRole(member!.role);
                                          setNewMemberParticipatesExternal(
                                            member!
                                              .participatesInExternalMatches ??
                                              false,
                                          );
                                          setIsMemberModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                        title="Wijzigen"
                                      >
                                        <Settings size={18} />
                                      </button>
                                      {member?.email && (
                                        <button
                                          onClick={() => sendInviteEmail(activeClub, member)}
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                          title="Stuur Uitnodiging"
                                        >
                                          <Mail size={18} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          removeMemberFromClub(
                                            activeClub.id,
                                            member!.id,
                                          )
                                        }
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                        title="Verwijderen"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "external-matches" && activeClub && (
              <motion.div
                key="external-matches"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                      Uit & Thuiswedstrijden
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                      Overzicht van wedstrijden tegen andere biljartclubs.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setShowBlockedExternalMatches(
                          !showBlockedExternalMatches,
                        )
                      }
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors shadow-sm",
                        showBlockedExternalMatches
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                      )}
                      title={
                        showBlockedExternalMatches
                          ? "Voltooide wedstrijden verbergen"
                          : "Voltooide wedstrijden tonen"
                      }
                    >
                      {showBlockedExternalMatches ? (
                        <Lock size={20} />
                      ) : (
                        <Unlock size={20} />
                      )}
                    </button>
                    {isClubAdmin(activeClub, currentUser) && (
                      <button
                        onClick={() => setIsHomeMatchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                      >
                        <Plus size={20} />
                        <span>Nieuwe Thuiswedstrijd</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {data.externalMatches &&
                  data.externalMatches
                    .filter(
                      (m: any) =>
                        m.homeClubId === activeClub.id ||
                        m.awayClubId === activeClub.id,
                    )
                    .filter((m: any) =>
                      showBlockedExternalMatches ? true : !m.isBlocked,
                    ).length > 0 ? (
                    data.externalMatches
                      .filter(
                        (m: any) =>
                          m.homeClubId === activeClub.id ||
                          m.awayClubId === activeClub.id,
                      )
                      .filter((m: any) =>
                        showBlockedExternalMatches ? true : !m.isBlocked,
                      )
                      .map((match: any) => {
                        const homeClub = data.clubs.find(
                          (c: Club) => c.id === match.homeClubId,
                        );
                        const awayClub = data.clubs.find(
                          (c: Club) => c.id === match.awayClubId,
                        );

                        let listExtHomePointsTotal = 0;
                        let listExtAwayPointsTotal = 0;
                        (match.games || []).forEach((g: any) => {
                          const p1 = data.users.find(
                            (u: User) => u.id === g.homePlayerId,
                          );
                          const p2 = data.users.find(
                            (u: User) => u.id === g.awayPlayerId,
                          );
                          const gHomeTarget =
                            g.homeTarget ?? p1?.baseAverage ?? 1;
                          const gAwayTarget =
                            g.awayTarget ?? p2?.baseAverage ?? 1;
                          let gHomeScore = 0;
                          let gAwayScore = 0;
                          if (g.status === "finished") {
                            gHomeScore = g.homeScore || 0;
                            gAwayScore = g.awayScore || 0;
                          } else if (g.status === "started" && g.turns) {
                            if (g.id === liveMatchId) {
                              gHomeScore =
                                (g.turns?.reduce(
                                  (sum: number, t: any, i: number) =>
                                    sum +
                                    (i === activeTurnIndex
                                      ? 0
                                      : t.player1 || 0),
                                  0,
                                ) || 0) + currentTurnP1;
                              gAwayScore =
                                (g.turns?.reduce(
                                  (sum: number, t: any, i: number) =>
                                    sum +
                                    (i === activeTurnIndex
                                      ? 0
                                      : t.player2 || 0),
                                  0,
                                ) || 0) + currentTurnP2;
                            } else {
                              gHomeScore =
                                g.turns?.reduce(
                                  (sum: number, t: any) =>
                                    sum + (t.player1 || 0),
                                  0,
                                ) || 0;
                              gAwayScore =
                                g.turns?.reduce(
                                  (sum: number, t: any) =>
                                    sum + (t.player2 || 0),
                                  0,
                                ) || 0;
                            }
                          }
                          if (
                            g.status === "finished" ||
                            g.status === "started"
                          ) {
                            listExtHomePointsTotal += calculatePoints(
                              gHomeScore,
                              gHomeTarget,
                              gAwayScore,
                              gAwayTarget,
                              match.scoringSystem,
                            );
                            listExtAwayPointsTotal += calculatePoints(
                              gAwayScore,
                              gAwayTarget,
                              gHomeScore,
                              gHomeTarget,
                              match.scoringSystem,
                            );
                          }
                        });
                        const pGames = (match.games || []).filter(
                          (g: any) =>
                            g.status === "planned" || g.status === "started",
                        );
                        const fGames = (match.games || []).filter(
                          (g: any) => g.status === "finished",
                        );

                        return (
                          <div
                            key={match.id}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative"
                          >
                            {match.isBlocked && (
                              <div className="absolute top-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                                  <Lock size={14} />
                                  Voltooid
                                </span>
                              </div>
                            )}
                            <div className="p-4 md:p-6">
                              <div className="flex flex-col items-center relative w-full">
                                <div className="absolute top-0 w-full text-center pointer-events-none -mt-1 md:-mt-2">
                                  <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                                    {format(
                                      new Date(match.date),
                                      "EEEE d MMMM yyyy",
                                      { locale: nl },
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-start justify-between w-full mt-8 md:mt-10 mb-1">
                                  <div className="flex items-start gap-2 flex-1 justify-start">
                                    <h3 className="text-base md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-left mt-1">
                                      {homeClub?.name}
                                    </h3>
                                    <span className="text-emerald-500 font-black text-base md:text-xl ml-1 mt-1">
                                      ({listExtHomePointsTotal})
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-center gap-1 md:gap-2 px-1 md:px-4 shrink-0 text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-2">
                                    Gespeeld: {fGames.length} &nbsp;&bull;&nbsp;
                                    Resterend: {pGames.length}
                                  </div>

                                  <div className="flex flex-col items-end gap-2 flex-1 justify-end">
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-base md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-right">
                                        {awayClub?.name}
                                      </h3>
                                      <span className="text-amber-500 font-black text-base md:text-xl ml-1">
                                        ({listExtAwayPointsTotal})
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedExternalMatchId(
                                          selectedExternalMatchId === match.id
                                            ? null
                                            : match.id,
                                        );
                                        setSelectedSeasonId(null);
                                      }}
                                      className={cn(
                                        "px-3 py-1 md:px-4 md:py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-bold border",
                                        selectedExternalMatchId === match.id
                                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                          : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
                                      )}
                                    >
                                      {selectedExternalMatchId === match.id
                                        ? "Dichtvouwen"
                                        : "Details & Stand"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {selectedExternalMatchId === match.id && (
                              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Partijen ({(match.games || []).length})
                                  </h4>
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        setActiveShareDropdown(
                                          activeShareDropdown === match.id
                                            ? null
                                            : match.id,
                                        )
                                      }
                                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors exclude-from-share"
                                      title="Delen"
                                    >
                                      <Share2 size={20} />
                                    </button>
                                    {activeShareDropdown === match.id && (
                                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button
                                          onClick={() => {
                                            setActiveShareDropdown(null);
                                            setTimeout(
                                              () => exportExtMatch(match.id),
                                              100,
                                            );
                                          }}
                                          className="px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                        >
                                          Exporteren als JPG
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActiveShareDropdown(null);
                                            setCastMenuTarget({
                                              type: "extMatch",
                                              id: match.id,
                                            });
                                          }}
                                          className="px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                        >
                                          Cast Menu
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div
                                  ref={(el) =>
                                    (extMatchRefs.current[match.id] = el)
                                  }
                                  className="overflow-x-auto bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] rounded-2xl shadow-sm border border-[#2b6e2b]"
                                >
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                        <th className="py-4 pl-4 pr-4 text-left border-r border-[#2b6e2b]/30">
                                          Speler (Thuis)
                                        </th>
                                        <th
                                          className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                          title="Inleg (Thuis)"
                                        >
                                          Inleg
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                          Hoogste Serie
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                          Gemiddelde
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                          Caramboles
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20">
                                          Punten
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20">
                                          Punten
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                          Caramboles
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                          Gemiddelde
                                        </th>
                                        <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                          Hoogste Serie
                                        </th>
                                        <th
                                          className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                          title="Inleg (Uit)"
                                        >
                                          Inleg
                                        </th>
                                        <th className="py-4 pl-4 pr-4 text-right border-r border-[#2b6e2b]/30">
                                          Speler (Uit)
                                        </th>
                                        <th className="py-4 px-4 text-center exclude-from-share">
                                          Actie
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(() => {
                                        let maxPoints =
                                          match.scoringSystem === "driebanden"
                                            ? 2
                                            : 12;
                                        let maxCar = 1;
                                        let maxAvg = 0.1;
                                        let maxHighest = 1;

                                        (match.games || []).forEach(
                                          (game: any) => {
                                            const isFinished =
                                              game.status === "finished";
                                            const isStarted =
                                              game.status === "started";
                                            const p1TurnTotal =
                                              game.turns?.reduce(
                                                (acc: number, t: any) =>
                                                  acc + (t.player1 || 0),
                                                0,
                                              ) || 0;
                                            const p2TurnTotal =
                                              game.turns?.reduce(
                                                (acc: number, t: any) =>
                                                  acc + (t.player2 || 0),
                                                0,
                                              ) || 0;
                                            const myClubIsHome =
                                              activeClub?.id ===
                                              match.homeClubId;
                                            const computedHomeTurnTotal =
                                              myClubIsHome
                                                ? p1TurnTotal
                                                : p2TurnTotal;
                                            const computedAwayTurnTotal =
                                              myClubIsHome
                                                ? p2TurnTotal
                                                : p1TurnTotal;

                                            const homeScore = isFinished
                                              ? game.homeScore || 0
                                              : isStarted
                                                ? computedHomeTurnTotal
                                                : game.homeScore || 0;
                                            const awayScore = isFinished
                                              ? game.awayScore || 0
                                              : isStarted
                                                ? computedAwayTurnTotal
                                                : game.awayScore || 0;
                                            maxCar = Math.max(
                                              maxCar,
                                              homeScore,
                                              awayScore,
                                            );

                                            const homeAvg =
                                              game.turns?.length > 0
                                                ? homeScore /
                                                  (game.turns || []).length
                                                : 0;
                                            const awayAvg =
                                              game.turns?.length > 0
                                                ? awayScore /
                                                  (game.turns || []).length
                                                : 0;
                                            maxAvg = Math.max(
                                              maxAvg,
                                              homeAvg,
                                              awayAvg,
                                            );

                                            const p1H =
                                              game.turns &&
                                              (game.turns || []).length > 0
                                                ? Math.max(
                                                    ...(game.turns || []).map(
                                                      (t: any) =>
                                                        t.player1 || 0,
                                                    ),
                                                  )
                                                : 0;
                                            const p2H =
                                              game.turns &&
                                              (game.turns || []).length > 0
                                                ? Math.max(
                                                    ...(game.turns || []).map(
                                                      (t: any) =>
                                                        t.player2 || 0,
                                                    ),
                                                  )
                                                : 0;
                                            maxHighest = Math.max(
                                              maxHighest,
                                              p1H,
                                              p2H,
                                            );
                                          },
                                        );

                                        return (match.games || []).map(
                                          (game: any, idx: number) => {
                                            const p1 = data.users.find(
                                              (u: User) =>
                                                u.id === game.homePlayerId,
                                            );
                                            const p2 = data.users.find(
                                              (u: User) =>
                                                u.id === game.awayPlayerId,
                                            );
                                            const myClubIsHome =
                                              activeClub?.id ===
                                              match.homeClubId;

                                            const isFinished =
                                              game.status === "finished";
                                            const isStarted =
                                              game.status === "started";

                                            const p1TurnTotal =
                                              game.turns?.reduce(
                                                (acc: number, t: any) =>
                                                  acc + (t.player1 || 0),
                                                0,
                                              ) || 0;
                                            const p2TurnTotal =
                                              game.turns?.reduce(
                                                (acc: number, t: any) =>
                                                  acc + (t.player2 || 0),
                                                0,
                                              ) || 0;
                                            const p1HighestInfo =
                                              game.turns &&
                                              (game.turns || []).length > 0
                                                ? Math.max(
                                                    ...(game.turns || []).map(
                                                      (t: any) =>
                                                        t.player1 || 0,
                                                    ),
                                                  )
                                                : 0;
                                            const p2HighestInfo =
                                              game.turns &&
                                              (game.turns || []).length > 0
                                                ? Math.max(
                                                    ...(game.turns || []).map(
                                                      (t: any) =>
                                                        t.player2 || 0,
                                                    ),
                                                  )
                                                : 0;

                                            const computedHomeTurnTotal =
                                              myClubIsHome
                                                ? p1TurnTotal
                                                : p2TurnTotal;
                                            const computedAwayTurnTotal =
                                              myClubIsHome
                                                ? p2TurnTotal
                                                : p1TurnTotal;
                                            const computedHomeHighest =
                                              myClubIsHome
                                                ? p1HighestInfo
                                                : p2HighestInfo;
                                            const computedAwayHighest =
                                              myClubIsHome
                                                ? p2HighestInfo
                                                : p1HighestInfo;

                                            const homeScore = isFinished
                                              ? game.homeScore || 0
                                              : isStarted
                                                ? computedHomeTurnTotal
                                                : game.homeScore || 0;
                                            const awayScore = isFinished
                                              ? game.awayScore || 0
                                              : isStarted
                                                ? computedAwayTurnTotal
                                                : game.awayScore || 0;
                                            const homeAvg =
                                              game.turns?.length > 0
                                                ? homeScore /
                                                  (game.turns || []).length
                                                : 0;
                                            const awayAvg =
                                              game.turns?.length > 0
                                                ? awayScore /
                                                  (game.turns || []).length
                                                : 0;

                                            const homeTargetForCalc =
                                              game.homeTarget ??
                                              (myClubIsHome
                                                ? (p1?.baseAverage ?? 1)
                                                : (p2?.baseAverage ?? 1));
                                            const awayTargetForCalc =
                                              game.awayTarget ??
                                              (myClubIsHome
                                                ? (p2?.baseAverage ?? 1)
                                                : (p1?.baseAverage ?? 1));

                                            let displayHomePoints:
                                              number | string = "-";
                                            let displayAwayPoints:
                                              number | string = "-";
                                            if (isFinished || isStarted) {
                                              displayHomePoints =
                                                calculatePoints(
                                                  homeScore,
                                                  homeTargetForCalc,
                                                  awayScore,
                                                  awayTargetForCalc,
                                                  match.scoringSystem,
                                                );
                                              displayAwayPoints =
                                                calculatePoints(
                                                  awayScore,
                                                  awayTargetForCalc,
                                                  homeScore,
                                                  homeTargetForCalc,
                                                  match.scoringSystem,
                                                );
                                            }

                                            return (
                                              <tr
                                                key={game.id}
                                                className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0"
                                              >
                                                <td className="py-2 pl-4 pr-4 border-r border-[#2b6e2b]/30 text-left">
                                                  <div className="flex items-center">
                                                    <p
                                                      className="font-bold text-white truncate text-base inline-block mr-2"
                                                      title={
                                                        p1?.name || "Onbekend"
                                                      }
                                                    >
                                                      {p1?.shortName ||
                                                        p1?.name ||
                                                        "Onbekend"}
                                                    </p>
                                                    <span className="text-[12px] text-emerald-300 font-bold tracking-widest inline-block opacity-80">
                                                      (
                                                      {formatNumber(
                                                        homeTargetForCalc,
                                                      )}
                                                      )
                                                    </span>
                                                  </div>
                                                </td>

                                                <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                  {isClubAdmin(activeClub, currentUser) ||
                                                  currentUser.role ===
                                                    "admin" ||
                                                  currentUser.role ===
                                                    "planner" ? (
                                                    <button
                                                      onClick={() =>
                                                        toggleExternalMatchPayment(
                                                          match.id,
                                                          game.id,
                                                          myClubIsHome
                                                            ? true
                                                            : false,
                                                        )
                                                      }
                                                      className={cn(
                                                        "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                        game[
                                                          myClubIsHome
                                                            ? "homePlayerPaid"
                                                            : "awayPlayerPaid"
                                                        ]
                                                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                                          : "bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/40",
                                                      )}
                                                      title={`Inleg: ${game[myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                    >
                                                      <Banknote size={10} />
                                                    </button>
                                                  ) : (
                                                    <div
                                                      className={cn(
                                                        "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                        game[
                                                          myClubIsHome
                                                            ? "homePlayerPaid"
                                                            : "awayPlayerPaid"
                                                        ]
                                                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 opacity-60"
                                                          : "bg-rose-500/20 text-rose-400 border-rose-500 opacity-60",
                                                      )}
                                                      title={`Inleg: ${game[myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                    >
                                                      <Banknote size={10} />
                                                    </div>
                                                  )}
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-white/50">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${(computedHomeHighest / maxHighest) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10">
                                                    {game.turns?.length > 0 ? (
                                                      <span className="font-bold text-white">
                                                        {computedHomeHighest}
                                                      </span>
                                                    ) : (
                                                      "-"
                                                    )}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-[#f1c40f]">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${(homeAvg / maxAvg) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10">
                                                    {game.turns?.length > 0 ? (
                                                      <span className="font-bold">
                                                        {homeAvg.toFixed(3)}
                                                      </span>
                                                    ) : (
                                                      "-"
                                                    )}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${(homeScore / maxCar) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10 font-black text-white text-xl">
                                                    {isStarted || isFinished
                                                      ? homeScore || 0
                                                      : "-"}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 overflow-hidden">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${((typeof displayHomePoints === "number" ? displayHomePoints : 0) / maxPoints) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10 font-black text-[#f1c40f] text-xl">
                                                    {displayHomePoints}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 overflow-hidden">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${((typeof displayAwayPoints === "number" ? displayAwayPoints : 0) / maxPoints) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10 font-black text-[#f1c40f] text-xl">
                                                    {displayAwayPoints}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${(awayScore / maxCar) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10 font-black text-white text-xl">
                                                    {isStarted || isFinished
                                                      ? awayScore || 0
                                                      : "-"}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-[#f1c40f]">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${(awayAvg / maxAvg) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10">
                                                    {game.turns?.length > 0 ? (
                                                      <span className="font-bold">
                                                        {awayAvg.toFixed(3)}
                                                      </span>
                                                    ) : (
                                                      "-"
                                                    )}
                                                  </span>
                                                </td>

                                                <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-white/50">
                                                  <div
                                                    className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                    style={{
                                                      width: `${(computedAwayHighest / maxHighest) * 100}%`,
                                                    }}
                                                  />
                                                  <span className="relative z-10">
                                                    {game.turns?.length > 0 ? (
                                                      <span className="font-bold text-white">
                                                        {computedAwayHighest}
                                                      </span>
                                                    ) : (
                                                      "-"
                                                    )}
                                                  </span>
                                                </td>

                                                <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                  {isClubAdmin(activeClub, currentUser) ||
                                                  currentUser.role ===
                                                    "admin" ||
                                                  currentUser.role ===
                                                    "planner" ? (
                                                    <button
                                                      onClick={() =>
                                                        toggleExternalMatchPayment(
                                                          match.id,
                                                          game.id,
                                                          !myClubIsHome,
                                                        )
                                                      }
                                                      className={cn(
                                                        "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                        game[
                                                          !myClubIsHome
                                                            ? "homePlayerPaid"
                                                            : "awayPlayerPaid"
                                                        ]
                                                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                                          : "bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/40",
                                                      )}
                                                      title={`Inleg: ${game[!myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                    >
                                                      <Banknote size={10} />
                                                    </button>
                                                  ) : (
                                                    <div
                                                      className={cn(
                                                        "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                        game[
                                                          !myClubIsHome
                                                            ? "homePlayerPaid"
                                                            : "awayPlayerPaid"
                                                        ]
                                                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 opacity-60"
                                                          : "bg-rose-500/20 text-rose-400 border-rose-500 opacity-60",
                                                      )}
                                                      title={`Inleg: ${game[!myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                    >
                                                      <Banknote size={10} />
                                                    </div>
                                                  )}
                                                </td>

                                                <td className="py-2 pl-4 pr-4 border-r border-[#2b6e2b]/30 text-right">
                                                  <div className="flex items-center justify-end">
                                                    <span className="text-[12px] text-emerald-300 font-bold tracking-widest inline-block mr-2 opacity-80">
                                                      (
                                                      {formatNumber(
                                                        game.awayTarget ??
                                                          p2?.baseAverage ??
                                                          0,
                                                      )}
                                                      )
                                                    </span>
                                                    <p
                                                      className="font-bold text-white truncate text-base inline-block"
                                                      title={
                                                        p2?.name || "Onbekend"
                                                      }
                                                    >
                                                      {p2?.shortName ||
                                                        p2?.name ||
                                                        "Onbekend"}
                                                    </p>
                                                  </div>
                                                </td>

                                                <td className="py-2 px-4 text-center exclude-from-share">
                                                  <div className="flex items-center justify-center">
                                                    {isFinished && (
                                                      <button
                                                        onClick={() =>
                                                          setLiveMatchId(
                                                            game.id,
                                                          )
                                                        }
                                                        className="w-8 h-8 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center shadow-lg shadow-blue-500/20"
                                                        title="Details"
                                                      >
                                                        <Search size={14} />
                                                      </button>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          },
                                        );
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                                {isClubAdmin(activeClub, currentUser) && (
                                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <button
                                      onClick={() =>
                                        toggleBlockExternalMatch(match.id)
                                      }
                                      className={cn(
                                        "px-4 py-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2 border",
                                        match.isBlocked
                                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
                                      )}
                                    >
                                      {match.isBlocked ? (
                                        <Unlock size={16} />
                                      ) : (
                                        <Lock size={16} />
                                      )}
                                      {match.isBlocked
                                        ? "Uit & Thuis voltooid ongedaan maken"
                                        : "Uit & Thuis voltooid"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setExternalMatchToDeleteId(match.id);
                                        setIsDeleteExternalMatchModalOpen(true);
                                      }}
                                      className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-bold flex items-center gap-2"
                                    >
                                      <Trash2 size={16} />
                                      Uit & Thuis verwijderen
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                      <Trophy
                        size={48}
                        className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                      />
                      <p className="text-slate-500 dark:text-slate-400">
                        Er zijn nog geen uit- of thuiswedstrijden ingepland.
                      </p>
                      {isClubAdmin(activeClub, currentUser) && (
                        <button
                          onClick={() => setIsHomeMatchModalOpen(true)}
                          className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          Klik op 'Nieuwe Thuiswedstrijd' hierboven om te
                          beginnen.
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && selectedProfileId && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {(() => {
                  const profileUser = data.users.find(
                    (u: User) => u.id === selectedProfileId,
                  );
                  if (!profileUser) return null;

                  const userMatches = data.matches.filter(
                    (m: Match) =>
                      m.player1Id === selectedProfileId ||
                      m.player2Id === selectedProfileId,
                  );
                  const finishedMatches = userMatches.filter(
                    (m: Match) => m.status === "finished",
                  );

                  const totalCaramboles = finishedMatches.reduce(
                    (acc: number, m: Match) => {
                      const isP1 = m.player1Id === selectedProfileId;
                      return (
                        acc +
                        (m.turns || []).reduce(
                          (tAcc: number, t: any) =>
                            tAcc + (isP1 ? t.player1 : t.player2),
                          0,
                        )
                      );
                    },
                    0,
                  );

                  const highestSerie = Math.max(
                    0,
                    ...finishedMatches.flatMap((m: Match) => {
                      const isP1 = m.player1Id === selectedProfileId;
                      return (m.turns || []).map((t: any) =>
                        isP1 ? t.player1 : t.player2,
                      );
                    }),
                  );

                  const totalPoints = finishedMatches.reduce(
                    (acc: number, m: Match) => {
                      const isP1 = m.player1Id === selectedProfileId;
                      const made = (m.turns || []).reduce(
                        (tAcc: number, t: any) =>
                          tAcc + (isP1 ? t.player1 : t.player2),
                        0,
                      );
                      const target = isP1
                        ? m.player1AvgBefore
                        : m.player2AvgBefore;
                      const opponentMade = isP1
                        ? (m.turns || []).reduce(
                            (tAcc: number, t: any) => tAcc + t.player2,
                            0,
                          )
                        : (m.turns || []).reduce(
                            (tAcc: number, t: any) => tAcc + t.player1,
                            0,
                          );
                      const opponentTarget = isP1
                        ? m.player2AvgBefore
                        : m.player1AvgBefore;
                      const season = data.seasons.find(
                        (s: Season) => s.id === m.seasonId,
                      );
                      return (
                        acc +
                        calculatePoints(
                          made,
                          target,
                          opponentMade,
                          opponentTarget,
                          season?.scoringSystem,
                        )
                      );
                    },
                    0,
                  );

                  const avgPoints =
                    finishedMatches.length > 0
                      ? formatDecimal(totalPoints / finishedMatches.length, 2)
                      : formatDecimal(0, 2);
                  const totalTurns = finishedMatches.reduce(
                    (acc, m) => acc + (m.turns || []).length,
                    0,
                  );
                  const actualAverage =
                    totalTurns > 0
                      ? formatDecimal(totalCaramboles / totalTurns, 3)
                      : formatDecimal(0, 3);
                  const avgCarambolesPerMatch =
                    finishedMatches.length > 0
                      ? formatDecimal(
                          totalCaramboles / finishedMatches.length,
                          1,
                        )
                      : formatDecimal(0, 1);
                  const avgTurnsPerMatch =
                    finishedMatches.length > 0
                      ? formatDecimal(totalTurns / finishedMatches.length, 1)
                      : formatDecimal(0, 1);

                  // Timeline Data
                  const timelineData = finishedMatches
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                    )
                    .reduce((acc: any[], match, index) => {
                      const isP1 = match.player1Id === selectedProfileId;
                      const caramboles = (match.turns || []).reduce(
                        (tAcc: number, t: any) =>
                          tAcc + (isP1 ? t.player1 : t.player2),
                        0,
                      );
                      const turns = (match.turns || []).length;

                      const prevTotalCaramboles =
                        index > 0 ? acc[index - 1].totalCaramboles : 0;
                      const prevTotalTurns =
                        index > 0 ? acc[index - 1].totalTurns : 0;

                      const currentTotalCaramboles =
                        prevTotalCaramboles + caramboles;
                      const currentTotalTurns = prevTotalTurns + turns;
                      const currentAverage =
                        currentTotalTurns > 0
                          ? currentTotalCaramboles / currentTotalTurns
                          : 0;

                      acc.push({
                        date: format(new Date(match.date), "dd MMM"),
                        average: currentAverage,
                        totalCaramboles: currentTotalCaramboles,
                        totalTurns: currentTotalTurns,
                      });
                      return acc;
                    }, []);

                  const arbitratedMatches = data.matches.filter(
                    (m: Match) =>
                      m.arbiterId === selectedProfileId &&
                      m.status === "finished",
                  );
                  const writtenMatches = data.matches.filter(
                    (m: Match) =>
                      m.writerId === selectedProfileId &&
                      m.status === "finished",
                  );

                  // Achievements
                  const achievements = [
                    {
                      id: "first_match",
                      title: "Eerste Wedstrijd",
                      icon: <Play size={16} />,
                      earned: finishedMatches.length > 0,
                    },
                    {
                      id: "high_serie",
                      title: "Serie van 10+",
                      icon: <TrendingUp size={16} />,
                      earned: highestSerie >= 10,
                    },
                    {
                      id: "winner",
                      title: "Winnaar",
                      icon: <Trophy size={16} />,
                      earned: finishedMatches.some((m) => {
                        const isP1 = m.player1Id === selectedProfileId;
                        const p1Total = (m.turns || []).reduce(
                          (acc, t) => acc + t.player1,
                          0,
                        );
                        const p2Total = (m.turns || []).reduce(
                          (acc, t) => acc + t.player2,
                          0,
                        );
                        return isP1 ? p1Total > p2Total : p2Total > p1Total;
                      }),
                    },
                    {
                      id: "veteran",
                      title: "Veteraan (10+ wedstrijden)",
                      icon: <History size={16} />,
                      earned: finishedMatches.length >= 10,
                    },
                    {
                      id: "arbiter_pro",
                      title: "Arbiter (10+ wedstrijden)",
                      icon: <ShieldCheck size={16} />,
                      earned: arbitratedMatches.length >= 10,
                    },
                    {
                      id: "writer_pro",
                      title: "Schrijver (10+ wedstrijden)",
                      icon: <UserCircle size={16} />,
                      earned: writtenMatches.length >= 10,
                    },
                  ];

                  return (
                    <>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveTab("members")}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                        >
                          <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                          Spelersprofiel
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1 space-y-6">
                          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                            <div className="relative inline-block mb-4">
                              {profileUser.avatar ? (
                                <img
                                  src={profileUser.avatar}
                                  alt={profileUser.name}
                                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-slate-100 dark:border-slate-800">
                                  <UserCircle size={64} />
                                </div>
                              )}
                              <div className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg">
                                <Trophy size={16} />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                              {profileUser.shortName || profileUser.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                              {profileUser.email}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-6">
                              {profileUser.role}
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">
                                Clubs
                              </h4>
                              <div className="space-y-2">
                                {data.clubs
                                  .filter((c: Club) =>
                                    (c.memberIds || []).includes(
                                      selectedProfileId,
                                    ),
                                  )
                                  .map((club: Club) => (
                                    <div
                                      key={club.id}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                    >
                                      <div className="w-6 h-6 rounded bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                        {club.logo ? (
                                          <img
                                            src={club.logo}
                                            alt={club.name}
                                            className="w-full h-full object-contain"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <ImageIcon
                                            size={12}
                                            className="text-slate-300"
                                          />
                                        )}
                                      </div>
                                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {club.name}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                              <Trophy size={18} className="text-amber-500" />
                              Prestaties
                            </h4>
                            <div className="space-y-3">
                              {achievements.map((achievement) => (
                                <div
                                  key={achievement.id}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    achievement.earned
                                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/50 text-slate-400 grayscale opacity-50",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "p-2 rounded-lg",
                                      achievement.earned
                                        ? "bg-white dark:bg-slate-800 shadow-sm"
                                        : "bg-slate-200 dark:bg-slate-700",
                                    )}
                                  >
                                    {achievement.icon}
                                  </div>
                                  <span className="text-xs font-bold">
                                    {achievement.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Stats & History */}
                        <div className="lg:col-span-2 space-y-8">
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Start Gem.
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {profileUser.baseAverage}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Actueel Gem.
                              </p>
                              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {actualAverage}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Gespeeld
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {finishedMatches.length}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Caramboles
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {totalCaramboles}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Gem. Car.
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {avgCarambolesPerMatch}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Gem. Beurten
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {avgTurnsPerMatch}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Hoogste Serie
                              </p>
                              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {highestSerie}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                Gem. Punten
                              </p>
                              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {avgPoints}
                              </p>
                            </div>
                          </div>

                          {/* Timeline Chart */}
                          {timelineData.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                  <TrendingUp
                                    size={18}
                                    className="text-emerald-500"
                                  />
                                  Gemiddelde Tijdlijn
                                </h4>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Laatste {timelineData.length} wedstrijden
                                </div>
                              </div>
                              <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={timelineData}>
                                    <defs>
                                      <linearGradient
                                        id="colorAvg"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                      >
                                        <stop
                                          offset="5%"
                                          stopColor="#10b981"
                                          stopOpacity={0.3}
                                        />
                                        <stop
                                          offset="95%"
                                          stopColor="#10b981"
                                          stopOpacity={0}
                                        />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      vertical={false}
                                      stroke="#f1f5f9"
                                    />
                                    <XAxis
                                      dataKey="date"
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                                      dy={10}
                                    />
                                    <YAxis
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                                      domain={["auto", "auto"]}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "none",
                                        borderRadius: "12px",
                                        boxShadow:
                                          "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                      }}
                                      itemStyle={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                      }}
                                      labelStyle={{
                                        fontSize: "10px",
                                        color: "#94a3b8",
                                        marginBottom: "4px",
                                      }}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="average"
                                      stroke="#10b981"
                                      strokeWidth={3}
                                      fillOpacity={1}
                                      fill="url(#colorAvg)"
                                      name="Gemiddelde"
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                  <History
                                    size={18}
                                    className="text-slate-400"
                                  />
                                  Wedstrijdhistorie
                                </h4>
                              </div>

                              <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                  <Building2
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={16}
                                  />
                                  <select
                                    value={historyClubFilter}
                                    onChange={(e) =>
                                      setHistoryClubFilter(e.target.value)
                                    }
                                    className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                  >
                                    <option value="">Alle Clubs</option>
                                    {Array.from(
                                      new Set(
                                        data.clubs.map((c: Club) => c.id),
                                      ),
                                    ).map((clubId) => {
                                      const club = data.clubs.find(
                                        (c: Club) => c.id === clubId,
                                      );
                                      return (
                                        <option key={clubId} value={clubId}>
                                          {club?.name}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  {historyClubFilter && (
                                    <button
                                      onClick={() => setHistoryClubFilter("")}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  )}
                                </div>

                                <div className="relative">
                                  <Calendar
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={16}
                                  />
                                  <input
                                    type="date"
                                    value={historyDateFilter}
                                    onChange={(e) =>
                                      setHistoryDateFilter(e.target.value)
                                    }
                                    className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                  />
                                  {historyDateFilter && (
                                    <button
                                      onClick={() => setHistoryDateFilter("")}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  )}
                                </div>

                                <div className="relative">
                                  <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={16}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Tegenstander..."
                                    value={historyOpponentFilter}
                                    onChange={(e) =>
                                      setHistoryOpponentFilter(e.target.value)
                                    }
                                    className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                  />
                                  {historyOpponentFilter && (
                                    <button
                                      onClick={() =>
                                        setHistoryOpponentFilter("")
                                      }
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              {(() => {
                                const filteredMatches = finishedMatches
                                  .filter((match) => {
                                    const season = data.seasons.find(
                                      (s: Season) => s.id === match.seasonId,
                                    );
                                    const isP1 =
                                      match.player1Id === selectedProfileId;
                                    const opponent = data.users.find(
                                      (u: User) =>
                                        u.id ===
                                        (isP1
                                          ? match.player2Id
                                          : match.player1Id),
                                    );

                                    if (
                                      historyClubFilter &&
                                      season?.clubId !== historyClubFilter
                                    )
                                      return false;
                                    if (
                                      historyDateFilter &&
                                      !isSameDay(
                                        new Date(match.date),
                                        new Date(historyDateFilter),
                                      )
                                    )
                                      return false;
                                    if (
                                      historyOpponentFilter &&
                                      !opponent?.shortName
                                        ?.toLowerCase()
                                        .includes(
                                          historyOpponentFilter.toLowerCase(),
                                        ) &&
                                      !opponent?.name
                                        ?.toLowerCase()
                                        .includes(
                                          historyOpponentFilter.toLowerCase(),
                                        )
                                    )
                                      return false;

                                    return true;
                                  })
                                  .sort(
                                    (a, b) =>
                                      new Date(b.date).getTime() -
                                      new Date(a.date).getTime(),
                                  );

                                const totalPoints = filteredMatches.reduce(
                                  (acc, match) => {
                                    const isP1 =
                                      match.player1Id === selectedProfileId;
                                    const myScore = (match.turns || []).reduce(
                                      (tAcc, t) =>
                                        tAcc + (isP1 ? t.player1 : t.player2),
                                      0,
                                    );
                                    const myTarget = isP1
                                      ? match.player1AvgBefore
                                      : match.player2AvgBefore;
                                    const oppScore = (match.turns || []).reduce(
                                      (tAcc, t) =>
                                        tAcc + (isP1 ? t.player2 : t.player1),
                                      0,
                                    );
                                    const oppTarget = isP1
                                      ? match.player2AvgBefore
                                      : match.player1AvgBefore;
                                    const season = data.seasons.find(
                                      (s: Season) => s.id === match.seasonId,
                                    );
                                    return (
                                      acc +
                                      calculatePoints(
                                        myScore,
                                        myTarget,
                                        oppScore,
                                        oppTarget,
                                        season?.scoringSystem,
                                      )
                                    );
                                  },
                                  0,
                                );

                                return (
                                  <>
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                          <th className="py-4 pl-6">Datum</th>
                                          <th className="py-4">Club</th>
                                          <th className="py-4">Tegenstander</th>
                                          <th className="py-4 text-center">
                                            Uitslag
                                          </th>
                                          <th className="py-4 text-center">
                                            Punten
                                          </th>
                                          <th className="py-4 pr-6 text-right">
                                            Details
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {filteredMatches.map((match) => {
                                          const isP1 =
                                            match.player1Id ===
                                            selectedProfileId;
                                          const opponent = data.users.find(
                                            (u: User) =>
                                              u.id ===
                                              (isP1
                                                ? match.player2Id
                                                : match.player1Id),
                                          );
                                          const season = data.seasons.find(
                                            (s: Season) =>
                                              s.id === match.seasonId,
                                          );
                                          const club = data.clubs.find(
                                            (c: Club) =>
                                              c.id === season?.clubId,
                                          );
                                          const myScore = (
                                            match.turns || []
                                          ).reduce(
                                            (acc, t) =>
                                              acc +
                                              (isP1 ? t.player1 : t.player2),
                                            0,
                                          );
                                          const oppScore = (
                                            match.turns || []
                                          ).reduce(
                                            (acc, t) =>
                                              acc +
                                              (isP1 ? t.player2 : t.player1),
                                            0,
                                          );
                                          const myTarget = isP1
                                            ? match.player1AvgBefore
                                            : match.player2AvgBefore;
                                          const oppTarget = isP1
                                            ? match.player2AvgBefore
                                            : match.player1AvgBefore;
                                          const myPoints = calculatePoints(
                                            myScore,
                                            myTarget,
                                            oppScore,
                                            oppTarget,
                                            season?.scoringSystem,
                                          );

                                          return (
                                            <tr
                                              key={match.id}
                                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                              <td className="py-4 pl-6 text-xs text-slate-500 dark:text-slate-400">
                                                {format(
                                                  new Date(match.date),
                                                  "dd MMM yyyy",
                                                  { locale: nl },
                                                )}
                                              </td>
                                              <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                  <Building2
                                                    size={14}
                                                    className="text-slate-300"
                                                  />
                                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    {club?.name || "Onbekend"}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    {
                                                      (opponent?.shortName ||
                                                        opponent?.name ||
                                                        "?")[0]
                                                    }
                                                  </div>
                                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                                    {opponent?.shortName ||
                                                      opponent?.name}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="py-4 text-center">
                                                <span
                                                  className={cn(
                                                    "text-sm font-black",
                                                    myScore > oppScore
                                                      ? "text-emerald-600 dark:text-emerald-400"
                                                      : "text-slate-400",
                                                  )}
                                                >
                                                  {myScore} - {oppScore}
                                                </span>
                                              </td>
                                              <td className="py-4 text-center">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                  {myPoints} pnt
                                                </span>
                                              </td>
                                              <td className="py-4 pr-6 text-right">
                                                <button
                                                  onClick={() => {
                                                    setSelectedMatchIdForDetail(
                                                      match.id,
                                                    );
                                                    setIsMatchDetailModalOpen(
                                                      true,
                                                    );
                                                  }}
                                                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                >
                                                  <History size={16} />
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                      {filteredMatches.length > 0 && (
                                        <tfoot>
                                          <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold border-t border-slate-100 dark:border-slate-800">
                                            <td
                                              colSpan={4}
                                              className="py-4 pl-6 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                                            >
                                              Totaal{" "}
                                              {historyClubFilter ||
                                              historyDateFilter ||
                                              historyOpponentFilter
                                                ? "(gefilterd)"
                                                : ""}
                                            </td>
                                            <td className="py-4 text-center">
                                              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black">
                                                {totalPoints} pnt
                                              </span>
                                            </td>
                                            <td className="py-4 pr-6"></td>
                                          </tr>
                                        </tfoot>
                                      )}
                                    </table>
                                    {filteredMatches.length === 0 && (
                                      <div className="py-12 text-center">
                                        <History
                                          size={48}
                                          className="mx-auto text-slate-200 dark:text-slate-800 mb-4"
                                        />
                                        <p className="text-slate-400 dark:text-slate-600 text-sm">
                                          Geen wedstrijden gevonden voor deze
                                          filters.
                                        </p>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === "seasons" && activeClub && (
              <motion.div
                key="seasons"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  {data.seasons
                    .filter((s: Season) => s.clubId === activeClub.id)
                    .filter((s: Season) =>
                      showBlockedSeasons ? true : !s.isBlocked,
                    )
                    .map((season: Season) => (
                      <div
                        key={season.id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors"
                      >
                        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {season.name}
                              </h3>
                              {season.isBlocked && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-black uppercase tracking-wider">
                                  <Lock size={10} />
                                  Voltooid
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Status:{" "}
                              <span className="capitalize font-medium text-emerald-600 dark:text-emerald-400">
                                {season.status}
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                setSelectedSeasonId(
                                  selectedSeasonId === season.id
                                    ? null
                                    : season.id,
                                );
                                setSelectedExternalMatchId(null);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-lg transition-colors text-sm font-bold border",
                                selectedSeasonId === season.id
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
                              )}
                            >
                              {selectedSeasonId === season.id
                                ? "Dichtvouwen"
                                : "Details & Stand"}
                            </button>
                          </div>
                        </div>

                        {selectedSeasonId === season.id && (
                          <div className="p-6 space-y-8">
                            {/* Standings Table */}
                            <div
                              ref={standingsRef}
                              className="bg-white dark:bg-slate-900 rounded-2xl p-6"
                            >
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <h4 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                                    <Trophy
                                      size={24}
                                      className="text-amber-500"
                                    />
                                    Tussenstand
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {activeClub?.name} — {season.name}
                                  </p>
                                </div>
                                <div
                                  className="relative"
                                  ref={
                                    activeShareDropdown === season.id
                                      ? shareDropdownRef
                                      : null
                                  }
                                >
                                  <button
                                    onClick={() =>
                                      setActiveShareDropdown(
                                        activeShareDropdown === season.id
                                          ? null
                                          : season.id,
                                      )
                                    }
                                    className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors exclude-from-share"
                                    title="Delen"
                                  >
                                    <Share2 size={24} />
                                  </button>
                                  {activeShareDropdown === season.id && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                      <button
                                        onClick={() => {
                                          setActiveShareDropdown(null);
                                          setTimeout(exportStandings, 100);
                                        }}
                                        className="px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                      >
                                        Exporteren als JPG
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="rounded-xl border border-[#2b6e2b] shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                        <th className="py-[13.5px] pl-4 text-center w-12 border-r border-[#2b6e2b]/30">
                                          Positie
                                        </th>
                                        <th
                                          className="py-[13.5px] px-4 text-left cursor-pointer hover:text-white transition-colors border-r border-[#2b6e2b]/30"
                                          onClick={() => handleSort("name")}
                                        >
                                          <div className="flex items-center gap-1">
                                            Naam{" "}
                                            {sortConfig?.field === "name" &&
                                              (sortConfig.direction ===
                                              "asc" ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="py-[13.5px] px-2 text-center cursor-pointer hover:text-white transition-colors border-r border-[#2b6e2b]/30"
                                          onClick={() =>
                                            handleSort("caramboles")
                                          }
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Caramboles{" "}
                                            {sortConfig?.field ===
                                              "caramboles" &&
                                              (sortConfig.direction ===
                                              "asc" ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="py-[13.5px] px-2 text-center cursor-pointer hover:text-white transition-colors border-r border-[#2b6e2b]/30"
                                          onClick={() => handleSort("matches")}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Wedstrijden{" "}
                                            {sortConfig?.field === "matches" &&
                                              (sortConfig.direction ===
                                              "asc" ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="py-[13.5px] px-2 text-center cursor-pointer hover:text-white transition-colors border-r border-[#2b6e2b]/30"
                                          onClick={() => handleSort("highest")}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Hoogste serie{" "}
                                            {sortConfig?.field === "highest" &&
                                              (sortConfig.direction ===
                                              "asc" ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="py-[13.5px] px-2 text-center cursor-pointer hover:text-white transition-colors border-r border-[#2b6e2b]/30"
                                          onClick={() => handleSort("points")}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Punten{" "}
                                            {sortConfig?.field === "points" &&
                                              (sortConfig.direction ===
                                              "asc" ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="py-[13.5px] px-2 text-center cursor-pointer hover:text-white transition-colors"
                                          onClick={() => handleSort("average")}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Gemiddelde{" "}
                                            {sortConfig?.field === "average" &&
                                              (sortConfig.direction ===
                                              "asc" ? (
                                                <ChevronUp size={14} />
                                              ) : (
                                                <ChevronDown size={14} />
                                              ))}
                                          </div>
                                        </th>
                                        <th className="py-[13.5px] px-4 text-center exclude-from-share border-l border-[#2b6e2b]/30">
                                          Kas
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-[#1a4d1a]">
                                      {(() => {
                                        const memberStats = (
                                          season.members || []
                                        ).map((memberInfo) => {
                                          const memberId = memberInfo.userId;
                                          const member = data.users.find(
                                            (u: User) => u.id === memberId,
                                          );
                                          const memberMatches =
                                            data.matches.filter(
                                              (m: Match) =>
                                                m.seasonId === season.id &&
                                                m.status === "finished" &&
                                                (m.player1Id === memberId ||
                                                  m.player2Id === memberId),
                                            );

                                          let totalCar = 0;
                                          let highest = 0;
                                          let totalPoints = 0;

                                          memberMatches.forEach((m: Match) => {
                                            const isP1 =
                                              m.player1Id === memberId;
                                            const made = (m.turns || []).reduce(
                                              (acc: number, t: any) =>
                                                acc +
                                                (isP1 ? t.player1 : t.player2),
                                              0,
                                            );
                                            const target = isP1
                                              ? m.player1AvgBefore
                                              : m.player2AvgBefore;
                                            const opponentMade = isP1
                                              ? (m.turns || []).reduce(
                                                  (acc: number, t: any) =>
                                                    acc + t.player2,
                                                  0,
                                                )
                                              : (m.turns || []).reduce(
                                                  (acc: number, t: any) =>
                                                    acc + t.player1,
                                                  0,
                                                );
                                            const opponentTarget = isP1
                                              ? m.player2AvgBefore
                                              : m.player1AvgBefore;

                                            totalCar += made;
                                            totalPoints += calculatePoints(
                                              made,
                                              target,
                                              opponentMade,
                                              opponentTarget,
                                              season.scoringSystem,
                                            );

                                            (m.turns || []).forEach(
                                              (t: any) => {
                                                const val = isP1
                                                  ? t.player1
                                                  : t.player2;
                                                if (val > highest)
                                                  highest = val;
                                              },
                                            );
                                          });

                                          const matchAvg =
                                            memberMatches.length > 0
                                              ? totalCar / memberMatches.length
                                              : memberInfo.manualAverageOverride ||
                                                memberInfo.currentAverage;
                                          return {
                                            ...memberInfo,
                                            name:
                                              member?.shortName ||
                                              member?.name ||
                                              "",
                                            fullName: member?.name || "",
                                            matchesCount: memberMatches.length,
                                            totalCar,
                                            highest,
                                            currentAvg: matchAvg,
                                            totalPoints,
                                          };
                                        });

                                        const sortedStats = [
                                          ...memberStats,
                                        ].sort((a, b) => {
                                          if (sortConfig) {
                                            const { field, direction } =
                                              sortConfig;
                                            let comparison = 0;
                                            if (field === "name")
                                              comparison = a.name.localeCompare(
                                                b.name,
                                              );
                                            else if (field === "matches")
                                              comparison =
                                                a.matchesCount - b.matchesCount;
                                            else if (field === "caramboles")
                                              comparison =
                                                a.totalCar - b.totalCar;
                                            else if (field === "highest")
                                              comparison =
                                                a.highest - b.highest;
                                            else if (field === "average")
                                              comparison =
                                                a.currentAvg - b.currentAvg;
                                            else if (field === "points")
                                              comparison =
                                                a.totalPoints - b.totalPoints;

                                            if (comparison !== 0)
                                              return direction === "asc"
                                                ? comparison
                                                : -comparison;
                                          }

                                          // Default sorting: Punten (desc), Caramboles (desc), Hoogste (desc), Gespeeld (asc)
                                          if (b.totalPoints !== a.totalPoints)
                                            return (
                                              b.totalPoints - a.totalPoints
                                            );
                                          if (b.totalCar !== a.totalCar)
                                            return b.totalCar - a.totalCar;
                                          if (b.highest !== a.highest)
                                            return b.highest - a.highest;
                                          return (
                                            a.matchesCount - b.matchesCount
                                          );
                                        });

                                        const maxStats = {
                                          caramboles: Math.max(
                                            ...memberStats.map(
                                              (s) => s.totalCar,
                                            ),
                                            1,
                                          ),
                                          matches: Math.max(
                                            ...memberStats.map(
                                              (s) => s.matchesCount,
                                            ),
                                            1,
                                          ),
                                          highest: Math.max(
                                            ...memberStats.map(
                                              (s) => s.highest,
                                            ),
                                            1,
                                          ),
                                          points: Math.max(
                                            ...memberStats.map(
                                              (s) => s.totalPoints,
                                            ),
                                            1,
                                          ),
                                          average: Math.max(
                                            ...memberStats.map(
                                              (s) => s.currentAvg,
                                            ),
                                            1,
                                          ),
                                        };

                                        return sortedStats.map(
                                          (memberInfo, index) => {
                                            const memberId = memberInfo.userId;

                                            const StatCell = ({
                                              value,
                                              max,
                                              format = (v: any) =>
                                                formatNumber(v),
                                            }: {
                                              value: number;
                                              max: number;
                                              format?: (v: any) => any;
                                            }) => (
                                              <td className="relative py-[13.5px] px-2 text-center text-white font-medium overflow-hidden border-r border-[#2b6e2b]/30">
                                                <div
                                                  className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                  style={{
                                                    width: `${(value / max) * 100}%`,
                                                  }}
                                                />
                                                <span className="relative z-10">
                                                  {format(value)}
                                                </span>
                                              </td>
                                            );

                                            return (
                                              <tr
                                                key={memberId}
                                                className="hover:bg-[#235d23] transition-colors border-b border-[#2b6e2b]/30"
                                              >
                                                <td className="py-[13.5px] pl-4 text-center text-[#f1c40f] font-black border-r border-[#2b6e2b]/30">
                                                  {index + 1}
                                                </td>
                                                <td className="py-[13.5px] px-4 font-bold text-white border-r border-[#2b6e2b]/30">
                                                  <div className="flex flex-col">
                                                    <span>
                                                      {memberInfo.name}
                                                    </span>
                                                  </div>
                                                </td>
                                                <StatCell
                                                  value={memberInfo.totalCar}
                                                  max={maxStats.caramboles}
                                                />
                                                <StatCell
                                                  value={
                                                    memberInfo.matchesCount
                                                  }
                                                  max={maxStats.matches}
                                                />
                                                <StatCell
                                                  value={memberInfo.highest}
                                                  max={maxStats.highest}
                                                />
                                                <StatCell
                                                  value={memberInfo.totalPoints}
                                                  max={maxStats.points}
                                                />
                                                <StatCell
                                                  value={memberInfo.currentAvg}
                                                  max={maxStats.average}
                                                  format={(v) =>
                                                    formatDecimal(v)
                                                  }
                                                />
                                                <td className="py-[13.5px] px-4 exclude-from-share text-center">
                                                  <button
                                                    disabled={
                                                      !isClubAdmin(activeClub, currentUser)
                                                    }
                                                    onClick={() =>
                                                      togglePayment(
                                                        season.id,
                                                        memberId,
                                                      )
                                                    }
                                                    className={cn(
                                                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors",
                                                      memberInfo.paidContributie
                                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                        : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
                                                    )}
                                                  >
                                                    {memberInfo.paidContributie
                                                      ? "V"
                                                      : "X"}
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          },
                                        );
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>

                            {/* Season Properties Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <button
                                onClick={() => {
                                  if (currentUser.role === "admin" || currentUser.role === "planner") {
                                    setEditSeasonSpeeldagen(season.speeldagen || []);
                                    setIsEditSpeeldagenModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "text-left p-4 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500",
                                  (currentUser.role === "admin" || currentUser.role === "planner")
                                    ? "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer active:scale-95"
                                    : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 cursor-default"
                                )}
                              >
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Speeldagen
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {season.speeldagen.map((day) => (
                                    <span
                                      key={day}
                                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 capitalize"
                                    >
                                      {day}
                                    </span>
                                  ))}
                                </div>
                              </button>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Wedstrijden per paar
                                </p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">
                                  {season.matchesPerPair}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Biljarttafels
                                </p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">
                                  {season.aantalTafels || 1}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Beurten per wedstrijd
                                </p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">
                                  {season.beurtenPerWedstrijd}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Wedstrijden per dag
                                </p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">
                                  {season.wedstrijdenPerSpeeldag}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Contributie
                                </p>
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(season.contributie)}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Inleg per wedstrijd
                                </p>
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(season.inlegPerWedstrijd)}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Herzieningen
                                </p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">
                                  {season.herzieningenPerSeizoen}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                  Status
                                </p>
                                <p className="text-lg font-black text-slate-800 dark:text-white capitalize">
                                  {season.status}
                                </p>
                              </div>
                            </div>

                            {/* Season Actions */}
                            {isClubAdmin(activeClub, currentUser) && (
                              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button
                                  onClick={() => toggleBlockSeason(season.id)}
                                  className={cn(
                                    "px-4 py-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2 border",
                                    season.isBlocked
                                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
                                  )}
                                >
                                  {season.isBlocked ? (
                                    <Unlock size={16} />
                                  ) : (
                                    <Lock size={16} />
                                  )}
                                  {season.isBlocked
                                    ? "Seizoen voltooid ongedaan maken"
                                    : "Seizoen voltooid"}
                                </button>
                                <button
                                  onClick={() => {
                                    setSeasonToDeleteId(season.id);
                                    setIsDeleteSeasonModalOpen(true);
                                  }}
                                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-bold flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Seizoen verwijderen
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {activeTab === "matches" && !liveMatchId && (
              <motion.div
                key="matches-list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!selectedSeasonId && !selectedExternalMatchId ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                    <Calendar
                      size={48}
                      className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      Selecteer eerst een seizoen of een uit/thuis wedstrijd om
                      de wedstrijden te bekijken.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setActiveTab("seasons")}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Naar Seizoenen
                      </button>
                      {activeClub?.participatesInExternalMatches && (
                        <button
                          onClick={() => setActiveTab("external-matches")}
                          className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                        >
                          Naar Uit & Thuis
                        </button>
                      )}
                    </div>
                  </div>
                ) : selectedExternalMatchId ? (
                  <div className="space-y-8">
                    {(() => {
                      const extMatch = data.externalMatches?.find(
                        (m: any) => m.id === selectedExternalMatchId,
                      );
                      if (!extMatch) return null;

                      const homeClub = data.clubs.find(
                        (c: Club) => c.id === extMatch.homeClubId,
                      );
                      const awayClub = data.clubs.find(
                        (c: Club) => c.id === extMatch.awayClubId,
                      );
                      const myClubIsHome =
                        activeClub?.id === extMatch.homeClubId;

                      const plannedGames = (extMatch.games || []).filter(
                        (g: any) =>
                          g.status === "planned" || g.status === "started",
                      );
                      const finishedGames = (extMatch.games || []).filter(
                        (g: any) => g.status === "finished",
                      );

                      let viewExtHomePointsTotal = 0;
                      let viewExtAwayPointsTotal = 0;
                      (extMatch.games || []).forEach((g: any) => {
                        const p1 = data.users.find(
                          (u: User) => u.id === g.homePlayerId,
                        );
                        const p2 = data.users.find(
                          (u: User) => u.id === g.awayPlayerId,
                        );
                        const gHomeTarget =
                          g.homeTarget ?? p1?.baseAverage ?? 1;
                        const gAwayTarget =
                          g.awayTarget ?? p2?.baseAverage ?? 1;
                        let gHomeScore = 0;
                        let gAwayScore = 0;
                        if (g.status === "finished") {
                          gHomeScore = g.homeScore || 0;
                          gAwayScore = g.awayScore || 0;
                        } else if (g.status === "started" && g.turns) {
                          if (g.id === liveMatchId) {
                            gHomeScore =
                              (g.turns?.reduce(
                                (sum: number, t: any, i: number) =>
                                  sum +
                                  (i === activeTurnIndex ? 0 : t.player1 || 0),
                                0,
                              ) || 0) + currentTurnP1;
                            gAwayScore =
                              (g.turns?.reduce(
                                (sum: number, t: any, i: number) =>
                                  sum +
                                  (i === activeTurnIndex ? 0 : t.player2 || 0),
                                0,
                              ) || 0) + currentTurnP2;
                          } else {
                            gHomeScore =
                              g.turns?.reduce(
                                (sum: number, t: any) => sum + (t.player1 || 0),
                                0,
                              ) || 0;
                            gAwayScore =
                              g.turns?.reduce(
                                (sum: number, t: any) => sum + (t.player2 || 0),
                                0,
                              ) || 0;
                          }
                        }
                        if (g.status === "finished" || g.status === "started") {
                          viewExtHomePointsTotal += calculatePoints(
                            gHomeScore,
                            gHomeTarget,
                            gAwayScore,
                            gAwayTarget,
                            extMatch.scoringSystem,
                          );
                          viewExtAwayPointsTotal += calculatePoints(
                            gAwayScore,
                            gAwayTarget,
                            gHomeScore,
                            gHomeTarget,
                            extMatch.scoringSystem,
                          );
                        }
                      });

                      return (
                        <>
                          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col items-center relative">
                            <div className="flex items-center justify-between w-full mt-4 mb-2">
                              <div className="flex items-center gap-2 flex-1 justify-start">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-left">
                                  {homeClub?.name}
                                </h3>
                                <span className="text-emerald-500 font-black text-lg md:text-xl ml-1">
                                  ({viewExtHomePointsTotal})
                                </span>
                              </div>

                              <div className="flex items-center justify-center gap-2 px-4 shrink-0 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Gespeeld: {finishedGames.length}{" "}
                                &nbsp;&bull;&nbsp; Resterend:{" "}
                                {plannedGames.length}
                              </div>

                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase truncate text-right">
                                  {awayClub?.name}
                                </h3>
                                <span className="text-amber-500 font-black text-lg md:text-xl ml-1">
                                  ({viewExtAwayPointsTotal})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
                                Partijen ({(extMatch.games || []).length})
                              </h4>
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setActiveShareDropdown(
                                      activeShareDropdown === extMatch.id
                                        ? null
                                        : extMatch.id,
                                    )
                                  }
                                  className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors exclude-from-share"
                                  title="Delen"
                                >
                                  <Share2 size={20} />
                                </button>
                                {activeShareDropdown === extMatch.id && (
                                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                      onClick={() => {
                                        setActiveShareDropdown(null);
                                        setTimeout(
                                          () => exportExtMatch(extMatch.id),
                                          100,
                                        );
                                      }}
                                      className="px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                    >
                                      Exporteren als JPG
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveShareDropdown(null);
                                        setCastMenuTarget({
                                          type: "extMatch",
                                          id: extMatch.id,
                                        });
                                      }}
                                      className="px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                    >
                                      Cast Menu
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div
                              ref={(el) =>
                                (extMatchRefs.current[extMatch.id] = el)
                              }
                              className="overflow-x-auto bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] rounded-2xl shadow-sm border border-[#2b6e2b]"
                            >
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                    <th className="py-4 pl-4 pr-4 text-left border-r border-[#2b6e2b]/30">
                                      Speler (Thuis)
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Inleg (Thuis)"
                                    >
                                      Inleg
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Hoogste Serie"
                                    >
                                      HS
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Gemiddelde"
                                    >
                                      Gem.
                                    </th>
                                    <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                      Car.
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                      title="Punten (Thuis)"
                                    >
                                      Pnt.
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                      title="Punten (Uit)"
                                    >
                                      Pnt.
                                    </th>
                                    <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                      Car.
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Gemiddelde"
                                    >
                                      Gem.
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Hoogste Serie"
                                    >
                                      HS
                                    </th>
                                    <th
                                      className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Inleg (Uit)"
                                    >
                                      Inleg
                                    </th>
                                    <th className="py-4 pl-4 pr-4 text-right border-r border-[#2b6e2b]/30">
                                      Speler (Uit)
                                    </th>
                                    <th className="py-4 px-4 text-center exclude-from-share">
                                      Actie
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    let maxPoints =
                                      extMatch.scoringSystem === "driebanden"
                                        ? 2
                                        : 12;
                                    let maxCar = 1;
                                    let maxAvg = 0.1;
                                    let maxHighest = 1;

                                    (extMatch.games || []).forEach(
                                      (match: any) => {
                                        const isFinished =
                                          match.status === "finished";
                                        const isStarted =
                                          match.status === "started";
                                        const p1TurnTotal =
                                          match.turns?.reduce(
                                            (acc: number, t: any) =>
                                              acc + (t.player1 || 0),
                                            0,
                                          ) || 0;
                                        const p2TurnTotal =
                                          match.turns?.reduce(
                                            (acc: number, t: any) =>
                                              acc + (t.player2 || 0),
                                            0,
                                          ) || 0;

                                        const p1Score = isFinished
                                          ? myClubIsHome
                                            ? match.homeScore || 0
                                            : match.awayScore || 0
                                          : isStarted
                                            ? p1TurnTotal
                                            : myClubIsHome
                                              ? match.homeScore || 0
                                              : match.awayScore || 0;
                                        const p2Score = isFinished
                                          ? myClubIsHome
                                            ? match.awayScore || 0
                                            : match.homeScore || 0
                                          : isStarted
                                            ? p2TurnTotal
                                            : myClubIsHome
                                              ? match.awayScore || 0
                                              : match.homeScore || 0;
                                        maxCar = Math.max(
                                          maxCar,
                                          p1Score,
                                          p2Score,
                                        );

                                        const p1AvgInfo =
                                          match.turns?.length > 0
                                            ? p1Score /
                                              (match.turns || []).length
                                            : 0;
                                        const p2AvgInfo =
                                          match.turns?.length > 0
                                            ? p2Score /
                                              (match.turns || []).length
                                            : 0;
                                        maxAvg = Math.max(
                                          maxAvg,
                                          p1AvgInfo,
                                          p2AvgInfo,
                                        );

                                        const p1H =
                                          match.turns &&
                                          (match.turns || []).length > 0
                                            ? Math.max(
                                                ...(match.turns || []).map(
                                                  (t: any) => t.player1 || 0,
                                                ),
                                              )
                                            : 0;
                                        const p2H =
                                          match.turns &&
                                          (match.turns || []).length > 0
                                            ? Math.max(
                                                ...(match.turns || []).map(
                                                  (t: any) => t.player2 || 0,
                                                ),
                                              )
                                            : 0;
                                        maxHighest = Math.max(
                                          maxHighest,
                                          p1H,
                                          p2H,
                                        );
                                      },
                                    );

                                    return (extMatch.games || []).map(
                                      (matchInner: any, index: number) => {
                                        const match = matchInner;
                                        const p1 = data.users.find(
                                          (u: User) =>
                                            u.id ===
                                            (myClubIsHome
                                              ? match.homePlayerId
                                              : match.awayPlayerId),
                                        );
                                        const p2 = data.users.find(
                                          (u: User) =>
                                            u.id ===
                                            (myClubIsHome
                                              ? match.awayPlayerId
                                              : match.homePlayerId),
                                        );
                                        const isFinished =
                                          match.status === "finished";
                                        const isStarted =
                                          match.status === "started";
                                        const isPlanned =
                                          match.status === "planned";

                                        const p1Target =
                                          (myClubIsHome
                                            ? match.homeTarget
                                            : match.awayTarget) ??
                                          (p1?.baseAverage || 0);
                                        const p2Target =
                                          (myClubIsHome
                                            ? match.awayTarget
                                            : match.homeTarget) ??
                                          (p2?.baseAverage || 0);

                                        const p1TurnTotal =
                                          match.turns?.reduce(
                                            (acc: number, t: any) =>
                                              acc + (t.player1 || 0),
                                            0,
                                          ) || 0;
                                        const p2TurnTotal =
                                          match.turns?.reduce(
                                            (acc: number, t: any) =>
                                              acc + (t.player2 || 0),
                                            0,
                                          ) || 0;
                                        const p1HighestInfo =
                                          match.turns &&
                                          (match.turns || []).length > 0
                                            ? Math.max(
                                                ...(match.turns || []).map(
                                                  (t: any) => t.player1 || 0,
                                                ),
                                              )
                                            : 0;
                                        const p2HighestInfo =
                                          match.turns &&
                                          (match.turns || []).length > 0
                                            ? Math.max(
                                                ...(match.turns || []).map(
                                                  (t: any) => t.player2 || 0,
                                                ),
                                              )
                                            : 0;

                                        const p1Score = isFinished
                                          ? myClubIsHome
                                            ? match.homeScore || 0
                                            : match.awayScore || 0
                                          : isStarted
                                            ? p1TurnTotal
                                            : myClubIsHome
                                              ? match.homeScore || 0
                                              : match.awayScore || 0;
                                        const p2Score = isFinished
                                          ? myClubIsHome
                                            ? match.awayScore || 0
                                            : match.homeScore || 0
                                          : isStarted
                                            ? p2TurnTotal
                                            : myClubIsHome
                                              ? match.awayScore || 0
                                              : match.homeScore || 0;
                                        const p1AvgInfo =
                                          match.turns?.length > 0
                                            ? p1Score /
                                              (match.turns || []).length
                                            : 0;
                                        const p2AvgInfo =
                                          match.turns?.length > 0
                                            ? p2Score /
                                              (match.turns || []).length
                                            : 0;

                                        let displayHomePoints: number | string =
                                          "-";
                                        let displayAwayPoints: number | string =
                                          "-";
                                        if (isFinished || isStarted) {
                                          displayHomePoints = calculatePoints(
                                            myClubIsHome ? p1Score : p2Score,
                                            myClubIsHome ? p1Target : p2Target,
                                            myClubIsHome ? p2Score : p1Score,
                                            myClubIsHome ? p2Target : p1Target,
                                            extMatch.scoringSystem,
                                          );
                                          displayAwayPoints = calculatePoints(
                                            myClubIsHome ? p2Score : p1Score,
                                            myClubIsHome ? p2Target : p1Target,
                                            myClubIsHome ? p1Score : p2Score,
                                            myClubIsHome ? p1Target : p2Target,
                                            extMatch.scoringSystem,
                                          );
                                        }

                                        // Map external game to internal Match structure for the UI component
                                        const mappedMatch = {
                                          id: match.id,
                                          player1Id: p1?.id || "",
                                          player2Id: p2?.id || "",
                                          status: match.status,
                                          player1Score: p1Score,
                                          player2Score: p2Score,
                                          player1AvgBefore: p1Target,
                                          player2AvgBefore: p2Target,
                                          isExternal: true, // Custom flag to handle actions differently if needed later
                                          extMatchId: extMatch.id,
                                        };

                                        return (
                                          <tr
                                            key={mappedMatch.id}
                                            className="hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0"
                                          >
                                            <td className="py-2 pl-4 pr-4 border-r border-[#2b6e2b]/30 text-left">
                                              <div className="flex items-center">
                                                <p
                                                  className="font-bold text-white truncate text-base inline-block mr-2"
                                                  title={p1?.name || "Onbekend"}
                                                >
                                                  {p1?.shortName ||
                                                    p1?.name ||
                                                    "Onbekend"}
                                                </p>
                                                <span
                                                  onClick={(e) => {
                                                    if (
                                                      !isFinished &&
                                                      !isStarted
                                                    ) {
                                                      e.stopPropagation();
                                                      handleUpdateExternalMatchTarget(
                                                        extMatch,
                                                        match,
                                                        myClubIsHome,
                                                        1,
                                                      );
                                                    }
                                                  }}
                                                  className={cn(
                                                    "text-[12px] font-bold tracking-widest inline-block",
                                                    !isFinished &&
                                                      !isStarted &&
                                                      (currentUser.role ===
                                                        "admin" ||
                                                        currentUser.role ===
                                                          "planner" ||
                                                        isClubAdmin(activeClub, currentUser))
                                                      ? "cursor-pointer text-emerald-300 hover:text-emerald-100 transition-colors"
                                                      : "text-emerald-300 opacity-80",
                                                  )}
                                                >
                                                  (
                                                  {formatNumber(
                                                    mappedMatch.player1AvgBefore,
                                                  )}
                                                  )
                                                </span>
                                              </div>
                                            </td>

                                            <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                              {isClubAdmin(activeClub, currentUser) ||
                                              currentUser.role === "admin" ||
                                              currentUser.role === "planner" ? (
                                                <button
                                                  onClick={() =>
                                                    toggleExternalMatchPayment(
                                                      extMatch.id,
                                                      match.id,
                                                      myClubIsHome
                                                        ? true
                                                        : false,
                                                    )
                                                  }
                                                  className={cn(
                                                    "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                    match[
                                                      myClubIsHome
                                                        ? "homePlayerPaid"
                                                        : "awayPlayerPaid"
                                                    ]
                                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                                      : "bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/40",
                                                  )}
                                                  title={`Inleg: ${match[myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                >
                                                  <Banknote size={10} />
                                                </button>
                                              ) : (
                                                <div
                                                  className={cn(
                                                    "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                    match[
                                                      myClubIsHome
                                                        ? "homePlayerPaid"
                                                        : "awayPlayerPaid"
                                                    ]
                                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 opacity-60"
                                                      : "bg-rose-500/20 text-rose-400 border-rose-500 opacity-60",
                                                  )}
                                                  title={`Inleg: ${match[myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                >
                                                  <Banknote size={10} />
                                                </div>
                                              )}
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-white/50">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(p1HighestInfo / maxHighest) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10">
                                                {match.turns?.length > 0 ? (
                                                  <span className="font-bold text-white">
                                                    {p1HighestInfo}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-[#f1c40f]">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(p1AvgInfo / maxAvg) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10">
                                                {match.turns?.length > 0 ? (
                                                  <span className="font-bold">
                                                    {p1AvgInfo.toFixed(3)}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(p1Score / maxCar) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10 font-black text-white text-xl">
                                                {isStarted || isFinished
                                                  ? p1Score || 0
                                                  : "-"}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 overflow-hidden">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(((typeof (myClubIsHome ? displayHomePoints : displayAwayPoints) === "number" ? (myClubIsHome ? displayHomePoints : displayAwayPoints) : 0) as number) / maxPoints) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10 font-black text-[#f1c40f] text-xl">
                                                {myClubIsHome
                                                  ? displayHomePoints
                                                  : displayAwayPoints}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 overflow-hidden">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(((typeof (myClubIsHome ? displayAwayPoints : displayHomePoints) === "number" ? (myClubIsHome ? displayAwayPoints : displayHomePoints) : 0) as number) / maxPoints) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10 font-black text-[#f1c40f] text-xl">
                                                {myClubIsHome
                                                  ? displayAwayPoints
                                                  : displayHomePoints}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(p2Score / maxCar) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10 font-black text-white text-xl">
                                                {isStarted || isFinished
                                                  ? p2Score || 0
                                                  : "-"}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-[#f1c40f]">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(p2AvgInfo / maxAvg) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10">
                                                {match.turns?.length > 0 ? (
                                                  <span className="font-bold">
                                                    {p2AvgInfo.toFixed(3)}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </span>
                                            </td>

                                            <td className="relative py-2 px-2 text-center border-r border-[#2b6e2b]/30 overflow-hidden text-white/50">
                                              <div
                                                className="absolute inset-y-1 left-0 bg-[#2b6e2b]/60 transition-all duration-500"
                                                style={{
                                                  width: `${(p2HighestInfo / maxHighest) * 100}%`,
                                                }}
                                              />
                                              <span className="relative z-10">
                                                {match.turns?.length > 0 ? (
                                                  <span className="font-bold text-white">
                                                    {p2HighestInfo}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </span>
                                            </td>

                                            <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                              {isClubAdmin(activeClub, currentUser) ||
                                              currentUser.role === "admin" ||
                                              currentUser.role === "planner" ? (
                                                <button
                                                  onClick={() =>
                                                    toggleExternalMatchPayment(
                                                      extMatch.id,
                                                      match.id,
                                                      !myClubIsHome,
                                                    )
                                                  }
                                                  className={cn(
                                                    "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                    match[
                                                      !myClubIsHome
                                                        ? "homePlayerPaid"
                                                        : "awayPlayerPaid"
                                                    ]
                                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                                      : "bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/40",
                                                  )}
                                                  title={`Inleg: ${match[!myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                >
                                                  <Banknote size={10} />
                                                </button>
                                              ) : (
                                                <div
                                                  className={cn(
                                                    "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                    match[
                                                      !myClubIsHome
                                                        ? "homePlayerPaid"
                                                        : "awayPlayerPaid"
                                                    ]
                                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 opacity-60"
                                                      : "bg-rose-500/20 text-rose-400 border-rose-500 opacity-60",
                                                  )}
                                                  title={`Inleg: ${match[!myClubIsHome ? "homePlayerPaid" : "awayPlayerPaid"] ? "Betaald" : "Niet betaald"}`}
                                                >
                                                  <Banknote size={10} />
                                                </div>
                                              )}
                                            </td>

                                            <td className="py-2 pl-4 pr-4 border-r border-[#2b6e2b]/30 text-right">
                                              <div className="flex items-center justify-end">
                                                <span
                                                  onClick={(e) => {
                                                    if (
                                                      !isFinished &&
                                                      !isStarted
                                                    ) {
                                                      e.stopPropagation();
                                                      handleUpdateExternalMatchTarget(
                                                        extMatch,
                                                        match,
                                                        myClubIsHome,
                                                        2,
                                                      );
                                                    }
                                                  }}
                                                  className={cn(
                                                    "text-[12px] font-bold tracking-widest inline-block mr-2",
                                                    !isFinished &&
                                                      !isStarted &&
                                                      (currentUser.role ===
                                                        "admin" ||
                                                        currentUser.role ===
                                                          "planner" ||
                                                        isClubAdmin(activeClub, currentUser))
                                                      ? "cursor-pointer text-emerald-300 hover:text-emerald-100 transition-colors"
                                                      : "text-emerald-300 opacity-80",
                                                  )}
                                                >
                                                  (
                                                  {formatNumber(
                                                    mappedMatch.player2AvgBefore,
                                                  )}
                                                  )
                                                </span>
                                                <p
                                                  className="font-bold text-white truncate text-base inline-block"
                                                  title={p2?.name || "Onbekend"}
                                                >
                                                  {p2?.shortName ||
                                                    p2?.name ||
                                                    "Onbekend"}
                                                </p>
                                              </div>
                                            </td>

                                            <td className="py-2 px-4 text-center exclude-from-share">
                                              <div className="flex items-center justify-center">
                                                {!isFinished &&
                                                  !isStarted &&
                                                  (isClubAdmin(activeClub, currentUser) ||
                                                    currentUser.role ===
                                                      "admin" ||
                                                    currentUser.role ===
                                                      "planner" ||
                                                    currentUser.role ===
                                                      "user") && (
                                                    <button
                                                      onClick={() => {
                                                        setMatchToStartId(
                                                          match.id,
                                                        );
                                                        setIsStartMatchModalOpen(
                                                          true,
                                                        );
                                                      }}
                                                      className="w-8 h-8 bg-emerald-600 dark:bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center shadow-lg shadow-emerald-600/20"
                                                      title="Starten"
                                                    >
                                                      <Play
                                                        size={14}
                                                        className="ml-0.5"
                                                      />
                                                    </button>
                                                  )}
                                                {isStarted && (
                                                  <button
                                                    onClick={() =>
                                                      setLiveMatchId(match.id)
                                                    }
                                                    className="w-8 h-8 bg-[#f1c40f] text-[#064e3b] font-bold rounded-full hover:bg-[#d4ac0d] transition-colors flex items-center justify-center shadow-lg shadow-[#f1c40f]/20"
                                                    title="Naar Live View"
                                                  >
                                                    <Tv size={14} />
                                                  </button>
                                                )}
                                                {isFinished && (
                                                  <button
                                                    onClick={() =>
                                                      setLiveMatchId(match.id)
                                                    }
                                                    className="w-8 h-8 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center shadow-lg shadow-blue-500/20"
                                                    title="Details"
                                                  >
                                                    <Search size={14} />
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      },
                                    );
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-4 -mx-4 px-4 border-b border-transparent data-[sticky=true]:border-slate-200 data-[sticky=true]:dark:border-slate-800 transition-colors flex flex-col md:flex-row gap-4">
                      <div ref={searchDropdownRef} className="relative flex-1">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
                        <input
                          type="text"
                          placeholder="Zoek op speler..."
                          value={matchSearchQuery}
                          onChange={(e) => {
                            setMatchSearchQuery(e.target.value);
                            setIsMatchSearchDropdownOpen(true);
                          }}
                          onFocus={() => setIsMatchSearchDropdownOpen(true)}
                          className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                        />
                        {isMatchSearchDropdownOpen && activeClub && (
                          <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="max-h-64 overflow-y-auto">
                              {(activeClub.memberIds || [])
                                .map((id) =>
                                  data.users.find((u: User) => u.id === id),
                                )
                                .filter((u): u is User => !!u)
                                .filter((u) => {
                                  if (!matchSearchQuery) return true;
                                  return (
                                    u?.name
                                      ?.toLowerCase()
                                      .includes(
                                        matchSearchQuery.toLowerCase(),
                                      ) ||
                                    (u?.shortName &&
                                      u.shortName
                                        .toLowerCase()
                                        .includes(
                                          matchSearchQuery.toLowerCase(),
                                        ))
                                  );
                                })
                                .map((u) => (
                                  <button
                                    key={u.id}
                                    onClick={() => {
                                      setMatchSearchQuery(
                                        u.shortName || u.name,
                                      );
                                      setIsMatchSearchDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0 dark:border-slate-800/50"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden shrink-0">
                                      {u.avatar ? (
                                        <img
                                          src={u.avatar}
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        u.name?.[0]
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                        {u.shortName || u.name}
                                      </p>
                                      {u.shortName &&
                                        u.shortName !== u.name && (
                                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                            {u.name}
                                          </p>
                                        )}
                                    </div>
                                  </button>
                                ))}
                              {(activeClub.memberIds || []).length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-400">
                                  Geen leden gevonden
                                </div>
                              )}
                            </div>
                            <div className="p-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                              <button
                                onClick={() =>
                                  setIsMatchSearchDropdownOpen(false)
                                }
                                className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              >
                                Sluiten
                              </button>
                            </div>
                          </div>
                        )}
                        {matchSearchQuery && (
                          <button
                            onClick={() => setMatchSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                      <div className="relative md:w-72">
                        <Calendar
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          size={20}
                        />
                        <select
                          value={matchDateFilter}
                          onChange={(e) => setMatchDateFilter(e.target.value)}
                          className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm appearance-none font-medium"
                        >
                          <option value="">Alle speeldagen</option>
                          {(() => {
                            const dates = Array.from(
                              new Set(
                                data.matches
                                  .filter(
                                    (m: Match) =>
                                      m.seasonId === selectedSeasonId,
                                  )
                                  .map((m: Match) =>
                                    format(new Date(m.date), "yyyy-MM-dd"),
                                  ),
                              ),
                            ).sort() as string[];

                            return dates.map((dateStr: string) => (
                              <option key={dateStr} value={dateStr}>
                                {format(new Date(dateStr), "EEEE d MMMM yyyy", {
                                  locale: nl,
                                })}
                              </option>
                            ));
                          })()}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronLeft className="-rotate-90" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      {(() => {
                        const seasonMatches = data.matches
                          .filter((m: Match) => m.seasonId === selectedSeasonId)
                          .filter((m: Match) => {
                            if (matchDateFilter) {
                              return isSameDay(
                                new Date(m.date),
                                new Date(matchDateFilter),
                              );
                            }
                            if (m.status === "finished") {
                              const matchDate = new Date(m.date);
                              const isToday = isSameDay(matchDate, new Date());
                              if (!showFinishedMatches && !isToday) {
                                return false;
                              }
                            }
                            if (!matchSearchQuery) return true;
                            const p1 = data.users.find(
                              (u: User) => u.id === m.player1Id,
                            );
                            const p2 = data.users.find(
                              (u: User) => u.id === m.player2Id,
                            );
                            const query = matchSearchQuery.toLowerCase();
                            const p1Match =
                              p1?.name?.toLowerCase().includes(query) ||
                              p1?.shortName?.toLowerCase().includes(query);
                            const p2Match =
                              p2?.name?.toLowerCase().includes(query) ||
                              p2?.shortName?.toLowerCase().includes(query);
                            return p1Match || p2Match;
                          })
                          .sort(
                            (a: Match, b: Match) =>
                              new Date(a.date).getTime() -
                              new Date(b.date).getTime(),
                          );

                        const grouped = seasonMatches.reduce(
                          (acc: any, m: Match) => {
                            const date = format(new Date(m.date), "yyyy-MM-dd");
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(m);
                            return acc;
                          },
                          {},
                        );

                        if (
                          seasonMatches.length === 0 &&
                          (matchSearchQuery || matchDateFilter)
                        ) {
                          return (
                            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                              <Search
                                size={48}
                                className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                              />
                              <p className="text-slate-500 dark:text-slate-400">
                                Geen wedstrijden gevonden voor de opgegeven
                                filters.
                              </p>
                            </div>
                          );
                        }

                        const groupedEntries = Object.entries(grouped);
                        let visibleEntries = groupedEntries;
                        let hasMoreFutureMatches = false;

                        if (!isMatchesExpanded && !matchSearchQuery && !matchDateFilter) {
                          const todayStr = format(new Date(), "yyyy-MM-dd");
                          const futureIndices = groupedEntries
                            .map((entry, idx) => (entry[0] >= todayStr ? idx : -1))
                            .filter((idx) => idx !== -1);

                          if (futureIndices.length > 2) {
                            const cutOffIndex = futureIndices[2];
                            visibleEntries = groupedEntries.slice(0, cutOffIndex);
                            hasMoreFutureMatches = true;
                          }
                        }

                        return (
                          <>
                            {visibleEntries.map(([dateStr, matches]: [string, any]) => {
                              const date = new Date(dateStr);
                            const isPast = isBefore(
                              date,
                              startOfDay(new Date()),
                            );
                            const rawAttendance =
                              activeSeason?.attendance?.[date.toISOString()];
                            const attendance =
                              rawAttendance ||
                              activeSeason?.members?.map((m) => m.userId) ||
                              [];
                            const holiday = getHolidayForDate(date);
                            const cancelledReason =
                              activeSeason?.cancelledDays?.[date.toISOString()];

                            return (
                              <div
                                key={dateStr}
                                className={cn(
                                  "space-y-4",
                                  cancelledReason && "opacity-60",
                                )}
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={cn(
                                        "p-3 rounded-xl shadow-lg",
                                        cancelledReason
                                          ? "bg-slate-400 text-white"
                                          : "bg-emerald-600 text-white shadow-emerald-600/20",
                                      )}
                                    >
                                      <Calendar size={24} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                          {format(date, "EEEE d MMMM", {
                                            locale: nl,
                                          })}
                                        </h3>
                                        {holiday && (
                                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-full uppercase">
                                            <Gift size={10} />
                                            {holiday}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                          {matches.length} wedstrijden gepland
                                        </p>
                                        {cancelledReason && (
                                          <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                                            • AFGEMELD: {cancelledReason}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {isSameDay(date, new Date()) &&
                                      activeSeason &&
                                      !cancelledReason && (
                                        <button
                                          onClick={() => showConfirm(
                                            "Speeldag Voltooien",
                                            "Nog niet gespeelde- en afgemelde wedstrijden worden naar de volgende speeldag verplaats en alles wordt opnieuw ingedeeld.",
                                            () => completeMatchDay(activeSeason.id, date.toISOString())
                                          )}
                                          className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-sm flex items-center gap-2 font-bold text-sm h-[42px]"
                                        >
                                          <CheckCircle2 size={16} />
                                          Speeldag voltooien
                                        </button>
                                      )}
                                    {isSameDay(date, new Date()) &&
                                      activeSeason &&
                                      !cancelledReason && (
                                        <button
                                          onClick={() => {
                                            setDailyMatchFeesDate(
                                              date.toISOString(),
                                            );
                                            setIsDailyMatchFeesModalOpen(true);
                                          }}
                                          className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm flex items-center gap-3 group"
                                        >
                                          <div className="text-left">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1">
                                              Inleggeld Vandaag
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(
                                                  matches.reduce(
                                                    (sum: number, m: Match) => {
                                                      let paid = sum;
                                                      if (m.player1Paid)
                                                        paid +=
                                                          activeSeason.inlegPerWedstrijd;
                                                      if (m.player2Paid)
                                                        paid +=
                                                          activeSeason.inlegPerWedstrijd;
                                                      return paid;
                                                    },
                                                    0,
                                                  ),
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <CreditCard size={18} />
                                          </div>
                                        </button>
                                      )}

                                    {!isPast &&
                                      activeSeason &&
                                      !cancelledReason &&
                                      isClubAdmin(activeClub, currentUser) && (
                                        <button
                                          onClick={() => {
                                            setCancelDayDate(
                                              date.toISOString(),
                                            );
                                            setIsCancelDayModalOpen(true);
                                          }}
                                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors text-[10px] font-black uppercase border border-rose-100 dark:border-rose-800/50"
                                        >
                                          <XCircle size={14} />
                                          Speeldag afmelden
                                        </button>
                                      )}

                                    {!isPast &&
                                      activeSeason &&
                                      !cancelledReason && (
                                        <button
                                          onClick={() => {
                                            setAttendanceModalDate(
                                              date.toISOString(),
                                            );
                                            setIsAttendanceModalOpen(true);
                                          }}
                                          className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm flex items-center gap-3 group"
                                        >
                                          <div className="text-left">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1">
                                              Aanwezigheid
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg font-black text-slate-800 dark:text-white">
                                                {Math.round(
                                                  (attendance.length /
                                                    Math.max(
                                                      (
                                                        activeSeason.members ||
                                                        []
                                                      ).length,
                                                      1,
                                                    )) *
                                                    100,
                                                )}
                                                %
                                              </span>
                                              <span className="text-xl">
                                                {(() => {
                                                  const pct =
                                                    (attendance.length /
                                                      Math.max(
                                                        (
                                                          activeSeason.members ||
                                                          []
                                                        ).length,
                                                        1,
                                                      )) *
                                                    100;
                                                  if (pct === 100) return "🤩";
                                                  if (pct >= 80) return "😊";
                                                  if (pct >= 50) return "😐";
                                                  if (pct >= 25) return "😕";
                                                  return "😢";
                                                })()}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <Users size={18} />
                                          </div>
                                        </button>
                                      )}
                                  </div>
                                </div>

                                {!cancelledReason && (
                                  <div className="overflow-x-auto bg-[#064e3b] bg-linear-to-br from-[#065f46] via-[#064e3b] to-[#042f24] rounded-2xl shadow-sm border border-[#2b6e2b]">
                                    <table className="w-full border-collapse">
                                      <thead>
                                        <tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                          <th className="py-4 pl-4 pr-4 text-left border-r border-[#2b6e2b]/30">
                                            Speler (Wit)
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Inleg"
                                          >
                                            Inleg
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Aanwezig"
                                          >
                                            Aanw.
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Hoogste Serie"
                                          >
                                            HS
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Te maken"
                                          >
                                            Te maken
                                          </th>
                                          <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                            Car.
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                            title="Punten (Wit)"
                                          >
                                            Pnt.
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                            title="Punten (Geel)"
                                          >
                                            Pnt.
                                          </th>
                                          <th className="py-4 px-2 text-center border-r border-[#2b6e2b]/30">
                                            Car.
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Te maken"
                                          >
                                            Te maken
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Hoogste Serie"
                                          >
                                            HS
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Aanwezig"
                                          >
                                            Aanw.
                                          </th>
                                          <th
                                            className="py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Inleg"
                                          >
                                            Inleg
                                          </th>
                                          <th className="py-4 pl-4 pr-4 text-right border-r border-[#2b6e2b]/30">
                                            Speler (Geel)
                                          </th>
                                          <th className="py-4 px-4 text-center exclude-from-share">
                                            Actie
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {[...matches].sort((a: Match, b: Match) => {
                                          const aIsFinished = a.status === 'finished';
                                          const bIsFinished = b.status === 'finished';
                                          
                                          const aP1Absent = !aIsFinished && rawAttendance && !rawAttendance.includes(a.player1Id);
                                          const aP2Absent = !aIsFinished && rawAttendance && !rawAttendance.includes(a.player2Id);
                                          const bP1Absent = !bIsFinished && rawAttendance && !rawAttendance.includes(b.player1Id);
                                          const bP2Absent = !bIsFinished && rawAttendance && !rawAttendance.includes(b.player2Id);
                                          
                                          const aIsAbsent = aP1Absent || aP2Absent;
                                          const bIsAbsent = bP1Absent || bP2Absent;

                                          const aToBottom = a.status === 'cancelled' || aIsAbsent;
                                          const bToBottom = b.status === 'cancelled' || bIsAbsent;

                                          if (aToBottom && !bToBottom) return 1;
                                          if (!aToBottom && bToBottom) return -1;
                                          return 0;
                                        }).map((match: Match) => {
                                          const p1 = data.users.find(
                                            (u: User) =>
                                              u.id === match.player1Id,
                                          );
                                          const p2 = data.users.find(
                                            (u: User) =>
                                              u.id === match.player2Id,
                                          );
                                          const isFinished =
                                            match.status === "finished";
                                          const isCancelled =
                                            match.status === "cancelled";
                                          const isStarted =
                                            match.status === "started";
                                          const isPlanned =
                                            match.status === "planned";

                                          const p1Absent =
                                            !isFinished &&
                                            rawAttendance &&
                                            !rawAttendance.includes(
                                              match.player1Id,
                                            );
                                          const p2Absent =
                                            !isFinished &&
                                            rawAttendance &&
                                            !rawAttendance.includes(
                                              match.player2Id,
                                            );
                                          const isAtLeastOneAbsent =
                                            p1Absent || p2Absent;
                                          const isMatchBlocked =
                                            isPlanned && isAtLeastOneAbsent;

                                          const p1Score =
                                            match.turns?.reduce(
                                              (acc, t) =>
                                                acc + (t.player1 || 0),
                                              0,
                                            ) || 0;
                                          const p2Score =
                                            match.turns?.reduce(
                                              (acc, t) =>
                                                acc + (t.player2 || 0),
                                              0,
                                            ) || 0;
                                          const p1HighestInfo =
                                            match.turns &&
                                            (match.turns || []).length > 0
                                              ? Math.max(
                                                  ...(match.turns || []).map(
                                                    (t) => t.player1 || 0,
                                                  ),
                                                )
                                              : 0;
                                          const p2HighestInfo =
                                            match.turns &&
                                            (match.turns || []).length > 0
                                              ? Math.max(
                                                  ...(match.turns || []).map(
                                                    (t) => t.player2 || 0,
                                                  ),
                                                )
                                              : 0;

                                          let displayHomePoints:
                                            number | string = "-";
                                          let displayAwayPoints:
                                            number | string = "-";
                                          if (isFinished || isStarted) {
                                            displayHomePoints = calculatePoints(
                                              p1Score,
                                              match.player1AvgBefore,
                                              p2Score,
                                              match.player2AvgBefore,
                                              activeSeason?.scoringSystem ||
                                                "2-0",
                                            );
                                            displayAwayPoints = calculatePoints(
                                              p2Score,
                                              match.player2AvgBefore,
                                              p1Score,
                                              match.player1AvgBefore,
                                              activeSeason?.scoringSystem ||
                                                "2-0",
                                            );
                                          }

                                          return (
                                            <tr
                                              key={match.id}
                                              className={cn(
                                                "hover:bg-white/5 transition-colors border-b border-[#2b6e2b]/30 last:border-0",
                                                isMatchBlocked &&
                                                  "opacity-50 grayscale",
                                                isCancelled && "bg-rose-900/20",
                                              )}
                                            >
                                              {/* Player 1 Details */}
                                              <td className="py-2 pl-4 pr-4 border-r border-[#2b6e2b]/30 text-left">
                                                <div className="flex items-center gap-2">
                                                  {isPlanned &&
                                                    (currentUser.role ===
                                                      "admin" ||
                                                      currentUser.role ===
                                                        "planner" ||
                                                      isClubAdmin(activeClub, currentUser)) && (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleSwapPlayers(
                                                            match,
                                                          );
                                                        }}
                                                        className="p-1 rounded-full text-slate-400 hover:text-emerald-300 transition-colors bg-black/20"
                                                        title="Wissel actieve bal (wit/geel)"
                                                      >
                                                        <ArrowRightLeft
                                                          size={10}
                                                        />
                                                      </button>
                                                    )}
                                                  <button
                                                    onClick={() => {
                                                      setSelectedProfileId(
                                                        match.player1Id,
                                                      );
                                                      setActiveTab("profile");
                                                    }}
                                                    className={cn(
                                                      "font-bold truncate text-base hover:text-emerald-300 transition-colors",
                                                      p1Absent
                                                        ? "text-rose-400"
                                                        : "text-white",
                                                    )}
                                                  >
                                                    {p1?.shortName ||
                                                      p1?.name ||
                                                      "Onbekend"}
                                                  </button>
                                                </div>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                {isClubAdmin(activeClub, currentUser) ||
                                                currentUser.role === "admin" ||
                                                currentUser.role ===
                                                  "planner" ? (
                                                  <button
                                                    onClick={() =>
                                                      toggleMatchPayment(
                                                        match.id,
                                                        1,
                                                      )
                                                    }
                                                    className={cn(
                                                      "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                      match.player1Paid
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                                        : "bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/40",
                                                    )}
                                                    title={`Inleg W: ${match.player1Paid ? "Betaald" : "Niet betaald"}`}
                                                  >
                                                    <Banknote size={10} />
                                                  </button>
                                                ) : (
                                                  <div
                                                    className={cn(
                                                      "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                      match.player1Paid
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 opacity-60"
                                                        : "bg-rose-500/20 text-rose-400 border-rose-500 opacity-60",
                                                    )}
                                                    title={`Inleg W: ${match.player1Paid ? "Betaald" : "Niet betaald"}`}
                                                  >
                                                    <Banknote size={10} />
                                                  </div>
                                                )}
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isFinished) return;
                                                    if (activeSeason && dateStr && (currentUser.role === "admin" || currentUser.role === "planner" || isClubAdmin(activeClub, currentUser))) {
                                                      toggleAttendance(activeSeason.id, date.toISOString(), match.player1Id);
                                                    }
                                                  }}
                                                  disabled={isFinished}
                                                  className={cn(
                                                    "focus:outline-none transition-transform active:scale-95",
                                                    (currentUser.role === "admin" || currentUser.role === "planner" || isClubAdmin(activeClub, currentUser)) && !isFinished ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-50"
                                                  )}
                                                  title={p1Absent ? "Afwezig" : "Aanwezig"}
                                                >
                                                  {p1Absent ? (
                                                    <span className="text-rose-500 font-black text-sm">✗</span>
                                                  ) : (
                                                    <span className="text-emerald-500 font-black text-sm">✓</span>
                                                  )}
                                                </button>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                {match.turns?.length > 0 ? (
                                                  <span className="font-bold text-white">
                                                    {p1HighestInfo}
                                                  </span>
                                                ) : (
                                                  <span className="text-white/40">
                                                    -
                                                  </span>
                                                )}
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                <span
                                                  onClick={(e) => {
                                                    if (
                                                      match.status === "planned"
                                                    ) {
                                                      e.stopPropagation();
                                                      handleUpdateMatchAverage(
                                                        match,
                                                        1,
                                                      );
                                                    }
                                                  }}
                                                  className={cn(
                                                    "font-bold text-[13px] tracking-wider",
                                                    match.status ===
                                                      "planned" &&
                                                      (currentUser.role ===
                                                        "admin" ||
                                                        currentUser.role ===
                                                          "planner" ||
                                                        isClubAdmin(activeClub, currentUser))
                                                      ? "cursor-pointer text-emerald-300 hover:text-emerald-100"
                                                      : "text-emerald-300 opacity-80",
                                                  )}
                                                >
                                                  {formatNumber(
                                                    match.player1AvgBefore,
                                                  )}
                                                </span>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                {isStarted || isFinished ? (
                                                  <span className="font-black text-white text-xl">
                                                    {p1Score}
                                                  </span>
                                                ) : (
                                                  <span className="text-white/40">
                                                    -
                                                  </span>
                                                )}
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20">
                                                <span className="font-black text-[#f1c40f] text-xl">
                                                  {displayHomePoints}
                                                </span>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20">
                                                <span className="font-black text-[#f1c40f] text-xl">
                                                  {displayAwayPoints}
                                                </span>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                {isStarted || isFinished ? (
                                                  <span className="font-black text-white text-xl">
                                                    {p2Score}
                                                  </span>
                                                ) : (
                                                  <span className="text-white/40">
                                                    -
                                                  </span>
                                                )}
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                <span
                                                  onClick={(e) => {
                                                    if (
                                                      match.status === "planned"
                                                    ) {
                                                      e.stopPropagation();
                                                      handleUpdateMatchAverage(
                                                        match,
                                                        2,
                                                      );
                                                    }
                                                  }}
                                                  className={cn(
                                                    "font-bold text-[13px] tracking-wider",
                                                    match.status ===
                                                      "planned" &&
                                                      (currentUser.role ===
                                                        "admin" ||
                                                        currentUser.role ===
                                                          "planner" ||
                                                        isClubAdmin(activeClub, currentUser))
                                                      ? "cursor-pointer text-emerald-300 hover:text-emerald-100"
                                                      : "text-emerald-300 opacity-80",
                                                  )}
                                                >
                                                  {formatNumber(
                                                    match.player2AvgBefore,
                                                  )}
                                                </span>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                {match.turns?.length > 0 ? (
                                                  <span className="font-bold text-white">
                                                    {p2HighestInfo}
                                                  </span>
                                                ) : (
                                                  <span className="text-white/40">
                                                    -
                                                  </span>
                                                )}
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isFinished) return;
                                                    if (activeSeason && dateStr && (currentUser.role === "admin" || currentUser.role === "planner" || isClubAdmin(activeClub, currentUser))) {
                                                      toggleAttendance(activeSeason.id, date.toISOString(), match.player2Id);
                                                    }
                                                  }}
                                                  disabled={isFinished}
                                                  className={cn(
                                                    "focus:outline-none transition-transform active:scale-95",
                                                    (currentUser.role === "admin" || currentUser.role === "planner" || isClubAdmin(activeClub, currentUser)) && !isFinished ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-50"
                                                  )}
                                                  title={p2Absent ? "Afwezig" : "Aanwezig"}
                                                >
                                                  {p2Absent ? (
                                                    <span className="text-rose-500 font-black text-sm">✗</span>
                                                  ) : (
                                                    <span className="text-emerald-500 font-black text-sm">✓</span>
                                                  )}
                                                </button>
                                              </td>

                                              <td className="py-2 px-2 text-center border-r border-[#2b6e2b]/30">
                                                {isClubAdmin(activeClub, currentUser) ||
                                                currentUser.role === "admin" ||
                                                currentUser.role ===
                                                  "planner" ? (
                                                  <button
                                                    onClick={() =>
                                                      toggleMatchPayment(
                                                        match.id,
                                                        2,
                                                      )
                                                    }
                                                    className={cn(
                                                      "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                      match.player2Paid
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                                        : "bg-rose-500/20 text-rose-400 border-rose-500 hover:bg-rose-500/40",
                                                    )}
                                                    title={`Inleg G: ${match.player2Paid ? "Betaald" : "Niet betaald"}`}
                                                  >
                                                    <Banknote size={10} />
                                                  </button>
                                                ) : (
                                                  <div
                                                    className={cn(
                                                      "w-5 h-5 mx-auto rounded-md flex items-center justify-center border text-[9px]",
                                                      match.player2Paid
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 opacity-60"
                                                        : "bg-rose-500/20 text-rose-400 border-rose-500 opacity-60",
                                                    )}
                                                    title={`Inleg G: ${match.player2Paid ? "Betaald" : "Niet betaald"}`}
                                                  >
                                                    <Banknote size={10} />
                                                  </div>
                                                )}
                                              </td>

                                              <td className="py-2 pl-4 pr-4 border-r border-[#2b6e2b]/30 text-right">
                                                <button
                                                  onClick={() => {
                                                    setSelectedProfileId(
                                                      match.player2Id,
                                                    );
                                                    setActiveTab("profile");
                                                  }}
                                                  className={cn(
                                                    "font-bold truncate text-base hover:text-emerald-300 transition-colors",
                                                    p2Absent
                                                      ? "text-rose-400"
                                                      : "text-white",
                                                  )}
                                                >
                                                  {p2?.shortName ||
                                                    p2?.name ||
                                                    "Onbekend"}
                                                </button>
                                              </td>

                                              <td className="py-2 px-4 text-center exclude-from-share">
                                                <div className="flex items-center justify-center gap-1">
                                                  {!isFinished &&
                                                    !isStarted &&
                                                    !isCancelled &&
                                                    isSameDay(date, new Date()) &&
                                                    (isClubAdmin(activeClub, currentUser) ||
                                                      currentUser.role ===
                                                        "admin" ||
                                                      currentUser.role ===
                                                        "planner" ||
                                                      currentUser.role ===
                                                        "user") &&
                                                    !isMatchBlocked && (
                                                      <button
                                                        onClick={() => {
                                                          setMatchToStartId(
                                                            match.id,
                                                          );
                                                          const available =
                                                            Array.from(
                                                              {
                                                                length:
                                                                  activeSeason?.aantalTafels ||
                                                                  1,
                                                              },
                                                              (_, i) => i + 1,
                                                            ).find(
                                                              (n) =>
                                                                !occupiedTables.includes(
                                                                  n,
                                                                ),
                                                            );
                                                          setSelectedTafelNummer(
                                                            available || 1,
                                                          );

                                                          if (
                                                            lastArbiterId &&
                                                            lastArbiterId !==
                                                              match.player1Id &&
                                                            lastArbiterId !==
                                                              match.player2Id
                                                          ) {
                                                            setSelectedArbiterId(
                                                              lastArbiterId,
                                                            );
                                                          } else {
                                                            setSelectedArbiterId(
                                                              "",
                                                            );
                                                          }

                                                          if (
                                                            lastWriterId &&
                                                            lastWriterId !==
                                                              match.player1Id &&
                                                            lastWriterId !==
                                                              match.player2Id
                                                          ) {
                                                            setSelectedWriterId(
                                                              lastWriterId,
                                                            );
                                                          } else {
                                                            setSelectedWriterId(
                                                              "",
                                                            );
                                                          }

                                                          setIsStartMatchModalOpen(
                                                            true,
                                                          );
                                                        }}
                                                        className="w-8 h-8 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-colors flex items-center justify-center shadow-lg"
                                                        title="Starten"
                                                      >
                                                        <Play
                                                          size={14}
                                                          className="ml-0.5"
                                                        />
                                                      </button>
                                                    )}
                                                  {isStarted && (
                                                    <button
                                                      onClick={() =>
                                                        setLiveMatchId(match.id)
                                                      }
                                                      className="w-8 h-8 bg-[#f1c40f] text-[#064e3b] font-bold rounded-full hover:bg-[#d4ac0d] transition-colors flex items-center justify-center shadow-lg"
                                                      title="Naar Live View"
                                                    >
                                                      <Tv size={14} />
                                                    </button>
                                                  )}
                                                  {isFinished && (
                                                    <button
                                                      onClick={() => {
                                                        setLiveMatchId(
                                                          match.id,
                                                        );
                                                      }}
                                                      className="w-8 h-8 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center shadow-lg"
                                                      title="Details"
                                                    >
                                                      <Search size={14} />
                                                    </button>
                                                  )}

                                                  {/* Options: Payment / Restart / Move to Today */}
                                                  {(isClubAdmin(activeClub, currentUser) ||
                                                    currentUser.role ===
                                                      "admin" ||
                                                    currentUser.role ===
                                                      "planner") && (
                                                    <>
                                                      {isCancelled && (
                                                        <button
                                                          onClick={() =>
                                                            showConfirm(
                                                              "Wedstrijd Herstarten",
                                                              "Weet je zeker dat je deze geannuleerde wedstrijd wilt herstarten? De status wordt teruggezet naar gepland.",
                                                              () =>
                                                                restartMatch(
                                                                  match.id,
                                                                ),
                                                            )
                                                          }
                                                          className="w-8 h-8 bg-amber-500 text-white rounded-full hover:bg-amber-400 transition-colors flex items-center justify-center ml-1"
                                                          title="Wedstrijd herstarten"
                                                        >
                                                          <RotateCcw
                                                            size={14}
                                                          />
                                                        </button>
                                                      )}

                                                      {!isCancelled &&
                                                        !isPast &&
                                                        !isSameDay(
                                                          date,
                                                          new Date(),
                                                        ) &&
                                                        isPlanned && (
                                                          <button
                                                            onClick={() =>
                                                              showConfirm(
                                                                "Verplaatsen",
                                                                "Deze wedstrijd verplaatsen naar Vandaag?",
                                                                () =>
                                                                  moveMatchToToday(
                                                                    match.id,
                                                                  ),
                                                              )
                                                            }
                                                            className="w-8 h-8 bg-amber-500 text-white rounded-full hover:bg-amber-400 transition-colors flex items-center justify-center ml-1"
                                                            title="Verplaats naar vandaag"
                                                          >
                                                            <Calendar
                                                              size={14}
                                                            />
                                                          </button>
                                                        )}

                                                        {isPlanned && (p1Absent || p2Absent) && (
                                                          <button
                                                            onClick={() => {
                                                              const absentId = p1Absent ? match.player1Id : match.player2Id;
                                                              const opponentId = p1Absent ? match.player2Id : match.player1Id;
                                                              setRescheduleOpponentModal({
                                                                isOpen: true,
                                                                dateStr: date.toISOString(),
                                                                absentUserId: absentId,
                                                                opponentUserId: opponentId,
                                                                seasonId: activeSeason?.id || "",
                                                                originalMatchId: match.id,
                                                              });
                                                            }}
                                                            className="w-8 h-8 bg-purple-500 text-white rounded-full hover:bg-purple-400 transition-colors flex items-center justify-center ml-1"
                                                            title="Zoek vervangende wedstrijd voor tegenstander"
                                                          >
                                                            <ArrowRightLeft size={14} />
                                                          </button>
                                                        )}
                                                    </>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {!isMatchesExpanded && hasMoreFutureMatches && (
                            <div className="flex justify-center pt-4 pb-8">
                              <button
                                onClick={() => setIsMatchesExpanded(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                              >
                                Toon alle toekomstige wedstrijden
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {data.matches.filter(
                      (m: Match) => m.seasonId === selectedSeasonId,
                    ).length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <Calendar
                            size={48}
                            className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
                          />
                          <p className="text-slate-500 dark:text-slate-400">
                            Er zijn nog geen wedstrijden gepland voor dit
                            seizoen.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {isMatchesExpanded && (
                  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
                    <button
                      onClick={() => {
                        setIsMatchesExpanded(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold shadow-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1"
                    >
                      <ChevronUp size={20} />
                      Verberg toekomstige wedstrijden
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "matches" && liveMatchId && (
              <motion.div
                key="live-match"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-7xl mx-auto space-y-8"
              >
                {(() => {
                  const match = liveMatch;
                  const currentSeason = liveCurrentSeason;
                  const isDriebanden = isDriebandenLive;
                  const maxTurns = liveMaxTurns;

                  const handleNextPlayer = () => {
                    if (activeScoringPlayer === 1) {
                      saveTurn(
                        liveMatchId!,
                        activeTurnIndex,
                        currentTurnP1,
                        currentTurnP2,
                      );

                      // Check if P1 reached target in Driebanden
                      if (
                        isDriebanden &&
                        p1Total >= (match?.player1AvgBefore || 0)
                      ) {
                        setTurnNotification(
                          "Speler 1 heeft zijn caramboles! Speler 2 krijgt de nastoot.",
                        );
                        setActiveScoringPlayer(2);
                        if (match && match.turns[activeTurnIndex]) {
                          setCurrentTurnP2(
                            match.turns[activeTurnIndex].player2,
                          );
                        } else {
                          setCurrentTurnP2(0);
                        }
                        return;
                      }

                      setActiveScoringPlayer(2);
                      if (match && match.turns[activeTurnIndex]) {
                        setCurrentTurnP2(match.turns[activeTurnIndex].player2);
                      } else {
                        setCurrentTurnP2(0);
                      }

                      // Keep notification if it's one of the last turns
                      if (activeTurnIndex === maxTurns - 1) {
                        setTurnNotification("Laatste beurt!");
                      } else if (activeTurnIndex === maxTurns - 2) {
                        setTurnNotification("Voorlaatste beurt!");
                      }
                    } else {
                      saveTurn(
                        liveMatchId!,
                        activeTurnIndex,
                        currentTurnP1,
                        currentTurnP2,
                      );

                      // Check if match should end in Driebanden
                      if (isDriebanden) {
                        if (p2Total >= (match?.player2AvgBefore || 0)) {
                          setTurnNotification(
                            "Speler 2 heeft zijn caramboles! Wedstrijd afgelopen.",
                          );
                          setTimeout(() => {
                            openFinishMatchModal();
                            setTurnNotification(null);
                          }, 2000);
                          return;
                        }
                        if (p1Total >= (match?.player1AvgBefore || 0)) {
                          setTurnNotification(
                            "Nastoot voltooid! Wedstrijd afgelopen.",
                          );
                          setTimeout(() => {
                            openFinishMatchModal();
                            setTurnNotification(null);
                          }, 2000);
                          return;
                        }
                      }

                      const nextIndex = activeTurnIndex + 1;

                      if (nextIndex >= maxTurns) {
                        setTurnNotification("Wedstrijd voltooid!");
                        setTimeout(() => {
                          openFinishMatchModal();
                          setTurnNotification(null);
                        }, 2000);
                        return;
                      }

                      if (nextIndex === maxTurns - 1) {
                        setTurnNotification("Laatste beurt!");
                      } else if (nextIndex === maxTurns - 2) {
                        setTurnNotification("Voorlaatste beurt!");
                      } else {
                        setTurnNotification(null);
                      }

                      if (match && nextIndex >= (match.turns || []).length) {
                        setData((prev: any) => ({
                          ...prev,
                          matches: prev.matches.map((m: Match) =>
                            m.id === liveMatchId
                              ? {
                                  ...m,
                                  turns: [
                                    ...m.turns,
                                    { player1: 0, player2: 0 },
                                  ],
                                }
                              : m,
                          ),
                        }));
                        setCurrentTurnP1(0);
                        setCurrentTurnP2(0);
                      } else if (match) {
                        setCurrentTurnP1(match.turns[nextIndex].player1);
                        setCurrentTurnP2(match.turns[nextIndex].player2);
                      }

                      setActiveTurnIndex(nextIndex);
                      setActiveScoringPlayer(1);
                    }
                  };

                  const handlePrevPlayer = () => {
                    if (activeScoringPlayer === 2) {
                      saveTurn(
                        liveMatchId!,
                        activeTurnIndex,
                        currentTurnP1,
                        currentTurnP2,
                      );
                      setActiveScoringPlayer(1);
                      if (match && match.turns[activeTurnIndex]) {
                        setCurrentTurnP1(match.turns[activeTurnIndex].player1);
                      }

                      // Update notification
                      if (activeTurnIndex === maxTurns - 1) {
                        setTurnNotification("Laatste beurt!");
                      } else if (activeTurnIndex === maxTurns - 2) {
                        setTurnNotification("Voorlaatste beurt!");
                      } else {
                        setTurnNotification(null);
                      }
                    } else if (activeTurnIndex > 0) {
                      saveTurn(
                        liveMatchId!,
                        activeTurnIndex,
                        currentTurnP1,
                        currentTurnP2,
                      );
                      const prevIndex = activeTurnIndex - 1;
                      setActiveTurnIndex(prevIndex);
                      setActiveScoringPlayer(2);
                      if (match && match.turns[prevIndex]) {
                        setCurrentTurnP1(match.turns[prevIndex].player1);
                        setCurrentTurnP2(match.turns[prevIndex].player2);
                      }

                      // Update notification
                      if (prevIndex === maxTurns - 1) {
                        setTurnNotification("Laatste beurt!");
                      } else if (prevIndex === maxTurns - 2) {
                        setTurnNotification("Voorlaatste beurt!");
                      } else {
                        setTurnNotification(null);
                      }
                    }
                  };

                  return (
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* P1 Side Column (Desktop Only) */}
                      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <table className="w-full text-center">
                          <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                              <th className="py-2">Bt</th>
                              <th className="py-2">Pnt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {Array.from({ length: maxTurns }).map((_, idx) => {
                              const turn = match?.turns[idx];
                              const isCurrent = idx === activeTurnIndex;
                              if (!turn && !isCurrent) return null;
                              return (
                                <tr
                                  key={idx}
                                  className={cn(
                                    "transition-colors",
                                    isCurrent
                                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                                      : "",
                                  )}
                                >
                                  <td className="py-2 text-[11px] text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td
                                    className={cn(
                                      "py-2 text-sm font-bold",
                                      isCurrent && activeScoringPlayer === 1
                                        ? "text-slate-800 dark:text-white"
                                        : "text-slate-700 dark:text-slate-300",
                                    )}
                                  >
                                    {isCurrent && activeScoringPlayer === 1
                                      ? currentTurnP1 === 0
                                        ? "-"
                                        : currentTurnP1
                                      : turn?.player1 === 0
                                        ? "-"
                                        : (turn?.player1 ?? "-")}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-slate-50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-white sticky bottom-0">
                              <td className="py-3 text-[10px]">TOT</td>
                              <td className="py-3 text-sm">{p1Total}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="flex-1 min-w-0 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
                          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Calendar size={24} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  Datum Wedstrijd
                                </p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                  {format(
                                    new Date(match?.date || new Date()),
                                    "dd MMMM yyyy",
                                    { locale: nl },
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-8">
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  Tafel
                                </p>
                                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {match?.tafelNummer || "-"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  Arbiter
                                </p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                  {(() => {
                                    const u = data.users.find(
                                      (u: User) => u.id === match?.arbiterId,
                                    );
                                    return (
                                      u?.shortName ||
                                      u?.name ||
                                      "Niet toegewezen"
                                    );
                                  })()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                  Schrijver
                                </p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                  {(() => {
                                    const u = data.users.find(
                                      (u: User) => u.id === match?.writerId,
                                    );
                                    return (
                                      u?.shortName ||
                                      u?.name ||
                                      "Niet toegewezen"
                                    );
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mb-8">
                            <div className="text-center flex-1">
                              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                                Speler 1
                              </p>
                              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                                {p1?.shortName || p1?.name}
                              </h3>
                              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                Gemiddelde:{" "}
                                {formatNumber(match?.player1AvgBefore || 0)}
                              </div>
                            </div>
                            <div className="w-px h-16 bg-slate-100 dark:bg-slate-800 mx-8" />
                            <div className="text-center flex-1">
                              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                                Speler 2
                              </p>
                              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                                {p2?.shortName || p2?.name}
                              </h3>
                              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-bold">
                                Gemiddelde:{" "}
                                {formatNumber(match?.player2AvgBefore || 0)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-8">
                            <div
                              className={cn(
                                "bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl text-center transition-all",
                                activeScoringPlayer === 1 &&
                                  "ring-4 ring-slate-200 dark:ring-slate-700",
                              )}
                            >
                              <div className="flex justify-center items-center gap-10 mb-1">
                                <div className="text-center">
                                  <div className="text-6xl font-black text-slate-800 dark:text-slate-100">
                                    {formatNumber(p1Confirmed)}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    Caramboles
                                  </div>
                                </div>
                                <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 opacity-50" />
                                <div className="text-center">
                                  <div className="text-6xl font-black text-slate-800 dark:text-slate-100">
                                    {formatNumber(
                                      calculatePoints(
                                        p1Confirmed,
                                        match?.player1AvgBefore || 1,
                                        p2Confirmed,
                                        match?.player2AvgBefore || 1,
                                        seasonOfMatch?.scoringSystem,
                                      ),
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    Punten
                                  </div>
                                </div>
                              </div>
                              <div className="min-h-[1.5rem] flex items-center justify-center mb-4">
                                {activeScoringPlayer === 1 && (
                                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                    ({formatNumber(currentTurnP1)})
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    Hoogste
                                  </p>
                                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                                    {Math.max(
                                      0,
                                      ...(match?.turns
                                        ?.slice(0, p1CompletedTurns)
                                        .map((t: any) => t.player1) || []),
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    Gem
                                  </p>
                                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                                    {formatDecimal(
                                      p1CompletedTurns > 0
                                        ? p1Confirmed / p1CompletedTurns
                                        : 0,
                                      2,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl text-center transition-all",
                                activeScoringPlayer === 2 &&
                                  "ring-4 ring-yellow-200 dark:ring-yellow-800",
                              )}
                            >
                              <div className="flex justify-center items-center gap-10 mb-1">
                                <div className="text-center">
                                  <div className="text-6xl font-black text-yellow-600 dark:text-yellow-400">
                                    {formatNumber(p2Confirmed)}
                                  </div>
                                  <div className="text-[10px] font-bold text-yellow-400 dark:text-yellow-500 uppercase">
                                    Caramboles
                                  </div>
                                </div>
                                <div className="w-px h-12 bg-yellow-400/30" />
                                <div className="text-center">
                                  <div className="text-6xl font-black text-yellow-600 dark:text-yellow-400">
                                    {formatNumber(
                                      calculatePoints(
                                        p2Confirmed,
                                        match?.player2AvgBefore || 1,
                                        p1Confirmed,
                                        match?.player1AvgBefore || 1,
                                        seasonOfMatch?.scoringSystem,
                                      ),
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-yellow-400 dark:text-yellow-500 uppercase">
                                    Punten
                                  </div>
                                </div>
                              </div>
                              <div className="min-h-[1.5rem] flex items-center justify-center mb-4">
                                {activeScoringPlayer === 2 && (
                                  <div className="text-lg font-black text-yellow-600 dark:text-yellow-400">
                                    ({formatNumber(currentTurnP2)})
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-yellow-100 dark:border-yellow-900/30">
                                <div>
                                  <p className="text-[10px] font-bold text-yellow-400 dark:text-yellow-500 uppercase">
                                    Hoogste
                                  </p>
                                  <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">
                                    {Math.max(
                                      0,
                                      ...(match?.turns
                                        ?.slice(0, p2CompletedTurns)
                                        .map((t: any) => t.player2) || []),
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-yellow-400 dark:text-yellow-500 uppercase">
                                    Gem
                                  </p>
                                  <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">
                                    {formatDecimal(
                                      p2CompletedTurns > 0
                                        ? p2Confirmed / p2CompletedTurns
                                        : 0,
                                      2,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Turn Entry - Simplified Scoring UI */}
                          {match?.status === "finished" ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center min-h-[300px]">
                              <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Trophy
                                    size={32}
                                    className="text-amber-500"
                                  />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                  Wedstrijd Voltooid
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                  Deze wedstrijd is afgerond en kan niet meer
                                  bewerkt worden.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                              <div className="flex flex-col items-center space-y-4">
                                <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 uppercase font-black text-xs tracking-widest">
                                  <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                                  Beurt {activeTurnIndex + 1}
                                  <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                                </div>

                                {activeTurnIndex === maxTurns - 1 && (
                                  <div className="px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-sm rounded-full border border-red-200 dark:border-red-800 shadow-sm animate-pulse">
                                    Laatste beurt!
                                  </div>
                                )}
                                {activeTurnIndex === maxTurns - 2 && (
                                  <div className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest text-sm rounded-full border border-orange-200 dark:border-orange-800 shadow-sm animate-pulse relative">
                                    <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping" />
                                    <span className="relative z-10">
                                      Voorlaatste beurt!
                                    </span>
                                  </div>
                                )}

                                <div className="text-center">
                                  <div className="relative">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0 md:absolute md:-left-14 md:top-1/2 md:-translate-y-1/2 md:flex-col justify-center">
                                      <button
                                        onClick={triggerNiceBallAnimation}
                                        title="Mooie bal!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center text-2xl hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        ✨
                                      </button>
                                      <button
                                        onClick={triggerPigAnimation}
                                        title="Varken!"
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-2xl hover:bg-pink-100 dark:hover:bg-pink-800/40 transition-all shadow-sm active:scale-95"
                                      >
                                        🐷
                                      </button>
                                    </div>
                                    <input
                                      ref={scoringInputRef}
                                      type="number"
                                      value={
                                        activeScoringPlayer === 1
                                          ? currentTurnP1
                                          : currentTurnP2
                                      }
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        if (activeScoringPlayer === 1)
                                          setCurrentTurnP1(val);
                                        else setCurrentTurnP2(val);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleNextPlayer();
                                        }
                                      }}
                                      placeholder="0"
                                      className={cn(
                                        "w-36 h-36 rounded-3xl text-6xl font-black text-center outline-none transition-all border-4 shadow-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                        activeScoringPlayer === 1
                                          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-4 focus:ring-slate-500/20"
                                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 focus:ring-4 focus:ring-yellow-500/20",
                                      )}
                                    />
                                    <div className="flex items-center gap-4 mt-4 md:mt-0 md:absolute md:-right-14 md:top-1/2 md:-translate-y-1/2 md:flex-col">
                                      <button
                                        onClick={() => {
                                          if (activeScoringPlayer === 1)
                                            setCurrentTurnP1(
                                              (prev) => prev + 1,
                                            );
                                          else
                                            setCurrentTurnP2(
                                              (prev) => prev + 1,
                                            );
                                        }}
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                      >
                                        <Plus size={20} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (activeScoringPlayer === 1)
                                            setCurrentTurnP1((prev) =>
                                              Math.max(0, prev - 1),
                                            );
                                          else
                                            setCurrentTurnP2((prev) =>
                                              Math.max(0, prev - 1),
                                            );
                                        }}
                                        className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                      >
                                        <Minus size={20} />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 w-full max-w-md">
                                  <button
                                    onClick={handlePrevPlayer}
                                    className="flex-1 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
                                  >
                                    <ChevronLeft size={20} />
                                    Vorige
                                  </button>
                                  <button
                                    onClick={handleNextPlayer}
                                    className="flex-[2] px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                  >
                                    Volgende
                                    <ChevronRight size={20} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detailed Table (Mobile only) */}
                        <div className="lg:hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <TableIcon size={18} />
                            Gedetailleerd Wedstrijdverloop
                          </div>
                          <div>
                            <table className="w-full text-center">
                              <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                  <th className="py-3">Beurt</th>
                                  <th className="py-3">
                                    {p1?.shortName || p1?.name}
                                  </th>
                                  <th className="py-3">
                                    {p2?.shortName || p2?.name}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {(() => {
                                  return Array.from({ length: maxTurns }).map(
                                    (_, idx) => {
                                      const turn = match?.turns[idx];
                                      const isCurrent = idx === activeTurnIndex;
                                      const isPlayed = !!turn || isCurrent;

                                      if (!isPlayed) {
                                        return (
                                          <tr key={idx} className="opacity-20">
                                            <td className="py-3 text-slate-400">
                                              {idx + 1}
                                            </td>
                                            <td className="py-3 text-slate-400">
                                              -
                                            </td>
                                            <td className="py-3 text-slate-400">
                                              -
                                            </td>
                                          </tr>
                                        );
                                      }

                                      return (
                                        <tr
                                          key={idx}
                                          className={cn(
                                            "transition-colors",
                                            isCurrent
                                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                                              : "",
                                          )}
                                        >
                                          <td
                                            className={cn(
                                              "py-3 font-medium",
                                              isCurrent
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-slate-400 dark:text-slate-500",
                                            )}
                                          >
                                            {idx + 1}
                                            {isCurrent && (
                                              <span className="ml-2 text-[10px] uppercase font-black">
                                                Huidig
                                              </span>
                                            )}
                                          </td>
                                          <td
                                            className={cn(
                                              "py-3 font-bold",
                                              isCurrent &&
                                                activeScoringPlayer === 1
                                                ? "text-slate-800 dark:text-slate-100 text-xl font-black"
                                                : "text-slate-700 dark:text-slate-200",
                                            )}
                                          >
                                            {isCurrent &&
                                            activeScoringPlayer === 1
                                              ? currentTurnP1 === 0
                                                ? "-"
                                                : currentTurnP1
                                              : turn?.player1 === 0
                                                ? "-"
                                                : (turn?.player1 ?? "-")}
                                            {isCurrent &&
                                              activeScoringPlayer === 1 && (
                                                <span className="ml-1 animate-pulse">
                                                  ●
                                                </span>
                                              )}
                                          </td>
                                          <td
                                            className={cn(
                                              "py-3 font-bold",
                                              isCurrent &&
                                                activeScoringPlayer === 2
                                                ? "text-yellow-600 dark:text-yellow-400 text-xl font-black"
                                                : "text-slate-700 dark:text-slate-200",
                                            )}
                                          >
                                            {isCurrent &&
                                            activeScoringPlayer === 2
                                              ? currentTurnP2 === 0
                                                ? "-"
                                                : currentTurnP2
                                              : turn?.player2 === 0
                                                ? "-"
                                                : (turn?.player2 ?? "-")}
                                            {isCurrent &&
                                              activeScoringPlayer === 2 && (
                                                <span className="ml-1 animate-pulse">
                                                  ●
                                                </span>
                                              )}
                                          </td>
                                        </tr>
                                      );
                                    },
                                  );
                                })()}
                                <tr className="bg-slate-50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-white sticky bottom-0">
                                  <td className="py-4">TOTAAL</td>
                                  <td className="py-4 text-slate-800 dark:text-slate-100">
                                    {p1Total}
                                  </td>
                                  <td className="py-4 text-yellow-600 dark:text-yellow-400">
                                    {p2Total}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {match?.status !== "finished" && (
                          <div className="flex justify-center gap-4 mt-8">
                            <button
                              onClick={() => {
                                setP1Paid(true);
                                setP2Paid(true);
                                setIsCancelMatchModalOpen(true);
                              }}
                              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                            >
                              Wedstrijd annuleren
                            </button>
                          </div>
                        )}
                      </div>

                      {/* P2 Side Column (Desktop Only) */}
                      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <table className="w-full text-center">
                          <thead>
                            <tr className="bg-yellow-50/50 dark:bg-yellow-900/10 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase border-b border-yellow-100 dark:border-yellow-900/20">
                              <th className="py-2">Bt</th>
                              <th className="py-2">Pnt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-yellow-50 dark:divide-yellow-900/20">
                            {Array.from({ length: maxTurns }).map((_, idx) => {
                              const turn = match?.turns[idx];
                              const isCurrent = idx === activeTurnIndex;
                              if (!turn && !isCurrent) return null;
                              return (
                                <tr
                                  key={idx}
                                  className={cn(
                                    "transition-colors",
                                    isCurrent
                                      ? "bg-yellow-50/80 dark:bg-yellow-900/30"
                                      : "",
                                  )}
                                >
                                  <td className="py-2 text-[11px] text-yellow-600/70 dark:text-yellow-400/70">
                                    {idx + 1}
                                  </td>
                                  <td
                                    className={cn(
                                      "py-2 text-sm font-bold",
                                      isCurrent && activeScoringPlayer === 2
                                        ? "text-yellow-700 dark:text-yellow-300"
                                        : "text-yellow-600 dark:text-yellow-400",
                                    )}
                                  >
                                    {isCurrent && activeScoringPlayer === 2
                                      ? currentTurnP2 === 0
                                        ? "-"
                                        : currentTurnP2
                                      : turn?.player2 === 0
                                        ? "-"
                                        : (turn?.player2 ?? "-")}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-yellow-100 dark:bg-yellow-900/40 font-black text-yellow-700 dark:text-yellow-300 sticky bottom-0">
                              <td className="py-3 text-[10px]">TOT</td>
                              <td className="py-3 text-sm">{p2Total}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                      Instellingen
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      Pas de weergave en voorkeuren van de applicatie aan.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                          {theme === "light" ? (
                            <Sun size={20} />
                          ) : (
                            <Moon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">
                            Thema
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Wissel tussen licht en donker thema
                          </p>
                        </div>
                      </div>
                      <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button
                          onClick={() => setTheme("light")}
                          className={cn(
                            "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                            theme === "light"
                              ? "bg-emerald-600 text-white shadow-md"
                              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                          )}
                        >
                          <Sun size={16} />
                          Licht
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                            theme === "dark"
                              ? "bg-emerald-600 text-white shadow-md"
                              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                          )}
                        >
                          <Moon size={16} />
                          Donker
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        <strong>Opmerking:</strong> Het gekozen thema wordt
                        opgeslagen in je browser en automatisch toegepast bij je
                        volgende bezoek.
                      </p>
                    </div>
                  </div>
                </div>

                {activeClub && isClubAdmin(activeClub, currentUser) && (
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 mt-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Club Instellingen
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        Beheer instellingen voor {activeClub.name}.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Sjabloon Uitnodigingsmail
                        </label>
                        <textarea
                          value={activeClub.inviteEmailTemplate || `Beste {naam},\n\nJe bent uitgenodigd om lid te worden van biljartclub {clubNaam}.\n\nKlik op de onderstaande link om de uitnodiging te accepteren en een account aan te maken:\n{inviteLink}\n\nMet vriendelijke groet,\nDe beheerder`}
                          onChange={(e) => {
                            setData((prev: any) => ({
                              ...prev,
                              clubs: prev.clubs.map((c: Club) => 
                                c.id === activeClub.id 
                                  ? { ...c, inviteEmailTemplate: e.target.value }
                                  : c
                              )
                            }));
                          }}
                          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 min-h-[200px]"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Beschikbare variabelen: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{'{naam}'}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{'{clubNaam}'}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{'{inviteLink}'}</code>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-50 px-2 h-16 transition-colors shadow-[0_-4px_10px_rgba(0,0,0,0.05)] overflow-x-auto">
          <MobileNavTab
            icon={<Building2 size={22} />}
            label="Clubs"
            active={activeTab === "clubs"}
            onClick={() => setActiveTab("clubs")}
          />
          {selectedClubId ? (
            <>
              <MobileNavTab
                icon={<Users size={22} />}
                label="Leden"
                active={activeTab === "members"}
                onClick={() => setActiveTab("members")}
              />
              <MobileNavTab
                icon={<Calendar size={22} />}
                label="Seizoenen"
                active={activeTab === "seasons"}
                onClick={() => setActiveTab("seasons")}
              />
              {activeClub?.participatesInExternalMatches && (
                <MobileNavTab
                  icon={<Trophy size={22} />}
                  label="Uit & Thuis"
                  active={activeTab === "external-matches"}
                  onClick={() => setActiveTab("external-matches")}
                />
              )}
              <MobileNavTab
                icon={<History size={22} />}
                label="Wedstrijden"
                active={activeTab === "matches"}
                onClick={() => setActiveTab("matches")}
              />
              {currentUser.role === "admin" && (
                <MobileNavTab
                  icon={<Wallet size={22} />}
                  label="Kasboek"
                  active={activeTab === "cashbook"}
                  onClick={() => setActiveTab("cashbook")}
                />
              )}
            </>
          ) : (
            <div className="flex-1" />
          )}
          <MobileNavTab
            icon={<UserCircle size={22} />}
            label="Profiel"
            active={
              activeTab === "profile" && selectedProfileId === currentUser.id
            }
            onClick={() => {
              setSelectedProfileId(currentUser.id);
              setActiveTab("profile");
            }}
          />
          <MobileNavTab
            icon={<LogOut size={22} />}
            label="Uitloggen"
            active={false}
            onClick={() => auth.signOut()}
          />
        </nav>
      </main>

      {/* Club Creation Modal */}
      <AnimatePresence>
        {isClubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsClubModalOpen(false);
                setEditingClubId(null);
                setNewClubName("");
                setNewClubLogo("");
                        setNewClubLogoFile(null);
                        setLogoError("");
                        setIsUploadingLogo(false);
                        setNewClubCoAdminEmails("");
                        setNewClubParticipatesExternal(false);
                      }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingClubId ? "Club Wijzigen" : "Nieuwe Biljartclub"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editingClubId
                    ? "Pas de gegevens van je club aan."
                    : "Geef je club een naam en logo om te beginnen."}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Club Naam
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      newClubName &&
                      createClub(newClubName, newClubLogo, newClubParticipatesExternal, newClubCoAdminEmails)
                    }
                    placeholder="Bijv. De Groene Laken"
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Logo URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newClubLogo}
                      onChange={(e) => setNewClubLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                    />
                    {newClubLogo && (
                      <div className="h-12 w-12 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <img
                          src={newClubLogo}
                          alt="Preview"
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    Voer een URL in naar een afbeelding voor je clublogo.
                  </p>
                  
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Of upload een bestand (Max 2MB, 2000x2000px, JPG/PNG)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg, image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setLogoError("");
                        setNewClubLogoFile(null);
                        
                        // Check size (max 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                          setLogoError("Bestand is te groot (maximaal 2MB).");
                          e.target.value = '';
                          return;
                        }
                        
                        // Check dimensions
                        const img = new Image();
                        const objectUrl = URL.createObjectURL(file);
                        img.onload = () => {
                          if (img.width > 2000 || img.height > 2000) {
                            setLogoError("Afbeelding is te groot (maximaal 2000x2000 pixels).");
                            setNewClubLogoFile(null);
                          } else {
                            setNewClubLogoFile(file);
                            setNewClubLogo(objectUrl);
                          }
                        };
                        img.onerror = () => {
                          setLogoError("Fout bij het lezen van de afbeelding.");
                          setNewClubLogoFile(null);
                        };
                        img.src = objectUrl;
                      }}
                      className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 transition-colors"
                    />
                    {logoError && (
                      <p className="mt-1 text-xs text-red-500">{logoError}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Mede-beheerders (Emails, gescheiden door komma's)
                  </label>
                  <input
                    type="text"
                    value={newClubCoAdminEmails}
                    onChange={(e) => setNewClubCoAdminEmails(e.target.value)}
                    placeholder="bijv. admin2@club.com, test@club.com"
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                  <p className="mt-1 mb-4 text-[10px] text-slate-400 dark:text-slate-500">
                    Gebruikers met deze e-mailadressen krijgen ook beheerdersrechten (zoals biljartclubkot@gmail.com).
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClubParticipatesExternal}
                      onChange={(e) =>
                        setNewClubParticipatesExternal(e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Meedoen aan uit- en thuiswedstrijden
                    </span>
                  </label>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => {
                    setIsClubModalOpen(false);
                    setEditingClubId(null);
                    setNewClubName("");
                    setNewClubLogo("");
                    setNewClubParticipatesExternal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={!newClubName || isUploadingLogo}
                  onClick={async () => {
                    let logoUrl = newClubLogo;
                    if (newClubLogoFile) {
                      setIsUploadingLogo(true);
                      try {
                        const fileRef = ref(storage, `club_logos/${Date.now()}_${newClubLogoFile.name}`);
                        await uploadBytes(fileRef, newClubLogoFile);
                        logoUrl = await getDownloadURL(fileRef);
                      } catch (err: any) {
                        console.error("Fout bij uploaden:", err);
                        alert("Fout bij uploaden van logo: " + err.message);
                        setIsUploadingLogo(false);
                        return;
                      }
                      setIsUploadingLogo(false);
                    }
                    createClub(
                      newClubName,
                      logoUrl,
                      newClubParticipatesExternal,
                      newClubCoAdminEmails
                    );
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isUploadingLogo ? <span className="animate-pulse">Uploaden...</span> : editingClubId ? "Opslaan" : "Club Aanmaken"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Season Creation Modal */}
      <AnimatePresence>
        {isSeasonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSeasonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Nieuw Seizoen
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Stel een nieuw seizoen in voor {activeClub?.name}.
                </p>
              </div>
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Linker kolom: Algemene instellingen */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                        Seizoen Naam
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={newSeasonName}
                        onChange={(e) => setNewSeasonName(e.target.value)}
                        placeholder="Bijv. Seizoen 2026 Voorjaar"
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                        Speeldagen per week
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day}
                            onClick={() => {
                              setNewSeasonSpeeldagen((prev) =>
                                prev.includes(day)
                                  ? prev.filter((d) => d !== day)
                                  : [...prev, day],
                              );
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                              newSeasonSpeeldagen.includes(day)
                                ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-800",
                            )}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Tegen elkaar (x)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newSeasonMatchesPerPair}
                          onChange={(e) =>
                            setNewSeasonMatchesPerPair(
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Beurten p.w.
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newSeasonBeurten}
                          onChange={(e) =>
                            setNewSeasonBeurten(parseInt(e.target.value) || 30)
                          }
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Matches per speeldag
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newSeasonMatchesPerDay}
                          onChange={(e) =>
                            setNewSeasonMatchesPerDay(
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Tafels
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newSeasonAantalTafels}
                          onChange={(e) =>
                            setNewSeasonAantalTafels(
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Contributie
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            €
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={newSeasonContributie}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^[0-9,.]*$/.test(val))
                                setNewSeasonContributie(val);
                            }}
                            onBlur={() => {
                              const num =
                                parseFloat(
                                  newSeasonContributie.replace(",", "."),
                                ) || 0;
                              setNewSeasonContributie(formatDecimal(num));
                            }}
                            className="w-full pl-8 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Inleg p.w.
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            €
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={newSeasonInleg}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^[0-9,.]*$/.test(val))
                                setNewSeasonInleg(val);
                            }}
                            onBlur={() => {
                              const num =
                                parseFloat(newSeasonInleg.replace(",", ".")) ||
                                0;
                              setNewSeasonInleg(formatDecimal(num));
                            }}
                            className="w-full pl-8 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                        Puntentelling Systeem
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setNewSeasonScoringSystem("default")}
                          className={cn(
                            "flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                            newSeasonScoringSystem === "default"
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-800",
                          )}
                        >
                          <Trophy size={20} />
                          <div>
                            <p className="text-sm font-bold">Standaard</p>
                            <p className="text-[10px] opacity-70">
                              10 punten systeem
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setNewSeasonScoringSystem("driebanden")
                          }
                          className={cn(
                            "flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                            newSeasonScoringSystem === "driebanden"
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400"
                              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-800",
                          )}
                        >
                          <TrendingUp size={20} />
                          <div>
                            <p className="text-sm font-bold">Driebanden</p>
                            <p className="text-[10px] opacity-70">
                              BOG/KOT Reglement
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rechter kolom: Leden & Kasbeheer */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                        Spelers toevoegen ({newSeasonMemberIds.length})
                      </label>
                      <div className="space-y-1 max-h-[250px] overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        {(activeClub?.memberIds || []).map((memberId) => {
                          const member = data.users.find(
                            (u: User) => u.id === memberId,
                          );
                          const isSelected =
                            newSeasonMemberIds.includes(memberId);
                          return (
                            <button
                              key={memberId}
                              onClick={() => {
                                setNewSeasonMemberIds((prev) =>
                                  prev.includes(memberId)
                                    ? prev.filter((id) => id !== memberId)
                                    : [...prev, memberId],
                                );
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm",
                                isSelected
                                  ? "bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                  : "hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 border border-transparent",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    isSelected
                                      ? "bg-emerald-500"
                                      : "bg-slate-300 dark:bg-slate-700",
                                  )}
                                />
                                <span>{member?.name}</span>
                              </div>
                              {isSelected && (
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-600 dark:text-emerald-400"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Kasbeheer
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setNewSeasonInitialBalanceType("manual")
                          }
                          className={cn(
                            "flex-1 p-2 rounded-lg border text-[10px] font-bold transition-all",
                            newSeasonInitialBalanceType === "manual"
                              ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                              : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900",
                          )}
                        >
                          Handmatig
                        </button>
                        <button
                          onClick={() =>
                            setNewSeasonInitialBalanceType("carryover")
                          }
                          className={cn(
                            "flex-1 p-2 rounded-lg border text-[10px] font-bold transition-all",
                            newSeasonInitialBalanceType === "carryover"
                              ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                              : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900",
                          )}
                        >
                          Vorig seizoen
                        </button>
                      </div>

                      {newSeasonInitialBalanceType === "manual" ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                            Start kassaldo
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                              €
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={newSeasonInitialBalanceAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^[0-9,.]*$/.test(val))
                                  setNewSeasonInitialBalanceAmount(val);
                              }}
                              onBlur={() => {
                                const num =
                                  parseFloat(
                                    newSeasonInitialBalanceAmount.replace(
                                      ",",
                                      ".",
                                    ),
                                  ) || 0;
                                setNewSeasonInitialBalanceAmount(
                                  formatDecimal(num),
                                );
                              }}
                              className="w-full pl-8 pr-2.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                            Kies vorig seizoen
                          </label>
                          <select
                            value={newSeasonCarryoverSeasonId}
                            onChange={(e) =>
                              setNewSeasonCarryoverSeasonId(e.target.value)
                            }
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors appearance-none"
                          >
                            <option value="">Selecteer seizoen...</option>
                            {data.seasons
                              .filter(
                                (s: Season) => s.clubId === activeClub?.id,
                              )
                              .map((s: Season) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  <strong>Tip:</strong> Alleen de geselecteerde spelers worden
                  opgenomen in de planning voor dit seizoen. Zorg dat de
                  contributie en inleg per wedstrijd correct zijn ingevuld voor
                  het kasboek.
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setIsSeasonModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={
                    !newSeasonName ||
                    newSeasonSpeeldagen.length === 0 ||
                    newSeasonMemberIds.length < 2
                  }
                  onClick={() => {
                    const parsedContributie =
                      typeof newSeasonContributie === "string"
                        ? parseFloat(newSeasonContributie.replace(",", "."))
                        : newSeasonContributie;
                    const parsedInleg =
                      typeof newSeasonInleg === "string"
                        ? parseFloat(newSeasonInleg.replace(",", "."))
                        : newSeasonInleg;
                    const parsedBalance =
                      typeof newSeasonInitialBalanceAmount === "string"
                        ? parseFloat(
                            newSeasonInitialBalanceAmount.replace(",", "."),
                          )
                        : newSeasonInitialBalanceAmount;

                    createSeason({
                      name: newSeasonName,
                      members: newSeasonMemberIds as any,
                      speeldagen: newSeasonSpeeldagen,
                      matchesPerPair: newSeasonMatchesPerPair,
                      beurtenPerWedstrijd: newSeasonBeurten,
                      wedstrijdenPerSpeeldag: newSeasonMatchesPerDay,
                      contributie: parsedContributie,
                      inlegPerWedstrijd: parsedInleg,
                      aantalTafels: newSeasonAantalTafels,
                      initialBalanceType: newSeasonInitialBalanceType,
                      initialBalanceAmount: parsedBalance,
                      carryoverSeasonId: newSeasonCarryoverSeasonId,
                    });
                    setIsSeasonModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Seizoen Starten
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransactionModalOpen && transactionSeasonId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransactionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingTransactionId
                    ? "Transactie Wijzigen"
                    : "Transactie Toevoegen"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {editingTransactionId
                    ? "Pas de gegevens van de transactie aan."
                    : "Voeg een handmatige in- of uitgave toe."}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Omschrijving
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    placeholder="Bijv. Rondje drank, Rommelmarkt..."
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Inkomst
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold">
                        €
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={transactionIncome}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9,.]*$/.test(val)) {
                            setTransactionIncome(val);
                            if (val) setTransactionExpense("");
                          }
                        }}
                        onBlur={() => {
                          if (transactionIncome) {
                            const num =
                              parseFloat(transactionIncome.replace(",", ".")) ||
                              0;
                            setTransactionIncome(formatDecimal(num));
                          }
                        }}
                        placeholder="0,00"
                        className="w-full pl-8 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Uitgave
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-600 dark:text-rose-400 font-bold">
                        €
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={transactionExpense}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9,.]*$/.test(val)) {
                            setTransactionExpense(val);
                            if (val) setTransactionIncome("");
                          }
                        }}
                        onBlur={() => {
                          if (transactionExpense) {
                            const num =
                              parseFloat(
                                transactionExpense.replace(",", "."),
                              ) || 0;
                            setTransactionExpense(formatDecimal(num));
                          }
                        }}
                        placeholder="0,00"
                        className="w-full pl-8 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold focus:ring-2 focus:ring-rose-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => {
                    setIsTransactionModalOpen(false);
                    setEditingTransactionId(null);
                    setTransactionDescription("");
                    setTransactionIncome("");
                    setTransactionExpense("");
                    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
                  }}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={
                    !transactionDescription ||
                    (!transactionIncome && !transactionExpense)
                  }
                  onClick={() => {
                    const amount = transactionIncome
                      ? parseFloat(transactionIncome)
                      : -parseFloat(transactionExpense);
                    if (editingTransactionId) {
                      updateTransaction(
                        transactionSeasonId!,
                        editingTransactionId,
                        {
                          description: transactionDescription,
                          amount: amount,
                          date: transactionDate,
                          type: "manual",
                        },
                      );
                    } else {
                      addTransaction(transactionSeasonId!, {
                        description: transactionDescription,
                        amount: amount,
                        date: transactionDate,
                        type: "manual",
                      });
                    }
                    setIsTransactionModalOpen(false);
                    setEditingTransactionId(null);
                    setTransactionDescription("");
                    setTransactionIncome("");
                    setTransactionExpense("");
                    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingTransactionId ? "Opslaan" : "Toevoegen"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Creation Modal */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMemberModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingMemberId ? "Lid Wijzigen" : "Nieuw Lid Toevoegen"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editingMemberId
                    ? `Wijzig de gegevens van dit lid.`
                    : `Voeg een nieuw lid toe aan ${activeClub?.name}.`}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Naam
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newMemberName || ""}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Naam van het lid"
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Verkorte Naam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={newMemberShortName || ""}
                    onChange={(e) => setNewMemberShortName(e.target.value)}
                    placeholder="Bijv. Hans jr."
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Wordt gebruikt in het aanwezigheidsoverzicht.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail || ""}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="email@voorbeeld.nl"
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Start Gemiddelde (Libre)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMemberAvg ?? 0}
                    onChange={(e) =>
                      setNewMemberAvg(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMemberParticipatesExternal}
                      onChange={(e) =>
                        setNewMemberParticipatesExternal(e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Meedoen aan uit- en thuiswedstrijden
                    </span>
                  </label>
                </div>
                {currentUser.role === "admin" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Rol
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="member">Speler</option>
                      <option value="planner">Planner</option>
                      <option value="admin">Beheerder</option>
                    </select>
                  </div>
                )}
                {!editingMemberId && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMemberSendInvite}
                        onChange={(e) => setNewMemberSendInvite(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Stuur uitnodigingsmail
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => {
                    setIsMemberModalOpen(false);
                    setEditingMemberId(null);
                    setNewMemberName("");
                    setNewMemberShortName("");
                    setNewMemberEmail("");
                    setNewMemberAvg(20);
                    setNewMemberRole("member");
                    setNewMemberParticipatesExternal(false);
                    setNewMemberSendInvite(true);
                  }}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={!newMemberName || !newMemberEmail}
                  onClick={() => {
                    if (editingMemberId) {
                      updateMember(
                        editingMemberId,
                        newMemberName,
                        newMemberEmail,
                        newMemberAvg,
                        newMemberShortName,
                        newMemberRole,
                        newMemberParticipatesExternal,
                      );
                    } else {
                      addNewMember(
                        newMemberName,
                        newMemberEmail,
                        newMemberAvg,
                        newMemberShortName,
                        newMemberRole,
                        newMemberParticipatesExternal,
                        newMemberSendInvite,
                      );
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingMemberId ? "Opslaan" : "Lid Toevoegen"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Opponent Modal */}
      <AnimatePresence>
        {rescheduleOpponentModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setRescheduleOpponentModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Speler afgemeld
                </h3>
                <button
                  onClick={() => setRescheduleOpponentModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300">
                  {(() => {
                    const absentUser = data.users.find((u: User) => u.id === rescheduleOpponentModal.absentUserId);
                    const opponentUser = data.users.find((u: User) => u.id === rescheduleOpponentModal.opponentUserId);
                    return `${absentUser?.name} is afgemeld. Wil je een andere geplande wedstrijd van ${opponentUser?.name} naar vandaag verplaatsen?`;
                  })()}
                </p>

                <div className="overflow-x-auto overflow-y-auto max-h-[50vh] rounded-lg border border-slate-200 dark:border-slate-800 relative">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Datum</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Tegenstander</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Actie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {(() => {
                        const targetDateIso = rescheduleOpponentModal.dateStr;
                        const futureMatches = data.matches.filter((m: Match) => {
                          if (m.seasonId !== rescheduleOpponentModal.seasonId) return false;
                          if (m.status !== "planned") return false;
                          if (m.id === rescheduleOpponentModal.originalMatchId) return false;
                          if (m.player1Id !== rescheduleOpponentModal.opponentUserId && m.player2Id !== rescheduleOpponentModal.opponentUserId) return false;
                          
                          const matchDateStr = format(new Date(m.date), "yyyy-MM-dd");
                          const targetDateFormatted = format(new Date(targetDateIso), "yyyy-MM-dd");
                          
                          return matchDateStr > targetDateFormatted;
                        }).sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());

                        if (futureMatches.length === 0) {
                          return (
                            <tr>
                              <td colSpan={3} className="px-4 py-4 text-center text-slate-500">
                                Geen geplande toekomstige wedstrijden gevonden.
                              </td>
                            </tr>
                          );
                        }

                        return futureMatches.map((m: Match) => {
                          const opponentId = m.player1Id === rescheduleOpponentModal.opponentUserId ? m.player2Id : m.player1Id;
                          const opponent = data.users.find((u: User) => u.id === opponentId);
                          
                          return (
                            <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                {format(new Date(m.date), "d MMM yyyy", { locale: nl })}
                              </td>
                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                {opponent?.name || "Onbekend"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => {
                                    moveMatchToDate(m.id, targetDateIso);
                                    setRescheduleOpponentModal(null);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors font-medium"
                                >
                                  Verplaatsen
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setRescheduleOpponentModal(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Season Confirmation Modal */}
      <AnimatePresence>
        {isDeleteSeasonModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteSeasonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center">
                <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Seizoen verwijderen?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Weet je zeker dat je het seizoen wilt verwijderen? Dit kan
                  niet ongedaan worden gemaakt.
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setIsDeleteSeasonModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Nee
                </button>
                <button
                  onClick={() =>
                    seasonToDeleteId && deleteSeason(seasonToDeleteId)
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Ja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete External Match Confirmation Modal */}
      <AnimatePresence>
        {isDeleteExternalMatchModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteExternalMatchModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center">
                <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Uit & Thuiswedstrijd verwijderen?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Weet je zeker dat je deze uit & thuiswedstrijd wilt
                  verwijderen? Dit kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setIsDeleteExternalMatchModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Nee
                </button>
                <button
                  onClick={() =>
                    externalMatchToDeleteId &&
                    deleteExternalMatch(externalMatchToDeleteId)
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Ja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Settings Modal */}
      <AnimatePresence>
        {isUserSettingsModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserSettingsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Gebruikersinstellingen
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Beheer je persoonlijke gegevens.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    {userSettingsAvatar ? (
                      <img
                        src={userSettingsAvatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-slate-100 dark:border-slate-800">
                        <UserCircle size={48} />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        showPrompt(
                          "Avatar URL",
                          "Voer de URL van je avatar in:",
                          userSettingsAvatar,
                          (url) => setUserSettingsAvatar(url),
                        );
                      }}
                      className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userSettingsEmail || ""}
                    onChange={(e) => setUserSettingsEmail(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Verkorte Naam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={userSettingsShortName || ""}
                    onChange={(e) => setUserSettingsShortName(e.target.value)}
                    placeholder="Bijv. Hans sr."
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Start Gemiddelde
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={userSettingsAvg ?? 0}
                    onChange={(e) =>
                      setUserSettingsAvg(parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userSettingsParticipatesExternal}
                      onChange={(e) =>
                        setUserSettingsParticipatesExternal(e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Meedoen aan uit- en thuiswedstrijden
                    </span>
                  </label>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setIsUserSettingsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() =>
                    updateUserSettings(
                      userSettingsEmail,
                      userSettingsAvg,
                      userSettingsAvatar,
                      userSettingsShortName,
                      userSettingsParticipatesExternal,
                    )
                  }
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      {paymentConfig && (
        <PaymentModal
          isOpen={paymentConfig.isOpen}
          onClose={() => setPaymentConfig({ ...paymentConfig, isOpen: false })}
          onSuccess={() => {
            paymentConfig.onSuccess();
            setPaymentConfig(null);
          }}
          amount={paymentConfig.amount}
          description={paymentConfig.description}
        />
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && confirmModalConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {confirmModalConfig.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {confirmModalConfig.message}
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                {confirmModalConfig.onCancel !== undefined && (
                  <button
                    onClick={() => {
                      if (confirmModalConfig.onCancel)
                        confirmModalConfig.onCancel();
                      setIsConfirmModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Nee
                  </button>
                )}
                <button
                  onClick={() => {
                    confirmModalConfig.onConfirm();
                    setIsConfirmModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {confirmModalConfig.onCancel !== undefined ? "Ja" : "OK"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prompt Modal */}
      <AnimatePresence>
        {isPromptModalOpen && promptModalConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPromptModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {promptModalConfig.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                  {promptModalConfig.message}
                </p>
                <input
                  autoFocus
                  type="text"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      promptModalConfig.onConfirm(promptValue);
                      setIsPromptModalOpen(false);
                    }
                  }}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setIsPromptModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => {
                    promptModalConfig.onConfirm(promptValue);
                    setIsPromptModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Bevestigen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isMatchDetailModalOpen && selectedMatchIdForDetail && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMatchDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
            >
              {(() => {
                const match = data.matches.find(
                  (m: Match) => m.id === selectedMatchIdForDetail,
                );
                if (!match) return null;
                const seasonOfMatch = data.seasons.find(
                  (s: Season) => s.id === match.seasonId,
                );
                const p1 = data.users.find(
                  (u: User) => u.id === match.player1Id,
                );
                const p2 = data.users.find(
                  (u: User) => u.id === match.player2Id,
                );
                const p1Total = (match.turns || []).reduce(
                  (acc, t) => acc + t.player1,
                  0,
                );
                const p2Total = (match.turns || []).reduce(
                  (acc, t) => acc + t.player2,
                  0,
                );
                const p1MaxSerie = Math.max(
                  0,
                  ...(match.turns || []).map((t) => t.player1),
                );
                const p2MaxSerie = Math.max(
                  0,
                  ...(match.turns || []).map((t) => t.player2),
                );
                const p1Avg = formatDecimal(
                  p1Total / ((match.turns || []).length || 1),
                  2,
                );
                const p2Avg = formatDecimal(
                  p2Total / ((match.turns || []).length || 1),
                  2,
                );

                return (
                  <>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                          Wedstrijd Detail
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {format(new Date(match.date), "dd MMMM yyyy", {
                            locale: nl,
                          })}
                          {match.tafelNummer && ` • Tafel ${match.tafelNummer}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsMatchDetailModalOpen(false)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                        <Plus
                          className="rotate-45 text-slate-400 dark:text-slate-500"
                          size={24}
                        />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                              {p1?.name?.[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Speler 1
                              </p>
                              <p className="font-bold text-slate-800 dark:text-white text-lg">
                                {p1?.shortName || p1?.name}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Totaal
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                {formatNumber(p1Total)}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Hoogste Serie
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {formatNumber(p1MaxSerie)}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Gemiddelde
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {p1Avg}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Punten
                              </p>
                              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {formatNumber(
                                  calculatePoints(
                                    p1Total,
                                    match.player1AvgBefore,
                                    p2Total,
                                    match.player2AvgBefore,
                                    seasonOfMatch?.scoringSystem,
                                  ),
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3 justify-end text-right">
                            <div>
                              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Speler 2
                              </p>
                              <p className="font-bold text-slate-800 dark:text-white text-lg">
                                {p2?.shortName || p2?.name}
                              </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold border border-yellow-200 dark:border-yellow-800">
                              {p2?.name?.[0]}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Totaal
                              </p>
                              <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                                {formatNumber(p2Total)}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Hoogste Serie
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {formatNumber(p2MaxSerie)}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Gemiddelde
                              </p>
                              <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {p2Avg}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Punten
                              </p>
                              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {formatNumber(
                                  calculatePoints(
                                    p2Total,
                                    match.player2AvgBefore,
                                    p1Total,
                                    match.player1AvgBefore,
                                    seasonOfMatch?.scoringSystem,
                                  ),
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <UserCircle size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                              Arbiter
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {data.users.find(
                                (u: User) => u.id === match.arbiterId,
                              )?.shortName ||
                                data.users.find(
                                  (u: User) => u.id === match.arbiterId,
                                )?.name ||
                                "Geen arbiter"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <UserCircle size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                              Schrijver
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {data.users.find(
                                (u: User) => u.id === match.writerId,
                              )?.shortName ||
                                data.users.find(
                                  (u: User) => u.id === match.writerId,
                                )?.name ||
                                "Geen schrijver"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <TableIcon
                            size={18}
                            className="text-slate-400 dark:text-slate-500"
                          />
                          Beurtverloop
                        </h4>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                          <table className="w-full text-center">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                <th className="py-2">Beurt</th>
                                <th className="py-2">{p1?.name}</th>
                                <th className="py-2">{p2?.name}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                              {(match.turns || []).map((turn, idx) => {
                                const isCurrentTurn =
                                  idx === activeTurnIndex &&
                                  match.status !== "finished";
                                return (
                                  <tr
                                    key={idx}
                                    className={cn(
                                      "transition-colors",
                                      isCurrentTurn
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 dark:border-emerald-400"
                                        : "border-l-4 border-transparent",
                                    )}
                                  >
                                    <td
                                      className={cn(
                                        "py-3 text-xs",
                                        isCurrentTurn
                                          ? "font-black text-emerald-600 dark:text-emerald-400"
                                          : "text-slate-400 dark:text-slate-500",
                                      )}
                                    >
                                      {idx + 1}
                                      {isCurrentTurn && (
                                        <div className="text-[8px] uppercase tracking-tighter">
                                          Nu
                                        </div>
                                      )}
                                    </td>
                                    <td
                                      className={cn(
                                        "py-3 font-bold",
                                        isCurrentTurn &&
                                          activeScoringPlayer === 1
                                          ? "text-slate-800 dark:text-slate-100 text-xl font-black"
                                          : "text-slate-700 dark:text-slate-300",
                                      )}
                                    >
                                      {isCurrentTurn &&
                                      activeScoringPlayer === 1
                                        ? currentTurnP1
                                        : turn.player1}
                                      {isCurrentTurn &&
                                        activeScoringPlayer === 1 && (
                                          <span className="ml-1 animate-pulse">
                                            ●
                                          </span>
                                        )}
                                    </td>
                                    <td
                                      className={cn(
                                        "py-3 font-bold",
                                        isCurrentTurn &&
                                          activeScoringPlayer === 2
                                          ? "text-yellow-600 dark:text-yellow-400 text-xl font-black"
                                          : "text-slate-700 dark:text-slate-300",
                                      )}
                                    >
                                      {isCurrentTurn &&
                                      activeScoringPlayer === 2
                                        ? currentTurnP2
                                        : turn.player2}
                                      {isCurrentTurn &&
                                        activeScoringPlayer === 2 && (
                                          <span className="ml-1 animate-pulse">
                                            ●
                                          </span>
                                        )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Start Match Modal */}
      <AnimatePresence>
        {isStartMatchModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStartMatchModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Wedstrijd Starten
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Wijs een arbiter en schrijver toe.
                </p>
              </div>
              <div className="p-6 space-y-4">
                {(() => {
                  let matchToStart = data.matches.find(
                    (m: Match) => m.id === matchToStartId,
                  );
                  if (!matchToStart && data.externalMatches) {
                    for (const em of data.externalMatches) {
                      const game = em.games?.find(
                        (g: any) => g.id === matchToStartId,
                      );
                      if (game) {
                        const myClubIsHome = em.homeClubId === activeClub?.id;
                        matchToStart = {
                          ...game,
                          player1Id: myClubIsHome
                            ? game.homePlayerId
                            : game.awayPlayerId,
                          player2Id: myClubIsHome
                            ? game.awayPlayerId
                            : game.homePlayerId,
                          seasonId: "external",
                          aantalTafels: em.aantalTafels || 1,
                        } as any;
                        break;
                      }
                    }
                  }
                  const p1Id = matchToStart?.player1Id;
                  const p2Id = matchToStart?.player2Id;
                  const seasonOfMatch = data.seasons.find(
                    (s: Season) => s.id === matchToStart?.seasonId,
                  );

                  return (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Arbiter
                        </label>
                        <select
                          value={selectedArbiterId}
                          onChange={(e) => setSelectedArbiterId(e.target.value)}
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                        >
                          <option value="">Selecteer arbiter...</option>
                          {(activeClub?.memberIds || [])
                            .filter((id) => id !== p1Id && id !== p2Id)
                            .map((id) => {
                              const user = data.users.find(
                                (u: User) => u.id === id,
                              );
                              return (
                                <option key={id} value={id}>
                                  {user?.shortName || user?.name}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Schrijver
                        </label>
                        <select
                          value={selectedWriterId}
                          onChange={(e) => setSelectedWriterId(e.target.value)}
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                        >
                          <option value="">Selecteer schrijver...</option>
                          {(activeClub?.memberIds || [])
                            .filter((id) => id !== p1Id && id !== p2Id)
                            .map((id) => {
                              const user = data.users.find(
                                (u: User) => u.id === id,
                              );
                              return (
                                <option key={id} value={id}>
                                  {user?.shortName || user?.name}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    </>
                  );
                })()}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Biljarttafel
                  </label>
                  <select
                    value={selectedTafelNummer}
                    onChange={(e) =>
                      setSelectedTafelNummer(parseInt(e.target.value))
                    }
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  >
                    {Array.from(
                      {
                        length:
                          seasonOfMatch?.aantalTafels ||
                          activeSeason?.aantalTafels ||
                          1,
                      },
                      (_, i) => i + 1,
                    ).map((num) => {
                      const isOccupied = occupiedTables.includes(num);
                      return (
                        <option key={num} value={num} disabled={isOccupied}>
                          Tafel {num} {isOccupied ? "(Bezet)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {occupiedTables.length >=
                    (seasonOfMatch?.aantalTafels ||
                      activeSeason?.aantalTafels ||
                      0) && (
                    <p className="text-xs text-rose-500 font-bold mt-1">
                      Alle tafels zijn momenteel bezet!
                    </p>
                  )}
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setIsStartMatchModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={
                    !selectedArbiterId ||
                    !selectedWriterId ||
                    occupiedTables.includes(selectedTafelNummer) ||
                    occupiedTables.length >=
                      (seasonOfMatch?.aantalTafels ||
                        activeSeason?.aantalTafels ||
                        0)
                  }
                  onClick={() => {
                    if (
                      matchToStartId &&
                      selectedArbiterId &&
                      selectedWriterId
                    ) {
                      startMatch(
                        matchToStartId,
                        selectedArbiterId,
                        selectedWriterId,
                        selectedTafelNummer,
                      );
                      setIsStartMatchModalOpen(false);
                      setSelectedArbiterId("");
                      setSelectedWriterId("");
                      // Reset to first available table if possible
                      const currentSeason = seasonOfMatch || activeSeason;
                      const available = Array.from(
                        { length: currentSeason?.aantalTafels || 1 },
                        (_, i) => i + 1,
                      ).find((n) => !occupiedTables.includes(n));
                      setSelectedTafelNummer(available || 1);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Starten
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finish Match Modal */}
      <AnimatePresence>
        {isFinishMatchModalOpen && liveMatch && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {(() => {
              const p1 = data.users.find(
                (u: User) => u.id === liveMatch?.player1Id,
              );
              const p2 = data.users.find(
                (u: User) => u.id === liveMatch?.player2Id,
              );

              return (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsFinishMatchModalOpen(false)}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
                  >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Wedstrijd Afronden
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Weet je zeker dat je de wedstrijd wilt beëindigen?
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Inleg Betaald?
                      </p>
                      <div className="flex gap-4">
                        <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={p1Paid}
                            onChange={(e) => setP1Paid(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {p1?.shortName || p1?.name || "Speler 1"}
                          </span>
                        </label>
                        <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={p2Paid}
                            onChange={(e) => setP2Paid(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {p2?.shortName || p2?.name || "Speler 2"}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                      <button
                        onClick={() => setIsFinishMatchModalOpen(false)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Nee, ga terug
                      </button>
                      <button
                        onClick={() => {
                          if (liveMatchId) {
                            saveTurn(
                              liveMatchId,
                              activeTurnIndex,
                              currentTurnP1,
                              currentTurnP2,
                            );
                            finishMatch(liveMatchId, p1Paid, p2Paid);
                            setIsFinishMatchModalOpen(false);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
                      >
                        Ja, afronden
                      </button>
                    </div>
                  </motion.div>
                </>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Match Modal */}
      <AnimatePresence>
        {isCancelMatchModalOpen && liveMatch && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {(() => {
              const p1 = data.users.find(
                (u: User) => u.id === liveMatch?.player1Id,
              );
              const p2 = data.users.find(
                (u: User) => u.id === liveMatch?.player2Id,
              );

              return (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCancelMatchModalOpen(false)}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
                  >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Wedstrijd Annuleren
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Weet je zeker dat je de wedstrijd wilt annuleren? De
                        gemaakte caramboles en beurten worden opgeslagen, maar
                        de wedstrijd telt niet mee voor het gemiddelde.
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Inleg Betaald?
                      </p>
                      <div className="flex gap-4">
                        <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={p1Paid}
                            onChange={(e) => setP1Paid(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {p1?.shortName || p1?.name || "Speler 1"}
                          </span>
                        </label>
                        <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={p2Paid}
                            onChange={(e) => setP2Paid(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {p2?.shortName || p2?.name || "Speler 2"}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                      <button
                        onClick={() => setIsCancelMatchModalOpen(false)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Nee, ga terug
                      </button>
                      <button
                        onClick={() => {
                          if (liveMatchId) {
                            saveTurn(
                              liveMatchId,
                              activeTurnIndex,
                              currentTurnP1,
                              currentTurnP2,
                            );
                            cancelMatch(liveMatchId, p1Paid, p2Paid);
                            setIsCancelMatchModalOpen(false);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                      >
                        Ja, annuleren
                      </button>
                    </div>
                  </motion.div>
                </>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* Forecast Modal */}
      <AnimatePresence>
        {isForecastModalOpen && activeSeason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForecastModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    Seizoensvooruitblik
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Schatting voor het resterende seizoen.
                  </p>
                </div>
                <button
                  onClick={() => setIsForecastModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {(() => {
                  const seasonMatches = data.matches.filter(
                    (m: Match) => m.seasonId === activeSeason.id,
                  );
                  const plannedMatches = seasonMatches.filter(
                    (m: Match) => m.status === "planned",
                  );
                  const finishedMatches = seasonMatches.filter(
                    (m: Match) => m.status === "finished",
                  );

                  // Group planned matches by date
                  const groupedPlanned = plannedMatches.reduce(
                    (acc: any, m: Match) => {
                      const date = format(new Date(m.date), "yyyy-MM-dd");
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(m);
                      return acc;
                    },
                    {},
                  );

                  const remainingSpeeldagen =
                    Object.keys(groupedPlanned).length;
                  const lastMatchDate =
                    plannedMatches.length > 0
                      ? new Date(
                          Math.max(
                            ...plannedMatches.map((m) =>
                              new Date(m.date).getTime(),
                            ),
                          ),
                        )
                      : null;

                  // Calculate matches played per player
                  const playerStats = (activeSeason.members || []).map((m) => {
                    const played = finishedMatches.filter(
                      (fm) =>
                        fm.player1Id === m.userId || fm.player2Id === m.userId,
                    ).length;
                    return { userId: m.userId, played };
                  });

                  const maxPlayed = Math.max(
                    ...playerStats.map((ps) => ps.played),
                    0,
                  );
                  const laggingPlayers = playerStats
                    .filter((ps) => maxPlayed - ps.played > 4)
                    .map((ps) => {
                      const u = data.users.find(
                        (u: User) => u.id === ps.userId,
                      );
                      return u?.shortName || u?.name;
                    })
                    .filter(Boolean);

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 text-center">
                          <p className="text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase mb-1">
                            Openstaand
                          </p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {plannedMatches.length}
                          </p>
                          <p className="text-[10px] text-blue-500 dark:text-blue-400">
                            wedstrijden
                          </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center">
                          <p className="text-[10px] font-bold text-emerald-400 dark:text-emerald-500 uppercase mb-1">
                            Speeldagen
                          </p>
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {remainingSpeeldagen}
                          </p>
                          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
                            resterend
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 text-center">
                          <p className="text-[10px] font-bold text-purple-400 dark:text-purple-500 uppercase mb-1">
                            Einddatum
                          </p>
                          <p className="text-lg font-black text-purple-600 dark:text-purple-400 leading-tight">
                            {lastMatchDate
                              ? format(lastMatchDate, "d MMM yyyy", {
                                  locale: nl,
                                })
                              : "N.v.t."}
                          </p>
                          <p className="text-[10px] text-purple-500 dark:text-purple-400">
                            geschat
                          </p>
                        </div>
                      </div>

                      {laggingPlayers.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Plus
                              size={16}
                              className="text-amber-600 dark:text-amber-400 rotate-45"
                            />
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                              Aandachtspunten
                            </h4>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3 leading-relaxed">
                            De volgende spelers hebben meer dan 4 wedstrijden
                            minder gespeeld dan de koploper(s):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {laggingPlayers.map((name) => (
                              <span
                                key={name}
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded text-xs font-bold text-amber-700 dark:text-amber-400"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {laggingPlayers.length === 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
                          <CheckCircle2
                            size={20}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            De wedstrijdverdeling tussen alle spelers is
                            momenteel goed in balans.
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => setIsForecastModalOpen(false)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Cancel Day Modal */}
        {isCancelDayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCancelDayModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-2xl text-rose-600 dark:text-rose-400">
                    <XCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      Speeldag Afmelden
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {cancelDayDate &&
                        format(new Date(cancelDayDate), "EEEE d MMMM", {
                          locale: nl,
                        })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                      Reden van afmelding
                    </label>
                    <textarea
                      value={cancelDayReason}
                      onChange={(e) => setCancelDayReason(e.target.value)}
                      placeholder="Bijv. Zaal gesloten, Feestdag, etc."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      <strong>Let op:</strong> Na het afmelden wordt de planning
                      automatisch herzien. Alle geplande wedstrijden van deze
                      dag worden verschoven naar de eerstvolgende beschikbare
                      speeldag.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => {
                    setIsCancelDayModalOpen(false);
                    setCancelDayReason("");
                    setCancelDayDate(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={!cancelDayReason.trim()}
                  onClick={() =>
                    selectedSeasonId &&
                    cancelDayDate &&
                    cancelSpeeldag(
                      selectedSeasonId,
                      cancelDayDate,
                      cancelDayReason,
                    )
                  }
                  className="flex-1 px-4 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Afmelden & Herplannen
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Home Match Modal */}
        {isHomeMatchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHomeMatchModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
              {homeMatchStep === 1 ? (
                <>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                        <Trophy size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                          Thuiswedstrijd Aanmaken
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Speel tegen een andere biljartclub.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Datum
                          </label>
                          <input
                            type="date"
                            value={newHomeMatchDate}
                            onChange={(e) =>
                              setNewHomeMatchDate(e.target.value)
                            }
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Selecteer Tegenstander (Uitclub)
                          </label>
                          <select
                            value={newHomeMatchAwayClubId}
                            onChange={(e) =>
                              setNewHomeMatchAwayClubId(e.target.value)
                            }
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          >
                            <option value="">Kies een club...</option>
                            {data.clubs
                              .filter(
                                (c: Club) =>
                                  c.id !== activeClub?.id &&
                                  c.participatesInExternalMatches,
                              )
                              .map((club: Club) => (
                                <option key={club.id} value={club.id}>
                                  {club.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Aantal Tafels
                          </label>
                          <select
                            value={newHomeMatchAantalTafels}
                            onChange={(e) =>
                              setNewHomeMatchAantalTafels(
                                Number(e.target.value),
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Beurten per wedstrijd
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newHomeMatchBeurten}
                            onChange={(e) =>
                              setNewHomeMatchBeurten(
                                parseInt(e.target.value) || 30,
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-8 mt-6 md:mt-0">
                        <div>
                          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Puntentelling Systeem
                          </label>
                          <div className="flex gap-4">
                            <button
                              onClick={() =>
                                setNewHomeMatchScoringSystem("default")
                              }
                              className={cn(
                                "flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                                newHomeMatchScoringSystem === "default"
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-800/50",
                              )}
                            >
                              <span className="font-bold text-sm">
                                Standaard
                              </span>
                              <span className="text-[10px] opacity-70">
                                10 punten systeem
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                setNewHomeMatchScoringSystem("driebanden")
                              }
                              className={cn(
                                "flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                                newHomeMatchScoringSystem === "driebanden"
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-800/50",
                              )}
                            >
                              <span className="font-bold text-sm">
                                Driebanden
                              </span>
                              <span className="text-[10px] opacity-70">
                                Winnaar = 2 punten, Gelijk = 1 punt, Verliezer =
                                0 punten
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Kasbeheer Tile */}
                        <div>
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Banknote className="text-emerald-500" size={20} />
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                              Inleggeld (Optioneel)
                            </h4>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                              Verwerk in kasboek van seizoen
                            </label>
                            <select
                              value={newHomeMatchSeasonId}
                              onChange={(e) =>
                                setNewHomeMatchSeasonId(e.target.value)
                              }
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            >
                              <option value="">
                                Niet verwerken in kasboek
                              </option>
                              {data.seasons
                                ?.filter(
                                  (s: Season) =>
                                    s.clubId === activeClub?.id &&
                                    s.status !== "closed",
                                )
                                .map((s: Season) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} (Huidig)
                                  </option>
                                ))}
                            </select>
                          </div>

                          {newHomeMatchSeasonId && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                  Inleg Thuisspeler
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                    €
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.50"
                                    value={newHomeMatchHomeFee}
                                    onChange={(e) =>
                                      setNewHomeMatchHomeFee(
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                  Inleg Uitspeler
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                    €
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.50"
                                    value={newHomeMatchAwayFee}
                                    onChange={(e) =>
                                      setNewHomeMatchAwayFee(
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                    <button
                      onClick={() => {
                        setIsHomeMatchModalOpen(false);
                        setHomeMatchStep(1);
                      }}
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      disabled={!newHomeMatchAwayClubId || !newHomeMatchDate}
                      onClick={handleNextStepHomeMatch}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Volgende
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-8 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <Users size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                          Spelers Indelen
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Controleer en wijzig de opstelling (basis op moyenne).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {homeMatchPairings.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-3 font-bold">
                                  Thuisspeler (Wit)
                                </th>
                                <th className="p-3 font-bold w-10 text-center">
                                  VS
                                </th>
                                <th className="p-3 font-bold">
                                  Tegenstander (Geel)
                                </th>
                                <th className="p-3 font-bold w-12 text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {homeMatchPairings.map((pairing, index) => {
                                const awayClub = data.clubs.find(
                                  (c: Club) => c.id === newHomeMatchAwayClubId,
                                );

                                const homeMembersFiltered =
                                  (activeClub?.memberIds || [])
                                    .map((userId) =>
                                      data.users.find(
                                        (u: User) => u.id === userId,
                                      ),
                                    )
                                    .filter(
                                      (user): user is User =>
                                        !!user &&
                                        !!user.participatesInExternalMatches,
                                    )
                                    .sort(
                                      (a, b) => b.baseAverage - a.baseAverage,
                                    ) || [];

                                const awayMembers =
                                  awayClub?.memberIds
                                    .map((userId) =>
                                      data.users.find(
                                        (u: User) => u.id === userId,
                                      ),
                                    )
                                    .filter(
                                      (user): user is User =>
                                        !!user &&
                                        !!user.participatesInExternalMatches,
                                    )
                                    .sort(
                                      (a, b) => b.baseAverage - a.baseAverage,
                                    ) || [];

                                return (
                                  <tr
                                    key={pairing.id}
                                    className="border-t border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                  >
                                    <td className="p-2 md:p-3">
                                      <select
                                        value={pairing.homePlayerId}
                                        onChange={(e) => {
                                          const newPairings = [
                                            ...homeMatchPairings,
                                          ];
                                          newPairings[index].homePlayerId =
                                            e.target.value;
                                          setHomeMatchPairings(newPairings);
                                        }}
                                        className="w-full px-2 md:px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                                      >
                                        <option value="">
                                          Kies thuisspeler...
                                        </option>
                                        {homeMembersFiltered.map((m) => (
                                          <option key={m.id} value={m.id}>
                                            {m.name} (Car.: {m.baseAverage})
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="p-2 md:p-3 text-center">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        VS
                                      </span>
                                    </td>
                                    <td className="p-2 md:p-3">
                                      <select
                                        value={pairing.awayPlayerId}
                                        onChange={(e) => {
                                          const newPairings = [
                                            ...homeMatchPairings,
                                          ];
                                          newPairings[index].awayPlayerId =
                                            e.target.value;
                                          setHomeMatchPairings(newPairings);
                                        }}
                                        className="w-full px-2 md:px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                      >
                                        <option value="">
                                          Kies tegenstander...
                                        </option>
                                        {awayMembers.map((m) => (
                                          <option key={m.id} value={m.id}>
                                            {m.name} (Car.: {m.baseAverage})
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="p-2 md:p-3 text-center">
                                      <button
                                        onClick={() => {
                                          setHomeMatchPairings(
                                            homeMatchPairings.filter(
                                              (_, i) => i !== index,
                                            ),
                                          );
                                        }}
                                        className="p-1.5 md:p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                        title="Verwijder wedstrijd"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M18 6 6 18" />
                                          <path d="m6 6 12 12" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {homeMatchPairings.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Geen deelnemende leden gevonden voor een van beide
                            clubs.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setHomeMatchPairings([
                            ...homeMatchPairings,
                            {
                              id: Math.random().toString(36).substr(2, 9),
                              homePlayerId: "",
                              awayPlayerId: "",
                            },
                          ]);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all font-bold"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span>Extra Speler Toevoegen</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                    <button
                      onClick={() => setHomeMatchStep(1)}
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Terug
                    </button>
                    <button
                      disabled={
                        homeMatchPairings.length === 0 ||
                        homeMatchPairings.some(
                          (p) => !p.awayPlayerId || !p.homePlayerId,
                        )
                      }
                      onClick={createHomeMatch}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Aanmaken
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Attendance Modal */}
        {isAttendanceModalOpen && attendanceModalDate && activeSeason && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAttendanceModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Aanwezigheid
                  </h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {format(new Date(attendanceModalDate), "EEEE d MMMM", {
                      locale: nl,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeSeason.members || []).map((m) => {
                    const user = data.users.find(
                      (u: User) => u.id === m.userId,
                    );
                    const isPresent = (
                      activeSeason.attendance?.[attendanceModalDate] ||
                      (activeSeason.members || []).map((mem) => mem.userId)
                    ).includes(m.userId);

                    return (
                      <button
                        key={m.userId}
                        onClick={() =>
                          toggleAttendance(
                            activeSeason.id,
                            attendanceModalDate,
                            m.userId,
                          )
                        }
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all",
                          isPresent
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                              isPresent
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400",
                            )}
                          >
                            {user?.name?.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="font-bold">
                              {user?.shortName || user?.name}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest opacity-60">
                              {user?.shortName &&
                              user?.name &&
                              user.shortName !== user.name
                                ? user.name
                                : "Geen roepnaam"}
                            </p>
                          </div>
                        </div>
                        {isPresent ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Totaal aanwezig
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {
                      (
                        activeSeason.attendance?.[attendanceModalDate] ||
                        (activeSeason.members || []).map((mem) => mem.userId)
                      ).length
                    }{" "}
                    / {(activeSeason.members || []).length}
                  </span>
                </div>
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Klaar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Daily Match Fees Modal */}
        {isDailyMatchFeesModalOpen && dailyMatchFeesDate && activeSeason && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDailyMatchFeesModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white">
                <div>
                  <h3 className="text-xl font-black">Inleggeld Vandaag</h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {format(new Date(dailyMatchFeesDate), "EEEE d MMMM", {
                      locale: nl,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setIsDailyMatchFeesModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3">
                  {(() => {
                    const dateMatches = data.matches.filter(
                      (m: Match) =>
                        m.seasonId === activeSeason.id &&
                        m.status !== "cancelled" &&
                        isSameDay(
                          new Date(m.date),
                          new Date(dailyMatchFeesDate),
                        ),
                    );

                    const playersStats: Record<
                      string,
                      { played: number; paid: number }
                    > = {};

                    (activeSeason.members || []).forEach((m) => {
                      playersStats[m.userId] = { played: 0, paid: 0 };
                    });

                    dateMatches.forEach((m: Match) => {
                      if (playersStats[m.player1Id]) {
                        playersStats[m.player1Id].played += 1;
                        if (m.player1Paid) playersStats[m.player1Id].paid += 1;
                      }
                      if (playersStats[m.player2Id]) {
                        playersStats[m.player2Id].played += 1;
                        if (m.player2Paid) playersStats[m.player2Id].paid += 1;
                      }
                    });

                    return Object.entries(playersStats)
                      .filter(([_, stats]) => stats.played > 0)
                      .map(([userId, stats]) => {
                        const user = data.users.find(
                          (u: User) => u.id === userId,
                        );
                        const totalDue =
                          stats.played * activeSeason.inlegPerWedstrijd;
                        const totalPaid =
                          stats.paid * activeSeason.inlegPerWedstrijd;
                        const open = totalDue - totalPaid;

                        return (
                          <div
                            key={userId}
                            className={cn(
                              "flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border transition-all",
                              open > 0
                                ? "border-rose-200 dark:border-rose-800/50"
                                : "border-emerald-200 dark:border-emerald-800/50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                                  open > 0
                                    ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                                )}
                              >
                                {user?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-white">
                                  {user?.shortName || user?.name}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                  {stats.played} wedstrijden
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-800 dark:text-white">
                                {formatCurrency(totalDue)}
                              </p>
                              {open > 0 ? (
                                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                                  Nog te betalen: {formatCurrency(open)}
                                </p>
                              ) : (
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                  Voldaan
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Contributions Detail Modal */}
        {isContributionsDetailModalOpen && activeSeason && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContributionsDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white">
                <div>
                  <h3 className="text-xl font-black">
                    {contributionsDetailType === "contributions"
                      ? "Detailoverzicht Contributie"
                      : contributionsDetailType === "externalmatchfees"
                        ? "Detailoverzicht Thuiswedstrijd"
                        : "Detailoverzicht Inleggeld"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsContributionsDetailModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {contributionsDetailType === "contributions" && (
                  <div className="space-y-3">
                    {(activeSeason.members || []).map((m) => {
                      const user = data.users.find(
                        (u: User) => u.id === m.userId,
                      );
                      return (
                        <div
                          key={m.userId}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-sm text-slate-500">
                              {user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">
                                {user?.shortName || user?.name}
                              </p>
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                {m.paidContributie ? "Betaald" : "Openstaand"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={cn(
                                "text-sm font-black",
                                m.paidContributie
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400",
                              )}
                            >
                              {m.paidContributie
                                ? formatCurrency(activeSeason.contributie)
                                : formatCurrency(0)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {contributionsDetailType === "matchfees" && (
                  <div className="space-y-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setMatchfeesGroupView("player")}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                          matchfeesGroupView === "player"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                        )}
                      >
                        Per Speler
                      </button>
                      <button
                        onClick={() => setMatchfeesGroupView("date")}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                          matchfeesGroupView === "date"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                        )}
                      >
                        Per Speelavond
                      </button>
                    </div>

                    <div className="space-y-3">
                      {matchfeesGroupView === "player"
                        ? (activeSeason.members || []).map((m) => {
                            const user = data.users.find(
                              (u: User) => u.id === m.userId,
                            );
                            const memberMatches = data.matches.filter(
                              (match: Match) =>
                                match.seasonId === activeSeason.id &&
                                match.status !== "cancelled" &&
                                (match.player1Id === m.userId ||
                                  match.player2Id === m.userId),
                            );

                            const playedMatches = memberMatches.length;
                            const paidMatches = memberMatches.filter(
                              (match: Match) =>
                                (match.player1Id === m.userId &&
                                  match.player1Paid) ||
                                (match.player2Id === m.userId &&
                                  match.player2Paid),
                            ).length;

                            const totalDue =
                              playedMatches * activeSeason.inlegPerWedstrijd;
                            const totalPaid =
                              paidMatches * activeSeason.inlegPerWedstrijd;
                            const open = totalDue - totalPaid;

                            return (
                              <div
                                key={m.userId}
                                className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-sm text-slate-500">
                                      {user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 dark:text-white">
                                        {user?.shortName || user?.name}
                                      </p>
                                      <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                        {playedMatches} wedstrijden gespeeld
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                      {formatCurrency(totalPaid)}
                                    </p>
                                    {open > 0 && (
                                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                                        {formatCurrency(open)} openstaand
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  <div className="flex justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span>Totaal Inleg</span>
                                    <span className="text-slate-600 dark:text-slate-300">
                                      {formatCurrency(totalDue)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span>Betaald</span>
                                    <span className="text-emerald-600">
                                      {formatCurrency(totalPaid)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        : (() => {
                            const matchesByDate = data.matches
                              .filter(
                                (match: Match) =>
                                  match.seasonId === activeSeason.id &&
                                  match.status !== "cancelled",
                              )
                              .reduce(
                                (
                                  acc: Record<string, Match[]>,
                                  match: Match,
                                ) => {
                                  const dateStr = format(
                                    new Date(match.date),
                                    "yyyy-MM-dd",
                                  );
                                  if (!acc[dateStr]) acc[dateStr] = [];
                                  acc[dateStr].push(match);
                                  return acc;
                                },
                                {},
                              );

                            return Object.entries(
                              matchesByDate as Record<string, Match[]>,
                            )
                              .sort(
                                (a, b) =>
                                  new Date(b[0]).getTime() -
                                  new Date(a[0]).getTime(),
                              )
                              .map(([dateStr, matches]) => {
                                const playedMatchesCount = matches.length * 2;
                                const totalDue =
                                  playedMatchesCount *
                                  activeSeason.inlegPerWedstrijd;
                                let totalPaid = 0;
                                matches.forEach((m: Match) => {
                                  if (m.player1Paid)
                                    totalPaid += activeSeason.inlegPerWedstrijd;
                                  if (m.player2Paid)
                                    totalPaid += activeSeason.inlegPerWedstrijd;
                                });
                                const open = totalDue - totalPaid;

                                return (
                                  <div
                                    key={dateStr}
                                    className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all space-y-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black">
                                          <Calendar size={18} />
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-800 dark:text-white capitalize">
                                            {format(
                                              new Date(dateStr),
                                              "EEEE d MMMM yyyy",
                                              { locale: nl },
                                            )}
                                          </p>
                                          <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                            {matches.length} wedstrijden
                                            gespeeld
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                          {formatCurrency(totalPaid)}
                                        </p>
                                        {open > 0 && (
                                          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                                            {formatCurrency(open)} openstaand
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                          })()}
                    </div>
                  </div>
                )}

                {contributionsDetailType === "externalmatchfees" && (
                  <div className="space-y-3">
                    {data.externalMatches
                      ?.filter((em: any) => em.seasonId === activeSeason.id)
                      .map((em: any) => {
                        let totalDue = 0;
                        let totalPaid = 0;

                        (em.games || []).forEach((g: any) => {
                          totalDue +=
                            (em.homePlayerFee || 0) + (em.awayPlayerFee || 0);
                          if (g.homePlayerPaid)
                            totalPaid += em.homePlayerFee || 0;
                          if (g.awayPlayerPaid)
                            totalPaid += em.awayPlayerFee || 0;
                        });
                        const open = totalDue - totalPaid;
                        const isHome = em.homeClubId === activeClub?.id;
                        const opponent = data.clubs.find(
                          (c: Club) =>
                            c.id === (isHome ? em.awayClubId : em.homeClubId),
                        );

                        return (
                          <div
                            key={em.id}
                            className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black">
                                  <Banknote size={18} />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white capitalize">
                                    {format(
                                      new Date(em.date),
                                      "EEEE d MMMM yyyy",
                                      { locale: nl },
                                    )}
                                  </p>
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                    Tegen {opponent?.name || "Onbekend"} (
                                    {(em.games || []).length} parijen)
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(totalPaid)}
                                </p>
                                {open > 0 && (
                                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                                    {formatCurrency(open)} openstaand
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <div className="flex justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <span>Totaal Inleg</span>
                                <span className="text-slate-600 dark:text-slate-300">
                                  {formatCurrency(totalDue)}
                                </span>
                              </div>
                              <div className="flex justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <span>Betaald</span>
                                <span className="text-emerald-600">
                                  {formatCurrency(totalPaid)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {(!data.externalMatches ||
                      data.externalMatches.filter(
                        (em: any) => em.seasonId === activeSeason.id,
                      ).length === 0) && (
                      <p className="text-center text-sm text-slate-500 py-8">
                        Geen geregistreerde inleg voor uit & thuiswedstrijden.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsContributionsDetailModalOpen(false)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditSpeeldagenModalOpen && activeSeason && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditSpeeldagenModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      Speeldagen Wijzigen
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pas de dagen van de week aan waarop gespeeld wordt.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                      Speeldagen
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          onClick={() => {
                            setEditSeasonSpeeldagen((prev) =>
                              prev.includes(day)
                                ? prev.filter((d) => d !== day)
                                : [...prev, day]
                            );
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                            editSeasonSpeeldagen.includes(day)
                              ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-800"
                          )}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => setIsEditSpeeldagenModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  disabled={editSeasonSpeeldagen.length === 0}
                  onClick={() => {
                    setIsEditSpeeldagenModalOpen(false);
                    showConfirm(
                      "Speeldagen gewijzigd",
                      "Wil je de nog niet gespeelde wedstrijden automatisch herindelen op basis van de nieuwe speeldagen?",
                      () => {
                        updateSeasonSpeeldagen(activeSeason.id, editSeasonSpeeldagen, true);
                      },
                      () => {
                        updateSeasonSpeeldagen(activeSeason.id, editSeasonSpeeldagen, false);
                      }
                    );
                  }}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Opslaan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {castMenuTarget && (
          <motion.div
            key="cast-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            onClick={() => setCastMenuTarget(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {castMenuTarget && (
          <motion.div
            key="cast-menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 z-[101]"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                  <Tv
                    size={24}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  Cast Menu
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Selecteer wat je wilt vertonen op het grote scherm
                </p>
              </div>
              <button
                onClick={() => setCastMenuTarget(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <button
                onClick={() => {
                  updateGlobalCastState(
                    castMenuTarget.type === "season"
                      ? { viewType: "standings", seasonId: castMenuTarget.id }
                      : { viewType: "extMatch", extMatchId: castMenuTarget.id },
                  );
                  setCastMenuTarget(null);
                  setIsCastMode(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-lg active:scale-[0.98]"
              >
                <Tv size={20} />
                Open Grote Scherm
              </button>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  Tussenstand
                </h4>
                <button
                  onClick={() => {
                    updateGlobalCastState(
                      castMenuTarget.type === "season"
                        ? { viewType: "standings", seasonId: castMenuTarget.id }
                        : {
                            viewType: "extMatch",
                            extMatchId: castMenuTarget.id,
                          },
                    );
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                    (castState?.viewType === "standings" &&
                      castState?.seasonId === castMenuTarget.id) ||
                      (castState?.viewType === "extMatch" &&
                        castState?.extMatchId === castMenuTarget.id)
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-md",
                  )}
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                    <Trophy
                      size={24}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Algemene Tussenstand
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      Laat het complete overzicht zien van{" "}
                      {castMenuTarget.type === "season"
                        ? "dit seizoen"
                        : "deze uit & thuiswedstrijd"}
                    </p>
                  </div>
                </button>
              </div>

              {castMenuTarget.type === "season" && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    Toekomstige Wedstrijden
                  </h4>
                  <div className="flex gap-2 relative">
                    <button
                      onClick={() => {
                        updateGlobalCastState({
                          viewType: "nextMatchDay",
                          seasonId: castMenuTarget.id,
                        });
                      }}
                      className={cn(
                        "flex-1 flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                        castState?.viewType === "nextMatchDay" &&
                          castState?.seasonId === castMenuTarget.id
                          ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 ring-2 ring-purple-500"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:shadow-md",
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                        <Calendar
                          size={24}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          Volgende Speeldag
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          Overzicht van de geplande wedstrijden
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCastMenuTarget(null);
                        setTimeout(() => exportNextMatchDay(castMenuTarget.id), 100);
                      }}
                      className="w-16 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-purple-400 transition-colors text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm"
                      title="Exporteren als JPG"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  Gestarte Wedstrijden
                </h4>
                {(() => {
                  let startedMatches: any[] = [];
                  if (castMenuTarget.type === "season") {
                    startedMatches = data.matches.filter(
                      (m: any) =>
                        m.seasonId === castMenuTarget.id &&
                        m.status === "started",
                    );
                  } else if (castMenuTarget.type === "extMatch") {
                    const em = data.externalMatches?.find(
                      (m: any) => m.id === castMenuTarget.id,
                    );
                    if (em && em.games) {
                      startedMatches = (em.games || []).filter(
                        (g: any) => g.status === "started",
                      );
                    }
                  }
                  if (startedMatches.length === 0) {
                    return (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic px-1">
                        Geen gestarte wedstrijden.
                      </p>
                    );
                  }
                  return startedMatches.map((m: any) => {
                    const p1 = data.users.find(
                      (u: any) => u.id === (m.player1Id || m.homePlayerId),
                    );
                    const p2 = data.users.find(
                      (u: any) => u.id === (m.player2Id || m.awayPlayerId),
                    );
                    return (
                      <button
                        key={m.id}
                        onClick={() =>
                          updateGlobalCastState({
                            viewType: "match",
                            matchId: m.id,
                          })
                        }
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                          castState?.viewType === "match" &&
                            castState?.matchId === m.id
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-md",
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                          <MonitorPlay
                            size={24}
                            className="text-amber-600 dark:text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {p1?.shortName || p1?.name} vs{" "}
                            {p2?.shortName || p2?.name}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mt-0.5">
                            Live Scorebord
                          </p>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  Voltooide Wedstrijden (Vandaag)
                </h4>
                {(() => {
                  const todayStr = format(new Date(), "yyyy-MM-dd");
                  let finishedMatches: any[] = [];
                  if (castMenuTarget.type === "season") {
                    finishedMatches = data.matches.filter(
                      (m: any) =>
                        m.seasonId === castMenuTarget.id &&
                        m.status === "finished" &&
                        format(new Date(m.date), "yyyy-MM-dd") === todayStr,
                    );
                  } else if (castMenuTarget.type === "extMatch") {
                    const em = data.externalMatches?.find(
                      (m: any) => m.id === castMenuTarget.id,
                    );
                    if (em && em.games && em.date === todayStr) {
                      finishedMatches = (em.games || []).filter(
                        (g: any) => g.status === "finished",
                      );
                    }
                  }
                  if (finishedMatches.length === 0) {
                    return (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic px-1">
                        Geen voltooide wedstrijden vandaag.
                      </p>
                    );
                  }
                  return finishedMatches.map((m: any) => {
                    const p1 = data.users.find(
                      (u: any) => u.id === (m.player1Id || m.homePlayerId),
                    );
                    const p2 = data.users.find(
                      (u: any) => u.id === (m.player2Id || m.awayPlayerId),
                    );
                    return (
                      <button
                        key={m.id}
                        onClick={() =>
                          updateGlobalCastState({
                            viewType: "match",
                            matchId: m.id,
                          })
                        }
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                          castState?.viewType === "match" &&
                            castState?.matchId === m.id
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-md",
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <History
                            size={24}
                            className="text-slate-500 dark:text-slate-400"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {p1?.shortName || p1?.name} vs{" "}
                            {p2?.shortName || p2?.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Eindstand overzicht
                          </p>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowPastCastMatches(!showPastCastMatches)}
                  className="w-full flex items-center justify-between px-1 group"
                >
                  <h4 className="text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 uppercase tracking-widest transition-colors">
                    Voltooide Wedstrijden (Eerder)
                  </h4>
                  {showPastCastMatches ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showPastCastMatches && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      {(() => {
                        const todayStr = format(new Date(), "yyyy-MM-dd");
                        let pastFinishedMatches: any[] = [];
                        if (castMenuTarget.type === "season") {
                          pastFinishedMatches = data.matches.filter(
                            (m: any) =>
                              m.seasonId === castMenuTarget.id &&
                              m.status === "finished" &&
                              format(new Date(m.date), "yyyy-MM-dd") !== todayStr,
                          );
                        } else if (castMenuTarget.type === "extMatch") {
                          const em = data.externalMatches?.find(
                            (m: any) => m.id === castMenuTarget.id,
                          );
                          if (em && em.games && em.date !== todayStr) {
                            // Note: Actually for external matches all games are typically same date as match.
                            // We show it if date is not today.
                            pastFinishedMatches = (em.games || []).filter(
                              (g: any) => g.status === "finished",
                            );
                          }
                        }

                        if (pastFinishedMatches.length === 0) {
                          return (
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic px-1 pt-2">
                              Geen eerdere voltooide wedstrijden.
                            </p>
                          );
                        }

                        // Group by date
                        const groupedByDate = pastFinishedMatches.reduce(
                          (acc: any, m: any) => {
                            let dateToUse = m.date;
                            // If external match games don't have separate date, use the parent match date
                            if (castMenuTarget.type === "extMatch") {
                              const em = data.externalMatches?.find(
                                (ext: any) => ext.id === castMenuTarget.id,
                              );
                              if (em) dateToUse = em.date;
                            }
                            const dateObj = new Date(dateToUse);
                            const formattedDate = format(
                              dateObj,
                              "EEEE d MMMM yyyy",
                              { locale: nl },
                            );

                            if (!acc[formattedDate]) acc[formattedDate] = [];
                            acc[formattedDate].push(m);
                            return acc;
                          },
                          {},
                        );

                        return Object.entries(groupedByDate).map(
                          ([dateLabel, matchesForDate]: [string, any]) => {
                            const isCollapsed =
                              collapsedCastMatchDates.includes(dateLabel);

                            return (
                              <div key={dateLabel} className="space-y-2 pt-2">
                                <button
                                  onClick={() => {
                                    setCollapsedCastMatchDates((prev) =>
                                      prev.includes(dateLabel)
                                        ? prev.filter((d) => d !== dateLabel)
                                        : [...prev, dateLabel],
                                    );
                                  }}
                                  className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                    {dateLabel}
                                  </span>
                                  {isCollapsed ? (
                                    <ChevronDown
                                      size={14}
                                      className="text-slate-400"
                                    />
                                  ) : (
                                    <ChevronUp
                                      size={14}
                                      className="text-slate-400"
                                    />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {!isCollapsed && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden space-y-2"
                                    >
                                      {matchesForDate.map((m: any) => {
                                        const p1 = data.users.find(
                                          (u: any) =>
                                            u.id ===
                                            (m.player1Id || m.homePlayerId),
                                        );
                                        const p2 = data.users.find(
                                          (u: any) =>
                                            u.id ===
                                            (m.player2Id || m.awayPlayerId),
                                        );
                                        return (
                                          <button
                                            key={m.id}
                                            onClick={() =>
                                              updateGlobalCastState({
                                                viewType: "match",
                                                matchId: m.id,
                                              })
                                            }
                                            className={cn(
                                              "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                                              castState?.viewType === "match" &&
                                                castState?.matchId === m.id
                                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-500"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-sm",
                                            )}
                                          >
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                              <History
                                                size={18}
                                                className="text-slate-500 dark:text-slate-400"
                                              />
                                            </div>
                                            <div>
                                              <p className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {p1?.shortName || p1?.name} vs{" "}
                                                {p2?.shortName || p2?.name}
                                              </p>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          },
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {exportCastData?.type === "standings" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "1920px",
            height: "1080px",
            pointerEvents: "none",
            zIndex: -10000,
          }}
        >
          {castStandingsNodeToRender}
        </div>
      )}
      {exportCastData?.type === "extMatch" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "1920px",
            height: "1080px",
            pointerEvents: "none",
            zIndex: -10000,
          }}
        >
          {castExtMatchNodeToRender}
        </div>
      )}
      {exportCastData?.type === "nextMatchDay" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "1920px",
            height: "1080px",
            pointerEvents: "none",
            zIndex: -10000,
          }}
        >
          {castNextMatchDayNodeToRender}
        </div>
      )}
    </div>
  );
}

function MobileNavTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors",
        active
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-400 dark:text-slate-600",
      )}
    >
      <div
        className={cn(
          "transition-transform duration-200",
          active && "scale-110",
        )}
      >
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">
        {label}
      </span>
    </button>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
        active
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200",
        collapsed && "justify-center px-0",
      )}
    >
      <span
        className={cn(
          active
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-400 dark:text-slate-500",
          "shrink-0",
        )}
      >
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
      {active && !collapsed && (
        <motion.div
          layoutId="active-pill"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
        />
      )}
    </button>
  );
}
