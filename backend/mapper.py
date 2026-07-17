"""
Converts the raw JSON produced by the CrewAI tasks (tasks.py) into the exact
camelCase shape the GitGenie frontend (src/lib/mock-data.ts -> AnalysisResult)
expects. Keeping this in one place means the frontend never has to know
anything about CrewAI's internal task schema.
"""

import json

import github_data


def parse_json(raw_text: str):
    """Forgiving parser for CrewAI task outputs.

    LLMs sometimes emit valid JSON followed by trailing text (a repeated
    copy, a stray note, etc.), which makes plain json.loads() blow up with
    "Extra data: line 1 column N". We use raw_decode() to grab just the
    first valid JSON value and ignore anything after it. If that still
    fails (e.g. the JSON object itself is malformed, or wrapped oddly), we
    fall back to slicing out the outermost {...} block before giving up.
    """
    text = (raw_text or "").strip()
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "")
    text = text.strip()
    if not text:
        return {}

    decoder = json.JSONDecoder()
    try:
        obj, _ = decoder.raw_decode(text)
        return obj
    except json.JSONDecodeError:
        pass

    # Fallback: find the first "{" and its matching "}" and try that slice.
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass

    # Give up loudly rather than silently returning {} — the caller (and the
    # frontend's error banner) needs to know this task's output was unusable.
    raise ValueError(f"Could not parse JSON from task output (first 200 chars): {text[:200]!r}")


def _repo_id(owner: str, name: str) -> str:
    owner = (owner or "").strip()
    name = (name or "").strip()
    return f"{owner}/{name}"


def _enrich_repo_stats(owner: str, name: str):
    """Real stars/language via a direct (non-LLM) GitHub REST call, since the
    recommendation task's JSON schema doesn't carry these two fields."""
    if not owner or not name:
        return {"stars": 0, "language": "Unknown"}
    data = github_data.fetch_repository(f"{owner}/{name}")
    if "error" in data:
        return {"stars": 0, "language": "Unknown"}
    return {"stars": data.get("stars") or 0, "language": data.get("language") or "Unknown"}


def build_profile(profile_json: dict, username: str):
    languages = profile_json.get("languages") or []
    strengths = profile_json.get("strengths") or []
    interests = profile_json.get("interests") or []
    learning_path = profile_json.get("recommended_learning_path") or []
    experience_level = profile_json.get("experience_level") or "Unknown"
    missing = profile_json.get("missing_information") or []
    notes = profile_json.get("notes") or ""

    lang_pills = [
        {"name": lang, "confidence": max(50, 95 - i * 8)}
        for i, lang in enumerate(languages)
    ]
    strength_pills = [
        {"name": s, "confidence": max(55, 90 - i * 7)}
        for i, s in enumerate(strengths)
    ]

    if languages:
        experience_sentence = (
            f"{experience_level} developer with demonstrated experience in "
            f"{', '.join(languages[:4])}."
        )
    else:
        experience_sentence = f"{experience_level} developer."
    if notes:
        experience_sentence += f" {notes}"

    goals = [f"Learn {tech} to expand your contribution range." for tech in learning_path] or [
        "Ship a meaningful pull request to an open-source project."
    ]

    stats = None
    projects = []
    try:
        gh = github_data.fetch_github_user_profile(username)
        if "error" not in gh:
            top_repos = gh.get("top_repos") or []
            projects = [
                {
                    "name": r.get("name", ""),
                    "description": r.get("description") or "No description provided.",
                }
                for r in top_repos[:6]
            ]
            stats = {
                "repos": gh.get("public_repos", 0),
                "stars": sum(r.get("stars", 0) for r in top_repos),
                "followers": gh.get("followers", 0),
            }
    except Exception:
        pass

    confidence_score = 90 if profile_json.get("github_data_used") else 55
    confidence_score = max(30, confidence_score - 8 * len(missing))

    return {
        "languages": lang_pills,
        "frameworks": strength_pills,  # displayed under the "Strengths" panel
        "experience": experience_sentence,
        "interests": interests,
        "projects": projects,
        "goals": goals,
        "stats": stats,
        "confidenceScore": confidence_score,
    }


def build_repositories(repo_json: dict):
    recs = repo_json.get("recommended_repositories") or []
    repos = []
    for r in recs:
        owner = r.get("owner", "")
        name = r.get("repository", "")
        enrich = _enrich_repo_stats(owner, name)
        reason = r.get("reason") or []
        if isinstance(reason, list):
            reason_text = ". ".join(reason)
        else:
            reason_text = str(reason)
        repos.append(
            {
                "id": _repo_id(owner, name),
                "name": name,
                "owner": owner,
                "url": r.get("url", ""),
                "score": r.get("overall_score", 0),
                "difficulty": r.get("difficulty", "Medium"),
                "matchedSkills": r.get("matched_skills") or [],
                "reason": reason_text,
                "stars": enrich["stars"],
                "language": enrich["language"],
            }
        )
    return repos


