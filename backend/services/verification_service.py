import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import unquote_plus
from sqlalchemy.orm import Session
from models import EmailVerificationToken, User
from services.email_service import EmailService


class VerificationService:
    def __init__(self, db: Session):
        self.db = db
        self.email = EmailService()
        self.frontend_base = os.getenv("FRONTEND_BASE_URL", "https://queryandbuy.vercel.app")
        self.token_ttl_minutes = int(os.getenv("EMAIL_VERIFY_TTL_MINUTES", "30"))

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def _generate_code(self) -> str:
        return f"{secrets.randbelow(1000000):06d}"

    def issue_token(self, user: User, purpose: str = 'verify') -> tuple[str, str]:
        raw = secrets.token_urlsafe(32)
        token_hash = self._hash_token(raw)
        code = self._generate_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=self.token_ttl_minutes)

        # Invalidate previous for same purpose
        self.db.query(EmailVerificationToken).filter(
            EmailVerificationToken.user_id == user.user_id,
            EmailVerificationToken.used_at == None,
            EmailVerificationToken.purpose == purpose,
        ).update({EmailVerificationToken.used_at: datetime.now(timezone.utc)}, synchronize_session=False)

        rec = EmailVerificationToken(
            user_id=user.user_id,
            token_hash=token_hash,
            code=code,
            expires_at=expires_at,
            purpose=purpose,
        )
        self.db.add(rec)
        self.db.commit()
        return raw, code

    def send_verification_email(self, to_email: str, user: User, token: str, code: str):
        link = f"{self.frontend_base}/verify?token={token}"
        subject = "Confirm your email for ShopQnB AI"
        display_name = (user.first_name or user.username or user.email.split('@')[0]) if user else "there"
        html = render_verify_email_html(link=link, code=code, name=display_name)
        text = render_verify_email_text(link=link, code=code, name=display_name)
        self.email.send_email(to_email, subject, html, text)

    def send_password_reset_email(self, to_email: str, user: User, token: str, code: str):
        link = f"{self.frontend_base}/reset-password?token={token}"
        subject = "Reset your password – ShopQnB AI"
        display_name = (user.first_name or user.username or user.email.split('@')[0]) if user else "there"
        html = render_reset_email_html(link=link, code=code, name=display_name)
        text = render_reset_email_text(link=link, code=code, name=display_name)
        self.email.send_email(to_email, subject, html, text)

    def verify_by_token(self, token: str) -> bool:
        # Normalize token for common quoted-printable and url encoding artifacts
        t = (token or "").strip()
        t = unquote_plus(t)
        # If someone pasted a full URL accidentally, extract the value
        if "token=" in t:
            t = t.split("token=", 1)[1]
        # Remove quoted-printable soft breaks and any whitespace
        t = t.replace("=\r\n", "").replace("=\n", "").replace("\r", "").replace("\n", "")
        t = "".join(t.split())
        # Some terminals show a leading '3D' from QP copy; strip it
        if t.startswith("3D"):
            t = t[2:]
        # token_urlsafe is unpadded and does not contain '='; remove any stray '='
        t = t.replace("=", "")
        token_hash = self._hash_token(t)
        rec = (
            self.db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.token_hash == token_hash,
                EmailVerificationToken.purpose == 'verify',
            )
            .first()
        )
        if not rec or rec.used_at is not None or rec.expires_at < datetime.now(timezone.utc):
            return False
        user = self.db.query(User).filter(User.user_id == rec.user_id).first()
        if not user:
            return False
        user.email_verified = True
        rec.used_at = datetime.now(timezone.utc)
        self.db.commit()
        return True

    def verify_by_code(self, email: str, code: str) -> bool:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return False
        rec = (
            self.db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.user_id == user.user_id,
                EmailVerificationToken.purpose == 'verify',
            )
            .order_by(EmailVerificationToken.created_at.desc())
            .first()
        )
        if not rec or rec.used_at is not None or rec.expires_at < datetime.now(timezone.utc) or rec.code != code:
            return False
        user.email_verified = True
        rec.used_at = datetime.now(timezone.utc)
        self.db.commit()
        return True


