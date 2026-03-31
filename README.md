# PocketCode AI Mentor — Proof of Concept

> **GSoC 2026** | Catrobat Organization | AI Mentor for PocketCode Students

An integrated AI-powered mentor for [PocketCode](https://catrobat.org) that understands a student's programming context and provides real-time guidance to enhance learning and coding skills.

![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Kotlin](https://img.shields.io/badge/Kotlin-KMP-orange)
![Python](https://img.shields.io/badge/Python-FastAPI-green)
![Status](https://img.shields.io/badge/status-PoC-yellow)

---

## 🎯 Project Overview

This project extends the existing [Catrobat AI Tutor SDK](https://github.com/Catrobat/catrobat-ai-tutor) by integrating it deeply into PocketCode with a backend AI engine. The mentor provides:

| Mode | Description |
|------|-------------|
| 📖 **Explain** | Explains programming concepts (variables, loops, design patterns) at the student's level |
| 🐛 **Debug** | Analyzes code context and errors to identify and fix bugs |
| 💡 **Suggest** | Generates clean Catrobat code from text prompts |
| 🌐 **Translate** | Explains downloaded community projects in simple terms |
| ⚡ **Ideas** | Proposes project ideas matched to skill level |
| 💬 **General** | Free-form programming Q&A |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              PocketCode App                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Script   │ │  Formula │ │   Stage      │ │
│  │  Editor   │ │  Editor  │ │   Runner     │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │              │          │
│       └─────────────┼──────────────┘          │
│                     │ Code Context + Errors   │
│              ┌──────▼──────┐                  │
│              │ AiMentor    │                  │
│              │ Helper      │                  │
│              └──────┬──────┘                  │
└─────────────────────┼────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │   AI Tutor SDK (KMP)    │
         │  AiTutorView, FAB,     │
         │  Prompt Builder         │
         └────────────┬────────────┘
                      │ Intent / HTTP
         ┌────────────▼────────────┐
         │  AI Backend (FastAPI)   │
         │  /api/mentor/chat       │
         │  /api/mentor/stream     │
         │  /api/mentor/analyze    │
         └────────────┬────────────┘
                      │ LLM API
         ┌────────────▼────────────┐
         │  LLM Provider           │
         │  (OpenAI / Gemini /     │
         │   Claude / Local LLM)   │
         └─────────────────────────┘
```

---

## 📂 Project Structure

```
pocketcode-ai-mentor/
├── backend/                        # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Environment config & system prompt
│   │   ├── models.py             # Pydantic request/response schemas
│   │   ├── mentor.py             # Core AI logic & prompt engineering
│   │   └── main.py               # FastAPI app & endpoints
│   └── requirements.txt
│
├── kotlin-integration/            # Android/Kotlin integration code
│   └── src/main/kotlin/org/catrobat/catroid/ui/aimentor/
│       ├── AiMentorActivity.kt   # Compose Activity using the SDK
│       ├── AiMentorHelper.kt     # Context extraction helper
│       └── IntegrationPoints.kt  # Where to wire into PocketCode
│
├── frontend/                      # Web-based interactive demo
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
│
├── docs/                          # Documentation
│   └── architecture.md
│
└── README.md
```

---

## 🚀 Quick Start

### 1. Frontend Demo (No backend needed)

```bash
cd frontend
# Open index.html in your browser, or:
python3 -m http.server 3000
# Visit http://localhost:3000
```

The demo includes **simulated AI responses** that showcase all 6 mentor modes.

### 2. Backend Server

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
export OPENAI_API_KEY="your-api-key-here"

# Run the server
uvicorn app.main:app --reload --port 8000
```

API documentation at: `http://localhost:8000/docs`

### 3. Connect Frontend to Backend

In `frontend/js/app.js`, set:
```javascript
const USE_BACKEND = true;
```

---

## 🔌 PocketCode Integration

### Step 1: Add the AI Tutor SDK dependency

```kotlin
// build.gradle.kts (app-level)
dependencies {
    implementation("org.catrobat:ai-tutor:<latest-version>")
}
```

### Step 2: Initialize in Application class

```kotlin
// CatroidApplication.kt
import org.catrobat.aitutor.AiTutorInitializer

class CatroidApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AiTutorInitializer.init(this)
    }
}
```

### Step 3: Add the AI Mentor button

```kotlin
// In ScriptActivity or SpriteActivity
AiMentorHelper.launchMentor(
    context = this,
    project = ProjectManager.getInstance().currentProject,
    sprite = ProjectManager.getInstance().currentSprite,
    script = currentScript,
    compilerErrors = lastError
)
```

See [`IntegrationPoints.kt`](kotlin-integration/src/main/kotlin/org/catrobat/catroid/ui/aimentor/IntegrationPoints.kt) for comprehensive integration documentation.

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/mentor/chat` | Send message, get response |
| `POST` | `/api/mentor/stream` | Stream response via SSE |
| `POST` | `/api/mentor/analyze` | Analyze project XML |

### Example Request

```bash
curl -X POST http://localhost:8000/api/mentor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I make a sprite jump?",
    "mode": "suggest",
    "student_level": "beginner",
    "code_context": "When green flag clicked\n  Forever\n    Move 5 steps\n  End"
  }'
```

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| SDK | Kotlin Multiplatform | Native Android UI & AI app detection |
| Backend | Python / FastAPI | REST + SSE streaming API |
| AI UI | Jetpack Compose | Material3 mentor dialog |
| LLM | OpenAI / Gemini / Local | Language model inference |
| Streaming | Server-Sent Events | Real-time token output |
| Demo | HTML / CSS / JavaScript | Interactive web showcase |

---

## 📋 GSoC Timeline (Proposed)

*(Based on a 350-hour project / ~10 weeks of coding)*

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Community Bonding** | Pre-Coding | Study PocketCode codebase, set up dev environment, finalize API design |
| **Phase 1: Backend** | Weeks 1-3 | Backend API (chat, streaming, project analysis), prompt engineering |
| **Phase 2: Integration** | Weeks 4-6 | Kotlin integration into PocketCode, SDK wiring, UI implementation |
| **Phase 3: Refinement** | Weeks 7-8 | Testing, user feedback loops, documentation |
| **Final Polish** | Weeks 9-10 | Performance optimization, deployment, final GSoC report |

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** — see [LICENSE](LICENSE) for details.

Part of the [Catrobat](https://catrobat.org) ecosystem.
