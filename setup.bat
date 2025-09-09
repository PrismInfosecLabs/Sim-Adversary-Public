@echo off
setlocal

REM Sim-Adversary Setup Script for Windows
REM This script sets up the development environment and installs dependencies

echo 🚀 Setting up Sim-Adversary...
echo ==========================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm detected
npm --version

REM Create package.json if it doesn't exist
if not exist "package.json" (
    echo 📦 Creating package.json...
    (
        echo {
        echo   "name": "sim-adversary",
        echo   "version": "1.0.0",
        echo   "description": "A cybersecurity red team simulation game for training and education",
        echo   "main": "server.js",
        echo   "scripts": {
        echo     "start": "node server.js",
        echo     "dev": "nodemon server.js",
        echo     "test": "echo \"Error: no test specified\" && exit 1",
        echo     "setup": "npm install",
        echo     "clean": "rmdir /s /q node_modules && del package-lock.json",
        echo     "reset-db": "del gamepaths.sqlite"
        echo   },
        echo   "keywords": [
        echo     "cybersecurity",
        echo     "red-team",
        echo     "simulation",
        echo     "training",
        echo     "mitre-attack",
        echo     "penetration-testing"
        echo   ],
        echo   "author": "David Viola",
        echo   "license": "MIT",
        echo   "dependencies": {
        echo     "express": "^4.18.2",
        echo     "cors": "^2.8.5",
        echo     "sequelize": "^6.32.1",
        echo     "sqlite3": "^5.1.6"
        echo   },
        echo   "devDependencies": {
        echo     "nodemon": "^3.0.1"
        echo   },
        echo   "engines": {
        echo     "node": ">=14.0.0",
        echo     "npm": ">=6.0.0"
        echo   }
        echo }
    ) > package.json
    echo ✅ package.json created
) else (
    echo ✅ package.json already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies. Please check your npm configuration.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully


REM Check if required files exist
echo 🔍 Verifying required files...

set MISSING_FILES=
if not exist "server.js" set MISSING_FILES=%MISSING_FILES% server.js
if not exist "database.js" set MISSING_FILES=%MISSING_FILES% database.js
if not exist "routes.js" set MISSING_FILES=%MISSING_FILES% routes.js
if not exist "models\GamePath.js" set MISSING_FILES=%MISSING_FILES% models\GamePath.js
if not exist "public\index.html" set MISSING_FILES=%MISSING_FILES% public\index.html
if not exist "public\game.js" set MISSING_FILES=%MISSING_FILES% public\game.js
if not exist "public\gameConfig.js" set MISSING_FILES=%MISSING_FILES% public\gameConfig.js
if not exist "public\gameScoring.js" set MISSING_FILES=%MISSING_FILES% public\gameScoring.js
if not exist "public\inventoryManager.js" set MISSING_FILES=%MISSING_FILES% public\inventoryManager.js
if not exist "public\randomEventsManager.js" set MISSING_FILES=%MISSING_FILES% public\randomEventsManager.js
if not exist "public\pastPathsManager.js" set MISSING_FILES=%MISSING_FILES% public\pastPathsManager.js
if not exist "public\testingSystem.js" set MISSING_FILES=%MISSING_FILES% public\testingSystem.js
if not exist "public\uiHelpers.js" set MISSING_FILES=%MISSING_FILES% public\uiHelpers.js
if not exist "public\style.css" set MISSING_FILES=%MISSING_FILES% public\style.css

if defined MISSING_FILES (
    echo ⚠️  Warning: Some required files are missing:
    echo    %MISSING_FILES%
    echo    The application may not work correctly.
) else (
    echo ✅ All required files present
)

REM Initialize database
echo 🗄️  Initializing database...
if exist "gamepaths.sqlite" (
    echo ✅ Database already exists
) else (
    echo    Database will be created on first run
)

REM Create a simple start script
echo 📝 Creating start script...
(
    echo @echo off
    echo echo 🚀 Starting Sim-Adversary...
    echo echo Server will be available at: http://127.0.0.1:3000
    echo echo Press Ctrl+C to stop the server
    echo echo.
    echo node server.js
    echo pause
) > start.bat

echo ✅ Start script created (start.bat)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Database
        echo gamepaths.sqlite
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Logs
        echo logs
        echo *.log
        echo.
        echo # Runtime data
        echo pids
        echo *.pid
        echo *.seed
        echo *.pid.lock
        echo.
        echo # Coverage directory used by tools like istanbul
        echo coverage/
        echo.
        echo # OS generated files
        echo .DS_Store
        echo .DS_Store?
        echo ._*
        echo .Spotlight-V100
        echo .Trashes
        echo ehthumbs.db
        echo Thumbs.db
        echo.
        echo # IDE files
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo *~
        echo.
        echo # Temporary files
        echo *.tmp
        echo *.temp
    ) > .gitignore
    echo ✅ .gitignore created
)

echo.
echo 🎉 Setup completed successfully!
echo ==================================
echo.
echo 🚀 To start the application:
echo    start.bat
echo    or
echo    npm start
echo.
echo 🌐 The application will be available at:
echo    http://127.0.0.1:3000
echo.
echo 📚 Additional commands:
echo    npm run reset-db  - Reset the game database
echo    npm run clean     - Clean node_modules and package-lock.json
echo.
echo ✨ Happy red teaming!
echo.
pause
