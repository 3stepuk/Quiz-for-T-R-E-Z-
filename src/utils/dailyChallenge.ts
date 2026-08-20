import { Question, DailyChallengeEntry, DailyChallengeStatus } from '../types';
import { QUESTIONS_DATABASE } from '../data/questions';
import { getRankTitle } from './scoring';

const DAILY_STATUS_KEY = 'britpop_daily_challenge_status_v2';
const DAILY_LEADERBOARD_PREFIX = 'britpop_daily_lead_';

/**
 * Get current date string formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Simple deterministic hash for a string to a 32-bit integer
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Mulberry32 PRNG for deterministic random number generation based on seed
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically pick 5 balanced questions for a given date
 */
export function getDailyQuestions(dateStr: string = getTodayDateString()): Question[] {
  const seed = hashString(`90s_daily_challenge_${dateStr}`);
  const rng = mulberry32(seed);

  // Group questions by diverse categories to guarantee variety
  const allQuestions = [...QUESTIONS_DATABASE];

  // Shuffle array deterministically with Fisher-Yates using rng
  const pool = [...allQuestions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Ensure unique categories where possible
  const selected: Question[] = [];
  const usedCategories = new Set<string>();

  // First pass: Pick 1 question per distinct category
  for (const q of pool) {
    if (!usedCategories.has(q.category)) {
      selected.push(q);
      usedCategories.add(q.category);
      if (selected.length === 5) break;
    }
  }

  // Second pass: Fill up to 5 if needed
  if (selected.length < 5) {
    for (const q of pool) {
      if (!selected.some((s) => s.id === q.id)) {
        selected.push(q);
        if (selected.length === 5) break;
      }
    }
  }

  return selected.slice(0, 5);
}

/**
 * Get the user's daily challenge status and streak
 */
export function getDailyChallengeStatus(): DailyChallengeStatus {
  const today = getTodayDateString();
  const defaultStatus: DailyChallengeStatus = {
    lastCompletedDate: null,
    currentStreak: 0,
    bestStreak: 0,
    totalCompleted: 0,
    todayCompleted: false,
    history: [],
  };

  try {
    const data = localStorage.getItem(DAILY_STATUS_KEY);
    if (!data) return defaultStatus;

    const parsed: DailyChallengeStatus = JSON.parse(data);
    const isToday = parsed.lastCompletedDate === today;

    // Check if streak was broken (missed yesterday)
    if (!isToday && parsed.lastCompletedDate) {
      const lastDate = new Date(parsed.lastCompletedDate);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If more than 1 day has passed without playing, current streak drops to 0
      if (diffDays > 1) {
        parsed.currentStreak = 0;
      }
    }

    return {
      ...parsed,
      todayCompleted: isToday,
    };
  } catch {
    return defaultStatus;
  }
}

/**
 * Simulated global rivals for each day's challenge to make the leaderboard vibrant
 */
const GLOBAL_DAILY_RIVALS = [
  { name: 'Liam_MCR', avatar: '🕶️', flag: '🇬🇧', baseScore: 1180, acc: 100 },
  { name: 'SeattleSound92', avatar: '🎸', flag: '🇺🇸', baseScore: 1120, acc: 100 },
  { name: 'Sheffield_Jarvis', avatar: '👓', flag: '🇬🇧', baseScore: 1050, acc: 100 },
  { name: 'CamdenMixer_VIP', avatar: '🍺', flag: '🇬🇧', baseScore: 980, acc: 80 },
  { name: 'BrooklynBoom_94', avatar: '🎤', flag: '🇺🇸', baseScore: 940, acc: 80 },
  { name: 'TokyoBritpop', avatar: '🎧', flag: '🇯🇵', baseScore: 910, acc: 80 },
  { name: 'ParisDaft_97', avatar: '⚡', flag: '🇫🇷', baseScore: 860, acc: 80 },
  { name: 'BerlinRaver_95', avatar: '🔊', flag: '🇩🇪', baseScore: 820, acc: 60 },
  { name: 'DublinGroove', avatar: '📻', flag: '🇮🇪', baseScore: 780, acc: 60 },
  { name: 'SpicePower_96', avatar: '💖', flag: '🇬🇧', baseScore: 730, acc: 60 },
  { name: 'MelbourneGrunge', avatar: '🧥', flag: '🇦🇺', baseScore: 690, acc: 60 },
  { name: 'TorontoAltRock', avatar: '💿', flag: '🇨🇦', baseScore: 640, acc: 40 },
];

/**
 * Get the global leaderboard for a specific date's daily challenge
 */
export function getDailyGlobalLeaderboard(dateStr: string = getTodayDateString()): DailyChallengeEntry[] {
  const storageKey = `${DAILY_LEADERBOARD_PREFIX}${dateStr}`;
  try {
    const raw = localStorage.getItem(storageKey);
    let entries: DailyChallengeEntry[] = raw ? JSON.parse(raw) : [];

    // If no leaderboard exists for this date, seed with realistic deterministic contenders
    if (!entries || entries.length === 0) {
      const seed = hashString(`daily_rivals_${dateStr}`);
      const rng = mulberry32(seed);

      entries = GLOBAL_DAILY_RIVALS.map((rival, idx) => {
        // Vary the rival score slightly based on the daily seed
        const variance = Math.floor(rng() * 120) - 60;
        const finalScore = Math.max(400, rival.baseScore + variance);
        const timeSpent = 18 + Math.floor(rng() * 25);
        const streak = rival.acc === 100 ? 5 : Math.floor(rng() * 3) + 2;

        return {
          id: `rival_${dateStr}_${idx}`,
          dateStr,
          playerName: rival.name,
          avatar: rival.avatar,
          countryFlag: rival.flag,
          score: finalScore,
          accuracy: rival.acc,
          timeSpentSeconds: timeSpent,
          highestStreak: streak,
          rankTitle: getRankTitle(rival.acc, 5, 'daily_challenge'),
          isCurrentUser: false,
        };
      });

      // Sort descending by score, then accuracy, then speed
      entries.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.timeSpentSeconds - b.timeSpentSeconds);
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }

    return entries;
  } catch {
    return [];
  }
}

