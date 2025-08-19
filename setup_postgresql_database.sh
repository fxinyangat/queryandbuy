#!/bin/bash

# PostgreSQL Database Setup Script for Query and Buy
# This script helps you set up the database and generate a diagram

echo "🗄️  Query and Buy PostgreSQL Database Setup"
echo "=========================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Database configuration
DB_NAME="queryandbuy"
DB_USER="qnb_user"
DB_PASSWORD="qnb_password_2024"

echo ""
echo "📋 Database Configuration:"
echo "   Database Name: $DB_NAME"
echo "   Username: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""

# Create database and user
echo "🔧 Creating database and user..."
psql -h localhost -U postgres -c "
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
"

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully"
else
    echo "❌ Failed to create database. You may need to run as postgres user."
    echo "   Try: sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME;\""
    exit 1
fi

# Import schema
echo ""
echo "📥 Importing database schema..."
psql -h localhost -U $DB_USER -d $DB_NAME -f database_schema_postgresql.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema imported successfully"
else
    echo "❌ Failed to import schema"
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 PostgreSQL Diagram Generation Tools:"
echo ""
echo "   1. pgAdmin 4 (Free - Best Option):"
echo "      - Download from https://www.pgadmin.org/"
echo "      - Connect to localhost with user: $DB_USER"
echo "      - Right-click on database > Generate ERD"
echo "      - Export as PNG/PDF"
echo ""
echo "   2. DBeaver (Free):"
echo "      - Download from https://dbeaver.io/"
echo "      - Connect to PostgreSQL database"
echo "      - Right-click on database > Generate ER Diagram"
echo "      - Export as image or PDF"
echo ""
echo "   3. SchemaSpy (Command line):"
echo "      - Install: brew install schemaspy"
echo "      - Run: schemaspy -t pgsql -host localhost -port 5432 -db $DB_NAME -u $DB_USER -p $DB_PASSWORD -o ./docs"
echo ""
echo "   4. dbdiagram.io (Online):"
echo "      - Go to https://dbdiagram.io"
echo "      - Import the database_erd.dbml file"
echo "      - Or use the connection string:"
echo "        postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME"
echo ""
echo "   5. PostgreSQL ERD Generator (Command line):"
echo "      - Install: pip install eralchemy2"
echo "      - Run: eralchemy2 -i postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME -o erd.png"
echo ""
echo "🔗 Connection Details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo "   Connection String: postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME"
echo ""
echo "📝 Next Steps:"
echo "   1. Generate the diagram using one of the tools above"
echo "   2. Update your backend to use this database"
echo "   3. Add database connection to your .env file"
echo ""
echo "🔧 Quick Diagram Generation Commands:"
echo ""
echo "   # Using eralchemy2 (if installed)"
echo "   eralchemy2 -i postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME -o erd.png"
echo ""
echo "   # Using SchemaSpy (if installed)"
echo "   schemaspy -t pgsql -host localhost -port 5432 -db $DB_NAME -u $DB_USER -p $DB_PASSWORD -o ./docs"
echo ""
