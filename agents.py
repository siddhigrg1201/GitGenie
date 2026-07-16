import os
from dotenv import load_dotenv
from crewai import Agent
from fallback_llm import GeminiGroqFallbackLLM
from tools import (
    github_search_tool,
    github_repo_info_tool,
    github_readme_tool,
    github_file_tree_tool,
    github_issues_tool,
    github_contributing_tool,
    github_user_profile_tool,
)

load_dotenv()


# ============================
# Actual LLMs
# ============================



# ============================
# Gemini + Groq Fallback
# ============================
llm = GeminiGroqFallbackLLM()

# ============================
# Agents
# ============================


repository_recommender = Agent(
    role="Repository Recommendation Expert",
    goal=(
        "Recommend the best GitHub repositories for a user by searching "
        "real GitHub data. Never invent repositories that were not returned "
        "by the GitHub Repository Search tool."
    ),
    backstory="Expert in matching developers with suitable open source repositories.",
    tools=[github_search_tool, github_repo_info_tool],
    llm=llm,
    verbose=True
)


repository_explainer = Agent(
    role="Repository Explainer",
    goal=(
        "Explain GitHub repositories in beginner friendly language, using "
        "the real repository metadata, README, and file tree fetched via "
        "tools. Never guess or substitute a different repository than the "
        "one given."
    ),
    backstory="Expert software architect who simplifies complex repositories.",
    tools=[github_repo_info_tool, github_readme_tool, github_file_tree_tool],
    llm=llm,
    verbose=True
)


skill_analyzer = Agent(
    role="Skill Analyzer",
    goal=(
        "Analyze a developer's GitHub profile using real GitHub data. "
        "Identify programming languages, frameworks, libraries, tools, "
        "experience level, interests and strengths only from repository evidence. "
        "Never hallucinate technologies."
    ),
    backstory=(
        "Experienced software engineer and technical recruiter who analyzes "
        "GitHub profiles and creates evidence-based developer assessments."
    ),
    tools=[
        github_user_profile_tool,
        github_repo_info_tool,
        github_readme_tool,
        github_file_tree_tool
    ],
    llm=llm,
    verbose=True,
    allow_delegation=False
)


issue_recommender = Agent(
    role="Issue Recommendation Expert",
    goal=(
        "Recommend beginner friendly GitHub issues using the real open "
        "issues fetched via tools. Never invent issue numbers or titles."
    ),
    backstory="Experienced open source contributor who finds good first issues.",
    tools=[github_issues_tool, github_readme_tool],
    llm=llm,
    verbose=True
)


roadmap_creator = Agent(
    role="Contribution Roadmap Creator",
    goal="Create a step-by-step open source contribution roadmap grounded in the real repository README and open issues.",
    backstory="Open source mentor helping developers make successful contributions.",
    tools=[github_readme_tool, github_issues_tool, github_contributing_tool],
    llm=llm,
    verbose=True
)


checklist_creator = Agent(
    role="Contribution Checklist Creator",
    goal="Generate a checklist before submitting a pull request, based on the repository's real CONTRIBUTING.md rules.",
    backstory="Experienced GitHub reviewer ensuring contribution quality.",
    tools=[github_contributing_tool],
    llm=llm,
    verbose=True
)