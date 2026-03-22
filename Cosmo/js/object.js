/**
 * CosmoWiki — Логика страницы космического объекта
 *
 * Приоритет источников:
 *   1. NASA — основной (фото, галерея)
 *   2. Wikipedia — дополнительный (описание, параметры инфобокса)
 *   3. Naked Science — дополнительный (описание категории)
 */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('category');
    const objectId = params.get('id');

    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) {
        showError('Категория не найдена');
        return;
    }

    const obj = category.objects.find(o => o.id === objectId);
    if (!obj) {
        showError('Объект не найден');
        return;
    }

    // Хлебные крошки
    document.getElementById('breadcrumb-category-link').href = `category.html?id=${categoryId}`;
    document.getElementById('breadcrumb-category-link').textContent = category.name;
    document.getElementById('breadcrumb-object').textContent = obj.name;

    // Бейдж категории
    document.getElementById('object-category-badge').textContent = `${category.icon} ${category.name}`;

    // Заголовок
    document.getElementById('object-title').textContent = obj.name;
    document.title = `CosmoWiki — ${obj.name}`;

    // Параллельная загрузка данных из всех источников
    loadAllData(obj, category);
});

/**
 * Параллельная загрузка данных из NASA, Wikipedia и расчёт времени полёта
 */
async function loadAllData(obj, category) {
    try {
        // Запускаем все запросы параллельно
        const [nasaImages, wikiSummary, wikiInfobox] = await Promise.all([
            NasaAPI.searchImages(NasaAPI.NASA_SEARCH_TERMS[obj.id] || obj.name, 8)
                .catch(() => []),
            WikiAPI.getSummary(obj.wiki)
                .catch(() => null),
            WikiAPI.getInfobox(obj.wiki)
                .catch(() => ({}))
        ]);

        renderHeroImage(nasaImages, wikiSummary, obj);
        renderDescription(wikiSummary, obj);
        renderSources(wikiSummary, obj);
        renderTravelTime(obj.distanceKm);
        renderParams(wikiInfobox, obj);
        renderGallery(nasaImages);

        // Анимация появления секций
        initSectionAnimations();
    } catch (err) {
        console.error('loadAllData error:', err);
        document.getElementById('object-extract').textContent =
            'Не удалось загрузить данные. Проверьте подключение к интернету и попробуйте обновить страницу.';
    }
}

/**
 * Отрисовать главное изображение объекта (безопасно, без inline-обработчиков)
 */
function renderHeroImage(nasaImages, wikiSummary, obj) {
    const container = document.getElementById('object-hero-image');

    let imageUrl = null;
    let credit = '';

    if (nasaImages.length > 0 && nasaImages[0].fullImage) {
        imageUrl = nasaImages[0].fullImage;
        credit = nasaImages[0].credit || 'NASA';
    } else if (nasaImages.length > 0 && nasaImages[0].thumbnail) {
        imageUrl = nasaImages[0].thumbnail;
        credit = nasaImages[0].credit || 'NASA';
    } else if (wikiSummary?.image) {
        imageUrl = wikiSummary.image;
        credit = 'Wikipedia';
    } else if (wikiSummary?.thumbnail) {
        imageUrl = wikiSummary.thumbnail;
        credit = 'Wikipedia';
    }

    // Очищаем контейнер
    container.innerHTML = '';

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = obj.name;
        img.className = 'hero-img';
        img.addEventListener('error', () => {
            container.innerHTML = '';
            renderPlaceholder(container, obj.name);
        });

        const creditSpan = document.createElement('span');
        creditSpan.className = 'hero-credit';
        creditSpan.textContent = credit;

        container.appendChild(img);
        container.appendChild(creditSpan);
    } else {
        renderPlaceholder(container, obj.name);
    }
}

/**
 * Показать заглушку вместо изображения
 */
function renderPlaceholder(container, name) {
    const placeholder = document.createElement('div');
    placeholder.className = 'object-hero-placeholder';

    const icon = document.createElement('span');
    icon.style.fontSize = '4rem';
    icon.textContent = '\uD83C\uDF0C';

    const label = document.createElement('span');
    label.textContent = name;

    placeholder.appendChild(icon);
    placeholder.appendChild(label);
    container.appendChild(placeholder);
}

/**
 * Отрисовать описание объекта
 */
function renderDescription(wikiSummary, obj) {
    const extractEl = document.getElementById('object-extract');
    extractEl.textContent = wikiSummary?.extract || `${obj.name} — космический объект.`;
}

/**
 * Отрисовать ссылки на источники (безопасно, через DOM API)
 */
