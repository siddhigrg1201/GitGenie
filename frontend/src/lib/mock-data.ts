// Placeholder JSON shaped like the CrewAI backend response.
// Swap for real API results without changing any component.

export type Repository = {
  id: string;
  name: string;
  owner: string;
  url: string;
  score: number;
  // Backend returns "Easy" | "Medium" | "Hard"; kept as a plain string since
  // difficultyStyles() in RepositoryCard/SelectedRepoCard matches on substrings.
  difficulty: string;
  matchedSkills: string[];
  reason: string;
  stars: number;
  language: string;
};

export type Issue = {
  id: string;
  title: string;
  difficulty: string;
  estimatedTime: string;
  requiredSkills: string[];
  learningOutcome: string;
  url: string;
  number: number;
};

export type RoadmapSection = {
  title: string;
  body: string;
};

export type ChecklistRule = {
  id: string;
  rule: string;
  /** Which stage of the contribution flow this item belongs to. */
  reason: string;
};

export type DeveloperProfile = {
  languages: { name: string; confidence: number }[];
  frameworks: { name: string; confidence: number }[];
  experience: string;
  interests: string[];
  projects: { name: string; description: string }[];
  goals: string[];
  stats?: { repos: number; stars: number; followers: number };
  confidenceScore?: number;
};

export type ManualProfileInput = {
  skills: string;
  experience: string;
  interests: string;
  goal?: string;
};

export type AnalysisResult = {
  githubDataUsed: boolean;
  selectionMode: "user" | "auto";
  selectedRepoId: string;
  profile: DeveloperProfile;
  repositories: Repository[];
  details: Record<string, string>; // markdown by repo id
  issues: Record<string, Issue[]>; // issues by repo id
  roadmap: Record<string, RoadmapSection[]>;
  checklist: ChecklistRule[];
};

