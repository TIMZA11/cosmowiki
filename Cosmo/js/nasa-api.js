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
    const NASA_SEARCH_TERMS = {
        // Звёзды
        sun:          'Sun solar',
        sirius:       'Sirius star',
        betelgeuse:   'Betelgeuse supergiant',
        polaris:      'Polaris star',
        proxima:      'Proxima Centauri',
        vega:         'Vega star',
        altair:       'Altair star',
        rigel:        'Rigel star',
        antares:      'Antares star',
        aldebaran:    'Aldebaran star',

        // Планеты
        mercury:      'Mercury planet',
        venus:        'Venus planet',
        earth:        'Earth blue marble',
        mars:         'Mars rover',
        jupiter:      'Jupiter Red Spot',
        saturn:       'Saturn rings',
        uranus:       'Uranus Voyager',
        neptune:      'Neptune Voyager',

        // Карликовые планеты
        pluto:        'Pluto New Horizons',
        ceres:        'Ceres Dawn',
        eris:         'Eris dwarf planet',
        haumea:       'Haumea',
        makemake:     'Makemake',
        gonggong:     'trans-neptunian artist concept',
        quaoar:       'Quaoar',
        sedna:        'Sedna',
        orcus:        'Kuiper Belt object',
        salacia:      'outer solar system',

        // Спутники
        moon:         'Moon Apollo lunar',
        io:           'Io volcanic moon',
        europa:       'Europa ice ocean',
        ganymede:     'Ganymede moon',
        titan:        'Titan moon Cassini',
        enceladus:    'Enceladus geysers',
        triton:       'Triton Voyager',
        callisto:     'Callisto moon Jupiter',
        miranda:      'Miranda moon Uranus',
        oberon:       'Oberon moon Uranus',

        // Астероиды
        vesta:        'Vesta asteroid',
        pallas:       'Pallas asteroid',
        hygiea:       'Hygiea asteroid',
        bennu:        'Bennu asteroid',
        itokawa:      'Itokawa asteroid',
        ryugu:        'Ryugu asteroid',
        apophis:      'Apophis asteroid',
        eros:         'Eros asteroid',
        ida:          'Ida asteroid Dactyl',
        mathilde:     'Mathilde asteroid',

        // Кометы
        halley:       'Halley comet',
        churyumov:    'comet 67P Rosetta',
        'hale-bopp':  'Hale-Bopp comet',
        neowise:      'NEOWISE comet',
        encke:        'Encke comet',
        wild2:        'Wild 2 Stardust',
        tempel1:      'Tempel comet Deep Impact',
        hyakutake:    'Hyakutake comet',
        shoemaker:    'Shoemaker-Levy Jupiter',
        lovejoy:      'Lovejoy comet',

        // Галактики
        'milky-way':   'Milky Way center',
        andromeda:     'Andromeda M31',
        triangulum:    'Triangulum M33',
        lmc:           'Large Magellanic Cloud',
        smc:           'Small Magellanic Cloud',
        whirlpool:     'Whirlpool galaxy M51',
        sombrero:      'Sombrero galaxy',
        cartwheel:     'Cartwheel galaxy',
        'centaurus-a': 'Centaurus A',
        bodes:         'M81 galaxy',

        // Туманности
        'orion-nebula':  'Orion Nebula',
        'crab-nebula':   'Crab Nebula',
        'ring-nebula':   'Ring Nebula M57',
        'eagle-nebula':  'Eagle Nebula pillars',
        'helix-nebula':  'Helix Nebula',
        'lagoon-nebula': 'Lagoon Nebula',
        horsehead:       'Horsehead Nebula',
        butterfly:       'NGC 6302',
        'cat-eye':       'Cat Eye Nebula',
        rosette:         'Rosette Nebula',

        // Чёрные дыры
        'sgr-a':       'Sagittarius A star',
        m87:           'M87 galaxy jet',
        'cygnus-x1':   'Cygnus X-1',
        grs1915:       'X-ray binary Chandra',
        'v404-cygni':  'V404 Cygni',
        'xte-j1650':   'black hole X-ray',
        ngc1277:       'Perseus cluster galaxy',
        holm15a:       'galaxy cluster black hole',
        'ic10-x1':     'IC 10 galaxy',
        ss433:         'SS 433',

        // Квазары
        '3c273':      '3C 273',
        apm08279:     'gravitational lens quasar',
        ton618:       'TON 618',
        markarian:    'Markarian 231',
        '3c48':       '3C 48',
        pks2349:      'quasar host galaxy',
        hs1700:       'deep field Hubble',
        b1422:        'Einstein ring',
        'sdss-j1030': 'distant quasar Hubble',
        'ul-j0313':   'distant quasar reionization',

        // Пульсары
        'psr-b1919':   'pulsar radio neutron',
        'crab-pulsar': 'Crab pulsar nebula',
        'psr-j0437':   'pulsar timing',
        'vela-pulsar': 'Vela pulsar',
        millisecond:   'millisecond pulsar',
        'psr-j0030':   'NICER neutron star',
        'double-psr':  'neutron star binary',
        'psr-b1509':   'pulsar hand god',
        geminga:       'Geminga pulsar',
        magnetar:      'magnetar flare',

        // Экзопланеты
        'proxima-b':    'Proxima b exoplanet',
        'trappist-1e':  'TRAPPIST-1',
        'kepler-452b':  'Kepler 452',
        '51-peg-b':     'hot Jupiter exoplanet',
        hd209458b:      'HD 209458',
        'gliese-667cc': 'red dwarf exoplanet',
        'kepler-186f':  'Kepler 186f',
        'trappist-1d':  'TRAPPIST rocky planet',
        'k2-18b':       'K2-18 exoplanet',
        'toi-700d':     'TOI-700'
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
