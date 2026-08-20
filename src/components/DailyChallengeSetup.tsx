import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Zap,
  Flame,
  Trophy,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Globe,
  Star,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import {
  getTodayDateString,
  getDailyChallengeStatus,
  getDailyGlobalLeaderboard,
  getTimeUntilNextDaily,
} from '../utils/dailyChallenge';
import { DailyChallengeStatus, DailyChallengeEntry } from '../types';

interface DailyChallengeSetupProps {
  onStartDailyChallenge: (playerName: string, avatar: string) => void;
  onPracticeDailyChallenge?: (playerName: string, avatar: string) => void;
}

export const DailyChallengeSetup: React.FC<DailyChallengeSetupProps> = ({
  onStartDailyChallenge,
  onPracticeDailyChallenge,
}) => {
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('britpop_player_name') || 'Daily Challenger 🎸';
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🕶️');
  const [status, setStatus] = useState<DailyChallengeStatus>(getDailyChallengeStatus());
  const [leaderboard, setLeaderboard] = useState<DailyChallengeEntry[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const todayStr = getTodayDateString();

  // Load leaderboard and ticker timer
  useEffect(() => {
    setStatus(getDailyChallengeStatus());
    setLeaderboard(getDailyGlobalLeaderboard(todayStr));

    const updateTimer = () => {
      const { formatted } = getTimeUntilNextDaily();
      setTimeRemaining(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayStr]);

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playStart();
    const finalName = playerName.trim() || 'Daily Challenger 🎸';
    localStorage.setItem('britpop_player_name', finalName);
    onStartDailyChallenge(finalName, selectedAvatar);
  };

  const handlePractice = () => {
    soundEffects.playClick();
    const finalName = playerName.trim() || 'Daily Challenger 🎸';
    if (onPracticeDailyChallenge) {
      onPracticeDailyChallenge(finalName, selectedAvatar);
    } else {
      onStartDailyChallenge(finalName, selectedAvatar);
    }
  };

  const userEntry = leaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 animate-fade-in text-black space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-[#FFE600] border-3 sm:border-4 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider mb-3 shadow-neo-sm">
              <Calendar className="w-3.5 h-3.5 text-[#FFE600]" />
              Universal Daily Quest • 5 Questions
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-2">
              Daily 90s Music Challenge
            </h1>

            <p className="text-sm sm:text-base font-bold text-black/85 max-w-xl mb-3">
              One universal 5-question quest served fresh every single day! All players worldwide compete on the exact
              same questions. Build your consecutive daily streak and battle for today's #1 global rank.
            </p>

            <div className="flex items-center gap-2 text-xs font-black text-black bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-black inline-flex">
              <Calendar className="w-4 h-4 text-[#FF4B4B]" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Right Cards: Reset Countdown & Daily Streak */}
          <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
            {/* Countdown Box */}
            <div className="flex-1 md:flex-initial bg-white border-2 sm:border-3 border-black p-4 rounded-2xl shadow-neo text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-black/70 uppercase mb-1">
                <Clock className="w-4 h-4 text-[#FF4B4B]" />
                Next Quest In
              </div>
              <div className="text-2xl sm:text-3xl font-black text-black font-mono tracking-wider">
                {timeRemaining || '00:00:00'}
              </div>
            </div>

            {/* Streak Box */}
            <div className="flex-1 md:flex-initial bg-[#FF4B4B] text-white border-2 sm:border-3 border-black p-4 rounded-2xl shadow-neo text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-white/90 uppercase mb-1">
                <Flame className="w-4 h-4 text-[#FFE600] fill-[#FFE600]" />
                Daily Streak
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {status.currentStreak} {status.currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-[10px] font-bold text-white/80">
                Best: {status.bestStreak} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Launch / Completed Status + Global Daily Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Play Box / Completed Card (5 cols on LG) */}
        <div className="lg:col-span-5 space-y-6">
          {status.todayCompleted ? (
            /* Already Completed State */
            <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo space-y-4">
              <div className="flex items-center gap-2 text-[#10B981]">
                <CheckCircle2 className="w-6 h-6 fill-[#10B981] text-white" />
                <span className="font-black text-base text-black">
                  Today's Challenge Completed!
                </span>
              </div>

              <p className="text-xs font-bold text-black/80">
                You have recorded your official score for <span className="font-black">{todayStr}</span>.
                Your result has been registered on today's Global Leaderboard!
              </p>

              {/* User Today Scorecard */}
              <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-neo-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-black">
                  <span>Your Official Today Rank:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-black text-[#FFE600] font-black text-sm">
                    #{status.todayRank || (userEntry ? leaderboard.indexOf(userEntry) + 1 : 1)} Global
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/20">
                  <div className="bg-white p-2.5 rounded-xl border border-black">
                    <span className="text-[10px] font-black text-black/60 uppercase block">Score</span>
                    <span className="text-lg font-black text-[#FF4B4B]">
                      {status.todayScore?.toLocaleString() || userEntry?.score.toLocaleString() || '0'} pts
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-black">
                    <span className="text-[10px] font-black text-black/60 uppercase block">Accuracy</span>
                    <span className="text-lg font-black text-black">
                      {status.todayAccuracy || userEntry?.accuracy || 100}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-black text-black pt-1 text-center">
                  "{status.todayRankTitle || userEntry?.rankTitle || 'Daily 90s Contender'}"
                </div>
              </div>

              {/* Practice Button */}
              <button
                type="button"
                id="replay-daily-practice-btn"
                onClick={handlePractice}
                className="w-full py-3 px-4 rounded-2xl bg-[#00D2FF] hover:bg-[#38BDF8] text-black font-black text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Replay in Practice Mode
              </button>
            </div>
          ) : (
            /* Ready to Play Form */
            <form onSubmit={handleStart} className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-[#FF4B4B]" />
                <h2 className="font-black text-lg text-black">Enter Today's Challenge</h2>
              </div>

              <p className="text-xs font-bold text-black/75">
                Answer all 5 questions accurately and quickly. Streak multipliers and speed bonuses apply!
              </p>

              {/* Player Tag */}
              <div>
                <label className="text-xs font-black text-black block mb-1.5 uppercase">
                  Player Name & Avatar
                </label>

                <div className="flex items-center gap-2">
                  {/* Avatar Picker */}
                  <div className="flex items-center gap-1 bg-[#F7F2E8] p-1 rounded-xl border-2 border-black">
                    {['🕶️', '🎤', '👓', '👩‍🎤', '🎸'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedAvatar(em);
                        }}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          selectedAvatar === em ? 'bg-black text-white shadow-neo-sm' : 'hover:bg-stone-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    id="daily-player-name-input"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={25}
                    placeholder="Your arcade name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F7F2E8] border-2 border-black font-black text-sm text-black focus:outline-none focus:bg-[#FFE600] transition-colors"
                  />
                </div>
              </div>

              {/* Rules summary */}
              <div className="p-3 bg-[#F7F2E8] rounded-2xl border border-black/30 space-y-1.5 text-xs font-bold text-black/80">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>5 Deterministic Questions picked for today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>Earn speed bonuses by answering in under 5 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">3</span>
                  <span>Keep your daily streak alive to unlock milestone badges</span>
                </div>
              </div>

              {/* Launch Button */}
              <button
                type="submit"
                id="start-daily-challenge-btn"
                className="w-full py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-base sm:text-lg border-3 border-black shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-white" />
                Start Today's Quest (5 Qs)
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Streak Milestone Rewards Shelf */}
          <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-neo">
            <h3 className="font-black text-sm text-black mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6366F1]" />
              Daily Streak Milestone Badges
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { days: 1, title: 'Camden Novice', icon: '🍺', unlocked: status.currentStreak >= 1 || status.bestStreak >= 1 },
                { days: 3, title: 'Top of the Pops', icon: '💿', unlocked: status.currentStreak >= 3 || status.bestStreak >= 3 },
                { days: 7, title: 'Knebworth Headline', icon: '🎸', unlocked: status.currentStreak >= 7 || status.bestStreak >= 7 },
                { days: 14, title: '90s Hall of Fame', icon: '👑', unlocked: status.currentStreak >= 14 || status.bestStreak >= 14 },
              ].map((badge) => (
                <div
                  key={badge.days}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2.5 ${
                    badge.unlocked
                      ? 'bg-[#FFF9DB] border-black shadow-neo-sm font-black text-black'
                      : 'bg-[#F7F2E8] border-stone-300 text-stone-400 opacity-60'
                  }`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <div className="font-black text-xs leading-tight">{badge.title}</div>
                    <div className="text-[10px] font-bold">
                      {badge.days} {badge.days === 1 ? 'Day' : 'Days'} {badge.unlocked ? '✓ Unlocked' : 'Locked'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Global Leaderboard (7 cols on LG) */}
        <div className="lg:col-span-7">
          <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo-lg">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00D2FF]" />
                <h2 className="font-black text-lg text-black">
                  Today's Global Leaderboard
                </h2>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#F7F2E8] border border-black text-black">
                {todayStr}
              </span>
            </div>

            <p className="text-xs font-bold text-black/75 mb-4">
              Live standings for today's specific 5-question set. Scores are ranked by Total Points, Accuracy, and Speed.
            </p>

            {/* Leaderboard Table / Rows */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {leaderboard.map((entry, idx) => {
                const isUser = entry.isCurrentUser;
                return (
                  <div
                    key={entry.id || idx}
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 border-black flex items-center justify-between gap-3 transition-all ${
                      isUser
                        ? 'bg-[#FFE600] border-3 border-black shadow-neo-lg scale-[1.01]'
                        : idx === 0
                        ? 'bg-[#FFF9DB] shadow-neo font-bold'
                        : 'bg-[#F7F2E8] shadow-neo-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number */}
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center border-2 border-black shadow-neo-sm shrink-0 ${
                          idx === 0
                            ? 'bg-black text-[#FFE600]'
                            : idx === 1
                            ? 'bg-stone-300 text-black'
                            : idx === 2
                            ? 'bg-[#FF8A00] text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      {/* Avatar & Flag */}
                      <div className="flex items-center gap-1 text-lg sm:text-xl shrink-0">
                        <span>{entry.avatar || '🕶️'}</span>
                        {entry.countryFlag && <span className="text-xs">{entry.countryFlag}</span>}
                      </div>

                      {/* Name & Title */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-sm text-black truncate max-w-[130px] sm:max-w-[180px]">
                            {entry.playerName}
                          </span>
                          {isUser && (
                            <span className="px-1.5 py-0.2 rounded bg-black text-white text-[9px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-black/70 font-semibold block truncate">
                          {entry.rankTitle}
                        </span>
                      </div>
                    </div>

                    {/* Score & Accuracy */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-sm sm:text-base text-black">
                        {entry.score.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-black/70">
                        {entry.accuracy}% • {entry.timeSpentSeconds}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
