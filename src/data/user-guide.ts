export type GuideBadge =
  | "Implemented"
  | "Planned"
  | "Local-first"
  | "Docker"
  | "GPU Optional"
  | "Required"
  | "Recommended"
  | "Optional"
  | "Coming soon";

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
      "Valra is a local-first workspace for code reviews, bug reports, QA context, and PR-ready Markdown output.",
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
      "Test case generation from stories, bugs, diffs, and QA notes.",
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
    id: "local-ollama-setup",
    title: "Local Ollama Setup",
    badges: ["Required", "Local-first", "Recommended"],
    description:
      "Configure Ollama on the user's local machine so Valra can run private, faster local analysis from the browser.",
    items: [
      "Ollama must run on the user's local machine or on a local Docker container exposing `http://localhost:11434`.",
      "The app connects to Ollama with Base URL `http://localhost:11434`.",
      "Code, diffs, bug reports, and QA notes stay on the user's machine when Local Ollama is used.",
      "For local Ollama, the browser calls Ollama directly: `Frontend/browser -> http://localhost:11434`.",
      "A deployed backend cannot access the user's local `localhost`, so local Ollama requests must not be routed through Next.js API routes.",
    ],
    subsections: [
      {
        id: "local-ollama-basic-flow",
        title: "Basic setup flow",
        badges: ["Required"],
        items: [
          "Step 1: Install Ollama on the local machine.",
          "If Ollama runs in Docker, start the container and run Ollama commands through `docker exec -it ai-review-ollama ...`.",
          "Step 2: Pull the recommended model.",
          "Step 3: Verify the model exists.",
          "Step 4: Start or verify Ollama is running.",
          "Step 5: In the app provider settings, use Base URL `http://localhost:11434` and Model `qwen3-coder:30b`.",
        ],
        codeBlocks: [
          {
            title: "Install a recommended model with local Ollama",
            language: "bash",
            code: "ollama pull qwen3-coder:30b\nollama list\nollama serve",
          },
          {
            title: "Install a recommended model with Docker",
            language: "bash",
            code: "docker compose -f docker/docker-compose.yml up -d\ndocker exec -it ai-review-ollama ollama pull qwen3-coder:30b\ndocker exec -it ai-review-ollama ollama list\ncurl http://localhost:11434/api/tags",
          },
          {
            title: "Provider settings",
            language: "text",
            code: "Base URL: http://localhost:11434\nModel: qwen3-coder:30b",
          },
        ],
      },
      {
        id: "local-ollama-faster-models",
        title: "Faster model alternatives",
        badges: ["Optional"],
        items: [
          "`qwen2.5-coder:7b` is usually faster on demo machines and laptops.",
          "`qwen2.5-coder:14b` is a balanced local option.",
          "`deepseek-coder-v2:16b` is a strong code-oriented alternative.",
          "`codellama:13b` is a solid fallback for code-focused workflows.",
          "Smaller models are usually faster but may produce lower-quality or less consistent analysis.",
        ],
        codeBlocks: [
          {
            title: "Pull faster alternatives with local Ollama",
            language: "bash",
            code: "ollama pull qwen2.5-coder:7b\nollama pull qwen2.5-coder:14b\nollama pull deepseek-coder-v2:16b\nollama pull codellama:13b",
          },
          {
            title: "Pull faster alternatives with Docker",
            language: "bash",
            code: "docker exec -it ai-review-ollama ollama pull qwen2.5-coder:7b\ndocker exec -it ai-review-ollama ollama pull qwen2.5-coder:14b\ndocker exec -it ai-review-ollama ollama pull deepseek-coder-v2:16b\ndocker exec -it ai-review-ollama ollama pull codellama:13b",
          },
        ],
      },
      {
        id: "optimized-ollama-profiles",
        title: "Optional: Optimized Ollama Profiles",
        badges: ["Optional", "Recommended"],
        description:
          "Create specialized local Ollama model presets with Modelfile system instructions and parameters. These profiles do not fine-tune or train the base model.",
        items: [
          "`ai-review-code` keeps code review output focused on actionable findings.",
          "`ai-review-bug-report` keeps QA notes structured for issue trackers.",
          "`ai-review-test-cases` keeps test generation practical and execution-ready.",
          "Profiles can make responses more focused, more consistent, shorter, easier to parse, and better aligned with each module.",
          "When Ollama runs in Docker, copy the `ollama/Modelfile.*` files into the container before running `ollama create`.",
        ],
        codeBlocks: [
          {
            title: "Create optimized profiles with local Ollama",
            language: "bash",
            code: "ollama create ai-review-code -f ollama/Modelfile.code-review\nollama create ai-review-bug-report -f ollama/Modelfile.bug-report\nollama create ai-review-test-cases -f ollama/Modelfile.test-cases\nollama list",
          },
          {
            title: "Create optimized profiles with Docker",
            language: "bash",
            code: "docker exec -it ai-review-ollama ollama pull qwen3-coder:30b\ndocker cp ollama/Modelfile.code-review ai-review-ollama:/tmp/Modelfile.code-review\ndocker cp ollama/Modelfile.bug-report ai-review-ollama:/tmp/Modelfile.bug-report\ndocker cp ollama/Modelfile.test-cases ai-review-ollama:/tmp/Modelfile.test-cases\ndocker exec -it ai-review-ollama ollama create ai-review-code -f /tmp/Modelfile.code-review\ndocker exec -it ai-review-ollama ollama create ai-review-bug-report -f /tmp/Modelfile.bug-report\ndocker exec -it ai-review-ollama ollama create ai-review-test-cases -f /tmp/Modelfile.test-cases\ndocker exec -it ai-review-ollama ollama list",
          },
          {
            title: "Recommended app model selection",
            language: "text",
            code: "Module          Recommended model\nCode Review     ai-review-code\nBug Report / QA ai-review-bug-report\nTest Cases      ai-review-test-cases\n\nFallback\nAll modules     qwen3-coder:30b",
          },
        ],
      },
      {
        id: "ollama-modelfile-examples",
        title: "Modelfile examples",
        badges: ["Optional"],
        description:
          "These files live in the `ollama/` folder and can be edited before creating the local profiles.",
        codeBlocks: [
          {
            title: "ollama/Modelfile.code-review",
            language: "text",
            code: "FROM qwen3-coder:30b\n\nPARAMETER temperature 0.15\nPARAMETER top_p 0.8\nPARAMETER num_ctx 8192\nPARAMETER num_predict 3200\n\nSYSTEM \"\"\"\nYou are a senior software reviewer specialized in practical, concise, and actionable code reviews.\n\nFocus on:\n- Real bugs and regressions\n- Security risks\n- Performance issues\n- Maintainability problems\n- Type safety problems\n- Missing tests\n- Edge cases\n- Risky implementation details\n\nRules:\n- Return only strict JSON when the application prompt asks for JSON.\n- The JSON must be parseable by JSON.parse.\n- Escape every double quote inside JSON string values.\n- Do not include markdown fences or prose outside JSON.\n- Keep output compact and close every object and array.\n- Report only findings supported by evidence from the diff or surrounding code.\n- Before reporting a finding, scan the relevant diff hunk and nearby changed code for existing guards, validation, try/catch blocks, error states, fallback UI, early returns, disabled actions, or default-state handling.\n- Remove any finding whose explanation contradicts code shown in the diff.\n- Before finalizing a finding, verify that its title, evidence, failure path, actual impact, suggested fix, and false-positive check agree with each other.\n- Remove any finding where the evidence disproves the title, the failure path is impossible based on the evidence, or the finding says something is missing while the evidence shows it exists.\n- If the false-positive check says the behavior is already handled, remove the finding or downgrade it to a recommendation that explains only the remaining gap.\n- Do not report missing error handling when the diff shows try/catch, .catch(...), RTK Query error state usage, .unwrap() inside a caught flow, or equivalent handling.\n- Do not report missing validation when the diff already validates the relevant state before use.\n- Do not report reset behavior as a bug when reset assigns safe defaults and dependent actions validate or handle the empty state.\n- If a concern is already partially handled, downgrade severity and explain only the remaining gap.\n- If API errors are caught but only logged, report only a low-severity recommendation for user-facing error messaging.\n- Separate confirmed issues from potential issues, needs-verification notes, and optional recommendations.\n- Treat weak evidence as a false-positive risk instead of a main finding.\n- Calibrate severity conservatively. Do not mark high or critical without a realistic failure path.\n- For every finding, identify the exact code pattern, the failure path, the actual impact, and a minimal fix.\n- Do not flag reset handlers as unsafe when they explicitly reset values to safe defaults.\n- Do not flag hardcoded API route paths as security issues unless the code shows missing auth, authorization, or sensitive data exposure.\n- Do not write generic validation advice. Show the unsafe input and how it fails.\n- Watch for unsafe guards like `data && typeof data === \"object\" && Object.entries(data)` because arrays also satisfy `typeof value === \"object\"`. Describe the impact as malformed dropdown options or invalid UI state unless the code has a real crash path. Recommend `value !== null && typeof value === \"object\" && !Array.isArray(value)` for plain-object checks.\n\nAvoid generic comments.\nAvoid repeating the diff.\nDo not praise the code unnecessarily.\nReturn structured, concise output.\nPrioritize findings that a developer can act on immediately.\n\"\"\"",
          },
          {
            title: "ollama/Modelfile.bug-report",
            language: "text",
            code: "FROM qwen3-coder:30b\n\nPARAMETER temperature 0.2\nPARAMETER top_p 0.85\nPARAMETER num_ctx 8192\nPARAMETER num_predict 1200\n\nSYSTEM \"\"\"\nYou are a senior QA analyst specialized in transforming raw notes, screenshots, logs, and reproduction details into clear bug reports.\n\nFocus on:\n- Clear title\n- Preconditions\n- Steps to reproduce\n- Actual result\n- Expected result\n- Environment\n- Severity\n- Impact\n- Evidence\n- Suggested technical cause when appropriate\n\nBe precise.\nDo not invent missing facts.\nIf information is missing, mark it as unknown or ask for it in the output.\nReturn structured output that can be copied into Jira, Linear, GitHub Issues, or similar tools.\n\"\"\"",
          },
          {
            title: "ollama/Modelfile.test-cases",
            language: "text",
            code: "FROM qwen3-coder:30b\n\nPARAMETER temperature 0.2\nPARAMETER top_p 0.85\nPARAMETER num_ctx 8192\nPARAMETER num_predict 1600\n\nSYSTEM \"\"\"\nYou are a senior QA engineer specialized in generating practical test cases from user stories, acceptance criteria, bug reports, PR diffs, and QA notes.\n\nFocus on:\n- Functional coverage\n- Regression coverage\n- Edge cases\n- Negative testing\n- UI/UX validation\n- API validation when relevant\n- Preconditions\n- Test data\n- Clear steps\n- Expected results\n- Automation candidates\n\nAvoid vague test cases.\nDo not generate duplicate scenarios.\nKeep the output structured and easy for QA engineers to execute.\n\"\"\"",
          },
        ],
      },
      {
        id: "ollama-performance-tips",
        title: "Performance Tips",
        badges: ["Recommended"],
        items: [
          "Use smaller models for faster demos.",
          "Keep pasted diffs focused.",
          "Avoid sending entire repositories.",
          "Prefer only the relevant files or diff.",
          "Use optimized profiles for more consistent responses.",
          "Lower `num_predict` for shorter responses.",
          "Increase `num_ctx` only if larger context is needed.",
          "Use GPU acceleration if available.",
        ],
      },
      {
        id: "ollama-troubleshooting",
        title: "Troubleshooting",
        badges: ["Recommended"],
        subsections: [
          {
            id: "ollama-troubleshooting-connection-failed",
            title: "Ollama connection failed",
            items: [
              "Make sure Ollama is installed.",
              "Make sure Ollama is running.",
              "Confirm Base URL is `http://localhost:11434`.",
              "Test with `ollama list`.",
            ],
          },
          {
            id: "ollama-troubleshooting-model-not-found",
            title: "Model not found",
            items: [
              "Run `ollama list`.",
              "Pull the model or create the optimized profile.",
              "Make sure the model name in the app matches exactly.",
            ],
          },
          {
            id: "ollama-troubleshooting-slow-responses",
            title: "Responses are too slow",
            items: [
              "Use a smaller model.",
              "Reduce the input size.",
              "Lower output length.",
              "Use the optimized profiles.",
              "Verify GPU support if applicable.",
            ],
          },
          {
            id: "ollama-troubleshooting-format",
            title: "Response format is inconsistent",
            items: [
              "Use the optimized profile for that module.",
              "Keep the input focused.",
              "Try generating again.",
              "Avoid mixing unrelated requirements in one request.",
            ],
          },
        ],
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
      "NextAuth v4 with Microsoft Entra / Azure AD provider `azure-ad`.",
      "Prisma + PostgreSQL for users, sessions, OAuth accounts, AzureConnection, and AzureSelection.",
      "Encrypted OAuth token storage.",
      "Server-side Azure DevOps API routes for projects, repositories, and pull requests.",
      "Dockerized Ollama setup for CPU and optional NVIDIA GPU.",
      "Sonner for in-app notifications.",
    ],
  },
  {
    id: "azure-devops-integration",
    title: "Azure DevOps Integration",
    badges: ["Implemented", "Recommended"],
    description:
      "Connect Microsoft Entra, validate Azure DevOps permissions, browse projects and repositories, and prepare for pull request context import into Code Review.",
    items: [
      "Azure DevOps data is fetched through server-side Next.js API routes so OAuth tokens stay on the server.",
      "Local AI analysis still runs from the browser to local Ollama at `http://localhost:11434`.",
      "OAuth tokens are stored server-side, encrypted at rest, and never shown in the UI.",
      "The current Azure DevOps integration is read-only. It does not post PR comments or use PAT authentication.",
      "PR browsing is available through backend routes; importing PR diffs into Code Review is the next workflow step.",
    ],
    subsections: [
      {
        id: "azure-devops-architecture",
        title: "Architecture overview",
        badges: ["Required", "Local-first"],
        items: [
          "Microsoft Entra login uses browser redirects through NextAuth.",
          "Azure DevOps API calls go through backend routes because OAuth tokens must remain server-side.",
          "Local Ollama stays browser-side because it runs on the user's local machine or local Docker container.",
        ],
        codeBlocks: [
          {
            title: "Request architecture",
            language: "text",
            code: "Microsoft Entra login:\nBrowser -> NextAuth -> Microsoft Entra\n\nAzure DevOps data:\nBrowser -> Next.js API routes -> Azure DevOps REST API\n\nLocal AI analysis:\nBrowser -> local Ollama at http://localhost:11434",
          },
        ],
      },
      {
        id: "azure-entra-registration",
        title: "Microsoft Entra App Registration",
        badges: ["Required"],
        items: [
          "The NextAuth provider ID must remain `azure-ad`.",
          "The redirect URI must match the callback path exactly in Microsoft Entra.",
          "For company or work accounts only, use organizational accounts.",
          "For both company and personal Microsoft accounts, use `Accounts in any organizational directory and personal Microsoft accounts`.",
          "For Azure DevOps OAuth with Microsoft Entra, an organizational tenant is recommended.",
        ],
        codeBlocks: [
          {
            title: "Required redirect URIs",
            language: "text",
            code: "Local:\nhttp://localhost:3000/api/auth/callback/azure-ad\n\nProduction:\nhttps://ai-review-copilot.vercel.app/api/auth/callback/azure-ad\n\nProvider ID:\nazure-ad",
          },
        ],
      },
      {
        id: "azure-devops-permissions",
        title: "Azure DevOps API permissions",
        badges: ["Required", "Recommended"],
        items: [
          "`vso.profile` reads basic user/profile and organization-level metadata.",
          "`vso.project` reads projects and teams.",
          "`vso.code` reads repositories and pull requests.",
          "Write permissions such as `vso.code_write` are not needed for the current read-only integration.",
          "Do not request `user_impersonation` unless the app intentionally needs broad Azure DevOps REST API access.",
        ],
        codeBlocks: [
          {
            title: "Recommended delegated permissions",
            language: "text",
            code: "vso.profile\nvso.project\nvso.code",
          },
        ],
      },
      {
        id: "azure-devops-reconsent",
        title: "Grant or refresh Azure DevOps permissions",
        badges: ["Required"],
        items: [
          "After adding Azure DevOps permissions in Microsoft Entra, grant consent again so the issued token includes the new scopes.",
          "Go to Settings -> Connected Accounts.",
          "Click `Grant Azure DevOps permissions`.",
          "Sign in and accept the Microsoft consent screen.",
          "Return to Settings -> Connected Accounts.",
          "Click `Test Connection` again.",
        ],
        codeBlocks: [
          {
            title: "Internal consent scope",
            language: "text",
            code: "openid profile email offline_access https://app.vssps.visualstudio.com/.default",
          },
        ],
      },
      {
        id: "azure-connected-accounts-flow",
        title: "Connected Accounts usage",
        badges: ["Implemented"],
        items: [
          "Step 1: Sign in with Microsoft.",
          "Step 2: Open Settings -> Connected Accounts.",
          "Step 3: Verify the Microsoft Account card.",
          "Step 4: Enter the Azure DevOps organization slug. For `https://dev.azure.com/valrareview`, use `valrareview`.",
          "Step 5: Click `Test Connection`.",
          "Step 6: If successful, click `Configure Azure DevOps`.",
          "Step 7: Load projects.",
          "Step 8: Select a project.",
          "Step 9: Load repositories.",
          "Step 10: Select a repository.",
          "Step 11: Save selection.",
          "Step 12: Continue to pull request browsing or PR context import when available.",
        ],
      },
      {
        id: "azure-database-persistence",
        title: "Database persistence",
        badges: ["Required"],
        items: [
          "Prisma and PostgreSQL store users, OAuth accounts, sessions, AzureConnection, and AzureSelection.",
          "PostgreSQL can run through Docker during local development.",
          "`DATABASE_URL` should point to the local or production PostgreSQL database.",
          "Run Prisma generate and migrations before starting the app.",
        ],
        codeBlocks: [
          {
            title: "Prisma setup",
            language: "bash",
            code: "npx prisma generate\nnpx prisma migrate dev\nnpm run dev",
          },
        ],
      },
      {
        id: "azure-api-reference",
        title: "API endpoint reference",
        badges: ["Implemented"],
        codeBlocks: [
          {
            title: "Azure backend routes",
            language: "text",
            code: "Endpoint                                                                     Purpose\nGET /api/azure/status                                                      Reads safe Microsoft/Azure integration status\nGET /api/azure/projects?organization=...                                   Lists Azure DevOps projects\nGET /api/azure/repositories?organization=...&project=...                   Lists repositories\nGET /api/azure/pull-requests?organization=...&project=...&repositoryId=... Lists pull requests\nPOST /api/azure/configure                                                  Saves validated Azure DevOps organization\nPOST /api/azure/selection                                                  Saves selected project and repository",
          },
        ],
      },
      {
        id: "azure-coming-soon",
        title: "Pull request import and comments",
        badges: ["Coming soon"],
        items: [
          "Pull request listing is available through the backend route.",
          "Importing PR diffs into Code Review is not wired into the review workflow yet.",
          "Posting PR comments back to Azure DevOps is not implemented yet.",
          "The current integration remains read-only.",
        ],
      },
      {
        id: "azure-troubleshooting",
        title: "Azure DevOps troubleshooting",
        badges: ["Recommended"],
        subsections: [
          {
            id: "azure-troubleshooting-unauthorized",
            title: "AZURE_DEVOPS_UNAUTHORIZED",
            items: [
              "Possible cause: Azure DevOps permissions were not granted.",
              "Possible cause: re-consent has not been completed after adding permissions.",
              "Possible cause: the token was issued without Azure DevOps scopes.",
              "Possible cause: the user does not have access to the organization, project, or repository.",
              "Possible cause: a personal Microsoft account is being used where an organizational flow is required.",
              "Fix: verify delegated Azure DevOps permissions in Microsoft Entra.",
              "Fix: click `Grant Azure DevOps permissions`, accept consent, then test again.",
              "Fix: sign out and sign in again.",
              "Fix: confirm the organization slug and user access in Azure DevOps.",
            ],
          },
          {
            id: "azure-troubleshooting-ollama-still-works",
            title: "Model or AI works but Azure fails",
            items: [
              "Ollama and Azure DevOps are separate systems.",
              "Ollama runs locally from the browser to `http://localhost:11434`.",
              "Azure DevOps uses backend routes and Microsoft OAuth tokens.",
              "A working local model does not prove Azure OAuth permissions are valid.",
            ],
          },
          {
            id: "azure-troubleshooting-callback",
            title: "Callback mismatch",
            items: [
              "Verify the local redirect URI exactly matches `http://localhost:3000/api/auth/callback/azure-ad`.",
              "Verify the production redirect URI exactly matches `https://ai-review-copilot.vercel.app/api/auth/callback/azure-ad`.",
              "Keep the provider ID as `azure-ad` unless the Entra redirect URI is updated to match a different provider ID.",
            ],
          },
          {
            id: "azure-troubleshooting-not-configured",
            title: "Organization not configured",
            items: [
              "Enter the Azure DevOps organization slug.",
              "Click `Test Connection`.",
              "Click `Configure Azure DevOps` after a successful test.",
              "Load projects, load repositories, and save the project/repository selection.",
            ],
          },
        ],
      },
      {
        id: "azure-security-notes",
        title: "Security notes",
        badges: ["Required"],
        items: [
          "OAuth tokens are stored server-side.",
          "OAuth tokens are encrypted at rest.",
          "Tokens are not exposed in the browser.",
          "Tokens are not stored in localStorage.",
          "Azure DevOps calls are made through server-side routes.",
          "Local Ollama calls remain browser-side and only talk to the user's local Ollama instance.",
          "The current Azure integration is read-only.",
          "No PR comments are posted yet.",
          "PAT authentication is not used.",
        ],
      },
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
      "Use placeholders only in shared documentation. Keep real secrets in `.env.local` for development and environment variables for production.",
    items: [
      "`NEXT_PUBLIC_DEFAULT_OLLAMA_URL` and `NEXT_PUBLIC_DEFAULT_OLLAMA_MODEL` configure local Ollama defaults.",
      "`NEXTAUTH_URL` should match the current app URL. Use `http://localhost:3000` locally and the production URL in Vercel.",
      "`AUTH_SECRET` signs NextAuth session data.",
      "`AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, and `AUTH_MICROSOFT_ENTRA_ID_ISSUER` configure Microsoft Entra.",
      "`DATABASE_URL` points Prisma to PostgreSQL for users, OAuth accounts, sessions, AzureConnection, and AzureSelection.",
      "`TOKEN_ENCRYPTION_SECRET` encrypts OAuth token values at rest. Do not reuse the Microsoft client secret or database URL.",
      "Production deployments should set the same variables in Vercel Environment Variables and use a cloud PostgreSQL provider such as Neon, Prisma Postgres, or Supabase.",
      "Do not commit `.env.local`.",
    ],
    codeBlocks: [
      {
        title: ".env.local",
        language: "env",
        code: "NEXT_PUBLIC_DEFAULT_OLLAMA_URL=http://localhost:11434\nNEXT_PUBLIC_DEFAULT_OLLAMA_MODEL=qwen3-coder:30b\n\nNEXTAUTH_URL=http://localhost:3000\nAUTH_SECRET=\nAUTH_MICROSOFT_ENTRA_ID_ID=\nAUTH_MICROSOFT_ENTRA_ID_SECRET=\nAUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0\n\nDATABASE_URL=\"postgresql://ai_review_user:ai_review_password@localhost:5432/ai_review_copilot?schema=public\"\nTOKEN_ENCRYPTION_SECRET=",
      },
      {
        title: "Generate TOKEN_ENCRYPTION_SECRET",
        language: "bash",
        code: "node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
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
      "Choose `Static Only` or `Local Ollama`.",
      "Test the Ollama connection if using Local Ollama.",
      "Add PR or ticket context.",
      "Select a diff source: paste diff, upload old/new files, or compare old/new text.",
      "Run analysis.",
      "AI Code Review applies diff-handling, false-positive, and self-contradiction checks; findings whose evidence contradicts the title or failure path are removed before reporting.",
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
      "Open `/bug-report`.",
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
    id: "test-cases-workflow",
    title: "Test Cases Workflow",
    badges: ["Implemented"],
    description:
      "Test Cases turns user stories, acceptance criteria, bug reports, diffs, code review notes, or manual QA notes into structured QA coverage.",
    items: [
      "Open `/test-cases`.",
      "Confirm Local Ollama settings use `http://localhost:11434` and a pulled model.",
      "Paste feature, bug, story, diff, or review context.",
      "Choose test type, coverage level, output format, and priority baseline.",
      "Generate test cases.",
      "Copy all, export Markdown, or copy individual test case cards.",
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
      "Set `NEXTAUTH_URL` to the production URL and configure the production Entra callback URI.",
      "Set `DATABASE_URL`, auth variables, and `TOKEN_ENCRYPTION_SECRET` in Vercel Environment Variables.",
      "Use a production PostgreSQL provider such as Neon, Prisma Postgres, or Supabase.",
      "Cloud AI providers, PR diff import, and posting PR comments back to GitHub or Azure are planned, not implemented.",
    ],
  },
  {
    id: "project-status",
    title: "Project Status",
    badges: ["Implemented", "Planned"],
    description:
      "Valra is currently in MVP development.",
    items: [
      "Implemented: local-first code review with Ollama, static heuristic checks, file upload context, bug report drafting, test case generation, and Markdown output.",
      "Implemented: Microsoft Entra login/logout, Prisma persistence, encrypted OAuth token storage, and protected routes.",
      "Implemented: Settings -> Connected Accounts with Azure DevOps test connection, configuration, project selection, and repository selection.",
      "Implemented: read-only Azure DevOps backend endpoints for status, projects, repositories, pull requests, and PR context import.",
      "Planned: cloud AI providers.",
      "Planned: GitHub PR import.",
      "Planned: review history.",
      "Planned: posting PR comments back to GitHub or Azure.",
    ],
  },
];
