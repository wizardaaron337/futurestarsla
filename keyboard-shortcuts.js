// Global Keyboard Shortcuts for Future Stars
(function() {
    const shortcuts = {
        '/': () => focusSearch(),
        'g d': () => goTo('dashboard.html'),
        'g t': () => goTo('tournaments.html'),
        'g i': () => goTo('inventory.html'),
        'g r': () => goTo('trips.html'),
        'g p': () => goTo('pj-planner.html'),
        'g k': () => goTo('trip-tracker.html'),
        'g m': () => goTo('team.html'),
        'Escape': () => closeModals(),
        '?': () => showShortcutsHelp()
    };
    
    let keyBuffer = '';
    let bufferTimeout = null;
    
    document.addEventListener('keydown', function(e) {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            if (e.key === 'Escape') {
                e.target.blur();
                closeModals();
            }
            return;
        }
        
        const key = e.key;
        
        // Handle Escape
        if (key === 'Escape') {
            closeModals();
            return;
        }
        
        // Handle single-key shortcuts
        if (key === '/') {
            e.preventDefault();
            focusSearch();
            return;
        }
        
        if (key === '?') {
            e.preventDefault();
            showShortcutsHelp();
            return;
        }
        
        // Handle multi-key shortcuts (g + letter)
        if (key === 'g') {
            keyBuffer = 'g';
            clearTimeout(bufferTimeout);
            bufferTimeout = setTimeout(() => { keyBuffer = ''; }, 800);
            return;
        }
        
        if (keyBuffer === 'g') {
            const combo = 'g ' + key;
            if (shortcuts[combo]) {
                e.preventDefault();
                shortcuts[combo]();
            }
            keyBuffer = '';
            clearTimeout(bufferTimeout);
            return;
        }
    });
    
    function focusSearch() {
        const searchInputs = document.querySelectorAll('input[type="text"], input.search-box');
        for (const input of searchInputs) {
            if (input.placeholder && input.placeholder.toLowerCase().includes('search')) {
                input.focus();
                input.select();
                return;
            }
        }
        // Fallback: focus first text input
        const firstSearch = document.querySelector('input[type="text"]');
        if (firstSearch) {
            firstSearch.focus();
            firstSearch.select();
        }
    }
    
    function goTo(page) {
        window.location.href = page;
    }
    
    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
    
    function showShortcutsHelp() {
        // Remove existing help
        const existing = document.getElementById('shortcuts-help');
        if (existing) {
            existing.remove();
            return;
        }
        
        const help = document.createElement('div');
        help.id = 'shortcuts-help';
        help.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--black-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 30px;
            max-width: 450px;
            width: 90%;
            z-index: 10001;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            font-family: 'Inter', sans-serif;
        `;
        help.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="font-family:'Cinzel',serif;color:var(--gold);margin:0;">Keyboard Shortcuts</h3>
                <button onclick="document.getElementById('shortcuts-help').remove()" style="background:none;border:none;color:var(--gray);font-size:1.5em;cursor:pointer;">&times;</button>
            </div>
            <div style="display:grid;gap:10px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Focus search</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">/</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Dashboard</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g d</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Tournaments</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g t</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Inventory</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g i</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Trips</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g r</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Planner</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g p</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Tracker</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g k</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Go to Team</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">g m</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--gray);">Close modals</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">Esc</kbd>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;">
                    <span style="color:var(--gray);">Show this help</span>
                    <kbd style="background:var(--black-light);padding:4px 10px;border-radius:6px;font-family:monospace;color:var(--gold);border:1px solid var(--border);">?</kbd>
                </div>
            </div>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);color:var(--gray-dark);font-size:0.8em;text-align:center;">
                Press <kbd style="background:var(--black-light);padding:2px 6px;border-radius:4px;">?</kbd> anytime to show this dialog
            </div>
        `;
        document.body.appendChild(help);
        
        // Close on backdrop click
        help.addEventListener('click', function(e) {
            if (e.target === help) help.remove();
        });
    }
})();
