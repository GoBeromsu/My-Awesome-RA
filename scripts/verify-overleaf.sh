#!/bin/bash
set -e

# Verify Overleaf Docker hosting
# This script starts Overleaf CE and verifies it's working

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== My Awesome RA - Overleaf Hosting Verification ==="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Error: Docker daemon is not running"
    exit 1
fi

echo "1. Starting Overleaf containers..."
cd "$PROJECT_DIR/deployment"
docker-compose -f docker-compose.overleaf.yml up -d

echo ""
echo "2. Waiting for services to be ready..."
echo "   (This may take 1-2 minutes for first startup)"

# Wait for MongoDB to be healthy
echo -n "   MongoDB: "
for i in {1..30}; do
    if docker exec mongo mongosh --eval "db.stats()" &> /dev/null; then
        echo "Ready"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Overleaf to be ready
echo -n "   Overleaf: "
for i in {1..60}; do
    if curl -s http://localhost/status &> /dev/null; then
        echo "Ready"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "3. Checking services status..."
docker-compose -f docker-compose.overleaf.yml ps

echo ""
echo "4. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost/status || echo "FAILED")
echo "   Response: $HEALTH_RESPONSE"

if [[ "$HEALTH_RESPONSE" == *"up"* ]] || [[ "$HEALTH_RESPONSE" == *"ok"* ]] || [[ "$HEALTH_RESPONSE" == *"healthy"* ]]; then
    echo ""
    echo "=== SUCCESS ==="
    echo ""
    echo "Overleaf CE is running!"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost in your browser"
    echo "2. Create an admin account:"
    echo "   docker exec sharelatex /bin/bash -c \"cd /overleaf/services/web && node modules/server-ce-scripts/scripts/create-user --admin --email=admin@example.com\""
    echo ""
    echo "3. Test project creation and LaTeX compilation"
    echo ""
    echo "To stop Overleaf:"
    echo "   cd $PROJECT_DIR/deployment && docker-compose -f docker-compose.overleaf.yml down"
else
    echo ""
    echo "=== WARNING ==="
    echo "Health check did not return expected response."
    echo "Check the logs with: docker logs sharelatex"
fi
