import React, { useState } from 'react';
import { Question } from '../types';
import { Sparkles, Bot, Loader2, Play, Flame, Disc, Music, AlertCircle } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface AiTopicSetupProps {
  onStartAiQuiz: (questions: Question[], topicTitle: string) => void;
}

const POPULAR_TOPIC_PRESETS = [
  {
    title: 'Oasis vs Blur: The 1995 Battle',
    prompt: 'The Battle of Britpop between Blur and Oasis in 1995, chart drama, Country House, Roll With It, NME quotes, and Damon vs Noel rivalry',
  },
  {
    title: 'Pulp & Sheffield Indie Legends',
    prompt: 'Pulp, Jarvis Cocker, Different Class, His \'n\' Hers, Common People, Sheffield music scene, and 90s art school culture',
  },
  {
    title: 'Knebworth & Glastonbury 90s Magic',
    prompt: 'Legendary 90s UK festival performances, Oasis at Knebworth 1996, Pulp replacing The Stone Roses at Glastonbury 1995, Radiohead 1997',
  },
  {
    title: '90s Women Who Rocked',
    prompt: 'Elastica, Garbage (Shirley Manson), Sleeper (Louise Wener), Catatonia, Echobelly, Hole, Alanis Morissette, No Doubt, and 90s female frontwomen',
  },
  {
    title: 'Obscure Britpop & Cult B-Sides',
    prompt: 'Rare Britpop B-sides, Menswear, Gene, Longpigs, Marion, Space, The Bluetones, Shed Seven, and Creation Records secret gems',
  },
  {
    title: '90s Big Beat, Rave & Haçienda',
    prompt: 'The Prodigy, Fatboy Slim, Chemical Brothers, Underworld, Faithless, Massive Attack, and 90s UK rave/dance music culture',
  },
];

export const AiTopicSetup: React.FC<AiTopicSetupProps> = ({ onStartAiQuiz }) => {
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (topicToUse?: string) => {
    const topic = topicToUse || customTopic.trim();
    if (!topic) {
      setErrorMsg('Please enter a custom 90s music topic or choose one of the preset packs below.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    soundEffects.playClick();

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          count: questionCount,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate custom quiz questions.');
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions returned. Please try a different topic.');
      }

      soundEffects.playCorrect();
      onStartAiQuiz(data.questions, topic);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with AI Quiz Generator.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-3 border-black p-6 sm:p-8 mb-8 shadow-neo-lg text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10B981] border-2 border-black text-white text-xs font-black uppercase tracking-wider mb-3 shadow-neo-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          Infinite AI Custom Topic Generator
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight mb-3">
          Create a Custom <span className="underline decoration-[#10B981] decoration-wavy decoration-2">90s Topic Challenge</span>
        </h1>
        <p className="text-black/80 font-bold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Does your wife have a niche obsession with a specific band, album, festival, or subgenre? Enter any custom topic and Gemini will write a dedicated, high-tier quiz instantly.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FF4B4B] border-2 border-black text-white text-sm flex items-start gap-3 shadow-neo">
          <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div>
            <p className="font-black">Generation Error</p>
            <p className="text-xs text-white/90 font-semibold mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo-lg mb-8 space-y-6">
        <div>
          <label className="block text-sm font-black text-black mb-2 flex items-center gap-2">
            <Music className="w-5 h-5 text-[#10B981]" />
            Enter Any 90s Band, Album, or Music Topic
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="ai-topic-input"
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Suede's Dog Man Star album, 1994 Manchester scene, Lilith Fair, 90s One-Hit Wonders..."
              className="flex-1 bg-[#F7F2E8] border-2 border-black rounded-xl px-4 py-3 text-sm font-black text-black placeholder-stone-400 focus:outline-none focus:bg-white"
              disabled={isLoading}
            />
            <button
              id="generate-ai-quiz-btn"
              type="button"
              onClick={() => handleGenerate()}
              disabled={isLoading || !customTopic.trim()}
              className="px-6 py-3 rounded-xl bg-[#FFE600] hover:bg-[#FACC15] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-sm border-2 border-black shadow-neo active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
              {isLoading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>

        {/* Difficulty & Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-black/10">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Difficulty Depth
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#F7F2E8] p-1.5 rounded-xl border-2 border-black">
              {[
                { id: 'easy', label: 'Casual Fan' },
                { id: 'medium', label: 'Britpop Buff' },
                { id: 'hard', label: 'Ultra Expert' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    difficulty === d.id
                      ? 'bg-[#10B981] text-white border-2 border-black shadow-neo-sm'
                      : 'text-black hover:bg-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Question Count
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#F7F2E8] p-1.5 rounded-xl border-2 border-black">
              {[
                { count: 5, label: '5 Quick Qs' },
                { count: 10, label: '10 Questions' },
                { count: 15, label: '15 Questions' },
              ].map((c) => (
                <button
                  key={c.count}
                  type="button"
                  onClick={() => setQuestionCount(c.count)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    questionCount === c.count
                      ? 'bg-[#FFE600] text-black border-2 border-black shadow-neo-sm'
                      : 'text-black hover:bg-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Curated AI Topic Packs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-black flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF4B4B]" />
            Or Launch a Curated AI Topic Pack
          </h2>
          <span className="text-xs font-black text-black/70 bg-white border-2 border-black px-2.5 py-0.5 rounded-full shadow-neo-sm">
            Click to generate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {POPULAR_TOPIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCustomTopic(preset.title);
                handleGenerate(preset.prompt);
              }}
              disabled={isLoading}
              className="p-4 rounded-2xl text-left bg-white hover:bg-[#FFF9DB] border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all flex flex-col justify-between group disabled:opacity-50 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-black text-sm text-black group-hover:text-[#FF4B4B] transition-colors">
                    {preset.title}
                  </h3>
                  <Sparkles className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <p className="text-xs text-black/75 font-semibold line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
