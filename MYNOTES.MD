Run SMTP server: locally: python -m aiosmtpd -n -l localhost:1025

Upgrade Shema head: cd backend && alembic -c alembic.ini upgrade head

Temp tables restore Railway: cd backend && python3 -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)" && alembic -c alembic.ini stamp 20250818_add_query_key && alembic -c alembic.ini upgrade head && sleep 10