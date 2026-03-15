"""
Email utility using Resend API.
Fails silently if RESEND_API_KEY is not set (dev mode).
"""

from app.config import RESEND_API_KEY, APP_URL

_resend = None


def _get_resend():
    global _resend
    if _resend is None and RESEND_API_KEY:
        import resend
        resend.api_key = RESEND_API_KEY
        _resend = resend
    return _resend


def send_email(to: str, subject: str, html: str):
    r = _get_resend()
    if not r:
        return
    try:
        r.Emails.send({
            "from": "Iklavya <noreply@uddit.site>",
            "to": to,
            "subject": subject,
            "html": html,
        })
    except Exception:
        pass  # Don't crash on email failures


# ─── Email Templates ──────────────────────────────────────


def send_welcome_email(name: str, email: str):
    send_email(
        to=email,
        subject="Welcome to Iklavya! 🎓",
        html=f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #059669; font-size: 24px; margin: 0;">Welcome to Iklavya!</h1>
            </div>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Your account has been created successfully. You now have access to:
            </p>
            <ul style="color: #374151; font-size: 14px; line-height: 1.8;">
                <li>AI-powered career guidance sessions</li>
                <li>Professional resume builder</li>
                <li>Skill development modules &amp; assessments</li>
                <li>Job feed with personalized matching</li>
                <li>Expert mentorship network</li>
            </ul>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{APP_URL}/login" style="background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Go to Dashboard
                </a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 32px;">
                &copy; 2026 Iklavya. All rights reserved.
            </p>
        </div>
        """,
    )


def send_password_reset_email(name: str, email: str, reset_token: str):
    reset_link = f"{APP_URL}/reset-password?token={reset_token}"
    send_email(
        to=email,
        subject="Reset Your Iklavya Password",
        html=f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #111827; font-size: 20px;">Password Reset Request</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{reset_link}" style="background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #6B7280; font-size: 13px; line-height: 1.6;">
                This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 32px;">
                &copy; 2026 Iklavya. All rights reserved.
            </p>
        </div>
        """,
    )


def send_mentor_session_accepted_email(
    student_name: str, student_email: str, mentor_name: str, topic: str
):
    send_email(
        to=student_email,
        subject=f"Session Accepted by {mentor_name}!",
        html=f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #059669; font-size: 20px;">Session Accepted!</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>{student_name}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Great news! <strong>{mentor_name}</strong> has accepted your mentorship session on "<em>{topic}</em>".
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                You can now start chatting with your mentor.
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{APP_URL}/dashboard/mentorship" style="background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Open Mentorship
                </a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 32px;">
                &copy; 2026 Iklavya. All rights reserved.
            </p>
        </div>
        """,
    )


def send_certificate_earned_email(
    name: str, email: str, module_title: str, cert_slug: str
):
    cert_url = f"{APP_URL}/cert/{cert_slug}"
    send_email(
        to=email,
        subject=f"Certificate Earned: {module_title}!",
        html=f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #059669; font-size: 20px;">Congratulations! 🎉</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                You've earned a certificate for completing <strong>{module_title}</strong>!
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{cert_url}" style="background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View Certificate
                </a>
            </div>
            <p style="color: #6B7280; font-size: 13px; line-height: 1.6;">
                Share your certificate link: <a href="{cert_url}" style="color: #059669;">{cert_url}</a>
            </p>
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 32px;">
                &copy; 2026 Iklavya. All rights reserved.
            </p>
        </div>
        """,
    )
