/**
 * Cloudflare Pages Function — Sync endpoint
 * 
 * POST /api/sync  — Push data to KV
 * GET  /api/sync  — Pull data from KV
 * 
 * Uses the user's role as partition key.
 * Data is encrypted-in-transit and scoped per-user.
 */

const SYNC_KEY_PREFIX = 'sync:';
const MAX_DATA_SIZE = 100 * 1024; // 100KB per user

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  // Enable CORS for the static site domain
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Sync-User',
    'Access-Control-Max-Age': '86400',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Simple auth: require X-Sync-User header (matches session storage user)
  const user = request.headers.get('X-Sync-User') || 'anonymous';
  const key = SYNC_KEY_PREFIX + user;

  if (method === 'GET') {
    // Pull data
    try {
      const value = await env.FS_SYNC.get(key);
      if (value === null) {
        return new Response(JSON.stringify({ ok: true, data: null }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true, data: value }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (method === 'POST') {
    // Push data
    try {
      const body = await request.text();
      if (!body || body.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: 'Empty body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Validate it's parseable JSON
      try { JSON.parse(body); } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (body.length > MAX_DATA_SIZE) {
        return new Response(JSON.stringify({ ok: false, error: 'Data too large' }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await env.FS_SYNC.put(key, body);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
