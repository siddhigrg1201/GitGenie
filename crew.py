from crewai import Crew, Process

from agents import (
    repository_recommender,
    repository_explainer,
    skill_analyzer,
    issue_recommender,
    roadmap_creator,
    checklist_creator
)

from tasks import (
    skill_task,
    repository_task,
    explanation_task,
    issue_task,
    roadmap_task,
    checklist_task
)

profile_crew = Crew(
    agents=[
        skill_analyzer
    ],
    tasks=[
        skill_task
    ],
    process=Process.sequential,
    verbose=True
)

recommendation_crew = Crew(
    agents=[
        repository_recommender,
        repository_explainer,
        issue_recommender,
        roadmap_creator,
        checklist_creator
    ],
    tasks=[
        repository_task,
        explanation_task,
        issue_task,
        roadmap_task,
        checklist_task
    ],
    process=Process.sequential,
    verbose=True
)