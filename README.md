# Prelegal

AI-powered legal document creator. Chat with an AI assistant to create, fill in, and download professional legal agreements in minutes.

## What it does

- **11 document types**: Mutual NDA, Cloud Service Agreement, Design Partner Agreement, Service Level Agreement, Professional Services Agreement, Data Processing Agreement, Software License Agreement, Partnership Agreement, Pilot Agreement, Business Associate Agreement, AI Addendum
- **AI chat interface**: Describe what you need — the AI asks the right questions, extracts field values, and populates a live document preview
- **Multi-user**: Sign up and sign in to save documents to your account and load them later
- **PDF export**: Download any completed document as a formatted A4 PDF
- **Graceful fallbacks**: If you ask for an unsupported document type, the AI suggests the closest alternative

## Tech stack

- **Frontend**: Next.js (static export), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLite, SQLAlchemy
- **AI**: LiteLLM → OpenRouter → Cerebras inference (`openai/gpt-oss-120b`) with structured outputs
- **Auth**: JWT in HttpOnly cookies, bcrypt password hashing
- **Packaging**: Docker (multi-stage build), with start/stop scripts for Mac, Linux, and Windows

## Running locally

Requires Docker Desktop.

1. Copy `.env.example` to `.env` and fill in your keys:
   ```
   OPENROUTER_API_KEY=your-key
   SECRET_KEY=your-secret   # generate with: openssl rand -hex 32
   ```

2. Start:
   ```bash
   # Mac / Linux
   bash scripts/start-mac.sh
   bash scripts/start-linux.sh

   # Windows
   .\scripts\start-windows.ps1
   ```

3. Open [http://localhost:8000](http://localhost:8000)

4. Stop:
   ```bash
   bash scripts/stop-mac.sh
   ```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/signin` | — | Sign in |
| POST | `/api/auth/signout` | — | Sign out |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/chat/greeting` | — | AI greeting |
| GET | `/api/chat/catalog` | — | Supported document types |
| POST | `/api/chat/message` | — | Send message, get AI reply + fields |
| GET | `/api/documents` | ✓ | List saved documents |
| POST | `/api/documents` | ✓ | Save document |
| GET | `/api/documents/{id}` | ✓ | Get document |
| PUT | `/api/documents/{id}` | ✓ | Update document |
| DELETE | `/api/documents/{id}` | ✓ | Delete document |
| GET | `/api/health` | — | Health check |

## License

[MIT](LICENSE)
