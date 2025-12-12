#!/bin/bash

# Test swarm creation API directly with curl

echo "🧪 Testing swarm creation with authentication fix..."

# Test data
TEST_DATA='{
  "goal": "Monitor hackernews for AI and send me a daily summary",
  "availableBots": [
    {"id": "bot1", "name": "News Scraper", "type": "scraper"}
  ],
  "availableIntegrations": ["Slack", "Gmail", "Discord"]
}'

echo "1️⃣ Testing anonymous swarm creation (no auth required)..."

# Test without authentication
curl -X POST http://localhost:3000/api/swarm/autopilot \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  -v

echo ""
echo "2️⃣ Testing with authentication cookies..."

# Test with authentication cookies (if available)
curl -X POST http://localhost:3000/api/swarm/autopilot \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  --cookie "supabase-auth-token=your-token-here" \
  -v