/**
 * Future Stars LA - Header-Integrated Dropdown Navigation with Role-Based Access
 * Works on all pages - shows for authenticated users, hides for public pages
 */

(function() {
    // Check if user is authenticated
    const isAuth = sessionStorage.getItem('fs_auth') && sessionStorage.getItem('fs_pin_verified') === 'true';
    const userRole = sessionStorage.getItem('fs_role') || 'owner';
    const userName = sessionStorage.getItem('fs_name') || 'User';

    // Pages that don't need auth
    const PUBLIC_PAGES = ['index', 'signin', 'login', 'sign-in', 'enter', 'direct-deploy', 'test'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const isPublicPage = PUBLIC_PAGES.includes(currentPage);

    // If not authenticated and not on a public page, redirect to signin
    if (!isAuth && !isPublicPage && currentPage !== 'pin') {
        window.location.href = 'signin.html';
        return;
    }

    // Don't show nav on public pages
    if (!isAuth) return;

    // Role-based page permissions
    const ROLE_PAGES = {
        owner: ['dashboard', 'tournaments', 'inventory', 'trips', 'team', 'jersey-gallery', 'trip-planner', 'sortly-upload', 'privacy', 'contact', 'inventory-v2'],
        logistics: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'privacy', 'contact', 'inventory-v2'],
        tournament: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'inventory', 'jersey-gallery', 'privacy', 'contact', 'inventory-v2'],
        inventory: ['dashboard', 'inventory', 'jersey-gallery', 'sortly-upload', 'team', 'privacy', 'contact', 'inventory-v2']
    };

    const NAV_ITEMS = [
        { page: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
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

    function buildDropdownItems() {
        const items = getNavItems();
        return items.map(item => {
            if (item.divider) return '<div class="fs-menu-divider"></div>';
            return `<a href="${item.page}.html" class="fs-menu-item" data-page="${item.page}">
                <span class="fs-menu-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');
    }

    function createNav() {
        return `
        <div class="fs-header-nav">
            <button class="fs-menu-btn" onclick="toggleFsMenu()" aria-label="Menu">
                <span class="fs-menu-bar"></span>
                <span class="fs-menu-bar"></span>
                <span class="fs-menu-bar"></span>
                <span class="fs-menu-label">Menu</span>
            </button>
            <div class="fs-dropdown" id="fsDropdown">
                <div class="fs-dropdown-header">
                    <div class="fs-dropdown-user">
                        <span class="fs-dropdown-name">${userName}</span>
                        <span class="fs-dropdown-role">${userRole}</span>
                    </div>
                </div>
                ${buildDropdownItems()}
                <div class="fs-dropdown-footer">
                    <button class="fs-logout-btn" onclick="fsLogout()">
                        <span>🚪</span> Log Out
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    const navCSS = `
    <style>
        .fs-header-nav {
            position: relative;
            display: inline-block;
        }
        .fs-menu-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 18px;
            background: linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.05) 100%);
            border: 1px solid rgba(201,162,39,0.3);
            border-radius: 10px;
            color: #C9A227;
            font-family: 'Inter', sans-serif;
            font-size: 0.9em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 1px;
        }
        .fs-menu-btn:hover {
            background: linear-gradient(135deg, rgba(201,162,39,0.25) 0%, rgba(201,162,39,0.1) 100%);
            border-color: #C9A227;
            box-shadow: 0 4px 15px rgba(201,162,39,0.2);
        }
        .fs-menu-btn.active {
            background: rgba(201,162,39,0.2);
            border-color: #C9A227;
        }
        .fs-menu-bar {
            display: block;
            width: 18px;
            height: 2px;
            background: #C9A227;
            border-radius: 2px;
            transition: all 0.3s ease;
        }
        .fs-menu-btn.active .fs-menu-bar:nth-child(1) {
            transform: rotate(45deg) translate(4px, 4px);
            width: 20px;
        }
        .fs-menu-btn.active .fs-menu-bar:nth-child(2) {
            opacity: 0;
        }
        .fs-menu-btn.active .fs-menu-bar:nth-child(3) {
            transform: rotate(-45deg) translate(4px, -4px);
            width: 20px;
        }
        .fs-menu-label {
            font-size: 0.85em;
            text-transform: uppercase;
        }
        .fs-dropdown {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 260px;
            background: linear-gradient(180deg, #1A1A1A 0%, #141414 100%);
            border: 1px solid #2A2824;
            border-radius: 16px;
            padding: 8px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,162,39,0.1);
        }
        .fs-dropdown.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .fs-dropdown-header {
            padding: 16px;
            border-bottom: 1px solid #2A2824;
            margin-bottom: 8px;
        }
        .fs-dropdown-user {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .fs-dropdown-name {
            font-family: 'Cinzel', serif;
            font-size: 1em;
            color: #F8F6F0;
            font-weight: 600;
        }
        .fs-dropdown-role {
            display: inline-block;
            width: fit-content;
            padding: 3px 10px;
            background: rgba(201,162,39,0.15);
            color: #C9A227;
            border-radius: 6px;
            font-size: 0.75em;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
        }
        .fs-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            color: #A8A498;
            text-decoration: none;
            font-size: 0.9em;
            font-weight: 500;
            transition: all 0.2s ease;
            border-radius: 10px;
            margin: 2px 0;
        }
        .fs-menu-item:hover {
            background: rgba(201,162,39,0.1);
            color: #F8F6F0;
        }
        .fs-menu-item.active {
            background: rgba(201,162,39,0.15);
            color: #C9A227;
            font-weight: 600;
        }
        .fs-menu-icon {
            font-size: 1.2em;
            width: 24px;
            text-align: center;
        }
        .fs-menu-divider {
            height: 1px;
            background: #2A2824;
            margin: 8px 12px;
        }
        .fs-dropdown-footer {
            padding: 8px;
            border-top: 1px solid #2A2824;
            margin-top: 8px;
        }
        .fs-logout-btn {
            width: 100%;
            padding: 10px;
            background: transparent;
            border: 1px solid #2A2824;
            border-radius: 10px;
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
        .fs-logout-btn:hover {
            border-color: #EF5350;
            color: #EF5350;
            background: rgba(239,83,80,0.08);
        }
        .fs-dropdown-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: none;
        }
        .fs-dropdown-overlay.open {
            display: block;
        }
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
    </style>
    `;

    function integrateNav() {
        // Inject CSS
        document.head.insertAdjacentHTML('beforeend', navCSS);

        // Find user-info or header
        const userInfo = document.querySelector('.user-info');
        const header = document.querySelector('.header');
        
        if (userInfo) {
            const logoutBtn = userInfo.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.insertAdjacentHTML('beforebegin', createNav());
                logoutBtn.style.display = 'none';
            } else {
                userInfo.insertAdjacentHTML('afterbegin', createNav());
            }
        } else if (header) {
            header.insertAdjacentHTML('beforeend', createNav());
        }

        // Add overlay
        document.body.insertAdjacentHTML('beforeend', '<div class="fs-dropdown-overlay" id="fsOverlay" onclick="toggleFsMenu()"></div>');

        // Highlight current page
        const activeItem = document.querySelector(`.fs-menu-item[data-page="${currentPage}"]`);
        if (activeItem) activeItem.classList.add('active');

        // Check access (skip for certain pages)
        const skipCheck = ['dashboard', 'team', 'privacy', 'contact', 'index'];
        if (!skipCheck.includes(currentPage) && !canAccess(currentPage)) {
            document.body.innerHTML = `
                <div class="fs-access-denied">
                    <h2>🚫 Access Denied</h2>
                    <p>You don't have permission to view this page.</p>
                    <p>Role: <strong>${userRole}</strong></p>
                    <a href="dashboard.html">Go to Dashboard</a>
                </div>
            `;
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', integrateNav);
    } else {
        integrateNav();
    }

    // Global functions
    window.toggleFsMenu = function() {
        const dropdown = document.getElementById('fsDropdown');
        const overlay = document.getElementById('fsOverlay');
        const btn = document.querySelector('.fs-menu-btn');
        if (dropdown) dropdown.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open');
        if (btn) btn.classList.toggle('active');
    };

    window.fsLogout = function() {
        sessionStorage.clear();
        window.location.href = 'signin.html';
    };

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const dropdown = document.getElementById('fsDropdown');
            if (dropdown && dropdown.classList.contains('open')) toggleFsMenu();
        }
    });
})();
