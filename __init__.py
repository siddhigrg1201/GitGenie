import os


def __init__(self):
    super().__init__(
        model="gemini/gemini-2.0-flash",
        temperature=0.3,
        provider="gemini"
    )

    self.gemini_key = os.getenv("GEMINI_API_KEY")
    self.groq_keys = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3"),
    os.getenv("GROQ_API_KEY_4"),
    os.getenv("GROQ_API_KEY_5"),
    os.getenv("GROQ_API_KEY_6"),
    ]

    # Remove empty values
    self.groq_keys = [k for k in self.groq_keys if k]
    self.openrouter_key = os.getenv("OPENROUTER_API_KEY")   # New

    self.groq_model = "groq/llama-3.3-70b-versatile"
    self.openrouter_model = "openrouter/meta-llama/llama-3.1-8b-instruct"