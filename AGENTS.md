# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EchoMind is a mental wellbeing AI application with:
- **Frontend**: Next.js 16 (App Router) with Firebase Authentication
- **Backend**: FastAPI with SambaNova LLM integration
- **Deployment**: Modal (serverless), Vercel (frontend), or Fly.io (optional backend)
- **Database**: Firebase Firestore for user profiles and quota tracking
- **Safety**: Multi-layer safety pipeline for crisis detection and response filtering

## Architecture

### Dual Backend Setup

The project has **two backend entry points**:

1. **`backend/app/main.py`** - Standard FastAPI app for local dev and traditional deployments (Fly.io, Railway, Render)
2. **`modal_app.py`** - Modal serverless deployment wrapper that imports from `backend/app/`

Both share the same core logic from `backend/app/`. When modifying backend code, changes apply to both deployment modes.

### Request Flow

1. **Frontend** → User authenticates via Firebase Auth → Obtains ID token
2. **Backend** → Verifies Firebase ID token → Checks email verification
3. **Quota Check** → Firestore transaction reserves one message from user's quota (default 25/user)
4. **Safety Pipeline**:
   - **Input assessment**: Detects crisis patterns (suicide, self-harm, abuse)
   - **LLM call**: If safe, sends to SambaNova with system prompt from `backend/app/prompts/therapist.txt`
   - **Output assessment**: Filters diagnoses, harm instructions, absolutist claims
5. **Response** → Returns filtered/safe reply or crisis intervention message

### Authentication & Authorization

- Firebase ID tokens required for all authenticated endpoints (`/chat`, `/me`, `/users`, `/usage`)
- Email verification enforced in `backend/app/auth.py:_verify_id_token`
- Rate limiting keys use hashed Firebase UID (when authenticated) or IP address (fallback)
- User quota enforced via Firestore transactional updates

### CORS Configuration

CORS is **environment-aware** and **credential-safe**:
- **Development**: Allows `http://localhost:3000`, `http://127.0.0.1:3000`
- **Production**: Only HTTPS origins + Vercel preview URLs (`https://*.vercel.app`)
- **No wildcards** with `allow_credentials=True` to prevent token leakage
- Custom middleware in `backend/app/core/cors.py` validates origins before CORSMiddleware

### Rate Limiting

- Global: 60 requests/minute per IP
- `/chat`, `/models`: 10 requests/minute per hashed UID
- `/users`, `/me`, `/usage`: 20 requests/minute per hashed UID
- Uses `slowapi` with custom key function `uid_limit_key` in `backend/app/core/rate_limit.py`

## Common Commands

### Backend (Local Development)

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Create .env.local with required variables (see backend/.env.example)
# Required: SAMBANOVA_API_KEY, SAMBANOVA_API_BASE, SAMBANOVA_MODEL

# Run FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Local Development)

```bash
# Install dependencies
cd frontend
npm install

# Create .env.local with Firebase config
# Required: NEXT_PUBLIC_FIREBASE_* variables and NEXT_PUBLIC_API_BASE

# Run Next.js development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Modal Deployment

```bash
# Deploy to Modal (from project root)
modal deploy modal_app.py

# Set Modal secrets (one-time setup)
modal secret create firebase-service-account FIREBASE_CREDENTIALS_JSON="..."
modal secret create sambanova-api-key SAMBANOVA_API_KEY="..." SAMBANOVA_API_BASE="..." SAMBANOVA_MODEL="..."
```

### Testing Backend Components

```bash
# Test SambaNova client directly
cd backend
python -m app.llm.sambanova
```

## Environment Variables

### Backend (Required in Production)

- `SAMBANOVA_API_KEY`: SambaNova API key
- `SAMBANOVA_API_BASE`: SambaNova API endpoint (default: https://api.sambanova.ai)
- `SAMBANOVA_MODEL`: Model identifier
- `FIREBASE_CREDENTIALS_JSON`: Firebase Admin SDK JSON as string (required in production)
- `LOG_HASH_SALT`: Salt for hashing UIDs in logs (required in production)
- `ENV`: `development` or `production` (affects CORS behavior)

### Backend (Optional)

- `FRONTEND_ORIGIN`: Single allowed frontend origin (e.g., `https://echomind.vercel.app`)
- `FRONTEND_ORIGINS`: Comma-separated list of allowed origins
- `ALLOWED_MODELS`: Comma-separated list of allowed SambaNova models (defaults to `SAMBANOVA_MODEL`)
- `REQUEST_TIMEOUT`: HTTP client timeout in seconds (default: 30.0)

### Frontend (Required)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_API_BASE`: Backend URL (e.g., `http://localhost:8000` for local dev)

## Code Structure

### Backend (`backend/app/`)

- **`main.py`**: FastAPI app initialization, middleware registration, router inclusion
- **`settings.py`**: Pydantic settings with environment variable parsing
- **`auth.py`**: Firebase token verification, email verification check, UID hashing for logs
- **`db.py`**: Firestore client initialization
- **`schemas.py`**: Pydantic models for request/response validation
- **`api/`**: Route handlers
  - `chat.py`: `/chat` (LLM chat) and `/models` (list allowed models)
  - `users.py`: `/users` (create profile), `/me` (get profile)
  - `usage.py`: `/usage` (quota status)
  - `health.py`: `/health` (health check)
