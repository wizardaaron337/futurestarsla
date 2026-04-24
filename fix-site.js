/**
 * Future Stars Site Polish - Fix navigation, buttons, and styling
 */

(function() {
    // Remove old inline nav scripts that conflict
    const oldNavScripts = document.querySelectorAll('script');
    oldNavScripts.forEach(script => {
        if (script.textContent.includes('main-nav') && script.textContent.includes('fs_role')) {
            script.remove();
        }
    });

    // Remove old nav elements
    const oldNavs = document.querySelectorAll('#main-nav');
    oldNavs.forEach(nav => nav.remove());

    // Ensure header has user-info for nav integration
    const header = document.querySelector('.header');
    if (header) {
        let userInfo = header.querySelector('.user-info');
        if (!userInfo) {
            userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = '<span class="user-name" id="user-name"></span>';
            header.appendChild(userInfo);
        }
        
        // Update user name display
        const userName = sessionStorage.getItem('fs_name');
        const nameDisplay = document.getElementById('user-name');
        if (nameDisplay && userName) {
            nameDisplay.textContent = userName;
        }
    }

    // Fix any broken links that point to non-existent pages
    const validPages = ['dashboard', 'tournaments', 'inventory', 'trips', 'team', 
                       'jersey-gallery', 'trip-planner', 'sortly-upload', 
                       'privacy', 'contact', 'signin'];
    
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith('.html')) {
            const page = href.replace('.html', '');
            if (!validPages.includes(page) && !href.startsWith('http')) {
                console.warn('Broken link found:', href);
                // Redirect to dashboard if broken
                link.setAttribute('href', 'dashboard.html');
            }
        }
    });

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Fix mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
    }

    console.log('✅ Site polish applied');
})();
