/**
 * Future Stars LA - Shared Utilities
 * Loading spinners, error handling, auto-refresh, dark mode
 */

const FSUtils = {
    // Show a loading spinner in an element
    showSpinner(container, message = 'Loading...') {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = `
            <div class="fs-spinner-wrap">
                <div class="fs-spinner"></div>
                <span class="fs-spinner-text">${message}</span>
            </div>
        `;
    },

    // Show error message
    showError(container, message, retryCallback = null) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = `
            <div class="fs-error-wrap">
                <div class="fs-error-icon">⚠️</div>
                <div class="fs-error-text">${message}</div>
                ${retryCallback ? `<button class="fs-error-retry" onclick="(${retryCallback})()">Try Again</button>` : ''}
            </div>
        `;
    },

    // Auto-refresh data at interval
    autoRefresh(callback, intervalMs = 30000, key = 'default') {
        // Clear existing interval for this key
        if (FSUtils._intervals && FSUtils._intervals[key]) {
            clearInterval(FSUtils._intervals[key]);
        }
        if (!FSUtils._intervals) FSUtils._intervals = {};
        
        // Run immediately
        callback();
        
        // Set interval
        FSUtils._intervals[key] = setInterval(callback, intervalMs);
        
        // Cleanup on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(FSUtils._intervals[key]);
            } else {
                callback();
                FSUtils._intervals[key] = setInterval(callback, intervalMs);
            }
        });
    },

    // Dark mode toggle
    initDarkMode() {
        const saved = localStorage.getItem('fs_dark_mode');
        if (saved === 'true') document.body.classList.add('fs-dark');
        
        // Add toggle button if container exists
        const container = document.getElementById('dark-mode-toggle');
        if (container) {
            container.innerHTML = `
                <button class="fs-dark-toggle" onclick="FSUtils.toggleDarkMode()" title="Toggle dark mode">
                    ${saved === 'true' ? '☀️' : '🌙'}
                </button>
            `;
        }
    },

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('fs-dark');
        localStorage.setItem('fs_dark_mode', isDark);
        
        // Update toggle button if exists
        const btn = document.querySelector('.fs-dark-toggle');
        if (btn) btn.textContent = isDark ? '☀️' : '🌙';
    }
};

// Make available globally
window.FSUtils = FSUtils;

// Auto-init dark mode
document.addEventListener('DOMContentLoaded', () => {
    FSUtils.initDarkMode();
});
