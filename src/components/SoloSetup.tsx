import React, { useState } from 'react';
import { CATEGORIES_META } from '../data/questions';
import { QuizCategory, Difficulty, SoloFormat } from '../types';
import { Sparkles, Crown, Swords, Mic, Disc, Flame, Zap, Heart, ShieldAlert, Play, Clock, HeartPulse, Trophy } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface SoloSetupProps {
  onStartQuiz: (options: {
    category: QuizCategory;
    difficulty: Difficulty;
    format: SoloFormat;
    isTimed: boolean;
    playerName: string;
  }) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  Crown: <Crown className="w-5 h-5 text-yellow-600" />,
  Swords: <Swords className="w-5 h-5 text-rose-500" />,
  Mic: <Mic className="w-5 h-5 text-emerald-600" />,
  Disc: <Disc className="w-5 h-5 text-sky-500" />,
  Flame: <Flame className="w-5 h-5 text-orange-500" />,
  Zap: <Zap className="w-5 h-5 text-purple-600" />,
  Heart: <Heart className="w-5 h-5 text-pink-500" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-teal-600" />,
};

export const SoloSetup: React.FC<SoloSetupProps> = ({ onStartQuiz }) => {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [format, setFormat] = useState<SoloFormat>('quick');
  const [isTimed, setIsTimed] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('britpop_player_name') || 'Britpop Queen';
  });

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();
    localStorage.setItem('britpop_player_name', playerName.trim() || 'Player 1');
    onStartQuiz({
      category: selectedCategory,
      difficulty,
      format,
      isTimed,
      playerName: playerName.trim() || 'Player 1',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-3 border-black p-6 sm:p-8 mb-8 shadow-neo-lg text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE600] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-3 shadow-neo-sm">
          <Crown className="w-3.5 h-3.5 text-black" />
          Single-Player Mastermind Mode
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight mb-3">
          How Well Do You Know <span className="underline decoration-[#FF4B4B] decoration-wavy decoration-2">90s & Britpop</span>?
        </h1>
        <p className="text-black/80 font-bold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Test your memory on Oasis vs Blur chart battles, iconic lyrics, Knebworth lore, grunge legends, rave anthems, and B-side classics.
        </p>

        {/* Player Name Input */}
        <div className="mt-6 max-w-sm mx-auto flex items-center gap-2 bg-[#F7F2E8] p-2 rounded-2xl border-2 border-black shadow-neo-sm">
          <span className="text-xs font-black text-black pl-2">Your Name:</span>
          <input
            id="solo-player-name-input"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="flex-1 bg-white border-2 border-black rounded-xl px-3 py-1 text-sm font-black text-black focus:outline-none placeholder-stone-400"
          />
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        {/* Category Picker */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <Disc className="w-5 h-5 text-[#FF4B4B]" />
              1. Choose a Category
            </h2>
            <span className="text-xs font-black text-black/70 bg-white border-2 border-black px-2.5 py-0.5 rounded-full shadow-neo-sm">
              9 Specialized Channels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CATEGORIES_META.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-select-${cat.id}`}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id as QuizCategory);
                  }}
                  className={`p-4 rounded-2xl text-left border-2 border-black transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE600] border-3 border-black shadow-neo-lg scale-[1.02] text-black font-black'
                      : 'bg-white hover:bg-[#FFF9DB] shadow-neo text-black font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-white border-2 border-black shadow-neo-sm">
                      {ICONS_MAP[cat.icon] || <Sparkles className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-black">{cat.label}</h3>
                      <p className="text-xs text-black/75 font-semibold line-clamp-1">{cat.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Format & Length */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              2. Round Format
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'quick', label: 'Quick Spin', questions: '10 Questions', desc: 'Fast & fun 3-minute quiz' },
              { id: 'standard', label: 'Festival Set', questions: '20 Questions', desc: 'The classic quiz length' },
              { id: 'marathon', label: 'Indie Marathon', questions: '35 Questions', desc: 'For dedicated super-fans' },
              { id: 'survival', label: 'Sudden Death', questions: '3 Lives Survival', desc: 'Game ends on 3 mistakes' },
            ].map((fmt) => {
              const isSelected = format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  id={`format-select-${fmt.id}`}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setFormat(fmt.id as SoloFormat);
                  }}
                  className={`p-4 rounded-2xl text-left border-2 border-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF4B4B] text-white border-3 border-black shadow-neo-lg scale-[1.02]'
                      : 'bg-white hover:bg-[#FFF9DB] text-black shadow-neo'
                  }`}
                >
                  <div className="font-black text-sm">{fmt.label}</div>
                  <div className={`text-xs font-black mt-0.5 ${isSelected ? 'text-[#FFE600]' : 'text-rose-600'}`}>
                    {fmt.questions}
                  </div>
                  <div className={`text-[11px] font-semibold mt-1 ${isSelected ? 'text-white/90' : 'text-black/70'}`}>
                    {fmt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Options (Difficulty & Timer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-3xl border-3 border-black shadow-neo">
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Difficulty Filter
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-[#F7F2E8] p-1.5 rounded-xl border-2 border-black">
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'easy', label: 'Casual' },
                { id: 'medium', label: 'Fan' },
                { id: 'hard', label: 'Expert' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setDifficulty(diff.id as Difficulty);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                    difficulty === diff.id
                      ? 'bg-black text-white border-2 border-black shadow-neo-sm'
                      : 'text-black hover:bg-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Run Timer */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Timer Mode
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F2E8] border-2 border-black">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isTimed ? 'text-[#FF4B4B]' : 'text-black/60'}`} />
                <div>
                  <span className="text-xs font-black text-black">20-Second Question Timer</span>
                  <p className="text-[11px] font-semibold text-black/70">Earn speed multipliers for quick answers</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-timer-btn"
                onClick={() => {
                  soundEffects.playClick();
                  setIsTimed(!isTimed);
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 border-black transition-colors cursor-pointer ${
                  isTimed ? 'bg-[#4ADE80]' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white border-2 border-black transition-transform ${
                    isTimed ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            id="start-solo-quiz-btn"
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-[#FF4B4B] hover:bg-[#ff3333] text-white font-black text-lg sm:text-xl tracking-wide border-3 border-black shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-neo-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            Start The 90s Quiz
          </button>
        </div>
      </form>
    </div>
  );
};
