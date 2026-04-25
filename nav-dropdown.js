/**
 * Future Stars LA - Universal Floating Navigation
 * Fixed position menu button, always accessible on every page
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

    // Use sessionStorage (now restored) or fallback
    const userRole = sessionStorage.getItem('fs_role') || localStorage.getItem('fs_role') || 'owner';
    const userName = sessionStorage.getItem('fs_name') || localStorage.getItem('fs_name') || 'User';
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // Use AUTH_CONFIG if available, otherwise fallback
    const ROLE_PAGES = (typeof AUTH_CONFIG !== 'undefined') ? AUTH_CONFIG.roles : {
        owner: ['dashboard', 'tournaments', 'inventory-v2', 'trips', 'team', 'trip-planner', 'tournament-scraper', 'pack-manager', 'pj-planner', 'sortly-upload', 'trip-tracker', 'trip-plans', 'departments', 'privacy', 'contact'],
        logistics: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'tournament-scraper', 'pj-planner', 'trip-tracker', 'trip-plans', 'privacy', 'contact'],
        tournament: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'inventory-v2', 'tournament-scraper', 'pack-manager', 'pj-planner', 'sortly-upload', 'trip-tracker', 'trip-plans', 'privacy', 'contact'],
        inventory: ['dashboard', 'inventory-v2', 'sortly-upload', 'pack-manager', 'team', 'trip-tracker', 'privacy', 'contact']
    };

    const NAV_ITEMS = (typeof AUTH_CONFIG !== 'undefined') ? AUTH_CONFIG.navItems : [
        { page: 'index', label: 'Home', icon: '🏠', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'tournaments', label: 'Tournaments', icon: '🏆', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'inventory-v2', label: 'Inventory', icon: '📦', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trips', label: 'Trips', icon: '🚐', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'team', label: 'Team', icon: '👥', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'trip-planner', label: 'Trip Planner', icon: '📝', roles: ['owner', 'logistics', 'tournament'] },
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

    function canAccess(page) {
        if (userRole === 'owner') return true;
        const allowed = ROLE_PAGES[userRole] || ROLE_PAGES.inventory;
        return allowed.includes(page);
    }

    function getNavItems() {
        return NAV_ITEMS.filter(item => {
            if (item.divider) return true;
            return item.roles.includes(userRole);
        });
    }

    // Categorize nav items into sections
    function categorizeItems(items) {
        const sections = [];
        const groupMap = {
            'Dashboard': ['index', 'dashboard'],
            'Operations': ['tournaments', 'inventory-v2', 'trips', 'tournament-scraper'],
            'Planning': ['trip-planner', 'pack-manager', 'pj-planner', 'trip-plans', 'trip-tracker'],
            'Utilities': ['sortly-upload', 'team', 'departments']
        };
        const sectionLabels = {
            'Dashboard': { icon: '📊', desc: '' },
            'Operations': { icon: '⚡', desc: 'Core business' },
            'Planning': { icon: '🗺️', desc: 'Trip tools' },
            'Utilities': { icon: '🛠️', desc: 'Resources' }
        };
        
        // Assign items to sections
        const assigned = new Set();
        Object.entries(groupMap).forEach(([sectionName, pages]) => {
            const sectionItems = items.filter(item => !item.divider && pages.includes(item.page));
            if (sectionItems.length > 0) {
                sections.push({ name: sectionName, ...sectionLabels[sectionName], items: sectionItems });
                sectionItems.forEach(i => assigned.add(i));
            }
        });
        
        // Any unassigned items go to Other
        const other = items.filter(item => !item.divider && !assigned.has(item));
        if (other.length > 0) {
            sections.push({ name: 'Other', icon: '📋', desc: '', items: other });
        }
        
        return sections;
    }

    function buildMenuItems() {
        const items = getNavItems();
        const mainItems = items.filter(i => !i.divider);
        const hasDivider = items.some(i => i.divider);
        const footerItems = hasDivider ? items.slice(items.indexOf(items.find(i=>i.divider)) + 1) : [];
        const baseItems = hasDivider ? items.slice(0, items.indexOf(items.find(i=>i.divider))) : items;
        
        // Group into sections
        const sections = categorizeItems(baseItems.filter(i => !i.divider));
        
        const suffix = location.hostname.includes('pages.dev') ? '' : '.html';
        
        let html = '';
        sections.forEach(section => {
            html += `
                <div class="fs-section-label">
                    <span class="fs-section-icon">${section.icon}</span>
                    ${section.name}
                    ${section.desc ? `<span class="fs-section-desc">${section.desc}</span>` : ''}
                </div>`;
            html += section.items.map(item => {
                if (item.divider) return '';
                const isActive = item.page === currentPage ? 'active' : '';
                const href = item.page === 'index' ? 'signin.html' : item.page + suffix;
                return `<a href="${href}" class="fs-menu-item ${isActive}">
                    <span class="fs-menu-icon">${item.icon}</span>
                    <span class="fs-menu-label">${item.label}</span>
                </a>`;
            }).join('');
        });
        
        // Footer items (after divider)
        if (footerItems.length > 0) {
            html += '<div class="fs-menu-divider"></div>';
            html += footerItems.map(item => {
                if (item.divider) return '';
                const isActive = item.page === currentPage ? 'active' : '';
                const href = item.page === 'index' ? 'signin.html' : item.page + suffix;
                return `<a href="${href}" class="fs-menu-item fs-menu-footer-item ${isActive}">
                    <span class="fs-menu-icon">${item.icon}</span>
                    <span class="fs-menu-label">${item.label}</span>
                </a>`;
            }).join('');
        }
        
        return html;
    }

    // Create the floating nav HTML
    const navHTML = `
    <div id="fs-floating-nav">
        <button id="fs-menu-toggle" onclick="toggleFsMenu()" aria-label="Open menu">
            <span class="fs-bar"></span>
            <span class="fs-bar"></span>
            <span class="fs-bar"></span>
        </button>
        <div id="fs-menu-panel">
            <div class="fs-menu-header">
                <div>
                    <div class="fs-menu-user">${userName} <span class="fs-role-badge">${userRole}</span></div>
                </div>
                <button class="fs-menu-close" onclick="toggleFsMenu()">&times;</button>
            </div>
            <div class="fs-menu-scroll">
                ${buildMenuItems()}
            </div>
            <div class="fs-menu-footer">
                <button class="fs-logout" onclick="fsLogout()">🚪 Log Out</button>
            </div>
        </div>
        <div id="fs-menu-backdrop" onclick="toggleFsMenu()"></div>
    </div>
    `;

    const navCSS = `
    <style id="fs-nav-styles">
        #fs-floating-nav {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 99999;
            font-family: 'Inter', sans-serif;
        }
        #fs-menu-toggle {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: linear-gradient(135deg, #C9A227 0%, #B8941F 100%);
            border: none;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            box-shadow: 0 4px 15px rgba(201,162,39,0.4);
            transition: all 0.3s ease;
        }
        #fs-menu-toggle:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 20px rgba(201,162,39,0.5);
        }
        #fs-menu-toggle:active {
            transform: scale(0.95);
        }
        #fs-menu-toggle.open {
            background: linear-gradient(135deg, #B8941F 0%, #8B6914 100%);
        }
        .fs-bar {
            display: block;
            width: 20px;
            height: 2.5px;
            background: #0A0A0A;
            border-radius: 2px;
            transition: all 0.3s ease;
        }
        #fs-menu-toggle.open .fs-bar:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        #fs-menu-toggle.open .fs-bar:nth-child(2) {
            opacity: 0;
        }
        #fs-menu-toggle.open .fs-bar:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
        #fs-menu-panel {
            position: fixed;
            top: 0;
            right: -320px;
            width: 280px;
            height: 100vh;
            background: rgba(10,10,12,0.96);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-left: 1px solid rgba(201,162,39,0.12);
            display: flex;
            flex-direction: column;
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 100000;
            box-shadow: -5px 0 40px rgba(0,0,0,0.6);
        }
        #fs-menu-panel.open {
            right: 0;
        }
        .fs-menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 20px 16px;
            border-bottom: 1px solid rgba(201,162,39,0.1);
            flex-shrink: 0;
            background: linear-gradient(180deg, rgba(201,162,39,0.04) 0%, transparent 100%);
        }
        .fs-menu-user {
            font-size: 0.9em;
            color: #F8F6F0;
            font-weight: 600;
        }
        .fs-role-badge {
            display: inline-block;
            padding: 2px 10px;
            background: rgba(201,162,39,0.12);
            color: #E8C84B;
            border-radius: 4px;
            font-size: 0.7em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-left: 6px;
            font-weight: 400;
        }
        .fs-menu-close {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: transparent;
            border: 1px solid rgba(42,40,36,0.6);
            color: #A8A498;
            font-size: 1.2em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        .fs-menu-close:hover {
            border-color: #C9A227;
            color: #C9A227;
        }
        .fs-menu-scroll {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
            scroll-behavior: smooth;
        }
        .fs-menu-scroll::-webkit-scrollbar {
            width: 3px;
        }
        .fs-menu-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .fs-menu-scroll::-webkit-scrollbar-thumb {
            background: rgba(201,162,39,0.2);
            border-radius: 2px;
        }
        .fs-section-label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px 20px 6px;
            font-size: 0.7em;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: rgba(168,164,152,0.5);
            font-weight: 600;
        }
        .fs-section-icon {
            font-size: 0.9em;
            opacity: 0.5;
        }
        .fs-section-desc {
            color: rgba(168,164,152,0.25);
            font-weight: 400;
            letter-spacing: 0;
            text-transform: none;
            font-size: 0.9em;
            margin-left: auto;
        }
        .fs-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 20px;
            color: rgba(168,164,152,0.85);
            text-decoration: none;
            font-size: 0.88em;
            font-weight: 450;
            transition: all 0.2s ease;
            margin: 1px 10px;
            border-radius: 8px;
            position: relative;
        }
        .fs-menu-item:hover {
            background: rgba(201,162,39,0.08);
            color: #F8F6F0;
            transform: translateX(2px);
        }
        .fs-menu-item:active {
            transform: scale(0.98);
        }
        .fs-menu-item.active {
            background: rgba(201,162,39,0.12);
            color: #E8C84B;
            font-weight: 600;
        }
        .fs-menu-item.active::before {
            content: '';
            position: absolute;
            left: -2px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: #C9A227;
            border-radius: 0 3px 3px 0;
        }
        .fs-menu-icon {
            font-size: 1.15em;
            width: 24px;
            text-align: center;
            flex-shrink: 0;
            line-height: 1;
        }
        .fs-menu-label {
            white-space: nowrap;
        }
        .fs-menu-footer-item {
            font-size: 0.82em;
            opacity: 0.7;
        }
        .fs-menu-footer-item:hover {
            opacity: 1;
        }
        .fs-menu-divider {
            height: 1px;
            background: rgba(201,162,39,0.08);
            margin: 8px 20px;
        }
        .fs-menu-footer {
            padding: 12px 20px;
            border-top: 1px solid rgba(201,162,39,0.08);
            flex-shrink: 0;
        }
        .fs-logout {
            width: 100%;
            padding: 10px;
            background: transparent;
            border: 1px solid rgba(42,40,36,0.6);
            border-radius: 8px;
            color: #A8A498;
            font-family: 'Inter', sans-serif;
            font-size: 0.85em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
        }
        .fs-logout:hover {
            border-color: #EF5350;
            color: #EF5350;
            background: rgba(239,83,80,0.08);
        }
        #fs-menu-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 99998;
        }
        #fs-menu-backdrop.open {
            opacity: 1;
            visibility: visible;
        }
        @media (max-width: 480px) {
            #fs-menu-panel {
                width: 260px;
                right: -280px;
            }
            #fs-menu-toggle {
                width: 40px;
                height: 40px;
            }
            .fs-menu-item {
                padding: 11px 16px;
                margin: 1px 6px;
                font-size: 0.85em;
            }
            .fs-section-label {
                padding: 14px 16px 4px;
                font-size: 0.65em;
            }
        }
    </style>
    `;

    // Inject styles and HTML
    document.head.insertAdjacentHTML('beforeend', navCSS);
    document.body.insertAdjacentHTML('beforeend', navHTML);

    // Global toggle function
    window.toggleFsMenu = function() {
        const panel = document.getElementById('fs-menu-panel');
        const backdrop = document.getElementById('fs-menu-backdrop');
        const toggle = document.getElementById('fs-menu-toggle');
        
        if (!panel) return;
        
        const isOpen = panel.classList.contains('open');
        
        if (isOpen) {
            panel.classList.remove('open');
            backdrop.classList.remove('open');
            toggle.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            panel.classList.add('open');
            backdrop.classList.add('open');
            toggle.classList.add('open');
            document.body.style.overflow = '';
        }
    };

    // Logout function
    window.fsLogout = function() {
        sessionStorage.removeItem('fs_auth');
        sessionStorage.removeItem('fs_role');
        sessionStorage.removeItem('fs_name');
        localStorage.removeItem('fs_auth');
        localStorage.removeItem('fs_role');
        localStorage.removeItem('fs_name');
        window.location.href = location.hostname.includes('pages.dev') ? '/signin' : 'signin.html';
    };

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const panel = document.getElementById('fs-menu-panel');
            if (panel && panel.classList.contains('open')) {
                toggleFsMenu();
            }
        }
    });
})();
