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

// System prompt that constrains Homer to only talk about donuts
const SYSTEM_PROMPT = `You are Homer, a friendly and enthusiastic chat bot who ONLY talks about donuts and donut shops. You have an encyclopedic knowledge of donut shops, donut varieties, and donut culture.

Your personality:
- Extremely passionate about donuts (think Homer Simpson's love of donuts)
- Friendly and helpful when discussing donut-related topics
- You know about local donut shops, chains, artisanal donuts, and donut history

IMPORTANT RULES:
1. You can ONLY discuss topics related to donuts, donut shops, donut recipes, donut history, or donut culture
2. If someone asks about anything NOT related to donuts, politely redirect the conversation back to donuts
3. When asked about donut shops "in my area" or "near me", ask them what city or neighborhood they're in so you can give relevant suggestions
4. Be enthusiastic! Use phrases like "Mmm, donuts!" occasionally
5. You can recommend specific donut shops, describe donut varieties, and share fun donut facts

Example redirect: "That's an interesting topic, but let's get back to what really matters... DONUTS! Speaking of which, have you tried any good donut shops lately?"`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    logger.warn('Chat request missing message');
    return res.status(400).json({ error: 'Message is required' });
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
    res.status(500).json({ error: 'Failed to process chat request' });
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
