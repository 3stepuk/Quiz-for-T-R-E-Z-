import { Badge, QuizResult } from '../types';
import { getQuizHistory, getBookmarkedFacts, getGenreProgress } from './storage';
import { getDailyChallengeStatus } from './dailyChallenge';

const BADGES_STORAGE_KEY = 'britpop_quiz_unlocked_badges_v1';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'first_gig',
    title: 'First Gig',
    subtitle: 'Stepped onto the stage',
    description: 'Completed your very first 90s music quiz.',
    icon: '🎟️',
    category: 'special',
    rarity: 'bronze',
    hint: 'Finish any quiz mode once.',
    maxProgress: 1,
  },
  {
    id: 'britpop_legend',
    title: 'Britpop Legend',
    subtitle: 'King of Cool Britannia',
    description: 'Scored 90%+ accuracy in Britpop Royalty with at least 10 questions.',
    icon: '👑',
    category: 'accuracy',
    rarity: 'gold',
    hint: 'Score 90%+ in Britpop Royalty (10+ Qs).',
    maxProgress: 100,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    subtitle: 'Supersonic reaction time',
    description: 'Scored 2,500+ points in Speed Round Blitz or exceeded 20 Answers/Min.',
    icon: '⚡',
    category: 'speed',
    rarity: 'gold',
    hint: 'Achieve 2,500+ points in Speed Blitz.',
    maxProgress: 2500,
  },
  {
    id: 'flawless_master',
    title: 'Flawless Master',
    subtitle: 'Total 90s perfection',
    description: 'Achieved a perfect 100% accuracy score in any quiz with at least 5 questions.',
    icon: '💎',
    category: 'accuracy',
    rarity: 'diamond',
    hint: 'Answer every single question right (5+ Qs).',
    maxProgress: 100,
  },
  {
    id: 'streak_machine',
    title: 'Streak Machine',
    subtitle: 'Unstoppable rhythm',
    description: 'Hit a 10x consecutive correct answer streak in a single round.',
    icon: '🔥',
    category: 'streak',
    rarity: 'silver',
    hint: 'Reach a 10-question streak.',
    maxProgress: 10,
  },
  {
    id: 'streak_titan',
    title: 'Streak Titan',
    subtitle: 'Godlike memory',
    description: 'Hit an epic 20x consecutive correct answer streak in a single round.',
    icon: '🚀',
    category: 'streak',
    rarity: 'diamond',
    hint: 'Reach a massive 20-question streak.',
    maxProgress: 20,
  },
  {
    id: 'time_traveler',
    title: '90s Time Traveler',
    subtitle: 'Master of all dimensions',
    description: 'Played all 4 core modes: Solo Master, Speed Blitz, Genre Spotlight, and Daily Quest.',
    icon: '📼',
    category: 'modes',
    rarity: 'gold',
    hint: 'Play Solo, Speed, Genre, and Daily modes.',
    maxProgress: 4,
  },
  {
    id: 'genre_explorer',
    title: 'Genre Explorer',
    subtitle: 'Eclectic taste',
    description: 'Played quizzes across 3 or more distinct 90s categories or spotlight genres.',
    icon: '🎸',
    category: 'modes',
    rarity: 'silver',
    hint: 'Explore 3 different genres or spotlights.',
    maxProgress: 3,
  },
  {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    subtitle: 'Routine of champions',
    description: 'Completed 3 Daily 90s Quests or maintained a 3-day daily streak.',
    icon: '📅',
    category: 'special',
    rarity: 'gold',
    hint: 'Complete 3 daily quests.',
    maxProgress: 3,
  },
  {
    id: 'point_hoarder',
    title: 'Point Hoarder',
    subtitle: 'Arcade high-roller',
    description: 'Accumulated 3,500+ points in a single standard quiz round.',
    icon: '💰',
    category: 'special',
    rarity: 'silver',
    hint: 'Score 3,500+ points in one quiz.',
    maxProgress: 3500,
  },
  {
    id: 'vault_keeper',
    title: 'Vault Keeper',
    subtitle: 'Custodian of 90s Lore',
    description: 'Saved 3 or more trivia factoids to your personal Lore Vault.',
    icon: '📚',
    category: 'lore',
    rarity: 'bronze',
    hint: 'Save 3 facts from questions.',
    maxProgress: 3,
  },
  {
    id: 'couch_champion',
    title: 'Couch Champion',
    subtitle: 'Party legend',
    description: 'Completed a Multiplayer Couch Battle with friends.',
    icon: '👥',
    category: 'modes',
    rarity: 'bronze',
    hint: 'Complete a multiplayer party quiz.',
    maxProgress: 1,
  },
  {
    id: 'marathon_finisher',
    title: 'Marathon Finisher',
    subtitle: 'Iron endurance',
    description: 'Completed a 20-question Marathon or scored 2,000+ points in Survival Mode.',
    icon: '🏃',
    category: 'modes',
    rarity: 'silver',
    hint: 'Finish a 20-question marathon or 2,000+ in Survival.',
    maxProgress: 1,
  },
  {
    id: 'hiphop_master',
    title: 'Boombox Master',
    subtitle: 'Golden era aficionado',
    description: 'Achieved 85%+ in 90s Hip-Hop Classics or earned 3 stars in Hip-Hop Spotlight.',
    icon: '📻',
    category: 'accuracy',
    rarity: 'gold',
    hint: 'Earn 3 stars or 85%+ in Hip-Hop.',
    maxProgress: 100,
  },
  {
    id: 'grunge_god',
    title: 'Seattle Grunge God',
    subtitle: 'Smells like triumph',
    description: 'Achieved 85%+ in Grunge & Alternative or earned 3 stars in Alternative Spotlight.',
    icon: '🌲',
    category: 'accuracy',
    rarity: 'gold',
    hint: 'Earn 3 stars or 85%+ in Grunge/Alternative.',
    maxProgress: 100,
  },
];

