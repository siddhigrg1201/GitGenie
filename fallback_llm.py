import os
import copy
from typing import Any

import time
import litellm
from dotenv import load_dotenv

from crewai.llms.base_llm import BaseLLM

load_dotenv()


class GeminiGroqFallbackLLM(BaseLLM):
    """
    CrewAI BaseLLM implementation

    Gemini first
    ↓
    if fails
    ↓
    Groq
    """

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

        self.groq_model = "groq/llama-3.3-70b-versatile"

    def _clean_messages(self, messages):

        cleaned = []

        for msg in messages:

            m = copy.deepcopy(msg)

            if isinstance(m, dict):

                # Gemini-only fields
                m.pop("cache_breakpoint", None)
                m.pop("cached_content", None)
                m.pop("cache_control", None)

                # Anthropic fields
                m.pop("thinking", None)

                # OpenAI beta fields
                m.pop("reasoning", None)

                # provider metadata
                m.pop("provider_options", None)

            cleaned.append(m)

        return cleaned

    def _clean_kwargs(self, kwargs):

        kwargs = dict(kwargs)

        remove = [
            "cache_breakpoint",
            "cached_content",
            "cache_control",
            "provider_options",
            "thinking",
            "reasoning",
            "response_model",
            "callbacks",
            "from_task",
            "from_agent",
            "available_functions"
        ]

        for k in remove:
            kwargs.pop(k, None)

        return kwargs

    def call(
        self,
        messages,
        tools=None,
        callbacks=None,
        available_functions=None,
        from_task=None,
        from_agent=None,
        response_model=None,
    ):

        if isinstance(messages, str):
            messages = [
                {
                    "role": "user",
                    "content": messages
                }
            ]

        messages = self._clean_messages(messages)

        try:

            print("\n✨ Trying Gemini...\n")

            response = litellm.completion(
                model="gemini/gemini-2.0-flash",
                api_key=self.gemini_key,
                messages=messages,
                temperature=self.temperature,
                tools=tools,
            )

            return response.choices[0].message.content
        
        except Exception as gemini_error:

            print("\n⚠ Gemini Failed")
            print(gemini_error)

            # Sirf Groq rate limit ke liye wait karna useful hai
            print("Waiting 5 seconds before trying Groq...")
            #time.sleep(5)

            print("\n🔥 Switching to Groq...\n")

            last_error = None

            for idx, groq_key in enumerate(self.groq_keys, start=1):
                try:
                    print(f"\n🚀 Trying Groq Key {idx}...\n")

                    response = litellm.completion(
                        model=self.groq_model,
                        api_key=groq_key,
                        base_url="https://api.groq.com/openai/v1",
                        messages=messages,
                        temperature=self.temperature,
                        tools=tools,
                    )

                    print(f"✅ Success with Groq Key {idx}")

                    return response.choices[0].message.content

                except Exception as groq_error:
                    last_error = groq_error
                    print(f"❌ Groq Key {idx} Failed: {groq_error}")

                    # Agar aur keys bachi hain to next key try karo
                    if idx < len(self.groq_keys):
                        print(f"➡ Switching to Groq Key {idx + 1}")
                        continue

                    # Last key bhi fail ho gayi
                    break

            raise RuntimeError(
                f"Gemini Error:\n{gemini_error}\n\nAll Groq Keys Exhausted\n\nLast Groq Error:\n{last_error}"
            )

    async def acall(
        self,
        messages,
        tools=None,
        callbacks=None,
        available_functions=None,
        from_task=None,
        from_agent=None,
        response_model=None,
    ):
        return self.call(
            messages=messages,
            tools=tools,
            callbacks=callbacks,
            available_functions=available_functions,
            from_task=from_task,
            from_agent=from_agent,
            response_model=response_model,
        )

    def supports_function_calling(self) -> bool:
        return True

    def supports_stop_words(self) -> bool:
        return True

    def get_context_window_size(self) -> int:
        return 128000
