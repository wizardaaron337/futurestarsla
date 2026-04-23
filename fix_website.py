#!/usr/bin/env python3
"""
Fix remaining website issues across all v2 pages:
1. Add mobile hamburger menu to: inventory.html, trips.html, team.html, jersey-gallery.html
2. Add meta description/Open Graph tags to all pages
3. Add Google Sheets integration to trips.html
4. Standardize --dark-bg color to #050810 on all pages
5. Add auto-refresh (30s interval + tab focus) to all pages
"""

import re
import os

V2_DIR = "/home/aaron/.openclaw/workspace/missions/fs-sports-merch/website/v2"
SHEET_ID = "1XqPyWyUOLB6TFipZgt22esL78t_Typ6lDsB1sNxSIEQ"

# Meta tags template for each page
META_TEMPLATES = {
    "index.html": {
        "title": "Future Stars Sports Merch — Command Center V2",
        "desc": "Future Stars Sports Merch operations dashboard. Tournament inventory, crew management, and trip planning.",
        "og_title": "Future Stars Sports Merch — Command Center",
        "og_desc": "Operations dashboard for tournament merchandise management"
    },
    "inventory.html": {
        "title": "FS Sports Merch — Inventory Command Center",
        "desc": "Real-time inventory tracking for Future Stars Sports Merch. Jersey stock levels, tournament supplies, and warehouse management.",
        "og_title": "FS Sports Merch — Inventory",
        "og_desc": "Real-time inventory tracking and warehouse management"
    },
    "trips.html": {
        "title": "FS Sports Merch — Active Crew Command Center",
        "desc": "Active tournament missions and crew assignments for Future Stars Sports Merch. Soccer and baseball events across multiple states.",
        "og_title": "FS Sports Merch — Active Missions",
        "og_desc": "Tournament missions and crew assignment tracking"
    },
    "team.html": {
        "title": "FS Sports Merch — Crew Command Center",
        "desc": "Crew directory for Future Stars Sports Merch. Leadership, operations, and active crew members.",
        "og_title": "FS Sports Merch — Crew Directory",
        "og_desc": "Team directory and crew management"
    },
    "jersey-gallery.html": {
        "title": "Future Stars — Jersey Gallery",
        "desc": "Jersey image gallery for Future Stars Sports Merch. Review and approve product images.",
        "og_title": "Future Stars — Jersey Gallery",
        "og_desc": "Jersey image review and approval gallery"
    }
}

# Mobile menu CSS to add
MENU_TOGGLE_CSS = """        /* Mobile menu toggle */
        .menu-toggle {
            display: none;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: rgba(0,0,0,0.8);
            border: 2px solid rgba(0,212,255,0.3);
            color: var(--neon-blue);
            padding: 12px;
            border-radius: 12px;
            font-size: 1.5em;
            cursor: pointer;
            backdrop-filter: blur(10px);
        }
"""

# Mobile responsive CSS to add (before closing </style>)
MOBILE_RESPONSIVE_CSS = """        /* Mobile menu */
        .menu-toggle { display: none; }
        @media (max-width: 768px) {
            .menu-toggle { display: block; }
            .nav {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(5,8,16,0.98);
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                padding: 80px 20px;
            }
            .nav.hidden { display: none; }
            .nav-btn { width: 80%; text-align: center; }
            .logo { font-size: 2em; }
        }
"""

# Auto-refresh script
AUTO_REFRESH_SCRIPT = """
        // Auto-refresh every 30 seconds for near real-time sync
        setInterval(function() {
            if (typeof loadData === 'function') loadData();
            else if (typeof renderInventory === 'function') renderInventory();
            else if (typeof renderTrips === 'function') renderTrips(currentFilter || 'all');
            else if (typeof renderCrew === 'function') renderCrew();
            else if (typeof showJersey === 'function') showJersey(currentIndex || 0);
        }, 30000);
        
        // Also refresh when user comes back to the tab
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                if (typeof loadData === 'function') loadData();
                else if (typeof renderInventory === 'function') renderInventory();
                else if (typeof renderTrips === 'function') renderTrips(currentFilter || 'all');
                else if (typeof renderCrew === 'function') renderCrew();
                else if (typeof showJersey === 'function') showJersey(currentIndex || 0);
            }
        });
"""

def add_meta_tags(content, filename):
    """Add meta description and Open Graph tags after the viewport meta tag."""
    meta = META_TEMPLATES.get(filename)
    if not meta:
        return content
    
    # Check if already has meta description
    if 'meta name="description"' in content:
        return content
    
    meta_block = f'''    <meta name="description" content="{meta['desc']}">
    <meta property="og:title" content="{meta['og_title']}">
    <meta property="og:description" content="{meta['og_desc']}">
'''
    
    # Insert after viewport meta tag
    content = re.sub(
        r'(<meta name="viewport" content="[^"]+">\n)',
        r'\1' + meta_block,
        content
    )
    return content

def add_csp_meta(content, filename):
    """Add CSP meta tag if missing (for non-index pages)."""
    if filename == "index.html":
        return content
    if 'Content-Security-Policy' in content:
        return content
    
    csp = '    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src https://docs.google.com; img-src \'self\' https: data:; frame-src \'none\';">\n'
    
    content = re.sub(
        r'(<meta name="viewport" content="[^"]+">\n)',
        r'\1' + csp,
        content
    )
    return content

