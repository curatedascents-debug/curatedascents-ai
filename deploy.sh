#!/bin/bash
# CuratedAscents — quick deploy to Vercel
# Usage: ./deploy.sh "optional commit message"

set -e

cd "$(dirname "$0")"

MSG="${1:-chore: update}"

git add -A
git diff --cached --quiet && echo "Nothing to commit." && exit 0
git commit -m "$MSG"
git push origin main

echo ""
echo "✅ Pushed to main. Vercel is deploying now."
echo "   Watch: https://vercel.com/curatedascents-debug/curated-ascents-agentic"
