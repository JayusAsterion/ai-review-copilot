# Valra

AI-powered code review copilot for safer pull requests.

Valra is a local-first AI code review copilot for safer pull requests. It helps developers and QA teams review code, generate bug reports, and create test cases using local Ollama models and optional Azure DevOps integration.

This project is currently in MVP development.

## Demo

Try the hosted review workflow:

```text
https://ai-review-copilot.vercel.app/review
```

## Features

- Code review from PR diffs
- QA context input for tickets, expected behavior, environments, and notes
- File upload support for common code and text formats
- Local Ollama provider
- Static analysis and heuristic checks
- Markdown copy and export
- Planned: cloud AI provider support

## Architecture

The Next.js app runs the frontend and lightweight backend/API routes. Local-first AI review is intentionally handled in the browser: the browser calls the user's local Ollama server directly at `http://localhost:11434`.

This matters because `localhost:11434` must refer to the user's own machine. A Vercel or Next.js backend should not try to call the user's local Ollama instance, because backend `localhost` would refer to the deployment server, not the user's computer.

```text
User Browser
  -> Next.js App
  -> Local Ollama at http://localhost:11434
```

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- Git
- Optional: NVIDIA GPU with Docker GPU support

## Install the Next.js App

```bash
git clone <repo-url>
cd ai-review-copilot
npm install
cp .env.example .env.local
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

The code review workflow is available at:

```text
http://localhost:3000/review
```

## Environment Variables

Example `.env.local`:

```env
NEXT_PUBLIC_DEFAULT_OLLAMA_URL=http://localhost:11434
NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL=qwen3-coder:30b

NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0

DATABASE_URL="postgresql://ai_review_user:ai_review_password@localhost:5432/ai_review_copilot?schema=public"

TOKEN_ENCRYPTION_SECRET=
```

Cloud provider keys may exist in the template for future work, but cloud AI review is planned and not implemented in the current MVP.

`TOKEN_ENCRYPTION_SECRET` is required to encrypt OAuth `access_token`, `refresh_token`, and `id_token` values before they are stored in PostgreSQL. Generate a 32-byte base64 secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Keep `.env.local` private and never commit it. Existing plaintext OAuth tokens from earlier local testing are still readable for compatibility; sign out and sign in again after setting `TOKEN_ENCRYPTION_SECRET` so newly returned provider tokens are stored encrypted.

To encrypt existing OAuth token values from earlier local logins without deleting accounts or sessions, run:

```bash
npm run tokens:encrypt-existing
```

Microsoft Entra redirect URIs:

```text
http://localhost:3000/api/auth/callback/azure-ad
https://ai-review-copilot.vercel.app/api/auth/callback/azure-ad
```

For Vercel production, set `NEXTAUTH_URL`, `AUTH_SECRET`, the Microsoft Entra variables, `DATABASE_URL`, and `TOKEN_ENCRYPTION_SECRET` in Vercel Environment Variables. Use a cloud PostgreSQL provider such as Neon, Prisma Postgres, or Supabase.

## Local PostgreSQL and Prisma

PostgreSQL is expected to run locally through Docker. This repository includes `docker/docker-compose.postgres.yml` for the local database.

Apply the Prisma auth schema:

```bash
npx prisma generate
npx prisma migrate dev --name init_auth_persistence
npm run dev
```

The initial schema persists NextAuth users, OAuth accounts, database sessions, verification tokens, and minimal future Azure DevOps connection metadata. It does not store Azure DevOps access tokens or implement Azure DevOps API calls.

OAuth provider tokens stored by NextAuth in the `Account` table are encrypted at rest with `TOKEN_ENCRYPTION_SECRET`.

## Run Ollama with Docker (CPU)

Create `docker-compose.yml`:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ai-review-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app
      - OLLAMA_KEEP_ALIVE=30m
    restart: unless-stopped

volumes:
  ollama_data:
```

Start and verify Ollama:

```bash
docker compose up -d
docker ps
curl http://localhost:11434/api/tags
```

This repository also includes the CPU compose file at `docker/docker-compose.yml`.

## Install Ollama Models

Recommended powerful model:

```bash
docker exec -it ai-review-ollama ollama pull qwen3-coder:30b
```

Lighter alternatives:

```bash
docker exec -it ai-review-ollama ollama pull qwen2.5-coder:7b
docker exec -it ai-review-ollama ollama pull qwen2.5-coder:14b
```

`qwen3-coder:30b` is recommended for more powerful code review. `qwen2.5-coder:7b` is lighter and better for less powerful machines. Larger models require more RAM/VRAM and may be slower on CPU.

## Test Ollama

List installed models:

```bash
docker exec -it ai-review-ollama ollama list
```

Run the recommended model interactively:

```bash
docker exec -it ai-review-ollama ollama run qwen3-coder:30b
```

Test the chat API:

```bash
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-coder:30b",
    "messages": [
      {
        "role": "user",
        "content": "Review this React code and return 3 practical code review comments: const Button = (props:any) => <button>{props.label}</button>"
      }
    ],
    "stream": false
  }'
```

## Testing Ollama Integration

Use this checklist for the first real end-to-end local Ollama test:

```bash
docker compose -f docker-compose.gpu.yml up -d
docker exec -it ai-review-ollama ollama list
docker exec -it ai-review-ollama ollama pull qwen3-coder:30b
curl http://localhost:11434/api/tags
npm run dev
```

Then:

1. Open `http://localhost:3000/review`.
2. Select Local Ollama.
3. Use Base URL `http://localhost:11434`.
4. Use Model `qwen3-coder:30b`.
5. Click Test Connection.
6. Click Load sample review.
7. Click Analyze.

