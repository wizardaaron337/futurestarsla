/**
 * Future Stars LA - Top Navigation Bar with Dropdowns
 * Sits at the top of every page with sorted, grouped dropdown menus
 */

(function() {
    // Restore auth from localStorage to sessionStorage (survives build ID page reload)
    if (!sessionStorage.getItem('fs_auth') && localStorage.getItem('fs_auth')) {
        sessionStorage.setItem('fs_auth', localStorage.getItem('fs_auth'));
        sessionStorage.setItem('fs_role', localStorage.getItem('fs_role'));
        sessionStorage.setItem('fs_name', localStorage.getItem('fs_name'));
    }

    // Only show nav for authenticated users
    const isAuth = !!sessionStorage.getItem('fs_auth') || !!localStorage.getItem('fs_auth');
    if (!isAuth) return;

    const userRole = sessionStorage.getItem('fs_role') || localStorage.getItem('fs_role') || 'owner';
    const userName = sessionStorage.getItem('fs_name') || localStorage.getItem('fs_name') || 'User';
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    const ROLE_PAGES = (typeof AUTH_CONFIG !== 'undefined') ? AUTH_CONFIG.roles : {
        owner: ['index', 'tournaments', 'inventory-v2', 'trips', 'team', 'tournament-scraper', 'pack-manager', 'pj-planner', 'sortly-upload', 'trip-tracker', 'trip-plans', 'departments', 'privacy', 'contact'],
        logistics: ['index', 'tournaments', 'trips', 'team', 'tournament-scraper', 'pj-planner', 'trip-tracker', 'trip-plans', 'privacy', 'contact'],
        tournament: ['index', 'tournaments', 'trips', 'team', 'inventory-v2', 'tournament-scraper', 'pack-manager', 'pj-planner', 'sortly-upload', 'trip-tracker', 'trip-plans', 'privacy', 'contact'],
        inventory: ['index', 'inventory-v2', 'sortly-upload', 'pack-manager', 'team', 'trip-tracker', 'privacy', 'contact']
    };

    const ALL_ITEMS = (typeof AUTH_CONFIG !== 'undefined') ? AUTH_CONFIG.navItems : [
        { page: 'index', label: 'Home', icon: '🏠', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'tournaments', label: 'Tournaments', icon: '🏆', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'inventory-v2', label: 'Inventory', icon: '📦', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trips', label: 'Trips', icon: '🚐', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'team', label: 'Team', icon: '👥', roles: ['owner', 'logistics', 'tournament', 'inventory'] },

        { page: 'tournament-scraper', label: 'Schedules', icon: '⏰', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'pack-manager', label: 'Pack Manager', icon: '📦', roles: ['owner', 'tournament', 'inventory'] },
        { page: 'pj-planner', label: 'PJ Trip Maker', icon: '🚐', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'sortly-upload', label: 'Sortly Upload', icon: '📤', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trip-tracker', label: 'Trip Tracker', icon: '📍', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'trip-plans', label: 'Trip Plans', icon: '🗺️', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'departments', label: 'Departments', icon: '🏢', roles: ['owner'] },
        { divider: true },
        { page: 'privacy', label: 'Privacy', icon: '🔒', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'contact', label: 'Contact', icon: '📧', roles: ['owner', 'logistics', 'tournament', 'inventory'] }
    ];

    // Filter items for current user's role
    function getNavItems() {
        return ALL_ITEMS.filter(item => {
            if (item.divider) return false;
            return item.roles.includes(userRole);
        });
    }

    // Sort items into tab groups
    function getTabGroups() {
        const items = getNavItems();
        const groups = [];
        const pageMap = {};
        items.forEach(item => { pageMap[item.page] = item; });

        // Define the tab structure: { tab: 'Tab Label', icon: '🗂️', children: [page names] }
        const tabDefs = [
            {
                tab: 'Home',
                icon: '🏠',
                children: ['index']
            },
            {
                tab: 'Operations',
                icon: '⚡',
                children: ['tournaments', 'inventory-v2', 'trips', 'tournament-scraper']
            },
            {
                tab: 'Planning',
                icon: '🗺️',
                children: ['pack-manager', 'pj-planner', 'trip-plans', 'trip-tracker']
            },
            {
                tab: 'Tools',
                icon: '🛠️',
                children: ['sortly-upload', 'team', 'departments']
            },
            {
                tab: 'Info',
                icon: 'ℹ️',
                children: ['privacy', 'contact']
            }
        ];

        tabDefs.forEach(def => {
            const children = def.children
                .map(p => pageMap[p])
                .filter(Boolean);
            if (children.length > 0) {
                groups.push({
                    tab: def.tab,
                    icon: def.icon,
                    children: children
                });
            }
        });

        return groups;
    }

    function isActive(page) {
        return page === currentPage;
    }

    const suffix = location.hostname.includes('pages.dev') ? '' : '.html';

    // Build the nav bar HTML
    const groups = getTabGroups();
    const navHTML = `
    <div id="fs-top-nav">
        <div id="fs-top-nav-inner">
            <a href="index.html" id="fs-nav-brand">Future Stars</a>
            <div id="fs-nav-tabs">
                ${groups.map(g => `
                    <div class="fs-tab" data-tab="${g.tab.toLowerCase()}">
                        <button class="fs-tab-btn" onclick="toggleFsDropdown('${g.tab.toLowerCase()}')">
                            <span class="fs-tab-icon">${g.icon}</span>
                            <span>${g.tab}</span>
                            <span class="fs-tab-arrow">▾</span>
                        </button>
                        <div class="fs-dropdown" id="fs-drop-${g.tab.toLowerCase()}">
                            ${g.children.map(item => `
                                <a href="${item.page === 'index' ? 'signin.html' : item.page + suffix}" class="fs-drop-item ${isActive(item.page) ? 'active' : ''}">
                                    <span class="fs-drop-icon">${item.icon}</span>
                                    <span>${item.label}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div id="fs-nav-right">
                <span id="dark-mode-toggle" style="display:inline-flex;align-items:center;"></span>
                <span id="fs-nav-user">${userName}</span>
                <button id="fs-nav-logout" onclick="fsNavLogout()" title="Log Out">🚪</button>
            </div>
        </div>
    </div>
    <div id="fs-nav-spacer"></div>
    `;

    const navCSS = `
    <style id="fs-nav-styles">
        /* Reset stacking contexts */
        #fs-top-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 99997;
            font-family: 'Inter', -apple-system, sans-serif;
            background: rgba(10,10,12,0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(201,162,39,0.15);
            height: 60px;
        }
        body {
            padding-top: 60px !important;
        }
        #fs-nav-spacer {
            height: 60px;
        }
        #fs-top-nav-inner {
            max-width: 100%;
            height: 60px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #fs-nav-brand {
            font-family: 'Cinzel', serif;
            font-weight: 700;
            font-size: 1em;
            color: #C9A227;
            text-decoration: none;
            letter-spacing: 2px;
            padding-right: 20px;
            border-right: 1px solid rgba(201,162,39,0.15);
            white-space: nowrap;
        }
        #fs-nav-tabs {
            display: flex;
            align-items: stretch;
            gap: 0;
            flex: 1;
        }
        .fs-tab {
            position: relative;
        }
        .fs-tab-btn {
            background: transparent;
            border: none;
            color: rgba(168,164,152,0.7);
            font-family: 'Inter', sans-serif;
            font-size: 0.95em;
            font-weight: 600;
            padding: 0 18px;
            height: 60px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            white-space: nowrap;
            letter-spacing: 0.3px;
        }
        .fs-tab-btn:hover {
            color: #F8F6F0;
            background: rgba(201,162,39,0.06);
        }
        .fs-tab-btn.open {
            color: #E8C84B;
            background: rgba(201,162,39,0.08);
        }
        .fs-tab-icon {
            font-size: 1.2em;
        }
        .fs-tab-arrow {
            font-size: 0.7em;
            transition: transform 0.2s;
        }
        .fs-tab-btn.open .fs-tab-arrow {
            transform: rotate(180deg);
        }

        /* Dropdown menus */
        .fs-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            min-width: 220px;
            background: rgba(14,14,18,0.97);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(201,162,39,0.12);
            border-radius: 0 0 12px 12px;
            padding: 8px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-6px);
            transition: all 0.2s ease;
            box-shadow: 0 12px 40px rgba(0,0,0,0.5);
            z-index: 99999;
        }
        .fs-dropdown.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .fs-drop-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 18px;
            color: rgba(168,164,152,0.8);
            text-decoration: none;
            font-size: 0.95em;
            font-weight: 500;
            border-radius: 8px;
            transition: all 0.15s;
        }
        .fs-drop-item:hover {
            background: rgba(201,162,39,0.08);
            color: #F8F6F0;
        }
        .fs-drop-item.active {
            background: rgba(201,162,39,0.12);
            color: #E8C84B;
            font-weight: 600;
        }
        .fs-drop-icon {
            font-size: 1.2em;
            width: 24px;
            text-align: center;
        }

        /* Hide page-level dark mode toggle containers (nav has one) */
        body:not(#no-style) #dark-mode-toggle:not(#fs-nav-right #dark-mode-toggle) {
            display: none !important;
        }

        /* Right side: user name + logout */
        #fs-nav-right {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: auto;
            flex-shrink: 0;
        }
        #fs-nav-user {
            font-size: 0.85em;
            color: rgba(168,164,152,0.6);
            font-weight: 500;
        }
        #fs-nav-logout {
            background: transparent;
            border: 1px solid rgba(42,40,36,0.5);
            border-radius: 6px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.2s;
            line-height: 1;
        }
        #fs-nav-logout:hover {
            border-color: rgba(239,83,80,0.4);
            background: rgba(239,83,80,0.08);
        }

        /* Dark mode toggle in nav bar - override fs-utils style */
        #fs-nav-right .fs-dark-toggle {
            width: 28px;
            height: 28px;
            background: transparent;
            border: 1px solid rgba(42,40,36,0.4);
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            line-height: 1;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        #fs-nav-right .fs-dark-toggle:hover {
            border-color: rgba(201,162,39,0.3);
            background: rgba(201,162,39,0.06);
        }

        /* Mobile: dropdowns become full-width if needed */
        @media (max-width: 640px) {
            #fs-top-nav-inner {
                padding: 0 8px;
                gap: 4px;
            }
            #fs-nav-brand {
                font-size: 0.75em;
                padding-right: 10px;
            }
            .fs-tab-btn {
                font-size: 0.72em;
                padding: 0 8px;
            }
            #fs-nav-user {
                display: none;
            }
            .fs-dropdown {
                min-width: 160px;
            }
        }
        @media (max-width: 480px) {
            .fs-tab-btn {
                font-size: 0.65em;
                padding: 0 5px;
            }
            .fs-tab-icon {
                font-size: 0.85em;
            }
            .fs-tab-arrow {
                display: none;
            }
        }
    </style>
    `;

    // Inject
    document.head.insertAdjacentHTML('beforeend', navCSS);
    document.body.insertAdjacentHTML('afterbegin', navHTML + '<div id="fs-nav-spacer"></div>');

    // Close all dropdowns
    window.closeAllDropdowns = function(except) {
        document.querySelectorAll('.fs-dropdown.open').forEach(d => {
            if (except && d.id === 'fs-drop-' + except) return;
            d.classList.remove('open');
        });
        document.querySelectorAll('.fs-tab-btn.open').forEach(b => b.classList.remove('open'));
    };

    // Toggle a dropdown
    window.toggleFsDropdown = function(tab) {
        const drop = document.getElementById('fs-drop-' + tab);
        const btn = document.querySelector(`.fs-tab-btn[onclick*="'${tab}'"]`);
        
        if (!drop) return;
        
        const isOpen = drop.classList.contains('open');
        
        if (isOpen) {
            drop.classList.remove('open');
            if (btn) btn.classList.remove('open');
        } else {
            closeAllDropdowns();
            drop.classList.add('open');
            if (btn) btn.classList.add('open');
        }
    };

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#fs-top-nav')) {
            closeAllDropdowns();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }
    });

    // Logout
    window.fsNavLogout = function() {
        sessionStorage.removeItem('fs_auth');
        sessionStorage.removeItem('fs_role');
        sessionStorage.removeItem('fs_name');
        localStorage.removeItem('fs_auth');
        localStorage.removeItem('fs_role');
        localStorage.removeItem('fs_name');
        window.location.href = location.hostname.includes('pages.dev') ? '/signin' : 'signin.html';
    };

    // Remove old floating nav if any
    const oldNav = document.getElementById('fs-floating-nav');
    if (oldNav) oldNav.remove();
    const oldToggle = window.toggleFsMenu;
    if (oldToggle) window.toggleFsMenu = undefined;
})();
