import React, { useState } from 'react';
import { Zap, Clock, Flame, Award, Trophy, Play, Info, Sparkles, ChevronRight } from 'lucide-react';
import { Difficulty } from '../types';
import { soundEffects } from '../utils/audio';
import { getHighScores } from '../utils/storage';

interface SpeedRoundSetupProps {
  onStartSpeedRound: (config: {
    durationSeconds: number;
    difficulty: Difficulty;
    playerName: string;
  }) => void;
}

export const SpeedRoundSetup: React.FC<SpeedRoundSetupProps> = ({ onStartSpeedRound }) => {
  const [duration, setDuration] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [playerName, setPlayerName] = useState<string>('Speed Demon ⚡');

  const speedHighScores = getHighScores().filter((e) => e.mode === 'speed_round');
  const bestSpeedScore = speedHighScores[0];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playStart();
    onStartSpeedRound({
      durationSeconds: duration,
      difficulty,
      playerName: playerName.trim() || 'Speed Demon ⚡',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in text-black">
      {/* Banner / Title Box */}
      <div className="bg-[#00D2FF] border-3 sm:border-4 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg relative overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider mb-2 shadow-neo-sm">
              <Zap className="w-3.5 h-3.5 fill-[#FFE600]" />
              High-Octane Blitz Mode
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-2">
              90s Speed Round Blitz
            </h1>
            <p className="text-sm sm:text-base font-bold text-black/85 max-w-xl">
              Race against the clock! Answer as many 90s music trivia questions as possible before time runs out.
              Every correct answer adds <span className="font-black underline decoration-black decoration-2">+3 seconds</span> to your timer!
            </p>
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FFE600] border-3 border-black flex flex-col items-center justify-center shrink-0 shadow-neo">
            <Clock className="w-8 h-8 text-black animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-tight text-black mt-0.5">
              {duration}s CLOCK
            </span>
          </div>
        </div>

        {/* Speed Record Card */}
        {bestSpeedScore && (
          <div className="mt-4 pt-4 border-t-2 border-black/20 flex items-center justify-between flex-wrap gap-2 text-xs font-black">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-black" />
              <span>Current Blitz Record:</span>
              <span className="bg-black text-white px-2 py-0.5 rounded-lg border border-black">
                {bestSpeedScore.playerName} — {bestSpeedScore.score.toLocaleString()} pts ({bestSpeedScore.totalQuestions} Qs)
              </span>
            </div>
            <span className="text-black/80 font-bold">Pace: {bestSpeedScore.answersPerMinute || 24} Qs/min</span>
          </div>
        )}
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        {/* Step 1: Clock Duration Selection */}
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo">
          <label className="text-base font-black text-black flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#FF4B4B]" />
            1. Select Starting Countdown Duration
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { sec: 45, label: '45 Seconds Sprint', desc: 'Furious lightning test for rapid recall' },
              { sec: 60, label: '60 Seconds Standard', desc: 'The classic Top of the Pops blitz experience' },
              { sec: 90, label: '90 Seconds Marathon', desc: 'Endurance speed challenge with massive combo potential' },
            ].map((opt) => (
              <button
                key={opt.sec}
                type="button"
                id={`speed-duration-${opt.sec}`}
                onClick={() => {
                  soundEffects.playClick();
                  setDuration(opt.sec);
                }}
                className={`p-4 rounded-2xl border-2 border-black text-left transition-all cursor-pointer ${
                  duration === opt.sec
                    ? 'bg-[#FFE600] border-3 border-black shadow-neo font-black'
                    : 'bg-[#F7F2E8] hover:bg-[#FFF9C4] text-black shadow-neo-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-base">{opt.label}</span>
                  {duration === opt.sec && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded">Selected</span>}
                </div>
                <p className="text-xs text-black/75 font-semibold">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Difficulty Filter */}
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo">
          <label className="text-base font-black text-black flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-[#FF8A00]" />
            2. Question Difficulty Filter
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'all', label: 'All Difficulties', desc: 'Mixed 90s Trivia' },
              { id: 'easy', label: 'Easy Hits', desc: 'Mainstream #1 Classics' },
              { id: 'medium', label: 'Medium Lore', desc: 'Chart Battles & Lyrics' },
              { id: 'hard', label: 'Hard Deep Cuts', desc: 'B-Sides & Expert Trivia' },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                id={`speed-diff-${diff.id}`}
                onClick={() => {
                  soundEffects.playClick();
                  setDifficulty(diff.id as Difficulty);
                }}
                className={`p-3.5 rounded-2xl border-2 border-black text-left transition-all cursor-pointer ${
                  difficulty === diff.id
                    ? 'bg-[#FF4B4B] text-white border-3 border-black shadow-neo font-black'
                    : 'bg-[#F7F2E8] hover:bg-stone-200 text-black shadow-neo-sm'
                }`}
              >
                <div className="font-black text-sm">{diff.label}</div>
                <div className={`text-[11px] font-semibold ${difficulty === diff.id ? 'text-white/90' : 'text-black/70'}`}>
                  {diff.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Player Name */}
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo">
          <label className="text-base font-black text-black flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-[#6366F1]" />
            3. Player Name / Arcade Tag
          </label>
          <input
            type="text"
            id="speed-player-name-input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={25}
            placeholder="Enter your arcade initials..."
            className="w-full sm:max-w-md px-4 py-3 rounded-2xl bg-[#F7F2E8] border-2 border-black text-black font-black text-base shadow-neo-sm focus:outline-none focus:bg-[#FFE600] transition-colors"
          />
        </div>

        {/* Rules Box */}
        <div className="bg-[#FFE600] border-2 border-black rounded-2xl p-4 shadow-neo-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-black shrink-0 mt-0.5" />
          <div className="text-xs font-bold text-black leading-relaxed">
            <span className="font-black uppercase">Speed Round Mechanics:</span> Correct answers award{' '}
            <span className="font-black">+100 to +250 points</span> plus <span className="font-black">+3 seconds</span> clock bonus.
            Wrong answers penalize <span className="font-black">-2 seconds</span> and reset your streak combo. Answer quickly to climb the blitz leaderboard!
          </div>
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          id="start-speed-round-btn"
          className="w-full py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-lg sm:text-xl border-3 border-black shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Zap className="w-6 h-6 fill-white" />
          Start Speed Blitz ({duration}s)
          <ChevronRight className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};
