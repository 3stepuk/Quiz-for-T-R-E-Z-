export type Difficulty = 'easy' | 'medium' | 'hard' | 'all';

export type QuizCategory =
  | 'all'
  | 'hiphop_classics'
  | 'grunge_alternative'
  | 'britpop_royalty'
  | 'rave_dance_electronic'
  | 'pop_and_culture'
  | 'chart_battles'
  | 'complete_the_lyric'
  | 'albums_and_lore'
  | 'b_sides_and_trivia';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bandOrArtist?: string;
  year?: number;
}

export type GameMode = 'solo' | 'speed_round' | 'genre_spotlight' | 'daily_challenge' | 'multiplayer' | 'ai_custom';

export type SoloFormat = 'quick' | 'standard' | 'marathon' | 'survival';

export interface DailyChallengeEntry {
  id: string;
  dateStr: string; // e.g. "2026-08-20"
  playerName: string;
  avatar: string;
  countryFlag?: string;
  score: number;
  accuracy: number;
  timeSpentSeconds: number;
  highestStreak: number;
  rankTitle: string;
  isCurrentUser?: boolean;
}

export interface DailyChallengeStatus {
  lastCompletedDate: string | null;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  todayCompleted: boolean;
  todayScore?: number;
  todayAccuracy?: number;
  todayRank?: number;
  todayRankTitle?: string;
  history: Array<{
    dateStr: string;
    score: number;
    accuracy: number;
    highestStreak: number;
    rankTitle: string;
  }>;
}

export type GenreTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface GenreInfo {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  icon: string;
  color: string;
  bgAccent: string;
  badge: string;
  artists: string[];
  questionsCount?: number;
}

export interface ScoreBreakdown {
  basePoints: number;
  speedBonus: number;
  streakMultiplier: number;
  streakBonus: number;
  totalPoints: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctCount: number;
  incorrectCount: number;
  currentStreak: number;
  highestStreak: number;
}

export interface PlayerAnswerRecord {
  questionId: string;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
  category: string;
  timeSpentMs: number;
  scoreEarned?: number;
  scoreBreakdown?: ScoreBreakdown;
}

export interface QuizResult {
  id: string;
  date: string;
  mode: GameMode;
  category: string;
  totalQuestions: number;
  score: number;
  accuracy: number;
  highestStreak: number;
  rankTitle: string;
  answers: PlayerAnswerRecord[];
  players?: Player[];
  // Speed mode metrics
  timeTotalSeconds?: number;
  timeRemainingSeconds?: number;
  answersPerMinute?: number;
  // Genre mode metrics
  genreTier?: GenreTier;
  genreStarsEarned?: number;
}

export interface HighScoreEntry {
  id?: string;
  playerName: string;
  avatar?: string;
  score: number;
  accuracy: number;
  totalQuestions: number;
  date: string;
  mode: GameMode | string;
  category: string;
  rankTitle: string;
  highestStreak?: number;
  answersPerMinute?: number;
}

export interface GenreProgress {
  [genreId: string]: {
    stars: number; // 0 to 4
    highScore: number;
    highestStreak: number;
    totalPlayed: number;
    unlockedTier: GenreTier;
  };
}

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'accuracy' | 'speed' | 'streak' | 'modes' | 'lore' | 'special';

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  hint: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}
