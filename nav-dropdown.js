/**
 * Future Stars LA - Universal Floating Navigation
 * Fixed position menu button, always accessible on every page
 */

(function() {
    // Only show nav for authenticated users
    const isAuth = sessionStorage.getItem('fs_auth') && sessionStorage.getItem('fs_pin_verified') === 'true';
    if (!isAuth) return;

    const userRole = sessionStorage.getItem('fs_role') || 'owner';
    const userName = sessionStorage.getItem('fs_name') || 'User';
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // Use AUTH_CONFIG if available, otherwise fallback
    const ROLE_PAGES = (typeof AUTH_CONFIG !== 'undefined') ? AUTH_CONFIG.roles : {
        owner: ['tournaments', 'inventory-v2', 'trips', 'team', 'jersey-gallery', 'trip-planner', 'sortly-upload', 'privacy', 'contact'],
        logistics: ['tournaments', 'trips', 'trip-planner', 'team', 'privacy', 'contact', 'inventory-v2'],
        tournament: ['tournaments', 'trips', 'trip-planner', 'team', 'inventory-v2', 'jersey-gallery', 'privacy', 'contact'],
        inventory: ['inventory-v2', 'jersey-gallery', 'sortly-upload', 'team', 'privacy', 'contact']
    };

    const NAV_ITEMS = (typeof AUTH_CONFIG !== 'undefined') ? AUTH_CONFIG.navItems : [
        { page: 'index', label: 'Home', icon: '🏠', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'tournaments', label: 'Tournaments', icon: '🏆', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'inventory-v2', label: 'Inventory', icon: '📦', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trips', label: 'Trips', icon: '🚐', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'team', label: 'Team', icon: '👥', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'jersey-gallery', label: 'Jersey Gallery', icon: '👕', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trip-planner', label: 'Trip Planner', icon: '📝', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'sortly-upload', label: 'Sortly Upload', icon: '📤', roles: ['owner', 'inventory'] },
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

    function buildMenuItems() {
        return getNavItems().map(item => {
            if (item.divider) return '<div class="fs-menu-divider"></div>';
            const isActive = item.page === currentPage ? 'active' : '';
            const href = item.page === 'index' ? 'signin.html' : item.page + '.html';
            return `<a href="${href}" class="fs-menu-item ${isActive}">
                <span class="fs-menu-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');
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
            right: -300px;
            width: 260px;
            height: 100vh;
            background: rgba(14,14,14,0.92);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-left: 1px solid rgba(42,40,36,0.4);
            display: flex;
            flex-direction: column;
            transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 100000;
            box-shadow: -5px 0 30px rgba(0,0,0,0.5);
        }
        #fs-menu-panel.open {
            right: 0;
        }
        .fs-menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 18px 12px;
            border-bottom: 1px solid rgba(42,40,36,0.4);
            flex-shrink: 0;
        }
        .fs-menu-user {
            font-size: 0.85em;
            color: #A8A498;
        }
        .fs-role-badge {
            display: inline-block;
            padding: 2px 8px;
            background: rgba(201,162,39,0.15);
            color: #C9A227;
            border-radius: 4px;
            font-size: 0.75em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-left: 6px;
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
            padding: 6px 0;
        }
        .fs-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 18px;
            color: #A8A498;
            text-decoration: none;
            font-size: 0.9em;
            font-weight: 500;
            transition: all 0.25s ease;
            border-left: 3px solid transparent;
            margin: 1px 8px;
            border-radius: 0 8px 8px 0;
        }
        .fs-menu-item:hover {
            background: rgba(201,162,39,0.08);
            color: #F8F6F0;
            border-left-color: #C9A227;
            padding-left: 22px;
        }
        .fs-menu-item.active {
            background: rgba(201,162,39,0.12);
            color: #C9A227;
            border-left-color: #C9A227;
            font-weight: 600;
        }
        .fs-menu-icon {
            font-size: 1.1em;
            width: 24px;
            text-align: center;
        }
        .fs-menu-divider {
            height: 1px;
            background: rgba(42,40,36,0.4);
            margin: 8px 18px;
        }
        .fs-menu-footer {
            padding: 12px 18px;
            border-top: 1px solid rgba(42,40,36,0.4);
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
            background: rgba(0,0,0,0.3);
            opacity: 0;
            visibility: hidden;
            transition: all 0.35s ease;
            z-index: 99998;
        }
        #fs-menu-backdrop.open {
            opacity: 1;
            visibility: visible;
        }
        @media (max-width: 480px) {
            #fs-menu-panel {
                width: 240px;
                right: -260px;
            }
            #fs-menu-toggle {
                width: 40px;
                height: 40px;
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
        sessionStorage.clear();
        window.location.href = 'signin.html';
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
