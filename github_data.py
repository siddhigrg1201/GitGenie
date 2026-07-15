"""
Pure GitHub REST API helpers used by the CrewAI tools.

Deliberately has NO LLM client setup (no genai.Client / Groq instantiation)
so importing this module never raises on missing API keys and never spins
up duplicate LLM clients. This is the "real data fetch" layer described in
the architecture: agents call these through tools.py instead of guessing.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_API = "https://api.github.com"

_github_token = os.getenv("GITHUB_TOKEN")

HEADERS = {"Accept": "application/vnd.github+json"}
if _github_token:
    HEADERS["Authorization"] = f"Bearer {_github_token}"


def search_github(query, per_page=10):
    """Search GitHub repositories. Returns a list of cleaned repo dicts."""
    url = f"{GITHUB_API}/search/repositories"
    params = {"q": query, "per_page": per_page, "sort": "stars", "order": "desc"}

    try:
        response = requests.get(url, params=params, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        return {"error": f"Request failed: {e}"}

    if response.status_code != 200:
        return {"error": f"GitHub API error {response.status_code}: {response.text[:200]}"}

    items = response.json().get("items", [])

    return [
        {
            "name": item.get("name", ""),
            "owner": item.get("owner", {}).get("login", ""),
            "description": item.get("description", ""),
            "language": item.get("language", ""),
            "stars": item.get("stargazers_count", 0),
            "forks": item.get("forks_count", 0),
            "topics": item.get("topics", []),
            "url": item.get("html_url", ""),
            "open_issues": item.get("open_issues_count", 0),
        }
        for item in items
    ]


def fetch_repository(repo_name):
    """Fetch metadata for owner/repo. Returns dict or an {'error': ...} dict."""
    url = f"{GITHUB_API}/repos/{repo_name}"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        return {"error": f"Request failed: {e}"}

    if response.status_code != 200:
        return {"error": f"Repository '{repo_name}' not found (status {response.status_code})."}

    data = response.json()
    return {
        "name": data.get("name"),
        "owner": data.get("owner", {}).get("login"),
        "description": data.get("description"),
        "language": data.get("language"),
        "stars": data.get("stargazers_count"),
        "forks": data.get("forks_count"),
        "topics": data.get("topics", []),
        "url": data.get("html_url"),
        "open_issues": data.get("open_issues_count", 0),
    }


def fetch_readme(repo_name):
    """Fetch raw README content for owner/repo. Returns a string."""
    url = f"{GITHUB_API}/repos/{repo_name}/readme"
    headers = {**HEADERS, "Accept": "application/vnd.github.raw+json"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
    except requests.RequestException:
        return "README could not be fetched."

    if response.status_code == 200:
        return response.text[:6000]  # keep prompt size sane

    return "README not found."


def fetch_file_tree(repo_name):
    """Fetch top-level files/folders for owner/repo."""
    url = f"{GITHUB_API}/repos/{repo_name}/contents"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        return [{"error": f"Request failed: {e}"}]

    if response.status_code != 200:
        return [{"error": f"Could not fetch contents (status {response.status_code})."}]

    contents = response.json()
    if not isinstance(contents, list):
        return [{"error": "Unexpected response from GitHub."}]

    return [
        {"name": item.get("name", ""), "type": item.get("type", ""), "path": item.get("path", "")}
        for item in contents
    ]


def fetch_issues(repo_name, per_page=20):
    """Fetch open issues (excluding PRs) for owner/repo."""
    url = f"{GITHUB_API}/repos/{repo_name}/issues"
    params = {"state": "open", "per_page": per_page}

    try:
        response = requests.get(url, params=params, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        return [{"error": f"Request failed: {e}"}]

    if response.status_code != 200:
        return [{"error": f"Could not fetch issues (status {response.status_code})."}]

    issues = response.json()

    return [
        {
            "title": issue.get("title"),
            "number": issue.get("number"),
            "labels": [label["name"] for label in issue.get("labels", [])],
            "comments": issue.get("comments", 0),
            "url": issue.get("html_url"),
        }
        for issue in issues
        if "pull_request" not in issue
    ]


def fetch_contributing_file(repo_name):
    """Fetch CONTRIBUTING.md content, checking common locations."""
    paths = ["CONTRIBUTING.md", ".github/CONTRIBUTING.md", "docs/CONTRIBUTING.md"]
    headers = {**HEADERS, "Accept": "application/vnd.github.raw"}

    for path in paths:
        url = f"{GITHUB_API}/repos/{repo_name}/contents/{path}"
        try:
            response = requests.get(url, headers=headers, timeout=10)
        except requests.RequestException:
            continue
        if response.status_code == 200:
            return response.text[:4000]

    return "CONTRIBUTING.md not found in this repository."
