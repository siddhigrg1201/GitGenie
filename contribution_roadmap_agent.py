import requests
import os
import json
from dotenv import load_dotenv
from google import genai
from openai import OpenAI


load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
fallback_key = os.getenv("GROQ_API_KEY")

if not gemini_key:
    raise ValueError("GEMINI_API_KEY not found.")

if not fallback_key:
    raise ValueError("GROQ_API_KEY not found.")

gemini_client = genai.Client(api_key=gemini_key)

fallback_client = OpenAI(
    api_key=fallback_key,
    base_url="https://api.groq.com/openai/v1"
)


def fetch_repository(repo_name):

    url = f"https://api.github.com/repos/{repo_name}"

    try:
        response = requests.get(url, timeout=10)
    except requests.RequestException as e:
        print("GitHub Request Failed:", e)
        return None


    if response.status_code != 200:
        print("Repository not found.")
        return None


    data = response.json()


    return {
        "name": data.get("name"),
        "owner": data.get("owner", {}).get("login"),
        "description": data.get("description"),
        "language": data.get("language"),
        "stars": data.get("stargazers_count"),
        "forks": data.get("forks_count"),
        "topics": data.get("topics"),
        "url": data.get("html_url")
    }




def fetch_readme(repo_name):

    url = f"https://api.github.com/repos/{repo_name}/readme"

    headers = {
        "Accept": "application/vnd.github.raw+json"
    }


    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )
    except requests.RequestException:
        return ""


    if response.status_code == 200:
        return response.text


    return ""




def fetch_issues(repo_name):

    url = (
        f"https://api.github.com/repos/"
        f"{repo_name}/issues"
        "?state=open&per_page=10"
    )


    response = requests.get(url)


    if response.status_code != 200:
        return []


    issues = response.json()

    issue_list = []


    for issue in issues:

        # Ignore pull requests
        if "pull_request" not in issue:

            issue_list.append(
                {
                    "title": issue.get("title"),
                    "labels": [
                        label["name"]
                        for label in issue.get("labels", [])
                    ],
                    "url": issue.get("html_url")
                }
            )


    return issue_list

def generate_with_gemini(prompt):

    response = gemini_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text

def generate_with_fallback(prompt):

    response = fallback_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
)

    return response.choices[0].message.content

def generate_response(prompt):

    try:
        return generate_with_gemini(prompt)

    except Exception:

        try:
            return generate_with_fallback(prompt)

        except Exception:

            return (
                "Unable to generate the contribution roadmap because "
                "both AI providers are currently unavailable."
            )



def generate_roadmap(repo, readme, issues):


    prompt = f"""

You are an expert Open Source Mentor.

Your job is to create a repository-specific contribution roadmap for beginners.

Repository Information:

{json.dumps(repo, indent=2)}

README:

{readme[:4000]}

Open Issues:

{json.dumps(issues, indent=2)}

Analyze the repository and generate the following:

# Repository Setup
Explain how to set up this specific repository locally.
Mention installation commands, dependencies, build steps, and test commands if they are available.

# Where Should a Beginner Start?
Recommend the first files, folders, or documentation to read before contributing and explain why.

# First Contribution Recommendation
Recommend ONE beginner-friendly contribution based on this repository.
Mention:
- File/Folder to modify
- Estimated difficulty (Easy/Medium/Hard)
- Estimated time
- Why it is a good first contribution

# Contribution Opportunities
Suggest contributions specific to this repository under:

## Beginner
## Intermediate
## Advanced

Base your suggestions on the repository structure and available issues.

# Open Issues Analysis
From the provided GitHub issues:
- Recommend the best beginner-friendly issues.
- Explain why each issue is suitable.
- Mention any required skills.

# Skills Required
List the languages, frameworks, and tools required to contribute to THIS repository.

# Contribution Workflow
Explain the complete workflow:
Fork → Clone → Setup → Create Branch → Code → Test → Commit → Push → Pull Request

Mention repository-specific steps if available in the README.

# Common Mistakes to Avoid
List common mistakes beginners should avoid when contributing to this repository.

# 30-Day Contribution Plan
Create a realistic week-by-week plan to become capable of contributing successfully to this repository.

Rules:
- Make every recommendation repository-specific.
- Use the README and issues as the primary source.
- Do NOT explain the repository architecture.
- Do NOT repeat generic GitHub advice unless necessary.
- Do NOT invent information that is not supported by the repository.
- Return clean Markdown only.
"""


    return generate_response(prompt)

def main():


    print("\n================================")
    print(" Contribution Roadmap Agent ")
    print("================================\n")


    repo_name = input(
        "Enter GitHub Repository(owner/repo): "
    ).strip()



    repo = fetch_repository(repo_name)


    if repo is None:
        return



    print("\nFetching repository data...\n")


    readme = fetch_readme(repo_name)

    issues = fetch_issues(repo_name)



    print("Generating contribution roadmap...\n")


    roadmap = generate_roadmap(
        repo,
        readme,
        issues
    )



    print("=" * 70)
    print("CONTRIBUTION ROADMAP")
    print("=" * 70)

    print(roadmap)



if __name__ == "__main__":
    main()