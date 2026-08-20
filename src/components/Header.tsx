import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Trophy, BookOpen, Sparkles, Disc3, Flame, Users, User, Bot, Zap, Calendar, Medal } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { GameMode } from '../types';
import { getDailyChallengeStatus } from '../utils/dailyChallenge';
import { getAllBadgesWithStatus } from '../utils/badgeSystem';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenStats: () => void;
  onOpenBadges?: () => void;
  onOpenBookmarks: () => void;
  isPlaying: boolean;
  onQuitQuiz?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenStats,
  onOpenBadges,
  onOpenBookmarks,
  isPlaying,
  onQuitQuiz,
}) => {
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());
  const [dailyStatus, setDailyStatus] = useState(() => getDailyChallengeStatus());
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(0);

  useEffect(() => {
    setDailyStatus(getDailyChallengeStatus());
    const all = getAllBadgesWithStatus();
    setUnlockedBadgesCount(all.filter((b) => Boolean(b.unlockedAt)).length);
  }, [currentMode, isPlaying]);

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) soundEffects.playClick();
  };

  return (
    <header className="w-full bg-[#FFE600] border-b-3 sm:border-b-4 border-black text-black sticky top-0 z-40 shadow-neo-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div
          onClick={() => {
            if (isPlaying && onQuitQuiz) {
              if (window.confirm('Do you want to exit the current quiz and return to the main menu?')) {
                onQuitQuiz();
              }
            } else {
              soundEffects.playClick();
              onSelectMode('solo');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-black border-2 border-black flex items-center justify-center shadow-neo-sm group-hover:scale-105 transition-transform">
            <Disc3 className="w-6 h-6 text-[#FFE600] animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-black">
                90s & Britpop Quiz
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#FF4B4B] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                1990 - 1999
              </span>
            </div>
            <p className="text-xs text-black/80 font-bold">The Ultimate Cool Britannia & 90s Music Trivia</p>
          </div>
        </div>

        {/* Mode Selector (When not actively inside an ongoing question session) */}
        {!isPlaying ? (
          <div className="flex items-center flex-wrap bg-white p-1 rounded-2xl border-2 border-black shadow-neo-sm text-xs font-black gap-1">
            <button
              id="nav-daily-challenge"
              onClick={() => {
                soundEffects.playClick();
                onSelectMode('daily_challenge');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer relative ${
                currentMode === 'daily_challenge'
                  ? 'bg-[#FFE600] text-black border-2 border-black shadow-neo-sm'
                  : 'text-black hover:bg-[#F7F2E8]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#FF4B4B]" />
              <span>Daily 90s Quest</span>
              {!dailyStatus.todayCompleted ? (
                <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping" />
              ) : (
                <span className="text-[10px] text-[#10B981] font-black">✓</span>
              )}
            </button>

            <button
              id="nav-solo-mode"
              onClick={() => {
                soundEffects.playClick();
                onSelectMode('solo');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentMode === 'solo'
                  ? 'bg-[#FF4B4B] text-white border-2 border-black shadow-neo-sm'
                  : 'text-black hover:bg-[#F7F2E8]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Solo Master
            </button>

            <button
              id="nav-speed-mode"
              onClick={() => {
                soundEffects.playClick();
                onSelectMode('speed_round');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentMode === 'speed_round'
                  ? 'bg-[#00D2FF] text-black border-2 border-black shadow-neo-sm'
                  : 'text-black hover:bg-[#F7F2E8]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              Speed Round
            </button>

            <button
              id="nav-genre-mode"
              onClick={() => {
                soundEffects.playClick();
                onSelectMode('genre_spotlight');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentMode === 'genre_spotlight'
                  ? 'bg-[#FF8A00] text-white border-2 border-black shadow-neo-sm'
                  : 'text-black hover:bg-[#F7F2E8]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#FFE600] fill-[#FFE600]" />
              Genre Spotlight
            </button>

            <button
              id="nav-multiplayer-mode"
              onClick={() => {
                soundEffects.playClick();
                onSelectMode('multiplayer');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentMode === 'multiplayer'
                  ? 'bg-[#6366F1] text-white border-2 border-black shadow-neo-sm'
                  : 'text-black hover:bg-[#F7F2E8]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Couch Battle (2-6)
            </button>

            <button
              id="nav-ai-mode"
              onClick={() => {
                soundEffects.playClick();
                onSelectMode('ai_custom');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentMode === 'ai_custom'
                  ? 'bg-[#10B981] text-white border-2 border-black shadow-neo-sm'
                  : 'text-black hover:bg-[#F7F2E8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Generator
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end this quiz round?')) {
                onQuitQuiz?.();
              }
            }}
            className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FF4B4B] hover:text-white text-black border-2 border-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            Quit Round
          </button>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="header-sound-btn"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-xl bg-white hover:bg-[#F7F2E8] text-black border-2 border-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-black" />}
          </button>

          <button
            id="header-badges-btn"
            onClick={() => {
              soundEffects.playClick();
              if (onOpenBadges) {
                onOpenBadges();
              } else {
                onOpenStats();
              }
            }}
            title="Achievements & Badges"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A855F7] hover:bg-[#9333ea] text-white text-xs font-black border-2 border-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer relative"
          >
            <Medal className="w-4 h-4 text-[#FFE600]" />
            <span className="hidden sm:inline">Badges</span>
            {unlockedBadgesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#FFE600] text-black text-[10px] font-black border border-black shadow-xs">
                {unlockedBadgesCount}
              </span>
            )}
          </button>

          <button
            id="header-bookmarks-btn"
            onClick={() => {
              soundEffects.playClick();
              onOpenBookmarks();
            }}
            title="Saved 90s Factoids"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#E0F2FE] text-black text-xs font-black border-2 border-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Fact Vault</span>
          </button>

          <button
            id="header-highscores-btn"
            onClick={() => {
              soundEffects.playClick();
              onOpenStats();
            }}
            title="Leaderboard & Records"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF4B4B] hover:bg-[#ff3333] text-white text-xs font-black border-2 border-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        </div>
      </div>
    </header>
  );
};
