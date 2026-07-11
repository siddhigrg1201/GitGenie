import requests
from google import genai
from dotenv import load_dotenv
import os
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found.")

client = genai.Client(api_key=api_key)


def fetch_repository(repo_name):
    """
    Fetch repository details from GitHub API.
    """

    url = f"https://api.github.com/repos/{repo_name}"

    try:
        response = requests.get(url, timeout=10)
    except requests.RequestException as e:
        print("Request Failed:", e)
        return None

    if response.status_code != 200:
        print("GitHub API Error:", response.status_code)
        return None

    data = response.json()

    repository = {
        "name": data.get("name", ""),
        "owner": data.get("owner", {}).get("login", ""),
        "description": data.get("description", ""),
        "language": data.get("language", ""),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "topics": data.get("topics", []),
        "license": data.get("license", {}).get("spdx_id", "No License")
        if data.get("license")
        else "No License",
        "url": data.get("html_url", ""),
        "default_branch": data.get("default_branch", "main"),
    }

    return repository


def fetch_readme(repo_name):
    """
    Fetch README.md content.
    """

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
    except requests.RequestException as e:
        print("README Fetch Failed:", e)
        return ""

    if response.status_code != 200:
        print("README not found.")
        return ""

    return response.text


def fetch_file_tree(repo_name):
    """
    Fetch top-level files and folders.
    """

    url = f"https://api.github.com/repos/{repo_name}/contents"

    try:
        response = requests.get(url, timeout=10)
    except requests.RequestException as e:
        print("File Tree Fetch Failed:", e)
        return []

    if response.status_code != 200:
        print("Could not fetch repository contents.")
        return []

    contents = response.json()

    file_tree = []

    for item in contents:
        file_tree.append(
            {
                "name": item.get("name", ""),
                "type": item.get("type", ""),
                "path": item.get("path", ""),
            }
        )

    return file_tree


def explain_repository(repository, readme, file_tree):

    prompt = f"""
You are an experienced Open Source Mentor.

Below are the repository details.

Repository Information:

{json.dumps(repository, indent=2)}

README:

{readme[:6000]}

Top Level Files:

{json.dumps(file_tree, indent=2)}

Your task is to explain this repository in beginner-friendly language.

Generate the following sections:

1. Repository Overview
   - What does this project do?
   - What problem does it solve?

2. Repository Architecture
   - Explain the purpose of important folders/files.

3. Tech Stack
   Mention:
   - Programming Language
   - Framework
   - Package Manager
   - Build Tool
   - Testing Tool
   (Infer these from the README and files if possible.)

4. Important Files
   Explain why these files are important:
   - README.md
   - CONTRIBUTING.md
   - package.json
   - requirements.txt
   - src/
   - docs/

5. Beginner Entry Points
   Tell a beginner:
   - Which files to read first
   - Which folders to explore
   - How to understand the project

Return the response in clean Markdown.

Do NOT return JSON.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text


def generate_repository_explanation(repo_name):

    repository = fetch_repository(repo_name)

    if repository is None:
        return None

    readme = fetch_readme(repo_name)

    file_tree = fetch_file_tree(repo_name)

    explanation = explain_repository(
        repository,
        readme,
        file_tree
    )

    return explanation


def main():

    print("\n==========================================")
    print("     GitHub Repository Explainer Agent")
    print("==========================================\n")

    repo_name = input(
        "Enter GitHub Repository (owner/repository): "
    ).strip()

    if not repo_name:
        print("Repository name cannot be empty.")
        return

    print("\nFetching repository information...\n")

    explanation = generate_repository_explanation(repo_name)

    if explanation is None:
        print("Could not generate repository explanation.")
        return

    print("\n")
    print("=" * 70)
    print("REPOSITORY EXPLANATION")
    print("=" * 70)
    print("\n")

    print(explanation)


if __name__ == "__main__":
    main()
