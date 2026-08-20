import React, { useState, useEffect, useRef } from 'react';
import { Clock, Zap, Flame, Sparkles, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Question, PlayerAnswerRecord, ScoreBreakdown } from '../types';
import { soundEffects } from '../utils/audio';
import { calculateQuestionScore } from '../utils/scoring';

interface SpeedRoundCardProps {
  questions: Question[];
  durationSeconds: number;
  onFinishSpeedRound: (answers: PlayerAnswerRecord[], finalScore: number, highestStreak: number, timeRemaining: number) => void;
  onQuit: () => void;
}

export const SpeedRoundCard: React.FC<SpeedRoundCardProps> = ({
  questions,
  durationSeconds,
  onFinishSpeedRound,
  onQuit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswerRecord[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeFloatingText, setTimeFloatingText] = useState<{ text: string; id: number; color: string } | null>(null);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIdx % questions.length];

  // Global Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When time runs out, finish round
  useEffect(() => {
    if (timeLeft <= 0) {
      soundEffects.playIncorrect();
      onFinishSpeedRound(answers, score, highestStreak, 0);
    }
  }, [timeLeft, answers, score, highestStreak, onFinishSpeedRound]);

  // Handle click on option
  const handleSelectOption = (idx: number) => {
    if (isAnsweringLocked || timeLeft <= 0) return;
    setIsAnsweringLocked(true);
    setSelectedIdx(idx);

    const now = Date.now();
    const timeSpentMs = now - questionStartTimeRef.current;
    const isCorrect = idx === currentQ.correctIndex;

    const { breakdown, nextStreak } = calculateQuestionScore({
      isCorrect,
      difficulty: currentQ.difficulty,
      timeSpentMs,
      currentStreak: streak,
      isTimed: true,
      isSpeedRound: true,
    });

    const record: PlayerAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      selectedOption: currentQ.options[idx],
      correctOption: currentQ.options[currentQ.correctIndex],
      isCorrect,
      explanation: currentQ.explanation,
      category: currentQ.category,
      timeSpentMs,
      scoreEarned: breakdown.totalPoints,
      scoreBreakdown: breakdown,
    };

    const newAnswers = [...answers, record];
    setAnswers(newAnswers);

    if (isCorrect) {
      soundEffects.playCorrect();
      const newScore = score + breakdown.totalPoints;
      setScore(newScore);
      setStreak(nextStreak);
      setHighestStreak((prev) => Math.max(prev, nextStreak));

      // Add time bonus (+3s standard, +5s if streak is multiple of 5)
      const bonusSeconds = nextStreak % 5 === 0 && nextStreak > 0 ? 5 : 3;
      setTimeLeft((prev) => prev + bonusSeconds);
      setTimeFloatingText({
        text: `+${bonusSeconds}s! (+${breakdown.totalPoints} pts)`,
        id: Date.now(),
        color: '#10B981',
      });
    } else {
      soundEffects.playIncorrect();
      setStreak(0);
      // Penalize time on wrong answer
      setTimeLeft((prev) => Math.max(1, prev - 2));
      setTimeFloatingText({
        text: '-2s (Streak Lost)',
        id: Date.now(),
        color: '#FF4B4B',
      });
    }

    // Fast-paced auto-advance after 380ms
    setTimeout(() => {
      setSelectedIdx(null);
      setIsAnsweringLocked(false);
      questionStartTimeRef.current = Date.now();
      setCurrentIdx((prev) => prev + 1);
    }, 380);
  };

  const timerColor =
    timeLeft > 20
      ? 'bg-[#10B981] text-white'
      : timeLeft > 10
      ? 'bg-[#FFE600] text-black'
      : 'bg-[#FF4B4B] text-white animate-pulse';

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4 text-black animate-fade-in">
      {/* Top HUD: Speed Gauge & Stats */}
      <div className="bg-white border-3 sm:border-4 border-black rounded-3xl p-4 sm:p-5 shadow-neo-lg mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Master Countdown Clock */}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-2xl border-2 border-black font-black text-xl sm:text-2xl flex items-center gap-2 shadow-neo-sm ${timerColor}`}>
              <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'animate-spin [animation-duration:2s]' : ''}`} />
              <span>{timeLeft}s</span>
            </div>
            {timeFloatingText && (
              <span
                key={timeFloatingText.id}
                className="text-xs font-black px-2.5 py-1 rounded-xl bg-black text-white border-2 border-black animate-bounce shadow-neo-sm"
                style={{ color: timeFloatingText.color }}
              >
                {timeFloatingText.text}
              </span>
            )}
          </div>

          {/* Score & Streak */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-[#FFE600] border-2 border-black px-3.5 py-1.5 rounded-2xl shadow-neo-sm text-right">
              <span className="text-[10px] font-black uppercase text-black/70 block">Blitz Score</span>
              <span className="text-lg sm:text-xl font-black text-black">{score.toLocaleString()}</span>
            </div>

            {streak >= 2 && (
              <div className="bg-[#FF4B4B] text-white border-2 border-black px-3 py-1.5 rounded-2xl shadow-neo-sm flex items-center gap-1 animate-pulse">
                <Flame className="w-4 h-4 fill-white" />
                <span className="text-sm font-black">{streak}x Streak</span>
              </div>
            )}

            <div className="bg-[#F7F2E8] border-2 border-black px-3 py-1.5 rounded-2xl shadow-neo-sm text-center">
              <span className="text-[10px] font-black uppercase text-black/70 block">Answered</span>
              <span className="text-base sm:text-lg font-black text-black">{answers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed Question Card */}
      <div className="bg-white border-3 sm:border-4 border-black rounded-3xl p-5 sm:p-8 shadow-neo-xl relative overflow-hidden">
        {/* Category & Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#00D2FF] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-neo-sm">
            <Zap className="w-3.5 h-3.5 fill-black" />
            Speed Question #{currentIdx + 1}
          </span>

          {currentQ.bandOrArtist && (
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFE600] text-black text-xs font-black border border-black shadow-neo-sm">
              {currentQ.bandOrArtist} {currentQ.year ? `(${currentQ.year})` : ''}
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-black text-black leading-snug mb-6">
          {currentQ.question}
        </h2>

        {/* 4 Options Grid (Big Click Targets for Rapid Tapping) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          {currentQ.options.map((option, idx) => {
            const isChosen = selectedIdx === idx;
            const isCorrectOption = idx === currentQ.correctIndex;

            let btnStyle = 'bg-[#F7F2E8] hover:bg-[#FFE600] text-black border-2 border-black shadow-neo';

            if (selectedIdx !== null) {
              if (isCorrectOption) {
                btnStyle = 'bg-[#10B981] text-white border-3 border-black shadow-neo-lg scale-[1.02]';
              } else if (isChosen) {
                btnStyle = 'bg-[#FF4B4B] text-white border-3 border-black shadow-none opacity-90';
              } else {
                btnStyle = 'bg-stone-200 text-stone-500 border-2 border-stone-300 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                id={`speed-opt-${idx}`}
                disabled={isAnsweringLocked}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-2xl text-left font-black text-sm sm:text-base transition-all flex items-center justify-between gap-2 active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-black text-white text-xs font-black flex items-center justify-center shrink-0 border border-black shadow-neo-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {selectedIdx !== null && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
                {selectedIdx !== null && isChosen && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Fast Action Row */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-black/10 text-xs font-black text-black/75">
          <span>⚡ Correct = +3s & Combo bonus</span>
          <button
            onClick={() => {
              if (window.confirm('Do you want to end this speed round early?')) {
                onFinishSpeedRound(answers, score, highestStreak, timeLeft);
              }
            }}
            className="text-stone-500 hover:text-[#FF4B4B] underline cursor-pointer"
          >
            End Speed Round Early
          </button>
        </div>
      </div>
    </div>
  );
};
