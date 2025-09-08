@echo off
echo 🔧 StatsPro WordPress Plugin Installation Script
echo.

set SOURCE_DIR=%~dp0..\wordpress-integration\wp-content\plugins\statspro-subscriptions
set DEST_DIR=C:\wamp64\www\statspro\wp-content\plugins\statspro-subscriptions

echo 📁 Source: %SOURCE_DIR%
echo 📁 Destination: %DEST_DIR%
echo.

if not exist "%SOURCE_DIR%" (
    echo ❌ Source plugin directory not found!
    echo 💡 Make sure you're running this from the correct directory
    pause
    exit /b 1
)

if not exist "C:\wamp64\www\statspro\wp-content\plugins" (
    echo ❌ WordPress plugins directory not found!
    echo 💡 Make sure WordPress is installed at C:\wamp64\www\statspro
    pause
    exit /b 1
)

echo 🚀 Copying plugin files...
xcopy "%SOURCE_DIR%" "%DEST_DIR%" /E /I /Y

if %ERRORLEVEL% EQU 0 (
    echo ✅ Plugin files copied successfully!
    echo.
    echo 📋 Next steps:
    echo 1. Go to http://localhost/statspro/wp-admin
    echo 2. Navigate to Plugins ^> Installed Plugins
    echo 3. Find "StatsPro Subscriptions" and click Activate
    echo 4. Install required plugins: ACF, WPGraphQL
    echo 5. Configure Stripe keys in Settings ^> StatsPro Subscriptions
    echo.
) else (
    echo ❌ Error copying plugin files
    echo 💡 Make sure you have write permissions to the WordPress directory
)

pause