## Run Ollama with Docker and NVIDIA GPU

This setup is optional and requires:

- NVIDIA GPU
- Docker Desktop with WSL2 backend on Windows, or Docker on Linux
- NVIDIA Container Toolkit or Docker GPU support properly configured

Create `docker-compose.gpu.yml`:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ai-review-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app
      - OLLAMA_KEEP_ALIVE=30m
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  ollama_data:
```

Start Ollama with GPU support:

```bash
docker compose -f docker-compose.gpu.yml up -d
```

Verify GPU access inside the container:

```bash
docker exec -it ai-review-ollama nvidia-smi
```

If `nvidia-smi` fails inside the container, Docker GPU support is not configured correctly.

This repository also includes the GPU compose file at `docker/docker-compose.gpu.yml`.

## CORS Notes

Because the web app calls Ollama from the browser, Ollama must allow the app origin.

```yaml
environment:
  - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app
```

If the app is deployed to a custom Vercel domain, add that domain to `OLLAMA_ORIGINS`.

## Fixing Ollama CORS for Vercel

When the app is deployed to Vercel, the user's browser still calls the user's local Ollama instance directly. Ollama must allow the exact frontend origin that is making the browser request.

The default Docker Compose files allow local development and Vercel preview domains:

```yaml
environment:
  - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app
```

For a Vercel production deployment, users may need to add the exact production domain to `OLLAMA_ORIGINS`, for example:

```yaml
environment:
  - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app,https://ai-review-copilot.vercel.app
```

After changing `OLLAMA_ORIGINS`, restart the Docker container.

CPU setup:

```bash
docker compose down
docker compose up -d
```

NVIDIA GPU setup:

```bash
docker compose -f docker-compose.gpu.yml down
docker compose -f docker-compose.gpu.yml up -d
```

Do not use `OLLAMA_ORIGINS=*` except temporarily for debugging. It allows any website to call the local Ollama server from the browser.

## Common Docker Commands

```bash
docker compose up -d
docker compose down
docker compose down -v
docker logs -f ai-review-ollama
docker exec -it ai-review-ollama ollama list
docker exec -it ai-review-ollama ollama stop qwen3-coder:30b
```

## Usage Flow

1. Start Ollama with Docker.
2. Pull the selected model.
3. Start the Next.js app.
4. Open `http://localhost:3000/review`.
5. Set provider to Local Ollama.
6. Use Base URL `http://localhost:11434`.
7. Use Model `qwen3-coder:30b`.
8. Click Test Connection.
9. Paste PR context, paste a diff, or upload files.
10. Run analysis.

## Recommended Models

| Model | Use case | Notes |
| --- | --- | --- |
| `qwen3-coder:30b` | Stronger local code review | Recommended for higher-quality review when RAM/VRAM allows. |
| `qwen2.5-coder:14b` | Balanced local code review | Middle ground between speed and quality. |
| `qwen2.5-coder:7b` | Lightweight local review | Better for less powerful machines; usually faster and less memory-hungry. |

## Troubleshooting

### Ollama connection failed

Make sure the container is running and port `11434` is exposed:

```bash
docker ps
curl http://localhost:11434/api/tags
```

Confirm the app is using `http://localhost:11434` as the Ollama base URL. If the app is deployed, confirm the deployed frontend origin is included in `OLLAMA_ORIGINS` and restart the container.

### CORS error

Set `OLLAMA_ORIGINS` so Ollama allows the app origin:

```yaml
environment:
  - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app
```

If the app is deployed to a Vercel production domain, add the exact production domain too. Restart the container after changing the compose file:

```bash
docker compose down
docker compose up -d
```

Do not use `OLLAMA_ORIGINS=*` except temporarily for debugging.

For the GPU compose file, restart with:

```bash
docker compose -f docker-compose.gpu.yml down
docker compose -f docker-compose.gpu.yml up -d
```

### Browser can access `/api/tags` but app cannot

If `http://localhost:11434/api/tags` opens directly in the browser but the app still fails to connect, the request from the app is likely being blocked by CORS. Add the exact app origin to `OLLAMA_ORIGINS`, restart the Docker container, and click Test Connection again.

For Vercel deployments, include the exact production domain as well as the wildcard preview origin when needed:

```yaml
environment:
  - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app,https://your-project.vercel.app
```

Avoid `OLLAMA_ORIGINS=*` except as a short-lived debugging step.

### Model not found

Pull the model before selecting it in the app:

```bash
docker exec -it ai-review-ollama ollama pull qwen3-coder:30b
```

### Docker container not running

Start it again and inspect logs:

```bash
docker compose up -d
docker logs -f ai-review-ollama
```

### GPU not detected

Run:

```bash
docker exec -it ai-review-ollama nvidia-smi
```

If this fails, configure Docker GPU support or use the CPU compose setup.

### Model is too slow

Use a smaller model such as `qwen2.5-coder:7b`, close other memory-heavy applications, or use GPU acceleration if available.

### Out of memory

Stop the running model and use a smaller one:

```bash
docker exec -it ai-review-ollama ollama stop qwen3-coder:30b
docker exec -it ai-review-ollama ollama pull qwen2.5-coder:7b
```

## Project Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Development Status

Valra is currently in MVP development. The current focus is local-first code review with Ollama, static heuristic checks, file upload, Microsoft Entra login, PostgreSQL auth persistence, Azure DevOps PR context import, and Markdown output. Cloud AI providers and expanded review history are planned future work.
