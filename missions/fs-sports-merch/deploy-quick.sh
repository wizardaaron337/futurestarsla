#!/bin/bash
# Future Stars LA - Quick Deploy

set -e

PROJECT_DIR="/home/aaron/.openclaw/workspace/missions/fs-sports-merch/website"
PROJECT_NAME="futurestarsla"
# Auto-detect branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

cd "$PROJECT_DIR"

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

# Write a minimal _redirects (no loops!)
echo "# FS LA Deploy ${BUILD_ID}" > _redirects

if [ -z "$1" ]; then
    COMMIT_MSG="Auto-deploy $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

git add .
git commit -m "$COMMIT_MSG" || true
git push origin "$BRANCH" || true

wrangler pages deploy . --project-name "$PROJECT_NAME" --branch "$BRANCH"

if [ "$BRANCH" = "main" ]; then
    echo "✅ Deployed to https://futurestarsla.com (build $BUILD_ID)"
else
    echo "✅ Deployed to STAGING: https://staging.futurestarsla.com (build $BUILD_ID)"
    echo "   Branch: $BRANCH"
fi
