import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify

# Load local .env file if present
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

# Email configuration
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
CONTACT_RECIPIENT_EMAIL = os.environ.get("CONTACT_RECIPIENT_EMAIL")

PROJECTS = [
    {
        "id": 1,
        "title": "Skill Scope AI"
        "description": "Find Trending Skills and Learning Platform",
        "tags": ["Flutter", "React", "APIs",],
        "github": "https://github.com/arjunsanthosh594",
        "demo": "https://example.com"
    },
    {
        "id": 2,
        "title": "ResuSure INSIGHT",
        "description": "Resume Checking and Creation.",
        "tags": ["JavaScript ", "PHP", "HTML", "CSS"],
        "github": "https://github.com/arjunsanthosh594",
        "demo": "https://example.com"
    },
]

SKILLS = [
    {"name": "Flutter", "level": "Intermediate"},
    {"name": "Docker & Containers", "level": "Advanced"},
    {"name": "HTML5 / CSS3 / JavaScript", "level": "Advanced"},
    {"name": "SQL", "level": "Intermediate"},
    {"name": "Git & CI/CD", "level": "Advanced"},
    {"name": "Linux & Shell Scripting", "level": "Advanced"}

]

def send_contact_notification(sender_name: str, sender_email: str, message_body: str) -> None:
    """Sends an email notification via SMTP using configured credentials."""
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_RECIPIENT_EMAIL]):
        raise RuntimeError("SMTP configuration is incomplete. Check your environment variables.")

    msg = EmailMessage()
    msg["Subject"] = f"New Portfolio Message from {sender_name}"
    msg["From"] = SMTP_USER
    msg["To"] = CONTACT_RECIPIENT_EMAIL
    msg["Reply-To"] = sender_email

    msg.set_content(
        f"You received a new inquiry from your portfolio contact form:\n\n"
        f"Name: {sender_name}\n"
        f"Email: {sender_email}\n"
        f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
        f"Message:\n{message_body}\n"
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        if SMTP_USE_TLS:
            server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

@app.route("/")
def index():
    return render_template(
        "index.html",
        projects=PROJECTS,
        skills=SKILLS,
        year=datetime.now().year
    )

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json() if request.is_json else request.form.to_dict()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    # Basic email format check
    if "@" not in email or "." not in email:
        return jsonify({"success": False, "message": "Please provide a valid email address."}), 400

    try:
        send_contact_notification(name, email, message)
        return jsonify({"success": True, "message": "Thank you! Your message has been sent."}), 200
    except Exception as exc:
        app.logger.error("Failed to deliver contact form email: %s", exc)
        return jsonify({
            "success": False,
            "message": "Unable to send your message right now. Please try again later."
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
