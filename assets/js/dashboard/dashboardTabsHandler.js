// dashboardTabsHandler.js
export function initTabs() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    const panes = document.querySelectorAll('.dashboard-pane');

    if (!tabs.length || !panes.length) return;

    // --- Masquer toutes les panes sauf la première ---
    panes.forEach((p, i) => {
        if (i === 0) {
            p.classList.add('active');
            p.style.display = 'flex';
        } else {
            p.classList.remove('active');
            p.style.display = 'none';
        }
    });

    tabs.forEach((tab, i) => {
        if (i === 0) tab.classList.add('active');
        else tab.classList.remove('active');

        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            tab.classList.add('active');
            const pane = document.getElementById('tab-' + tab.dataset.tab);
            if (pane) {
                pane.classList.add('active');
                pane.style.display = 'flex';
            }
        });
    });
}