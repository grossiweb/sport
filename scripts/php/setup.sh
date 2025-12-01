#!/bin/bash

# ATS Records Script Setup
# This script sets up everything needed to run the ATS computation script

echo "🚀 ATS Records Script Setup"
echo "=============================="
echo ""

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed"
    echo "   Please install PHP 7.4 or higher"
    exit 1
fi

PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
echo "✅ PHP ${PHP_VERSION} detected"

# Check if MongoDB extension is installed
if php -m | grep -q mongodb; then
    echo "✅ MongoDB extension installed"
else
    echo "❌ MongoDB extension not installed"
    echo "   Install with: pecl install mongodb"
    echo "   Or: sudo apt-get install php-mongodb"
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed"
    echo "   Install from: https://getcomposer.org/"
    exit 1
fi

echo "✅ Composer detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Check MongoDB connection
echo "🔌 Testing MongoDB connection..."
echo "   MongoDB URI: ${MONGODB_URI:-mongodb://localhost:27017}"
echo ""

# Create indexes
echo "📊 Creating database indexes..."
php compute-ats-records.php --create-indexes

if [ $? -eq 0 ]; then
    echo "✅ Indexes created"
else
    echo "⚠️  Warning: Failed to create indexes (this is OK if they already exist)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set MONGODB_URI environment variable:"
echo "     export MONGODB_URI='mongodb://your-connection-string'"
echo ""
echo "  2. Run the script:"
echo "     php compute-ats-records.php --sport=NFL --season=2025"
echo ""
echo "  3. Set up cron job (optional):"
echo "     crontab -e"
echo "     0 3 * * * cd $(pwd) && php compute-ats-records.php --all --season=2025"
echo ""

