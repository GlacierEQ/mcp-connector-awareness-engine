#!/bin/bash
# Publish MCP Connector Awareness Engine to Smithery Registry

set -e

echo "🔨 Publishing to Smithery MCP Registry..."

# Check if Smithery API key is set
if [ -z "$SMITHERY_API_KEY" ]; then
  echo "❌ SMITHERY_API_KEY not set"
  echo "   Set it with: export SMITHERY_API_KEY=your_key_here"
  exit 1
fi

# Build the project
echo "📦 Building TypeScript..."
npm run build

# Validate Smithery config
echo "✅ Validating Smithery config..."
if [ ! -f ".smithery/config.json" ]; then
  echo "❌ .smithery/config.json not found"
  exit 1
fi

# Publish to Smithery
echo "🚀 Publishing to registry..."
curl -X POST https://api.smithery.ai/v1/mcp/publish \
  -H "Authorization: Bearer $SMITHERY_API_KEY" \
  -H "Content-Type: application/json" \
  -d @.smithery/config.json

if [ $? -eq 0 ]; then
  echo "✅ Successfully published to Smithery!"
  echo "📍 View at: https://smithery.ai/server/mcp-connector-awareness-engine"
else
  echo "❌ Publication failed"
  exit 1
fi
