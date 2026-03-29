/**
 * CosmoWiki — переключение тёмной/светлой темы
 */
(function () {
    const STORAGE_KEY = 'cosmo-theme';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }

    // Применяем тему сразу, до отрисовки страницы
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    applyTheme(saved);

    // Вешаем обработчик после загрузки DOM
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.addEventListener('click', toggleTheme);
        // Обновляем иконку после DOMContentLoaded
        applyTheme(localStorage.getItem(STORAGE_KEY) || 'dark');
    });
})();
