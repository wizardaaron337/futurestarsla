// Dark/Light Mode Toggle for Future Stars
(function() {
    const STORAGE_KEY = 'fs_theme';
    const SYSTEM_KEY = 'fs_theme_system';

    function getTheme() {
        const system = window.matchMedia('(prefers-color-scheme: light)').matches;
        const saved = localStorage.getItem(STORAGE_KEY);
        const useSystem = localStorage.getItem(SYSTEM_KEY) === 'true';
        if (useSystem) return system ? 'light' : 'dark';
        return saved || 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
            toggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        localStorage.setItem(SYSTEM_KEY, 'false');
        applyTheme(next);
    }

    // Init
    applyTheme(getTheme());

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (localStorage.getItem(SYSTEM_KEY) === 'true') {
            applyTheme(e.matches ? 'light' : 'dark');
        }
    });

    // Expose globally
    window.toggleTheme = toggleTheme;
    window.getTheme = getTheme;
})();