- **`llm/`**: LLM client implementations
  - `base.py`: Abstract base class
  - `sambanova.py`: SambaNova API client with OpenAI-compatible chat completions
- **`safety/`**: Content moderation
  - `pipeline.py`: Input/output assessment with regex-based pattern matching
  - `rules.py`: Legacy safety rules (superseded by pipeline.py)
- **`core/`**: Cross-cutting concerns
  - `cors.py`: Environment-aware CORS with Vercel preview support
  - `rate_limit.py`: Rate limiting configuration
  - `logging.py`: Request logging middleware
- **`prompts/`**: System prompts for LLM
  - `therapist.txt`: Empathetic wellbeing guide prompt (no diagnoses, no harm instructions)

### Frontend (`frontend/`)

- **`app/`**: Next.js App Router pages and layouts
  - `page.js`: Landing page
  - `chat/page.js`: Chat interface
  - `login/page.js`, `signup/page.js`: Authentication pages
  - `complete-profile/page.js`: Post-signup profile creation
  - `account/page.js`: User account dashboard
  - `privacy/page.js`, `terms/page.js`, `disclaimer/page.js`: Legal pages
  - `layout.js`: Root layout with providers
  - `providers.jsx`: Context providers wrapper
  - `context/user-context.jsx`: User state management with sessionStorage caching
- **`lib/`**: Utilities
  - `firebase.js`: Firebase initialization
  - `apiBase.js`: API base URL resolution
- **`components/ui/`**: shadcn/ui components (Button, Input, Label, Select, etc.)

### Modal Deployment (`modal_app.py`)

- Wraps FastAPI app for Modal serverless deployment
- Uses Modal `Image` to install dependencies and copy `backend/` directory
- Implements `run_llm.remote()` function for serverless LLM calls
- Synchronous endpoint wrappers that call async handlers
- System prompt loaded from `backend/app/prompts/therapist.txt`

## Safety Guidelines

### Content Moderation Patterns

The safety pipeline (`backend/app/safety/pipeline.py`) detects:

**Crisis (immediate intervention):**
- Self-harm keywords: suicide, kill myself, end my life, self-harm, overdose, want to die
- Response: Crisis intervention message with 988 (US) and local emergency guidance

**High Risk (safety response):**
- Abuse patterns: assault, abuse, rape, domestic violence
- Response: Safety support message with emergency contact guidance

**Output Filtering (prevent unsafe AI responses):**
- Diagnosis claims: "you have depression", "you're bipolar"
- Harm instructions: "how to self-harm", "steps to suicide"
- Absolutist claims: "guarantee", "will cure", "always", "never"

### Modifying Safety Rules

When updating safety patterns:
1. Edit patterns in `backend/app/safety/pipeline.py`
2. Test with edge cases (false positives, legitimate support-seeking messages)
3. Safety responses should be **empathetic**, **non-judgmental**, and **actionable**
4. Never block genuine support requests (e.g., "I feel suicidal" should trigger help, not block access)

## Firebase Key Rotation

Automated weekly via `.github/workflows/rotate-firebase-key.yml`:
- Creates new Firebase Admin service account key
- Updates Modal secret `firebase-service-account`
- Optionally updates Fly.io secrets (if `FLY_API_TOKEN` set)
- Script: `scripts/rotate_firebase_key.sh`

Required GitHub secrets:
- `GOOGLE_PROJECT_ID`, `GOOGLE_CI_SA_KEY`, `FIREBASE_SA_EMAIL`
- `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET` (for Modal updates)
- `FLY_API_TOKEN`, `FLY_APP_NAME` (optional, for Fly.io)

## Deployment

### Frontend (Vercel)

1. Connect repository to Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variables (all `NEXT_PUBLIC_*` variables)
4. Deploy automatically on push to main

### Backend (Modal - Recommended)

1. Install Modal CLI: `pip install modal`
2. Authenticate: `modal token new`
3. Create secrets (see Modal Deployment commands above)
4. Deploy: `modal deploy modal_app.py`
5. Use Modal endpoint URL as `NEXT_PUBLIC_API_BASE` in Vercel

### Backend (Traditional - Fly.io/Railway/Render)

1. Use `backend/Dockerfile` for containerized deployment
2. Set all required environment variables in platform
3. Deploy via CLI or GitHub integration
4. Use deployment URL as `NEXT_PUBLIC_API_BASE` in Vercel

## Important Notes

- **No tests currently exist** - when adding features, consider writing tests with `pytest` (backend) or `jest` (frontend)
- **System prompt** (`backend/app/prompts/therapist.txt`) defines AI behavior - changes affect all conversations
- **User quota** is enforced via Firestore transactions to prevent race conditions
- **CORS configuration** is security-critical - never use wildcard origins with credentials
- **This is not a replacement for professional mental health services** - clearly communicated in UI and responses
