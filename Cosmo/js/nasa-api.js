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
        sun:          'Sun star',
        sirius:       'Sirius star',
        betelgeuse:   'Betelgeuse red supergiant',
        polaris:      'Polaris star',
        proxima:      'Proxima Centauri',
        vega:         'Vega star',
        altair:       'Altair star',
        rigel:        'Rigel star blue supergiant',
        antares:      'Antares red supergiant star',
        aldebaran:    'Aldebaran red giant star',

        // Планеты
        mercury:      'Mercury planet',
        venus:        'Venus planet',
        earth:        'Earth from space',
        mars:         'Mars planet',
        jupiter:      'Jupiter planet',
        saturn:       'Saturn planet rings',
        uranus:       'Uranus planet',
        neptune:      'Neptune planet',

        // Карликовые планеты
        pluto:        'Pluto New Horizons',
        ceres:        'Ceres dwarf planet Dawn',
        eris:         'Eris dwarf planet',
        haumea:       'Haumea dwarf planet',
        makemake:     'Makemake dwarf planet',
        gonggong:     'trans-neptunian object dwarf planet',
        quaoar:       'Quaoar Kuiper Belt object',
        sedna:        'Sedna distant dwarf planet',
        orcus:        'Orcus trans-neptunian object',
        salacia:      'Salacia Kuiper Belt',

        // Спутники
        moon:         'Moon lunar surface',
        io:           'Io Jupiter moon volcanic',
        europa:       'Europa Jupiter moon ocean',
        ganymede:     'Ganymede moon Jupiter',
        titan:        'Titan Saturn moon',
        enceladus:    'Enceladus Saturn geysers',
        triton:       'Triton Neptune moon',
        callisto:     'Callisto Jupiter moon',
        miranda:      'Miranda Uranus moon',
        oberon:       'Oberon Uranus moon',

        // Астероиды
        vesta:        'Vesta asteroid Dawn',
        pallas:       'Pallas asteroid',
        hygiea:       'Hygiea asteroid',
        bennu:        'Bennu asteroid OSIRIS-REx',
        itokawa:      'Itokawa asteroid Hayabusa',
        ryugu:        'Ryugu asteroid Hayabusa2',
        apophis:      'Apophis asteroid near Earth',
        eros:         'Eros asteroid NEAR',
        ida:          'Ida asteroid Galileo',
        mathilde:     'Mathilde asteroid NEAR',

        // Кометы
        halley:       'Halley comet',
        churyumov:    'comet 67P Churyumov Rosetta',
        'hale-bopp':  'Hale-Bopp comet',
        neowise:      'NEOWISE comet',
        encke:        'Encke comet',
        wild2:        'Wild 2 comet Stardust',
        tempel1:      'Tempel 1 comet Deep Impact',
        hyakutake:    'Hyakutake comet',
        shoemaker:    'Shoemaker-Levy 9 comet Jupiter impact',
        lovejoy:      'Lovejoy comet',

        // Галактики
        'milky-way':   'Milky Way galaxy center',
        andromeda:     'Andromeda galaxy M31',
        triangulum:    'Triangulum galaxy M33',
        lmc:           'Large Magellanic Cloud',
        smc:           'Small Magellanic Cloud',
        whirlpool:     'Whirlpool galaxy M51',
        sombrero:      'Sombrero galaxy M104',
        cartwheel:     'Cartwheel galaxy',
        'centaurus-a': 'Centaurus A galaxy NGC 5128',
        bodes:         'Bode galaxy M81',

        // Туманности
        'orion-nebula':  'Orion Nebula M42',
        'crab-nebula':   'Crab Nebula M1 supernova',
        'ring-nebula':   'Ring Nebula M57',
        'eagle-nebula':  'Eagle Nebula pillars of creation',
        'helix-nebula':  'Helix Nebula eye of god',
        'lagoon-nebula': 'Lagoon Nebula M8',
        horsehead:       'Horsehead Nebula Orion',
        butterfly:       'Butterfly Nebula NGC 6302',
        'cat-eye':       'Cat Eye Nebula NGC 6543',
        rosette:         'Rosette Nebula NGC 2244',

        // Чёрные дыры
        'sgr-a':       'Sagittarius A black hole milky way',
        m87:           'M87 black hole Event Horizon Telescope',
        'cygnus-x1':   'Cygnus X-1 black hole',
        grs1915:       'GRS 1915 black hole X-ray binary',
        'v404-cygni':  'V404 Cygni black hole X-ray',
        'xte-j1650':   'black hole X-ray binary stellar',
        ngc1277:       'NGC 1277 galaxy massive black hole',
        holm15a:       'galaxy cluster Abell supermassive black hole',
        'ic10-x1':     'IC 10 irregular galaxy black hole',
        ss433:         'SS 433 microquasar jets',

        // Квазары
        '3c273':      'quasar 3C 273 Hubble',
        apm08279:     'APM 08279 quasar gravitational lens',
        ton618:       'TON 618 quasar black hole',
        markarian:    'Markarian 231 galaxy quasar',
        '3c48':       'quasar 3C 48 radio source',
        pks2349:      'quasar PKS distant galaxy',
        hs1700:       'quasar distant universe Hubble',
        b1422:        'quasar gravitational lens',
        'sdss-j1030': 'high redshift quasar distant universe',
        'ul-j0313':   'most distant quasar early universe',

        // Пульсары
        'psr-b1919':   'pulsar neutron star radio waves',
        'crab-pulsar': 'Crab Nebula pulsar neutron star',
        'psr-j0437':   'millisecond pulsar neutron star',
        'vela-pulsar': 'Vela supernova remnant pulsar',
        millisecond:   'PSR B1257 millisecond pulsar planets',
        'psr-j0030':   'pulsar neutron star X-ray',
        'double-psr':  'double pulsar binary neutron star',
        'psr-b1509':   'PSR B1509 nebula hand of god',
        geminga:       'Geminga pulsar neutron star',
        magnetar:      'SGR 1806 magnetar neutron star',

        // Экзопланеты
        'proxima-b':    'Proxima Centauri b exoplanet',
        'trappist-1e':  'TRAPPIST-1 exoplanet system',
        'kepler-452b':  'Kepler 452b Earth-like exoplanet',
        '51-peg-b':     'exoplanet 51 Pegasi hot Jupiter',
        hd209458b:      'HD 209458 b exoplanet atmosphere',
        'gliese-667cc': 'Gliese 667 exoplanet habitable zone',
        'kepler-186f':  'Kepler 186f Earth-size exoplanet',
        'trappist-1d':  'TRAPPIST-1 system habitable exoplanet',
        'k2-18b':       'K2-18b super-Earth exoplanet ocean',
        'toi-700d':     'TOI 700 d habitable zone exoplanet'
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
