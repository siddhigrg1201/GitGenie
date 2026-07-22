from crewai import Task
from agents import (
    repository_recommender,
    repository_explainer,
    skill_analyzer,
    issue_recommender,
    roadmap_creator,
    checklist_creator
)

skill_task = Task(
    description="""
Build a structured developer profile for GitHub user "{github_username}" as an expert GitHub Profile Analyzer/Recruiter.
Use ONLY the GitHub User Profile tool, exactly once.

SUFFICIENCY: Data is sufficient if ANY: languages_by_repo_count non-empty, multiple non-fork repos exist, or meaningful project history exists.
- If sufficient: github_data_used=true, build profile using ONLY GitHub data.
- If insufficient: github_data_used=false, do NOT guess. Fill missing_information only with unavailable fields. Leave profile fields empty (frontend will collect from user).

EVIDENCE RULES:
- Languages: only those GitHub reports.
- Interests: infer only from repo descriptions/topics/tech used.
- Experience Level (Beginner/Intermediate/Advanced): pick lowest confidence level if evidence weak.
- Strengths: evidence-based only.
- Learning Path: recommend only tech NOT already demonstrated.
- Never hallucinate frameworks/repos/experience.

If github_data_used=false: missing_information ⊆ ["languages","experience_level","interests","learning_goal"], notes="Additional user information is required."

OUTPUT RULES: GitHub tool only, no other tools. No Markdown, no reasoning explanation. Return ONLY raw JSON per schema below.
""",
    expected_output="""
Return ONLY valid JSON.
{
  "github_data_used": true,
  "missing_information": [],
  "languages": [],
  "experience_level": "",
  "interests": [],
  "strengths": [],
  "recommended_learning_path": [],
  "notes": ""
}
""",
    agent=skill_analyzer,
)


