import React, { useState, useEffect } from 'react';
import {
  Trophy,
  BookOpen,
  X,
  Trash2,
  Flame,
  Award,
  Disc,
  Sparkles,
  Zap,
  Filter,
  Search,
  Calendar,
  Globe,
  Clock,
  Medal,
  Lock,
  CheckCircle2,
  XCircle,
  History as HistoryIcon,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  BarChart2,
  Users,
} from 'lucide-react';
import {
  getHighScores,
  getBookmarkedFacts,
  toggleBookmarkFact,
  clearHighScores,
  getQuizHistory,
  clearQuizHistory,
} from '../utils/storage';
import {
  getTodayDateString,
  getDailyChallengeStatus,
  getDailyGlobalLeaderboard,
  getTimeUntilNextDaily,
} from '../utils/dailyChallenge';
import { getAllBadgesWithStatus, resetBadges } from '../utils/badgeSystem';
import {
  HighScoreEntry,
  GameMode,
  DailyChallengeEntry,
  DailyChallengeStatus,
  Badge,
  BadgeCategory,
  QuizResult,
} from '../types';
import { soundEffects } from '../utils/audio';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'leaderboard' | 'daily' | 'history' | 'badges' | 'bookmarks';
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'leaderboard',
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'daily' | 'history' | 'badges' | 'bookmarks'>(initialTab);
  const [modeFilter, setModeFilter] = useState<'all' | GameMode>('all');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | BadgeCategory>('all');
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyChallengeEntry[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyChallengeStatus>(getDailyChallengeStatus());
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [bookmarks, setBookmarks] = useState<
    Array<{ id: string; question: string; explanation: string; bandOrArtist?: string }>
  >([]);

  const todayStr = getTodayDateString();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setHighScores(getHighScores());
      setQuizHistory(getQuizHistory());
      setBookmarks(getBookmarkedFacts());
      setDailyLeaderboard(getDailyGlobalLeaderboard(todayStr));
      setDailyStatus(getDailyChallengeStatus());
      setBadges(getAllBadgesWithStatus());

      const updateTimer = () => {
        const { formatted } = getTimeUntilNextDaily();
        setTimeRemaining(formatted);
      };
      updateTimer();
    }
  }, [isOpen, initialTab, todayStr]);

  if (!isOpen) return null;

  const handleRemoveBookmark = (factId: string) => {
    soundEffects.playClick();
    toggleBookmarkFact({ id: factId, question: '', explanation: '' });
    setBookmarks(getBookmarkedFacts());
    setBadges(getAllBadgesWithStatus());
  };

  const handleClearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear your local high scores leaderboard?')) {
      soundEffects.playClick();
      clearHighScores();
      setHighScores([]);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your past quiz session history?')) {
      soundEffects.playClick();
      clearQuizHistory();
      setQuizHistory([]);
      setExpandedSessionId(null);
    }
  };

  const toggleExpandSession = (sessionId: string) => {
    soundEffects.playClick();
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  const filteredScores = highScores.filter((entry) => {
    const matchesMode = modeFilter === 'all' || entry.mode === modeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      entry.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.rankTitle && entry.rankTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.category && entry.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMode && matchesSearch;
  });

  const unlockedBadgesCount = badges.filter((b) => Boolean(b.unlockedAt)).length;

  const filteredBadges = badges.filter((b) => {
    const matchesCat = badgeCategoryFilter === 'all' || b.category === badgeCategoryFilter;
    const isUnlocked = Boolean(b.unlockedAt);
    const matchesStatus =
      badgeStatusFilter === 'all' ||
      (badgeStatusFilter === 'unlocked' && isUnlocked) ||
      (badgeStatusFilter === 'locked' && !isUnlocked);
    return matchesCat && matchesStatus;
  });

  // Last 10 completed quiz sessions
  const last10Sessions = quizHistory.slice(0, 10);

  // Summary stats for last 10 sessions
  const avgScoreLast10 =
    last10Sessions.length > 0
      ? Math.round(last10Sessions.reduce((acc, curr) => acc + curr.score, 0) / last10Sessions.length)
      : 0;
  const avgAccLast10 =
    last10Sessions.length > 0
      ? Math.round(last10Sessions.reduce((acc, curr) => acc + curr.accuracy, 0) / last10Sessions.length)
      : 0;
  const bestStreakLast10 =
    last10Sessions.length > 0
      ? Math.max(...last10Sessions.map((s) => s.highestStreak || 0))
      : 0;

  const formatSessionDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border-3 sm:border-4 border-black rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-neo-xl overflow-hidden text-black">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-black flex items-center justify-between bg-[#F7F2E8]">
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('leaderboard');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-[#FFE600] text-black border-2 border-black shadow-neo-sm'
                  : 'bg-white hover:bg-stone-100 text-black border-2 border-black/20'
              }`}
            >
              <Trophy className="w-4 h-4 text-black" />
              All-Time Records ({highScores.length})
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('daily');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-[#FF4B4B] text-white border-2 border-black shadow-neo-sm'
                  : 'bg-white hover:bg-stone-100 text-black border-2 border-black/20'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Daily Global Board
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('history');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#10B981] text-white border-2 border-black shadow-neo-sm'
                  : 'bg-white hover:bg-stone-100 text-black border-2 border-black/20'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              History ({last10Sessions.length > 0 ? `${last10Sessions.length}` : '0'})
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('badges');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer relative ${
                activeTab === 'badges'
                  ? 'bg-[#A855F7] text-white border-2 border-black shadow-neo-sm'
                  : 'bg-white hover:bg-stone-100 text-black border-2 border-black/20'
              }`}
            >
              <Medal className="w-4 h-4" />
              Badges ({unlockedBadgesCount}/{badges.length})
              {unlockedBadgesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FFE600] text-black text-[10px] font-black border border-black">
                  {Math.round((unlockedBadgesCount / Math.max(1, badges.length)) * 100)}%
                </span>
              )}
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('bookmarks');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-[#00D2FF] text-black border-2 border-black shadow-neo-sm'
                  : 'bg-white hover:bg-stone-100 text-black border-2 border-black/20'
              }`}
            >
              <BookOpen className="w-4 h-4 text-black" />
              Fact Vault ({bookmarks.length})
            </button>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white hover:bg-[#FF4B4B] hover:text-white text-black border-2 border-black shadow-neo-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'leaderboard' ? (
            <div>
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
                <div className="flex items-center flex-wrap gap-1.5 text-xs font-black">
                  {[
                    { id: 'all', label: 'All Modes' },
                    { id: 'solo', label: 'Solo Master' },
                    { id: 'speed_round', label: 'Speed Blitz ⚡' },
                    { id: 'genre_spotlight', label: 'Genre Spotlight 🎸' },
                    { id: 'daily_challenge', label: 'Daily Quest 📅' },
                    { id: 'multiplayer', label: 'Couch Battle 👥' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setModeFilter(f.id as any);
                      }}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        modeFilter === f.id
                          ? 'bg-black text-white border-black shadow-neo-sm'
                          : 'bg-[#F7F2E8] text-black hover:bg-stone-200 border-black/30'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                    <input
                      type="text"
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F7F2E8] border border-black text-xs font-black text-black focus:outline-none focus:bg-white"
                    />
                  </div>

                  {highScores.length > 0 && (
                    <button
                      onClick={handleClearLeaderboard}
                      className="text-xs text-[#FF4B4B] hover:text-red-700 font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {filteredScores.length === 0 ? (
                <div className="text-center py-12 bg-[#F7F2E8] rounded-2xl border-2 border-black">
                  <Disc className="w-12 h-12 text-stone-400 mx-auto mb-2 animate-spin [animation-duration:12s]" />
                  <p className="text-sm font-black text-black">No scores found for this filter</p>
                  <p className="text-xs text-black/70 font-semibold mt-1">
                    Play a quiz round to record your high score!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredScores.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-neo flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center border-2 border-black shadow-neo-sm ${
                            idx === 0
                              ? 'bg-[#FFE600] text-black'
                              : idx === 1
                              ? 'bg-stone-200 text-black'
                              : idx === 2
                              ? 'bg-[#FF8A00] text-white'
                              : 'bg-[#F7F2E8] text-black'
                          }`}
                        >
                          #{idx + 1}
                        </span>

                        <span className="text-2xl">{entry.avatar || '🕶️'}</span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-black">{entry.playerName}</h4>
                            {entry.mode === 'speed_round' && (
                              <span className="px-1.5 py-0.5 rounded bg-[#00D2FF] text-black text-[10px] font-black border border-black">
                                Speed Blitz
                              </span>
                            )}
                            {entry.mode === 'genre_spotlight' && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FFE600] text-black text-[10px] font-black border border-black">
                                Genre Spotlight
                              </span>
                            )}
                            {entry.mode === 'daily_challenge' && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FF4B4B] text-white text-[10px] font-black border border-black">
                                Daily Quest
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#FF4B4B] font-black block">
                            {entry.rankTitle}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-black">
                          {entry.score.toLocaleString()} pts
                        </div>
                        <div className="text-[11px] text-black/70 font-semibold">
                          {entry.accuracy}% ({entry.totalQuestions} Qs)
                          {entry.highestStreak ? ` • ${entry.highestStreak}x Streak` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'daily' ? (
            /* Daily Global Leaderboard Tab */
            <div className="space-y-4">
              {/* Daily Streak & Overview Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FFE600] border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-black mb-0.5">
                    <Flame className="w-4 h-4 text-[#FF4B4B] fill-[#FF4B4B]" />
                    Current Daily Streak
                  </div>
                  <div className="text-2xl font-black text-black">
                    {dailyStatus.currentStreak} {dailyStatus.currentStreak === 1 ? 'Day' : 'Days'}
                  </div>
                  <div className="text-[10px] font-bold text-black/70">
                    Best: {dailyStatus.bestStreak} days
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#00D2FF] border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-black mb-0.5">
                    <Calendar className="w-4 h-4 text-black" />
                    Today's Date
                  </div>
                  <div className="text-xl font-black text-black truncate">
                    {todayStr}
                  </div>
                  <div className="text-[10px] font-bold text-black/70">
                    {dailyStatus.todayCompleted ? '✓ Completed Today' : 'Pending Today\'s Quest'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F2E8] border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-black mb-0.5">
                    <Clock className="w-4 h-4 text-[#FF4B4B]" />
                    Next Reset
                  </div>
                  <div className="text-2xl font-black text-black font-mono">
                    {timeRemaining || 'Midnight'}
                  </div>
                  <div className="text-[10px] font-bold text-black/70">
                    5 New Questions Daily
                  </div>
                </div>
              </div>

              {/* Today's Global Standings */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-black text-sm text-black flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#6366F1]" />
                    Today's 5-Question Global Leaderboard ({todayStr})
                  </h3>
                  <span className="text-[11px] font-black text-black/70">
                    {dailyLeaderboard.length} Global Contenders
                  </span>
                </div>

                <div className="space-y-2">
                  {dailyLeaderboard.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className={`p-3 rounded-2xl border-2 border-black flex items-center justify-between gap-3 ${
                        entry.isCurrentUser
                          ? 'bg-[#FFE600] border-3 border-black shadow-neo-sm scale-[1.01]'
                          : 'bg-white shadow-neo-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center border border-black ${
                            idx === 0
                              ? 'bg-black text-[#FFE600]'
                              : idx === 1
                              ? 'bg-stone-200 text-black'
                              : idx === 2
                              ? 'bg-[#FF8A00] text-white'
                              : 'bg-[#F7F2E8] text-black'
                          }`}
                        >
                          #{idx + 1}
                        </span>

                        <span className="text-xl">{entry.avatar || '🕶️'}</span>
                        {entry.countryFlag && <span className="text-xs">{entry.countryFlag}</span>}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-black">{entry.playerName}</span>
                            {entry.isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded bg-black text-white text-[9px] font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-black/70 font-bold block">
                            {entry.rankTitle}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-black block">
                          {entry.score.toLocaleString()} pts
                        </span>
                        <span className="text-[10px] text-black/70 font-semibold">
                          {entry.accuracy}% • {entry.timeSpentSeconds}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past Daily Quest History */}
              {dailyStatus.history.length > 0 && (
                <div className="pt-4 border-t-2 border-black/10">
                  <h4 className="text-xs font-black uppercase text-black mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#FF4B4B]" />
                    Your Past Daily Quest History
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dailyStatus.history.map((hist, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#F7F2E8] border border-black text-xs flex justify-between items-center">
                        <div>
                          <span className="font-black text-black block">{hist.dateStr}</span>
                          <span className="text-[10px] text-black/70 font-bold">{hist.rankTitle}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-black">{hist.score.toLocaleString()} pts</span>
                          <span className="text-[10px] text-black/70 block">{hist.accuracy}% Acc</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            /* History Tab - Last 10 Quiz Sessions */
            <div className="space-y-4">
              {/* Overview Metrics Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#10B981] text-white border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-white/90 mb-0.5">
                    <HistoryIcon className="w-4 h-4 text-[#FFE600]" />
                    Total Sessions
                  </div>
                  <div className="text-2xl font-black text-white">
                    {last10Sessions.length} <span className="text-xs font-bold text-white/80">/ {quizHistory.length} all-time</span>
                  </div>
                  <div className="text-[10px] font-bold text-white/90">
                    Showing last 10 completed
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFE600] border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-black mb-0.5">
                    <BarChart2 className="w-4 h-4 text-black" />
                    Average Score
                  </div>
                  <div className="text-2xl font-black text-black">
                    {avgScoreLast10.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-black/70">
                    Points per session
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#00D2FF] border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-black mb-0.5">
                    <Target className="w-4 h-4 text-black" />
                    Average Accuracy
                  </div>
                  <div className="text-2xl font-black text-black">
                    {avgAccLast10}%
                  </div>
                  <div className="text-[10px] font-bold text-black/70">
                    Across last 10 sessions
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FF4B4B] text-white border-2 border-black shadow-neo-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-white/90 mb-0.5">
                    <Flame className="w-4 h-4 text-[#FFE600] fill-[#FFE600]" />
                    Best Streak
                  </div>
                  <div className="text-2xl font-black text-white">
                    {bestStreakLast10}x
                  </div>
                  <div className="text-[10px] font-bold text-white/90">
                    Consecutive correct
                  </div>
                </div>
              </div>

              {/* Subheader and Clear button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div>
                  <h3 className="font-black text-sm text-black flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    Recent Sessions Breakdown
                  </h3>
                  <p className="text-xs text-black/70 font-semibold">
                    Detailed summary of your last 10 quiz playthroughs and answer logs
                  </p>
                </div>

                {quizHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-[#FF4B4B] hover:text-red-700 font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0 bg-[#F7F2E8] px-2.5 py-1.5 rounded-xl border border-black/30 hover:border-black"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {/* Sessions List */}
              {last10Sessions.length === 0 ? (
                <div className="text-center py-12 bg-[#F7F2E8] rounded-2xl border-2 border-black">
                  <HistoryIcon className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-black text-black">No Quiz Sessions Recorded Yet</p>
                  <p className="text-xs text-black/70 font-semibold mt-1">
                    Play a round in Solo, Speed Blitz, Genre Spotlight, or Couch Battle to start logging your session history!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {last10Sessions.map((session, idx) => {
                    const isExpanded = expandedSessionId === (session.id || `session_${idx}`);
                    const correctAnswers = session.answers
                      ? session.answers.filter((a) => a.isCorrect).length
                      : Math.round(((session.accuracy || 0) / 100) * session.totalQuestions);

                    const modeStyles =
                      session.mode === 'speed_round'
                        ? { bg: 'bg-[#00D2FF] text-black', label: 'Speed Blitz ⚡' }
                        : session.mode === 'genre_spotlight'
                        ? { bg: 'bg-[#FFE600] text-black', label: 'Genre Spotlight 🎸' }
                        : session.mode === 'daily_challenge'
                        ? { bg: 'bg-[#FF4B4B] text-white', label: 'Daily Quest 📅' }
                        : session.mode === 'multiplayer'
                        ? { bg: 'bg-[#10B981] text-white', label: 'Couch Battle 👥' }
                        : { bg: 'bg-black text-white', label: 'Solo Master 🎧' };

                    return (
                      <div
                        key={session.id || idx}
                        className="rounded-2xl bg-white border-2 sm:border-3 border-black shadow-neo overflow-hidden transition-all"
                      >
                        {/* Session Main Card Row */}
                        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
                          <div className="flex items-start sm:items-center gap-3">
                            <span
                              className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center border-2 border-black shadow-neo-sm shrink-0 ${
                                idx === 0
                                  ? 'bg-[#FFE600] text-black'
                                  : 'bg-[#F7F2E8] text-black'
                              }`}
                            >
                              #{idx + 1}
                            </span>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black border border-black shadow-xs ${modeStyles.bg}`}
                                >
                                  {modeStyles.label}
                                </span>

                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#F7F2E8] text-black border border-black/30">
                                  {session.category || 'General 90s Music'}
                                </span>

                                <span className="text-[11px] text-black/60 font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-black/40" />
                                  {formatSessionDate(session.date)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-xs text-[#FF4B4B]">
                                  {session.rankTitle || '90s Music Challenger'}
                                </span>

                                {session.answersPerMinute && (
                                  <span className="text-[10px] bg-[#00D2FF]/20 text-black px-1.5 py-0.5 rounded font-bold border border-[#00D2FF]/40">
                                    ⚡ {session.answersPerMinute} ans/min
                                  </span>
                                )}

                                {session.genreTier && (
                                  <span className="text-[10px] bg-[#FFE600]/30 text-black px-1.5 py-0.5 rounded font-bold border border-[#FFE600]/60">
                                    ⭐ Tier: {session.genreTier.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Score & Accuracy Metrics + Expand Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10">
                            <div className="text-left sm:text-right">
                              <div className="text-base font-black text-black">
                                {session.score.toLocaleString()} pts
                              </div>
                              <div className="text-[11px] text-black/70 font-semibold flex items-center sm:justify-end gap-1.5">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-black text-[10px] ${
                                    session.accuracy >= 90
                                      ? 'bg-[#10B981]/20 text-[#10B981]'
                                      : session.accuracy >= 70
                                      ? 'bg-[#FF8A00]/20 text-[#FF8A00]'
                                      : 'bg-[#FF4B4B]/20 text-[#FF4B4B]'
                                  }`}
                                >
                                  {session.accuracy}% Acc
                                </span>
                                <span>({correctAnswers}/{session.totalQuestions} Qs)</span>
                                {session.highestStreak ? (
                                  <span className="text-[#FF4B4B] font-bold">
                                    • {session.highestStreak}x Streak
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {session.answers && session.answers.length > 0 && (
                              <button
                                onClick={() => toggleExpandSession(session.id || `session_${idx}`)}
                                className={`px-2.5 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-neo-sm shrink-0 ${
                                  isExpanded
                                    ? 'bg-black text-white'
                                    : 'bg-[#F7F2E8] hover:bg-stone-200 text-black'
                                }`}
                                title="Inspect Question Answers"
                              >
                                <span>{isExpanded ? 'Hide' : 'Review'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Question-by-Question Breakdown */}
                        {isExpanded && session.answers && session.answers.length > 0 && (
                          <div className="p-4 bg-[#FAF7F0] border-t-2 border-black space-y-2.5 animate-fade-in">
                            <div className="flex items-center justify-between text-xs font-black text-black pb-1 border-b border-black/15">
                              <span className="flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-black" />
                                Question & Answer Breakdown ({session.answers.length} Questions)
                              </span>
                              <span className="text-[11px] text-black/70">
                                {correctAnswers} Correct • {session.answers.length - correctAnswers} Missed
                              </span>
                            </div>

                            <div className="space-y-2">
                              {session.answers.map((ans, qIdx) => (
                                <div
                                  key={ans.questionId || qIdx}
                                  className={`p-3 rounded-xl border-2 border-black text-xs ${
                                    ans.isCorrect
                                      ? 'bg-white shadow-xs'
                                      : 'bg-[#FFF1F2] shadow-xs'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-start gap-2">
                                      <span
                                        className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center border border-black shrink-0 ${
                                          ans.isCorrect
                                            ? 'bg-[#10B981] text-white'
                                            : 'bg-[#FF4B4B] text-white'
                                        }`}
                                      >
                                        Q{qIdx + 1}
                                      </span>
                                      <span className="font-bold text-black leading-snug">
                                        {ans.questionText}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      {ans.isCorrect ? (
                                        <span className="flex items-center gap-1 text-[#10B981] font-black text-[11px]">
                                          <CheckCircle2 className="w-4 h-4" />
                                          +{ans.scoreEarned || 100} pts
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-[#FF4B4B] font-black text-[11px]">
                                          <XCircle className="w-4 h-4" />
                                          Missed
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/10 text-[11px]">
                                    <div>
                                      <span className="text-black/60 font-bold block text-[10px] uppercase">
                                        Your Choice:
                                      </span>
                                      <span
                                        className={`font-black ${
                                          ans.isCorrect ? 'text-[#10B981]' : 'text-[#FF4B4B]'
                                        }`}
                                      >
                                        {ans.selectedOption || '(No response)'}
                                      </span>
                                    </div>

                                    {!ans.isCorrect && (
                                      <div>
                                        <span className="text-black/60 font-bold block text-[10px] uppercase">
                                          Correct Answer:
                                        </span>
                                        <span className="font-black text-[#10B981]">
                                          {ans.correctOption}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {ans.explanation && (
                                    <div className="mt-2 p-2 rounded-lg bg-black/5 text-[11px] text-black/80 font-medium leading-relaxed">
                                      💡 <span className="font-bold">Factoid:</span> {ans.explanation}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'badges' ? (
            /* Badges & Achievements Tab */
            <div className="space-y-4">
              {/* Top Achievement Progress Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#A855F7] text-white border-3 border-black shadow-neo">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center text-2xl shadow-neo-sm">
                      🏅
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-white">
                        90s Badge Vault & Achievements
                      </h3>
                      <p className="text-xs text-white/90 font-bold">
                        Unlock legendary titles across high accuracy, blitz speeds, streaks, and game modes!
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-black text-[#FFE600] border-2 border-white/20 text-right shrink-0">
                    <span className="text-lg font-black block">
                      {unlockedBadgesCount} / {badges.length}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-wider text-white/80">
                      Badges Unlocked
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-black/40 h-4 rounded-xl overflow-hidden border-2 border-black/30">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFE600] to-[#00D2FF] transition-all duration-500 animate-stripes"
                    style={{
                      width: `${Math.round((unlockedBadgesCount / Math.max(1, badges.length)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Category filters */}
                <div className="flex items-center flex-wrap gap-1.5 text-xs font-black">
                  {[
                    { id: 'all', label: 'All Badges' },
                    { id: 'accuracy', label: '🎯 Accuracy' },
                    { id: 'speed', label: '⚡ Speed' },
                    { id: 'streak', label: '🔥 Streaks' },
                    { id: 'modes', label: '🎮 Game Modes' },
                    { id: 'lore', label: '📚 Lore Vault' },
                    { id: 'special', label: '✨ Special' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setBadgeCategoryFilter(cat.id as any);
                      }}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        badgeCategoryFilter === cat.id
                          ? 'bg-black text-white border-black shadow-neo-sm'
                          : 'bg-[#F7F2E8] text-black hover:bg-stone-200 border-black/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Status Toggle (All / Unlocked / Locked) */}
                <div className="flex items-center gap-1 bg-[#F7F2E8] p-1 rounded-xl border border-black text-xs font-black self-start sm:self-auto">
                  {(['all', 'unlocked', 'locked'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        soundEffects.playClick();
                        setBadgeStatusFilter(st);
                      }}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        badgeStatusFilter === st
                          ? 'bg-white text-black border border-black shadow-neo-sm'
                          : 'text-black/70 hover:text-black'
                      }`}
                    >
                      {st === 'all' ? 'Show All' : st === 'unlocked' ? '✓ Unlocked' : '🔒 Locked'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredBadges.map((badge) => {
                  const isUnlocked = Boolean(badge.unlockedAt);
                  const rarityStyles =
                    badge.rarity === 'diamond'
                      ? {
                          border: 'border-[#00D2FF]',
                          bg: isUnlocked ? 'bg-[#ECFEFF]' : 'bg-[#F8FAFC]',
                          pill: 'bg-[#00D2FF] text-black',
                          label: '💎 Diamond',
                        }
                      : badge.rarity === 'gold'
                      ? {
                          border: 'border-[#FFE600]',
                          bg: isUnlocked ? 'bg-[#FEFCE8]' : 'bg-[#F8FAFC]',
                          pill: 'bg-[#FFE600] text-black',
                          label: '👑 Gold',
                        }
                      : badge.rarity === 'silver'
                      ? {
                          border: 'border-stone-400',
                          bg: isUnlocked ? 'bg-[#F1F5F9]' : 'bg-[#F8FAFC]',
                          pill: 'bg-stone-200 text-black',
                          label: '🥈 Silver',
                        }
                      : {
                          border: 'border-[#FF8A00]',
                          bg: isUnlocked ? 'bg-[#FFF7ED]' : 'bg-[#F8FAFC]',
                          pill: 'bg-[#FF8A00] text-white',
                          label: '🥉 Bronze',
                        };

                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-3xl border-2 sm:border-3 border-black shadow-neo flex flex-col justify-between transition-all ${
                        isUnlocked
                          ? `${rarityStyles.bg} scale-[1.0] ring-2 ring-black/5`
                          : 'bg-stone-100/90 opacity-80'
                      }`}
                    >
                      <div>
                        {/* Card Header: Icon + Rarity & Category Pills */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center text-2xl shadow-neo-sm ${
                                isUnlocked ? 'bg-white' : 'bg-stone-200 grayscale'
                              }`}
                            >
                              {badge.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-black text-sm text-black">{badge.title}</h4>
                                {isUnlocked && (
                                  <span className="text-[#10B981] text-xs font-black flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 fill-[#10B981] text-white" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-black/70 block">
                                {badge.subtitle}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border border-black shadow-xs ${rarityStyles.pill}`}
                            >
                              {rarityStyles.label}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-black/85 font-semibold mb-3 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>

                      {/* Footer: Unlock Status or Progress Tracker */}
                      <div className="pt-2.5 border-t border-black/15">
                        {isUnlocked ? (
                          <div className="flex items-center justify-between text-[11px] font-black text-[#10B981]">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              UNLOCKED
                            </span>
                            <span className="text-black/60 font-semibold text-[10px]">
                              {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Achieved'}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-black/70 font-black">
                              <span className="flex items-center gap-1 text-black/80">
                                <Lock className="w-3 h-3 text-stone-500" />
                                {badge.hint}
                              </span>
                              {badge.maxProgress && badge.maxProgress > 1 && (
                                <span className="font-mono text-[10px] text-black">
                                  {badge.progress || 0} / {badge.maxProgress}
                                </span>
                              )}
                            </div>

                            {/* Mini Progress Bar for in-progress achievements */}
                            {badge.maxProgress && badge.maxProgress > 1 && (
                              <div className="w-full bg-stone-300 h-2 rounded-full overflow-hidden border border-black/30">
                                <div
                                  className="h-full bg-[#A855F7] transition-all"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(((badge.progress || 0) / badge.maxProgress) * 100)
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Bookmarks Tab */
            <div>
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 bg-[#F7F2E8] rounded-2xl border-2 border-black">
                  <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-black text-black">No 90s factoids saved yet</p>
                  <p className="text-xs text-black/70 font-semibold mt-1">
                    Click "Save Fact" after answering any quiz question to build your knowledge vault!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((fact) => (
                    <div
                      key={fact.id}
                      className="p-4 rounded-2xl bg-[#FFF9DB] border-2 border-black shadow-neo relative"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-black" />
                          <span className="text-xs font-black text-black uppercase tracking-wider">
                            {fact.bandOrArtist || '90s Music Lore'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveBookmark(fact.id)}
                          className="text-stone-400 hover:text-[#FF4B4B] p-1 transition-colors cursor-pointer"
                          title="Remove from vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-black font-bold mb-2">"{fact.question}"</p>
                      <p className="text-xs text-black/85 leading-relaxed font-semibold bg-white/70 p-2.5 rounded-xl border border-black/10">
                        {fact.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

