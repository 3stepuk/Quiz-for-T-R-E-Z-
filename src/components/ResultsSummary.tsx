import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizResult, Player, HighScoreEntry, Badge } from '../types';
import {
  Trophy,
  Flame,
  RotateCcw,
  Home,
  Sparkles,
  CheckCircle2,
  XCircle,
  Share2,
  Award,
  BookOpen,
  Zap,
  Star,
  Disc,
  Clock,
  UserCheck,
  ChevronRight,
  Calendar,
  Medal,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { saveHighScore, getHighScores, updateGenreProgress } from '../utils/storage';
import { checkAndUnlockBadges } from '../utils/badgeSystem';

interface ResultsSummaryProps {
  result: QuizResult;
  players?: Player[];
  onPlayAgain: () => void;
  onHome: () => void;
  onViewBadges?: () => void;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  result,
  players,
  onPlayAgain,
  onHome,
  onViewBadges,
}) => {
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('britpop_player_name') || '90s Britpop Fan';
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🕶️');
  const [isScoreSaved, setIsScoreSaved] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  useEffect(() => {
    soundEffects.playVictory();

    // Trigger celebratory confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f43f5e', '#fbbf24', '#6366f1', '#10b981', '#00d2ff', '#a855f7'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // If genre spotlight, update persistent genre progress
    if (result.mode === 'genre_spotlight' && result.category) {
      updateGenreProgress(
        result.category,
        result.score,
        result.accuracy,
        result.highestStreak
      );
    }

    // Check for badge unlocks!
    const { newlyUnlocked } = checkAndUnlockBadges(result);
    if (newlyUnlocked.length > 0) {
      setNewlyUnlockedBadges(newlyUnlocked);
      soundEffects.playStreakBonus();
    }
  }, [result]);

  const handleSaveToLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (isScoreSaved) return;

    soundEffects.playStreakBonus();
    const finalName = playerName.trim() || '90s Fan';
    localStorage.setItem('britpop_player_name', finalName);

    const entry: HighScoreEntry = {
      playerName: finalName,
      avatar: selectedAvatar,
      score: result.score,
      accuracy: result.accuracy,
      totalQuestions: result.totalQuestions,
      highestStreak: result.highestStreak,
      answersPerMinute: result.answersPerMinute,
      date: new Date().toLocaleDateString(),
      mode: result.mode,
      category: result.category,
      rankTitle: result.rankTitle,
    };

    const updatedLeaderboard = saveHighScore(entry);
    const pos = updatedLeaderboard.findIndex((s) => s.score === result.score && s.playerName === finalName);
    setLeaderboardRank(pos >= 0 ? pos + 1 : 1);
    setIsScoreSaved(true);
  };

  const handleShare = () => {
    soundEffects.playClick();
    const text = `I just scored ${result.score.toLocaleString()} points (${result.accuracy}%) on the 90s Music & Britpop Quiz and earned the title: "${result.rankTitle}"! 🎸🇬🇧`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const sortedPlayers = players ? [...players].sort((a, b) => b.score - a.score) : [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in text-black">
      {/* Trophy / Header Podium Box */}
      <div className="bg-white border-3 sm:border-4 border-black rounded-3xl p-6 sm:p-8 shadow-neo-xl text-center relative overflow-hidden mb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#FFE600] border-3 border-black flex items-center justify-center shadow-neo">
          {result.mode === 'speed_round' ? (
            <Zap className="w-10 h-10 text-black animate-pulse fill-[#FFE600]" />
          ) : result.mode === 'genre_spotlight' ? (
            <Disc className="w-10 h-10 text-black animate-spin [animation-duration:6s]" />
          ) : result.mode === 'daily_challenge' ? (
            <Calendar className="w-10 h-10 text-[#FF4B4B] animate-bounce" />
          ) : (
            <Trophy className="w-10 h-10 text-black animate-bounce" />
          )}
        </div>

        <div className="inline-block px-3.5 py-1 rounded-full bg-[#FFE600] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-2 shadow-neo-sm">
          {result.mode === 'speed_round'
            ? '⚡ Speed Round Finished!'
            : result.mode === 'genre_spotlight'
            ? '🎸 Genre Spotlight Completed!'
            : result.mode === 'daily_challenge'
            ? '📅 Daily 90s Quest Completed!'
            : 'Quiz Completed!'}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight mb-1">
          {players && players.length > 1 ? (
            <span>
              🏆 <span className="underline decoration-[#FF4B4B] decoration-wavy decoration-2">{sortedPlayers[0]?.name}</span> Wins the Battle!
            </span>
          ) : (
            'Top of the Pops Scorecard'
          )}
        </h1>

        <p className="text-base sm:text-xl font-black text-[#FF4B4B] mb-6">
          "{result.rankTitle}"
        </p>

        {/* Multiplayer Standings Podium */}
        {players && players.length > 1 ? (
          <div className="mb-6 space-y-3 max-w-lg mx-auto">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`p-4 rounded-2xl border-2 border-black flex items-center justify-between transition-all ${
                  idx === 0
                    ? 'bg-[#FFE600] border-3 border-black shadow-neo-lg text-black font-black'
                    : 'bg-white shadow-neo text-black font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center border-2 border-black shadow-neo-sm ${
                      idx === 0 ? 'bg-black text-white' : 'bg-[#F7F2E8] text-black'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="text-2xl">
                    {player.avatar === 'liam' && '🕶️'}
                    {player.avatar === 'damon' && '👕'}
                    {player.avatar === 'jarvis' && '👓'}
                    {player.avatar === 'shirley' && '👩‍🎤'}
                    {player.avatar === 'geri' && '🇬🇧'}
                    {player.avatar === 'brett' && '🎙️'}
                    {player.avatar === 'keith' && '⚡'}
                    {player.avatar === 'ashcroft' && '🚶‍♂️'}
                  </span>
                  <div className="text-left">
                    <span className="font-black text-black text-sm">{player.name}</span>
                    <span className="text-[11px] text-black/75 font-semibold block">
                      {player.correctCount} Correct answers
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-black text-base">{player.score.toLocaleString()} pts</div>
                  <div className="text-[10px] text-black/70 font-bold">Best Streak: {player.highestStreak}x</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Solo & Specialized Mode Metrics */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6">
            <div className="bg-[#F7F2E8] border-2 border-black p-3.5 rounded-2xl shadow-neo-sm">
              <span className="text-[11px] font-black text-black/70 uppercase tracking-wider block">Final Score</span>
              <span className="text-2xl font-black text-[#FF4B4B]">{result.score.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F2E8] border-2 border-black p-3.5 rounded-2xl shadow-neo-sm">
              <span className="text-[11px] font-black text-black/70 uppercase tracking-wider block">Accuracy</span>
              <span className="text-2xl font-black text-black">{result.accuracy}%</span>
            </div>

            <div className="bg-[#F7F2E8] border-2 border-black p-3.5 rounded-2xl shadow-neo-sm">
              <span className="text-[11px] font-black text-black/70 uppercase tracking-wider block">Best Streak</span>
              <span className="text-2xl font-black text-black flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-[#FF8A00] fill-[#FF8A00]" />
                {result.highestStreak}x
              </span>
            </div>

            <div className="bg-[#F7F2E8] border-2 border-black p-3.5 rounded-2xl shadow-neo-sm">
              <span className="text-[11px] font-black text-black/70 uppercase tracking-wider block">
                {result.mode === 'speed_round' ? 'Answering Pace' : 'Questions'}
              </span>
              <span className="text-2xl font-black text-black">
                {result.mode === 'speed_round'
                  ? `${result.answersPerMinute || Math.round((result.totalQuestions / 1) * 60)}/m`
                  : result.totalQuestions}
              </span>
            </div>
          </div>
        )}

        {/* Save to Leaderboard Submission Form */}
        {(!players || players.length <= 1) && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-neo">
            {!isScoreSaved ? (
              <form onSubmit={handleSaveToLeaderboard} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-black" />
                    Register on 90s Leaderboard
                  </span>
                  <span className="text-[11px] font-bold text-black/80">Claim your rank</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Avatar Picker */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-black shadow-neo-sm">
                    {['🕶️', '🎤', '👓', '👩‍🎤', '🎸'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setSelectedAvatar(em)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                          selectedAvatar === em ? 'bg-black text-white' : 'hover:bg-stone-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  {/* Name input */}
                  <input
                    type="text"
                    id="save-leaderboard-name-input"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={25}
                    placeholder="Enter your name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-black font-black text-sm text-black shadow-neo-sm focus:outline-none"
                  />

                  {/* Save button */}
                  <button
                    type="submit"
                    id="submit-leaderboard-score-btn"
                    className="px-4 py-2 rounded-xl bg-black text-white font-black text-xs border-2 border-black shadow-neo-sm hover:bg-stone-800 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Save Score</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-6 h-6 text-black" />
                  <div>
                    <span className="text-xs font-black text-black block">
                      Score Saved to Leaderboard!
                    </span>
                    <span className="text-[11px] font-bold text-black/85">
                      {selectedAvatar} {playerName} • Ranked #{leaderboardRank || 1} on the 90s leaderboard
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-black text-[#FFE600] rounded-xl text-xs font-black border border-black shadow-neo-sm">
                  #{leaderboardRank || 1} Top Score
                </span>
              </div>
            )}
          </div>
        )}

        {/* Newly Unlocked Badges Celebration Section */}
        {newlyUnlockedBadges.length > 0 && (
          <div className="max-w-xl mx-auto mb-6 p-4.5 rounded-3xl bg-[#A855F7] text-white border-3 border-black shadow-neo animate-bounce-subtle">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-black shadow-neo-sm">
                  🏅
                </div>
                <span className="text-sm font-black uppercase tracking-wider text-white">
                  {newlyUnlockedBadges.length === 1 ? 'New Achievement Unlocked!' : `${newlyUnlockedBadges.length} New Badges Unlocked!`}
                </span>
              </div>
              {onViewBadges && (
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onViewBadges();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FFE600] text-black text-xs font-black border-2 border-black shadow-neo-sm transition-all cursor-pointer"
                >
                  View All Badges
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {newlyUnlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-2xl bg-white text-black border-2 border-black shadow-neo-sm flex items-center gap-3"
                >
                  <span className="text-2xl w-10 h-10 rounded-xl bg-[#F7F2E8] border border-black flex items-center justify-center shrink-0">
                    {badge.icon}
                  </span>
                  <div className="text-left overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-xs text-black truncate">{badge.title}</span>
                      <span className="text-[9px] px-1 rounded bg-[#FFE600] border border-black font-black uppercase">
                        {badge.rarity}
                      </span>
                    </div>
                    <span className="text-[10px] text-black/75 font-bold line-clamp-1">
                      {badge.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="play-again-btn"
            onClick={() => {
              soundEffects.playClick();
              onPlayAgain();
            }}
            className="px-6 py-3 rounded-2xl bg-[#FF4B4B] hover:bg-[#ff3333] text-white font-black text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Another Round
          </button>

          <button
            id="toggle-review-btn"
            onClick={() => {
              soundEffects.playClick();
              setShowReview(!showReview);
            }}
            className="px-5 py-3 rounded-2xl bg-[#00D2FF] hover:bg-[#38BDF8] text-black font-black text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-black" />
            {showReview ? 'Hide Question Breakdown' : 'Review All Answers'}
          </button>

          <button
            id="share-results-btn"
            onClick={handleShare}
            className="px-5 py-3 rounded-2xl bg-[#FFE600] hover:bg-[#FACC15] text-black font-black text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-black" />
            {copied ? 'Score Copied!' : 'Share Score'}
          </button>

          <button
            id="home-menu-btn"
            onClick={() => {
              soundEffects.playClick();
              onHome();
            }}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-[#F7F2E8] text-black font-black text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-black" />
            Main Menu
          </button>
        </div>
      </div>

      {/* Question Breakdown Review List */}
      {showReview && (
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo-lg animate-fade-in text-black">
          <h2 className="text-lg font-black text-black mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6366F1]" />
            Answer Review & 90s Trivia Explanations
          </h2>

          <div className="space-y-4">
            {result.answers.map((ans, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border-2 border-black shadow-neo ${
                  ans.isCorrect ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#FF4B4B] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-black text-black/70 block mb-0.5">
                        Question {idx + 1}
                      </span>
                      <h4 className="font-black text-sm text-black leading-snug">
                        {ans.questionText}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-black my-2.5 pl-7">
                  <div className="p-2 rounded-xl bg-white border border-black shadow-neo-sm">
                    <span className="text-black/60 block text-[10px] uppercase font-bold">Your Answer:</span>
                    <span className={ans.isCorrect ? 'text-[#10B981]' : 'text-[#FF4B4B]'}>
                      {ans.selectedOption || 'Timed Out'}
                    </span>
                  </div>
                  {!ans.isCorrect && (
                    <div className="p-2 rounded-xl bg-white border border-black shadow-neo-sm">
                      <span className="text-black/60 block text-[10px] uppercase font-bold">Correct Answer:</span>
                      <span className="text-[#10B981]">{ans.correctOption}</span>
                    </div>
                  )}
                </div>

                {ans.scoreBreakdown && ans.isCorrect && (
                  <div className="pl-7 mb-2 flex items-center gap-2 text-[11px] font-black text-black/75">
                    <span className="bg-[#10B981]/20 text-[#047857] px-2 py-0.5 rounded border border-[#047857]/30">
                      +{ans.scoreBreakdown.totalPoints} pts
                    </span>
                    <span>Base: {ans.scoreBreakdown.basePoints}</span>
                    {ans.scoreBreakdown.speedBonus > 0 && <span>• Speed: +{ans.scoreBreakdown.speedBonus}</span>}
                    {ans.scoreBreakdown.streakMultiplier > 1 && <span>• Streak: {ans.scoreBreakdown.streakMultiplier}x</span>}
                  </div>
                )}

                <div className="pl-7 pt-2 border-t border-black/10">
                  <p className="text-xs text-black/80 leading-relaxed font-bold">
                    💡 <span className="font-black text-black">Factoid:</span> {ans.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
