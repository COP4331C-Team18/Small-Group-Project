(function () {
    const STORAGE_KEY = 'nebulist-theme';
    const LIGHT_CLASS = 'light-mode';

    /* Apply saved preference */
    function applySaved() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light') {
            document.documentElement.classList.add(LIGHT_CLASS);
            document.body.classList.add(LIGHT_CLASS);
        }
    }

    /* Toggle between light & dark */
    function toggle() {
        const isLight = document.body.classList.toggle(LIGHT_CLASS);
        document.documentElement.classList.toggle(LIGHT_CLASS, isLight);
        localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
        updateButtons(isLight);
    }

    /* Keep all toggle buttons in syn */
    function updateButtons(isLight) {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            const icon = btn.querySelector('.toggle-icon');
            const label = btn.querySelector('.toggle-label');
            if (icon)  icon.textContent = isLight ? '☀️' : '🌙';
            if (label) label.textContent = isLight ? 'LIGHT' : 'DARK';
        });
    }

    // Inject a toggle button into .dashboard-nav
    function injectToggle() {
        const nav = document.querySelector('.dashboard-nav');
        if (!nav) return; // not a dashboard page — skip

        // Avoid double-injection
        if (nav.querySelector('.theme-toggle')) return;

        const isLight = document.body.classList.contains(LIGHT_CLASS);

        const btn = document.createElement('button');
        btn.className = 'theme-toggle nav-link';
        btn.setAttribute('aria-label', 'Toggle light/dark mode');
        btn.innerHTML = `
            <span class="toggle-icon">${isLight ? '☀️' : '🌙'}</span>
            <span class="toggle-label">${isLight ? 'LIGHT' : 'DARK'}</span>
        `;
        btn.addEventListener('click', toggle);

        // Insert before the logout button so it sits at the right of the nav
        const logout = nav.querySelector('.logout');
        if (logout) {
            nav.insertBefore(btn, logout);
        } else {
            nav.appendChild(btn);
        }
    }

    applySaved();

    document.addEventListener('DOMContentLoaded', () => {
        applySaved();       // re-apply in case body wasn't ready above
        injectToggle();     // add the button to the nav
    });
})();
