#!/bin/bash

# Sim-Adversary Setup Script
# This script sets up the development environment and installs dependencies

echo "🚀 Setting up Sim-Adversary..."
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "sim-adversary",
  "version": "1.0.0",
  "description": "A cybersecurity red team simulation game for training and education",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "setup": "npm install",
    "clean": "rm -rf node_modules package-lock.json",
    "reset-db": "rm -f gamepaths.sqlite"
  },
  "keywords": [
    "cybersecurity",
    "red-team",
    "simulation",
    "training",
    "mitre-attack",
    "penetration-testing"
  ],
  "author": "Prism Infosec",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sequelize": "^6.32.1",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
EOF
    echo "✅ package.json created"
else
    echo "✅ package.json already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check your npm configuration."
    exit 1
fi

echo "✅ Dependencies installed successfully"


# Check if required files exist
echo "🔍 Verifying required files..."

REQUIRED_FILES=(
    "server.js"
    "database.js"
    "routes.js"
    "models/GamePath.js"
    "public/index.html"
    "public/game.js"
    "public/gameConfig.js"
    "public/gameScoring.js"
    "public/randomEventsManager.js"
    "public/inventoryManager.js"
    "public/pastPathsManager.js"
    "public/testingSystem.js"
    "public/gameConfig.js"
    "public/uiHelpers.js"
    "public/style.css"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "⚠️  Warning: Some required files are missing:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo "   The application may not work correctly."
else
    echo "✅ All required files present"
fi

# Initialize database
echo "🗄️  Initializing database..."
if [ -f "gamepaths.sqlite" ]; then
    echo "✅ Database already exists"
else
    echo "   Database will be created on first run"
fi

# Create a simple start script
echo "📝 Creating start script..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Sim-Adversary..."
echo "Server will be available at: http://127.0.0.1:3000"
echo "Press Ctrl+C to stop the server"
echo ""
node server.js
EOF

chmod +x start.sh
echo "✅ Start script created (./start.sh)"

# Create development script if nodemon is available
if npm list nodemon --depth=0 &> /dev/null; then
    echo "📝 Creating development script..."
    cat > dev.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting Sim-Adversary in development mode..."
echo "Server will be available at: http://0.0.0.0:3000"
echo "Server will automatically restart when files change"
echo "Press Ctrl+C to stop the server"
echo ""
npx nodemon server.js
EOF
    chmod +x dev.sh
    echo "✅ Development script created (./dev.sh)"
fi

# Final setup checks
echo ""
echo "🔧 Running final setup checks..."

# Check if port 3000 is available
if command -v lsof &> /dev/null; then
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Warning: Port 3000 is already in use. You may need to use a different port."
    else
        echo "✅ Port 3000 is available"
    fi
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
gamepaths.sqlite

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.temp
EOF
    echo "✅ .gitignore created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "=================================="
echo ""
echo "🚀 To start the application:"
echo "   ./start.sh"
echo "   or"
echo "   npm start"
echo ""
if [ -f "dev.sh" ]; then
echo "🔧 To start in development mode:"
echo "   ./dev.sh"
echo "   or"
echo "   npm run dev"
echo ""
fi
echo "🌐 The application will be available at:"
echo "   http://127.0.0.1:3000"
echo ""
echo "📚 Additional commands:"
echo "   npm run reset-db  - Reset the game database"
echo "   npm run clean     - Clean node_modules and package-lock.json"
echo ""
echo "✨ Happy red teaming!"
