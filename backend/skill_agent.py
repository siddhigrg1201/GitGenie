from google import genai
from dotenv import load_dotenv
import os
import json
from groq import Groq

load_dotenv()

# Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found.")

client = genai.Client(api_key=gemini_api_key)

# Groq
groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found.")

groq_client = Groq(api_key=groq_api_key)


def generate_with_fallback(prompt):

    # ----------------------------
    # Try Gemini First
    # ----------------------------
    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:

        print("\nGemini failed.")
        print(e)

        print("\nSwitching to Groq...\n")

    # ----------------------------
    # Fallback to Groq
    # ----------------------------
    try:

        response = groq_client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.3
        )

        return response.choices[0].message.content

    except Exception as e:

        print("\nGroq also failed.")
        print(e)

        return None


def generate_profile(user_skills, experience, domain):

    prompt = f"""
You are an experienced career mentor.

Analyze the following user information and create a structured profile.

Programming Skills:
{user_skills}

Experience Level:
{experience}

Interested Domain:
{domain}

Return ONLY a valid JSON object with the following structure:

{{
    "languages": [],
    "experience_level": "",
    "interests": [],
    "strengths": [],
    "recommended_learning_path": []
}}

Rules:
- Return ONLY valid JSON.
- Do NOT include markdown formatting.
- Do NOT include triple backticks.
- Do NOT write ```json.
- Do NOT add any explanation before or after the JSON.
- Keep "languages" and "interests" as arrays.
- Keep "experience_level" as a single string.
- Generate 3-5 strengths based on the user's profile.
- Generate a practical learning path in logical order.
"""

    response_text = generate_with_fallback(prompt)

    if response_text is None:
        return None

    try:
        profile = json.loads(response_text)

    except json.JSONDecodeError:
        print("LLM returned invalid JSON.")
        return None   #Take this JSON text and convert it into a Python dictionary
            
    return profile

if __name__ == "__main__":

    user_skills = input("Enter your programming skills (comma separated): ")
    experience = input("Enter your experience level (Beginner/Intermediate/Advanced): ")
    domain = input("Which domain interests you? (Web Development, AI/ML, App Development, Data Science, etc.): ")

    profile = generate_profile(
        user_skills,
        experience,
        domain
    )

    print("\nUser Profile\n")
    print(json.dumps(profile, indent=4))