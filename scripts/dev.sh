#!/bin/bash
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Check for UPSTAGE_API_KEY
if [ -z "$UPSTAGE_API_KEY" ]; then
    echo "Error: UPSTAGE_API_KEY not set. Configure in .env file."
    exit 1
fi

# Start API server
echo "Starting My Awesome RA API..."
cd "$PROJECT_DIR/apps/api"
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
