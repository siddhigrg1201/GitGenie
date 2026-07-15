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
Analyze the developer profile below and create a structured summary of their
skills, experience level, and interests.

GitHub username: {github_username}
Experience level: {experience}
Interests: {interests}
""",
    expected_output="A structured developer profile.",
    agent=skill_analyzer
)

repository_task = Task(
    description="""
Recommend suitable GitHub repositories for this developer, based on the
profile produced in the previous task and on their stated interests: {interests}.

Use the GitHub Repository Search tool to find REAL repositories — build a
search query from the developer's languages/interests (e.g.
"language:python stars:50..5000"). Do not invent repositories; only
recommend repositories actually returned by the tool.
""",
    expected_output="Top GitHub repository recommendations, each backed by real tool data (name, owner, url, stars).",
    agent=repository_recommender,
    context=[skill_task]
)

explanation_task = Task(
    description="""
Explain the GitHub repository {repository} in beginner-friendly language.

If {repository} is "not provided", pick the top recommendation from the
previous task instead — otherwise you MUST use exactly {repository} and
must NOT substitute a different repository.

Use the GitHub Repository Info, README Fetcher, and File Tree tools to get
real data about the repository before writing the explanation. Base your
explanation only on what the tools return.
""",
    expected_output="Repository explanation grounded in real fetched data (description, tech stack from file tree, README highlights).",
    agent=repository_explainer,
    context=[repository_task]
)

issue_task = Task(
    description="""
Recommend beginner-friendly GitHub issues from the repository {repository}
(or the repository chosen in the previous task if {repository} was "not provided").

Use the GitHub Open Issues tool to fetch the real open issues for this
repository. Only recommend issues that were actually returned by the tool —
never invent issue numbers or titles. If the tool returns no issues, say so
plainly instead of making some up.
""",
    expected_output="List of beginner-friendly issues, each with the real issue number, title, and url from the tool.",
    agent=issue_recommender,
    context=[explanation_task]
)

roadmap_task = Task(
    description="""
Create a step-by-step contribution roadmap for {repository} (or the
repository chosen earlier if {repository} was "not provided"), tailored to
a developer with experience level: {experience}.

Use the README Fetcher, Open Issues, and CONTRIBUTING.md Fetcher tools to
ground the roadmap in the repository's actual setup instructions and
contribution rules, not generic assumptions.
""",
    expected_output="Contribution roadmap grounded in the real README/CONTRIBUTING.md content.",
    agent=roadmap_creator,
    context=[explanation_task, issue_task]
)

checklist_task = Task(
    description="""
Generate a pull request preparation checklist for a contributor submitting
work to {repository} (or the repository chosen earlier if {repository} was
"not provided").

Use the CONTRIBUTING.md Fetcher tool to base the checklist on this
repository's actual contribution rules where available, falling back to
general best practices only for anything CONTRIBUTING.md doesn't cover.
""",
    expected_output="Contribution checklist grounded in the real CONTRIBUTING.md rules where available.",
    agent=checklist_creator,
    context=[roadmap_task]
)