from crew import (
    profile_crew,
    recommendation_crew
)
import json


def parse_json(result):
    text = result.raw if hasattr(result, "raw") else str(result)

    text = text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")

    return json.loads(text.strip())


def ask_additional_questions():
    print("\nGitHub profile doesn't contain enough public information.")
    print("Please answer a few questions.\n")

    experience = input(
        "1. Experience (Beginner/Intermediate/Advanced): "
    ).strip()

    languages = input(
        "2. Programming languages you know: "
    ).strip()

    interests = input(
        "3. Interests (Web Dev, AI, Backend, Android, etc.): "
    ).strip()

    projects = input(
        "4. What projects have you built? "
    ).strip()

    goal = input(
        "5. Current learning goal (Open Source, Internship, AI, etc.): "
    ).strip()

    return {
        "experience": experience,
        "languages": languages,
        "interests": interests,
        "projects": projects,
        "goal": goal,
    }


def main():

    print("=" * 60)
    print("        GitGenie Multi-Agent System")
    print("=" * 60)

    # -----------------------------
    # Mandatory GitHub username
    # -----------------------------
    while True:
        github_username = input("GitHub username: ").strip()

        if github_username:
            break

        print("GitHub username cannot be empty.\n")

    repository = input(
       "Repository (owner/repo) [Press Enter to use the top recommendation]: "
    ).strip()

    # Initial inputs
    user_inputs = {
        "github_username": github_username,
        "user_repository": repository or "not provided",
        "experience": "",
        "languages": "",
        "interests": "",
        "projects": "",
        "goal": "",

    }

    # -----------------------------
    # First Crew Run
    # -----------------------------
    profile_result = profile_crew.kickoff(inputs=user_inputs)

    profile_text = profile_result.raw

    try:
        profile = parse_json(profile_result)

    except json.JSONDecodeError:
        print("Invalid JSON returned by Profile Crew.")
        print(profile_text)
        return

    if profile.get("github_data_used") is False:
        extra_inputs = ask_additional_questions()

        user_inputs.update(extra_inputs)

        profile_result = profile_crew.kickoff(inputs=user_inputs)

        profile = parse_json(profile_result)

    user_inputs["developer_profile"] = json.dumps(profile)

    final_result = recommendation_crew.kickoff(
          inputs=user_inputs
    )
    print("\n")
    print("=" * 60)
    print("FINAL OUTPUT")
    print("=" * 60)
    print(final_result)


if __name__ == "__main__":
    main()