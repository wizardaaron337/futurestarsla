#!/bin/bash
# Future Stars LA — Rollback Script
# Usage: ./rollback.sh <tag>
# Example: ./rollback.sh v2026.4.2

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: ./rollback.sh <tag>"
    echo ""
    echo "Available tags:"
    cd ~/.openclaw/workspace/missions/fs-sports-merch/website
    git tag --sort=-creatordate
    exit 1
fi

TARGET_TAG="$1"
PROJECT_DIR="/home/aaron/.openclaw/workspace/missions/fs-sports-merch/website"

cd "$PROJECT_DIR"

# Check if tag exists
if ! git rev-parse "$TARGET_TAG" >/dev/null 2>&1; then
    echo "❌ Tag '$TARGET_TAG' not found."
    echo "Available tags:"
    git tag --sort=-creatordate
    exit 1
fi

echo "=========================================="
echo "  Future Stars LA — Rollback"
echo "=========================================="
echo ""
echo "⚠️  This will revert main back to: $TARGET_TAG"
echo ""
echo "Changes to be undone:"
git log "$TARGET_TAG"..HEAD --oneline --no-decorate 2>/dev/null || true
echo ""
read -p "Are you sure? Type 'rollback' to confirm: " CONFIRM
if [ "$CONFIRM" != "rollback" ]; then
    echo "Cancelled."
    exit 1
fi

# Check out main and pull latest
git checkout main
git pull origin main

# Revert all commits after the target tag
echo ""
echo "🔄 Reverting commits after $TARGET_TAG..."
if git revert --no-commit "$TARGET_TAG"..HEAD 2>/dev/null; then
    echo "✅ Revert applied locally."
else
    # Test if $TARGET_TAG is an ancestor of HEAD
    if git merge-base --is-ancestor "$TARGET_TAG" HEAD; then
        echo "✅ No conflicts — revert is clean."
    else
        echo ""
        echo "⚠️  Conflicts detected or tag is not an ancestor."
        echo "   Trying force-reset instead..."
        echo ""
        echo "WARNING: Force reset destroys the broken commits."
        read -p "Force reset main to $TARGET_TAG? Type 'force' to confirm: " FORCE
        if [ "$FORCE" != "force" ]; then
            echo "Cancelled."
            git revert --abort 2>/dev/null || true
            exit 1
        fi
        git reset --hard "$TARGET_TAG"
        git push --force origin main
        echo "✅ Force reset complete."
        
        # Sync dev
        git checkout dev
        git merge main -m "Sync dev with rollback to $TARGET_TAG"
        git push origin dev
        
        echo ""
        echo "=========================================="
        echo "✅ ROLLBACK COMPLETE (force reset)"
        echo "   main reverted to: $TARGET_TAG"
        echo "=========================================="
        exit 0
    fi
fi

COMMIT_MSG="Rollback to $TARGET_TAG — reverted $(git log "$TARGET_TAG"..HEAD --oneline --no-decorate 2>/dev/null | wc -l) commits"

git commit -m "$COMMIT_MSG"
git push origin main

# Sync dev
git checkout dev
git pull origin dev
git merge main -m "Sync dev with rollback to $TARGET_TAG"
git push origin dev

echo ""
echo "=========================================="
echo "✅ ROLLBACK COMPLETE"
echo "   main reverted to: $TARGET_TAG"
echo "   dev synced with main"
echo "=========================================="