export const MOCK_RESULT: AnalysisResult = {
  githubDataUsed: true,
  selectionMode: "auto",
  selectedRepoId: "repo-1",
  profile: {
    languages: [
      { name: "TypeScript", confidence: 92 },
      { name: "Python", confidence: 84 },
      { name: "Go", confidence: 61 },
      { name: "Rust", confidence: 38 },
    ],
    frameworks: [
      { name: "React", confidence: 94 },
      { name: "Next.js", confidence: 78 },
      { name: "FastAPI", confidence: 71 },
      { name: "TanStack", confidence: 66 },
    ],
    experience:
      "Mid-level full-stack engineer with 4+ years of professional experience, focused on developer tooling and internal platforms.",
    interests: ["Developer Tools", "AI Agents", "Compilers", "DX", "Open Source"],
    projects: [
      { name: "code-lens", description: "VS Code extension for inline complexity metrics." },
      { name: "prompt-forge", description: "Prompt evaluation harness for LLM agents." },
      { name: "toml-lsp", description: "Minimal language server for TOML files." },
    ],
    goals: [
      "Ship a meaningful PR to a major OSS project",
      "Contribute to an AI/agent framework",
      "Become a recognized maintainer in devtools",
    ],
    stats: { repos: 42, stars: 1280, followers: 356 },
    confidenceScore: 87,
  },
  repositories: [
    {
      id: "repo-1",
      name: "langchain",
      owner: "langchain-ai",
      url: "https://github.com/langchain-ai/langchain",
      score: 94,
      difficulty: "Intermediate",
      matchedSkills: ["Python", "LLMs", "Agents"],
      reason:
        "Strong match on Python + agent framework interests. Active issue triage with clear good-first-issue labels.",
      stars: 92000,
      language: "Python",
    },
    {
      id: "repo-2",
      name: "tanstack/router",
      owner: "TanStack",
      url: "https://github.com/TanStack/router",
      score: 89,
      difficulty: "Intermediate",
      matchedSkills: ["TypeScript", "React", "TanStack"],
      reason:
        "You already ship TanStack in production. Router has a healthy backlog of typed-API refinement tasks.",
      stars: 8600,
      language: "TypeScript",
    },
    {
      id: "repo-3",
      name: "supabase",
      owner: "supabase",
      url: "https://github.com/supabase/supabase",
      score: 82,
      difficulty: "Intermediate",
      matchedSkills: ["TypeScript", "PostgreSQL", "DX"],
      reason: "Wide surface area — dashboard, CLI, docs. Great for a first meaningful contribution.",
      stars: 74000,
      language: "TypeScript",
    },
    {
      id: "repo-4",
      name: "zed",
      owner: "zed-industries",
      url: "https://github.com/zed-industries/zed",
      score: 76,
      difficulty: "Advanced",
      matchedSkills: ["Rust", "Editors"],
      reason: "Aligned with your Rust interest. Steeper ramp, but strong maintainer response times.",
      stars: 51000,
      language: "Rust",
    },
    {
      id: "repo-5",
      name: "shadcn-ui",
      owner: "shadcn-ui",
      url: "https://github.com/shadcn-ui/ui",
      score: 71,
      difficulty: "Beginner",
      matchedSkills: ["React", "Tailwind", "TypeScript"],
      reason: "Low-friction contributions around components, a11y, and docs. Fast review cycles.",
      stars: 74000,
      language: "TypeScript",
    },
    {
      id: "repo-6",
      name: "vitest",
      owner: "vitest-dev",
      url: "https://github.com/vitest-dev/vitest",
      score: 68,
      difficulty: "Intermediate",
      matchedSkills: ["TypeScript", "Testing", "Vite"],
      reason: "Well-scoped tasks around reporters and coverage. Excellent contributor docs.",
      stars: 13000,
      language: "TypeScript",
    },
  ],
  details: {
    "repo-1": `## Overview
LangChain is a framework for developing applications powered by language models. It provides composable primitives for chains, agents, memory, and retrieval.

## Architecture
- **Core**: runnable interface, LCEL composition
- **Community**: integrations layer (vendor SDKs)
- **Experimental**: unstable APIs and research code

## Core Components
1. Runnables & LCEL
2. Chat models & prompt templates
3. Tools, agents & agent executors
4. Retrievers & vector stores

## Tech Stack
- Python 3.9+
- Pydantic v2
- Poetry for packaging
- Pytest + ruff

## Project Workflow
Fork → branch → \`make format lint test\` → PR against \`master\`. All PRs need passing CI and a reviewer from CODEOWNERS.

## Key Features
- Provider-agnostic model interface
- Streaming-first execution
- First-class async support

## Learning Path
Start in \`libs/core/langchain_core/runnables\`. Read the LCEL primer, then pick a \`good first issue\` in \`libs/community\`.`,
    "repo-2": `## Overview
TanStack Router is a fully type-safe router for React with first-class search-params, loaders, and file-based routing.

## Architecture
Monorepo (pnpm workspaces). Core router is framework-agnostic; adapters live per framework.

## Core Components
- Route matching engine
- Loader / preload lifecycle
- Search-params schema layer

## Tech Stack
TypeScript, Vite, Vitest, tsup.

## Project Workflow
\`pnpm i && pnpm dev\` in the affected package. Changesets required for user-facing changes.

## Key Features
- End-to-end type safety
- Search-first navigation
- SSR-ready primitives

## Learning Path
Read \`packages/router-core/src/router.ts\`, then browse issues tagged \`good first issue\` or \`docs\`.`,
  },
  issues: {
    "repo-1": [
      {
        id: "i1",
        number: 24310,
        title: "Improve error message when tool schema validation fails",
        difficulty: "Easy",
        estimatedTime: "2–3 hours",
        requiredSkills: ["Python", "Pydantic"],
        learningOutcome: "Learn how tool arguments are validated inside the agent executor.",
        url: "https://github.com/langchain-ai/langchain/issues/24310",
      },
      {
        id: "i2",
        number: 24188,
        title: "Add streaming support to `RunnableParallel`",
        difficulty: "Medium",
        estimatedTime: "1–2 days",
        requiredSkills: ["Python", "async"],
        learningOutcome: "Understand LCEL streaming internals and back-pressure handling.",
        url: "https://github.com/langchain-ai/langchain/issues/24188",
      },
      {
        id: "i3",
        number: 24001,
        title: "Docs: cookbook entry for structured output with tool calling",
        difficulty: "Easy",
        estimatedTime: "1 hour",
        requiredSkills: ["Docs", "Python"],
        learningOutcome: "Great first PR — learn the docs pipeline and MDX conventions.",
        url: "https://github.com/langchain-ai/langchain/issues/24001",
      },
    ],
    "repo-2": [
      {
        id: "i4",
        number: 2411,
        title: "Type inference regression for optional search params",
        difficulty: "Medium",
        estimatedTime: "4–6 hours",
        requiredSkills: ["TypeScript", "Generics"],
        learningOutcome: "Deep-dive into the router's generic search-param inference.",
        url: "https://github.com/TanStack/router/issues/2411",
      },
      {
        id: "i5",
        number: 2380,
        title: "Add example for auth-gated loader",
        difficulty: "Easy",
        estimatedTime: "2 hours",
        requiredSkills: ["React", "TypeScript"],
        learningOutcome: "Learn the loader lifecycle and how context flows through routes.",
        url: "https://github.com/TanStack/router/issues/2380",
      },
    ],
  },
  roadmap: {
    "repo-1": [
      { title: "Repository Setup", body: "Fork the repo, clone locally, install with `poetry install`, run `make test` to confirm a green baseline." },
      { title: "Where to Start", body: "Read `CONTRIBUTING.md` and the LCEL primer in `docs/`. Skim the last 20 merged PRs to learn the review culture." },
      { title: "First Contribution", body: "Pick a `good first issue` tagged `docs` or `community`. Keep the diff under 200 lines." },
      { title: "Contribution Opportunities", body: "Provider integrations, docs cookbook entries, and agent examples all have low-friction entry points." },
      { title: "Open Issues Analysis", body: "~180 open issues tagged `help wanted`. Median first-response time: 36h." },
      { title: "Required Skills", body: "Python 3.9+, familiarity with async iterators, basic Pydantic v2." },
      { title: "Contribution Workflow", body: "Branch → format/lint/test → PR → address review → squash-merge." },
      { title: "Common Mistakes", body: "Skipping `make format`, editing generated docs, or missing a changelog entry." },
      { title: "30-Day Plan", body: "Week 1: docs PR. Week 2: bug fix. Week 3: small feature. Week 4: review someone else's PR." },
    ],
  },
  checklist: [
    { id: "c1", rule: "Sign your commits with your real name and email", reason: "Pre-submission requirement" },
    { id: "c2", rule: "Follow the repo's PR description template", reason: "Pull request preparation step" },
    { id: "c3", rule: "Add tests for any behavioural changes", reason: "Pre-submission requirement" },
    { id: "c4", rule: "Use conventional commit style", reason: "Pull request preparation step" },
    { id: "c5", rule: "Link your PR to an existing issue", reason: "Pull request preparation step" },
    { id: "c6", rule: "Update documentation alongside code changes", reason: "Final check before opening the PR" },
  ],
};
