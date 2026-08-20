import React, { useState, useEffect, useCallback } from 'react';
import { Question, Player } from '../types';
import { Flame, Clock, Heart, Sparkles, Bookmark, CheckCircle2, XCircle, ArrowRight, Disc, Award, Zap, Check, Target } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { toggleBookmarkFact, getBookmarkedFacts } from '../utils/storage';

interface QuizCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  isTimed?: boolean;
  timeLimitSeconds?: number;
  lives?: number; // for survival mode
  activePlayer?: Player; // for multiplayer
  onAnswerSelected: (selectedIdx: number, timeSpentMs: number) => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  score,
  streak,
  isTimed = false,
  timeLimitSeconds = 20,
  lives,
  activePlayer,
  onAnswerSelected,
  onNextQuestion,
  isLastQuestion,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if current question is bookmarked
  useEffect(() => {
    const bookmarks = getBookmarkedFacts();
    setIsBookmarked(bookmarks.some((b) => b.id === question.id));
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimeLeft(timeLimitSeconds);
    setStartTime(Date.now());
  }, [question, timeLimitSeconds]);

  // Handle timer countdown
  useEffect(() => {
    if (!isTimed || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed, hasAnswered, question]);

  const handleTimeOut = useCallback(() => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(-1);
    soundEffects.playIncorrect();
    onAnswerSelected(-1, timeLimitSeconds * 1000);
  }, [hasAnswered, onAnswerSelected, timeLimitSeconds]);

  const handleOptionClick = (index: number) => {
    if (hasAnswered) return;

    setHasAnswered(true);
    setSelectedAnswer(index);
    const timeSpent = Date.now() - startTime;

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      if (streak >= 2) {
        soundEffects.playStreakBonus();
      } else {
        soundEffects.playCorrect();
      }
    } else {
      soundEffects.playIncorrect();
    }

    onAnswerSelected(index, timeSpent);
  };

  // Keyboard shortcut listener (1, 2, 3, 4 or A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNextQuestion();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleOptionClick(0);
      if (key === '2' || key === 'B') handleOptionClick(1);
      if (key === '3' || key === 'C') handleOptionClick(2);
      if (key === '4' || key === 'D') handleOptionClick(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, onNextQuestion, question]);

  const handleBookmarkToggle = () => {
    soundEffects.playClick();
    const newState = toggleBookmarkFact({
      id: question.id,
      question: question.question,
      explanation: question.explanation,
      bandOrArtist: question.bandOrArtist,
    });
    setIsBookmarked(newState);
  };

  const streakMultiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : streak >= 2 ? 1.5 : 1;

  // Answer correctness state for feedback animations
  const isAnswerCorrect = hasAnswered && selectedAnswer === question.correctIndex;
  const isAnswerIncorrect = hasAnswered && selectedAnswer !== question.correctIndex;

  // Progress metrics
  const completedCount = hasAnswered ? currentIndex + 1 : currentIndex;
  const progressPercent = Math.min(100, Math.round(((currentIndex + (hasAnswered ? 1 : 0.4)) / totalQuestions) * 100));
  const completedPercentOnly = Math.min(100, Math.round((completedCount / totalQuestions) * 100));
  const remainingQuestions = Math.max(0, totalQuestions - (currentIndex + 1));

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Top Banner for Active Turn / Player */}
      {activePlayer && (
        <div className="mb-4 bg-[#00D2FF] border-3 border-black rounded-3xl p-4 flex items-center justify-between shadow-neo-lg animate-fade-in text-black">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-2xl shadow-neo-sm">
              {activePlayer.avatar === 'liam' && '🕶️'}
              {activePlayer.avatar === 'damon' && '👕'}
              {activePlayer.avatar === 'jarvis' && '👓'}
              {activePlayer.avatar === 'shirley' && '👩‍🎤'}
              {activePlayer.avatar === 'geri' && '🇬🇧'}
              {activePlayer.avatar === 'brett' && '🎙️'}
              {activePlayer.avatar === 'keith' && '⚡'}
              {activePlayer.avatar === 'ashcroft' && '🚶‍♂️'}
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-black/70">
                Current Turn
              </span>
              <h3 className="font-black text-lg text-black">{activePlayer.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-wider text-black/70">Score</span>
            <div className="text-xl font-black text-black">{activePlayer.score.toLocaleString()} pts</div>
          </div>
        </div>
      )}

      {/* Animated Top Progress Bar Card */}
      <div className="bg-white border-3 border-black rounded-3xl p-4 sm:p-5 mb-4 shadow-neo text-black">
        {/* Progress Header Status Line */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center font-black text-xs shadow-neo-sm">
              <Target className="w-3.5 h-3.5 text-black" />
            </span>
            <div>
              <div className="text-xs font-black text-black flex items-center gap-1.5">
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
                {hasAnswered && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#4ADE80] text-black px-1.5 py-0.2 rounded font-black border border-black animate-fade-in">
                    <Check className="w-3 h-3" /> Answered
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Percentage Badge */}
            <span className="px-2.5 py-1 rounded-xl bg-[#00D2FF] text-black text-xs font-black border-2 border-black shadow-neo-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-black text-black" />
              <span>{completedPercentOnly}% Done</span>
            </span>

            {/* Remaining Questions Pill */}
            <span className="px-2.5 py-1 rounded-xl bg-[#F7F2E8] text-black text-xs font-black border-2 border-black shadow-neo-sm">
              {remainingQuestions === 0 ? (
                <span className="text-[#FF4B4B]">🏁 Final Question!</span>
              ) : (
                <span>{remainingQuestions} {remainingQuestions === 1 ? 'question' : 'questions'} left</span>
              )}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar Track */}
        <div className="relative w-full bg-[#E5DEC9] h-5 sm:h-6 rounded-2xl overflow-hidden border-2 sm:border-3 border-black shadow-neo-sm">
          {/* Animated Fill Bar */}
          <div
            id="quiz-progress-bar-fill"
            className="h-full bg-gradient-to-r from-[#00D2FF] via-[#FFE600] to-[#FF4B4B] transition-all duration-500 ease-out animate-stripes border-r-2 sm:border-r-3 border-black relative flex items-center justify-end pr-2"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Pulsing indicator leading point */}
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-black shadow-sm animate-ping shrink-0" />
          </div>

          {/* Segment Divider Markers for crisp question counting (if <= 20 questions) */}
          {totalQuestions <= 20 && (
            <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalQuestions}, 1fr)` }}>
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <div
                  key={idx}
                  className={`border-r border-black/20 h-full flex items-center justify-center ${
                    idx < currentIndex
                      ? 'bg-black/5'
                      : idx === currentIndex
                      ? 'bg-white/10'
                      : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress & Live HUD Bar */}
      <div className="bg-white border-3 border-black rounded-3xl p-4 mb-4 shadow-neo flex flex-wrap items-center justify-between gap-3 text-black">
        {/* Category Badge */}
        <div className="px-3.5 py-1 rounded-full bg-[#FFE600] border-2 border-black text-xs font-black text-black shadow-neo-sm flex items-center gap-1.5">
          <Disc className="w-3.5 h-3.5 text-black" />
          <span className="capitalize">{question.category.replace(/_/g, ' ')}</span>
        </div>

        {/* Lives (Survival Mode) */}
        {lives !== undefined && (
          <div className="flex items-center gap-1.5 bg-[#F7F2E8] px-3.5 py-1 rounded-full border-2 border-black shadow-neo-sm">
            {[1, 2, 3].map((heartIdx) => (
              <Heart
                key={heartIdx}
                className={`w-4 h-4 transition-colors ${
                  heartIdx <= lives ? 'text-[#FF4B4B] fill-[#FF4B4B]' : 'text-stone-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Streak Multiplier */}
        {streak > 1 && (
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF8A00] border-2 border-black text-white text-xs font-black shadow-neo-sm animate-pulse">
            <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            <span>{streak}x Streak ({streakMultiplier}x Pts)</span>
          </div>
        )}

        {/* Total Score */}
        {!activePlayer && (
          <div className="text-right">
            <span className="text-[10px] text-black/70 uppercase font-black block">Score</span>
            <span className="text-base font-black text-[#FF4B4B]">{score.toLocaleString()} pts</span>
          </div>
        )}
      </div>

      {/* Speed Run Timer Bar (if enabled) */}
      {isTimed && (
        <div className="mb-6 bg-white border-2 border-black rounded-2xl p-3 shadow-neo flex items-center gap-3">
          <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-[#FF4B4B] animate-bounce' : 'text-black'}`} />
          <div className="flex-1 bg-[#F7F2E8] h-3 rounded-full overflow-hidden border-2 border-black">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-[#FF4B4B]' : timeLeft <= 10 ? 'bg-[#FFE600]' : 'bg-[#4ADE80]'
              }`}
              style={{ width: `${(timeLeft / timeLimitSeconds) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-mono font-black ${timeLeft <= 5 ? 'text-[#FF4B4B]' : 'text-black'}`}>
            {timeLeft}s
          </span>
        </div>
      )}

      {/* Question Card Box */}
      <div
        className={`bg-white border-3 sm:border-4 border-black rounded-3xl p-6 sm:p-8 shadow-neo-xl relative overflow-hidden mb-6 text-black transition-all ${
          hasAnswered
            ? isAnswerCorrect
              ? 'animate-correct-flash ring-4 ring-[#10B981]/30'
              : 'animate-subtle-shake ring-4 ring-[#FF4B4B]/30'
            : ''
        }`}
      >
        {/* Real-time Answer Feedback Indicator */}
        {hasAnswered && (
          <div className="mb-4 flex items-center gap-2 animate-fade-in">
            {isAnswerCorrect ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4ADE80] text-black border-2 border-black font-black text-xs sm:text-sm shadow-neo-sm">
                <CheckCircle2 className="w-4 h-4 text-black" />
                Nice one! Correct answer! 🎯
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF4B4B] text-white border-2 border-black font-black text-xs sm:text-sm shadow-neo-sm">
                <XCircle className="w-4 h-4 text-white" />
                {selectedAnswer === -1 ? "Time's up! Missed question!" : 'Incorrect answer!'}
              </span>
            )}
          </div>
        )}

        {/* Question Text */}
        <h2 className="text-lg sm:text-2xl font-black text-black leading-snug tracking-tight mb-8">
          {question.question}
        </h2>

        {/* 4 Multiple Choice Options */}
        <div className="grid grid-cols-1 gap-3.5">
          {question.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isCorrect = idx === question.correctIndex;
            const isSelected = selectedAnswer === idx;

            let buttonStyle = 'bg-[#FAF7F0] hover:bg-[#FFE600] text-black border-2 border-black shadow-neo';

            if (hasAnswered) {
              if (isCorrect) {
                buttonStyle = `bg-[#4ADE80] text-black border-3 border-black shadow-neo-lg scale-[1.01] ${
                  isSelected ? 'animate-correct-flash' : ''
                }`;
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-[#FF4B4B] text-white border-3 border-black shadow-neo-lg scale-[1.01] animate-subtle-shake';
              } else {
                buttonStyle = 'bg-[#E5DEC9] text-black/40 border-2 border-black/40 opacity-60 shadow-none';
              }
            }

            return (
              <button
                key={idx}
                id={`quiz-option-${idx}`}
                disabled={hasAnswered}
                onClick={() => handleOptionClick(idx)}
                className={`w-full p-4 rounded-2xl text-left font-black text-sm sm:text-base transition-all flex items-center justify-between group cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5 pr-2">
                  <span
                    className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 border-2 border-black transition-colors ${
                      hasAnswered && isCorrect
                        ? 'bg-black text-white shadow-neo-sm'
                        : hasAnswered && isSelected
                        ? 'bg-white text-black shadow-neo-sm'
                        : 'bg-white text-black shadow-neo-sm group-hover:bg-black group-hover:text-white'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>

                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-black shrink-0 ml-2" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-6 h-6 text-white shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Did You Know / Trivia Factoid Box (Shows after answering) */}
        {hasAnswered && (
          <div className="mt-6 pt-6 border-t-2 border-black/10 animate-fade-in">
            <div className="bg-[#FFF9DB] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-neo">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-black" />
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    90s Music Lore & Factoid
                  </span>
                </div>
                <button
                  onClick={handleBookmarkToggle}
                  title="Bookmark this trivia fact"
                  className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border-2 border-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
                    isBookmarked
                      ? 'bg-[#00D2FF] text-black'
                      : 'bg-white text-black hover:bg-[#FFE600]'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-black text-black' : 'text-black'}`} />
                  {isBookmarked ? 'Saved in Vault' : 'Save Fact'}
                </button>
              </div>
              <p className="text-sm text-black leading-relaxed font-bold">
                {question.explanation}
              </p>
            </div>

            {/* Next Button */}
            <div className="mt-6">
              <button
                id="next-question-btn"
                onClick={() => {
                  soundEffects.playClick();
                  onNextQuestion();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-[#00D2FF] hover:bg-[#38BDF8] text-black font-black text-base sm:text-lg border-3 border-black shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-neo-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{isLastQuestion ? 'View Final Results' : 'Next Question'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-xs font-bold text-black/60 mt-2">
                Tip: Press <kbd className="px-2 py-0.5 bg-white border border-black text-black rounded text-[11px] font-black shadow-neo-sm">Enter</kbd> or <kbd className="px-2 py-0.5 bg-white border border-black text-black rounded text-[11px] font-black shadow-neo-sm">Space</kbd> to continue
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
