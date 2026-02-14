# Homer Bot

A chat bot that connects to OpenAI ChatGPT and exclusively discusses the best donut shops in your area. Built for a local meetup demo showcasing vibe coded apps.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- npm (included with Node.js)
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd homer-bot
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for both the `client/` and `server/` directories.

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

### 4. Run the app

```bash
npm run dev
```

This starts both the React frontend and Express backend concurrently:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

## Running with Docker

If you'd prefer to run everything in containers (includes the Datadog agent for observability):

### 1. Set environment variables

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_api_key_here
DD_API_KEY=your_datadog_api_key
```

### 2. Start the containers

```bash
docker compose up --build
```

This starts three services:
- **client** on port 5173
- **server** on port 3001
- **datadog-agent** for APM, logs, and LLM observability

## Datadog Observability (Optional)

To enable Datadog locally (without Docker), add these to `server/.env`:

```
DD_API_KEY=your_datadog_api_key
DD_SITE=datadoghq.com
DD_SERVICE=homer-bot
DD_ENV=development
```

Features include:
- **LLM Observability** - ChatGPT API call tracking, token usage, and prompt/response pairs
- **APM** - Distributed tracing for backend requests
- **Logs** - Centralized logging with trace correlation
- **RUM** - Frontend performance and user session tracking

## Project Structure

```
homer-bot/
├── client/              # React + Vite frontend
├── server/              # Express backend
├── docker-compose.yml   # Docker setup with Datadog agent
└── CLAUDE.md            # AI assistant instructions
```
