# GitGenie

### AI-Powered Open Source Contribution Assistant

GitGenie is an AI-powered assistant that helps beginners understand GitHub repositories and make meaningful open-source contributions.

It uses multiple AI agents to analyze repositories, recommend projects, explain codebases, identify suitable issues, and create personalized contribution roadmaps using real GitHub data.

---

# 🚀 Features

## 1. Repository Explainer Agent

Helps beginners understand any GitHub repository.

It provides:

- Repository overview
- Tech stack information
- Important files explanation
- Beginner entry points
- Project understanding guidance

---

## 2. Repository Recommendation Agent

Helps users discover suitable open-source repositories based on their interests and skill level.

It analyzes:

- Repository popularity
- Programming language
- Difficulty level
- Beginner friendliness

---

## 3. Skill Analysis Agent

Helps contributors understand the skills required for a particular repository.

It recommends:

- Required programming languages
- Frameworks and tools
- Learning path
- Skills needed before contributing

---

## 4. Issue Recommendation Agent

Analyzes GitHub issues and recommends suitable issues for contributors.

It provides:

- Beginner-friendly issue suggestions
- Issue difficulty analysis
- Required skills
- Reason why an issue is suitable

---

## 5. Contribution Roadmap Agent

Creates a repository-specific contribution roadmap.

It provides:

- Repository setup instructions
- Where beginners should start
- First contribution suggestions
- Beginner, intermediate, and advanced contribution opportunities
- Open issue analysis
- Contribution workflow
- 30-day contribution plan

---

## 6. Contribution Checklist Agent

Helps contributors prepare before submitting their Pull Request.

It provides:

- Pre-contribution checklist
- Code quality reminders
- Testing checklist
- Git workflow guidance
- PR submission best practices

---

# 🏗️ Project Structure

```
GitGenie
│
├── repository_explainer_agent.py
├── repository_recommendation_agent.py
├── contribution_roadmap_agent.py
├── contribution_checklist_agent.py
├── issue_recommendation_agent.py
├── skill_agent.py
│
├── requirements.txt
└── README.md
```

---

# 🛠️ Tech Stack

- Python
- Google Gemini API
- Groq API (Fallback LLM)
- GitHub REST API
- OpenAI SDK Compatible Client
- Requests
- python-dotenv

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/siddhigrg1201/GitGenie.git
```

Navigate into the project:

```bash
cd GitGenie
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 🔑 Environment Setup

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_personal_access_token
```

`GITHUB_TOKEN` is optional but strongly recommended: without it, GitHub's
API is limited to 60 requests/hour; with a token (no special scopes
needed — a plain classic token from
https://github.com/settings/tokens works), it's 5000 requests/hour.

---

# ▶️ Usage

Run any agent individually according to your requirement.

---

## 1. Repository Explainer Agent

Explains a GitHub repository and helps beginners understand the project.

Run:

```bash
python repository_explainer_agent.py
```

Example input:

```
tiangolo/fastapi
```

---

## 2. Repository Recommendation Agent

Recommends suitable open-source repositories based on user interests and skills.

Run:

```bash
python repository_recommendation_agent.py
```

Example input:

```
Machine Learning beginner projects
```

---

## 3. Skill Analysis Agent

Analyzes the skills required to contribute to a repository.

Run:

```bash
python skill_agent.py
```

Example input:

```
langchain-ai/langchain
```

---

## 4. Issue Recommendation Agent

Finds and recommends beginner-friendly GitHub issues.

Run:

```bash
python issue_recommendation_agent.py
```

Example input:

```
pallets/flask
```

---

## 5. Contribution Roadmap Agent

Creates a step-by-step contribution roadmap for a repository.

Run:

```bash
python contribution_roadmap_agent.py
```

Example input:

```
langchain-ai/langchain
```

---

## 6. Contribution Checklist Agent

Generates a checklist to help contributors prepare their Pull Request.

Run:

```bash
python contribution_checklist_agent.py
```

Example input:

```
tiangolo/fastapi
```

---

# 🔄 AI Fallback System

GitGenie uses multiple AI providers to improve reliability.

```
User Request
      |
      ↓
 Gemini API
      |
      ↓
 If unavailable
      |
      ↓
 Groq API
```

If Gemini reaches its usage limit, the system automatically switches to Groq.

---

# 🌟 Agent Workflow

```
Repository Input
        |
        ↓
Repository Recommendation Agent
        |
        ↓
Repository Explainer Agent
        |
        ↓
Skill Analysis Agent
        |
        ↓
Issue Recommendation Agent
        |
        ↓
Contribution Roadmap Agent
        |
        ↓
Contribution Checklist Agent
        |
        ↓
Ready for Open Source Contribution 🚀
```

---

# 🎯 Future Improvements

- Streamlit/Web interface
- GitHub authentication
- Pull Request analysis agent
- Automated code review agent
- Issue difficulty prediction
- Personalized contributor profiles
- Multi-agent orchestration using LangGraph

---

# 👩‍💻 Contributors

### Siddhi Garg
GitHub: https://github.com/siddhigrg1201

### Shambhavi Garg

### Shivangi Gupta

### Shruti Kumari

---

# 📌 Goal
The goal of GitGenie is to reduce the entry barrier for beginners in open source by providing AI-powered guidance from repository discovery to successful contribution.