def build_details_markdown(explain_json: dict) -> str:
    if not explain_json:
        return "## Repository Overview\n\nNo details available."

    overview = explain_json.get("repository_overview", "")
    architecture = explain_json.get("project_architecture", "")
    core_components = explain_json.get("core_components") or []
    tech_stack = explain_json.get("tech_stack") or {}
    workflow = explain_json.get("project_workflow", "")
    key_features = explain_json.get("key_features") or []
    learning_path = explain_json.get("learning_path") or []

    lines = ["## Overview", overview or "_No overview available._", ""]
    lines += ["## Architecture", architecture or "_No architecture notes available._", ""]

    if core_components:
        lines.append("## Core Components")
        for c in core_components:
            lines.append(f"- **{c.get('name', '')}** — {c.get('purpose', '')}")
        lines.append("")

    lines.append("## Tech Stack")
    for label, key in [
        ("Languages", "languages"),
        ("Frameworks", "frameworks"),
        ("Libraries", "libraries"),
        ("Package Manager", "package_manager"),
        ("Build Tools", "build_tools"),
        ("Testing", "testing"),
    ]:
        values = tech_stack.get(key) or []
        if values:
            lines.append(f"- **{label}**: {', '.join(values)}")
    lines.append("")

    lines += ["## Project Workflow", workflow or "_No workflow notes available._", ""]

    if key_features:
        lines.append("## Key Features")
        for f in key_features:
            lines.append(f"- {f}")
        lines.append("")

    if learning_path:
        lines.append("## Learning Path")
        for i, step in enumerate(learning_path, start=1):
            lines.append(f"{i}. {step}")
        lines.append("")

    return "\n".join(lines)


def build_issues(issues_json: dict, repo_full_name: str):
    issues = issues_json.get("issues") or []
    out = []
    for it in issues:
        number = it.get("issue_number", 0)
        out.append(
            {
                "id": f"i-{number}",
                "number": number,
                "title": it.get("issue_title", ""),
                "difficulty": it.get("difficulty", "Medium"),
                "estimatedTime": it.get("estimated_time", ""),
                "requiredSkills": it.get("skills_required") or [],
                "learningOutcome": it.get("learning_outcome", ""),
                "url": f"https://github.com/{repo_full_name}/issues/{number}" if repo_full_name else "",
            }
        )
    return out


def build_roadmap(roadmap_json: dict):
    if not roadmap_json:
        return []

    setup = roadmap_json.get("repository_setup") or {}
    setup_lines = []
    for label, key in [
        ("Installation", "installation"),
        ("Dependencies", "dependencies"),
        ("Build steps", "build_steps"),
        ("Test commands", "test_commands"),
    ]:
        values = setup.get(key) or []
        if values:
            setup_lines.append(f"**{label}:** " + ", ".join(f"`{v}`" for v in values))
    setup_body = "\n\n".join(setup_lines) or "No setup instructions were found in this repository."

    beginner = roadmap_json.get("beginner_start") or {}
    beginner_body = ""
    if beginner.get("files_or_folders"):
        beginner_body += "Start with: " + ", ".join(f"`{f}`" for f in beginner["files_or_folders"]) + "\n\n"
    beginner_body += beginner.get("reason", "") or "No specific starting point was identified."

    first = roadmap_json.get("first_contribution") or {}
    first_body = (
        f"**{first.get('title', 'First contribution')}** "
        f"({first.get('difficulty', 'Easy')}, {first.get('estimated_time', 'a few hours')})\n\n"
        f"Target: `{first.get('target_file_or_folder', '')}`\n\n"
        f"{first.get('reason', '')}"
    )

    opps = roadmap_json.get("contribution_opportunities") or {}
    opp_lines = []
    for label, key in [("Beginner", "beginner"), ("Intermediate", "intermediate"), ("Advanced", "advanced")]:
        values = opps.get(key) or []
        if values:
            opp_lines.append(f"**{label}:**")
            for v in values:
                opp_lines.append(f"- {v}")
    opp_body = "\n".join(opp_lines) or "No contribution opportunities were identified."

    issues_analysis = roadmap_json.get("open_issues_analysis") or []
    issues_lines = []
    for it in issues_analysis:
        issues_lines.append(
            f"- **#{it.get('issue_number', '')} {it.get('issue_title', '')}** "
            f"({it.get('difficulty', '')}) — {it.get('why_suitable', '')}"
        )
    issues_body = "\n".join(issues_lines) or "No open issues were analyzed."

    skills = roadmap_json.get("skills_required") or {}
    skills_lines = []
    for label, key in [("Languages", "languages"), ("Frameworks", "frameworks"), ("Tools", "tools")]:
        values = skills.get(key) or []
        if values:
            skills_lines.append(f"**{label}:** {', '.join(values)}")
    skills_body = "\n\n".join(skills_lines) or "No specific skills were listed."

    workflow = roadmap_json.get("contribution_workflow") or []
    workflow_body = "\n".join(f"{i + 1}. {step}" for i, step in enumerate(workflow)) or (
        "Fork → Clone → Setup → Branch → Code → Test → Commit → Push → Pull Request."
    )

    mistakes = roadmap_json.get("common_mistakes") or []
    mistakes_body = "\n".join(f"- {m}" for m in mistakes) or "No common mistakes were flagged."

    plan = roadmap_json.get("thirty_day_plan") or {}
    plan_lines = []
    for label, key in [("Week 1", "week_1"), ("Week 2", "week_2"), ("Week 3", "week_3"), ("Week 4", "week_4")]:
        values = plan.get(key) or []
        if values:
            plan_lines.append(f"**{label}:** " + "; ".join(values))
    plan_body = "\n\n".join(plan_lines) or "No 30-day plan was generated."

    return [
        {"title": "Repository Setup", "body": setup_body},
        {"title": "Where to Start", "body": beginner_body},
        {"title": "First Contribution", "body": first_body},
        {"title": "Contribution Opportunities", "body": opp_body},
        {"title": "Open Issues Analysis", "body": issues_body},
        {"title": "Required Skills", "body": skills_body},
        {"title": "Contribution Workflow", "body": workflow_body},
        {"title": "Common Mistakes", "body": mistakes_body},
        {"title": "30-Day Plan", "body": plan_body},
    ]


