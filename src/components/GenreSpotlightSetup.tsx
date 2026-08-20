import React, { useState } from 'react';
import {
  Mic,
  Flame,
  Crown,
  Zap,
  Heart,
  Music,
  Star,
  Award,
  ChevronRight,
  Disc,
  Sparkles,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import { GenreInfo, GenreTier, Difficulty, QuizCategory } from '../types';
import { GENRE_SPOTLIGHTS } from '../data/questions';
import { soundEffects } from '../utils/audio';
import { getGenreProgress } from '../utils/storage';

interface GenreSpotlightSetupProps {
  onStartGenreQuiz: (config: {
    genre: GenreInfo;
    category: QuizCategory;
    tier: GenreTier;
    questionCount: number;
    difficulty: Difficulty;
    playerName: string;
  }) => void;
}

export const GenreSpotlightSetup: React.FC<GenreSpotlightSetupProps> = ({ onStartGenreQuiz }) => {
  const [selectedGenreId, setSelectedGenreId] = useState<string>('hiphop_classics');
  const [selectedTier, setSelectedTier] = useState<GenreTier>('silver');
  const [playerName, setPlayerName] = useState<string>('Genre Connoisseur 🎧');

  const genreProgress = getGenreProgress();
  const activeGenre = GENRE_SPOTLIGHTS.find((g) => g.id === selectedGenreId) || GENRE_SPOTLIGHTS[0];

  const getGenreIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mic':
        return <Mic className="w-6 h-6" />;
      case 'Flame':
        return <Flame className="w-6 h-6" />;
      case 'Crown':
        return <Crown className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'Heart':
        return <Heart className="w-6 h-6" />;
      default:
        return <Music className="w-6 h-6" />;
    }
  };

  const TIERS: { id: GenreTier; label: string; count: number; diff: Difficulty; desc: string; icon: string }[] = [
    {
      id: 'bronze',
      label: 'Bronze Cassette',
      count: 10,
      diff: 'easy',
      desc: '10 Questions • Essential #1 hits & signature tracks',
      icon: '📼',
    },
    {
      id: 'silver',
      label: 'Silver Compact Disc',
      count: 15,
      diff: 'medium',
      desc: '15 Questions • Core studio lore & chart battles',
      icon: '💿',
    },
    {
      id: 'gold',
      label: 'Gold Vinyl Master',
      count: 20,
      diff: 'hard',
      desc: '20 Questions • Deep cuts, production credits & b-sides',
      icon: '🏆',
    },
    {
      id: 'platinum',
      label: 'Platinum Hall of Fame',
      count: 25,
      diff: 'all',
      desc: '25 Questions • Complete gauntlet of all questions across this genre',
      icon: '👑',
    },
  ];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playStart();
    const tierConfig = TIERS.find((t) => t.id === selectedTier) || TIERS[1];
    onStartGenreQuiz({
      genre: activeGenre,
      category: activeGenre.id as QuizCategory,
      tier: selectedTier,
      questionCount: tierConfig.count,
      difficulty: tierConfig.diff,
      playerName: playerName.trim() || 'Genre Connoisseur 🎧',
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in text-black">
      {/* Hero Header */}
      <div className="bg-[#FFE600] border-3 sm:border-4 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg relative overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider mb-2 shadow-neo-sm">
              <Disc className="w-3.5 h-3.5 text-[#FFE600] animate-spin [animation-duration:6s]" />
              Dedicated 90s Style Hubs
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-2">
              90s Genre Spotlight & Mastery
            </h1>
            <p className="text-sm sm:text-base font-bold text-black/85 max-w-2xl">
              Deep dive into specific soundscapes of the 1990s! Level up your mastery from Bronze Cassette to
              Platinum Hall of Fame across Hip-Hop, Alternative, Britpop, Rave, and Pop.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border-2 border-black shadow-neo shrink-0">
            <Trophy className="w-6 h-6 text-[#FF4B4B]" />
            <div>
              <span className="text-[10px] font-black uppercase text-black/70 block">Total Genres Mastered</span>
              <span className="text-lg font-black text-black">
                {Object.values(genreProgress).filter((g) => g.stars >= 3).length} / 5 Mastered
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        {/* Step 1: Choose 90s Genre */}
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo">
          <label className="text-base font-black text-black flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6366F1]" />
              <span>1. Choose Your 90s Music Genre</span>
            </div>
            <span className="text-xs font-bold text-black/70">5 Specialized Eras</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GENRE_SPOTLIGHTS.map((genre) => {
              const isSelected = selectedGenreId === genre.id;
              const progress = genreProgress[genre.id] || { stars: 0, highScore: 0 };

              return (
                <div
                  key={genre.id}
                  id={`genre-card-${genre.id}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedGenreId(genre.id);
                  }}
                  className={`p-5 rounded-2xl border-3 border-black transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFE600] shadow-neo-lg scale-[1.02]'
                      : 'bg-[#F7F2E8] hover:bg-white shadow-neo'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon + Badge + Stars */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className="w-11 h-11 rounded-xl bg-black text-white border-2 border-black flex items-center justify-center shadow-neo-sm"
                        style={{ color: isSelected ? '#FFE600' : 'white' }}
                      >
                        {getGenreIcon(genre.icon)}
                      </div>

                      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-black shadow-neo-sm">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              progress.stars >= starIdx
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="font-black text-lg text-black leading-snug mb-1">
                      {genre.title}
                    </h3>
                    <p className="text-xs font-bold text-black/80 mb-3">{genre.subtitle}</p>

                    {/* Featured Artists Chips */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {genre.artists.slice(0, 4).map((artist, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/10 text-black border border-black/20"
                        >
                          {artist}
                        </span>
                      ))}
                      {genre.artists.length > 4 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 text-black/70">
                          +{genre.artists.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Best Score Footer */}
                  <div className="pt-3 border-t-2 border-black/20 flex items-center justify-between text-xs font-black">
                    <span className="text-black/70 font-bold">Best Score:</span>
                    <span className="text-black">
                      {progress.highScore > 0 ? `${progress.highScore.toLocaleString()} pts` : 'Not Played Yet'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Progression Tier Selection */}
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo">
          <label className="text-base font-black text-black flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-[#FF4B4B]" />
            2. Select Genre Mastery Tier
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  id={`tier-opt-${tier.id}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedTier(tier.id);
                  }}
                  className={`p-4 rounded-2xl border-2 border-black text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF4B4B] text-white border-3 border-black shadow-neo font-black'
                      : 'bg-[#F7F2E8] hover:bg-stone-100 text-black shadow-neo-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{tier.icon}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-black ${
                      isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-black'
                    }`}>
                      {tier.count} Qs
                    </span>
                  </div>
                  <div className="font-black text-sm mb-1">{tier.label}</div>
                  <div className={`text-[11px] font-semibold leading-tight ${
                    isSelected ? 'text-white/90' : 'text-black/75'
                  }`}>
                    {tier.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Player Tag */}
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo">
          <label className="text-base font-black text-black flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            3. Player Name / Genre Specialist Handle
          </label>
          <input
            type="text"
            id="genre-player-name-input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={25}
            placeholder="Enter player name..."
            className="w-full sm:max-w-md px-4 py-3 rounded-2xl bg-[#F7F2E8] border-2 border-black text-black font-black text-base shadow-neo-sm focus:outline-none focus:bg-[#FFE600] transition-colors"
          />
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          id="start-genre-quiz-btn"
          className="w-full py-4 rounded-2xl bg-[#FF4B4B] hover:bg-[#ff3333] text-white font-black text-lg sm:text-xl border-3 border-black shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Disc className="w-6 h-6 animate-spin [animation-duration:8s]" />
          Launch {activeGenre.title} ({TIERS.find((t) => t.id === selectedTier)?.count} Questions)
          <ChevronRight className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};
