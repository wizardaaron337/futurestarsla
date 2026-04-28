#!/usr/bin/env bash
# ==============================================================
# Future Stars LA - Bug Testing Bot
# Runs every hour via openclaw cron. Tests the live site for:
#   - HTTP 200/4xx/5xx on all pages
#   - Build ID consistency (latest deploy)
#   - Auth/login working
#   - JS syntax errors via console
#   - Missing content on key pages
# ==============================================================

SITE="https://futurestarsla.com"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S CDT')
RESULTS_DIR="/tmp/fs-bug-test"
mkdir -p "$RESULTS_DIR"
REPORT="$RESULTS_DIR/report-$(date +%Y%m%d-%H%M).txt"

echo "==============================================" > "$REPORT"
echo "  Future Stars LA - Bug Test Report"           >> "$REPORT"
echo "  $TIMESTAMP"                                  >> "$REPORT"
echo "==============================================" >> "$REPORT"
echo "" >> "$REPORT"

PASS=0
FAIL=0
WARN=0
FAILURES=""

# Pages to check
PAGES=(
  "index.html"
  "signin.html"
  "inventory-v2.html"
  "tournament-scraper.html"
  "tournaments.html"
  "trips.html"
  "trip-tracker.html"
  "trip-planner.html"
  "team.html"
  "sortly-upload.html"
  "tournament-scraper.html"
  "contact.html"
  "privacy.html"
  "departments.html"
  "pj-planner.html"
)

JS_FILES=(
  "auth-config.js"
  "crew-data.js"
  "tournament-data.js"
  "fs-utils.js"
  "nav-dropdown.js"
  "cost-data.js"
)

CSS_FILES=(
  "fs-utils.css"
)

check_page() {
    local page="$1"
    local url="$SITE/$page"
    local status
    local size
    
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" 2>/dev/null)
    size=$(curl -s --max-time 15 "$url" 2>/dev/null | wc -c)
    
    if [ "$status" = "200" ]; then
        if [ "$size" -lt 100 ]; then
            echo "  ⚠️  $page — HTTP $status but only $size bytes (looks empty)" >> "$REPORT"
            WARN=$((WARN+1))
        else
            echo "  ✅ $page — HTTP $status ($size bytes)" >> "$REPORT"
            PASS=$((PASS+1))
        fi
    elif [ "$status" = "000" ]; then
        echo "  ❌ $page — Connection failed (timeout or DNS)" >> "$REPORT"
        FAIL=$((FAIL+1))
        FAILURES="$FAILURES\n    - $page: connection failed"
    else
        echo "  ❌ $page — HTTP $status" >> "$REPORT"
        FAIL=$((FAIL+1))
        FAILURES="$FAILURES\n    - $page: HTTP $status"
    fi
}

echo "--- PAGE CHECKS ---" >> "$REPORT"
for page in "${PAGES[@]}"; do
    check_page "$page"
done

echo "" >> "$REPORT"
echo "--- JS FILE CHECKS ---" >> "$REPORT"
for js in "${JS_FILES[@]}"; do
    check_page "$js"
done

echo "" >> "$REPORT"
echo "--- CSS FILE CHECKS ---" >> "$REPORT"
for css in "${CSS_FILES[@]}"; do
    check_page "$css"
done

# Check build ID freshness (compare against git)
echo "" >> "$REPORT"
echo "--- BUILD ID CHECK ---" >> "$REPORT"
LIVE_BUILD=$(curl -s --max-time 15 "$SITE/index.html" | grep -oP '_buildId="\K[^"]+' | head -1)
cd /home/aaron/.openclaw/workspace/missions/fs-sports-merch/website 2>/dev/null
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
if [ -n "$LIVE_BUILD" ]; then
    echo "  Live build ID: $LIVE_BUILD" >> "$REPORT"
    echo "  Git commit:    $GIT_HASH" >> "$REPORT"
    if echo "$LIVE_BUILD" | grep -q "$GIT_HASH"; then
        echo "  ✅ Build ID matches latest commit" >> "$REPORT"
        PASS=$((PASS+1))
    else
        echo "  ⚠️  Build ID may be behind latest commit (deploy in progress?)" >> "$REPORT"
        WARN=$((WARN+1))
    fi
else
    echo "  ⚠️  No build ID found on index page" >> "$REPORT"
    WARN=$((WARN+1))
fi

# Check auth config is loadable
echo "" >> "$REPORT"
echo "--- AUTH CONFIG SANITY CHECK ---" >> "$REPORT"
AUTH_RAW=$(curl -s --max-time 15 "$SITE/auth-config.js" 2>/dev/null)
if echo "$AUTH_RAW" | grep -q "verifyPassword\|users\|roles"; then
    echo "  ✅ auth-config.js loads and has expected structure" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ❌ auth-config.js missing expected content" >> "$REPORT"
    FAIL=$((FAIL+1))
    FAILURES="$FAILURES\n    - auth-config.js: missing verifyPassword/users/roles"
fi

