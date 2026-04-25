/**
 * Supabase Configuration
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values
 * Find them at: https://supabase.com/dashboard → Project Settings → API
 */

const FS_SUPABASE = {
    projectId: 'ughyvvjmoxqgvkuvrswq',
    // URL: https://{projectId}.supabase.co
    url: 'https://ughyvvjmoxqgvkuvrswq.supabase.co',
    // anon key — get this from Supabase dashboard → Project Settings → API
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaHl2dmptb3hxZ3ZrdXZyc3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDM1ODksImV4cCI6MjA5MjcxOTU4OX0.MgrQhlAMRCLxJZSjZrjecjILtrAYJP3bAID9LVVlNpU'
    tables: {
        inventory: 'inventory',
        crewTrips: 'crew_trips',
        tournaments: 'tournaments'
    }
};
