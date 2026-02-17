"""
End-to-end test for IKLAVYA Career Guidance System.
Tests against the live Cloud Run backend.

Usage:
    python test_e2e.py
"""
import requests
import json
import time
import uuid
import sys
import io

# Fix Windows console encoding for emojis
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE_URL = "https://iklavya-api-472075970266.asia-south1.run.app"

# Test user credentials (unique per run)
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = "E2E Test User"
TEST_PHONE = "+919876543210"
TEST_COLLEGE = "IIT Delhi"

# Will be set after login
TOKEN = None
SESSION_ID = None

PASS = 0
FAIL = 0
ERRORS = []


def log(status: str, test: str, detail: str = ""):
    global PASS, FAIL
    icon = "PASS" if status == "pass" else "FAIL"
    if status == "pass":
        PASS += 1
        print(f"  [{icon}] {test}")
    else:
        FAIL += 1
        msg = f"  [{icon}] {test} — {detail}"
        print(msg)
        ERRORS.append(msg)
    if detail and status == "pass":
        print(f"         {detail}")


def headers():
    h = {"Content-Type": "application/json"}
    if TOKEN:
        h["Authorization"] = f"Bearer {TOKEN}"
    return h


# ──────────────────────────────────────────────────────────────
# TEST 1: Health Check
# ──────────────────────────────────────────────────────────────
def test_health():
    print("\n1. Health Check")
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=15)
        if r.status_code == 200 and r.json().get("status") == "ok":
            log("pass", "GET /health returns 200")
        else:
            log("fail", "GET /health", f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("fail", "GET /health", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 2: Register
# ──────────────────────────────────────────────────────────────
def test_register():
    global TOKEN
    print("\n2. User Registration")
    try:
        r = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "name": TEST_NAME,
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "phone": TEST_PHONE,
                "college": TEST_COLLEGE,
            },
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code == 201:
            data = r.json()
            TOKEN = data.get("token")
            user = data.get("user", {})
            log("pass", "POST /auth/register returns 201")

            if user.get("email") == TEST_EMAIL:
                log("pass", "Response contains correct email")
            else:
                log("fail", "Response email mismatch", f"got {user.get('email')}")

            if user.get("phone") == TEST_PHONE:
                log("pass", "Phone field saved correctly")
            else:
                log("fail", "Phone field", f"got {user.get('phone')}")

            if TOKEN:
                log("pass", "JWT token returned")
            else:
                log("fail", "No JWT token in response")

            if user.get("profile_completed") == 0:
                log("pass", "profile_completed = 0 (fresh user)")
            else:
                log("fail", "profile_completed", f"got {user.get('profile_completed')}")
        else:
            log("fail", "POST /auth/register", f"status={r.status_code} body={r.text[:300]}")
    except Exception as e:
        log("fail", "POST /auth/register", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 3: Duplicate Register (should fail 409)
# ──────────────────────────────────────────────────────────────
def test_duplicate_register():
    print("\n3. Duplicate Registration Guard")
    try:
        r = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "name": TEST_NAME,
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "phone": TEST_PHONE,
                "college": TEST_COLLEGE,
            },
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code == 409:
            log("pass", "Duplicate email returns 409")
        else:
            log("fail", "Duplicate email", f"expected 409, got {r.status_code}")
    except Exception as e:
        log("fail", "Duplicate register", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 4: Login
# ──────────────────────────────────────────────────────────────
def test_login():
    global TOKEN
    print("\n4. User Login")
    try:
        r = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code == 200:
            data = r.json()
            TOKEN = data.get("token")
            log("pass", "POST /auth/login returns 200")
            if TOKEN:
                log("pass", "New JWT token received")
            else:
                log("fail", "No token in login response")
        else:
            log("fail", "POST /auth/login", f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("fail", "POST /auth/login", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 5: Auth/Me
# ──────────────────────────────────────────────────────────────
def test_me():
    print("\n5. Auth Me (token validation)")
    try:
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers(), timeout=15)
        if r.status_code == 200:
            user = r.json()
            if user.get("email") == TEST_EMAIL:
                log("pass", "GET /auth/me returns correct user")
            else:
                log("fail", "GET /auth/me email mismatch", f"got {user.get('email')}")
        else:
            log("fail", "GET /auth/me", f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("fail", "GET /auth/me", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 6: Unauthorized access (no token)
# ──────────────────────────────────────────────────────────────
def test_unauthorized():
    print("\n6. Unauthorized Access Guard")
    try:
        r = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code in (401, 403):
            log("pass", "No-token request returns 401/403")
        else:
            log("fail", "No-token request", f"expected 401/403, got {r.status_code}")
    except Exception as e:
        log("fail", "Unauthorized test", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 7: Create Profile (Step 2 — education)
# ──────────────────────────────────────────────────────────────
def test_create_profile():
    print("\n7. Create Profile (Registration Step 2)")
    try:
        r = requests.post(
            f"{BASE_URL}/profile",
            json={
                "date_of_birth": "2005-03-15",
                "gender": "Male",
                "city": "New Delhi",
                "state": "Delhi",
                "pin_code": "110001",
                "education_level": "12th",
                "class_or_year": "12th",
                "institution": "Delhi Public School",
                "board": "CBSE",
                "stream": "Science (PCM)",
                "cgpa": "9.2",
            },
            headers=headers(),
            timeout=15,
        )
        if r.status_code == 201:
            data = r.json()
            log("pass", "POST /profile returns 201")
            if data.get("city") == "New Delhi":
                log("pass", "Profile fields saved correctly")
            else:
                log("fail", "Profile fields", f"city={data.get('city')}")
        else:
            log("fail", "POST /profile", f"status={r.status_code} body={r.text[:300]}")
    except Exception as e:
        log("fail", "POST /profile", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 8: Update Profile (Step 3 — interests/family)
# ──────────────────────────────────────────────────────────────
def test_update_profile():
    print("\n8. Update Profile (Registration Step 3)")
    try:
        r = requests.put(
            f"{BASE_URL}/profile",
            json={
                "parent_occupation": "Engineer",
                "siblings": "1",
                "income_range": "10-20 LPA",
                "hobbies": ["coding", "reading", "chess"],
                "interests": ["AI/ML", "robotics", "mathematics"],
                "strengths": ["problem-solving", "analytical thinking", "persistence"],
                "weaknesses": ["public speaking", "time management"],
                "languages": ["English", "Hindi"],
                "career_aspiration_raw": "I want to become an AI researcher and build systems that can help solve real-world problems.",
            },
            headers=headers(),
            timeout=15,
        )
        if r.status_code == 200:
            data = r.json()
            log("pass", "PUT /profile returns 200")

            # Check list fields are returned as arrays
            if isinstance(data.get("hobbies"), list) and "coding" in data["hobbies"]:
                log("pass", "List fields (hobbies) returned as arrays")
            else:
                log("fail", "List fields format", f"hobbies={data.get('hobbies')}")

            if data.get("career_aspiration_raw", "").startswith("I want to"):
                log("pass", "Career aspiration saved")
            else:
                log("fail", "Career aspiration", f"got: {data.get('career_aspiration_raw', '')[:50]}")
        else:
            log("fail", "PUT /profile", f"status={r.status_code} body={r.text[:300]}")
    except Exception as e:
        log("fail", "PUT /profile", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 9: Get Profile
# ──────────────────────────────────────────────────────────────
def test_get_profile():
    print("\n9. Get Profile")
    try:
        r = requests.get(f"{BASE_URL}/profile", headers=headers(), timeout=15)
        if r.status_code == 200:
            data = r.json()
            log("pass", "GET /profile returns 200")
            if data.get("education_level") == "12th" and isinstance(data.get("strengths"), list):
                log("pass", "Full profile data consistent")
            else:
                log("fail", "Profile data", f"education={data.get('education_level')}, strengths type={type(data.get('strengths'))}")
        else:
            log("fail", "GET /profile", f"status={r.status_code}")
    except Exception as e:
        log("fail", "GET /profile", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 10: Check profile_completed updated
# ──────────────────────────────────────────────────────────────
def test_profile_completed_flag():
    print("\n10. Profile Completed Flag")
    try:
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers(), timeout=15)
        if r.status_code == 200:
            user = r.json()
            if user.get("profile_completed") == 2:
                log("pass", "profile_completed = 2 after step 3")
            else:
                log("fail", "profile_completed", f"expected 2, got {user.get('profile_completed')}")
        else:
            log("fail", "GET /auth/me for flag check", f"status={r.status_code}")
    except Exception as e:
        log("fail", "Profile flag check", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 11: Create Session
# ──────────────────────────────────────────────────────────────
def test_create_session():
    global SESSION_ID
    print("\n11. Create Chat Session")
    try:
        r = requests.post(
            f"{BASE_URL}/sessions",
            json={"title": "E2E Test Career Guidance"},
            headers=headers(),
            timeout=15,
        )
        if r.status_code == 201:
            data = r.json()
            SESSION_ID = data.get("id")
            log("pass", "POST /sessions returns 201")
            if data.get("status") == "active":
                log("pass", "Session status = active")
            else:
                log("fail", "Session status", f"got {data.get('status')}")
            if data.get("title") == "E2E Test Career Guidance":
                log("pass", "Session title saved")
            else:
                log("fail", "Session title", f"got {data.get('title')}")
        else:
            log("fail", "POST /sessions", f"status={r.status_code} body={r.text[:300]}")
    except Exception as e:
        log("fail", "POST /sessions", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 12: List Sessions
# ──────────────────────────────────────────────────────────────
def test_list_sessions():
    print("\n12. List Sessions")
    try:
        r = requests.get(f"{BASE_URL}/sessions", headers=headers(), timeout=15)
        if r.status_code == 200:
            data = r.json()
            sessions = data.get("sessions", [])
            if len(sessions) >= 1:
                log("pass", "GET /sessions returns session list")
            else:
                log("fail", "GET /sessions", "empty sessions list")
        else:
            log("fail", "GET /sessions", f"status={r.status_code}")
    except Exception as e:
        log("fail", "GET /sessions", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 13: Send Message + SSE Streaming
# ──────────────────────────────────────────────────────────────
def test_send_message_sse():
    print("\n13. Send Message + SSE Streaming (Claude AI)")
    if not SESSION_ID:
        log("fail", "SSE test", "no session ID available")
        return

    try:
        r = requests.post(
            f"{BASE_URL}/sessions/{SESSION_ID}/message",
            json={"content": "Hi, I am a 12th grade student interested in AI and robotics. Can you help me explore career options?"},
            headers=headers(),
            stream=True,
            timeout=60,
        )
        if r.status_code != 200:
            log("fail", "POST /sessions/{id}/message", f"status={r.status_code} body={r.text[:300]}")
            return

        log("pass", "SSE endpoint returns 200")

        # Parse SSE events
        events_received = []
        full_text = ""
        got_done = False
        got_message = False

        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("event: "):
                event_type = line[7:]
                events_received.append(event_type)
            elif line.startswith("data: "):
                data_str = line[6:]
                try:
                    data = json.loads(data_str)
                    if "text" in data:
                        full_text += data["text"]
                        got_message = True
                    if data == {}:
                        got_done = True
                except json.JSONDecodeError:
                    pass

        if got_message:
            log("pass", f"Received SSE message events ({len(full_text)} chars)")
        else:
            log("fail", "No message events received", f"events: {events_received[:10]}")

        if got_done:
            log("pass", "Received SSE done event")
        else:
            log("fail", "No done event", f"events: {events_received[-5:]}")

        if len(full_text) > 50:
            log("pass", f"AI response length OK ({len(full_text)} chars)")
            print(f"         Preview: {full_text[:150]}...")
        else:
            log("fail", "AI response too short", f"got {len(full_text)} chars")

        if "error" in events_received:
            log("fail", "Error event in stream", "stream contained an error event")

    except requests.exceptions.Timeout:
        log("fail", "SSE streaming", "timeout after 60s")
    except Exception as e:
        log("fail", "SSE streaming", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 14: Get Session Detail (verify message persisted)
# ──────────────────────────────────────────────────────────────
def test_session_detail():
    print("\n14. Session Detail (verify messages persisted)")
    if not SESSION_ID:
        log("fail", "Session detail", "no session ID")
        return

    try:
        # Small delay for DB write after SSE
        time.sleep(2)
        r = requests.get(
            f"{BASE_URL}/sessions/{SESSION_ID}",
            headers=headers(),
            timeout=15,
        )
        if r.status_code == 200:
            data = r.json()
            messages = data.get("messages", [])
            session = data.get("session", {})

            log("pass", "GET /sessions/{id} returns 200")

            if len(messages) >= 2:
                log("pass", f"Messages persisted ({len(messages)} messages)")
            else:
                log("fail", "Messages count", f"expected >=2, got {len(messages)}")

            # Check roles
            roles = [m["role"] for m in messages]
            if "user" in roles and "assistant" in roles:
                log("pass", "Both user and assistant messages present")
            else:
                log("fail", "Message roles", f"roles: {roles}")

            if session.get("questions_asked_count", 0) >= 1:
                log("pass", f"questions_asked_count = {session['questions_asked_count']}")
            else:
                log("fail", "questions_asked_count", f"got {session.get('questions_asked_count')}")
        else:
            log("fail", "GET /sessions/{id}", f"status={r.status_code}")
    except Exception as e:
        log("fail", "Session detail", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 15: Send second message (conversation continuity)
# ──────────────────────────────────────────────────────────────
def test_second_message():
    print("\n15. Second Message (conversation continuity)")
    if not SESSION_ID:
        log("fail", "Second message", "no session ID")
        return

    try:
        r = requests.post(
            f"{BASE_URL}/sessions/{SESSION_ID}/message",
            json={"content": "Tell me more about AI/ML engineering as a career. What skills do I need?"},
            headers=headers(),
            stream=True,
            timeout=60,
        )
        if r.status_code != 200:
            log("fail", "Second message", f"status={r.status_code}")
            return

        full_text = ""
        for line in r.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                try:
                    data = json.loads(line[6:])
                    if "text" in data:
                        full_text += data["text"]
                except json.JSONDecodeError:
                    pass

        if len(full_text) > 50:
            log("pass", f"Second response OK ({len(full_text)} chars)")
            print(f"         Preview: {full_text[:150]}...")
        else:
            log("fail", "Second response", f"only {len(full_text)} chars")
    except Exception as e:
        log("fail", "Second message", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 16: End Session
# ──────────────────────────────────────────────────────────────
def test_end_session():
    print("\n16. End Session")
    if not SESSION_ID:
        log("fail", "End session", "no session ID")
        return

    try:
        r = requests.post(
            f"{BASE_URL}/sessions/{SESSION_ID}/end",
            headers=headers(),
            timeout=30,
        )
        if r.status_code == 200:
            data = r.json()
            log("pass", "POST /sessions/{id}/end returns 200")

            if data.get("status") == "completed":
                log("pass", "Session status = completed")
            else:
                log("fail", "Session status after end", f"got {data.get('status')}")

            if data.get("ended_at"):
                log("pass", "ended_at timestamp set")
            else:
                log("fail", "ended_at", "not set")

            if data.get("session_summary") and len(data["session_summary"]) > 20:
                log("pass", f"Session summary generated ({len(data['session_summary'])} chars)")
                print(f"         Preview: {data['session_summary'][:150]}...")
            else:
                log("fail", "Session summary", f"got: {data.get('session_summary', 'None')[:50]}")
        else:
            log("fail", "POST /sessions/{id}/end", f"status={r.status_code} body={r.text[:300]}")
    except Exception as e:
        log("fail", "End session", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 17: Cannot send message to ended session
# ──────────────────────────────────────────────────────────────
def test_message_ended_session():
    print("\n17. Message to Ended Session Guard")
    if not SESSION_ID:
        log("fail", "Ended session guard", "no session ID")
        return

    try:
        r = requests.post(
            f"{BASE_URL}/sessions/{SESSION_ID}/message",
            json={"content": "This should fail"},
            headers=headers(),
            timeout=15,
        )
        if r.status_code == 400:
            log("pass", "Sending to ended session returns 400")
        else:
            log("fail", "Ended session guard", f"expected 400, got {r.status_code}")
    except Exception as e:
        log("fail", "Ended session guard", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 18: Cross-user access prevention
# ──────────────────────────────────────────────────────────────
def test_cross_user_access():
    print("\n18. Cross-User Access Prevention")
    if not SESSION_ID:
        log("fail", "Cross-user test", "no session ID")
        return

    try:
        # Register a second user
        email2 = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "name": "Attacker",
                "email": email2,
                "password": "AttackPass123!",
                "college": "Evil Corp",
            },
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code != 201:
            log("fail", "Cross-user setup", f"could not create second user: {r.status_code}")
            return

        token2 = r.json().get("token")

        # Try to access the first user's session
        r2 = requests.get(
            f"{BASE_URL}/sessions/{SESSION_ID}",
            headers={"Authorization": f"Bearer {token2}", "Content-Type": "application/json"},
            timeout=15,
        )
        if r2.status_code == 404:
            log("pass", "Cross-user session access returns 404")
        else:
            log("fail", "Cross-user access", f"expected 404, got {r2.status_code}")

        # Try to access first user's profile
        r3 = requests.get(
            f"{BASE_URL}/profile",
            headers={"Authorization": f"Bearer {token2}", "Content-Type": "application/json"},
            timeout=15,
        )
        if r3.status_code == 404:
            log("pass", "Cross-user profile access returns 404 (user2 has no profile)")
        else:
            # user2 has no profile, should be 404
            log("fail", "Cross-user profile", f"expected 404, got {r3.status_code}")

    except Exception as e:
        log("fail", "Cross-user test", str(e))


# ──────────────────────────────────────────────────────────────
# TEST 19: Wrong password login
# ──────────────────────────────────────────────────────────────
def test_wrong_password():
    print("\n19. Wrong Password Guard")
    try:
        r = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": "WrongPassword!"},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code == 401:
            log("pass", "Wrong password returns 401")
        else:
            log("fail", "Wrong password", f"expected 401, got {r.status_code}")
    except Exception as e:
        log("fail", "Wrong password test", str(e))


# ──────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  IKLAVYA E2E Test Suite")
    print(f"  Backend: {BASE_URL}")
    print(f"  Test user: {TEST_EMAIL}")
    print("=" * 60)

    tests = [
        test_health,
        test_register,
        test_duplicate_register,
        test_login,
        test_me,
        test_unauthorized,
        test_create_profile,
        test_update_profile,
        test_get_profile,
        test_profile_completed_flag,
        test_create_session,
        test_list_sessions,
        test_send_message_sse,
        test_session_detail,
        test_second_message,
        test_end_session,
        test_message_ended_session,
        test_cross_user_access,
        test_wrong_password,
    ]

    for test_fn in tests:
        test_fn()

    print("\n" + "=" * 60)
    print(f"  RESULTS: {PASS} passed, {FAIL} failed out of {PASS + FAIL} checks")
    print("=" * 60)

    if ERRORS:
        print("\n  FAILURES:")
        for err in ERRORS:
            print(f"    {err}")

    return 0 if FAIL == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
