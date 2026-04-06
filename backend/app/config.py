import os


TURSO_DATABASE_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_AUTH_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

# Cloudinary
CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "")

# Email (Resend)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
APP_URL = os.environ.get("APP_URL", "https://iklavya.in")

# ElevenLabs (AI Interview TTS)
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVENLABS_INTERVIEW_VOICE_ID = os.environ.get(
    "ELEVENLABS_INTERVIEW_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"
)  # Default: Rachel

# Turso docs: sqlite+{TURSO_DATABASE_URL}?secure=true
SQLALCHEMY_DATABASE_URL = f"sqlite+{TURSO_DATABASE_URL}?secure=true"
