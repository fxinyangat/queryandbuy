"""add purpose to email_verification_tokens

Revision ID: 20250821_add_evt_purpose
Revises: rev_20250819_lower_idx
Create Date: 2025-08-21
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = '20250821_add_evt_purpose'
down_revision = 'rev_20250819_aux_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add purpose column with default and index; idempotent
    op.execute(
        "ALTER TABLE email_verification_tokens "
        "ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'verify'"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_purpose "
        "ON email_verification_tokens(purpose)"
    )


def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_email_verification_tokens_purpose")
    op.execute("ALTER TABLE email_verification_tokens DROP COLUMN IF EXISTS purpose")


