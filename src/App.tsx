import React, { useState } from 'react';
import {
  GameMode,
  QuizCategory,
  Difficulty,
  SoloFormat,
  Question,
  Player,
  QuizResult,
  PlayerAnswerRecord,
  GenreInfo,
  GenreTier,
} from './types';
import { QUESTIONS_DATABASE } from './data/questions';
import { Header } from './components/Header';
import { SoloSetup } from './components/SoloSetup';
import { DailyChallengeSetup } from './components/DailyChallengeSetup';
import { SpeedRoundSetup } from './components/SpeedRoundSetup';
import { SpeedRoundCard } from './components/SpeedRoundCard';
import { GenreSpotlightSetup } from './components/GenreSpotlightSetup';
import { MultiplayerSetup } from './components/MultiplayerSetup';
import { AiTopicSetup } from './components/AiTopicSetup';
import { QuizCard } from './components/QuizCard';
import { ResultsSummary } from './components/ResultsSummary';
import { StatsModal } from './components/StatsModal';
import { getRankTitle, calculateQuestionScore } from './utils/scoring';
import { saveQuizResult } from './utils/storage';
import {
  getDailyQuestions,
  recordDailyChallengeCompletion,
  getTodayDateString,
} from './utils/dailyChallenge';

type AppState = 'setup' | 'playing' | 'results';

