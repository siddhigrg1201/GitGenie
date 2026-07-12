import requests
import os
import json
from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found.")


client = genai.Client(api_key=api_key)



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

    print("README not found.")
    return ""




def fetch_issues(repo_name):

    url = (
        f"https://api.github.com/repos/"
        f"{repo_name}/issues"
        "?state=open&per_page=10"
    )


    try:
        response = requests.get(
            url,
            timeout=10
        )
    except requests.RequestException as e:
        print("Issue Fetch Failed:", e)
        return []


    if response.status_code != 200:
        print("GitHub API Error while fetching issues:", response.status_code)
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





def generate_roadmap(repo, readme, issues):


    prompt = f"""

You are an Open Source Contribution Mentor.

Analyze this GitHub repository and create a contribution roadmap for beginners.


Repository Information:

{json.dumps(repo, indent=2)}


README:

{readme[:6000]}


Open Issues:

{json.dumps(issues, indent=2)}



Generate the following:


## 1. Project Understanding

Explain:
- What this project does
- Problem it solves
- Target users


## 2. Repository Learning Path

Explain:
- Which folders to explore first
- Important files
- Development setup


## 3. Contribution Roadmap

Create steps:

Beginner:
- First contribution

Intermediate:
- Feature improvements

Advanced:
- Major contributions


## 4. Beginner Friendly Issues

Suggest suitable issues from available issues.


## 5. Required Skills

Mention:
- Languages
- Frameworks
- Tools


## 6. 30 Day Open Source Plan

Create a realistic learning and contribution schedule.


Return clean Markdown.
"""


    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
    except Exception as e:
        print("Gemini API Error:", e)
        return None

    return response.text






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

    if roadmap is None:
        print("Could not generate contribution roadmap.")
        return

    print("=" * 70)
    print("CONTRIBUTION ROADMAP")
    print("=" * 70)

    print(roadmap)



if __name__ == "__main__":
    main()