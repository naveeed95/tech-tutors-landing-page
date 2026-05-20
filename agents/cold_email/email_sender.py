"""
Sends email via Gmail SMTP using an App Password.
Requires: GMAIL_USER and GMAIL_APP_PASS in environment.
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def _get_credentials() -> tuple[str, str]:
    user = os.environ.get("GMAIL_USER")
    password = os.environ.get("GMAIL_APP_PASS")
    if not user or not password:
        raise EnvironmentError("GMAIL_USER and GMAIL_APP_PASS must be set in environment")
    return user, password


def _html_body(plain: str) -> str:
    """Wrap plain text in minimal HTML for better deliverability."""
    paragraphs = "".join(
        f"<p style='margin:0 0 12px 0;line-height:1.6'>{line}</p>"
        for line in plain.strip().split("\n")
        if line.strip()
    )
    return f"""<html><body style="font-family:Arial,sans-serif;font-size:15px;color:#222;max-width:600px">
{paragraphs}
</body></html>"""


def send_email(to_email: str, subject: str, body: str, sender_name: str | None = None) -> None:
    """
    Send a single email.
    Raises smtplib.SMTPException on failure.
    """
    gmail_user, gmail_pass = _get_credentials()
    if not sender_name:
        sender_name = os.environ.get("SENDER_NAME", "Naveed | The Tech Tutors")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{sender_name} <{gmail_user}>"
    msg["To"]      = to_email

    msg.attach(MIMEText(body, "plain"))
    msg.attach(MIMEText(_html_body(body), "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(gmail_user, gmail_pass)
        server.sendmail(gmail_user, to_email, msg.as_string())
