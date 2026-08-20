import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Quiz Generator Endpoint
  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const { topic, difficulty = 'medium', count = 10, existingQuestions = [] } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API is not configured. Please check your GEMINI_API_KEY secret.',
        });
      }

      const prompt = `You are an absolute 90s music and Britpop trivia mastermind and music journalist.
Generate ${count} high-quality, authentic, engaging multiple-choice trivia questions about: "${topic || '90s Britpop and 90s Alternative/Pop Music'}".
Difficulty level: ${difficulty} (e.g. easy, medium, expert / true fan).

Topics should include rich details about Britpop (Oasis, Blur, Pulp, Suede, Supergrass, Elastica, The Verve, Sleeper, Ocean Colour Scene, Cast, Ash, Manic Street Preachers, Radiohead, etc.) and general 90s music (Grunge, Nirvana, TLC, Spice Girls, Daft Punk, Fatboy Slim, Massive Attack, The Prodigy, Alanis Morissette, Beck, Garbage, etc.), iconic lyrics, chart battles (like Blur vs Oasis in August 1995), legendary producers, festival moments (Glastonbury, Knebworth '96), album release years, and music video lore.

Avoid repeating these existing questions or concepts: ${JSON.stringify(existingQuestions.slice(-10))}.

Ensure all options are plausible, and provide a short, fun, fascinating "factoid" / explanation explaining the correct answer.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You generate accurate, entertaining 90s music and Britpop trivia with 4 distinct multiple-choice options, exactly 1 correct answer index (0 to 3), an explanation factoid, and category tags.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: 'The trivia question text.' },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Array of 4 possible answer choices.',
                },
                correctIndex: { type: Type.INTEGER, description: 'The zero-based index (0, 1, 2, or 3) of the correct answer in the options array.' },
                explanation: { type: Type.STRING, description: 'A fun, informative 1-2 sentence trivia factoid explaining why this is correct.' },
                category: { type: Type.STRING, description: 'Category like Britpop Royalty, 90s UK Charts, Lyrics Master, Grunge & Rock, Rave & Dance, or Cool Britannia.' },
                difficulty: { type: Type.STRING, description: 'easy, medium, or hard' },
              },
              required: ['question', 'options', 'correctIndex', 'explanation', 'category', 'difficulty'],
            },
          },
        },
      });

      const responseText = response.text || '[]';
      const parsedQuestions = JSON.parse(responseText);

      // Add unique IDs
      const questionsWithIds = parsedQuestions.map((q: any, idx: number) => ({
        ...q,
        id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      }));

      return res.json({
        questions: questionsWithIds,
      });
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate quiz questions with Gemini.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`90s & Britpop Quiz server running on port ${PORT}`);
  });
}

startServer();
