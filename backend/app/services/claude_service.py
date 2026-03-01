import anthropic
from app.config import ANTHROPIC_API_KEY

client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096


async def stream_chat_response(system_prompt: str, messages: list[dict]):
    """Stream Claude's response as an async generator yielding text chunks.

    Args:
        system_prompt: The system prompt with user context
        messages: List of {"role": "user"|"assistant", "content": "..."} dicts
    """
    async with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def get_chat_response(system_prompt: str, messages: list[dict]) -> str:
    """Get a complete (non-streaming) response from Claude.

    Used for structured JSON responses like ATS scoring.
    """
    response = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text
