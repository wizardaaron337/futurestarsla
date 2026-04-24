#!/bin/bash
# Deploy Future Stars website to Cloudflare Pages
# Usage: ./deploy.sh [commit-message]

set -e

cd "$(dirname "$0")"

MSG="${1:-Update site}"
echo "🚀 Deploying Future Stars website..."

git add -A
git commit -m "$MSG" || true
git push origin main

npx wrangler pages deploy . --project-name=futurestarsla --branch=main

echo "✅ Deployed! Check: https://futurestarsla.com"
