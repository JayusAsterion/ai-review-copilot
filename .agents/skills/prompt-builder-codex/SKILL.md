---

name: prompt-builder-codex

description: Use when the user asks to create, improve, or structure a prompt for Codex. This skill turns rough implementation ideas into clear, complete, actionable Codex prompts with task, context, files, requirements, constraints, validation, and expected output.

---



\# Prompt Builder for Codex



When the user asks for a Codex prompt, create a clear, complete, actionable implementation prompt.



Always include these sections:



1\. Task

2\. Context

3\. Files likely involved

4\. Requirements

5\. Constraints

6\. Validation

7\. Expected output



Rules:

\- Ask for minimal focused changes.

\- Do not refactor unrelated files.

\- Preserve the current design unless the user explicitly asks for UI changes.

\- Use TypeScript, Tailwind CSS, shadcn/ui, and Next.js best practices when applicable.

\- Ask Codex to inspect the current project structure before editing.

\- Ask Codex to reuse existing utilities, components, and patterns.

\- Ask Codex to explain the files changed.

\- Ask Codex to run lint, build, and tests when available.

\- Ask Codex to report validation results.

\- Avoid vague instructions like “make it better” without acceptance criteria.

\- For frontend tasks, include responsive behavior, loading states, empty states, error states, and accessibility.

\- For UI/UX tasks, mention the existing design skills when relevant:

&nbsp; - Emil Kowalski design taste

&nbsp; - Impeccable Design

&nbsp; - Taste Skill

\- For ai-review-copilot, preserve the local-first Ollama architecture:

&nbsp; - Frontend/browser -> http://localhost:11434

&nbsp; - Do not move local Ollama calls into Next.js API routes.

\- For ai-review-copilot, keep the main modules limited to:

&nbsp; - Code Review

&nbsp; - Bug Report

&nbsp; - Test Cases

\- Do not reintroduce PR Comments as a standalone module.



Default Codex prompt structure:



Task:

\[Describe the implementation goal clearly.]



Context:

\[Explain the project, stack, current behavior, and why the change is needed.]



Files likely involved:

\[List likely files but tell Codex to inspect the project first.]



Requirements:

\[Detailed functional and UI requirements.]



Constraints:

\[What Codex must not change.]



Validation:

\[Commands and manual checks.]



Expected output:

\[What Codex should summarize after implementation.]

