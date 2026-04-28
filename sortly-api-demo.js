// Sortly API Demo — Simulates the real Sortly API response
// Connect this to the real API when you have credentials:
//   const SORTLY_API_KEY = 'your-key';
//   const SORTLY_BASE = 'https://api.sortly.com/v1';

const SORTLY_DEMO = (function() {
    'use strict';

    // ============================================================
    // GENERATE FAKE SORTLY DATA FROM INVENTORY
    // ============================================================
    function generateItems() {
        var items = [];
        var itemId = 10000;

        ['baseball', 'soccer'].forEach(function(sport) {
            var cat = sport === 'baseball' ? 'Baseball Jerseys' : 'Soccer Jerseys';
            var inv = INVENTORY[sport] || {};
            var names = Object.keys(inv);

            names.forEach(function(name) {
                var jersey = inv[name];
                var sizes = Object.keys(jersey.sizes);

                sizes.forEach(function(size) {
                    var qty = jersey.sizes[size];
                    if (qty <= 0) return;

                    // Each size variant is its own Sortly item
                    items.push({
                        id: itemId++,
                        name: name + ' (' + size + ')',
                        jerseyBase: name,
                        size: size,
                        sport: sport,
                        category: cat,
                        quantity: qty,
                        barcode: 'FS' + String(itemId).padStart(8, '0'),
                        sku: sport === 'baseball'
                            ? 'BB-' + name.replace(/[^A-Za-z0-9]/g, '') + '-' + size
                            : 'SC-' + name.replace(/[^A-Za-z0-9]/g, '') + '-' + size,
                        location: sport === 'baseball' ? 'Warehouse A - Shelf 3' : 'Warehouse B - Shelf 7',
                        image: jersey.img || '',
                        tags: [sport, 'jersey', size],
                        notes: 'Auto-imported from Future Stars inventory',
                        price: sport === 'baseball' ? 29.99 : 24.99,
                        cost: sport === 'baseball' ? 12.50 : 10.00,
                        createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
                        updatedAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
                        lowStockThreshold: 5
                    });
                });
            });
        });

        // Add some non-jersey items (gear, equipment)
        var gearTypes = [
            { name: 'Baseball Bat (Youth)', cat: 'Equipment', sport: 'baseball', qty: 25 },
            { name: 'Baseball Bat (Adult)', cat: 'Equipment', sport: 'baseball', qty: 12 },
            { name: 'Baseball Glove (Youth)', cat: 'Equipment', sport: 'baseball', qty: 30 },
            { name: 'Baseball Glove (Adult)', cat: 'Equipment', sport: 'baseball', qty: 15 },
            { name: 'Baseball Helmet', cat: 'Equipment', sport: 'baseball', qty: 40 },
            { name: 'Baseball Cleats (Youth)', cat: 'Footwear', sport: 'baseball', qty: 20 },
            { name: 'Baseball Cleats (Adult)', cat: 'Footwear', sport: 'baseball', qty: 10 },
            { name: 'Baseballs (Dozen)', cat: 'Supplies', sport: 'baseball', qty: 48 },
            { name: 'Soccer Ball Size 4', cat: 'Equipment', sport: 'soccer', qty: 35 },
            { name: 'Soccer Ball Size 5', cat: 'Equipment', sport: 'soccer', qty: 28 },
            { name: 'Shin Guards (Youth)', cat: 'Equipment', sport: 'soccer', qty: 40 },
            { name: 'Shin Guards (Adult)', cat: 'Equipment', sport: 'soccer', qty: 22 },
            { name: 'Soccer Cleats (Youth)', cat: 'Footwear', sport: 'soccer', qty: 25 },
            { name: 'Soccer Cleats (Adult)', cat: 'Footwear', sport: 'soccer', qty: 14 },
            { name: 'Goalie Gloves', cat: 'Equipment', sport: 'soccer', qty: 12 },
            { name: 'Water Cooler 5gal', cat: 'Supplies', sport: 'all', qty: 8 },
            { name: 'Team Cooler (Large)', cat: 'Supplies', sport: 'all', qty: 4 },
            { name: 'First Aid Kit', cat: 'Safety', sport: 'all', qty: 6 },
            { name: 'Cones (Set of 10)', cat: 'Training', sport: 'soccer', qty: 15 },
            { name: 'Practice Nets', cat: 'Equipment', sport: 'baseball', qty: 3 },
        ];

        gearTypes.forEach(function(g) {
            var skuPrefix = g.sport === 'all' ? 'GN' : (g.sport === 'baseball' ? 'BB' : 'SC');
            items.push({
                id: itemId++,
                name: g.name,
                jerseyBase: null,
                size: null,
                sport: g.sport,
                category: g.cat,
                quantity: g.qty,
                barcode: 'FS' + String(itemId).padStart(8, '0'),
                sku: skuPrefix + '-' + g.name.replace(/[^A-Za-z0-9]/g, ''),
                location: g.sport === 'baseball' ? 'Warehouse A - Shelf 1' : (g.sport === 'soccer' ? 'Warehouse B - Shelf 2' : 'Warehouse C'),
                image: '',
                tags: [g.sport === 'all' ? 'general' : g.sport, 'gear'],
                notes: '',
                price: 0,
                cost: 0,
                createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
                lowStockThreshold: 3
            });
        });

        return items;
    }

    // ============================================================
    // SORTLY-API LIKE QUERY BUILDER
    // ============================================================
    var _allItems = null;

    function getItems(refresh) {
        if (!_allItems || refresh) {
            _allItems = generateItems();
        }
        return _allItems;
    }

    // ============================================================
    // PUBLIC API — Matches Sortly API shape
    // ============================================================

    return {
        // Get all inventory items (like GET /api/v1/items)
        getAllItems: function(opts) {
            opts = opts || {};
            var items = getItems(opts.refresh);
            var filtered = items;

            // Filter by sport
            if (opts.sport && opts.sport !== 'all') {
                filtered = filtered.filter(function(it) {
                    return it.sport === opts.sport || it.sport === 'all';
                });
            }

            // Filter by category
            if (opts.category) {
                filtered = filtered.filter(function(it) {
                    return it.category && it.category.toLowerCase().indexOf(opts.category.toLowerCase()) !== -1;
                });
            }

            // Search
            if (opts.search) {
                var q = opts.search.toLowerCase();
                filtered = filtered.filter(function(it) {
                    return it.name.toLowerCase().indexOf(q) !== -1
                        || (it.barcode && it.barcode.toLowerCase().indexOf(q) !== -1)
                        || (it.sku && it.sku.toLowerCase().indexOf(q) !== -1);
                });
            }

            // Paginate
            var page = opts.page || 1;
            var perPage = opts.perPage || filtered.length;
            var start = (page - 1) * perPage;
            var paged = filtered.slice(start, start + perPage);

            return {
                data: paged,
                meta: {
                    total: filtered.length,
                    page: page,
                    perPage: perPage,
                    totalPages: Math.ceil(filtered.length / perPage)
                }
            };
        },

        // Get a single item by ID (like GET /api/v1/items/:id)
        getItem: function(id) {
            var items = getItems();
            var found = items.filter(function(it) { return it.id === id; });
            return found.length > 0 ? { data: found[0] } : { error: 'Not found' };
        },

        // Search by barcode (like scanning)
        lookupBarcode: function(barcode) {
            var items = getItems();
            var found = items.filter(function(it) { return it.barcode === barcode; });
            return found.length > 0 ? { data: found[0] } : { error: 'Not found' };
        },

        // Update quantity (like PATCH /api/v1/items/:id)
        updateQuantity: function(id, newQty) {
            var items = getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    items[i].quantity = Math.max(0, newQty);
                    items[i].updatedAt = new Date().toISOString();
                    return { data: items[i] };
                }
            }
            return { error: 'Not found' };
        },

        // Get inventory summary by sport/category
        getSummary: function() {
            var items = getItems();
            var summary = {
                totalItems: items.length,
                totalQuantity: items.reduce(function(s, i) { return s + i.quantity; }, 0),
                byCategory: {},
                bySport: {},
                lowStock: [],
                totalValue: 0
            };

            items.forEach(function(it) {
                // By category
                var cat = it.category || 'Uncategorized';
                if (!summary.byCategory[cat]) summary.byCategory[cat] = { count: 0, qty: 0 };
                summary.byCategory[cat].count++;
                summary.byCategory[cat].qty += it.quantity;

                // By sport
                var sportKey = it.sport === 'all' ? 'General' : (it.sport === 'baseball' ? 'Baseball' : 'Soccer');
                if (!summary.bySport[sportKey]) summary.bySport[sportKey] = { count: 0, qty: 0 };
                summary.bySport[sportKey].count++;
                summary.bySport[sportKey].qty += it.quantity;

                // Low stock
                if (it.quantity <= it.lowStockThreshold) {
                    summary.lowStock.push({ name: it.name, qty: it.quantity, location: it.location });
                }

                summary.totalValue += it.price * it.quantity;
            });

            summary.totalValue = Math.round(summary.totalValue * 100) / 100;
            return summary;
        },

        // Refresh data (simulates re-fetch from server)
        refresh: function() {
            _allItems = null;
            return getItems(true);
        },

        // ============================================================
        // DEMO: Pre-built queries for common use cases
        // ============================================================
        demo: {
            // What you'd send to the packing system for a baseball tournament
            getBaseballPackList: function() {
                var result = this.getAllItems({ sport: 'baseball' });
                return {
                    totalUnique: result.data.length,
                    totalQty: result.data.reduce(function(s, it) { return s + it.quantity; }, 0),
                    items: result.data,
                    lastUpdated: new Date().toISOString()
                };
            },

            // What you'd send to the packing system for a soccer tournament
            getSoccerPackList: function() {
                var result = this.getAllItems({ sport: 'soccer' });
                return {
                    totalUnique: result.data.length,
                    totalQty: result.data.reduce(function(s, it) { return s + it.quantity; }, 0),
                    items: result.data,
                    lastUpdated: new Date().toISOString()
                };
            },

            // Full inventory for packing (jerseys + gear)
            getFullPackInventory: function() {
                var all = this.getAllItems().data;
                var jerseys = all.filter(function(it) { return it.category && it.category.indexOf('Jerseys') !== -1; });
                var gear = all.filter(function(it) { return !it.category || it.category.indexOf('Jerseys') === -1; });
                return {
                    jerseys: jerseys,
                    gear: gear,
                    total: all.length,
                    totalQty: all.reduce(function(s, it) { return s + it.quantity; }, 0),
                    lastUpdated: new Date().toISOString()
                };
            }
        }
    };
})();

// ============================================================
// EXPOSE GLOBALLY (same pattern as INVENTORY)
// ============================================================
window.SORTLY_API_DEMO = SORTLY_DEMO;

console.log('[Sortly Demo] Loaded ' + SORTLY_DEMO.getAllItems().meta.total + ' inventory items');
console.log('[Sortly Demo] Summary:', SORTLY_DEMO.getSummary());