interface UnlockedMap {
  [badgeId: string]: string; // badgeId -> ISO string date unlocked
}

export function getUnlockedMap(): UnlockedMap {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUnlockedMap(map: UnlockedMap) {
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save unlocked badges', err);
  }
}

/**
 * Returns all badge definitions with live unlocked status and progress calculated.
 */
export function getAllBadgesWithStatus(): Badge[] {
  const unlocked = getUnlockedMap();
  const history = getQuizHistory();
  const bookmarks = getBookmarkedFacts();
  const dailyStatus = getDailyChallengeStatus();
  const genreProgress = getGenreProgress();

  // Aggregate stats across history
  const distinctModes = new Set(history.map((h) => h.mode));
  const distinctCategories = new Set(history.map((h) => h.category));
  const highestHistoricalStreak = history.reduce((max, h) => Math.max(max, h.highestStreak || 0), 0);
  const highestHistoricalScore = history.reduce((max, h) => Math.max(max, h.score || 0), 0);

  return BADGE_DEFINITIONS.map((badge) => {
    const isUnlocked = Boolean(unlocked[badge.id]);
    let progress = 0;

    switch (badge.id) {
      case 'first_gig':
        progress = isUnlocked || history.length > 0 ? 1 : 0;
        break;
      case 'britpop_legend': {
        const bestBritpopAcc = history
          .filter((h) => (h.category.toLowerCase().includes('britpop') || h.category.toLowerCase().includes('royalty')) && h.totalQuestions >= 10)
          .reduce((max, h) => Math.max(max, h.accuracy), 0);
        progress = isUnlocked ? 100 : bestBritpopAcc;
        break;
      }
      case 'speed_demon': {
        const bestSpeedScore = history
          .filter((h) => h.mode === 'speed_round')
          .reduce((max, h) => Math.max(max, h.score), 0);
        progress = isUnlocked ? 2500 : Math.min(2500, bestSpeedScore);
        break;
      }
      case 'flawless_master': {
        const perfectExists = history.some((h) => h.accuracy === 100 && h.totalQuestions >= 5);
        progress = isUnlocked || perfectExists ? 100 : 0;
        break;
      }
      case 'streak_machine':
        progress = isUnlocked ? 10 : Math.min(10, highestHistoricalStreak);
        break;
      case 'streak_titan':
        progress = isUnlocked ? 20 : Math.min(20, highestHistoricalStreak);
        break;
      case 'time_traveler': {
        const requiredModes = ['solo', 'speed_round', 'genre_spotlight', 'daily_challenge'];
        const playedCount = requiredModes.filter((m) => distinctModes.has(m as any)).length;
        progress = isUnlocked ? 4 : playedCount;
        break;
      }
      case 'genre_explorer':
        progress = isUnlocked ? 3 : Math.min(3, Math.max(distinctCategories.size, distinctModes.size));
        break;
      case 'daily_devotee': {
        const completedTotal = dailyStatus.totalCompleted || dailyStatus.history?.length || 0;
        progress = isUnlocked ? 3 : Math.min(3, Math.max(completedTotal, dailyStatus.bestStreak));
        break;
      }
      case 'point_hoarder':
        progress = isUnlocked ? 3500 : Math.min(3500, highestHistoricalScore);
        break;
      case 'vault_keeper':
        progress = isUnlocked ? 3 : Math.min(3, bookmarks.length);
        break;
      case 'couch_champion':
        progress = isUnlocked || distinctModes.has('multiplayer') ? 1 : 0;
        break;
      case 'marathon_finisher': {
        const marathonDone = history.some((h) => h.totalQuestions >= 20 || (h.score >= 2000 && h.mode === 'solo'));
        progress = isUnlocked || marathonDone ? 1 : 0;
        break;
      }
      case 'hiphop_master': {
        const hipHopStar = (genreProgress['hiphop_classics']?.stars || 0) >= 3;
        const bestHipHopAcc = history
          .filter((h) => h.category.toLowerCase().includes('hip-hop') || h.category.toLowerCase().includes('hiphop'))
          .reduce((max, h) => Math.max(max, h.accuracy), 0);
        progress = isUnlocked || hipHopStar ? 100 : bestHipHopAcc;
        break;
      }
      case 'grunge_god': {
        const grungeStar = (genreProgress['grunge_alternative']?.stars || 0) >= 3;
        const bestGrungeAcc = history
          .filter((h) => h.category.toLowerCase().includes('grunge') || h.category.toLowerCase().includes('alternative'))
          .reduce((max, h) => Math.max(max, h.accuracy), 0);
        progress = isUnlocked || grungeStar ? 100 : bestGrungeAcc;
        break;
      }
      default:
        progress = isUnlocked ? 1 : 0;
    }

    return {
      ...badge,
      unlockedAt: unlocked[badge.id] || undefined,
      progress,
    };
  });
}

/**
 * Evaluates current game result and state, unlocking any newly earned badges.
 * Returns the list of newly unlocked badges.
 */
export function checkAndUnlockBadges(latestResult?: QuizResult): {
  newlyUnlocked: Badge[];
  allBadges: Badge[];
} {
  const unlocked = getUnlockedMap();
  const now = new Date().toISOString();
  const newlyUnlockedIds: string[] = [];

  const history = getQuizHistory();
  const bookmarks = getBookmarkedFacts();
  const dailyStatus = getDailyChallengeStatus();
  const genreProgress = getGenreProgress();

  const allHistory = latestResult ? [latestResult, ...history] : history;
  const distinctModes = new Set(allHistory.map((h) => h.mode));
  const distinctCategories = new Set(allHistory.map((h) => h.category));
  const highestStreak = allHistory.reduce((max, h) => Math.max(max, h.highestStreak || 0), 0);
  const highestScore = allHistory.reduce((max, h) => Math.max(max, h.score || 0), 0);

  const checkAndGrant = (badgeId: string, condition: boolean) => {
    if (!unlocked[badgeId] && condition) {
      unlocked[badgeId] = now;
      newlyUnlockedIds.push(badgeId);
    }
  };

  // 1. First Gig
  checkAndGrant('first_gig', allHistory.length > 0);

  // 2. Britpop Legend
  const britpopMaster = allHistory.some(
    (h) =>
      (h.category.toLowerCase().includes('britpop') || h.category.toLowerCase().includes('royalty')) &&
      h.totalQuestions >= 10 &&
      h.accuracy >= 90
  );
  checkAndGrant('britpop_legend', britpopMaster);

  // 3. Speed Demon
  const speedDemon = allHistory.some(
    (h) => h.mode === 'speed_round' && (h.score >= 2500 || (h.answersPerMinute && h.answersPerMinute >= 20))
  );
  checkAndGrant('speed_demon', speedDemon);

  // 4. Flawless Master
  const flawless = allHistory.some((h) => h.accuracy === 100 && h.totalQuestions >= 5);
  checkAndGrant('flawless_master', flawless);

  // 5. Streak Machine (10x)
  checkAndGrant('streak_machine', highestStreak >= 10);

  // 6. Streak Titan (20x)
  checkAndGrant('streak_titan', highestStreak >= 20);

  // 7. 90s Time Traveler (All 4 modes)
  const hasSolo = distinctModes.has('solo');
  const hasSpeed = distinctModes.has('speed_round');
  const hasGenre = distinctModes.has('genre_spotlight');
  const hasDaily = distinctModes.has('daily_challenge');
  checkAndGrant('time_traveler', hasSolo && hasSpeed && hasGenre && hasDaily);

  // 8. Genre Explorer (3 distinct genres/modes)
  checkAndGrant('genre_explorer', distinctCategories.size >= 3 || distinctModes.size >= 3);

  // 9. Daily Devotee (3 daily quests or 3-day streak)
  const dailyDone = (dailyStatus.totalCompleted || 0) >= 3 || dailyStatus.bestStreak >= 3;
  checkAndGrant('daily_devotee', dailyDone);

  // 10. Point Hoarder (3500+ pts)
  checkAndGrant('point_hoarder', highestScore >= 3500);

  // 11. Vault Keeper (3+ saved bookmarks)
  checkAndGrant('vault_keeper', bookmarks.length >= 3);

  // 12. Couch Champion (Multiplayer)
  checkAndGrant('couch_champion', distinctModes.has('multiplayer'));

  // 13. Marathon Finisher
  const marathonDone = allHistory.some(
    (h) => h.totalQuestions >= 20 || (h.mode === 'solo' && h.score >= 2000)
  );
  checkAndGrant('marathon_finisher', marathonDone);

  // 14. Boombox Master
  const hipHopDone =
    (genreProgress['hiphop_classics']?.stars || 0) >= 3 ||
    allHistory.some(
      (h) =>
        (h.category.toLowerCase().includes('hip-hop') || h.category.toLowerCase().includes('hiphop')) &&
        h.accuracy >= 85
    );
  checkAndGrant('hiphop_master', hipHopDone);

  // 15. Seattle Grunge God
  const grungeDone =
    (genreProgress['grunge_alternative']?.stars || 0) >= 3 ||
    allHistory.some(
      (h) =>
        (h.category.toLowerCase().includes('grunge') || h.category.toLowerCase().includes('alternative')) &&
        h.accuracy >= 85
    );
  checkAndGrant('grunge_god', grungeDone);

  if (newlyUnlockedIds.length > 0) {
    saveUnlockedMap(unlocked);
  }

  const allBadges = getAllBadgesWithStatus();
  const newlyUnlocked = allBadges.filter((b) => newlyUnlockedIds.includes(b.id));

  return { newlyUnlocked, allBadges };
}

export function resetBadges() {
  localStorage.removeItem(BADGES_STORAGE_KEY);
}
