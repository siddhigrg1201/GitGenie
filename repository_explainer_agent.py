import requests
from google import genai
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
groq_key = os.getenv("GROQ_API_KEY")

if not gemini_key:
    raise ValueError("GEMINI_API_KEY not found.")

if not groq_key:
    raise ValueError("GROQ_API_KEY not found.")
gemini_client = genai.Client(api_key=gemini_key)

groq_client = OpenAI(
    api_key=groq_key,
    base_url="https://api.groq.com/openai/v1"
)


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

def generate_with_gemini(prompt):

    response = gemini_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text

def generate_with_groq(prompt):

    response = groq_client.chat.completions.create(
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
        return generate_with_groq(prompt)

    try:
        return generate_with_groq(prompt)

    except Exception as groq_error:
        print("Groq failed.")
        print(groq_error)

        return "Both Gemini and Groq are currently unavailable."


def explain_repository(repository, readme, file_tree):

    prompt = f"""
You are an expert Open Source Software Architect.

Your job is to explain how this GitHub repository works.

Repository Information:

{json.dumps(repository, indent=2)}

README:

{readme[:6000]}

Top Level Files:

{json.dumps(file_tree, indent=2)}

Generate the following sections:

# Repository Overview
- What does this project do?
- What problem does it solve?
- Who is the target audience?

# Project Architecture
Explain the overall structure of the project.

# Core Components
Explain ONLY the important folders/files that actually exist in this repository and what each one does.

# Tech Stack
Mention only the technologies actually used:
- Programming Language
- Framework
- Libraries
- Package Manager
- Build Tool
- Testing Framework

# Project Workflow
Explain how the project works internally from start to finish.

# Key Features
List the major features of this project.

# Learning Path
Suggest the order in which a beginner should explore this repository to understand it.

Rules:
- Do NOT talk about contribution.
- Do NOT suggest GitHub issues.
- Do NOT explain missing files.
- Do NOT write "not present".
- Keep explanations concise and repository-specific.
- Return clean Markdown only.
"""
    
    return generate_response(prompt)

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
