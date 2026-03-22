/**
 * CosmoWiki — Модуль работы с NASA Images API
 * https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
 *
 * Бесплатный, без ключа, поддерживает CORS.
 * Используется для получения высококачественных фотографий космических объектов.
 */

const NasaAPI = (() => {
    const API_URL = 'https://images-api.nasa.gov';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

    // ─── Маппинг объектов каталога на поисковые запросы NASA ───
    // Некоторые объекты лучше искать по англоязычным названиям

    const NASA_SEARCH_TERMS = {
        // Звёзды
        sun: 'Sun star',
        sirius: 'Sirius star',
        betelgeuse: 'Betelgeuse',
        polaris: 'Polaris star',
        proxima: 'Proxima Centauri',
        vega: 'Vega star',
        altair: 'Altair star',
        // Планеты
        mercury: 'Mercury planet',
        venus: 'Venus planet',
        earth: 'Earth from space',
        mars: 'Mars planet',
        jupiter: 'Jupiter planet',
        saturn: 'Saturn planet rings',
        uranus: 'Uranus planet',
        neptune: 'Neptune planet',
        // Карликовые планеты
        pluto: 'Pluto New Horizons',
        ceres: 'Ceres dwarf planet Dawn',
        eris: 'Eris dwarf planet',
        haumea: 'Haumea',
        makemake: 'Makemake',
        // Спутники
        moon: 'Moon lunar',
        io: 'Io Jupiter moon',
        europa: 'Europa Jupiter moon',
        ganymede: 'Ganymede moon',
        titan: 'Titan Saturn moon',
        enceladus: 'Enceladus Saturn',
        triton: 'Triton Neptune moon',
        // Астероиды
        vesta: 'Vesta asteroid Dawn',
        pallas: 'Pallas asteroid',
        hygiea: 'Hygiea asteroid',
        bennu: 'Bennu asteroid OSIRIS-REx',
        itokawa: 'Itokawa asteroid',
        // Кометы
        halley: 'Halley comet',
        churyumov: 'comet 67P Churyumov',
        'hale-bopp': 'Hale-Bopp comet',
        neowise: 'NEOWISE comet',
        // Галактики
        'milky-way': 'Milky Way galaxy',
        andromeda: 'Andromeda galaxy M31',
        triangulum: 'Triangulum galaxy M33',
        lmc: 'Large Magellanic Cloud',
        // Туманности
        'orion-nebula': 'Orion Nebula M42',
        'crab-nebula': 'Crab Nebula M1',
        'ring-nebula': 'Ring Nebula M57',
        'eagle-nebula': 'Eagle Nebula pillars creation',
        // Чёрные дыры
        'sgr-a': 'Sagittarius A black hole',
        m87: 'M87 black hole',
        'cygnus-x1': 'Cygnus X-1',
        // Квазары
        '3c273': 'quasar 3C 273',
        apm08279: 'APM 08279 quasar gravitational lens',
        ton618: 'TON 618 quasar black hole',
        markarian: 'Markarian 231 galaxy quasar',
        // Пульсары
        'psr-b1919': 'pulsar neutron star radio',
        'crab-pulsar': 'Crab Nebula pulsar neutron star',
        'psr-j0437': 'millisecond pulsar neutron star',
        'vela-pulsar': 'Vela supernova remnant pulsar',
        // Экзопланеты
        'proxima-b': 'Proxima Centauri b exoplanet',
        'trappist-1e': 'TRAPPIST-1 exoplanet',
        'kepler-452b': 'Kepler 452b',
        '51-peg-b': 'exoplanet 51 Pegasi',
        hd209458b: 'HD 209458 b exoplanet'
    };

    // ─── Кэширование ───

    function cacheGet(key) {
        try {
            const raw = localStorage.getItem(`nasa_${key}`);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts > CACHE_TTL) {
                localStorage.removeItem(`nasa_${key}`);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    function cacheSet(key, data) {
        try {
            localStorage.setItem(`nasa_${key}`, JSON.stringify({ data, ts: Date.now() }));
        } catch {
            // localStorage полон — игнорируем
        }
    }

    // ─── Поиск изображений ───

    async function searchImages(query, count = 5) {
        const cacheKey = `search_${query}_${count}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                q: query,
                media_type: 'image',
                page_size: count
            });

            const res = await fetch(`${API_URL}/search?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const results = (json.collection?.items || []).map(item => {
                const data = item.data?.[0] || {};
                const link = item.links?.find(l => l.rel === 'preview') ||
                             item.links?.[0];
                const origLink = item.links?.find(l => l.rel === 'canonical');

                return {
                    id: data.nasa_id || '',
                    title: data.title || '',
                    description: data.description || '',
                    date: data.date_created || '',
                    thumbnail: link?.href || null,
                    fullImage: origLink?.href || link?.href || null,
                    credit: data.secondary_creator || 'NASA'
                };
            });

            cacheSet(cacheKey, results);
            return results;
        } catch (err) {
            console.warn(`NasaAPI.searchImages: ошибка для "${query}"`, err);
            return [];
        }
    }

    // ─── Получить лучшее изображение для объекта каталога ───

    async function getBestImage(objectId, objectName) {
        const cacheKey = `best_${objectId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        const searchTerm = NASA_SEARCH_TERMS[objectId] || objectName;
        const results = await searchImages(searchTerm, 3);

        // Выбираем первый результат с изображением
        const best = results.find(r => r.thumbnail) || null;

        if (best) {
            cacheSet(cacheKey, best);
        }
        return best;
    }

    // ─── Получить полноразмерное изображение ───

    async function getFullImage(nasaId) {
        const cacheKey = `full_${nasaId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        try {
            const res = await fetch(`${API_URL}/asset/${nasaId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const items = json.collection?.items || [];
            // Ищем ~medium или ~large версию (не orig — слишком большие)
            const medium = items.find(i => i.href?.includes('~medium')) ||
                           items.find(i => i.href?.includes('~large')) ||
                           items.find(i => i.href?.includes('~orig')) ||
                           items[0];

            const url = medium?.href || null;
            if (url) cacheSet(cacheKey, url);
            return url;
        } catch (err) {
            console.warn(`NasaAPI.getFullImage: ошибка для "${nasaId}"`, err);
            return null;
        }
    }

    // ─── Публичный API ───

    return {
        searchImages,
        getBestImage,
        getFullImage,
        NASA_SEARCH_TERMS
    };
})();
