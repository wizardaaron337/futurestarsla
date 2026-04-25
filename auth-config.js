/**
 * Future Stars LA - Authentication Configuration
 * Edit this file to change passwords, roles, and access permissions
 */

const AUTH_CONFIG = {
    // Username + password login (change these as needed)
    users: {
        'jr': { 
            name: 'JR', 
            role: 'owner', 
            password: 'jr26',
            emoji: '👑'
        },
        'lane': { 
            name: 'Lane', 
            role: 'owner', 
            password: 'lane26',
            emoji: '👑'
        },
        'pj': { 
            name: 'PJ', 
            role: 'logistics', 
            password: 'pj26',
            emoji: '🚐'
        },
        'caleb': { 
            name: 'Caleb', 
            role: 'tournament', 
            password: 'caleb26',
            emoji: '📞'
        },
        'marlon': { 
            name: 'Marlon', 
            role: 'inventory', 
            password: 'marlon26',
            emoji: '📦'
        },
        'backend': { 
            name: 'Backend', 
            role: 'inventory', 
            password: 'backend26',
            emoji: '⚙️'
        }
    },

    // Role-based page permissions
    roles: {
        owner: ['dashboard', 'tournaments', 'inventory-v2', 'trips', 'team', 'trip-planner', 'sortly-upload', 'tournament-scraper', 'pack-manager', 'pj-planner', 'trip-tracker', 'trip-plans', 'departments', 'privacy', 'contact'],
        logistics: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'tournament-scraper', 'pack-manager', 'pj-planner', 'trip-tracker', 'trip-plans', 'inventory-v2', 'privacy', 'contact'],
        tournament: ['dashboard', 'tournaments', 'trips', 'trip-planner', 'team', 'inventory-v2', 'tournament-scraper', 'pack-manager', 'trip-tracker', 'trip-plans', 'privacy', 'contact'],
        inventory: ['dashboard', 'inventory-v2', 'sortly-upload', 'pack-manager', 'team', 'trip-tracker', 'privacy', 'contact']
    },

    // Navigation items per role
    navItems: [
        { page: 'index', label: 'Home', icon: '🏠', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'tournaments', label: 'Tournaments', icon: '🏆', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'inventory-v2', label: 'Inventory', icon: '📦', roles: ['owner', 'inventory', 'tournament'] },
        { page: 'trips', label: 'Trips', icon: '🚐', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'team', label: 'Team', icon: '👥', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'trip-planner', label: 'Trip Planner', icon: '📝', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'tournament-scraper', label: 'Schedules', icon: '⏰', roles: ['owner', 'logistics', 'tournament'] },

        { page: 'pack-manager', label: 'Pack Manager', icon: '📦', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'pj-planner', label: 'PJ Trip Maker', icon: '🚐', roles: ['owner', 'logistics'] },
        { page: 'sortly-upload', label: 'Sortly Upload', icon: '📤', roles: ['owner', 'inventory'] },
        { page: 'trip-tracker', label: 'Trip Tracker', icon: '📍', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'trip-plans', label: 'Trip Plans', icon: '🗺️', roles: ['owner', 'logistics', 'tournament'] },
        { page: 'departments', label: 'Departments', icon: '🏢', roles: ['owner'] },
        { divider: true },
        { page: 'privacy', label: 'Privacy', icon: '🔒', roles: ['owner', 'logistics', 'tournament', 'inventory'] },
        { page: 'contact', label: 'Contact', icon: '📧', roles: ['owner', 'logistics', 'tournament', 'inventory'] }
    ],

    // Helper function to verify password
    verifyPassword: function(username, password) {
        const user = this.users[username];
        if (!user) return false;
        return user.password === password;
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
