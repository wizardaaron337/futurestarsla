/**
 * Future Stars LA - Dropdown Navigation
 * Add to any page: <script src="nav-dropdown.js"></script>
 */

(function() {
    const navHTML = `
    <div class="fs-nav-container">
        <button class="fs-nav-toggle" onclick="toggleNav()" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <nav class="fs-nav-dropdown" id="fsNavMenu">
            <div class="fs-nav-header">
                <span class="fs-nav-title">Future Stars</span>
                <button class="fs-nav-close" onclick="toggleNav()">&times;</button>
            </div>
            <a href="dashboard.html" class="fs-nav-link" data-page="dashboard">
                <span class="fs-nav-icon">📊</span>
                <span>Dashboard</span>
            </a>
            <a href="tournaments.html" class="fs-nav-link" data-page="tournaments">
                <span class="fs-nav-icon">🏆</span>
                <span>Tournaments</span>
            </a>
            <a href="inventory.html" class="fs-nav-link" data-page="inventory">
                <span class="fs-nav-icon">📦</span>
                <span>Inventory</span>
            </a>
            <a href="trips.html" class="fs-nav-link" data-page="trips">
                <span class="fs-nav-icon">🚐</span>
                <span>Trips</span>
            </a>
            <a href="team.html" class="fs-nav-link" data-page="team">
                <span class="fs-nav-icon">👥</span>
                <span>Team</span>
            </a>
            <a href="jersey-gallery.html" class="fs-nav-link" data-page="jersey-gallery">
                <span class="fs-nav-icon">👕</span>
                <span>Jersey Gallery</span>
            </a>
            <a href="trip-planner.html" class="fs-nav-link" data-page="trip-planner">
                <span class="fs-nav-icon">📝</span>
                <span>Trip Planner</span>
            </a>
            <div class="fs-nav-divider"></div>
            <a href="privacy.html" class="fs-nav-link" data-page="privacy">
                <span class="fs-nav-icon">🔒</span>
                <span>Privacy</span>
            </a>
            <a href="contact.html" class="fs-nav-link" data-page="contact">
                <span class="fs-nav-icon">📧</span>
                <span>Contact</span>
            </a>
        </nav>
        <div class="fs-nav-overlay" id="fsNavOverlay" onclick="toggleNav()"></div>
    </div>
    `;

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
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Highlight current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const activeLink = document.querySelector(`.fs-nav-link[data-page="${currentPage}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Global toggle function
    window.toggleNav = function() {
        const menu = document.getElementById('fsNavMenu');
        const overlay = document.getElementById('fsNavOverlay');
        const toggle = document.querySelector('.fs-nav-toggle');
        
        menu.classList.toggle('open');
        overlay.classList.toggle('open');
        toggle.classList.toggle('active');
    };

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const menu = document.getElementById('fsNavMenu');
            if (menu.classList.contains('open')) toggleNav();
        }
    });
})();
