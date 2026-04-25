/**
 * Future Stars LA - Supabase Client
 * Lightweight fetch wrapper for Supabase REST API
 * Exposes: FS.db.inventory, FS.db.crewTrips, FS.db.tournaments
 */

const FS = { db: {} };

// Config
const SUPABASE_URL = 'https://ughyvvjmoxqgvkuvrswq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaHl2dmptb3hxZ3ZrdXZyc3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDM1ODksImV4cCI6MjA5MjcxOTU4OX0.MgrQhlAMRCLxJZSjZrjecjILtrAYJP3bAID9LVVlNpU';

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
};

async function query(table, opts = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${opts.select || '*'}`;
    
    if (opts.eq) {
        Object.entries(opts.eq).forEach(([k, v]) => {
            url += `&${k}=eq.${encodeURIComponent(v)}`;
        });
    }
    
    if (opts.order) {
        url += `&order=${encodeURIComponent(opts.order)}`;
    }
    
    if (opts.limit) {
        url += `&limit=${opts.limit}`;
    }

    try {
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
        return await res.json();
    } catch (e) {
        console.error(`FS.db: Error fetching ${table}:`, e);
        return opts.fallback || [];
    }
}

// Inventory helper
FS.db.inventory = {
    getAll() {
        return query('inventory', { order: 'name' });
    },
    bySport(sport) {
        return query('inventory', { eq: { sport }, order: 'name' });
    },
    lowStock(threshold = 10) {
        return query('inventory', { order: 'name' }).then(items => 
            items.filter(i => i.total < threshold && i.total > 0)
        );
    }
};

// Crew trips helper
FS.db.crewTrips = {
    getAll() {
        return query('crew_trips', { order: 'name' });
    },
    byCrew(crewName) {
        return query('crew_trips', { order: 'month' }).then(trips =>
            trips.filter(t => (t.crew || '').toLowerCase().includes(crewName.toLowerCase()))
        );
    },
    upcoming() {
        return query('crew_trips', { order: 'month' }).then(trips =>
            trips.filter(t => t.status && !['DONE', 'COMPLETED'].includes(t.status.toUpperCase()))
        );
    }
};

// Tournaments helper
FS.db.tournaments = {
    getAll() {
        return query('tournaments', { order: 'name' });
    },
    withSites() {
        return query('tournaments', { order: 'name' }).then(t => t.filter(t => t.site));
    }
};
