"""create auxiliary analytics/metadata tables (idempotent)

Revision ID: rev_20250819_aux_tables
Revises: rev_20250819_lower_idx
Create Date: 2025-08-19
"""

from alembic import op

revision = 'rev_20250819_aux_tables'
down_revision = 'rev_20250819_lower_idx'
branch_labels = None
depends_on = None


def upgrade():
    # NOTE: Use IF NOT EXISTS everywhere to make this idempotent in prod
    # Some managed Postgres instances may not allow creating extensions; avoid uuid defaults

    # product_metadata
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS product_metadata (
            metadata_id uuid PRIMARY KEY,
            product_id varchar(255) NOT NULL,
            metadata_key varchar(100) NOT NULL,
            metadata_value text,
            metadata_type varchar(50),
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
        """
    )
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_product_metadata_pid_key ON product_metadata(product_id, metadata_key);")

    # product_metrics
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS product_metrics (
            product_id varchar(255) PRIMARY KEY,
            view_count integer DEFAULT 0,
            save_count integer DEFAULT 0,
            compare_count integer DEFAULT 0,
            last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # product_recommendations
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS product_recommendations (
            recommendation_id uuid PRIMARY KEY,
            user_id uuid NOT NULL,
            product_id varchar(255) NOT NULL,
            recommendation_type varchar(50),
            confidence_score numeric(3,2),
            recommendation_reason text,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # product_reviews
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS product_reviews (
            review_id uuid PRIMARY KEY,
            product_id varchar(255) NOT NULL,
            user_id uuid,
            reviewer_name varchar(255),
            rating integer NOT NULL,
            review_title varchar(255),
            review_content text,
            review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            helpful_votes integer DEFAULT 0,
            verified_purchase boolean DEFAULT false,
            platform_review_id varchar(255),
            platform_name varchar(50),
            review_metadata jsonb
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_reviews_pid ON product_reviews(product_id);")

    # search_analytics
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS search_analytics (
            search_id uuid PRIMARY KEY,
            search_query text NOT NULL,
            platform_name varchar(50),
            total_searches integer DEFAULT 1,
            average_results_count integer,
            first_searched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            last_searched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # user_analytics
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS user_analytics (
            analytics_id uuid PRIMARY KEY,
            user_id uuid NOT NULL,
            analytics_date date NOT NULL,
            total_searches integer DEFAULT 0,
            total_product_views integer DEFAULT 0,
            total_comparisons integer DEFAULT 0,
            total_chat_messages integer DEFAULT 0,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
        """
    )
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_analytics_user_date ON user_analytics(user_id, analytics_date);")

    # user_category_preferences
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS user_category_preferences (
            user_id uuid NOT NULL,
            category_id uuid NOT NULL,
            interest_score numeric(3,2) DEFAULT 0.0,
            last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
        );
        """
    )
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_category_pref ON user_category_preferences(user_id, category_id);")

    # Ensure historical indices exist
    op.execute("CREATE INDEX IF NOT EXISTS idx_search_history_lower_search_query ON search_history (LOWER(search_query));")
    op.execute("CREATE INDEX IF NOT EXISTS idx_search_history_query_key ON search_history (query_key);")


def downgrade():
    # No destructive downgrade in prod; keep tables (safe)
    pass


