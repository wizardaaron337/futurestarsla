# Future Stars Sports Merch - Project Context

## Last Updated: 2026-04-23

---

## 🌐 Website: futurestarsla.com

### Deployment
- **Platform:** Cloudflare Pages (auto-deploy from GitHub)
- **Repo:** `wizardaaron337/futurestarsla`
- **Domain:** futurestarsla.com
- **Branch:** `main` (website), `bot-deploy` (Discord bot)

### Pages
| Page | Description |
|------|-------------|
| `index.html` | Role-based dashboard (personalized per user) |
| `inventory.html` | Live Sortly inventory (3,763 units, 215 SKUs) |
| `trips.html` | Tournament data with revenue/profit/margin |
| `team.html` | Crew directory (JR, Lane, PJ, Caleb, Marlon) |
| `jersey-gallery.html` | Jersey approval workflow with real images |
| `sortly-upload.html` | CSV import page for Marlon |
| `login.html` | Role selection login |

### Login Credentials
| User | Password | Role |
|------|----------|------|
| jr | futurestars2026 | Owner |
| lane | futurestars2026 | Owner |
| pj | logistics2026 | Logistics |
| caleb | tournaments2026 | Tournament Lock |
| marlon | inventory2026 | Inventory |

### Data Sources
- **Google Sheets:** `1XqPyWyUOLB6TFipZgt22esL78t_Typ6lDsB1sNxSIEQ`
  - Tournament revenue, profit, costs
  - Auto-sync every 30 seconds
- **Sortly CSV:** `/home/aaron/Downloads/9bd081139c211ccc121d22dfb62da68e720c6b1d.original.csv`
  - Baseball jerseys: 2,036 units
  - Soccer jerseys: 1,727 units
  - Total: 3,763 units across 215 SKUs

---

## 🤖 Discord Bot (PJ's Operations Assistant)

### Deployment
- **Platform:** Railway.app (free tier)
- **Service:** fs-sports-bot
- **Repo Branch:** `bot-deploy`
- **Status:** Online 24/7

### Bot Token
- **Current Token:** (RESET NEEDED - was invalidated by GitHub)
- **Client ID:** `1496986241051267183`
- **Invite Link:** `https://discord.com/oauth2/authorize?client_id=1496986241051267183&permissions=274877910080&scope=bot`

### Required Discord Settings
- **Privileged Intents:** Must enable in Discord Developer Portal
  - ✅ MESSAGE CONTENT INTENT
  - ✅ SERVER MEMBERS INTENT

### Bot Commands
| Command | Description |
|---------|-------------|
| `!help_fs` | Show all commands |
| `!tournament [name]` | Search tournament by name |
| `!tournaments [month]` | List tournaments by month |
| `!inventory` | Check jersey stock levels |
| `!crew [name]` | View crew assignments |
| `!packing [tournament]` | Generate packing list |
| `!stats` | Overall tournament statistics |
| `!setup_channels` | Auto-create server channels (needs Manage Channels permission) |

### Server Channels Created by Bot
- 📋 INFO (welcome, announcements)
- 🏆 TOURNAMENTS (upcoming, locked, need-filled)
- 📦 INVENTORY (stock-alerts, sortly-updates)
- 🚐 LOGISTICS (hotels, vehicles, crew-assignments)

---

## 📁 File Locations

### Website
```
/home/aaron/.openclaw/workspace/missions/fs-sports-merch/website/v2/
├── index.html
├── inventory.html
├── trips.html
├── team.html
├── jersey-gallery.html
├── sortly-upload.html
├── login.html
├── sortly-data.json
└── images/
```

### Discord Bot
```
/home/aaron/.openclaw/workspace/missions/fs-sports-merch/discord-bot/
├── bot.py
├── tournament-data.json
├── requirements.txt
├── railway.json
├── Procfile
└── .env (local only, not committed)
```

### Database
```
/home/aaron/.openclaw/workspace/missions/fs-sports-merch/database/
├── fs_sports.db (SQLite)
└── schema.sql
```

---

## ⚠️ Important Notes

### Security
- **NEVER commit tokens to Git** — GitHub auto-detects and revokes them
- Always use environment variables for secrets
- Render free plan doesn't support background workers
- Railway is better for Discord bots (supports workers)

### Token Reset Process (if needed)
1. Go to https://discord.com/developers/applications
2. Click your bot → Bot tab → Reset Token
3. Copy NEW token
4. Update in Railway dashboard (Variables tab)
5. Redeploy service

### Cloudflare Pages
- Auto-deploys on every push to `main` branch
- Custom domain: futurestarsla.com
- CNAME file points domain correctly

---

## 🔄 Next Steps (When Resuming)

1. **If bot token was reset:**
   - Get new token from Discord Developer Portal
   - Update in Railway Variables
   - Redeploy

2. **If website needs updates:**
   - Edit files in `/missions/fs-sports-merch/website/v2/`
   - Push to `main` branch
   - Cloudflare auto-deploys

3. **Pending Features:**
   - Hotel finder command for PJ
   - Trip cost calculator
   - Auto-sync Sortly inventory
   - Security wall (real auth instead of JS)
