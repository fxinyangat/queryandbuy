# Database Migrations

This directory contains database migration files for the Query and Buy application.

## Migration Process

### 1. Create New Migration
When making schema changes:
1. Create a new numbered migration file (e.g., `003_add_user_preferences.sql`)
2. Include descriptive comments
3. Add both UP and DOWN migrations if needed

### 2. Apply Migration
```bash
# Connect to database and run migration
psql -U qnb_user -d queryandbuy -f migrations/003_add_user_preferences.sql
```

### 3. Update ERD
After applying migrations:
1. Regenerate the ERD in pgAdmin 4
2. Export updated diagram if needed

## Migration Guidelines

- **Always backup** before major changes
- **Test migrations** on development database first
- **Use transactions** for complex changes
- **Document breaking changes**
- **Update this README** with new migration details

## Current Migrations

- `001_initial_schema.sql` - Initial database setup
- `002_example_changes.sql` - Example migration patterns

## Rollback Strategy

For simple changes, use ALTER statements to reverse:
```sql
-- Example rollback
ALTER TABLE users DROP COLUMN phone_number;
DROP INDEX IF EXISTS idx_users_phone;
```

For complex changes, maintain separate rollback migration files.