def fix_dark_bg(content):
    """Standardize --dark-bg to #050810."""
    return content.replace('--dark-bg: #0a0e27;', '--dark-bg: #050810;')

def add_menu_toggle_css(content):
    """Add menu-toggle CSS before the nav section."""
    if '.menu-toggle' in content:
        return content
    
    # Find the nav section and insert menu toggle CSS before it
    content = re.sub(
        r'(        /\* Navigation \*/\n)',
        MENU_TOGGLE_CSS + r'\1',
        content
    )
    return content

def add_mobile_responsive(content):
    """Add mobile responsive CSS at the end of the style block."""
    if 'position: fixed;' in content and 'bottom: 0;' in content and '.nav.hidden' in content:
        # Already has mobile menu responsive
        return content
    
    # Insert before closing </style>
    content = re.sub(
        r'(        /\* Responsive \*/\n        @media \(max-width: 768px\) \{)',
        MOBILE_RESPONSIVE_CSS + r'\1',
        content
    )
    return content

def add_menu_toggle_button(content, filename):
    """Add the hamburger menu button after <body> or before header."""
    if 'menu-toggle' in content and 'onclick="toggleMenu()"' in content:
        return content
    
    # Add button before header div
    content = re.sub(
        r'(    <div class="header">)',
        '    <button class="menu-toggle" onclick="toggleMenu()">☰</button>\n\n' + r'\1',
        content
    )
    return content

def add_nav_id(content):
    """Add id='nav' to the nav div."""
    if 'id="nav"' in content:
        return content
    
    content = re.sub(
        r'(<div class="nav">)',
        r'<div class="nav" id="nav">',
        content
    )
    return content

def add_toggle_menu_function(content):
    """Add the toggleMenu function to the script section."""
    if 'function toggleMenu()' in content:
        return content
    
    toggle_func = '''
        // Mobile menu toggle
        function toggleMenu() {
            const nav = document.getElementById('nav');
            nav.classList.toggle('hidden');
        }
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    document.getElementById('nav').classList.add('hidden');
                }
            });
        });
'''
    
    # Insert at the beginning of the first <script> tag
    content = re.sub(
        r'(    <script>\n)',
        r'\1' + toggle_func,
        content
    )
    return content

def add_auto_refresh(content):
    """Add auto-refresh script before closing </script> tag."""
    if 'setInterval' in content and 'visibilitychange' in content:
        return content
    
    # Insert before the last </script> or before </body>
    content = re.sub(
        r'(    </script>\n</body>)',
        AUTO_REFRESH_SCRIPT + r'\1',
        content
    )
    return content

def add_sheets_integration_to_trips(content):
    """Add Google Sheets integration to trips.html."""
    if 'SHEET_ID' in content and 'fetchSheetData' in content:
        return content
    
    # Add sheet config at the beginning of the script
    sheet_config = f'''        // Google Sheets Configuration
        const SHEET_ID = '{SHEET_ID}';
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${{SHEET_ID}}/gviz/tq?tqx=out:json`;
        
        // Fetch tournament data from Google Sheets
        async function fetchSheetData() {{
            try {{
                const response = await fetch(SHEET_URL);
                if (!response.ok) throw new Error('Sheet not accessible');
                
                const text = await response.text();
                const json = JSON.parse(text.substring(47).slice(0, -2));
                
                const rows = json.table.rows;
                const tournaments = [];
                
                rows.forEach(row => {{
                    const cells = row.c;
                    if (!cells || !cells[1] || !cells[1].v) return;
                    
                    tournaments.push({{
                        name: cells[1].v,
                        date: cells[0] ? cells[0].v : 'TBD',
                        revenue: cells[11] ? cells[11].v : 0,
                        profit: cells[12] ? cells[12].v : 0
                    }});
                }});
                
                console.log('Sheet data loaded:', tournaments.length, 'tournaments');
                return tournaments;
            }} catch (error) {{
                console.log('Sheet fetch failed:', error);
                return [];
            }}
        }}
        
'''
    
    content = re.sub(
        r'(    <script>\n)',
        r'\1' + sheet_config,
        content
    )
    return content

def process_file(filename):
    """Process a single HTML file."""
    filepath = os.path.join(V2_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Add meta tags
    content = add_meta_tags(content, filename)
    
    # 2. Add CSP if missing
    content = add_csp_meta(content, filename)
    
    # 3. Fix dark-bg color
    content = fix_dark_bg(content)
    
    # 4. Add mobile menu (for non-index pages)
    if filename != 'index.html':
        content = add_menu_toggle_css(content)
        content = add_mobile_responsive(content)
        content = add_menu_toggle_button(content, filename)
        content = add_nav_id(content)
        content = add_toggle_menu_function(content)
    
    # 5. Add auto-refresh
    content = add_auto_refresh(content)
    
    # 6. Add Sheets integration to trips.html
    if filename == 'trips.html':
        content = add_sheets_integration_to_trips(content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Updated {filename}")
        return True
    else:
        print(f"⏭️  No changes needed for {filename}")
        return False

def main():
    files = ['index.html', 'inventory.html', 'trips.html', 'team.html', 'jersey-gallery.html']
    changed = 0
    for f in files:
        if process_file(f):
            changed += 1
    
    print(f"\n📊 Done! {changed}/{len(files)} files updated.")

if __name__ == '__main__':
    main()