def render_verify_email_html(link: str, code: str, name: str | None = None) -> str:
    brand = "ShopQnB AI"
    color = "#5755FE"
    # Placeholder logo URL; replace with your CDN asset
    logo = os.getenv("BRAND_LOGO_URL", "https://queryandbuy.vercel.app/logo.png")
    banner = os.getenv("VERIFY_BANNER_URL", "https://via.placeholder.com/800x260/EEF/99C")
    return f"""
<!doctype html>
<html>
<head>
  <meta name=viewport content="width=device-width, initial-scale=1"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>{brand} – Verify your email</title>
  <style>
    body {{ margin:0; background:#f5f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    .container {{ max-width: 640px; margin: 24px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.06) }}
    .header {{ padding:20px 24px; display:flex; align-items:center; }}
    .header img {{ height:24px; }}
    .banner img {{ width:100%; display:block; }}
    .content {{ padding: 28px 24px 36px; }}
    h1 {{ font-size: 28px; margin: 8px 0 12px; color:#111; }}
    p {{ color:#555; line-height:1.6; }}
    .btn {{ display:inline-block; background:{color}; color:#fff; text-decoration:none; padding:14px 28px; border-radius:999px; font-weight:600; box-shadow: 0 6px 0 rgba(0,0,0,0.06); }}
    .code {{ font-size:22px; letter-spacing:4px; font-weight:700; margin-top:16px; color:#111; }}
    .footer {{ padding:20px 24px; color:#888; font-size:12px; }}
  </style>
  <!--[if mso]><style>.btn{{padding:0 !important}}</style><![endif]-->
  </head>
  <body>
    <div class="container">
      <div class="header"><img src="{logo}" alt="{brand}" /></div>
      <div class="banner"><img src="{banner}" alt=""/></div>
      <div class="content">
        <div style="color:#888; font-size:12px; font-weight:700; text-transform:uppercase">You're one step away</div>
        <h1>Confirm your email</h1>
        <p style="font-weight:600; margin:6px 0 14px;">Y'ello {name or ''}</p>
        <p>Welcome to the era of intelligent shopping with {brand}! Click the button below to confirm your email and start shopping smarter not harder.</p>
        <p style="margin:28px 0"><a class="btn" href="{link}">Confirm email</a></p>
        <p>If the button doesn’t work, copy and paste this link into your browser:<br/><span style="word-break:break-all; color:#555">{link}</span></p>
        <p>Or enter this code:</p>
        <div class="code">{code}</div>
      </div>
      <div class="footer">
        <div>Have a question? Reply to this email.</div>
        <div>&copy; {brand}</div>
      </div>
    </div>
  </body>
</html>
"""


def render_verify_email_text(link: str, code: str, name: str | None = None) -> str:
    return (
        "Confirm your email\n\n"
        f"Y'ello {name or ''}\n"
        "Welcome to the era of intelligent shopping with ShopQnB AI! Confirm your email to get started.\n\n"
        f"Confirm link: {link}\n"
        f"Or enter this code: {code}\n\n"
        "If you didn’t sign up, please ignore this email."
    )


def render_reset_email_html(link: str, code: str, name: str | None = None) -> str:
    brand = "ShopQnB AI"
    color = "#5755FE"
    logo = os.getenv("BRAND_LOGO_URL", "https://queryandbuy.vercel.app/logo.png")
    banner = os.getenv("RESET_BANNER_URL", "https://via.placeholder.com/800x260/EEF/99C")
    return f"""
<!doctype html>
<html>
<head>
  <meta name=viewport content="width=device-width, initial-scale=1"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>{brand} – Reset your password</title>
  <style>
    body {{ margin:0; background:#f5f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    .container {{ max-width: 640px; margin: 24px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.06) }}
    .header {{ padding:20px 24px; display:flex; align-items:center; }}
    .header img {{ height:24px; }}
    .banner img {{ width:100%; display:block; }}
    .content {{ padding: 28px 24px 36px; }}
    h1 {{ font-size: 28px; margin: 8px 0 12px; color:#111; }}
    p {{ color:#555; line-height:1.6; }}
    .btn {{ display:inline-block; background:{color}; color:#fff; text-decoration:none; padding:14px 28px; border-radius:999px; font-weight:600; box-shadow: 0 6px 0 rgba(0,0,0,0.06); }}
    .code {{ font-size:22px; letter-spacing:4px; font-weight:700; margin-top:16px; color:#111; }}
    .footer {{ padding:20px 24px; color:#888; font-size:12px; }}
  </style>
  <!--[if mso]><style>.btn{{padding:0 !important}}</style><![endif]-->
  </head>
  <body>
    <div class="container">
      <div class="header"><img src="{logo}" alt="{brand}" /></div>
      <div class="banner"><img src="{banner}" alt=""/></div>
      <div class="content">
        <div style="color:#888; font-size:12px; font-weight:700; text-transform:uppercase">Reset your password</div>
        <h1>Finish resetting your password</h1>
        <p style="font-weight:600; margin:6px 0 14px;">Hi {name or ''}</p>
        <p>Click the button below to securely reset your password. This link expires soon for your security.</p>
        <p style="margin:28px 0"><a class="btn" href="{link}">Reset password</a></p>
        <p>If the button doesn’t work, copy and paste this link into your browser:<br/><span style="word-break:break-all; color:#555">{link}</span></p>
        <p>Or enter this code:</p>
        <div class="code">{code}</div>
      </div>
      <div class="footer">
        <div>If you didn’t request this, you can safely ignore this email.</div>
        <div>&copy; {brand}</div>
      </div>
    </div>
  </body>
</html>
"""


def render_reset_email_text(link: str, code: str, name: str | None = None) -> str:
    return (
        "Reset your password\n\n"
        f"Hi {name or ''}\n"
        "Click the link below to reset your password.\n\n"
        f"Reset link: {link}\n"
        f"Or enter this code: {code}\n\n"
        "If you didn’t request this, ignore this email."
    )


