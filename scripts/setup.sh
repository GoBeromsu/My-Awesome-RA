#!/bin/bash
set -e

echo "Setting up My Awesome RA..."

# Check for required tools
command -v uv >/dev/null 2>&1 || { echo "uv is required. Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required."; exit 1; }

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Initialize submodules
echo "Initializing git submodules..."
cd "$PROJECT_DIR"
git submodule update --init --recursive

# Setup apps/api
echo "Setting up apps/api..."
cd "$PROJECT_DIR/apps/api"
uv sync

# Setup packages/solar-client
echo "Setting up packages/solar-client..."
cd "$PROJECT_DIR/packages/solar-client"
uv sync

# Setup packages/evidence-types
echo "Setting up packages/evidence-types..."
cd "$PROJECT_DIR/packages/evidence-types"
npm install
npm run build

# Create data directories
echo "Creating data directories..."
mkdir -p "$PROJECT_DIR/data/embeddings"
mkdir -p "$PROJECT_DIR/data/faiss"
mkdir -p "$PROJECT_DIR/data/parsed"

# Check for .env file
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "Warning: .env file not found. Copy .env.example and configure."
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and set UPSTAGE_API_KEY"
echo "2. Run 'scripts/dev.sh' to start development server"
echo "3. Run 'docker-compose -f deployment/docker-compose.dev.yml up' for full stack"
