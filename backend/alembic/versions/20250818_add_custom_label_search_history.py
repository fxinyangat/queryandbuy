"""add custom_label to search_history

Revision ID: 20250818_add_custom_label
Revises: 20250818_add_soft_delete
Create Date: 2025-08-18
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250818_add_custom_label'
down_revision = '20250818_add_soft_delete'
branch_labels = None
depends_on = None


def upgrade():
    # Use IF NOT EXISTS for idempotency
    op.execute("ALTER TABLE search_history ADD COLUMN IF NOT EXISTS custom_label VARCHAR(200)")


def downgrade():
    op.execute("ALTER TABLE search_history DROP COLUMN IF EXISTS custom_label")


