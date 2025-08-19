"""add lower(search_query) index

Revision ID: 20250819_add_lower_index_search_history
Revises: 20250818_add_query_key
Create Date: 2025-08-19
"""

from alembic import op

revision = 'rev_20250819_lower_idx'
down_revision = '20250818_add_query_key'
branch_labels = None
depends_on = None


def upgrade():
    # Functional index for case-insensitive lookups used in unique-latest logic
    op.execute("CREATE INDEX IF NOT EXISTS idx_search_history_lower_search_query ON search_history (LOWER(search_query))")


def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_search_history_lower_search_query")


