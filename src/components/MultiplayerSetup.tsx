import React, { useState } from 'react';
import { Player, QuizCategory, Difficulty } from '../types';
import { CATEGORIES_META } from '../data/questions';
import { Users, Plus, Trash2, Crown, Play, Sparkles, Disc, Swords } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface MultiplayerSetupProps {
  onStartMultiplayer: (options: {
    players: Player[];
    category: QuizCategory;
    difficulty: Difficulty;
    questionsPerPlayer: number;
  }) => void;
}

const AVATAR_OPTIONS = [
  { id: 'liam', label: 'Parka & Bucket Hat', emoji: '🕶️', style: 'border-black bg-[#FFE600]' },
  { id: 'damon', label: 'Fred Perry Polo', emoji: '👕', style: 'border-black bg-[#00D2FF]' },
  { id: 'jarvis', label: 'Velvet Blazer & Glasses', emoji: '👓', style: 'border-black bg-[#4ADE80]' },
  { id: 'shirley', label: 'Garbage Rock Icon', emoji: '👩‍🎤', style: 'border-black bg-[#FF4B4B]' },
  { id: 'geri', label: 'Union Jack Mini Dress', emoji: '🇬🇧', style: 'border-black bg-[#FF8A00]' },
  { id: 'brett', label: 'Glam Cheekbones', emoji: '🎙️', style: 'border-black bg-[#A855F7]' },
  { id: 'keith', label: 'Firestarter Mohawk', emoji: '⚡', style: 'border-black bg-[#FACC15]' },
  { id: 'ashcroft', label: 'Hoxton Strider', emoji: '🚶‍♂️', style: 'border-black bg-[#2DD4BF]' },
];

