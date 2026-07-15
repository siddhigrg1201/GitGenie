from crew import gitgenie_crew

def main():

    print("=" * 60)
    print("        GitGenie Multi-Agent System")
    print("=" * 60)

    github_username = input("GitHub username (optional): ").strip()
    experience = input("Experience level (beginner/intermediate/advanced): ").strip()
    interests = input("Interests (e.g. Machine Learning, Web Dev): ").strip()
    repository = input("Repository (owner/repo, leave blank to get a recommendation): ").strip()

    user_inputs = {
        "github_username": github_username or "not provided",
        "experience": experience or "beginner",
        "interests": interests or "general open source",
        "repository": repository or "not provided",
    }

    result = gitgenie_crew.kickoff(inputs=user_inputs)

    print("\n")
    print("=" * 60)
    print("FINAL OUTPUT")
    print("=" * 60)
    print(result)


if __name__ == "__main__":
    main()