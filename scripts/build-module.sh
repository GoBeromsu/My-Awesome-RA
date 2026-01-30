#!/bin/bash
set -e

# Build Evidence Panel module for Overleaf
# This script builds the frontend assets for the evidence-panel module

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OVERLEAF_DIR="$PROJECT_DIR/overleaf"
MODULE_DIR="$OVERLEAF_DIR/services/web/modules/evidence-panel"

echo "Building Evidence Panel module..."

# Check if module directory exists
if [ ! -d "$MODULE_DIR" ]; then
    echo "Error: Evidence Panel module not found at $MODULE_DIR"
    echo "Run the module creation first."
    exit 1
fi

# Build evidence-types package
echo "Building evidence-types..."
cd "$PROJECT_DIR/packages/evidence-types"
npm install
npm run build

# Build Overleaf web with module
echo "Building Overleaf web..."
cd "$OVERLEAF_DIR/services/web"
npm install
npm run webpack:production

# Verify build
if grep -q "evidence" public/manifest.json 2>/dev/null; then
    echo "Evidence Panel module built successfully!"
else
    echo "Warning: evidence-panel not found in manifest. Module may not be registered."
fi

echo "Build complete!"
