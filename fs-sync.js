/**
 * Future Stars LA — Cross-device Sync
 * Syncs localStorage data to Cloudflare KV so data follows you across devices.
 * 
 * How it works:
 * - On page load: pulls the latest cloud data and merges it with local
 * - On data change: debounced push to cloud
 * - Uses fs_auth/fs_role as the per-user key
 * - Silent: no UI, no errors shown to user
 */

(function() {
  'use strict';

  const SYNC_API = '/api/sync';
  const SYNC_INTERVAL = 30 * 1000; // auto-sync every 30s
  const PUSH_DEBOUNCE = 2000;      // wait 2s after change before pushing
  const MERGE_KEYS = [
    'fs_trips',
    'fs_tourney_schedule',
    'fs_trip_tracker_data',
    'fs_inventory',
    'fs_team_members',
    'fs_pack_lists',
    'fs_departments',
    'fs_contacts'
  ];

  let pendingPush = null;
  let lastSyncTime = 0;
  let syncUser = null;
  let syncEnabled = false;

  function getSyncUser() {
    // Use the logged-in user name
    return sessionStorage.getItem('fs_name') || sessionStorage.getItem('fs_auth') || null;
  }

  function getSyncPayload() {
    var payload = {};
    for (var i = 0; i < MERGE_KEYS.length; i++) {
      var key = MERGE_KEYS[i];
      var val = localStorage.getItem(key);
      if (val) payload[key] = val;
    }
    return payload;
  }

  function pushToCloud() {
    if (!syncEnabled || !syncUser) return;
    pendingPush = null;

    var payload = getSyncPayload();
    if (Object.keys(payload).length === 0) return;

    fetch(SYNC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-User': syncUser,
      },
      body: JSON.stringify(payload),
    }).then(function(r) {
      if (!r.ok) console.warn('[Sync] Push failed:', r.status);
    }).catch(function() {
      // Silently fail — don't disrupt the user
    });
  }

  function schedulePush() {
    if (!syncEnabled || !syncUser) return;
    if (pendingPush) clearTimeout(pendingPush);
    pendingPush = setTimeout(pushToCloud, PUSH_DEBOUNCE);
  }

  function pullFromCloud() {
    if (!syncEnabled || !syncUser) return;

    fetch(SYNC_API, {
      method: 'GET',
      headers: { 'X-Sync-User': syncUser },
    }).then(function(r) {
      if (!r.ok) return;
      return r.json();
    }).then(function(result) {
      if (!result || !result.ok || !result.data) return;

      try {
        var cloudData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        var merged = 0;

        for (var i = 0; i < MERGE_KEYS.length; i++) {
          var key = MERGE_KEYS[i];
          if (cloudData[key]) {
            var existing = localStorage.getItem(key);
            // Merge: use whichever was saved more recently (cloud wins ties)
            // Simple heuristic: if we don't have it, take cloud's. Otherwise skip.
            // A full merge would check timestamps, but this is good enough.
            if (!existing || existing === 'null' || existing === '[]') {
              localStorage.setItem(key, cloudData[key]);
              merged++;
            }
          }
        }

        lastSyncTime = Date.now();

        // If we merged new data, trigger a page refresh of dynamic content
        if (merged > 0) {
          // Dispatch a custom event so page-specific JS can refresh
          window.dispatchEvent(new CustomEvent('fs-sync-merged', { detail: { count: merged } }));
        }
      } catch(e) {
        // Ignore parse errors
      }
    }).catch(function() {
      // Silently fail
    });
  }

  function startSyncWatcher() {
    // Intercept localStorage.setItem to trigger push
    var origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      origSetItem.call(localStorage, key, value);
      if (MERGE_KEYS.indexOf(key) !== -1) {
        schedulePush();
      }
    };

    // Also watch removeItem
    var origRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      origRemoveItem.call(localStorage, key);
      if (MERGE_KEYS.indexOf(key) !== -1) {
        schedulePush();
      }
    };
  }

  // Initialize
  function init() {
    syncUser = getSyncUser();
    if (!syncUser) return;

    syncEnabled = true;

    startSyncWatcher();

    // Pull from cloud on first load
    pullFromCloud();

    // Periodic auto-sync
    setInterval(function() {
      syncUser = getSyncUser();
      if (syncUser) {
        pullFromCloud();
      }
    }, SYNC_INTERVAL);
  }

  // Run after page is ready (short delay for other scripts to set up auth)
  if (document.readyState === 'complete') {
    setTimeout(init, 500);
  } else {
    window.addEventListener('load', function() { setTimeout(init, 500); });
  }
})();