repository_task = Task(
    description="""
You are an expert Open Source Mentor and GitHub Repository Recommendation Engine.
Recommend GitHub repos for a developer using their profile below, and if given, evaluate the user-selected repo.

Developer Profile: {developer_profile}
Developer Selected Repository: {user_repository}

OBJECTIVES:
1. Always generate personalized recommendations.
2. If user gave a repository, validate it exists (do NOT judge if it "matches" skill level — never reject as too easy/hard).
3. Use ONLY real repos from GitHub Repository Search Tool. Never invent names/owners/URLs/languages/topics/technologies/stats/stars/forks/activity.

STEP 1 — Recommendation (always runs):
Search using developer's languages/frameworks/technologies/interests/experience level. E.g. queries: "language:python good-first-issues", "language:typescript react", "fastapi stars:100..10000".
Return EXACTLY 10 repos if available, else return all suitable verified ones found. No duplicates.

STEP 2 — Selection logic:
CASE A (user_repository provided, not "not provided"/empty/null):
  - Validate existence via GitHub tools only (no suitability check).
  - Exists → status="PROVIDED", selected_repository = user repo exactly as given (priority for downstream regardless of fit/rank). It may also appear in recommended_repositories if it scores well.
  - Not found → status="INVALID", selected_repository={}, message explains it couldn't be verified. Still return full recommendation list from profile.
CASE B (no user_repository): status="AUTO", selected_repository = rank #1 from recommended_repositories.
Never pick a selected_repository other than the validated user repo (PROVIDED) or rank #1 (AUTO).
Downstream agents (Repository Explainer, Issue Recommendation, Contribution Roadmap, Contribution Checklist) must use ONLY selected_repository, never switch.

STEP 3 — Scoring (integers 0-100 each, per repo):
- language_match: how well repo's primary language(s) match profile (100=perfect...0=none).
- skill_match: fit vs developer's known frameworks/libs/backend/frontend/DB/cloud/DevOps/testing/APIs; more unknown tech = lower score.
- repository_activity: recent commits, maintainers, PRs, community engagement, health.
- issue_friendliness: good-first-issue/beginner/help-wanted labels, issue clarity, onboarding ease.
- documentation_quality: README completeness, install/contribution guides, examples, API docs.
- difficulty: exactly "Easy"|"Medium"|"Hard", based on code complexity, tech stack, repo size, contribution process, experience needed.

STEP 4 — Overall Score (integer 0-100):
overall_score = round(0.35×language_match + 0.20×repository_activity + 0.15×issue_friendliness + 0.15×documentation_quality + 0.15×skill_match)

STEP 5 — Ranking order: (1) highest overall_score, tie→(2) easier difficulty (Easy>Medium>Hard), tie→(3) higher repository_activity, tie→(4) higher documentation_quality, tie→(5) higher skill_match. Rank #1 = strongest overall pick. If two scores differ by <3, prefer lower difficulty.

STEP 6 — Reasons: each repo needs 3-5 concise, evidence-based reasons (e.g. "Strong language match", "Active maintainers", "Good First Issues available", "Beginner-friendly contribution process"). No vague filler like "good repository"/"looks interesting"/"popular project".

TECHNOLOGY DETECTION: infer tech only from repo language/topics/README/description/file structure — never assume co-occurring tech (e.g. React ⇒ don't assume Redux/Tailwind/Vite/Firebase) unless evidenced.

OUTPUT: Return ONLY one valid JSON object, directly parseable via json.loads() — no markdown, no backticks, no commentary before/after.
{
  "status": "PROVIDED | AUTO | INVALID",
  "message": "Short explanation for the user.",
  "selected_repository": {},
  "recommended_repositories": [
    {
      "rank": 1, "repository": "", "owner": "", "url": "",
      "overall_score": 94, "difficulty": "Easy",
      "language_match": 98, "skill_match": 95,
      "repository_activity": 90, "issue_friendliness": 92,
      "documentation_quality": 94,
      "matched_skills": ["Python", "FastAPI", "Git"],
      "reason": ["Strong language match", "Excellent documentation", "Good First Issues", "Active maintainers"]
    }
  ]
}
rank starts at 1; all score fields are integers 0-100; difficulty is exactly Easy/Medium/Hard; up to 10 unique repos sorted by overall_score descending per ranking rules above.
""",
    expected_output="""
Return exactly one valid JSON object with: status, message, selected_repository, recommended_repositories.
Each recommended repository includes: rank, repository, owner, url, overall_score, difficulty, language_match, skill_match, repository_activity, issue_friendliness, documentation_quality, matched_skills, reason.
Return ONLY raw JSON. No markdown. No explanations. Must be directly parseable via json.loads().
""",
    agent=repository_recommender,
)

explanation_task = Task(
    description="""
Explain the selected_repository returned by repository_task, in
beginner-friendly language.

Rules for choosing which repository to explain:
- If the user provided a repository and repository_task validated it
  (status == "PROVIDED"), analyze that selected_repository.
- If the user did not provide a repository (status == "AUTO"), analyze the
  rank #1 recommended repository, which repository_task set as
  selected_repository.
- Never switch to another repository from the recommendation list.
- If selected_repository is empty (status == "INVALID"),
  state plainly that no repository could be selected for explanation and
  do not fabricate one.

Use the GitHub Repository Info, README Fetcher, and File Tree tools to get
real data about the repository before writing the explanation. Base your
explanation only on what the tools return.

Generate the following sections:

# Repository Overview
What does this project do? What problem does it solve? Who is the target audience?

# Project Architecture
Explain the overall structure of the project.

# Core Components
Explain ONLY the important folders/files that actually exist in this repository (from the File Tree tool) and what each one does.

# Tech Stack
Mention only technologies actually used: Programming Language, Framework, Libraries, Package Manager, Build Tool, Testing Framework.

# Project Workflow
Explain how the project works internally from start to finish.

# Key Features
List the major features of this project.

# Learning Path
Suggest the order in which a beginner should explore this repository to understand it.

Rules:
- Do NOT talk about contribution or GitHub issues in this task.
- Do NOT explain missing files or write "not present".
- Keep explanations concise and repository-specific.
- Return clean Markdown only.
""",
    expected_output="""
Return ONLY valid JSON.

{
  "repository_overview": "",
  "project_architecture": "",
  "core_components": [
    {
      "name": "",
      "purpose": ""
    }
  ],
  "tech_stack": {
    "languages": [],
    "frameworks": [],
    "libraries": [],
    "package_manager": [],
    "build_tools": [],
    "testing": []
  },
  "project_workflow": "",
  "key_features": [],
  "learning_path": []
}

Rules:
- Return ONLY raw JSON.
- No Markdown.
- No explanations.
- No code fences.
- Output must be directly parseable using json.loads().
""",
    agent=repository_explainer,
    context=[repository_task]
)

