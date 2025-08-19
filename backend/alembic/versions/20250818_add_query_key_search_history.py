"""add query_key to search_history

Revision ID: 20250818_add_query_key
Revises: 20250818_add_custom_label
Create Date: 2025-08-18
"""

from alembic import op
import sqlalchemy as sa

revision = '20250818_add_query_key'
down_revision = '20250818_add_custom_label'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("ALTER TABLE search_history ADD COLUMN IF NOT EXISTS query_key VARCHAR(512)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_search_history_query_key ON search_history(query_key)")

def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_search_history_query_key")
    op.execute("ALTER TABLE search_history DROP COLUMN IF EXISTS query_key")


