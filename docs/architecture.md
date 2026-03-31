# Architecture — PocketCode AI Mentor

## Overview

The AI Mentor system follows a **three-tier architecture** designed for flexibility, testability, and clean separation of concerns:

1. **Presentation Layer** — Native Android UI (Jetpack Compose via AI Tutor SDK)
2. **Application Layer** — Python FastAPI backend with prompt engineering
3. **AI Layer** — LLM provider (pluggable: OpenAI, Gemini, Claude, or local models)

## Design Decisions

### Why a Backend API (not direct LLM calls from Android)?

1. **API Key Security** — Keys stay server-side, never embedded in the APK
2. **Prompt Engineering** — Complex system prompts can be updated without app releases
3. **Model Flexibility** — Switch between LLM providers without modifying the app
4. **Rate Limiting** — Server controls API usage per student
5. **Analytics** — Track which modes and concepts are most used
6. **Caching** — Common questions can be cached to reduce costs

### Why SSE Streaming (not WebSockets)?

1. **Simpler** — No bidirectional connection needed; the client sends one request and receives a stream
2. **HTTP-native** — Works through proxies and load balancers without special configuration
3. **Auto-reconnect** — SSE has built-in reconnection; WebSockets don't
4. **Sufficient** — For chat, the client sends a message and streams the response; no need for bidirectional communication

### Why Keep the AI Tutor SDK's Intent-Based Approach?

The SDK's Intent-based approach (bridging to installed AI apps like ChatGPT, Gemini) remains as a **fallback path**:
- Works offline or without our custom backend
- Uses the student's existing AI subscriptions
- Zero API cost for the Catrobat project
- Our backend API is the **primary path** for a richer, more controlled experience

## Data Flow

```
Student taps AI Mentor FAB
         │
         ▼
AiMentorHelper.launchMentor()
  ├── Serializes current Script/Sprite/Project into text
  ├── Captures any runtime errors
  └── Launches AiMentorActivity with Intent extras
         │
         ▼
AiMentorActivity (Compose)
  ├── Displays AiTutorView from SDK
  ├── Student types question
  └── Posts to /api/mentor/stream
         │
         ▼
FastAPI Backend
  ├── Constructs system prompt (Catrobat-specialized)
  ├── Appends mode-specific instructions
  ├── Adds student level context
  ├── Includes code context + errors
  └── Calls LLM via streaming API
         │
         ▼
SSE Stream → tokens rendered in real-time in AiTutorView
```

## Prompt Engineering Strategy

The system prompt is layered:

1. **Base Prompt** — Establishes the AI as a Catrobat expert mentor
2. **Mode Augmentation** — Adds specific instructions per mode (explain, debug, etc.)
3. **Student Level** — Adjusts language complexity (beginner → advanced)
4. **Context Injection** — Appends code, errors, and project context from PocketCode

This layered approach ensures:
- Consistent personality across all interactions
- Specialized behavior per mode
- Appropriate complexity per student level
- Grounded, specific answers based on actual code context

## Security Considerations

- API keys stored in environment variables, never in code
- CORS restricted to known origins in production
- Rate limiting per client IP (to be implemented with a middleware)
- No PII stored; conversation history is ephemeral (client-side only)
- Project XML is truncated to prevent prompt injection attacks via oversized context
