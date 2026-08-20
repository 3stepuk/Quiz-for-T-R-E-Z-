import { Difficulty, ScoreBreakdown } from '../types';

export function getBasePoints(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'hard':
      return 150;
    case 'medium':
      return 125;
    case 'easy':
    default:
      return 100;
  }
}

export function getStreakMultiplier(streak: number): { multiplier: number; bonus: number; label: string } {
  if (streak >= 10) return { multiplier: 3.0, bonus: 500, label: '3.0x GODLIKE STREAK 🔥🔥🔥' };
  if (streak >= 7) return { multiplier: 2.5, bonus: 350, label: '2.5x UNSTOPPABLE 🔥🔥' };
  if (streak >= 5) return { multiplier: 2.0, bonus: 200, label: '2.0x ON FIRE! 🔥' };
  if (streak >= 4) return { multiplier: 1.75, bonus: 100, label: '1.75x HEATING UP ⚡' };
  if (streak >= 3) return { multiplier: 1.5, bonus: 50, label: '1.5x TRIPLE HIT ✨' };
  if (streak >= 2) return { multiplier: 1.25, bonus: 25, label: '1.25x COMBO 🎵' };
  return { multiplier: 1.0, bonus: 0, label: '1.0x' };
}

export function calculateSpeedBonus(timeSpentMs: number, maxAllowedMs: number = 20000): number {
  if (timeSpentMs <= 2000) return 100; // Lightning fast (< 2s)
  if (timeSpentMs <= 4000) return 80;  // Very quick (< 4s)
  if (timeSpentMs <= 7000) return 60;  // Quick (< 7s)
  if (timeSpentMs <= 12000) return 35; // Moderate (< 12s)
  if (timeSpentMs <= 16000) return 15; // Fair (< 16s)
  return 0;
}

export function calculateQuestionScore({
  isCorrect,
  difficulty = 'medium',
  timeSpentMs,
  currentStreak,
  isTimed,
  isSpeedRound,
}: {
  isCorrect: boolean;
  difficulty?: Difficulty;
  timeSpentMs: number;
  currentStreak: number;
  isTimed: boolean;
  isSpeedRound?: boolean;
}): { breakdown: ScoreBreakdown; nextStreak: number } {
  if (!isCorrect) {
    return {
      breakdown: {
        basePoints: 0,
        speedBonus: 0,
        streakMultiplier: 1.0,
        streakBonus: 0,
        totalPoints: 0,
      },
      nextStreak: 0,
    };
  }

  const nextStreak = currentStreak + 1;
  const basePoints = getBasePoints(difficulty);
  const { multiplier, bonus: streakBonus } = getStreakMultiplier(nextStreak);
  
  let speedBonus = 0;
  if (isSpeedRound) {
    // In Speed Round, fast answering gives high speed reward
    speedBonus = timeSpentMs < 3000 ? 50 : timeSpentMs < 6000 ? 25 : 10;
  } else if (isTimed) {
    speedBonus = calculateSpeedBonus(timeSpentMs);
  }

  const multipliedBase = Math.round(basePoints * multiplier);
  const totalPoints = multipliedBase + streakBonus + speedBonus;

  return {
    breakdown: {
      basePoints,
      speedBonus,
      streakMultiplier: multiplier,
      streakBonus,
      totalPoints,
    },
    nextStreak,
  };
}

export function getRankTitle(accuracyPercent: number, totalQuestions: number, mode?: string): string {
  if (mode === 'speed_round') {
    if (totalQuestions >= 20 && accuracyPercent >= 90) return '⚡ 90s Supersonic Legend';
    if (totalQuestions >= 15 && accuracyPercent >= 80) return '🏎️ Fast-Forward Beat Master';
    if (totalQuestions >= 10 && accuracyPercent >= 70) return '🎧 Blitz Disk Jockey';
    if (totalQuestions >= 8) return '📻 Quick-Dial Radio Caller';
    return '📼 Rewind Apprentice';
  }

  if (accuracyPercent === 100 && totalQuestions >= 10) return '👑 Britpop & 90s Music Royalty';
  if (accuracyPercent >= 90) return '🎸 Knebworth \'96 Headline Act';
  if (accuracyPercent >= 80) return '💿 Top of the Pops Regular';
  if (accuracyPercent >= 70) return '🍺 Camden Good Mixer VIP';
  if (accuracyPercent >= 60) return '📰 Dedicated NME Subscriber';
  if (accuracyPercent >= 50) return '🪩 Indie Disco Regular';
  return '📻 Casual 90s Radio Listener';
}
