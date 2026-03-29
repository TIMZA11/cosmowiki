/**
 * CosmoWiki — Факт дня
 * Источники: NASA APOD + SpaceX + NASA_DESCRIPTIONS (фолбэк)
 * Кэширование: localStorage, сбрасывается в полночь
 */
const FactOfDay = (() => {
    const APOD_URL    = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
    const SPACEX_URL  = 'https://api.spacexdata.com/v4/launches/latest';
    const CACHE_APOD  = 'cosmo_apod';
    const CACHE_SX    = 'cosmo_spacex';

    // ─── Утилиты ───

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    async function fetchCached(url, key) {
        const today = todayKey();
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const { date, data } = JSON.parse(raw);
                if (date === today) return data;
            }
        } catch {}
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            localStorage.setItem(key, JSON.stringify({ date: today, data }));
            return data;
        } catch {
            return null;
        }
    }

    // Ежедневный факт из каталога: ротация по дню года
    function getDailyFact() {
        if (typeof NASA_DESCRIPTIONS === 'undefined' || typeof CATEGORIES === 'undefined') return null;
        const all = [];
        CATEGORIES.forEach(cat => {
            cat.objects.forEach(obj => {
                const desc = NASA_DESCRIPTIONS[obj.id];
                if (desc) all.push({ name: obj.name, desc, categoryName: cat.name, categoryId: cat.id, icon: cat.icon, id: obj.id });
            });
        });
        if (!all.length) return null;
        const start   = new Date(new Date().getFullYear(), 0, 1);
        const dayIdx  = Math.floor((Date.now() - start) / 86400000);
        return all[dayIdx % all.length];
    }

    // ─── Рендеринг ───

    function render(section, apod, spacex, fact) {
        section.innerHTML = '';

        // ── Карточка «Факт дня» ──
        const card = document.createElement('div');
        card.className = 'fod-card';

        // Левая часть: изображение NASA APOD (или иконка)
        const imgWrap = document.createElement('div');
        imgWrap.className = 'fod-img-wrap';

        if (apod && apod.media_type === 'image' && apod.url) {
            const img = document.createElement('img');
            img.src   = apod.url;
            img.alt   = apod.title || 'NASA APOD';
            img.className = 'fod-img';
            img.loading = 'lazy';
            imgWrap.appendChild(img);

            const badge = document.createElement('span');
            badge.className = 'fod-img-badge';
            badge.textContent = 'NASA APOD';
            imgWrap.appendChild(badge);
        } else {
            const fallback = document.createElement('div');
            fallback.className = 'fod-img-fallback';
            fallback.textContent = fact ? fact.icon : '🌌';
            imgWrap.appendChild(fallback);
        }

        // Правая часть: текст
        const content = document.createElement('div');
        content.className = 'fod-content';

        const dateBadge = document.createElement('div');
        dateBadge.className = 'fod-date-badge';
        dateBadge.textContent = '✨ Факт дня · ' + new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        content.appendChild(dateBadge);

        const title = document.createElement('h3');
        title.className = 'fod-title';
        if (apod && apod.title) {
            title.textContent = apod.title;
        } else if (fact) {
            title.textContent = fact.name;
        }
        content.appendChild(title);

        if (fact) {
            const text = document.createElement('p');
            text.className = 'fod-text';
            text.textContent = fact.desc;
            content.appendChild(text);

            const footer = document.createElement('div');
            footer.className = 'fod-footer';

            const catBadge = document.createElement('span');
            catBadge.className = 'fod-cat-badge';
            catBadge.textContent = fact.icon + ' ' + fact.categoryName;
            footer.appendChild(catBadge);

            const link = document.createElement('a');
            link.className = 'fod-link';
            link.href = 'object.html?category=' + encodeURIComponent(fact.categoryId) + '&id=' + encodeURIComponent(fact.id);
            link.textContent = 'Открыть объект →';
            footer.appendChild(link);

            content.appendChild(footer);
        }

        card.appendChild(imgWrap);
        card.appendChild(content);
        section.appendChild(card);

        // ── Карточка SpaceX ──
        if (spacex && spacex.name) {
            const sx = document.createElement('div');
            sx.className = 'fod-spacex';

            const patchWrap = document.createElement('div');
            patchWrap.className = 'fod-sx-patch';
            if (spacex.links?.patch?.small) {
                const pImg = document.createElement('img');
                pImg.src = spacex.links.patch.small;
                pImg.alt = spacex.name;
                patchWrap.appendChild(pImg);
            } else {
                patchWrap.textContent = '🚀';
            }

            const sxInfo = document.createElement('div');
            sxInfo.className = 'fod-sx-info';

            const sxLabel = document.createElement('span');
            sxLabel.className = 'fod-sx-label';
            sxLabel.textContent = '🚀 Последний запуск SpaceX';
            sxInfo.appendChild(sxLabel);

            const sxName = document.createElement('strong');
            sxName.className = 'fod-sx-name';
            sxName.textContent = spacex.name;
            sxInfo.appendChild(sxName);

            const sxDate = document.createElement('span');
            sxDate.className = 'fod-sx-date';
            sxDate.textContent = new Date(spacex.date_utc).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            sxInfo.appendChild(sxDate);

            const sxStatus = document.createElement('span');
            sxStatus.className = 'fod-sx-status ' + (spacex.success ? 'ok' : spacex.success === false ? 'fail' : 'unknown');
            sxStatus.textContent = spacex.success ? '✅ Успешно' : spacex.success === false ? '❌ Неудача' : '⏳ Данные уточняются';
            sxInfo.appendChild(sxStatus);

            if (spacex.links?.webcast) {
                const watch = document.createElement('a');
                watch.className = 'fod-sx-watch';
                watch.href = spacex.links.webcast;
                watch.target = '_blank';
                watch.rel = 'noopener';
                watch.textContent = '▶ Смотреть трансляцию';
                sxInfo.appendChild(watch);
            }

            sx.appendChild(patchWrap);
            sx.appendChild(sxInfo);
            section.appendChild(sx);
        }
    }

    // ─── Инициализация ───

    async function init() {
        const section = document.getElementById('fact-of-day');
        if (!section) return;

        const fact = getDailyFact();

        // Сразу рендерим с фолбэком пока грузятся API
        render(section, null, null, fact);
        section.classList.add('fod-visible');

        // Параллельно грузим APOD и SpaceX
        const [apod, spacex] = await Promise.all([
            fetchCached(APOD_URL, CACHE_APOD).catch(() => null),
            fetchCached(SPACEX_URL, CACHE_SX).catch(() => null)
        ]);

        // Перерисовываем с реальными данными
        section.classList.remove('fod-visible');
        render(section, apod, spacex, fact);
        setTimeout(() => section.classList.add('fod-visible'), 30);
    }

    return { init };
})();
