"""add soft delete deleted_at columns

Revision ID: 20250818_add_soft_delete
Revises: 
Create Date: 2025-08-18
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250818_add_soft_delete'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Core tables
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user_sessions', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user_events', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user_favorites', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('search_history', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('products', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('chat_history', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))

    # Comparison feature tables
    op.add_column('comparison_sessions', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('comparison_products', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('chat_messages', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    # Comparison feature tables
    op.drop_column('chat_messages', 'deleted_at')
    op.drop_column('comparison_products', 'deleted_at')
    op.drop_column('comparison_sessions', 'deleted_at')

    # Core tables
    op.drop_column('chat_history', 'deleted_at')
    op.drop_column('products', 'deleted_at')
    op.drop_column('search_history', 'deleted_at')
    op.drop_column('user_favorites', 'deleted_at')
    op.drop_column('user_events', 'deleted_at')
    op.drop_column('user_sessions', 'deleted_at')
    op.drop_column('users', 'deleted_at')


