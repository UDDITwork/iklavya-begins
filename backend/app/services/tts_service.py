import httpx

from app.config import ELEVENLABS_API_KEY, ELEVENLABS_INTERVIEW_VOICE_ID


ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


async def synthesize_speech(text: str) -> bytes:
    """Convert text to speech using ElevenLabs API.

    Returns raw audio bytes (audio/mpeg).
    """
    url = ELEVENLABS_TTS_URL.format(voice_id=ELEVENLABS_INTERVIEW_VOICE_ID)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": "eleven_turbo_v2_5",
                "voice_settings": {
                    "stability": 0.7,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True,
                },
            },
        )
        response.raise_for_status()
        return response.content
