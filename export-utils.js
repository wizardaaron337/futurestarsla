// Export utilities for Future Stars
function exportToCSV(data, filename) {
    if (!data || data.length === 0) { showToast('No data to export'); return; }
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => {
        let val = row[h] || '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile(csv, filename, 'text/csv');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
}

function exportJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json');
}

function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Global access
window.exportToCSV = exportToCSV;
window.exportJSON = exportJSON;