issue_task = Task(
    description="""
You are an Open Source Mentor.

Your task is to recommend beginner-friendly GitHub issues ONLY from the
selected_repository returned by repository_task.

Repository Selection Rules
--------------------------
- Use ONLY selected_repository from repository_task.
- Never switch to another repository.
- Never use repositories from the recommendation list.
- If selected_repository is empty (status == "INVALID"), return an empty issue list.

Issue Retrieval
---------------
Use the GitHub Open Issues tool.

Recommend ONLY issues returned by the tool.

Never invent:
- Issue numbers
- Issue titles
- Labels
- URLs
- Difficulty

Issue Selection Rules
---------------------
If fewer than 15 issues exist:
- Return ALL issues.

If 15 or more issues exist:
- Return the BEST 15 beginner-friendly issues.

Prioritize issues having labels such as:
- good first issue
- beginner
- help wanted
- documentation
- enhancement
- bug (simple)

If labels are unavailable, rank issues using:
- Simplicity of description
- Low implementation complexity
- Smaller scope

Sort the final list as:

Easy
↓

Medium
↓

Hard

For every issue provide:

- Issue Number
- Issue Title
- Issue URL
- Difficulty
- Labels
- Why Suitable
- Required Skills
- Estimated Time
- Learning Outcome

Return ONLY raw JSON.
No Markdown.
No explanations.
No extra text.
""",
    expected_output="""
Return ONLY valid JSON.

{
  "repository": {
    "name": "",
    "owner": "",
    "url": ""
  },
  "total_open_issues": 0,
  "recommended_count": 0,
  "issues": [
    {
      "issue_number": 0,
      "issue_title": "",
      "issue_url": "",
      "difficulty": "Easy",
      "labels": [],
      "why_suitable": "",
      "skills_required": [],
      "estimated_time": "",
      "learning_outcome": ""
    }
  ]
}

Rules:
- Return ONLY issues fetched using the GitHub Open Issues tool.
- Never invent issue numbers, titles, labels or URLs.
- Return all issues if fewer than 15 exist.
- Otherwise return the best 15 issues.
- Sort issues Easy → Medium → Hard.
- JSON must be directly parseable using json.loads().
- Return ONLY raw JSON.
""",
    agent=issue_recommender,
    context=[repository_task]
)