export default function App() {
  // Navigation & Screen State
  const [currentMode, setCurrentMode] = useState<GameMode>('solo');
  const [appState, setAppState] = useState<AppState>('setup');

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<PlayerAnswerRecord[]>([]);
  const [isTimed, setIsTimed] = useState(false);
  const [soloFormat, setSoloFormat] = useState<SoloFormat>('quick');
  const [lives, setLives] = useState<number | undefined>(undefined);
  const [categoryLabel, setCategoryLabel] = useState('All 90s');
  const [speedRoundDuration, setSpeedRoundDuration] = useState(60);

  // Solo Scoring State
  const [soloScore, setSoloScore] = useState(0);
  const [soloStreak, setSoloStreak] = useState(0);
  const [soloHighestStreak, setSoloHighestStreak] = useState(0);

  // Multiplayer State
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsInitialTab, setStatsInitialTab] = useState<'leaderboard' | 'daily' | 'history' | 'badges' | 'bookmarks'>('leaderboard');

  // Final Result State
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  // Shuffle array helper
  const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // 1. Start Solo Quiz
  const handleStartSolo = ({
    category,
    difficulty,
    format,
    isTimed: timed,
    playerName,
  }: {
    category: QuizCategory;
    difficulty: Difficulty;
    format: SoloFormat;
    isTimed: boolean;
    playerName: string;
  }) => {
    let pool = [...QUESTIONS_DATABASE];

    if (category !== 'all') {
      pool = pool.filter((q) => q.category === category);
    }
    if (difficulty !== 'all') {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }

    if (pool.length < 5) {
      pool = [...QUESTIONS_DATABASE];
    }

    let shuffled = shuffle(pool);
    let count = 10;

    if (format === 'standard') count = 20;
    if (format === 'marathon') count = Math.min(35, shuffled.length);
    if (format === 'survival') {
      count = Math.min(40, shuffled.length);
      setLives(3);
    } else {
      setLives(undefined);
    }

    const selectedQuestions = shuffled.slice(0, count);

    setActiveQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloHighestStreak(0);
    setIsTimed(timed);
    setSoloFormat(format);
    setCategoryLabel(category === 'all' ? 'All 90s Trivia' : category.replace(/_/g, ' '));
    setPlayers([]);
    setAppState('playing');
  };

  // 2. Start Speed Round
  const handleStartSpeedRound = ({
    durationSeconds,
    difficulty,
    playerName,
  }: {
    durationSeconds: number;
    difficulty: Difficulty;
    playerName: string;
  }) => {
    let pool = [...QUESTIONS_DATABASE];
    if (difficulty !== 'all') {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }
    if (pool.length < 10) {
      pool = [...QUESTIONS_DATABASE];
    }

    // Prepare large shuffled pool for rapid-fire play
    const shuffled = shuffle(pool);
    setActiveQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloHighestStreak(0);
    setSpeedRoundDuration(durationSeconds);
    setCategoryLabel('90s Speed Round Blitz');
    setPlayers([]);
    setLives(undefined);
    setIsTimed(true);
    setAppState('playing');
  };

  // 3. Finish Speed Round
  const handleFinishSpeedRound = (
    answers: PlayerAnswerRecord[],
    finalScore: number,
    highestStreak: number,
    timeRemaining: number
  ) => {
    const total = answers.length;
    const correctTotal = answers.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correctTotal / total) * 100) : 0;
    const rank = getRankTitle(accuracy, total, 'speed_round');

    const resultData: QuizResult = {
      id: `result_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      mode: 'speed_round',
      category: 'Speed Round Blitz',
      totalQuestions: total,
      score: finalScore,
      accuracy,
      highestStreak,
      answersPerMinute: Math.round((total / (speedRoundDuration / 60))),
      rankTitle: rank,
      answers,
    };

    setFinalResult(resultData);
    saveQuizResult(resultData);
    setAppState('results');
  };

  // 4. Start Genre Spotlight Quiz
  const handleStartGenreQuiz = ({
    genre,
    category,
    tier,
    questionCount,
    difficulty,
    playerName,
  }: {
    genre: GenreInfo;
    category: QuizCategory;
    tier: GenreTier;
    questionCount: number;
    difficulty: Difficulty;
    playerName: string;
  }) => {
    let pool = QUESTIONS_DATABASE.filter((q) => q.category === category);
    if (pool.length < 5) {
      pool = [...QUESTIONS_DATABASE];
    }

    const shuffled = shuffle(pool);
    let selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // If pool has fewer questions than count, repeat with shuffling
    while (selected.length < questionCount) {
      selected = [...selected, ...shuffle(pool)].slice(0, questionCount);
    }

    setActiveQuestions(selected);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloHighestStreak(0);
    setIsTimed(false);
    setSoloFormat('standard');
    setCategoryLabel(genre.title);
    setPlayers([]);
    setLives(undefined);
    setAppState('playing');
  };

  // 5. Start Multiplayer Quiz
  const handleStartMultiplayer = ({
    players: newPlayers,
    category,
    difficulty,
    questionsPerPlayer,
  }: {
    players: Player[];
    category: QuizCategory;
    difficulty: Difficulty;
    questionsPerPlayer: number;
  }) => {
    let pool = [...QUESTIONS_DATABASE];

    if (category !== 'all') {
      pool = pool.filter((q) => q.category === category);
    }
    if (difficulty !== 'all') {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }

    if (pool.length < 5) {
      pool = [...QUESTIONS_DATABASE];
    }

    const totalNeeded = newPlayers.length * questionsPerPlayer;
    let selected: Question[] = [];
    while (selected.length < totalNeeded) {
      const shuffled = shuffle(pool);
      selected = [...selected, ...shuffled];
    }
    selected = selected.slice(0, totalNeeded);

    setActiveQuestions(selected);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setPlayers(newPlayers);
    setActivePlayerIndex(0);
    setIsTimed(false);
    setLives(undefined);
    setCategoryLabel(category === 'all' ? 'All 90s Trivia' : category.replace(/_/g, ' '));
    setAppState('playing');
  };

  // 6. Start AI Generated Quiz
  const handleStartAiQuiz = (questions: Question[], topicTitle: string) => {
    setActiveQuestions(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloHighestStreak(0);
    setIsTimed(false);
    setLives(undefined);
    setCategoryLabel(`AI Pack: ${topicTitle}`);
    setPlayers([]);
    setAppState('playing');
  };

  // 7. Start Daily 90s Challenge
  const handleStartDailyChallenge = (playerName: string, avatar: string) => {
    const todayStr = getTodayDateString();
    const dailyQs = getDailyQuestions(todayStr);

    setActiveQuestions(dailyQs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloHighestStreak(0);
    setIsTimed(true); // Timed to enable speed bonuses!
    setSoloFormat('quick');
    setCategoryLabel(`Daily 90s Quest • ${todayStr}`);
    setPlayers([]);
    setLives(undefined);
    setAppState('playing');
  };

  // Handle Answer Selection in Standard / Genre / Multiplayer / Solo Modes
  const handleAnswerSelected = (selectedIdx: number, timeSpentMs: number) => {
    const currentQ = activeQuestions[currentQuestionIndex];
    const isCorrect = selectedIdx === currentQ.correctIndex;
    const selectedOptionText = selectedIdx >= 0 ? currentQ.options[selectedIdx] : 'Timed Out';

    // Calculate score using central scoring utility
    const { breakdown, nextStreak } = calculateQuestionScore({
      isCorrect,
      difficulty: currentQ.difficulty,
      timeSpentMs,
      currentStreak: players.length > 0 ? players[activePlayerIndex]?.currentStreak || 0 : soloStreak,
      isTimed,
      isSpeedRound: false,
    });

    // Record answer
    const record: PlayerAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      selectedOption: selectedOptionText,
      correctOption: currentQ.options[currentQ.correctIndex],
      isCorrect,
      explanation: currentQ.explanation,
      category: currentQ.category,
      timeSpentMs,
      scoreEarned: breakdown.totalPoints,
      scoreBreakdown: breakdown,
    };
    setUserAnswers((prev) => [...prev, record]);

    // Multiplayer scoring
    if (players.length > 0) {
      setPlayers((prevPlayers) => {
        const updated = [...prevPlayers];
        const p = updated[activePlayerIndex];
        if (isCorrect) {
          p.score += breakdown.totalPoints;
          p.correctCount += 1;
          p.currentStreak = nextStreak;
          p.highestStreak = Math.max(p.highestStreak, nextStreak);
        } else {
          p.incorrectCount += 1;
          p.currentStreak = 0;
        }
        return updated;
      });
    } else {
      // Solo scoring
      if (isCorrect) {
        setSoloScore((s) => s + breakdown.totalPoints);
        setSoloStreak(nextStreak);
        setSoloHighestStreak((h) => Math.max(h, nextStreak));
      } else {
        setSoloStreak(0);
        if (soloFormat === 'survival' && lives !== undefined) {
          setLives((l) => (l !== undefined ? Math.max(0, l - 1) : 0));
        }
      }
    }
  };

  // Next Question or Finish Quiz
  const handleNextQuestion = () => {
    // Check if survival mode ran out of lives
    if (soloFormat === 'survival' && lives !== undefined && lives <= 1) {
      finishStandardQuiz();
      return;
    }

    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      if (players.length > 0) {
        setActivePlayerIndex((prev) => (prev + 1) % players.length);
      }
    } else {
      finishStandardQuiz();
    }
  };

  const finishStandardQuiz = () => {
    const total = userAnswers.length;
    const correctTotal = userAnswers.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correctTotal / total) * 100) : 0;
    const rank = getRankTitle(accuracy, total, currentMode);

    const resultData: QuizResult = {
      id: `result_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      mode: currentMode,
      category: categoryLabel,
      totalQuestions: total,
      score: players.length > 0 ? 0 : soloScore,
      accuracy,
      highestStreak: soloHighestStreak,
      rankTitle: rank,
      answers: userAnswers,
      players: players.length > 0 ? players : undefined,
    };

    // If Daily 90s Quest, record global daily leaderboard entry & streak progression
    if (currentMode === 'daily_challenge') {
      const todayStr = getTodayDateString();
      const totalTimeMs = userAnswers.reduce((sum, a) => sum + (a.timeSpentMs || 0), 0);
      const timeSpentSeconds = Math.max(5, Math.round(totalTimeMs / 1000));
      const pName = localStorage.getItem('britpop_player_name') || '90s Fan';
      const pAvatar = localStorage.getItem('britpop_avatar') || '🕶️';

      recordDailyChallengeCompletion({
        dateStr: todayStr,
        score: soloScore,
        accuracy,
        timeSpentSeconds,
        highestStreak: soloHighestStreak,
        rankTitle: rank,
        playerName: pName,
        avatar: pAvatar,
      });
    }

    setFinalResult(resultData);
    saveQuizResult(resultData);
    setAppState('results');
  };

  const handleQuitRound = () => {
    setAppState('setup');
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#121826] flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Universal Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setAppState('setup');
        }}
        onOpenStats={() => {
          setStatsInitialTab('leaderboard');
          setIsStatsOpen(true);
        }}
        onOpenBadges={() => {
          setStatsInitialTab('badges');
          setIsStatsOpen(true);
        }}
        onOpenBookmarks={() => {
          setStatsInitialTab('bookmarks');
          setIsStatsOpen(true);
        }}
        isPlaying={appState === 'playing'}
        onQuitQuiz={handleQuitRound}
      />

      {/* Main Screen Router */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {appState === 'setup' && (
          <div>
            {currentMode === 'daily_challenge' && (
              <DailyChallengeSetup
                onStartDailyChallenge={handleStartDailyChallenge}
                onOpenGlobalLeaderboard={() => {
                  setStatsInitialTab('daily');
                  setIsStatsOpen(true);
                }}
              />
            )}
            {currentMode === 'solo' && <SoloSetup onStartQuiz={handleStartSolo} />}
            {currentMode === 'speed_round' && <SpeedRoundSetup onStartSpeedRound={handleStartSpeedRound} />}
            {currentMode === 'genre_spotlight' && <GenreSpotlightSetup onStartGenreQuiz={handleStartGenreQuiz} />}
            {currentMode === 'multiplayer' && <MultiplayerSetup onStartMultiplayer={handleStartMultiplayer} />}
            {currentMode === 'ai_custom' && <AiTopicSetup onStartAiQuiz={handleStartAiQuiz} />}
          </div>
        )}

        {appState === 'playing' && activeQuestions.length > 0 && (
          <div>
            {currentMode === 'speed_round' ? (
              <SpeedRoundCard
                questions={activeQuestions}
                durationSeconds={speedRoundDuration}
                onFinishSpeedRound={handleFinishSpeedRound}
                onQuit={handleQuitRound}
              />
            ) : (
              <QuizCard
                question={activeQuestions[currentQuestionIndex]}
                currentIndex={currentQuestionIndex}
                totalQuestions={activeQuestions.length}
                score={soloScore}
                streak={players.length > 0 ? players[activePlayerIndex]?.currentStreak || 0 : soloStreak}
                isTimed={isTimed}
                lives={lives}
                activePlayer={players.length > 0 ? players[activePlayerIndex] : undefined}
                onAnswerSelected={handleAnswerSelected}
                onNextQuestion={handleNextQuestion}
                isLastQuestion={
                  currentQuestionIndex + 1 >= activeQuestions.length ||
                  (soloFormat === 'survival' && lives !== undefined && lives <= 1)
                }
              />
            )}
          </div>
        )}

        {appState === 'results' && finalResult && (
          <ResultsSummary
            result={finalResult}
            players={players.length > 0 ? players : undefined}
            onPlayAgain={() => {
              setAppState('setup');
            }}
            onHome={() => {
              setCurrentMode('solo');
              setAppState('setup');
            }}
            onViewBadges={() => {
              setStatsInitialTab('badges');
              setIsStatsOpen(true);
            }}
          />
        )}
      </main>

      {/* Stats & Bookmarks Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        initialTab={statsInitialTab}
      />
    </div>
  );
}
