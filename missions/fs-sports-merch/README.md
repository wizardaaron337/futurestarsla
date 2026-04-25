# Future Stars LA Website

**Live Site:** https://futurestarsla.com

---

## 🚀 Quick Deploy

```bash
cd ~/.openclaw/workspace/missions/fs-sports-merch
./stage-and-deploy.sh "Description of changes"
```

## 🧪 Staging Workflow

We use a **staging branch** for testing improvements before they go live.

### Make Changes (Safe)
```bash
cd ~/.openclaw/workspace/missions/fs-sports-merch/website
git checkout staging
# ... edit files ...
./stage-and-deploy.sh "Your changes"
```

### Go Live
```bash
git checkout main
git merge staging
./stage-and-deploy.sh "Going live"
```

See [UPDATE-WORKFLOW.md](UPDATE-WORKFLOW.md) for full details.

---

## 📁 Structure

- `website/` — The actual site (Cloudflare Pages)
- `deploy-quick.sh` — Legacy deploy script
- `stage-and-deploy.sh` — New branch-aware deploy script
- `UPDATE-WORKFLOW.md` — Full workflow documentation

---

## 🔑 Auth PINs

| Name | Role | PIN |
|------|------|-----|
| JR | Owner | jr26 |
| Lane | Owner | lane26 |
| PJ | Logistics | pj26 |
| Caleb | Tournament | caleb26 |
| Marlon | Inventory | marlon26 |

Change PINs in `website/auth-config.js`

---

*Managed by Monty 🎩*
