(function () {
    const STORAGE_KEY = 'nebulist-theme';
    const LIGHT_CLASS = 'light-mode';

    /* ── Apply saved preference as early as possible (before paint) ── */
    function applySaved() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light') {
            document.documentElement.classList.add(LIGHT_CLASS);
            document.body.classList.add(LIGHT_CLASS);
        }
    }

    /* ── Sync all .theme-toggle buttons to the current state ── */
    function updateButtons(isLight) {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            const icon  = btn.querySelector('.toggle-icon');
            const label = btn.querySelector('.toggle-label');
            if (icon)  icon.textContent  = isLight ? '☀️' : '🌙';
            if (label) label.textContent = isLight ? 'LIGHT' : 'DARK';
        });
    }

    /* ── Public toggle — call this from your button's onclick ── */
    window.toggleTheme = function () {
        const isLight = document.body.classList.toggle(LIGHT_CLASS);
        document.documentElement.classList.toggle(LIGHT_CLASS, isLight);
        localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
        updateButtons(isLight);
    };

    /* ── On load: restore saved theme and sync any buttons already in the DOM ── */
    applySaved();

    document.addEventListener('DOMContentLoaded', () => {
        applySaved(); // re-apply in case <body> wasn't ready above
        updateButtons(document.body.classList.contains(LIGHT_CLASS));
    });
})();