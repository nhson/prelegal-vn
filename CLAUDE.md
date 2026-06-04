# Prelegal VN Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 11 document types via AI chat. The AI identifies the document type from conversation, collects the required fields, and populates a live preview in real time. Unsupported document requests are handled gracefully with suggestions for the closest available type.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (KAN-3) — Mutual NDA Prototype
- Next.js frontend with manual NDA form (fill-in fields, live preview, PDF download)
- Standalone prototype, no backend

### Completed (KAN-4) — V1 Foundation
- Docker multi-stage build (node:24-alpine frontend + python:3.12-slim backend)
- FastAPI backend (uv project) with SQLite; DB created fresh on each container start
- Next.js static export (`output: "export"`) served by FastAPI at localhost:8000
- Auth routes with JWT in HttpOnly cookies, bcrypt password hashing, 8-char minimum
- `COOKIE_SECURE` env var to enable Secure flag in production
- Start/stop scripts for Mac, Linux, Windows (`scripts/`)

### Completed (KAN-5) — AI Chat for Mutual NDA
- AI chat panel replaces the manual form; NDA preview updates live as fields are extracted
- LiteLLM via OpenRouter with Cerebras inference (`openrouter/openai/gpt-oss-120b`)
- Structured outputs: each AI turn returns `{reply, fields}` — fields are re-derived from the full conversation history each turn
- Conversation history is client-side (stateless backend); no auth required on chat endpoints
- Security: `role` restricted to `user`/`assistant`, message list capped at 50, content at 8 000 chars

### Completed (KAN-6) — All 11 Document Types
- Document type detection: AI identifies what the user wants from the first message
- 11 supported types: Mutual NDA, Cloud Service Agreement, Design Partner Agreement, SLA, PSA, DPA, Software License, Partnership, Pilot, BAA, AI Addendum
- For Mutual NDA: rich prose preview via existing `generateNDA()` TypeScript template
- For all other types: clean "Cover Page / Key Terms" summary preview via `generateGenericPreview()`
- Unsupported document requests handled gracefully — AI explains and suggests closest match
- Field state resets automatically when user switches document type
- Document type registry in `backend/app/document_catalog.py`; frontend catalog in `frontend/lib/catalog.ts`
- `GET /api/chat/catalog` exposes the full list of supported document types

### Current API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info
- `GET /api/chat/greeting` - Get AI greeting message
- `GET /api/chat/catalog` - List all supported document types
- `POST /api/chat/message` - Send chat message, get AI reply + document type + extracted fields
- `GET /api/health` - Health check