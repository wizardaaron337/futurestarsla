/**
 * Future Stars LA — Cross-device Cloud Sync
 * 
 * Syncs app data to Cloudflare KV so data follows you across devices AND users.
 * Trips/tournament data uses a shared key — everyone sees the same schedule.
 * Personal data (team, contacts) stays per-user.
 * 
 * How it works:
 * - On page load: pulls latest cloud data, overwrites local (cloud is truth)
 * - On data change: debounced push to cloud
 * - Cloud always wins on merge (simplest model for a team)
 */

(function() {
  'use strict';

  const SYNC_API = '/api/sync';
  const SYNC_INTERVAL = 30 * 1000;  // auto-sync every 30s
  const PUSH_DEBOUNCE = 2000;       // wait 2s after a change before pushing

  // Keys grouped by shared (team-wide) vs per-user
  const SHARED_KEYS = [
    'fs_trips',
    'fs_tourney_schedule',
    'fs_trip_tracker_data',
    'fs_inventory',
    'fs_pack_lists',
    'fs_departments'
  ];

  const USER_KEYS = [
    'fs_team_members',
    'fs_contacts'
  ];

  let pendingPush = null;
  let syncUser = null;
  let syncEnabled = false;

  function getSyncUser() {
    return sessionStorage.getItem('fs_name') || sessionStorage.getItem('fs_auth') || null;
  }

  function getSyncKey() {
    // Shared data lives under '_team' key, user data under the user's name
    return '_team';
  }

  function getSyncPayload() {
    var payload = {};
    var i, key, val;

    // Pack shared keys into the payload
    for (i = 0; i < SHARED_KEYS.length; i++) {
      key = SHARED_KEYS[i];
      val = localStorage.getItem(key);
      if (val) payload[key] = val;
    }

    // Also pack user-specific keys
    for (i = 0; i < USER_KEYS.length; i++) {
      key = USER_KEYS[i];
      val = localStorage.getItem(key);
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
        'X-Sync-User': getSyncKey(),
      },
      body: JSON.stringify(payload),
    }).then(function(r) {
      if (!r.ok) console.warn('[Sync] Push failed:', r.status);
    }).catch(function() {});
  }

  function schedulePush() {
    if (!syncEnabled || !syncUser) return;
    if (pendingPush) clearTimeout(pendingPush);
    pendingPush = setTimeout(pushToCloud, PUSH_DEBOUNCE);
  }

  function pullFromCloud(quiet) {
    if (!syncEnabled || !syncUser) return;

    fetch(SYNC_API, {
      method: 'GET',
      headers: { 'X-Sync-User': getSyncKey() },
    }).then(function(r) {
      if (!r.ok) return;
      return r.json();
    }).then(function(result) {
      if (!result || !result.ok || !result.data) return;

      try {
        var cloudData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        if (!cloudData || typeof cloudData !== 'object') return;

        var merged = 0;
        var allKeys = SHARED_KEYS.concat(USER_KEYS);

        for (var i = 0; i < allKeys.length; i++) {
          var key = allKeys[i];
          if (cloudData[key]) {
            localStorage.setItem(key, cloudData[key]);
            merged++;
          }
        }

        if (merged > 0) {
          // Dispatch custom event so page JS can refresh live content
          window.dispatchEvent(new CustomEvent('fs-sync-merged', { detail: { count: merged } }));
        }
      } catch(e) {}
    }).catch(function() {});
  }

  function startSyncWatcher() {
    var allKeys = SHARED_KEYS.concat(USER_KEYS);

    var origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      origSetItem.call(localStorage, key, value);
      if (allKeys.indexOf(key) !== -1) {
        schedulePush();
      }
    };

    var origRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      origRemoveItem.call(localStorage, key);
      if (allKeys.indexOf(key) !== -1) {
        schedulePush();
      }
    };
  }

  function init() {
    syncUser = getSyncUser();
    if (!syncUser) return;

    syncEnabled = true;

    startSyncWatcher();

    // Pull from cloud on first load — cloud always wins
    pullFromCloud();

    // Periodic pull to stay in sync
    setInterval(function() {
      syncUser = getSyncUser();
      if (syncUser) pullFromCloud(true);
    }, SYNC_INTERVAL);
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 500);
  } else {
    window.addEventListener('load', function() { setTimeout(init, 500); });
  }
})();