export const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onStartMultiplayer }) => {
  const [players, setPlayers] = useState<Array<{ id: string; name: string; avatar: string }>>([
    { id: 'p1', name: 'Player 1 (Wife)', avatar: 'shirley' },
    { id: 'p2', name: 'Player 2 (Challenger)', avatar: 'liam' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  const [questionsPerPlayer, setQuestionsPerPlayer] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('all');

  const addPlayer = () => {
    if (players.length >= 6) return;
    soundEffects.playClick();
    const availableAvatars = AVATAR_OPTIONS.filter((a) => !players.some((p) => p.avatar === a.id));
    const nextAvatar = availableAvatars.length > 0 ? availableAvatars[0].id : AVATAR_OPTIONS[players.length % AVATAR_OPTIONS.length].id;
    setPlayers([
      ...players,
      {
        id: `p_${Date.now()}`,
        name: `Player ${players.length + 1}`,
        avatar: nextAvatar,
      },
    ]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    soundEffects.playClick();
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...players];
    updated[index].name = name;
    setPlayers(updated);
  };

  const updatePlayerAvatar = (index: number, avatar: string) => {
    soundEffects.playClick();
    const updated = [...players];
    updated[index].avatar = avatar;
    setPlayers(updated);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();

    const formattedPlayers: Player[] = players.map((p) => ({
      id: p.id,
      name: p.name.trim() || 'Player',
      avatar: p.avatar,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      currentStreak: 0,
      highestStreak: 0,
    }));

    onStartMultiplayer({
      players: formattedPlayers,
      category: selectedCategory,
      difficulty,
      questionsPerPlayer,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-3 border-black p-6 sm:p-8 mb-8 shadow-neo-lg text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6366F1] border-2 border-black text-white text-xs font-black uppercase tracking-wider mb-3 shadow-neo-sm">
          <Users className="w-3.5 h-3.5 text-white" />
          Pass & Play Couch Head-to-Head (2 to 6 Players)
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight mb-3">
          The <span className="underline decoration-[#FFE600] decoration-wavy decoration-2">Battle of the Living Room</span>
        </h1>
        <p className="text-black/80 font-bold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Sit together around the screen or phone. Take turns answering 90s music questions, build streaks, and crown the ultimate Britpop champion!
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        {/* Players List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6366F1]" />
              1. Competitors ({players.length} Players)
            </h2>
            {players.length < 6 && (
              <button
                type="button"
                id="add-player-btn"
                onClick={addPlayer}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-black border-2 border-black text-xs font-black shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((player, idx) => {
              const currentAvatarMeta = AVATAR_OPTIONS.find((a) => a.id === player.avatar) || AVATAR_OPTIONS[0];
              return (
                <div
                  key={player.id}
                  className="bg-white border-2 border-black rounded-2xl p-4 shadow-neo flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-black text-white border-2 border-black shadow-neo-sm">
                      P{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(idx, e.target.value)}
                      placeholder={`Player ${idx + 1} Name`}
                      maxLength={20}
                      className="flex-1 bg-[#F7F2E8] border-2 border-black rounded-xl px-3 py-1.5 text-sm font-black text-black focus:outline-none placeholder-stone-400"
                    />
                    {players.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(idx)}
                        className="p-1.5 rounded-lg text-black hover:text-white hover:bg-[#FF4B4B] border-2 border-black shadow-neo-sm transition-all cursor-pointer"
                        title="Remove Player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <span className="text-[11px] text-black/80 font-black block mb-1.5">
                      Select Persona ({currentAvatarMeta.label}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((av) => {
                        const isChosen = player.avatar === av.id;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => updatePlayerAvatar(idx, av.id)}
                            title={av.label}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all border-2 border-black cursor-pointer ${
                              isChosen
                                ? 'bg-[#FFE600] text-black shadow-neo-sm scale-110'
                                : 'bg-[#F7F2E8] hover:bg-white text-black'
                            }`}
                          >
                            {av.emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category & Rounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Round length */}
          <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-neo">
            <h3 className="text-sm font-black text-black mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-500" />
              Round Length
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 3, label: '3 Questions / Person' },
                { count: 5, label: '5 Questions / Person' },
                { count: 10, label: '10 Questions / Person' },
              ].map((r) => (
                <button
                  key={r.count}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setQuestionsPerPlayer(r.count);
                  }}
                  className={`p-2.5 rounded-xl text-center text-xs font-black border-2 border-black transition-all cursor-pointer ${
                    questionsPerPlayer === r.count
                      ? 'bg-[#6366F1] text-white shadow-neo-sm scale-[1.02]'
                      : 'bg-[#F7F2E8] text-black hover:bg-white'
                  }`}
                >
                  <div>{r.count} Qs / P</div>
                  <div className={`text-[10px] mt-0.5 ${questionsPerPlayer === r.count ? 'text-indigo-200' : 'text-black/60'}`}>
                    Total {r.count * players.length} Qs
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-neo">
            <h3 className="text-sm font-black text-black mb-3 flex items-center gap-2">
              <Disc className="w-4 h-4 text-[#FF4B4B]" />
              Difficulty Level
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'easy', label: 'Casual Fan' },
                { id: 'hard', label: 'True 90s Expert' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setDifficulty(d.id as Difficulty);
                  }}
                  className={`p-2.5 rounded-xl text-center text-xs font-black border-2 border-black transition-all cursor-pointer ${
                    difficulty === d.id
                      ? 'bg-[#FF4B4B] text-white shadow-neo-sm scale-[1.02]'
                      : 'bg-[#F7F2E8] text-black hover:bg-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <h2 className="text-sm font-black text-black mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Category Channel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES_META.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id as QuizCategory);
                }}
                className={`p-3 rounded-xl text-left border-2 border-black transition-all text-xs font-black flex items-center gap-2 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#FFE600] text-black shadow-neo scale-[1.02]'
                    : 'bg-white text-black hover:bg-[#FFF9DB]'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full border border-black ${selectedCategory === cat.id ? 'bg-black' : 'bg-[#6366F1]'}`} />
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div>
          <button
            id="start-multiplayer-quiz-btn"
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-[#6366F1] hover:bg-[#4f46e5] text-white font-black text-lg sm:text-xl tracking-wide border-3 border-black shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-neo-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            Start Multiplayer Head-to-Head
          </button>
        </div>
      </form>
    </div>
  );
};
