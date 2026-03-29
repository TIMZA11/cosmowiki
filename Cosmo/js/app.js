/**
 * CosmoWiki — Логика главной страницы
 * Генерация карточек категорий
 */

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    FactOfDay.init();
});

/**
 * Отрисовка карточек категорий в сетке
 */
function renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES.map(cat => `
        <a href="category.html?id=${cat.id}" class="category-card">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
            <span class="category-count">${cat.objects.length} ${pluralize(cat.objects.length, 'объект', 'объекта', 'объектов')}</span>
        </a>
    `).join('');
}

/**
 * Склонение существительных по числу (русский язык)
 * @param {number} n — число
 * @param {string} one — 1 объект
 * @param {string} few — 2 объекта
 * @param {string} many — 5 объектов
 */
function pluralize(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
}
