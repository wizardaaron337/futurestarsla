/**
 * Future Stars LA - Authentication Configuration
 * Edit this file to change PINs, roles, and access permissions
 */

const AUTH_CONFIG = {
    // PIN codes for each user (change these as needed)
    users: {
        'jr': { 
            name: 'JR', 
            role: 'owner', 
            pin: '1959',
            emoji: '👑'
        },
        'lane': { 
            name: 'Lane', 
            role: 'owner', 
            pin: '1959',
            emoji: '👑'
        },
        'pj': { 
            name: 'PJ', 
            role: 'logistics', 
            pin: '1959',
            emoji: '🚐'
        },
        'caleb': { 
            name: 'Caleb', 
            role: 'tournament', 
            pin: '1959',
            emoji: '📞'
        },
        'marlon': { 
            name: 'Marlon', 
            role: 'inventory', 
            pin: '1959',
            emoji: '📦'
        },
        'backend': { 
            name: 'Backend', 
            role: 'inventory', 
            pin: '1959',
            emoji: '⚙️'
        }
    },

    // Role-based page permissions
    roles: {
        owner: ['tournaments', 'inventory-v2', 'trips', 'team', 'jersey-gallery', 'trip-planner', 'sortly-upload', 'privacy', 'contact'],
        logistics: ['tournaments', 'trips', 'trip-planner', 'team', 'privacy', 'contact', 'inventory-v2'],
        tournament: ['tournaments', 'trips', 'trip-planner', 'team', 'inventory-v2', 'jersey-gallery', 'privacy', 'contact'],
        inventory: ['inventory-v2', 'jersey-gallery', 'sortly-upload', 'team', 'privacy', 'contact']
    },

    // Navigation items per role
    navItems: [
        { page: 'index', label: 'Home', icon: '🏠', roles: ['owner', 'logistics', 'tournament', 'inventory'] }
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
    ],

    // Helper function to verify PIN
    verifyPin: function(username, pin) {
        const user = this.users[username];
        if (!user) return false;
        return user.pin === pin;
    },

    // Helper function to get user data
    getUser: function(username) {
        return this.users[username] || null;
    },

    // Helper function to check page access
    canAccess: function(role, page) {
        if (role === 'owner') return true;
        const allowed = this.roles[role] || this.roles.inventory;
        return allowed.includes(page);
    }
};

// Make available globally
window.AUTH_CONFIG = AUTH_CONFIG;
