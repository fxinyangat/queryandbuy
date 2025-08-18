--
-- PostgreSQL database dump
--

\restrict ksKM5Lfpl1UlOIkQLgjmmoGQe9xGXjOTxHBYtTmZYZG99cXASL9KarmWYr5PlwG

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    category_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_name character varying(100) NOT NULL,
    parent_category_id uuid,
    category_description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: chat_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_history (
    chat_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    response text,
    context json,
    created_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    message_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    comparison_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message_type character varying(20) NOT NULL,
    message_content text NOT NULL,
    ai_metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    CONSTRAINT chat_messages_message_type_check CHECK (((message_type)::text = ANY ((ARRAY['user'::character varying, 'ai'::character varying])::text[])))
);


--
-- Name: comparison_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comparison_products (
    comparison_id uuid NOT NULL,
    product_id character varying(255) NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


--
-- Name: comparison_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comparison_sessions (
    comparison_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    session_name character varying(255),
    original_search_query text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


--
-- Name: event_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_types (
    event_type character varying(50) NOT NULL,
    event_description text,
    event_schema jsonb NOT NULL,
    is_tracked boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    product_id character varying(255) NOT NULL,
    category_id uuid NOT NULL
);


--
-- Name: product_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_metadata (
    metadata_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id character varying(255) NOT NULL,
    metadata_key character varying(100) NOT NULL,
    metadata_value text,
    metadata_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_metrics (
    product_id character varying(255) NOT NULL,
    view_count integer DEFAULT 0,
    save_count integer DEFAULT 0,
    compare_count integer DEFAULT 0,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_prices (
    price_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id character varying(255) NOT NULL,
    current_price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    currency_code character varying(3) DEFAULT 'USD'::character varying,
    currency_symbol character varying(5) DEFAULT '$'::character varying,
    is_in_stock boolean DEFAULT true,
    shipping_cost numeric(10,2),
    shipping_info text,
    price_recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_ratings (
    rating_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id character varying(255) NOT NULL,
    average_rating numeric(3,2),
    total_review_count integer,
    rating_recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_recommendations (
    recommendation_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    product_id character varying(255) NOT NULL,
    recommendation_type character varying(50),
    confidence_score numeric(3,2),
    recommendation_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_reviews (
    review_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id character varying(255) NOT NULL,
    user_id uuid,
    reviewer_name character varying(255),
    rating integer NOT NULL,
    review_title character varying(255),
    review_content text,
    review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    helpful_votes integer DEFAULT 0,
    verified_purchase boolean DEFAULT false,
    platform_review_id character varying(255),
    platform_name character varying(50),
    review_metadata jsonb,
    CONSTRAINT product_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id character varying(255) NOT NULL,
    platform_name character varying(50) NOT NULL,
    product_name character varying(500) NOT NULL,
    product_description text,
    model_number character varying(100),
    brand_name character varying(255),
    manufacturer_name character varying(255),
    product_url text,
    image_url text,
    thumbnail_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


--
-- Name: search_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_analytics (
    search_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    search_query text NOT NULL,
    platform_name character varying(50),
    total_searches integer DEFAULT 1,
    average_results_count integer,
    first_searched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_searched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_history (
    search_id uuid NOT NULL,
    user_id uuid NOT NULL,
    search_query character varying(500) NOT NULL,
    platform character varying(50) NOT NULL,
    results_count integer,
    created_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    custom_label character varying(200)
);


--
-- Name: user_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_analytics (
    analytics_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    analytics_date date NOT NULL,
    total_searches integer DEFAULT 0,
    total_product_views integer DEFAULT 0,
    total_comparisons integer DEFAULT 0,
    total_chat_messages integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_category_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_category_preferences (
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    interest_score numeric(3,2) DEFAULT 0.0,
    last_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_events (
    event_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    event_type character varying(50) NOT NULL,
    event_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    event_data jsonb NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorites (
    favorite_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    product_id character varying(255) NOT NULL,
    user_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    session_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    session_token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address inet,
    user_agent text,
    deleted_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100),
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    avatar_url text,
    email_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login_at timestamp without time zone,
    user_preferences jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp with time zone
);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: chat_history chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_pkey PRIMARY KEY (chat_id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (message_id);


--
-- Name: comparison_products comparison_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comparison_products
    ADD CONSTRAINT comparison_products_pkey PRIMARY KEY (comparison_id, product_id);


--
-- Name: comparison_sessions comparison_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comparison_sessions
    ADD CONSTRAINT comparison_sessions_pkey PRIMARY KEY (comparison_id);


--
-- Name: event_types event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_pkey PRIMARY KEY (event_type);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- Name: product_metadata product_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_metadata
    ADD CONSTRAINT product_metadata_pkey PRIMARY KEY (metadata_id);


--
-- Name: product_metadata product_metadata_product_id_metadata_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_metadata
    ADD CONSTRAINT product_metadata_product_id_metadata_key_key UNIQUE (product_id, metadata_key);


--
-- Name: product_metrics product_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_metrics
    ADD CONSTRAINT product_metrics_pkey PRIMARY KEY (product_id);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (price_id);


--
-- Name: product_prices product_prices_product_id_price_recorded_at_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_product_id_price_recorded_at_key UNIQUE (product_id, price_recorded_at);


--
-- Name: product_ratings product_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ratings
    ADD CONSTRAINT product_ratings_pkey PRIMARY KEY (rating_id);


--
-- Name: product_ratings product_ratings_product_id_rating_recorded_at_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ratings
    ADD CONSTRAINT product_ratings_product_id_rating_recorded_at_key UNIQUE (product_id, rating_recorded_at);


--
-- Name: product_recommendations product_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_recommendations
    ADD CONSTRAINT product_recommendations_pkey PRIMARY KEY (recommendation_id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (review_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: search_analytics search_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_analytics
    ADD CONSTRAINT search_analytics_pkey PRIMARY KEY (search_id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (search_id);


--
-- Name: user_analytics user_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_pkey PRIMARY KEY (analytics_id);


--
-- Name: user_analytics user_analytics_user_id_analytics_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_user_id_analytics_date_key UNIQUE (user_id, analytics_date);


--
-- Name: user_category_preferences user_category_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_category_preferences
    ADD CONSTRAINT user_category_preferences_pkey PRIMARY KEY (user_id, category_id);


--
-- Name: user_events user_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_pkey PRIMARY KEY (event_id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (favorite_id);


--
-- Name: user_favorites user_favorites_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: user_sessions user_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_chat_messages_comparison_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_comparison_id ON public.chat_messages USING btree (comparison_id);


--
-- Name: idx_comparison_products_comparison_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comparison_products_comparison_id ON public.comparison_products USING btree (comparison_id);


--
-- Name: idx_comparison_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comparison_sessions_user_id ON public.comparison_sessions USING btree (user_id);


--
-- Name: idx_product_prices_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_prices_product_id ON public.product_prices USING btree (product_id);


--
-- Name: idx_product_prices_recorded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_prices_recorded_at ON public.product_prices USING btree (price_recorded_at);


--
-- Name: idx_product_ratings_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_ratings_product_id ON public.product_ratings USING btree (product_id);


--
-- Name: idx_product_reviews_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_reviews_date ON public.product_reviews USING btree (review_date);


--
-- Name: idx_product_reviews_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_reviews_platform ON public.product_reviews USING btree (platform_name);


--
-- Name: idx_product_reviews_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_reviews_product_id ON public.product_reviews USING btree (product_id);


--
-- Name: idx_product_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_reviews_rating ON public.product_reviews USING btree (rating);


--
-- Name: idx_product_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_reviews_user_id ON public.product_reviews USING btree (user_id);


--
-- Name: idx_products_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_brand ON public.products USING btree (brand_name);


--
-- Name: idx_products_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_platform ON public.products USING btree (platform_name);


--
-- Name: idx_user_events_event_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_events_event_data ON public.user_events USING gin (event_data);


--
-- Name: idx_user_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_events_event_type ON public.user_events USING btree (event_type);


--
-- Name: idx_user_events_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_events_timestamp ON public.user_events USING btree (event_timestamp);


--
-- Name: idx_user_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_events_user_id ON public.user_events USING btree (user_id);


--
-- Name: idx_user_events_user_type_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_events_user_type_timestamp ON public.user_events USING btree (user_id, event_type, event_timestamp);


--
-- Name: comparison_sessions update_comparison_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_comparison_sessions_updated_at BEFORE UPDATE ON public.comparison_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.categories(category_id);


--
-- Name: chat_history chat_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: chat_messages chat_messages_comparison_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_comparison_id_fkey FOREIGN KEY (comparison_id) REFERENCES public.comparison_sessions(comparison_id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: comparison_products comparison_products_comparison_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comparison_products
    ADD CONSTRAINT comparison_products_comparison_id_fkey FOREIGN KEY (comparison_id) REFERENCES public.comparison_sessions(comparison_id) ON DELETE CASCADE;


--
-- Name: comparison_products comparison_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comparison_products
    ADD CONSTRAINT comparison_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: comparison_sessions comparison_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comparison_sessions
    ADD CONSTRAINT comparison_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: product_categories product_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- Name: product_categories product_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_metadata product_metadata_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_metadata
    ADD CONSTRAINT product_metadata_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_metrics product_metrics_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_metrics
    ADD CONSTRAINT product_metrics_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_prices product_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_ratings product_ratings_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ratings
    ADD CONSTRAINT product_ratings_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_recommendations product_recommendations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_recommendations
    ADD CONSTRAINT product_recommendations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_recommendations product_recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_recommendations
    ADD CONSTRAINT product_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: search_history search_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_analytics user_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_category_preferences user_category_preferences_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_category_preferences
    ADD CONSTRAINT user_category_preferences_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- Name: user_category_preferences user_category_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_category_preferences
    ADD CONSTRAINT user_category_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_events user_events_event_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_event_type_fkey FOREIGN KEY (event_type) REFERENCES public.event_types(event_type);


--
-- Name: user_events user_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions(session_id) ON DELETE SET NULL;


--
-- Name: user_events user_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ksKM5Lfpl1UlOIkQLgjmmoGQe9xGXjOTxHBYtTmZYZG99cXASL9KarmWYr5PlwG

