import { HighScoreEntry, QuizResult, GenreProgress, GenreTier } from '../types';
import { getRankTitle } from './scoring';

export { getRankTitle };

const HIGH_SCORES_KEY = 'britpop_quiz_high_scores_v2';
const QUIZ_HISTORY_KEY = 'britpop_quiz_history_v2';
const BOOKMARKED_FACTS_KEY = 'britpop_quiz_bookmarks_v2';
const GENRE_PROGRESS_KEY = 'britpop_quiz_genre_progress_v2';

const INITIAL_LEADERBOARD: HighScoreEntry[] = [
  {
    id: 'lead_1',
    playerName: 'Liam G. (Burnage)',
    avatar: '🕶️',
    score: 4850,
    accuracy: 100,
    totalQuestions: 20,
    highestStreak: 20,
    date: '1996-08-10',
    mode: 'solo',
    category: 'Britpop Royalty',
    rankTitle: '👑 Britpop & 90s Music Royalty',
  },
  {
    id: 'lead_2',
    playerName: 'Jarvis C. (Sheffield)',
    avatar: '👓',
    score: 4320,
    accuracy: 95,
    totalQuestions: 20,
    highestStreak: 16,
    date: '1995-07-22',
    mode: 'solo',
    category: 'Albums & Cult Lore',
    rankTitle: '🎸 Knebworth \'96 Headline Act',
  },
  {
    id: 'lead_3',
    playerName: 'Sonic Speedster ⚡',
    avatar: '🏎️',
    score: 3950,
    accuracy: 92,
    totalQuestions: 24,
    highestStreak: 14,
    answersPerMinute: 28,
    date: '1998-04-15',
    mode: 'speed_round',
    category: 'Speed Round Blitz',
    rankTitle: '⚡ 90s Supersonic Legend',
  },
  {
    id: 'lead_4',
    playerName: 'Brooklyn Boombox 🎤',
    avatar: '🧢',
    score: 3600,
    accuracy: 90,
    totalQuestions: 15,
    highestStreak: 12,
    date: '1994-09-13',
    mode: 'genre_spotlight',
    category: '90s Hip-Hop Hits',
    rankTitle: '💿 Top of the Pops Regular',
  },
  {
    id: 'lead_5',
    playerName: 'Seattle Flannel 🎸',
    avatar: '🧥',
    score: 3250,
    accuracy: 85,
    totalQuestions: 15,
    highestStreak: 9,
    date: '1993-11-18',
    mode: 'genre_spotlight',
    category: 'Grunge & Alternative',
    rankTitle: '🍺 Camden Good Mixer VIP',
  },
];

export function getHighScores(): HighScoreEntry[] {
  try {
    const data = localStorage.getItem(HIGH_SCORES_KEY);
    if (!data) {
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveHighScore(entry: HighScoreEntry) {
  try {
    const scores = getHighScores();
    const entryWithId = {
      ...entry,
      id: entry.id || `score_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    scores.push(entryWithId);
    // Sort descending by score, then accuracy
    scores.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
    const top50 = scores.slice(0, 50);
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(top50));
    return top50;
  } catch (err) {
    console.error('Failed to save high score', err);
    return [];
  }
}

export function clearHighScores() {
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear high scores', err);
  }
}

export function saveQuizResult(result: QuizResult) {
  try {
    const history = getQuizHistory();
    history.unshift(result);
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch (err) {
    console.error('Failed to save quiz history', err);
  }
}

export function getQuizHistory(): QuizResult[] {
  try {
    const data = localStorage.getItem(QUIZ_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearQuizHistory() {
  try {
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear quiz history', err);
  }
}

export function toggleBookmarkFact(fact: { id: string; question: string; explanation: string; bandOrArtist?: string }) {
  try {
    const bookmarks = getBookmarkedFacts();
    const exists = bookmarks.some((b) => b.id === fact.id);
    let updated;
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== fact.id);
    } else {
      updated = [fact, ...bookmarks];
    }
    localStorage.setItem(BOOKMARKED_FACTS_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

export function getBookmarkedFacts(): Array<{ id: string; question: string; explanation: string; bandOrArtist?: string }> {
  try {
    const data = localStorage.getItem(BOOKMARKED_FACTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getGenreProgress(): GenreProgress {
  try {
    const data = localStorage.getItem(GENRE_PROGRESS_KEY);
    return data
      ? JSON.parse(data)
      : {
          hiphop_classics: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
          grunge_alternative: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
          britpop_royalty: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
          rave_dance_electronic: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
          pop_and_culture: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
        };
  } catch {
    return {
      hiphop_classics: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
      grunge_alternative: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
      britpop_royalty: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
      rave_dance_electronic: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
      pop_and_culture: { stars: 0, highScore: 0, highestStreak: 0, totalPlayed: 0, unlockedTier: 'bronze' },
    };
  }
}

export function updateGenreProgress(genreId: string, score: number, accuracy: number, streak: number) {
  try {
    const current = getGenreProgress();
    const existing = current[genreId] || {
      stars: 0,
      highScore: 0,
      highestStreak: 0,
      totalPlayed: 0,
      unlockedTier: 'bronze',
    };

    let newStars = existing.stars;
    if (accuracy >= 90 && newStars < 3) newStars = 3;
    else if (accuracy >= 70 && newStars < 2) newStars = 2;
    else if (accuracy >= 50 && newStars < 1) newStars = 1;

    let unlockedTier: GenreTier = 'bronze';
    if (newStars >= 3 || score > 2500) unlockedTier = 'platinum';
    else if (newStars >= 2 || score > 1500) unlockedTier = 'gold';
    else if (newStars >= 1 || score > 800) unlockedTier = 'silver';

    current[genreId] = {
      stars: Math.max(existing.stars, newStars),
      highScore: Math.max(existing.highScore, score),
      highestStreak: Math.max(existing.highestStreak, streak),
      totalPlayed: existing.totalPlayed + 1,
      unlockedTier,
    };

    localStorage.setItem(GENRE_PROGRESS_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Failed to update genre progress', err);
    return getGenreProgress();
  }
}
