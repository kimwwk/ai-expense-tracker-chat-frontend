# LangGraph chat architecture

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/kimsing-ais-projects/v0-lang-graph-chat-architecture)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/rLUz501f5R7)

## Why I built this

Not AI as a chat bubble, but as the thing that **drives the UI**. An expense tracker as the testbed:

- talk in plain language → the agent picks the tools and renders the widgets 📊
- every write goes through an explicit **changeset review** — no silent edits 🔁
- the point isn't "chatbot for money," it's the interface pattern

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Backend modes (mock vs. real)

The chat assistant calls a backend API for all financial data. To keep the app
fully functional without standing up the `ai-expense-tracker-service`, it ships
with a built-in, in-memory **mock backend** (`lib/api/mock/`) that returns
realistic data in the same shapes as the real service.

- **Mock mode (default):** every API call is served from memory, so the demo
  works on Vercel with zero infrastructure. Reads are always consistent; writes
  persist for the life of a warm serverless instance (see the note in
  `lib/api/mock/router.ts`).
- **Real mode:** set `NEXT_PUBLIC_USE_MOCK_API=false` and point
  `NEXT_PUBLIC_API_BASE_URL` at a deployed backend.

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_USE_MOCK_API` | `true` | `true`/unset → mock; `false` → real backend |
| `NEXT_PUBLIC_API_BASE_URL` | — | Real backend URL (used only when mock is off) |
| `OPENAI_API_KEY` | — | Server-side LLM access for the chat route |

> `NEXT_PUBLIC_*` values are inlined at build time — change them in Vercel and
> **redeploy** for the change to take effect. See `.env.example`.

## Deployment

Your project is live at:

**[https://vercel.com/kimsing-ais-projects/v0-lang-graph-chat-architecture](https://vercel.com/kimsing-ais-projects/v0-lang-graph-chat-architecture)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/rLUz501f5R7](https://v0.app/chat/rLUz501f5R7)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
