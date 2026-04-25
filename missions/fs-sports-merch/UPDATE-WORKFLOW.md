# 🚀 Future Stars LA — Release Workflow

## Branches

| Branch | URL | Purpose |
|--------|-----|---------|
| `dev` | Preview URL | Active development & testing |
| `main` | https://futurestarsla.com | Production releases only |

## Versioning

Every release gets a version name before merging to `main`. Versions follow `YYYY.MM.PATCH`:

```
v2026.4.1 — first deploy in April 2026
v2026.4.2 — second release in April 2026
v2026.5.1 — first release in May 2026
```

(You can name them whatever you want — they're just tags for tracking.)

---

## Day-to-Day Development

```bash
cd ~/.openclaw/workspace/missions/fs-sports-merch/website

# Make sure you're on dev
git checkout dev
git pull origin dev

# Make your changes...

git add .
git commit -m "Description of what you changed"
git push origin dev
```

This deploys to the dev preview URL for testing.

---

## Releasing to Production

### Step 1: Bump version
Edit `VERSION` file in the project root:
```bash
echo "v2026.4.3" > ~/.openclaw/workspace/missions/fs-sports-merch/VERSION
```

### Step 2: Merge to main
```bash
git checkout main
git pull origin main
git merge dev
```

### Step 3: Commit version on main
```bash
echo "v2026.4.3" > ~/.openclaw/workspace/missions/fs-sports-merch/VERSION
git add VERSION
git commit -m "Release v2026.4.3"
git tag v2026.4.3
git push origin main --tags
```

### Step 4: Sync dev with version bump
```bash
git checkout dev
git merge main -m "Sync dev with v2026.4.3"
git push origin dev
```

---

## Hotfixes

When a fix needs to go to main before dev is ready:

```bash
git checkout dev
# Make the fix
git add .
git commit -m "Fix: [description]"
git push origin dev

# Cherry-pick to main
git checkout main
git cherry-pick <commit-sha>

# Bump version
echo "v2026.4.4" > VERSION
git add VERSION
git commit -m "Release v2026.4.4 (hotfix)"
git tag v2026.4.4
git push origin main --tags

# Sync dev
git checkout dev
git merge main -m "Sync dev with v2026.4.4 (hotfix)"
git push origin dev
```

---

## Rules

- **All work happens on `dev`** — never commit directly to `main`
- **Every push to `main` must have a version** — tag it
- **Always merge main → dev after a release** — keeps versions in sync
- **Version only gets bumped on `main`** — dev inherits via merge

---

## Quick Reference

```bash
# Start work
git checkout dev && git pull origin dev

# Commit
git add . && git commit -m "message" && git push origin dev

# Release
git checkout main && git merge dev && git tag v2026.4.X && git push origin main --tags
git checkout dev && git merge main && git push origin dev
```
