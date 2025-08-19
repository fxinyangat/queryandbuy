-- Migration: 002_example_changes.sql
-- Description: Example schema changes
-- Created: 2024-01-XX

-- Example: Add new column to users table
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

-- Example: Add new index
CREATE INDEX idx_users_phone ON users(phone_number);

-- Example: Add new table
CREATE TABLE user_notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example: Add new event type
INSERT INTO event_types (event_type, event_description, event_schema) VALUES
('notification_sent', 'System notification sent to user', '{"type": "object", "properties": {"notification_type": {"type": "string"}, "message": {"type": "string"}}}');
