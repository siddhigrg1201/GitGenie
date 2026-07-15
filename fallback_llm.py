import os
import copy
import json
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

    def _run_with_tool_loop(self, model, api_key, messages, tools, available_functions, base_url=None):
        """
        Calls the LLM, and if it requests a tool call, actually executes the
        tool (via available_functions), feeds the result back, and calls the
        LLM again — repeating until it returns a final text answer.

        Without this loop, when tools are attached, the model's first
        response often has empty `content` (the real answer is in
        `tool_calls` instead), which used to surface as
        "Invalid response from LLM call - None or empty."
        """
        messages = list(messages)
        max_iterations = 6

        completion_kwargs = {"model": model, "api_key": api_key, "temperature": self.temperature}
        if base_url:
            completion_kwargs["base_url"] = base_url

        for _ in range(max_iterations):
            response = litellm.completion(messages=messages, tools=tools, **completion_kwargs)
            message = response.choices[0].message
            tool_calls = getattr(message, "tool_calls", None)

            if not tool_calls:
                return message.content or ""

            # Record the assistant's tool-call request in the conversation
            messages.append({
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in tool_calls
                ],
            })

            # Actually execute each requested tool and feed the result back
            for tc in tool_calls:
                func_name = tc.function.name

                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}

                func = (available_functions or {}).get(func_name)

                if func is None:
                    result = f"Error: tool '{func_name}' not found."
                else:
                    try:
                        result = func(**args)
                    except Exception as e:
                        result = f"Error running tool '{func_name}': {e}"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": str(result),
                })

        # Ran out of tool-call rounds; ask once more without tools so the
        # model is forced to summarize instead of looping forever.
        final = litellm.completion(messages=messages, **completion_kwargs)
        return final.choices[0].message.content or ""

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

            return self._run_with_tool_loop(
                model="gemini/gemini-2.0-flash",
                api_key=self.gemini_key,
                messages=messages,
                tools=tools,
                available_functions=available_functions,
            )

        except Exception as gemini_error:

            print("\n⚠ Gemini Failed")
            print(gemini_error)

            print("\n🔥 Switching to Groq...\n")

            last_error = None

            for idx, groq_key in enumerate(self.groq_keys, start=1):
                try:
                    print(f"\n🚀 Trying Groq Key {idx}...\n")

                    result = self._run_with_tool_loop(
                        model=self.groq_model,
                        api_key=groq_key,
                        messages=messages,
                        tools=tools,
                        available_functions=available_functions,
                        base_url="https://api.groq.com/openai/v1",
                    )

                    print(f"✅ Success with Groq Key {idx}")

                    return result

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