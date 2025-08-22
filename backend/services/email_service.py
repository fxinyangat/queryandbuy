import os
import smtplib
from email.message import EmailMessage
from typing import Optional


class EmailService:
    """Minimal SMTP email sender.

    Configure with env vars:
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
    """

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.smtp_from = os.getenv("SMTP_FROM", "no-reply@shopqnb.com")
        # TLS/SSL toggles for local dev (aiosmtpd/MailHog don't support STARTTLS)
        self.smtp_tls = os.getenv("SMTP_TLS", "true").lower() in ("1", "true", "yes")
        self.smtp_ssl = os.getenv("SMTP_SSL", "false").lower() in ("1", "true", "yes")

    def send_email(self, to_email: str, subject: str, html: str, text: Optional[str] = None):
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.smtp_from
        msg["To"] = to_email
        if not text:
            # basic plaintext fallback from HTML
            text = self._html_to_text(html)
        msg.set_content(text)
        msg.add_alternative(html, subtype="html")

        # Choose SSL or plain SMTP
        if self.smtp_ssl:
            with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
                if self.smtp_user and self.smtp_pass:
                    server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                try:
                    server.ehlo()
                except Exception:
                    pass
                # Only upgrade if allowed and supported by the server
                if self.smtp_tls:
                    try:
                        if server.has_extn('starttls'):
                            server.starttls()
                            server.ehlo()
                    except Exception:
                        # Local dev servers (aiosmtpd) often lack STARTTLS
                        pass
                if self.smtp_user and self.smtp_pass:
                    server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)

    @staticmethod
    def _html_to_text(html: str) -> str:
        # Very naive fallback; good enough for inbox preview
        import re
        txt = re.sub(r"<br\s*/?>", "\n", html)
        txt = re.sub(r"<[^>]+>", " ", txt)
        return " ".join(txt.split())