def build_checklist(checklist_json: dict):
    if not checklist_json:
        return []

    out = []
    counter = 0
    groups = [
        ("pre_submission_checklist", "Pre-submission requirement"),
        ("pull_request_preparation", "Pull request preparation step"),
        ("final_checklist", "Final check before opening the PR"),
    ]
    for key, reason in groups:
        for item in checklist_json.get(key) or []:
            counter += 1
            out.append(
                {
                    "id": f"c{counter}",
                    "rule": item,
                    "reason": reason,
                }
            )
    notes = checklist_json.get("notes")
    if notes:
        counter += 1
        out.append({"id": f"c{counter}", "rule": notes, "reason": "Additional note"})
    return out


def build_analysis_result(username: str, profile_json: dict, repo_json: dict, explain_json: dict,
                           issues_json: dict, roadmap_json: dict, checklist_json: dict):
    status = repo_json.get("status", "AUTO")
    selection_mode = "user" if status == "PROVIDED" else "auto"

    repositories = build_repositories(repo_json)

    selected = repo_json.get("selected_repository") or {}
    selected_owner = selected.get("owner", "")
    selected_name = selected.get("repository") or selected.get("name", "")
    selected_id = _repo_id(selected_owner, selected_name) if selected_owner or selected_name else ""

    # Make sure the selected repo is actually present in the repositories list
    # (it should be, per the crew's own rules, but don't assume).
    if selected_id and not any(r["id"] == selected_id for r in repositories):
        enrich = _enrich_repo_stats(selected_owner, selected_name)
        repositories.insert(
            0,
            {
                "id": selected_id,
                "name": selected_name,
                "owner": selected_owner,
                "url": selected.get("url", ""),
                "score": selected.get("overall_score", 0),
                "difficulty": selected.get("difficulty", "Medium"),
                "matchedSkills": selected.get("matched_skills") or [],
                "reason": "Selected repository provided by you.",
                "stars": enrich["stars"],
                "language": enrich["language"],
            },
        )

    if not selected_id and repositories:
        # status == INVALID with no valid selection: fall back to rank #1 so
        # the dashboard still has something to show.
        selected_id = repositories[0]["id"]

    details = {}
    issues = {}
    roadmap = {}
    if selected_id:
        details[selected_id] = build_details_markdown(explain_json)
        issues[selected_id] = build_issues(issues_json, selected_id)
        roadmap[selected_id] = build_roadmap(roadmap_json)

    return {
        "githubDataUsed": bool(profile_json.get("github_data_used", True)),
        "selectionMode": selection_mode,
        "selectedRepoId": selected_id,
        "profile": build_profile(profile_json, username),
        "repositories": repositories,
        "details": details,
        "issues": issues,
        "roadmap": roadmap,
        "checklist": build_checklist(checklist_json),
    }