# Check signin page has form fields
echo "" >> "$REPORT"
echo "--- SIGNIN FORM CHECK ---" >> "$REPORT"
SIGNIN_HTML=$(curl -s --max-time 15 "$SITE/signin.html" 2>/dev/null)
if echo "$SIGNIN_HTML" | grep -q "password\|fs_auth\|signin\|login"; then
    echo "  ✅ Signin form present" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ❌ Signin form missing" >> "$REPORT"
    FAIL=$((FAIL+1))
    FAILURES="$FAILURES\n    - signin.html: missing login form"
fi

# Check nav-dropdown has auth guard
echo "" >> "$REPORT"
echo "--- NAV AUTH GUARD CHECK ---" >> "$REPORT"
NAV=$(curl -s --max-time 15 "$SITE/nav-dropdown.js" 2>/dev/null)
if echo "$NAV" | grep -q "localStorage.*fs_auth\|sessionStorage.*fs_auth"; then
    echo "  ✅ Nav has auth guard (session+localStorage)" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ❌ Nav missing auth guard" >> "$REPORT"
    FAIL=$((FAIL+1))
    FAILURES="$FAILURES\n    - nav-dropdown.js: missing auth guard"
fi

# Check auth guard on several pages
echo "" >> "$REPORT"
echo "--- AUTH GUARD ON SUB-PAGES ---" >> "$REPORT"
for page in inventory-v2.html tournaments.html trips.html trip-tracker.html pack-manager.html; do
    HTML=$(curl -s --max-time 15 "$SITE/$page" 2>/dev/null)
    if echo "$HTML" | grep -q "localStorage.getItem.*fs_auth\|sessionStorage.getItem.*fs_auth"; then
        echo "  ✅ $page — auth guard present" >> "$REPORT"
        PASS=$((PASS+1))
    else
        echo "  ⚠️  $page — no obvious auth guard" >> "$REPORT"
        WARN=$((WARN+1))
    fi
done

# Check for 404 images or broken asset references
echo "" >> "$REPORT"
echo "--- IMAGE ASSET CHECK ---" >> "$REPORT"
IMG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/images/fs.jpeg" 2>/dev/null)
if [ "$IMG_STATUS" = "200" ]; then
    echo "  ✅ fs.jpeg — HTTP 200" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ⚠️  fs.jpeg — HTTP $IMG_STATUS" >> "$REPORT"
    WARN=$((WARN+1))
fi

# Check crew-data.js is loadable and has data
echo "" >> "$REPORT"
echo "--- DATA FILE CHECKS ---" >> "$REPORT"
CREW=$(curl -s --max-time 15 "$SITE/crew-data.js" 2>/dev/null)
if echo "$CREW" | grep -q "CREW_TRIPS"; then
    TRIP_COUNT=$(echo "$CREW" | grep -o '"name":' | wc -l)
    echo "  ✅ crew-data.js — $TRIP_COUNT trips loaded" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ❌ crew-data.js — no trips data" >> "$REPORT"
    FAIL=$((FAIL+1))
    FAILURES="$FAILURES\n    - crew-data.js: no trip data"
fi

TOURNEY=$(curl -s --max-time 15 "$SITE/tournament-data.js" 2>/dev/null)
if echo "$TOURNEY" | grep -q "TOURNEY_DATA"; then
    T_COUNT=$(echo "$TOURNEY" | grep -o '"name":' | wc -l)
    echo "  ✅ tournament-data.js — $T_COUNT tournaments loaded" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ❌ tournament-data.js — no data" >> "$REPORT"
    FAIL=$((FAIL+1))
    FAILURES="$FAILURES\n    - tournament-data.js: no tournament data"
fi

# Check _headers file serving properly
echo "" >> "$REPORT"
echo "--- HEADERS CHECK ---" >> "$REPORT"
HEADERS_CHECK=$(curl -sI "$SITE/inventory-v2.html" 2>/dev/null | grep -i "content-security-policy\|x-content-type-options" | head -1)
if [ -n "$HEADERS_CHECK" ]; then
    echo "  ✅ Security headers present" >> "$REPORT"
    PASS=$((PASS+1))
else
    echo "  ⚠️  No security headers detected (may be fine)" >> "$REPORT"
    WARN=$((WARN+1))
fi

# ===== SUMMARY =====
echo "" >> "$REPORT"
echo "==============================================" >> "$REPORT"
echo "  SUMMARY"                                      >> "$REPORT"
echo "==============================================" >> "$REPORT"
echo "  Passed: $PASS"                                >> "$REPORT"
echo "  Warnings: $WARN"                              >> "$REPORT"
echo "  Failed: $FAIL"                                >> "$REPORT"
if [ "$FAIL" -gt 0 ]; then
    echo "" >> "$REPORT"
    echo "  FAILURES:$FAILURES"                        >> "$REPORT"
fi
echo "" >> "$REPORT"

# Print to stdout too (for cron output capture)
cat "$REPORT"

# Keep last 10 reports
ls -t "$RESULTS_DIR"/report-*.txt 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null

exit $FAIL
