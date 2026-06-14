export type GuideBadge =
  | "Implemented"
  | "Planned"
  | "Local-first"
  | "Docker"
  | "GPU Optional";

export type UserGuideSection = {
  id: string;
  title: string;
  description?: string;
  badges?: GuideBadge[];
  items?: string[];
  codeBlocks?: Array<{
    title?: string;
    language: string;
    code: string;
  }>;
  subsections?: UserGuideSection[];
};

export const userGuideSections: UserGuideSection[] = [
  {
    id: "overview",
    title: "Overview",
    badges: ["Implemented", "Local-first"],
    description:
      "AI Review Copilot is a local-first workspace for code reviews, bug reports, QA context, and PR-ready Markdown output.",
    items: [
      "The current MVP focuses on local Ollama and static heuristic analysis.",
      "The browser calls the user's local Ollama server directly, so source code and QA context can stay on the user's machine.",
      "The hosted app can load in Vercel, but local AI still depends on the user's local Ollama configuration.",
    ],
  },
  {
    id: "features",
    title: "Features",
    badges: ["Implemented"],
    items: [
      "Code review from pasted PR diffs.",
      "Diff generation from uploaded old and new files.",
      "Diff generation from old and new text editors.",
      "Bug report generation from structured QA context.",
      "Static-only analysis for quick local checks without AI.",
      "Local Ollama analysis from the browser.",
      "Markdown copy and export.",
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    badges: ["Local-first"],
    description:
      "The Next.js app renders the interface and lightweight API routes. Local-first AI review is intentionally handled in the browser.",
    items: [
      "`localhost:11434` must refer to the user's machine, not a hosted backend.",
      "A Vercel or Next.js backend should not call the user's local Ollama instance because backend localhost points at the deployment server.",
    ],
    codeBlocks: [
      {
        title: "Request flow",
        language: "text",
        code: "User Browser\n  -> Next.js App\n  -> Local Ollama at http://localhost:11434",
      },
    ],
  },
  {
    id: "tech-stack",
    title: "Tech Stack",
    badges: ["Implemented"],
    items: [
      "Next.js App Router with TypeScript.",
      "Tailwind CSS and shadcn/ui components.",
      "Local Ollama integration.",
      "Dockerized Ollama setup for CPU and optional NVIDIA GPU.",
      "Sonner for in-app notifications.",
    ],
  },
  {
    id: "prerequisites",
    title: "Prerequisites",
    items: [
      "Node.js 20+.",
      "npm.",
      "Docker Desktop.",
      "Git.",
      "Optional: NVIDIA GPU with Docker GPU support.",
    ],
  },
  {
    id: "installation",
    title: "Installation",
    badges: ["Implemented"],
    description: "Install dependencies, create a local environment file, and start the app.",
    codeBlocks: [
      {
        title: "Install and run",
        language: "bash",
        code: "git clone <repo-url>\ncd ai-review-copilot\nnpm install\ncp .env.example .env.local\nnpm run dev",
      },
      {
        title: "App URLs",
        language: "txt",
        code: "App URL:\nhttp://localhost:3000\n\nReview module:\nhttp://localhost:3000/review\n\nUser Guide:\nhttp://localhost:3000/guide",
      },
    ],
  },
  {
    id: "environment-variables",
    title: "Environment Variables",
    description:
      "Use these defaults for local Ollama. Cloud provider keys may exist in templates for future work, but cloud AI is planned and not implemented in the current MVP.",
    codeBlocks: [
      {
        title: ".env.local",
        language: "env",
        code: "NEXT_PUBLIC_DEFAULT_OLLAMA_URL=http://localhost:11434\nNEXT_PUBLIC_DEFAULT_OLLAMA_MODEL=qwen3-coder:30b",
      },
    ],
  },
  {
    id: "docker-cpu",
    title: "Run Ollama with Docker CPU",
    badges: ["Docker"],
    description:
      "Use the CPU compose setup when GPU acceleration is unavailable or unnecessary.",
    codeBlocks: [
      {
        title: "Start and verify",
        language: "bash",
        code: "docker compose up -d\ndocker ps\ncurl http://localhost:11434/api/tags",
      },
    ],
  },
  {
    id: "docker-gpu",
    title: "Run Ollama with Docker and NVIDIA GPU",
    badges: ["Docker", "GPU Optional"],
    description:
      "GPU setup is optional and requires Docker GPU support, WSL2 backend on Windows or Docker on Linux, and a properly configured NVIDIA stack.",
    codeBlocks: [
      {
        title: "Start and verify GPU",
        language: "bash",
        code: "docker compose -f docker-compose.gpu.yml up -d\ndocker exec -it ai-review-ollama nvidia-smi",
      },
    ],
  },
  {
    id: "recommended-models",
    title: "Recommended Models",
    badges: ["Local-first"],
    items: [
      "`qwen3-coder:30b` is recommended for stronger local code review when RAM or VRAM allows.",
      "`qwen2.5-coder:14b` is a balanced option.",
      "`qwen2.5-coder:7b` is lighter and usually faster on less powerful machines.",
      "`deepseek-coder-v2:16b` and `codellama:13b` are additional local coding model options.",
    ],
    codeBlocks: [
      {
        title: "Pull models",
        language: "bash",
        code: "docker exec -it ai-review-ollama ollama pull qwen3-coder:30b\ndocker exec -it ai-review-ollama ollama pull qwen2.5-coder:14b\ndocker exec -it ai-review-ollama ollama pull qwen2.5-coder:7b\ndocker exec -it ai-review-ollama ollama pull deepseek-coder-v2:16b\ndocker exec -it ai-review-ollama ollama pull codellama:13b",
      },
    ],
  },
  {
    id: "test-ollama",
    title: "Test Ollama",
    description: "Confirm the container is running, models are available, and the API responds.",
    codeBlocks: [
      {
        title: "Ollama checks",
        language: "bash",
        code: "docker exec -it ai-review-ollama ollama list\ndocker exec -it ai-review-ollama ollama run qwen3-coder:30b\ncurl http://localhost:11434/api/tags",
      },
    ],
  },
  {
    id: "cors-configuration",
    title: "CORS Configuration",
    badges: ["Local-first", "Docker"],
    description:
      "Because the web app calls Ollama from the browser, Ollama must allow the exact frontend origin.",
    items: [
      "Local development should allow `http://localhost:3000` and `http://127.0.0.1:3000`.",
      "Vercel previews can use `https://*.vercel.app`.",
      "Production deployments should include the exact production domain.",
      "Avoid `OLLAMA_ORIGINS=*` except as short-lived debugging.",
    ],
    codeBlocks: [
      {
        title: "Compose environment",
        language: "yaml",
        code: "environment:\n  - OLLAMA_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app",
      },
    ],
  },
  {
    id: "code-review-workflow",
    title: "Code Review Workflow",
    badges: ["Implemented"],
    description:
      "Code Review supports pasted diffs, generated diffs from files or text editors, static-only checks, local Ollama analysis, and Markdown copy or export.",
    items: [
      "Open `/review`.",
      "Select `Code Review`.",
      "Choose `Static Only` or `Local Ollama`.",
      "Test the Ollama connection if using Local Ollama.",
      "Add PR or ticket context.",
      "Select a diff source: paste diff, upload old/new files, or compare old/new text.",
      "Run analysis.",
      "Copy or export Markdown.",
    ],
  },
  {
    id: "bug-report-workflow",
    title: "Bug Report Workflow",
    badges: ["Implemented"],
    description:
      "Bug Report supports structured QA fields, rough notes, steps to reproduce, actual and expected result, screenshot notes, attachments as context, and static or Ollama generation.",
    items: [
      "Open `/review`.",
      "Select `Bug Report`.",
      "Choose `Static Only` or `Local Ollama`.",
      "Test the Ollama connection if using Local Ollama.",
      "Add ticket, environment, severity, reproduction notes, expected result, and actual result.",
      "Attach supporting text or code files when useful.",
      "Run generation.",
      "Copy or export Markdown.",
      "The MVP does not perform image understanding yet unless explicitly implemented. Screenshot notes are used as context.",
    ],
  },
  {
    id: "static-only-mode",
    title: "Static Only Mode",
    badges: ["Implemented"],
    description:
      "Static Only mode uses local formatting and heuristics without calling an AI model.",
    items: [
      "Works without Ollama running.",
      "Useful for quick summaries, structured output, and heuristic checks.",
      "Best when privacy, speed, or offline availability matters more than model reasoning.",
    ],
  },
  {
    id: "local-ollama-mode",
    title: "Local Ollama Mode",
    badges: ["Implemented", "Local-first"],
    description:
      "Local Ollama mode sends prompts from the browser to the user's Ollama server.",
    items: [
      "Use Base URL `http://localhost:11434` for local Docker Ollama.",
      "Choose a model that has already been pulled into the Ollama container.",
      "Click Test Connection before running larger analyses.",
      "Larger diffs need more model context and may run slowly on CPU.",
    ],
  },
  {
    id: "common-docker-commands",
    title: "Common Docker Commands",
    badges: ["Docker"],
    codeBlocks: [
      {
        title: "Container and model commands",
        language: "bash",
        code: "docker compose up -d\ndocker compose down\ndocker compose down -v\ndocker logs -f ai-review-ollama\ndocker exec -it ai-review-ollama ollama list\ndocker exec -it ai-review-ollama ollama stop qwen3-coder:30b",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description:
      "Start with the probable cause, apply the quick fix, then run the useful command to confirm the issue is gone.",
    subsections: [
      {
        id: "troubleshooting-ollama-connection",
        title: "Ollama connection failed",
        items: [
          "Probable cause: the container is stopped, port `11434` is not exposed, or the Base URL is wrong.",
          "Quick fix: start the container and confirm the app uses `http://localhost:11434`.",
        ],
        codeBlocks: [
          {
            title: "Verify Ollama",
            language: "bash",
            code: "docker ps\ncurl http://localhost:11434/api/tags",
          },
        ],
      },
      {
        id: "troubleshooting-cors",
        title: "CORS error",
        items: [
          "Probable cause: Ollama does not allow the browser origin.",
          "Quick fix: add the exact app origin to `OLLAMA_ORIGINS` and restart the container.",
        ],
        codeBlocks: [
          {
            title: "Restart after CORS changes",
            language: "bash",
            code: "docker compose down\ndocker compose up -d",
          },
        ],
      },
      {
        id: "troubleshooting-model-not-found",
        title: "Model not found",
        items: [
          "Probable cause: the selected model was not pulled into Ollama.",
          "Quick fix: pull the model before selecting it in the app.",
        ],
        codeBlocks: [
          {
            title: "Pull recommended model",
            language: "bash",
            code: "docker exec -it ai-review-ollama ollama pull qwen3-coder:30b",
          },
        ],
      },
      {
        id: "troubleshooting-container-not-running",
        title: "Docker container not running",
        items: [
          "Probable cause: Docker is stopped or the compose service exited.",
          "Quick fix: start the service and inspect logs.",
        ],
        codeBlocks: [
          {
            title: "Start and inspect",
            language: "bash",
            code: "docker compose up -d\ndocker logs -f ai-review-ollama",
          },
        ],
      },
      {
        id: "troubleshooting-gpu-not-detected",
        title: "GPU not detected",
        items: [
          "Probable cause: Docker GPU support or NVIDIA Container Toolkit is not configured.",
          "Quick fix: verify GPU visibility inside the container or use the CPU setup.",
        ],
        codeBlocks: [
          {
            title: "Check GPU access",
            language: "bash",
            code: "docker exec -it ai-review-ollama nvidia-smi",
          },
        ],
      },
      {
        id: "troubleshooting-model-slow",
        title: "Model is too slow",
        items: [
          "Probable cause: the selected model is too large for available CPU, RAM, or VRAM.",
          "Quick fix: use a smaller model, close memory-heavy apps, or enable GPU acceleration.",
        ],
        codeBlocks: [
          {
            title: "Pull lightweight model",
            language: "bash",
            code: "docker exec -it ai-review-ollama ollama pull qwen2.5-coder:7b",
          },
        ],
      },
      {
        id: "troubleshooting-memory",
        title: "Out of memory",
        items: [
          "Probable cause: a model is too large for available memory.",
          "Quick fix: stop the current model and switch to a smaller one.",
        ],
        codeBlocks: [
          {
            title: "Free memory and pull smaller model",
            language: "bash",
            code: "docker exec -it ai-review-ollama ollama stop qwen3-coder:30b\ndocker exec -it ai-review-ollama ollama pull qwen2.5-coder:7b",
          },
        ],
      },
      {
        id: "troubleshooting-large-diff",
        title: "Generated diff is too large",
        items: [
          "Probable cause: the selected diff includes generated files, lockfiles, or too many unrelated changes.",
          "Quick fix: narrow the diff, split the review, or use Static Only mode for an initial pass.",
        ],
        codeBlocks: [
          {
            title: "Useful check",
            language: "bash",
            code: "git diff --stat",
          },
        ],
      },
    ],
  },
  {
    id: "deployment-notes",
    title: "Deployment Notes",
    badges: ["Local-first"],
    items: [
      "The hosted app can serve the UI, but Local Ollama requests still happen from the user's browser to the user's machine.",
      "For Vercel production deployments, add the exact production URL to `OLLAMA_ORIGINS`.",
      "Cloud AI providers, authentication, persistence, and posting PR comments back to GitHub or Azure are planned, not implemented.",
    ],
  },
  {
    id: "project-status",
    title: "Project Status",
    badges: ["Implemented", "Planned"],
    description:
      "AI Review Copilot is currently in MVP development.",
    items: [
      "Implemented: local-first code review with Ollama, static heuristic checks, file upload context, bug report drafting, and Markdown output.",
      "Planned: cloud AI providers.",
      "Planned: GitHub PR import.",
      "Planned: Azure DevOps PR import.",
      "Planned: authentication.",
      "Planned: review history.",
      "Planned: posting PR comments back to GitHub or Azure.",
    ],
  },
];
