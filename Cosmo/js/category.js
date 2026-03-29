/**
 * CosmoWiki — Логика страницы категории
 *
 * Приоритет источников:
 *   1. NASA (основной) — изображения
 *   2. Wikipedia (дополнительный) — описания, fallback-изображения
 *   3. Naked Science (дополнительный) — описания категорий
 */

document.addEventListener('DOMContentLoaded', () => {
    const categoryId = new URLSearchParams(window.location.search).get('id');
    const category = CATEGORIES.find(c => c.id === categoryId);

    if (!category) {
        showError('Категория не найдена');
        return;
    }

    // Заполняем заголовок
    document.title = `CosmoWiki — ${category.name}`;
    const desc = category.description || `Каталог объектов «${category.name}» с фотографиями NASA.`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `CosmoWiki — ${category.name}`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `CosmoWiki — ${category.name}`);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);
    document.getElementById('category-icon').textContent = category.icon;
    document.getElementById('category-title').textContent = category.name;
    document.getElementById('category-description').textContent = category.description;
    document.getElementById('breadcrumb-category').textContent = category.name;

    // Показываем блок Naked Science (если есть данные для этой категории)
    renderNakedScienceBlock(categoryId);

    // Показываем скелетоны пока грузятся данные
    renderSkeletons(category.objects.length);

    // Загружаем данные из NASA (основной) + Wikipedia (дополнительный)
    loadObjects(category);
});

/**
 * Отобразить блок с описанием категории из Naked Science
 */
function renderNakedScienceBlock(categoryId) {
    const nsData = NAKED_SCIENCE_DATA.categories[categoryId];
    if (!nsData || !nsData.article) return;

    const block = document.getElementById('ns-article');
    const textEl = document.getElementById('ns-text');
    const imageEl = document.getElementById('ns-image');
    const sourceEl = document.getElementById('ns-source');

    textEl.textContent = nsData.article;
    sourceEl.href = NAKED_SCIENCE_SOURCE;

    if (nsData.image) {
        imageEl.src = nsData.image;
        imageEl.alt = nsData.imageCaption || '';
        imageEl.title = nsData.imageCaption || '';
    } else {
        imageEl.style.display = 'none';
    }

    block.style.display = 'block';
    block.classList.add('section-animate');
    requestAnimationFrame(() => block.classList.add('visible'));
}

/**
 * Показать карточки-скелетоны на время загрузки
 */
function renderSkeletons(count) {
    const grid = document.getElementById('objects-grid');
    grid.innerHTML = Array.from({ length: count }, () => `
        <div class="object-card skeleton">
            <div class="object-card-image skeleton-image"></div>
            <div class="object-card-body">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Загрузить данные: сначала рендерим карточки с именами,
 * затем по мере готовности подставляем фото и описания.
 * Так изображения начинают грузиться сразу, не дожидаясь всех API-ответов.
 */
async function loadObjects(category) {
    const grid = document.getElementById('objects-grid');
    grid.innerHTML = '';

    // 1) Сразу рендерим карточки с именами и плейсхолдерами
    const cards = category.objects.map((obj, i) => {
        const card = document.createElement('a');
        card.href = `object.html?category=${encodeURIComponent(category.id)}&id=${encodeURIComponent(obj.id)}`;
        card.className = 'object-card';
        card.style.animationDelay = `${i * 0.07}s`;

        const imageDiv = document.createElement('div');
        imageDiv.className = 'object-card-image';
        const placeholder = document.createElement('div');
        placeholder.className = 'object-card-placeholder';
        placeholder.textContent = category.icon;
        imageDiv.appendChild(placeholder);

        const body = document.createElement('div');
        body.className = 'object-card-body';
        const title = document.createElement('h3');
        title.className = 'object-card-name';
        title.textContent = obj.name;
        const extract = document.createElement('p');
        extract.className = 'object-card-extract';
        extract.textContent = '';
        body.appendChild(title);
        body.appendChild(extract);

        const footer = document.createElement('div');
        footer.className = 'object-card-footer';
        const arrow = document.createElement('span');
        arrow.className = 'object-card-arrow';
        arrow.textContent = 'Подробнее →';
        footer.appendChild(arrow);

        card.appendChild(imageDiv);
        card.appendChild(body);
        card.appendChild(footer);
        grid.appendChild(card);

        return { card, imageDiv, extract, placeholder };
    });

    // 2) Параллельно обогащаем каждую карточку по мере получения данных
    category.objects.forEach((obj, i) => {
        const { imageDiv, extract, placeholder } = cards[i];

        Promise.all([
            NasaAPI.getBestImage(obj.id, obj.name).catch(() => null),
            WikiAPI.getSummary(obj.wiki).catch(() => null)
        ]).then(([nasaImage, wikiSummary]) => {
            // Фото: NASA → Wikipedia fallback
            let thumbnail = nasaImage?.thumbnail || null;
            let imageSource = nasaImage ? 'NASA' : null;

            if (!thumbnail && wikiSummary?.thumbnail) {
                thumbnail = wikiSummary.thumbnail;
                imageSource = 'Wiki';
            }

            if (thumbnail) {
                const img = document.createElement('img');
                img.src = thumbnail;
                img.alt = obj.name;
                img.loading = 'lazy';
                placeholder.replaceWith(img);
            }

            if (imageSource === 'NASA') {
                const credit = document.createElement('span');
                credit.className = 'image-credit';
                credit.textContent = 'NASA';
                imageDiv.appendChild(credit);
            }

            // Описание
            if (wikiSummary?.extract) {
                extract.textContent = truncate(wikiSummary.extract, 120);
            }
        });
    });
}

/**
 * Обрезать текст до указанной длины
 */
function truncate(text, maxLen) {
    if (!text || text.length <= maxLen) return text || '';
    return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

/**
 * Показать сообщение об ошибке
 */
function showError(msg) {
    document.getElementById('category-title').textContent = msg;
    document.getElementById('category-description').textContent = 'Вернитесь на главную и выберите категорию из каталога.';
    document.getElementById('objects-grid').innerHTML = '';
}
