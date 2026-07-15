import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client to prevent crashing if the key isn't provided yet
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please declare it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes

// 1. AI Tutor Assistant
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { prompt, context, level } = req.body;
    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an elite, encouraging private Spanish tutor. The student's current CEFR level is ${level}.
If the student asks about a concept or requests explanations, provide a highly intuitive, structured, and easy-to-digest answer.
Answer:
- What is it?
- Why does it work?
- When do I use it?
- Provide 2-3 realistic conversational examples in Spanish with English translations.
- Highlight common beginner pitfalls.
Keep your tone warm, professional, and clear. Avoid overly dense textbooks blocks. Use clear headings and bullet points.
Context of what the student is looking at currently: ${context || 'General Spanish inquiry'}.`,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Tutor API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate tutor response.' });
  }
});

// 2. Chat Conversation Partner (Roleplay)
app.post('/api/gemini/converse', async (req, res) => {
  try {
    const { messages, scenario, level } = req.body;
    const ai = getAIClient();

    // Map historical messages to Gemini Parts or text
    // Format conversation history for context
    const historyText = messages
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'You (Partner)'}: ${m.text}`)
      .join('\n');

    const prompt = `Based on the conversation history below, reply as the roleplay partner. Keep your response in character, natural, and adjusted to the student's level (${level}).
Keep your Spanish response between 1 to 3 sentences so it is conversational and not overwhelming.

Scenario Details:
- Title: ${scenario.title}
- Context: ${scenario.context}
- Your Role: ${scenario.aiRole}
- Student's Role: ${scenario.userRole}

Current Conversation History:
${historyText}

Reply by returning a JSON object strictly conforming to the required schema. Ensure you analyze the Student's very last Spanish message in the 'feedback' field to encourage them or gently point out any grammar/spelling errors.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: `Your next response in Spanish, maintaining the persona of ${scenario.aiRole}. Speak naturally but make vocabulary matches clear.`,
            },
            translation: {
              type: Type.STRING,
              description: 'English translation of your Spanish response.',
            },
            feedback: {
              type: Type.STRING,
              description: 'A friendly, constructive feedback or grammatical check of the student\'s last Spanish message. Suggest improvements, vocabulary upgrades, or if they were perfect, say: "¡Excelente! Perfect Spanish."',
            },
          },
          required: ['text', 'translation', 'feedback'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Converse API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to conduct roleplay conversation.' });
  }
});

// 3. Audio Text-To-Speech (Pronunciation Voice)
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    const ai = getAIClient();

    const selectedVoice = voice || 'Kore'; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say clearly in natural Spanish: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio was generated by the model.');
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Spanish speech.' });
  }
});

// 4. Writing Audit
app.post('/api/gemini/audit-writing', async (req, res) => {
  try {
    const { text, level } = req.body;
    const ai = getAIClient();

    const prompt = `Analyze this Spanish text written by a ${level} student. Audit it for spelling, grammar, natural flow, and vocabulary choices.
Text to analyze: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: {
              type: Type.BOOLEAN,
              description: 'True if there are zero errors and the text is entirely natural.',
            },
            explanation: {
              type: Type.STRING,
              description: 'A high-level encouraging summary of the student\'s performance.',
            },
            corrections: {
              type: Type.ARRAY,
              description: 'List of specific structural or spelling changes made.',
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: 'The incorrect segment.' },
                  corrected: { type: Type.STRING, description: 'The corrected version.' },
                  reason: { type: Type.STRING, description: 'Explanation of the grammar rule behind this change.' },
                },
                required: ['original', 'corrected', 'reason'],
              },
            },
            alternatives: {
              type: Type.ARRAY,
              description: '2 natural, native-like alternative ways to express the same core idea.',
              items: { type: Type.STRING },
            },
          },
          required: ['isCorrect', 'explanation', 'corrections', 'alternatives'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Audit Writing API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to audit writing.' });
  }
});

// Setup Vite Dev Server / Static Assets
async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
