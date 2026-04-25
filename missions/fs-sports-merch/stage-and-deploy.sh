#!/bin/bash
# Future Stars LA — Staging Workflow Script
# Usage: ./stage-and-deploy.sh [message]

set -e

PROJECT_DIR="/home/aaron/.openclaw/workspace/missions/fs-sports-merch/website"
PROJECT_NAME="futurestarsla"

cd "$PROJECT_DIR"

BRANCH=$(git branch --show-current)

echo "=========================================="
echo "  Future Stars LA Deploy"
echo "  Branch: $BRANCH"
echo "=========================================="

if [ "$BRANCH" = "main" ]; then
    echo ""
    echo "⚠️  WARNING: You are about to deploy to the LIVE SITE!"
    echo "   URL: https://futurestarsla.com"
    echo ""
    read -p "Are you sure? Type 'live' to confirm: " CONFIRM
    if [ "$CONFIRM" != "live" ]; then
        echo "Cancelled."
        exit 1
    fi
elif [ "$BRANCH" = "staging" ]; then
    echo ""
    echo "🧪 Deploying to STAGING environment"
    echo "   Test your changes before merging to main"
    echo ""
else
    echo ""
    echo "❓ Unknown branch: $BRANCH"
    echo "   Use 'staging' for testing or 'main' for live"
    exit 1
fi

# Build ID for cache busting
BUILD_ID="$(date '+%s')-$(openssl rand -hex 4)"
BUILD_TIME="$(date '+%Y-%m-%d %H:%M:%S %Z')"

echo "--- Build ID: $BUILD_ID ($BUILD_TIME) ---"

echo "$BUILD_TIME" > cache-bust.txt
echo "${BUILD_ID}" > build-id.txt

# Clean inject: remove all old _buildId scripts, add fresh one
for f in *.html; do
    [ ! -f "$f" ] && continue
    sed -i '/_buildId/d' "$f"
    sed -i "s|<head>|<head>\n<script>var _buildId=\"${BUILD_ID}\";if(sessionStorage.getItem(\"_fsv\")!==_buildId){sessionStorage.setItem(\"_fsv\",_buildId);location.reload(true);}</script>|" "$f"
done

# Write a minimal _redirects
echo "# FS LA Deploy ${BUILD_ID}" > _redirects

# Commit message
if [ -z "$1" ]; then
    COMMIT_MSG="Deploy $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

git add .
git commit -m "$COMMIT_MSG" || true

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin "$BRANCH" || {
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "   1. Update your Personal Access Token with 'workflow' scope"
    echo "   2. Or deploy manually with wrangler"
    echo ""
    read -p "Deploy manually with wrangler now? (y/n): " MANUAL
    if [ "$MANUAL" = "y" ]; then
        wrangler pages deploy . --project-name "$PROJECT_NAME" --branch "$BRANCH"
    else
        exit 1
    fi
}

# Summary
echo ""
echo "=========================================="
if [ "$BRANCH" = "main" ]; then
    echo "✅ LIVE SITE UPDATED!"
    echo "   https://futurestarsla.com"
else
    echo "✅ STAGING UPDATED!"
    echo "   Preview: https://staging.futurestarsla.com"
    echo ""
    echo "When ready to go live:"
    echo "   git checkout main"
    echo "   git merge staging"
    echo "   ./stage-and-deploy.sh 'Going live with changes'"
fi
echo "   Build: $BUILD_ID"
echo "=========================================="
