"""
Activity service
-----------------
Business logic for:
- Search history (search_history table) and mirroring to user_events
- Favorites (user_favorites)
- Generic user events (user_events)
- Comparison sessions and chat messages

WHY: Centralize activity write/read paths to keep endpoints thin and ensure
consistency with the database schema defined in database_schema_postgresql.sql.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Tuple
from models import UserEvent, SearchHistory, UserFavorite, ComparisonSession, ComparisonProduct, ChatMessage, Product, ProductPrice, ProductRating
import uuid


class ActivityService:
    """Coordinates reads/writes for activity-related features.

    WHY: Keeps database operations and guardrails in one place (service layer)
    so endpoints can stay focused on transport/auth and the rest of the app
    can reuse the same logic.
    """
    def __init__(self, db: Session):
        self.db = db

    # -------- SEARCH HISTORY (primary: search_history; mirror: user_events) --------
    def log_search(
        self,
        user_id: Optional[uuid.UUID],
        search_query: str,
        platform: str,
        results_count: int,
    ) -> Optional[SearchHistory]:
        """Log a user's search into search_history (and mirror into user_events).

        WHY: We store canonical search history in search_history to enable
        fast retrieval/pagination. We also mirror the event to user_events for
        analytics use-cases.
        """
        if user_id is None:
            return None

        # query_key: normalized key to group identical queries across renames
        normalized = ' '.join(search_query.lower().split())[:512]
        # Carry forward the latest custom label for this normalized key, if any
        try:
            existing_label_row = (
                self.db.query(SearchHistory.custom_label)
                .filter(
                    SearchHistory.user_id == user_id,
                    SearchHistory.deleted_at == None,
                    or_(SearchHistory.query_key == normalized, func.lower(SearchHistory.search_query) == normalized),
                    SearchHistory.custom_label != None,
                )
                .order_by(SearchHistory.created_at.desc())
                .first()
            )
            carry_label = existing_label_row[0] if existing_label_row else None
        except Exception:
            carry_label = None

        record = SearchHistory(
            user_id=user_id,
            search_query=search_query.strip(),
            query_key=normalized,
            platform=platform,
            results_count=results_count,
            custom_label=carry_label,
        )
        self.db.add(record)
        # Mirror to user_events (non-blocking best-effort)
        try:
            event = UserEvent(
                user_id=user_id,
                event_type="search",
                event_data={
                    "search_query": search_query.strip(),
                    "platform": platform,
                    "results_count": results_count,
                },
            )
            self.db.add(event)
        except Exception:
            pass
        self.db.commit()
        self.db.refresh(record)
        return record

    def list_search_history(
        self,
        user_id: uuid.UUID,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[SearchHistory], int]:
        """Return paginated search history for a user (newest first)."""
        limit = max(1, min(limit, 100))
        offset = max(0, offset)

        # Return unique latest entries by normalized key
        key_expr = func.coalesce(SearchHistory.query_key, func.lower(SearchHistory.search_query))
        subq = (
            self.db.query(
                key_expr.label('qk'),
                func.max(SearchHistory.created_at).label('max_created')
            )
            .filter(SearchHistory.user_id == user_id, SearchHistory.deleted_at == None)
            .group_by(key_expr)
            .subquery()
        )

        q = (
            self.db.query(SearchHistory)
            .join(subq, (key_expr == subq.c.qk) & (SearchHistory.created_at == subq.c.max_created))
            .filter(SearchHistory.user_id == user_id)
            .order_by(SearchHistory.created_at.desc())
        )
        total = q.count()
        items = q.limit(limit).offset(offset).all()
        return items, total

    def delete_search(self, user_id: uuid.UUID, search_id: uuid.UUID) -> bool:
        """Delete a specific search_history row by id for a user."""
        record = (
            self.db.query(SearchHistory)
            .filter(
                SearchHistory.search_id == search_id,
                SearchHistory.user_id == user_id,
            )
            .first()
        )
        if not record:
            return False
        record.deleted_at = func.now()
        self.db.commit()
        return True

    def update_search_label(self, user_id: uuid.UUID, search_id: uuid.UUID, custom_label: Optional[str]) -> Optional[SearchHistory]:
        """Update the custom label for a search history item (soft rename)."""
        record = (
            self.db.query(SearchHistory)
            .filter(
                SearchHistory.search_id == search_id,
                SearchHistory.user_id == user_id,
                SearchHistory.deleted_at == None,
            )
            .first()
        )
        if not record:
            return None
        record.custom_label = (custom_label or None)
        self.db.commit()
        self.db.refresh(record)
        return record

    def clear_search_history(self, user_id: uuid.UUID) -> int:
        """Delete all search history rows for a user. Returns count deleted."""
        # Soft delete: mark all user's rows as deleted
        updated = (
            self.db.query(SearchHistory)
            .filter(SearchHistory.user_id == user_id, SearchHistory.deleted_at == None)
            .update({SearchHistory.deleted_at: func.now()}, synchronize_session=False)
        )
        self.db.commit()
        return updated

    # -------- FAVORITES (user_favorites) --------
    def ensure_product_exists(
        self,
        product_id: str,
        platform_name: str | None = None,
        product_name: str | None = None,
        product_url: str | None = None,
        image_url: str | None = None,
        price: float | None = None,
        original_price: float | None = None,
        currency_code: str | None = None,
        currency_symbol: str | None = None,
        is_in_stock: bool | None = None,
        average_rating: float | None = None,
        total_review_count: int | None = None,
    ) -> None:
        """Ensure a minimal `products` row exists and upsert best-known snapshots for price/rating.

        WHY: Avoid FK failures and keep session product snapshots fresh for FE without extra calls.
        """
        try:
            prod = self.db.query(Product).filter(Product.product_id == product_id).first()
            if not prod:
                prod = Product(
                    product_id=product_id,
                    platform_name=platform_name or 'unknown',
                    product_name=product_name or product_id,
                    product_url=product_url,
                    image_url=image_url,
                )
                self.db.add(prod)
            else:
                # Light upsert of key snapshot fields
                if platform_name and not prod.platform_name:
                    prod.platform_name = platform_name
                if product_name and (not prod.product_name or prod.product_name == product_id):
                    prod.product_name = product_name
                if product_url and not prod.product_url:
                    prod.product_url = product_url
                if image_url and not prod.image_url:
                    prod.image_url = image_url

            # Append latest price snapshot if provided
            if price is not None or original_price is not None or is_in_stock is not None:
                self.db.add(
                    ProductPrice(
                        product_id=product_id,
                        current_price=float(price) if price is not None else None,
                        original_price=float(original_price) if original_price is not None else None,
                        currency_code=currency_code,
                        currency_symbol=currency_symbol,
                        is_in_stock=True if is_in_stock is None else bool(is_in_stock),
                    )
                )

            # Append latest rating snapshot if provided
            if average_rating is not None or total_review_count is not None:
                self.db.add(
                    ProductRating(
                        product_id=product_id,
                        average_rating=float(average_rating) if average_rating is not None else None,
                        total_review_count=total_review_count,
                    )
                )
            self.db.commit()
        except Exception:
            # Non-fatal: if it fails, add_favorite may still succeed if no FK, else return 500 handled upstream
            self.db.rollback()
            return
    def add_favorite(self, user_id: uuid.UUID, product_id: str, user_notes: Optional[str] = None) -> UserFavorite:
        """Add a product to user_favorites (idempotent; updates notes if exists)."""
        # Ensure unique constraint by checking existing
        existing = (
            self.db.query(UserFavorite)
            .filter(UserFavorite.user_id == user_id, UserFavorite.product_id == product_id)
            .first()
        )
        if existing:
            # update notes if provided
            if user_notes is not None:
                existing.user_notes = user_notes
                self.db.commit()
                self.db.refresh(existing)
            return existing

        fav = UserFavorite(user_id=user_id, product_id=product_id, user_notes=user_notes)
        self.db.add(fav)
        self.db.commit()
        self.db.refresh(fav)
        return fav

    def remove_favorite(self, user_id: uuid.UUID, product_id: str) -> bool:
        """Remove product from user_favorites for the user. Returns True if removed."""
        fav = (
            self.db.query(UserFavorite)
            .filter(UserFavorite.user_id == user_id, UserFavorite.product_id == product_id)
            .first()
        )
        if not fav:
            return False
        self.db.delete(fav)
        self.db.commit()
        return True

    def list_favorites(self, user_id: uuid.UUID, limit: int = 20, offset: int = 0) -> Tuple[List[UserFavorite], int]:
        """Paginated favorites list (newest first)."""
        limit = max(1, min(limit, 100))
        offset = max(0, offset)
        q = (
            self.db.query(UserFavorite)
            .filter(UserFavorite.user_id == user_id)
            .order_by(UserFavorite.created_at.desc())
        )
        total = q.count()
        items = q.limit(limit).offset(offset).all()
        return items, total

    def is_favorite(self, user_id: uuid.UUID, product_id: str) -> bool:
        """Check if product is currently favorited by user."""
        return (
            self.db.query(UserFavorite)
            .filter(UserFavorite.user_id == user_id, UserFavorite.product_id == product_id)
            .count()
            > 0
        )

    # -------- GENERIC USER EVENTS --------
    def log_event(self, user_id: uuid.UUID, event_type: str, event_data: dict) -> UserEvent:
        """Insert a user_event row for analytics/behavior tracking."""
        event = UserEvent(
            user_id=user_id,
            event_type=event_type,
            event_data=event_data or {},
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list_events(self, user_id: uuid.UUID, event_type: Optional[str] = None, limit: int = 20, offset: int = 0):
        """Paginated user_events list (optionally filter by event_type)."""
        q = self.db.query(UserEvent).filter(UserEvent.user_id == user_id)
        if event_type:
            q = q.filter(UserEvent.event_type == event_type)
        q = q.order_by(UserEvent.event_timestamp.desc())
        total = q.count()
        items = q.limit(max(1, min(limit, 100))).offset(max(0, offset)).all()
        return items, total

    # -------- COMPARISON SESSIONS & CHAT --------
    def create_comparison_session(
        self,
        user_id: uuid.UUID,
        product_ids: list[str],
        original_search_query: str | None = None,
        session_name: str | None = None,
    ) -> ComparisonSession:
        """Create a comparison session and attach product ids.

        WHY: Enables resuming a chat later with the same set of products.
        """
        session = ComparisonSession(
            user_id=user_id,
            original_search_query=original_search_query,
            session_name=session_name,
        )
        self.db.add(session)
        self.db.flush()
        # Ensure products rows exist to satisfy FK constraint (products -> comparison_products)
        for pid in product_ids:
            try:
                self.ensure_product_exists(product_id=pid)
            except Exception:
                # Non-fatal: continue; insert may still succeed if FK not enforced
                pass
            self.db.add(ComparisonProduct(comparison_id=session.comparison_id, product_id=pid))
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
        self.db.refresh(session)
        return session

    def list_comparison_sessions(self, user_id: uuid.UUID, limit: int = 20, offset: int = 0, min_messages: int = 0):
        """Return user's comparison sessions (newest updated first).

        If min_messages > 0, only sessions with at least that many chat messages are returned.
        """
        # Subquery to count messages per session
        msg_counts_sq = (
            self.db
            .query(ChatMessage.comparison_id.label('cid'), func.count(ChatMessage.message_id).label('msg_count'))
            .group_by(ChatMessage.comparison_id)
            .subquery()
        )

        q = (
            self.db
            .query(ComparisonSession)
            .outerjoin(msg_counts_sq, msg_counts_sq.c.cid == ComparisonSession.comparison_id)
            .filter(ComparisonSession.user_id == user_id, ComparisonSession.deleted_at == None)
        )

        if min_messages and min_messages > 0:
            q = q.filter((msg_counts_sq.c.msg_count != None) & (msg_counts_sq.c.msg_count >= min_messages))

        q = q.order_by(ComparisonSession.updated_at.desc())

        total = q.count()
        items = q.limit(max(1, min(limit, 100))).offset(max(0, offset)).all()
        return items, total

    def get_comparison_session(self, user_id: uuid.UUID, comparison_id: uuid.UUID) -> ComparisonSession | None:
        """Fetch a specific session if owned by user."""
        return (
            self.db.query(ComparisonSession)
            .filter(ComparisonSession.comparison_id == comparison_id, ComparisonSession.user_id == user_id, ComparisonSession.deleted_at == None)
            .first()
        )

    def list_comparison_products(self, comparison_id: uuid.UUID) -> list[ComparisonProduct]:
        """List products attached to a comparison session."""
        return (
            self.db.query(ComparisonProduct)
            .filter(ComparisonProduct.comparison_id == comparison_id, ComparisonProduct.deleted_at == None)
            .all()
        )

    def add_comparison_product(self, user_id: uuid.UUID, comparison_id: uuid.UUID, product_id: str) -> bool:
        """Attach a product to a comparison session if not already present (soft-deleted entries are restored)."""
        # Ensure session belongs to user
        session = self.get_comparison_session(user_id, comparison_id)
        if not session:
            return False
        # Restore if soft-deleted
        existing = (
            self.db.query(ComparisonProduct)
            .filter(ComparisonProduct.comparison_id == comparison_id, ComparisonProduct.product_id == product_id)
            .first()
        )
        if existing:
            if getattr(existing, 'deleted_at', None) is not None:
                existing.deleted_at = None
                self.db.commit()
            return True
        self.db.add(ComparisonProduct(comparison_id=comparison_id, product_id=product_id))
        self.db.commit()
        return True

    def remove_comparison_product(self, user_id: uuid.UUID, comparison_id: uuid.UUID, product_id: str) -> bool:
        """Soft delete a product from a session."""
        session = self.get_comparison_session(user_id, comparison_id)
        if not session:
            return False
        row = (
            self.db.query(ComparisonProduct)
            .filter(ComparisonProduct.comparison_id == comparison_id, ComparisonProduct.product_id == product_id)
            .first()
        )
        if not row:
            return False
        row.deleted_at = func.now()
        self.db.commit()
        return True

    def clear_comparison_sessions(self, user_id: uuid.UUID) -> int:
        """Soft delete all comparison sessions for a user by setting deleted_at; also soft-delete related products and messages. Returns count."""
        sessions = (
            self.db.query(ComparisonSession)
            .filter(ComparisonSession.user_id == user_id, ComparisonSession.deleted_at == None)
            .all()
        )
        count = 0
        now_expr = func.now()
        for sess in sessions:
            sess.deleted_at = now_expr
            count += 1
            self.db.query(ComparisonProduct).filter(
                ComparisonProduct.comparison_id == sess.comparison_id,
                ComparisonProduct.deleted_at == None
            ).update({ComparisonProduct.deleted_at: now_expr}, synchronize_session=False)
            self.db.query(ChatMessage).filter(
                ChatMessage.comparison_id == sess.comparison_id,
                ChatMessage.deleted_at == None
            ).update({ChatMessage.deleted_at: now_expr}, synchronize_session=False)
        self.db.commit()
        return count

    def list_chat_messages(self, user_id: uuid.UUID, comparison_id: uuid.UUID, limit: int = 50, offset: int = 0):
        """Return chat messages for a session after access check."""
        # Verify access
        session = self.get_comparison_session(user_id, comparison_id)
        if not session:
            return [], 0
        q = (
            self.db.query(ChatMessage)
            .filter(ChatMessage.comparison_id == comparison_id, ChatMessage.deleted_at == None)
            .order_by(ChatMessage.created_at.asc())
        )
        total = q.count()
        items = q.limit(max(1, min(limit, 200))).offset(max(0, offset)).all()
        return items, total

    def add_chat_message(
        self,
        user_id: uuid.UUID,
        comparison_id: uuid.UUID,
        message_type: str,
        message_content: str,
        ai_metadata: dict | None = None,
    ) -> ChatMessage:
        """Append a chat message to a session (user or ai)."""
        # Verify access
        session = self.get_comparison_session(user_id, comparison_id)
        if not session:
            raise ValueError("Comparison session not found")
        msg = ChatMessage(
            comparison_id=comparison_id,
            user_id=user_id,
            message_type=message_type,
            message_content=message_content,
            ai_metadata=ai_metadata,
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg


