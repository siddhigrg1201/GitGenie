import requests
from google import genai
from dotenv import load_dotenv
import os
import json
from skill_agent import generate_profile

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found.")
client = genai.Client(api_key=api_key)

def generate_queries(profile):
    languages = profile.get("languages",[]) #Try to find languages. If it exists, give it. Otherwise give me an empty list. (defensive programming)
    experience = profile.get("experience_level", "beginner") #default value: beginner
    
    experience_map = {
    "beginner": "stars:50..5000",
    "intermediate": "stars:500..20000",
    "advanced": "stars:>1000"
    }

    star_filter = experience_map.get(experience.lower(), "stars:50..5000")

    queries = []
    for language in languages:
        query = f"language:{language.strip().lower()} {star_filter}"
        queries.append(query)
    
    # print("\nGenerated Queries:") #
    # print(queries)#
    return queries


def search_github(query):

    # GitHub Search API endpoint
    url = "https://api.github.com/search/repositories"

    # Query parameters
    params = {
        "q": query,
        "per_page": 10,
        "sort":"stars",
        "order":"desc"
    }

    # Send GET request
    try:
        response = requests.get(
            url,
            params=params,
            timeout=10
        )
    except requests.RequestException as e:
        print("Request Failed:", e)
        return []     # Prevent the program from crashing if the internet/API fails

# Check if request was successful
    if response.status_code != 200:
        print("GitHub API Error:", response.status_code)
        return []     #we return an empty list to prevent the program from crashing

    

    # Convert JSON response to Python dictionary
    data = response.json()

    # Extract repository list
    repositories = data["items"]

    # Store cleaned repositories
    clean_repositories = []

    # Loop through each repository
    for item in repositories:

        repo = {
            "name": item.get("name", ""),
            "owner": item.get("owner", {}).get("login", ""),
            "description": item.get("description", ""),
            "language": item.get("language", ""),
            "stars": item.get("stargazers_count", 0),
            "forks": item.get("forks_count", 0),
            "topics": item.get("topics", []),
            "license": item.get("license", {}).get("spdx_id", "No License")
                        if item.get("license")
                        else "No License",
            "url": item.get("html_url", ""),
            "open_issues": item.get("open_issues_count", 0)
        }

        clean_repositories.append(repo)

    return clean_repositories


def remove_duplicates(repositories):

    unique_repositories = []

    seen_urls = set()

    for repo in repositories:

        if repo["url"] not in seen_urls:

            seen_urls.add(repo["url"])    #we remove duplicates based on their urls because for each repo, url in unique

            unique_repositories.append(repo)

    return unique_repositories



def rank_repositories(profile, repositories):

    prompt = f"""
You are an experienced open-source mentor.

Below is the user's profile:

{json.dumps(profile, indent=2)}

Below is a list of GitHub repositories:

{json.dumps(repositories, indent=2)}

Your task is to recommend the BEST repositories for this user.

While evaluating each repository, consider:

- Programming language match
- Experience level
- User interests
- Repository popularity
- Beginner friendliness
- Documentation quality
- Active maintenance
- Educational value

Additionally, estimate the repository difficulty.

While assigning difficulty, consider:

- Project size
- Code complexity
- Documentation quality
- Technologies used
- Number of contributors
- Number of open issues
- Beginner friendliness

Difficulty must be ONLY one of the following:

- Easy
- Medium
- Hard

Select and return ONLY the TOP 10 repositories.

Rank them from highest score to lowest score.

For each repository:

- Mention which of the user's skills or interests matched the repository.
- Preserve the original repository name, owner, and GitHub URL exactly as provided in the input data.
- Do NOT invent or modify repository names, owners, or URLs.

Return ONLY valid JSON in the following format:

[
    {{
        "repository": "Repository Name",
        "owner": "Repository Owner",
        "url": "https://github.com/owner/repository",
        "score": 95,
        "difficulty": "Easy",
        "matching_skills": [
            "Python",
            "Web Development"
        ],
        "reason": "This repository is an excellent match because it aligns with the user's programming skills, interests, and experience level."
    }}
]

Rules:

- Return ONLY valid JSON.
- Do NOT include markdown formatting.
- Do NOT use triple backticks.
- Do NOT write ```json.
- Do NOT include any explanation before or after the JSON.
- The score must be an integer between 0 and 100.
- The difficulty must be exactly one of: Easy, Medium, or Hard.
- "matching_skills" must always be a JSON array.
- Preserve the repository name, owner, and URL exactly as provided.
- Return exactly 10 repositories.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    try:
        ranked = json.loads(response.text)
    except json.JSONDecodeError:
        print("Gemini returned invalid JSON.")
        return []

    return ranked



def recommend_repositories(profile):

    queries = generate_queries(profile)

    all_repositories = []

    for query in queries:
        repositories = search_github(query)
        # print(f"\nFound {len(repositories)} repositories for {query}")   #
        all_repositories.extend(repositories)

    unique_repositories = remove_duplicates(all_repositories)
    # print("Before:", len(all_repositories))   #
    # print("After :", len(unique_repositories)) #

    unique_repositories = sorted(    # Sort repositories by stars (highest first)
    unique_repositories,
    key=lambda repo: repo["stars"],
    reverse=True
)

    unique_repositories = unique_repositories[:20]   # Send only the top 20 repositories to Gemini

    ranked_repositories = rank_repositories(
        profile,
        unique_repositories
    )

    # print("\nRanking Complete!")
    # print(f"Returned {len(ranked_repositories)} repositories.")
    return ranked_repositories


def main():

    profile = generate_profile()

    if profile is None:
        print("Could not generate user profile.")
        return

    # print("\nPROFILE RECEIVED FROM SKILL AGENT\n")
    # print(json.dumps(profile, indent=4))
   
    recommendations = recommend_repositories(profile)

    print(json.dumps(recommendations, indent=4))


if __name__ == "__main__":
    main()  