"""
Upload professional headshot images to Cloudinary and update mentor profile_image URLs.
Uses free stock photos from randomuser.me as source images.
"""
import requests
import hashlib
import time

# Cloudinary config
CLOUD_NAME = "dr17ap4sb"
API_KEY = "936695964185564"
API_SECRET = "KEi87vzFvSBQwfPsjpKb2mIvl-w"
UPLOAD_URL = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload"

# Backend API
API_BASE = "https://iklavya-api-472075970266.asia-south1.run.app"
ADMIN_EMAIL = "uddit@iklavya.com"
ADMIN_PASSWORD = "Iklavya@2026"

# Mentor emails → image source URLs (professional headshots)
MENTOR_IMAGES = {
    "priya.sharma@iklavya.in": "https://randomuser.me/api/portraits/women/68.jpg",
    "rajesh.verma@iklavya.in": "https://randomuser.me/api/portraits/men/32.jpg",
    "ananya.desai@iklavya.in": "https://randomuser.me/api/portraits/women/44.jpg",
    "vikram.rathore@iklavya.in": "https://randomuser.me/api/portraits/men/46.jpg",
    "meera.iyer@iklavya.in": "https://randomuser.me/api/portraits/women/26.jpg",
    "arjun.mehta@iklavya.in": "https://randomuser.me/api/portraits/men/81.jpg",
    "sunita.choudhary@iklavya.in": "https://randomuser.me/api/portraits/women/89.jpg",
}


def cloudinary_signature(params: dict) -> str:
    """Generate Cloudinary API signature."""
    sorted_params = "&".join(f"{k}={v}" for k, v in sorted(params.items()) if k != "file")
    to_sign = sorted_params + API_SECRET
    return hashlib.sha1(to_sign.encode()).hexdigest()


def upload_to_cloudinary(image_url: str, public_id: str) -> str:
    """Upload image from URL to Cloudinary, return secure URL."""
    timestamp = str(int(time.time()))
    params = {
        "public_id": public_id,
        "timestamp": timestamp,
        "folder": "iklavya/mentors",
        "transformation": "c_fill,w_400,h_400,g_face,q_auto,f_auto",
    }
    signature = cloudinary_signature(params)

    resp = requests.post(UPLOAD_URL, data={
        **params,
        "file": image_url,
        "api_key": API_KEY,
        "signature": signature,
    })
    resp.raise_for_status()
    data = resp.json()
    return data["secure_url"]


def get_admin_token() -> str:
    """Login as admin and get JWT token."""
    resp = requests.post(f"{API_BASE}/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    resp.raise_for_status()
    return resp.json()["token"]


def get_mentor_token(email: str, password: str = "Mentor@2026") -> str:
    """Login as mentor and get JWT token."""
    resp = requests.post(f"{API_BASE}/mentor/login", json={
        "email": email,
        "password": password,
    })
    resp.raise_for_status()
    return resp.json()["token"]


def update_mentor_profile_image(mentor_token: str, image_url: str):
    """Update mentor's profile_image via PATCH /mentor/profile."""
    resp = requests.patch(
        f"{API_BASE}/mentor/profile",
        headers={"Authorization": f"Bearer {mentor_token}"},
        json={"profile_image": image_url},
    )
    resp.raise_for_status()
    return resp.json()


def main():
    print("=== Mentor Image Seeder ===\n")

    for email, source_url in MENTOR_IMAGES.items():
        name_part = email.split("@")[0].replace(".", "_")
        public_id = f"mentor_{name_part}"

        print(f"[1/2] Uploading image for {email}...")
        try:
            cloudinary_url = upload_to_cloudinary(source_url, public_id)
            print(f"      -> {cloudinary_url}")
        except Exception as e:
            print(f"      ERROR uploading: {e}")
            continue

        print(f"[2/2] Updating mentor profile...")
        try:
            token = get_mentor_token(email)
            result = update_mentor_profile_image(token, cloudinary_url)
            print(f"      -> Done!\n")
        except Exception as e:
            print(f"      ERROR updating: {e}\n")
            continue

    print("=== Complete ===")


if __name__ == "__main__":
    main()
