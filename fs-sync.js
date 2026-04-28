/**
 * Future Stars LA — Cross-device Cloud Sync v2
 * 
 * Merges arrays by ID so data is never lost — all devices see the same data.
 * Uses a shared team key so all users share the same trip/schedule data.
 * Cloud is the merge base — local and cloud arrays get merged with dedup.
 */

(function() {
  'use strict';

  const SYNC_API = '/api/sync';
  const SYNC_INTERVAL = 30 * 1000;  // auto-sync every 30s
  const PUSH_DEBOUNCE = 3000;       // wait 3s after last change before pushing
  var PULL_INTERVAL_ID = null;

  // All keys sync to the same team bucket
  var SYNC_KEYS = [
    'fs_trips',
    'fs_tourney_schedule',
    'fs_trip_tracker_data',
    'fs_inventory',
    'fs_team_members',
    'fs_pack_lists',
    'fs_departments',
    'fs_contacts'
  ];

  var pendingPush = null;
  var syncUser = null;
  var syncEnabled = false;
  var syncInProgress = false;

  function getSyncUser() {
    return sessionStorage.getItem('fs_name') || sessionStorage.getItem('fs_auth') || null;
  }

  function getSyncPayload() {
    var payload = {};
    for (var i = 0; i < SYNC_KEYS.length; i++) {
      var key = SYNC_KEYS[i];
      var val = localStorage.getItem(key);
      if (val) payload[key] = val;
    }
    return payload;
  }

  /**
   * Merge two JSON arrays by a unique ID field.
   * Items in `cloud` take priority. Items only in `local` are added.
   * Returns the merged array as a JSON string.
   */
  function mergeById(localStr, cloudStr) {
    if (!cloudStr || cloudStr === 'null') return localStr;
    if (!localStr || localStr === 'null') return cloudStr;

    try {
      var local = JSON.parse(localStr);
      var cloud = JSON.parse(cloudStr);
      if (!Array.isArray(local)) local = [];
      if (!Array.isArray(cloud)) cloud = [];
    } catch(e) {
      return cloudStr || localStr;
    }

    // Build a map keyed by id
    var merged = {};
    // Add cloud items first (they win on conflicts)
    for (var i = 0; i < cloud.length; i++) {
      var item = cloud[i];
      merged[item.id || 'k' + i] = item;
    }
    // Add local items that don't exist in cloud
    for (var j = 0; j < local.length; j++) {
      var lItem = local[j];
      var lid = lItem.id || 'k' + j;
      if (!merged[lid]) merged[lid] = lItem;
    }

    return JSON.stringify(Object.values(merged));
  }

  function pushToCloud() {
    if (!syncEnabled || !syncUser) return;
    if (syncInProgress) { schedulePush(); return; }
    pendingPush = null;

    var payload = getSyncPayload();
    if (Object.keys(payload).length === 0) return;

    fetch(SYNC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-User': 'team',
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

  function pullFromCloud() {
    if (!syncEnabled || !syncUser) return;
    if (syncInProgress) return;
    syncInProgress = true;

    fetch(SYNC_API, {
      method: 'GET',
      headers: { 'X-Sync-User': 'team' },
    }).then(function(r) {
      if (!r.ok) { syncInProgress = false; return; }
      return r.json();
    }).then(function(result) {
      syncInProgress = false;
      if (!result || !result.ok || !result.data) return;

      try {
        var cloudData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        if (!cloudData || typeof cloudData !== 'object') return;

        var changedKeys = [];

        for (var i = 0; i < SYNC_KEYS.length; i++) {
          var key = SYNC_KEYS[i];
          var cloudVal = cloudData[key];
          if (!cloudVal) continue;

          var localVal = localStorage.getItem(key);
          // Merge: combine arrays by id, cloud items win on duplicates
          var merged = mergeById(localVal, cloudVal);
          if (merged !== localVal) {
            localStorage.setItem(key, merged);
            changedKeys.push(key);
          }
        }

        if (changedKeys.length > 0) {
          // Trigger polling listeners on the page
          window.dispatchEvent(new CustomEvent('fs-sync-merged', { detail: { keys: changedKeys } }));
        }
      } catch(e) {}
    }).catch(function() {
      syncInProgress = false;
    });
  }

  function startSyncWatcher() {
    var origSetItem = localStorage.setItem;
    var self = this;
    localStorage.setItem = function(key, value) {
      origSetItem.call(localStorage, key, value);
      if (SYNC_KEYS.indexOf(key) !== -1) {
        schedulePush();
      }
    };

    var origRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      origRemoveItem.call(localStorage, key);
      if (SYNC_KEYS.indexOf(key) !== -1) {
        schedulePush();
      }
    };
  }

  function init() {
    syncUser = getSyncUser();
    if (!syncUser) {
      // Retry once auth loads
      setTimeout(function() {
        syncUser = getSyncUser();
        if (!syncUser) return;
        syncEnabled = true;
        startSyncWatcher();
        pullFromCloud();
        PULL_INTERVAL_ID = setInterval(function() {
          syncUser = getSyncUser();
          if (syncUser) pullFromCloud();
        }, SYNC_INTERVAL);
      }, 2000);
      return;
    }

    syncEnabled = true;
    startSyncWatcher();

    // Pull from cloud on load — merge arrays
    pullFromCloud();

    PULL_INTERVAL_ID = setInterval(function() {
      syncUser = getSyncUser();
      if (syncUser) pullFromCloud();
    }, SYNC_INTERVAL);
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 500);
  } else {
    window.addEventListener('load', function() { setTimeout(init, 500); });
  }
})();