/**
 * Save user score to today's Daily Challenge leaderboard and update streak progress
 */
export function recordDailyChallengeCompletion(params: {
  dateStr?: string;
  playerName: string;
  avatar: string;
  score: number;
  accuracy: number;
  highestStreak: number;
  timeSpentSeconds: number;
  rankTitle: string;
}): { rank: number; totalPlayers: number; newStreak: number } {
  const dateStr = params.dateStr || getTodayDateString();
  const storageKey = `${DAILY_LEADERBOARD_PREFIX}${dateStr}`;

  // 1. Update Leaderboard for this date
  const entries = getDailyGlobalLeaderboard(dateStr);

  // Remove previous entry by user for today if exists
  const filtered = entries.filter((e) => !e.isCurrentUser);

  const userEntry: DailyChallengeEntry = {
    id: `user_daily_${Date.now()}`,
    dateStr,
    playerName: params.playerName.trim() || 'Daily Challenger 🎸',
    avatar: params.avatar || '🕶️',
    countryFlag: '🇬🇧',
    score: params.score,
    accuracy: params.accuracy,
    timeSpentSeconds: params.timeSpentSeconds,
    highestStreak: params.highestStreak,
    rankTitle: params.rankTitle,
    isCurrentUser: true,
  };

  filtered.push(userEntry);
  filtered.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.timeSpentSeconds - b.timeSpentSeconds);
  localStorage.setItem(storageKey, JSON.stringify(filtered));

  const userRank = filtered.findIndex((e) => e.isCurrentUser) + 1;

  // 2. Update Daily Challenge Status and Streaks
  const status = getDailyChallengeStatus();
  const isConsecutive = status.lastCompletedDate && isYesterday(status.lastCompletedDate, dateStr);
  const newStreak = isConsecutive ? status.currentStreak + 1 : 1;
  const bestStreak = Math.max(status.bestStreak, newStreak);

  const updatedHistory = [
    {
      dateStr,
      score: params.score,
      accuracy: params.accuracy,
      highestStreak: params.highestStreak,
      rankTitle: params.rankTitle,
    },
    ...status.history.filter((h) => h.dateStr !== dateStr),
  ].slice(0, 30);

  const updatedStatus: DailyChallengeStatus = {
    lastCompletedDate: dateStr,
    currentStreak: newStreak,
    bestStreak,
    totalCompleted: status.totalCompleted + 1,
    todayCompleted: true,
    todayScore: params.score,
    todayAccuracy: params.accuracy,
    todayRank: userRank,
    todayRankTitle: params.rankTitle,
    history: updatedHistory,
  };

  localStorage.setItem(DAILY_STATUS_KEY, JSON.stringify(updatedStatus));

  return {
    rank: userRank,
    totalPlayers: filtered.length,
    newStreak,
  };
}

/**
 * Check if dateA was the day immediately before dateB
 */
function isYesterday(dateAStr: string, dateBStr: string): boolean {
  const dateA = new Date(dateAStr);
  const dateB = new Date(dateBStr);
  const diffTime = dateB.getTime() - dateA.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculate time remaining until next daily challenge unlocks (midnight local)
 */
export function getTimeUntilNextDaily(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { hours, minutes, seconds, formatted };
}
