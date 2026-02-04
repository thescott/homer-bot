# Homer Bot

## Overview
A chat bot that connects to OpenAI ChatGPT and exclusively discusses the best donut shops in your area. Built for a local meetup demo showcasing vibe coded apps.

## Tech Stack
- Frontend: React with Vite
- Styling: Tailwind CSS
- Backend: Node.js/Express
- AI: OpenAI ChatGPT API
- Observability: Datadog (LLM Observability, APM, Logs, RUM)
- Version Control: GitHub

## Project Structure
```
homer-bot/
├── client/          # React frontend
├── server/          # Express backend
└── CLAUDE.md
```

## Development

### Setup
```bash
npm install
```

### Environment Variables
Create a `.env` file in the server directory:
```
OPENAI_API_KEY=your_api_key_here
DD_API_KEY=your_datadog_api_key
DD_SITE=datadoghq.com
DD_SERVICE=homer-bot
DD_ENV=development
```

### Running Locally
```bash
npm run dev
```

## Observability

### Datadog Integration
- **LLM Observability**: Track ChatGPT API calls, token usage, latency, and prompt/response pairs
- **APM**: Distributed tracing for backend requests
- **Logs**: Centralized logging with correlation to traces
- **RUM (Real User Monitoring)**: Frontend performance and user session tracking

## Git Workflow
- Main branch: `main`
- Feature branches: `feature/<feature-name>`
- Commits should be descriptive and atomic

## Key Features
- Simple, clean chat interface
- OpenAI ChatGPT integration
- System prompt constrains conversation to donut shop recommendations
- Location-aware donut shop suggestions
- Full observability with Datadog
