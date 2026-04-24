/**
 * Future Stars LA - Dropdown Navigation with Role-Based Access
 * Roles: owner, logistics, tournament, inventory
 */

(function() {
    // Role-based page permissions
    const ROLE_PAGES = {
        // Owners - see everything
        owner: ['dashboard', 'tournaments', 'inventory', 'trips', 'team', 'jersey-gallery', 'trip-planner', 'privacy', 'contact'],
        // PJ - operations, trips, tournaments
        logistics: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'privacy', 'contact'],
        // Caleb - full tournament access
        tournament: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'inventory', 'jersey-gallery', 'privacy', 'contact'],
        // Marlon - inventory focus
        inventory: ['dashboard', 'inventory', 'jersey-gallery', 'sortly-upload', 'team', 'privacy', 'contact']
    };

    // All nav items with their roles
    const NAV_ITEMS = [
        { page: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'tournaments', label: 'Tournaments', icon: '🏆', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'inventory', label: 'Inventory', icon: '📦', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trips', label: 'Trips', icon: '🚐', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'team', label: 'Team', icon: '👥', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'jersey-gallery', label: 'Jersey Gallery', icon: '👕', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trip-planner', label: 'Trip Planner', icon: '📝', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'sortly-upload', label: 'Sortly Upload', icon: '📤', roles: ['owner', 'inventory'] },
        { divider: true },
        { page: 'privacy', label: 'Privacy', icon: '🔒', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'contact', label: 'Contact', icon: '📧', roles: ['owner', 'logistics', 'tournament', 'inventory'] }
    ];

    // Get current user's role
    function getUserRole() {
        return sessionStorage.getItem('fs_role') || 'owner';
    }

    function getUserName() {
        return sessionStorage.getItem('fs_name') || 'Guest';
    }

    // Check if user can access a page
    function canAccess(page) {
        const role = getUserRole();
        if (role === 'owner') return true;
        const allowed = ROLE_PAGES[role] || ROLE_PAGES.inventory;
        return allowed.includes(page);
    }

    // Filter nav items by role
    function getNavItems() {
        const role = getUserRole();
        return NAV_ITEMS.filter(item => {
            if (item.divider) return true;
            return item.roles.includes(role);
        });
    }

    // Build nav HTML
    function buildNav() {
        const items = getNavItems();
        const role = getUserRole();
        const name = getUserName();
        
        let linksHTML = items.map(item => {
            if (item.divider) {
                return '<div class="fs-nav-divider"></div>';
            }
            return `
            <a href="${item.page}.html" class="fs-nav-link" data-page="${item.page}">
                <span class="fs-nav-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');

        return `
        <div class="fs-nav-container">
            <button class="fs-nav-toggle" onclick="toggleNav()" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav class="fs-nav-dropdown" id="fsNavMenu">
                <div class="fs-nav-header">
                    <div>
                        <span class="fs-nav-title">Future Stars</span>
                        <div class="fs-nav-user">${name} <span class="fs-nav-role">${role}</span></div>
                    </div>
                    <button class="fs-nav-close" onclick="toggleNav()">&times;</button>
                </div>
                ${linksHTML}
                <div class="fs-nav-footer">
                    <button class="fs-nav-logout" onclick="logout()">
                        <span>🚪</span> Log Out
                    </button>
                </div>
            </nav>
            <div class="fs-nav-overlay" id="fsNavOverlay" onclick="toggleNav()"></div>
        </div>
        `;
    }

    const navCSS = `
    <style>
        .fs-nav-container {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
        }
        .fs-nav-toggle {
            width: 48px;
            height: 48px;
            border-radius: 12px;
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
        .fs-nav-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(201,162,39,0.5);
        }
        .fs-nav-toggle:active {
            transform: scale(0.95);
        }
        .fs-nav-toggle span {
            display: block;
            width: 22px;
            height: 2.5px;
            background: #0A0A0A;
            border-radius: 2px;
            transition: all 0.3s ease;
        }
        .fs-nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .fs-nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        .fs-nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
        .fs-nav-dropdown {
            position: fixed;
            top: 0;
            left: -320px;
            width: 280px;
            height: 100vh;
            background: linear-gradient(180deg, #141414 0%, #0A0A0A 100%);
            border-right: 1px solid #2A2824;
            padding: 0;
            display: flex;
            flex-direction: column;
            transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10001;
            overflow-y: auto;
            box-shadow: 5px 0 30px rgba(0,0,0,0.5);
        }
        .fs-nav-dropdown.open {
            left: 0;
        }
        .fs-nav-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 20px 16px;
            border-bottom: 1px solid #2A2824;
            margin-bottom: 8px;
        }
        .fs-nav-title {
            font-family: 'Cinzel', serif;
            font-size: 1.1em;
            font-weight: 700;
            color: #C9A227;
            letter-spacing: 2px;
        }
        .fs-nav-user {
            font-size: 0.8em;
            color: #A8A498;
            margin-top: 4px;
        }
        .fs-nav-role {
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
        .fs-nav-close {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: transparent;
            border: 1px solid #2A2824;
            color: #A8A498;
            font-size: 1.4em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        .fs-nav-close:hover {
            border-color: #C9A227;
            color: #C9A227;
        }
        .fs-nav-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 20px;
            color: #A8A498;
            text-decoration: none;
            font-size: 0.95em;
            font-weight: 500;
            transition: all 0.25s ease;
            border-left: 3px solid transparent;
            margin: 2px 8px;
            border-radius: 0 10px 10px 0;
        }
        .fs-nav-link:hover {
            background: rgba(201,162,39,0.08);
            color: #F8F6F0;
            border-left-color: #C9A227;
            padding-left: 24px;
        }
        .fs-nav-link.active {
            background: rgba(201,162,39,0.12);
            color: #C9A227;
            border-left-color: #C9A227;
            font-weight: 600;
        }
        .fs-nav-icon {
            font-size: 1.3em;
            width: 28px;
            text-align: center;
        }
        .fs-nav-divider {
            height: 1px;
            background: #2A2824;
            margin: 12px 20px;
        }
        .fs-nav-footer {
            margin-top: auto;
            padding: 16px 20px;
            border-top: 1px solid #2A2824;
        }
        .fs-nav-logout {
            width: 100%;
            padding: 12px;
            background: transparent;
            border: 1px solid #2A2824;
            border-radius: 10px;
            color: #A8A498;
            font-family: 'Inter', sans-serif;
            font-size: 0.9em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
        }
        .fs-nav-logout:hover {
            border-color: #EF5350;
            color: #EF5350;
            background: rgba(239,83,80,0.08);
        }
        .fs-nav-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.35s ease;
            z-index: 9999;
        }
        .fs-nav-overlay.open {
            opacity: 1;
            visibility: visible;
        }
        /* Access denied page overlay */
        .fs-access-denied {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(10,10,10,0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            gap: 20px;
        }
        .fs-access-denied h2 {
            font-family: 'Cinzel', serif;
            color: #EF5350;
            font-size: 2em;
        }
        .fs-access-denied p {
            color: #A8A498;
        }
        .fs-access-denied a {
            padding: 12px 24px;
            background: #C9A227;
            color: #0A0A0A;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
        }
        @media (max-width: 480px) {
            .fs-nav-dropdown {
                width: 260px;
                left: -280px;
            }
            .fs-nav-toggle {
                width: 44px;
                height: 44px;
            }
        }
    </style>
    `;

    // Inject CSS
    document.head.insertAdjacentHTML('beforeend', navCSS);

    // Inject nav HTML at start of body
    document.body.insertAdjacentHTML('afterbegin', buildNav());

    // Highlight current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const activeLink = document.querySelector(`.fs-nav-link[data-page="${currentPage}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Check access permission for current page
    if (!canAccess(currentPage)) {
        document.body.innerHTML = `
            <div class="fs-access-denied">
                <h2>🚫 Access Denied</h2>
                <p>You don't have permission to view this page.</p>
                <p>Role: <strong>${getUserRole()}</strong></p>
                <a href="dashboard.html">Go to Dashboard</a>
            </div>
        `;
    }

    // Global toggle function
    window.toggleNav = function() {
        const menu = document.getElementById('fsNavMenu');
        const overlay = document.getElementById('fsNavOverlay');
        const toggle = document.querySelector('.fs-nav-toggle');
        
        menu.classList.toggle('open');
        overlay.classList.toggle('open');
        toggle.classList.toggle('active');
    };

    // Logout function
    window.logout = function() {
        sessionStorage.clear();
        window.location.href = 'signin.html';
    };

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const menu = document.getElementById('fsNavMenu');
            if (menu.classList.contains('open')) toggleNav();
        }
    });
})();
