Run SMTP server: locally: python -m aiosmtpd -n -l localhost:1025

Upgrade Shema head: cd backend && alembic -c alembic.ini upgrade head