function renderSources(wikiSummary, obj) {
    const sourcesEl = document.getElementById('object-sources');
    sourcesEl.innerHTML = '';

    if (wikiSummary?.wikiUrl) {
        const wikiLink = document.createElement('a');
        wikiLink.href = wikiSummary.wikiUrl;
        wikiLink.target = '_blank';
        wikiLink.rel = 'noopener';
        wikiLink.className = 'source-link';
        wikiLink.textContent = '\uD83D\uDCD6 \u0412\u0438\u043A\u0438\u043F\u0435\u0434\u0438\u044F';
        sourcesEl.appendChild(wikiLink);
    }

    const nasaLink = document.createElement('a');
    const nasaQuery = encodeURIComponent(NasaAPI.NASA_SEARCH_TERMS[obj.id] || obj.name);
    nasaLink.href = `https://images.nasa.gov/search?q=${nasaQuery}&media=image`;
    nasaLink.target = '_blank';
    nasaLink.rel = 'noopener';
    nasaLink.className = 'source-link';
    nasaLink.textContent = '\uD83D\uDE80 NASA Images';
    sourcesEl.appendChild(nasaLink);
}

/**
 * Отрисовать блок времени полёта
 */
function renderTravelTime(distanceKm) {
    const block = document.getElementById('travel-block');
    const details = document.getElementById('travel-details');

    if (!distanceKm || distanceKm <= 0) {
        block.style.display = 'flex';
        const here = document.createElement('div');
        here.className = 'travel-here';
        here.textContent = '\u041C\u044B \u0437\u0434\u0435\u0441\u044C! \uD83C\uDF0D';
        details.innerHTML = '';
        details.appendChild(here);
        return;
    }

    const travel = TravelTime.calculate(distanceKm);
    block.style.display = 'flex';

    details.innerHTML = `
        <div class="travel-distance">
            <span class="travel-distance-value">${escapeHtml(travel.distanceFormatted)}</span>
            <span class="travel-distance-label">\u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043E\u0442 \u0417\u0435\u043C\u043B\u0438</span>
            ${travel.distanceLightYears > 0.001
                ? `<span class="travel-distance-light">(${escapeHtml(travel.distanceLightFormatted)})</span>`
                : ''
            }
        </div>
        <div class="travel-crafts">
            ${travel.results.map(r => `
                <div class="travel-craft">
                    <span class="craft-icon">${r.icon}</span>
                    <div class="craft-info">
                        <span class="craft-name">${escapeHtml(r.spacecraft)}</span>
                        <span class="craft-desc">${escapeHtml(r.description)}</span>
                    </div>
                    <span class="craft-time">${escapeHtml(r.formatted)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Отрисовать параметры из инфобокса Wikipedia
 */
function renderParams(infobox, obj) {
    const section = document.getElementById('params-section');
    const grid = document.getElementById('params-grid');

    if (!infobox || Object.keys(infobox).length === 0) return;

    const skipKeys = [
        'изображение', 'image', 'подпись', 'caption', 'фон',
        'цвет', 'color', 'wikidata', 'карта', 'map', 'ширина',
        'width', 'заголовок', 'название', 'имя', 'name', 'link',
        'ссылка', 'позиция', 'position', 'стиль', 'style',
        'bgcolor', 'header', 'label', 'above', 'below',
        'image_size', 'image_alt', 'alt', 'epoch', 'equinox',
        'изображение1', 'nocat', 'nofooter',
        'символ', 'размер изображения', 'тип орбиты'
    ];

    const keyTranslations = {
        'mass': '\u041C\u0430\u0441\u0441\u0430',
        'radius': '\u0420\u0430\u0434\u0438\u0443\u0441',
        'diameter': '\u0414\u0438\u0430\u043C\u0435\u0442\u0440',
        'density': '\u041F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C',
        'gravity': '\u0413\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044F',
        'temperature': '\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430',
        'luminosity': '\u0421\u0432\u0435\u0442\u0438\u043C\u043E\u0441\u0442\u044C',
        'distance': '\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435',
        'age': '\u0412\u043E\u0437\u0440\u0430\u0441\u0442',
        'type': '\u0422\u0438\u043F',
        'spectral': '\u0421\u043F\u0435\u043A\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043B\u0430\u0441\u0441',
        'constellation': '\u0421\u043E\u0437\u0432\u0435\u0437\u0434\u0438\u0435',
        'period': '\u041F\u0435\u0440\u0438\u043E\u0434',
        'inclination': '\u041D\u0430\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0435',
        'eccentricity': '\u042D\u043A\u0441\u0446\u0435\u043D\u0442\u0440\u0438\u0441\u0438\u0442\u0435\u0442',
        'apoapsis': '\u0410\u043F\u043E\u0446\u0435\u043D\u0442\u0440',
        'periapsis': '\u041F\u0435\u0440\u0438\u0446\u0435\u043D\u0442\u0440',
        'semi-major_axis': '\u0411\u043E\u043B\u044C\u0448\u0430\u044F \u043F\u043E\u043B\u0443\u043E\u0441\u044C',
        'discoverer': '\u041F\u0435\u0440\u0432\u043E\u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u0435\u043B\u044C',
        'discovered': '\u0414\u0430\u0442\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F',
        'named_after': '\u041D\u0430\u0437\u0432\u0430\u043D \u0432 \u0447\u0435\u0441\u0442\u044C',
        'satellites': '\u0421\u043F\u0443\u0442\u043D\u0438\u043A\u0438',
        'magnitude': '\u0417\u0432\u0451\u0437\u0434\u043D\u0430\u044F \u0432\u0435\u043B\u0438\u0447\u0438\u043D\u0430',
        'absolute_magnitude': '\u0410\u0431\u0441. \u0437\u0432. \u0432\u0435\u043B\u0438\u0447\u0438\u043D\u0430',
        'apparent_magnitude': '\u0412\u0438\u0434. \u0437\u0432. \u0432\u0435\u043B\u0438\u0447\u0438\u043D\u0430',
        'right_ascension': '\u041F\u0440\u044F\u043C\u043E\u0435 \u0432\u043E\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435',
        'declination': '\u0421\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0435',
        'redshift': '\u041A\u0440\u0430\u0441\u043D\u043E\u0435 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435',
        'rotation': '\u041F\u0435\u0440\u0438\u043E\u0434 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F',
        'albedo': '\u0410\u043B\u044C\u0431\u0435\u0434\u043E'
    };

    const entries = Object.entries(infobox)
        .filter(([key, value]) => {
            const lower = key.toLowerCase();
            if (skipKeys.some(sk => lower.includes(sk)) || lower.length <= 1) return false;
            // Фильтруем технические значения шаблона
            if (/\.svg|\.png|\.jpg|^\d+px$/i.test(value)) return false;
            return true;
        })
        .slice(0, 18);

    if (entries.length === 0) return;

    section.style.display = 'block';
    grid.innerHTML = entries.map(([key, value]) => {
        const translated = keyTranslations[key.toLowerCase()] || capitalizeFirst(key.replace(/_/g, ' '));
        return `
            <div class="param-card">
                <span class="param-key">${escapeHtml(translated)}</span>
                <span class="param-value">${escapeHtml(value)}</span>
            </div>
        `;
    }).join('');
}

/**
 * Отрисовать галерею фотографий NASA (безопасно, через делегирование событий)
 */
function renderGallery(nasaImages) {
    const section = document.getElementById('nasa-gallery');
    const grid = document.getElementById('gallery-grid');

    const galleryImages = nasaImages.slice(1).filter(img => img.thumbnail);
    if (galleryImages.length === 0) return;

    section.style.display = 'block';
    grid.innerHTML = '';

    galleryImages.forEach((img, i) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${i * 0.08}s`;
        item.dataset.fullUrl = img.fullImage || img.thumbnail;
        item.dataset.title = img.title || '';

        const image = document.createElement('img');
        image.src = img.thumbnail;
        image.alt = img.title || '';
        image.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';

        const title = document.createElement('span');
        title.className = 'gallery-title';
        title.textContent = img.title || '';

        const credit = document.createElement('span');
        credit.className = 'gallery-credit';
        credit.textContent = img.credit || 'NASA';

        overlay.appendChild(title);
        overlay.appendChild(credit);
        item.appendChild(image);
        item.appendChild(overlay);
        grid.appendChild(item);
    });

    // Делегирование событий вместо inline onclick
    grid.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        openLightbox(item.dataset.fullUrl, item.dataset.title);
    });
}

/**
 * Открыть лайтбокс (безопасно, через DOM API)
 */
function openLightbox(url, title) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    const img = document.createElement('img');
    img.src = url;
    img.alt = title;

    const caption = document.createElement('p');
    caption.className = 'lightbox-title';
    caption.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.remove();
    });

    content.appendChild(img);
    content.appendChild(caption);
    content.appendChild(closeBtn);
    overlay.appendChild(content);

    // Закрытие по клику на фон
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    // Закрытие по Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    document.body.appendChild(overlay);
}

// ─── Утилиты ───

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

/**
 * Анимация появления секций при прокрутке
 */
function initSectionAnimations() {
    const sections = document.querySelectorAll('.object-hero, .travel-block, .params-section, .nasa-gallery');
    sections.forEach(el => el.classList.add('section-animate'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        sections.forEach(el => observer.observe(el));
    }

    // Гарантия видимости: через 600ms показать все секции (fallback для headless/старых браузеров)
    setTimeout(() => sections.forEach(el => el.classList.add('visible')), 600);
}

function showError(msg) {
    document.getElementById('object-title').textContent = msg;
    document.getElementById('object-extract').textContent = '\u0412\u0435\u0440\u043D\u0438\u0442\u0435\u0441\u044C \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442.';
}
