# 🚀 Future Stars LA — Update Workflow

## How It Works

We now have **two branches**:

| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | https://futurestarsla.com | **LIVE SITE** — what users see |
| `staging` | https://staging.futurestarsla.com (or preview URL) | **TESTING** — work on improvements here |

---

## 📝 Making Improvements

### Step 1: Switch to Staging Branch
```bash
cd ~/.openclaw/workspace/missions/fs-sports-merch/website
git checkout staging
```

### Step 2: Make Your Changes
Edit files, add features, fix bugs — whatever you're working on.

### Step 3: Test Locally
Open files directly in your browser:
```bash
# Quick local test
firefox index.html
# or
google-chrome inventory-v2.html
```

### Step 4: Commit to Staging
```bash
git add .
git commit -m "Description of changes"
git push origin staging
```

This auto-deploys to the **staging preview URL** where you can test.

### Step 5: Review on Staging
Visit the staging URL and make sure everything works.

### Step 6: Push Live (Merge to Main)
When you're happy with the changes:

```bash
# Switch to main
git checkout main

# Pull latest (just in case)
git pull origin main

# Merge staging changes
git merge staging

# Push live
git push origin main
```

This deploys to **futurestarsla.com** immediately.

---

## 🔄 Quick Commands

```bash
# Start working on a new feature
cd ~/.openclaw/workspace/missions/fs-sports-merch/website
git checkout staging
git pull origin staging

# ... make changes ...

git add .
git commit -m "Your changes"
git push origin staging

# When ready to go live
git checkout main
git merge staging
git push origin main

# Go back to staging for next round
git checkout staging
```

---

## 🆘 Emergency: Fix Live Site Directly

If something breaks on the live site and you need to fix it NOW:

```bash
cd ~/.openclaw/workspace/missions/fs-sports-merch/website
git checkout main
# ... make the fix ...
git add .
git commit -m "HOTFIX: description"
git push origin main

# Then sync staging
git checkout staging
git merge main
git push origin staging
```

---

## 📋 Current Features (What's Live)

- ✅ PIN-based auth system (JR, Lane, PJ, Caleb, Marlon)
- ✅ Inventory page with barcode scanning
- ✅ Tournament schedule with lock/unlock
- ✅ Trip planner with calendar
- ✅ Jersey gallery with player search
- ✅ Sortly CSV upload
- ✅ Team directory
- ✅ Dashboard with stats
- ✅ Mobile-responsive design
- ✅ Cache-busting on every deploy

---

## 💡 Future Improvements Ideas

### Quick Wins
- [ ] Add loading spinners on all "Loading..." text
- [ ] Better error messages when APIs fail
- [ ] Auto-refresh inventory every 30 seconds
- [ ] Dark mode toggle

### Medium Effort
- [ ] Export inventory to PDF/Excel
- [ ] Tournament bracket visualization
- [ ] Photo upload for jerseys/players
- [ ] Push notifications for tournament updates

### Big Features
- [ ] Real-time chat between team members
- [ ] Payment tracking for trips
- [ ] Integration with Sortly API (real-time sync)
- [ ] Mobile app (PWA with offline support)

---

## 🔧 Setup for GitHub Actions (One-Time)

To enable automatic deploys from GitHub, add these secrets:

1. Go to https://github.com/wizardaaron337/futurestarsla/settings/secrets/actions
2. Add `CLOUDFLARE_API_TOKEN` — get from Cloudflare dashboard
3. Add `CLOUDFLARE_ACCOUNT_ID` — get from Cloudflare dashboard

Until then, use the manual deploy script:
```bash
./deploy-quick.sh "Description of changes"
```

---

*Last updated: April 25, 2026*
