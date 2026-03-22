/**
 * CosmoWiki — Модуль работы с Wikipedia API
 * Дополнительный источник: описания, параметры (инфобокс), fallback-изображения
 * Основной источник фото — NASA (nasa-api.js)
 * Кэширование в localStorage на 24 часа
 */

const WikiAPI = (() => {
    const BASE_URL = 'https://ru.wikipedia.org';
    const API_URL = `${BASE_URL}/w/api.php`;
    const REST_URL = `${BASE_URL}/api/rest_v1`;
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

    // ─── Кэширование ───

    function cacheGet(key) {
        try {
            const raw = localStorage.getItem(`cosmo_${key}`);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts > CACHE_TTL) {
                localStorage.removeItem(`cosmo_${key}`);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    function cacheSet(key, data) {
        try {
            localStorage.setItem(`cosmo_${key}`, JSON.stringify({ data, ts: Date.now() }));
        } catch {
            // localStorage полон — игнорируем
        }
    }

    // ─── Получение краткой информации (summary) ───

    async function getSummary(wikiTitle) {
        const cacheKey = `summary_${wikiTitle}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        try {
            const res = await fetch(`${REST_URL}/page/summary/${encodeURIComponent(wikiTitle)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const result = {
                title: json.title,
                description: json.description || '',
                extract: json.extract || '',
                thumbnail: json.thumbnail ? json.thumbnail.source : null,
                image: json.originalimage ? json.originalimage.source : null,
                wikiUrl: json.content_urls?.desktop?.page || `${BASE_URL}/wiki/${encodeURIComponent(wikiTitle)}`
            };

            cacheSet(cacheKey, result);
            return result;
        } catch (err) {
            console.warn(`WikiAPI.getSummary: ошибка для "${wikiTitle}"`, err);
            return null;
        }
    }

    // ─── Получение изображения (thumbnail) ───

    async function getThumbnail(wikiTitle, size = 400) {
        const cacheKey = `thumb_${wikiTitle}_${size}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                action: 'query',
                titles: wikiTitle,
                prop: 'pageimages',
                pithumbsize: size,
                format: 'json',
                origin: '*'
            });

            const res = await fetch(`${API_URL}?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const pages = json.query.pages;
            const page = Object.values(pages)[0];
            const url = page?.thumbnail?.source || null;

            cacheSet(cacheKey, url);
            return url;
        } catch (err) {
            console.warn(`WikiAPI.getThumbnail: ошибка для "${wikiTitle}"`, err);
            return null;
        }
    }

    // ─── Получение инфобокса (параметров объекта) ───

    async function getInfobox(wikiTitle) {
        const cacheKey = `infobox_${wikiTitle}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                action: 'parse',
                page: wikiTitle,
                prop: 'wikitext',
                format: 'json',
                origin: '*',
                redirects: '1'
            });

            const res = await fetch(`${API_URL}?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const wikitext = json.parse?.wikitext?.['*'] || '';
            const infobox = parseInfobox(wikitext);

            cacheSet(cacheKey, infobox);
            return infobox;
        } catch (err) {
            console.warn(`WikiAPI.getInfobox: ошибка для "${wikiTitle}"`, err);
            return {};
        }
    }

    // ─── Парсинг инфобокса из wikitext ───

    function parseInfobox(wikitext) {
        const result = {};

        // Ищем блок {{Карточка ... }} или {{Infobox ... }}
        const infoboxMatch = wikitext.match(/\{\{(?:Карточка|Планета|Звезда|Галактика|Комета|Астероид|Infobox)[^\n]*\n([\s\S]*?)\n\}\}/i);
        if (!infoboxMatch) return result;

        const content = infoboxMatch[1];
        const lines = content.split('\n');

        for (const line of lines) {
            const match = line.match(/^\s*\|\s*(.+?)\s*=\s*(.*?)\s*$/);
            if (match) {
                let key = match[1].trim();
                let value = match[2].trim();

                // Убираем wiki-разметку из значений
                value = cleanWikiMarkup(value);

                if (key && value) {
                    result[key] = value;
                }
            }
        }

        return result;
    }

    // ─── Очистка wiki-разметки ───

    function cleanWikiMarkup(text) {
        return text
            // [[ссылка|текст]] → текст
            .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
            // {{nowrap|текст}} → текст
            .replace(/\{\{nowrap\|([^}]*)\}\}/gi, '$1')
            // {{нп3|текст}} и другие шаблоны
            .replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1')
            // <ref>...</ref>
            .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
            .replace(/<ref[^/]*\/>/gi, '')
            // <br>, <br/>
            .replace(/<br\s*\/?>/gi, ', ')
            // '''bold''' → bold
            .replace(/'{2,3}/g, '')
            // HTML-теги
            .replace(/<[^>]+>/g, '')
            // &nbsp;
            .replace(/&nbsp;/g, ' ')
            // Множественные пробелы
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    // ─── Пакетная загрузка превью для списка объектов ───

    async function batchGetPreviews(objects) {
        const promises = objects.map(async (obj) => {
            const summary = await getSummary(obj.wiki);
            return {
                ...obj,
                thumbnail: summary?.thumbnail || null,
                extract: summary?.extract || '',
                wikiUrl: summary?.wikiUrl || null
            };
        });

        return Promise.all(promises);
    }

    // ─── Публичный API ───

    return {
        getSummary,
        getThumbnail,
        getInfobox,
        batchGetPreviews,
        cleanWikiMarkup
    };
})();
