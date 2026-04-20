#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building core..."
cd "$DIR/packages/core"
npm run build

echo "==> Building react..."
cd "$DIR/packages/react"
npm run build

echo "==> Publishing @xpressai/xircuits-viewer..."
cd "$DIR/packages/core"
npm publish --access public

# Get core version for react dependency
VERSION=$(node -p "require('./package.json').version")

echo "==> Publishing @xpressai/xircuits-viewer-react..."
cd "$DIR/packages/react"

# Swap workspace:* → real version
sed -i "s/\"@xpressai\/xircuits-viewer\": \"workspace:\*\"/\"@xpressai\/xircuits-viewer\": \"^$VERSION\"/" package.json
npm publish --access public

# Revert for local dev
sed -i "s/\"@xpressai\/xircuits-viewer\": \"^$VERSION\"/\"@xpressai\/xircuits-viewer\": \"workspace:*\"/" package.json

echo "==> Done! Published v$VERSION"
