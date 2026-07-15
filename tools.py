import json

from crewai.tools import tool

import github_data


@tool("GitHub Repository Search")
def github_search_tool(query: str) -> str:
    """Search GitHub repositories via the GitHub Search API.
    Input: a GitHub search query string, e.g. 'language:python stars:50..5000 topic:beginner-friendly'.
    Returns JSON: a list of repos with name, owner, description, language, stars, forks, topics, url."""
    return json.dumps(github_data.search_github(query))


@tool("GitHub Repository Info")
def github_repo_info_tool(repo_name: str) -> str:
    """Fetch metadata for a GitHub repository.
    Input MUST be in 'owner/repo' format, e.g. 'tiangolo/fastapi'.
    Returns JSON with description, language, stars, forks, topics, url, open_issues."""
    return json.dumps(github_data.fetch_repository(repo_name))


@tool("GitHub README Fetcher")
def github_readme_tool(repo_name: str) -> str:
    """Fetch the README.md content of a GitHub repository.
    Input MUST be in 'owner/repo' format, e.g. 'tiangolo/fastapi'."""
    return github_data.fetch_readme(repo_name)


@tool("GitHub File Tree")
def github_file_tree_tool(repo_name: str) -> str:
    """Fetch the top-level file/folder structure of a GitHub repository.
    Input MUST be in 'owner/repo' format, e.g. 'tiangolo/fastapi'.
    Returns JSON: a list of {name, type, path}."""
    return json.dumps(github_data.fetch_file_tree(repo_name))


@tool("GitHub Open Issues")
def github_issues_tool(repo_name: str) -> str:
    """Fetch open issues (excluding pull requests) from a GitHub repository.
    Input MUST be in 'owner/repo' format, e.g. 'tiangolo/fastapi'.
    Returns JSON: a list of {title, number, labels, comments, url}."""
    return json.dumps(github_data.fetch_issues(repo_name))


@tool("CONTRIBUTING.md Fetcher")
def github_contributing_tool(repo_name: str) -> str:
    """Fetch the CONTRIBUTING.md content (contribution guidelines) of a GitHub repository.
    Input MUST be in 'owner/repo' format, e.g. 'tiangolo/fastapi'."""
    return github_data.fetch_contributing_file(repo_name)
