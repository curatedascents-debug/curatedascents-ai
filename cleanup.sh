#!/bin/bash
echo "🔧 Starting cleanup of lockfile conflicts..."

# Remove all lockfiles
echo "Removing existing lockfiles..."
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules

# Remove build artifacts
echo "Cleaning build artifacts..."
rm -rf .next
rm -rf .turbo
rm -rf dist
rm -rf out

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Reinstall with npm
echo "Reinstalling dependencies with npm..."
npm install

# Verify installation
echo "Verifying installation..."
npm list --depth=0

echo "✅ Cleanup complete!"
echo "📋 Next steps:"
echo "1. Run: npm run build"
echo "2. Run: npm run dev"
echo "3. Check if warning is gone"
