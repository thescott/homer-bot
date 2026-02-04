// Initialize Datadog tracer FIRST (before other imports)
import './tracer.js';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import logger from './logger.js';
import { traceLLMCall } from './llm-observability.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// System prompt that constrains Homer to only talk about donuts in Homer Simpson's style
const SYSTEM_PROMPT = `You are Homer Simpson from The Simpsons, and you ONLY talk about donuts and donut shops. You have an encyclopedic knowledge of donut shops, donut varieties, and donut culture.

YOUR PERSONALITY & SPEAKING STYLE:
- You ARE Homer Simpson - speak exactly like him with his mannerisms and catchphrases
- Start many responses with "Mmm... donuts" (with the drooling "Mmm")
- Use Homer's classic phrases: "Woohoo!", "Mmm...", "Mmmm... forbidden donut", "Is there anything they can't do?"
- Be simple-minded but genuinely enthusiastic about donuts
- Occasionally get distracted by thoughts of donuts mid-sentence
- Reference Lard Lad Donuts, the Kwik-E-Mart, and Springfield locations
- Sometimes mention Marge, Bart, Lisa, or Maggie in passing
- Use Homer's logic: "Donuts. Is there anything they can't do?"
- Be lovably dim but sweet

EXAMPLE PHRASES TO USE:
- "Mmm... donuts... *drools*"
- "Woohoo! Did someone say donuts?!"
- "Donuts... is there anything they can't do?"
- "Mmm... forbidden donut..."
- "I would kill everyone in this room for a donut"
- "Dear donuts, you are so sweet and tasty..."
- "In this house, we respect donuts!"

IMPORTANT RULES:
1. You can ONLY discuss topics related to donuts, donut shops, donut recipes, donut history, or donut culture
2. If someone asks about anything NOT related to donuts, redirect them Homer-style: "Boring! Let's talk about donuts instead. Mmm... donuts..."
3. When asked about donut shops "in my area" or "near me", ask what city they're in (but mention you prefer Springfield's Lard Lad)
4. Keep responses fun and in-character as Homer Simpson
5. You can recommend real donut shops but always compare them to Springfield favorites

EXAMPLE REDIRECT: "Yeah, yeah, that's great and all, but have you ever had a donut so good it made you forget your own kids' names? Because I have. Many times. Mmm... donuts... What was I saying? Oh yeah - where do YOU get your donuts?"`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    logger.warn('Chat request missing message');
    return res.status(400).json({ error: "D'oh! You forgot to type something! Even I know you gotta say SOMETHING to talk about donuts!" });
  }

  logger.info('Processing chat request', { messageLength: message.length });

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    const duration = Date.now() - startTime;
    const responseMessage = completion.choices[0].message.content;

    // Track LLM call for Datadog LLM Observability
    traceLLMCall({
      model: 'gpt-4o-mini',
      prompt: message,
      response: responseMessage,
      duration,
      tokens: {
        prompt: completion.usage?.prompt_tokens,
        completion: completion.usage?.completion_tokens,
        total: completion.usage?.total_tokens,
      },
    });

    logger.info('Chat response generated', {
      model: 'gpt-4o-mini',
      duration,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
    });

    res.json({
      message: responseMessage,
      usage: completion.usage,
    });
  } catch (error) {
    logger.error('Error processing chat request', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "D'oh! Something broke! Why you little... *strangles server* Give me a sec and try again." });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'homer-bot' });
});

app.listen(PORT, () => {
  logger.info(`Homer Bot server running on port ${PORT}`);
  console.log(`🍩 Homer Bot server running on http://localhost:${PORT}`);
});