roadmap_task = Task(
    description="""
Create a step-by-step contribution roadmap only for the selected_repository
returned by repository_task, tailored to a developer with experience
level: {experience}.

Never select another repository from the recommendation list — use only
the repository repository_task set as selected_repository.

If selected_repository is empty (status == "INVALID"), state
plainly that no repository was selected and a roadmap cannot be generated.

Use the README Fetcher, Open Issues, and CONTRIBUTING.md Fetcher tools to
ground the roadmap in the repository's actual setup instructions and
contribution rules, not generic assumptions.

Generate the following sections:

# Repository Setup
How to set up this specific repository locally: installation commands, dependencies, build steps, test commands (only if available).

# Where Should a Beginner Start?
Recommend the first files, folders, or documentation to read before contributing, and explain why.

# First Contribution Recommendation
Recommend ONE beginner-friendly contribution based on this repository: File/Folder to modify, Estimated difficulty (Easy/Medium/Hard), Estimated time, Why it is a good first contribution.

# Contribution Opportunities
Suggest contributions specific to this repository under: ## Beginner, ## Intermediate, ## Advanced.

# Open Issues Analysis
From the real fetched issues: recommend the best beginner-friendly ones, explain why each is suitable, mention required skills.

# Skills Required
List the languages, frameworks, and tools required to contribute to THIS repository.

# Contribution Workflow
Fork -> Clone -> Setup -> Create Branch -> Code -> Test -> Commit -> Push -> Pull Request. Mention repository-specific steps if available in the README.

# Common Mistakes to Avoid
List common mistakes beginners should avoid when contributing to this repository.

# 30-Day Contribution Plan
A realistic week-by-week plan to become capable of contributing successfully to this repository.

Rules:
- Make every recommendation repository-specific, grounded in the real README/CONTRIBUTING.md/issues data.
- Do NOT explain the repository architecture (that belongs to the explanation task).
- Do NOT invent information not supported by the repository.
- Return clean Markdown only.
""",
   expected_output="""
Return ONLY valid JSON.

{
  "repository": "",
  "repository_setup": {
    "installation": [],
    "dependencies": [],
    "build_steps": [],
    "test_commands": []
  },
  "beginner_start": {
    "files_or_folders": [],
    "reason": ""
  },
  "first_contribution": {
    "title": "",
    "target_file_or_folder": "",
    "difficulty": "Easy",
    "estimated_time": "",
    "reason": ""
  },
  "contribution_opportunities": {
    "beginner": [],
    "intermediate": [],
    "advanced": []
  },
  "open_issues_analysis": [
    {
      "issue_number": 0,
      "issue_title": "",
      "difficulty": "",
      "why_suitable": "",
      "required_skills": []
    }
  ],
  "skills_required": {
    "languages": [],
    "frameworks": [],
    "tools": []
  },
  "contribution_workflow": [],
  "common_mistakes": [],
  "thirty_day_plan": {
    "week_1": [],
    "week_2": [],
    "week_3": [],
    "week_4": []
  }
}

Rules:
- Use ONLY the selected_repository.
- Base the roadmap ONLY on the repository README, CONTRIBUTING.md and Open Issues.
- Never invent setup commands, files, folders, issues or technologies.
- If information is unavailable, return empty arrays or empty strings instead of guessing.
- Return ONLY raw JSON.
- No Markdown.
- No explanations.
- No code fences.
- Output must be directly parseable using json.loads().
""",
agent=roadmap_creator,
context=[repository_task]
)

checklist_task = Task(
    description="""
Generate a pull request PREPARATION checklist for a contributor about to
submit work only to the selected_repository returned by repository_task.
This is a pre-submission checklist (the contributor has not opened a PR
yet), not a review of an existing PR.

Never switch repositories — use only the repository repository_task set as
selected_repository.

If selected_repository is empty (status == "INVALID"), state
plainly that no repository was selected and a checklist cannot be
generated.

Use the CONTRIBUTING.md Fetcher tool to base the checklist on this
repository's actual contribution rules where available, falling back to
general open-source best practices only for anything CONTRIBUTING.md
doesn't cover.

Organize the checklist under these sections:

### Pre-Submission Checklist
Repository familiarization, issue selection, development environment setup, code changes, testing and validation.

### Pull Request Preparation
Commit message quality, PR creation (title, description, linked issue, summary of changes).

### Final Checklist
Repository guidelines followed, code quality, testing and validation, PR readiness.

Rules:
- Ground every item in the real CONTRIBUTING.md content where it exists; note explicitly where you're falling back to general best practice because CONTRIBUTING.md didn't cover something.
- Return clean Markdown only.
""",
    expected_output="""
Return ONLY valid JSON.

{
  "repository": "",
  "pre_submission_checklist": [
    ""
  ],
  "pull_request_preparation": [
    ""
  ],
  "final_checklist": [
    ""
  ],
  "notes": ""
}

Rules:
- Use ONLY the selected_repository.
- Base every checklist item on the repository's CONTRIBUTING.md whenever available.
- If CONTRIBUTING.md is missing or incomplete, use general GitHub open-source best practices only for the missing parts.
- Do NOT invent repository-specific rules.
- Keep checklist items short and actionable.
- Return ONLY raw JSON.
- No Markdown.
- No explanations.
- No code fences.
- Output must be directly parseable using json.loads().
""",
agent=checklist_creator,
context=[roadmap_task]
)
