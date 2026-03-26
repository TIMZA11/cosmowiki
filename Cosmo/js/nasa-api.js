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
        sun:          'Sun star solar',
        sirius:       'Sirius star brightest',
        betelgeuse:   'Betelgeuse red supergiant',
        polaris:      'Polaris north star',
        proxima:      'Proxima Centauri red dwarf',
        vega:         'Vega star Lyra',
        altair:       'Altair star Aquila',
        rigel:        'bright star Orion belt',
        antares:      'Antares red supergiant Scorpius',
        aldebaran:    'Aldebaran red giant Taurus',

        // Планеты
        mercury:      'Mercury planet surface',
        venus:        'Venus planet atmosphere',
        earth:        'Earth from space blue marble',
        mars:         'Mars planet surface rover',
        jupiter:      'Jupiter planet Great Red Spot',
        saturn:       'Saturn planet rings Cassini',
        uranus:       'Uranus planet Voyager',
        neptune:      'Neptune planet Voyager',

        // Карликовые планеты
        pluto:        'Pluto New Horizons heart',
        ceres:        'Ceres dwarf planet Dawn bright spots',
        eris:         'Eris dwarf planet Kuiper belt',
        haumea:       'Haumea dwarf planet elongated',
        makemake:     'Makemake dwarf planet Kuiper belt',
        gonggong:     'distant solar system body artist',
        quaoar:       'Quaoar Kuiper belt trans-neptunian',
        sedna:        'Sedna',
        orcus:        'Kuiper Belt binary',
        salacia:      'outer solar system object',

        // Спутники
        moon:         'Moon lunar surface Apollo',
        io:           'Io Jupiter moon volcanic eruption',
        europa:       'Europa Jupiter moon ice ocean',
        ganymede:     'Ganymede Jupiter moon largest',
        titan:        'Titan Saturn moon atmosphere Cassini',
        enceladus:    'Enceladus Saturn moon geysers ice',
        triton:       'Triton Neptune moon Voyager',
        callisto:     'Galileo spacecraft Jupiter Callisto moon flyby',
        miranda:      'Voyager 2 Uranus moon terrain cliffs',
        oberon:       'Voyager 2 Uranus outer moon surface',

        // Астероиды
        vesta:        'Vesta asteroid Dawn mission',
        pallas:       'Pallas asteroid belt',
        hygiea:       'Hygiea asteroid main belt',
        bennu:        'Bennu asteroid OSIRIS-REx sample',
        itokawa:      'Itokawa asteroid Hayabusa mission',
        ryugu:        'asteroid sample return',
        apophis:      'Apophis asteroid near Earth',
        eros:         'Eros asteroid NEAR Shoemaker',
        ida:          'Ida asteroid moon Dactyl Galileo',
        mathilde:     'Mathilde asteroid NEAR mission',

        // Кометы
        halley:       'Halley comet nucleus tail',
        churyumov:    'comet 67P Rosetta mission nucleus',
        'hale-bopp':  'Hale-Bopp comet bright tail',
        neowise:      'NEOWISE comet 2020 tail',
        encke:        'Encke comet short period',
        wild2:        'Wild 2 comet Stardust mission',
        tempel1:      'Deep Impact comet nucleus mission impactor',
        hyakutake:    'comet bright tail close approach Earth sky',
        shoemaker:    'Shoemaker-Levy 9 Jupiter impact fragments',
        lovejoy:      'Lovejoy comet green tail',

        // Галактики
        'milky-way':   'Milky Way galaxy center panorama',
        andromeda:     'Andromeda galaxy M31 Hubble',
        triangulum:    'Triangulum galaxy M33 Hubble',
        lmc:           'Large Magellanic Cloud Hubble',
        smc:           'Small Magellanic Cloud Hubble',
        whirlpool:     'Whirlpool galaxy M51 Hubble spiral',
        sombrero:      'Sombrero galaxy M104 Hubble',
        cartwheel:     'Cartwheel galaxy',
        'centaurus-a': 'Centaurus A NGC 5128 radio galaxy',
        bodes:         'Bode galaxy M81 spiral Hubble',

        // Туманности
        'orion-nebula':  'Orion Nebula M42 Hubble',
        'crab-nebula':   'Crab Nebula M1 supernova remnant Hubble',
        'ring-nebula':   'Ring Nebula M57 planetary Hubble',
        'eagle-nebula':  'Eagle Nebula pillars of creation Hubble',
        'helix-nebula':  'NGC 7293 Helix nebula planetary Hubble',
        'lagoon-nebula': 'NGC 6523 Lagoon nebula star forming',
        horsehead:       'Horsehead Nebula',
        butterfly:       'NGC 6302',
        'cat-eye':       'Cat Eye Nebula NGC',
        rosette:         'NGC 2244 Rosette nebula star cluster',

        // Чёрные дыры
        'sgr-a':       'Sagittarius A black hole Event Horizon',
        m87:           'M87 black hole shadow Event Horizon Telescope',
        'cygnus-x1':   'Cygnus X-1 black hole X-ray binary',
        grs1915:       'GRS 1915 microquasar X-ray jets Chandra',
        'v404-cygni':  'black hole X-ray binary Chandra outburst',
        'xte-j1650':   'stellar black hole X-ray Chandra',
        ngc1277:       'NGC 1277 compact galaxy massive black hole',
        holm15a:       'galaxy cluster black hole massive',
        'ic10-x1':     'IC 10 galaxy',
        ss433:         'SS 433 microquasar relativistic jets',

        // Квазары
        '3c273':      'quasar 3C 273 Hubble jet',
        apm08279:     'gravitational lens quasar',
        ton618:       'massive black hole quasar ultraluminous host galaxy',
        markarian:    'Markarian ultraluminous infrared galaxy active nucleus',
        '3c48':       'radio galaxy active nucleus quasar 3C Hubble',
        pks2349:      'Hubble quasar host galaxy',
        hs1700:       'galaxy cluster deep field Hubble',
        b1422:        'Einstein ring gravitational',
        'sdss-j1030': 'quasar Hubble distant',
        'ul-j0313':   'most distant quasar reionization early universe infrared',

        // Пульсары
        'psr-b1919':   'neutron star pulsar radio lighthouse',
        'crab-pulsar': 'Crab pulsar wind nebula',
        'psr-j0437':   'radio pulsar timing',
        'vela-pulsar': 'Vela pulsar supernova remnant Chandra X-ray',
        millisecond:   'millisecond pulsar PSR B1257 planets neutron star',
        'psr-j0030':   'NICER neutron star',
        'double-psr':  'neutron star binary system',
        'psr-b1509':   'PSR B1509 nebula hand of god Chandra',
        geminga:       'Geminga pulsar bow shock Chandra',
        magnetar:      'SGR 1806 magnetar giant flare X-ray',

        // Экзопланеты
        'proxima-b':    'Proxima Centauri b habitable exoplanet',
        'trappist-1e':  'TRAPPIST-1 system seven planets',
        'kepler-452b':  'Kepler 452b Earth twin exoplanet',
        '51-peg-b':     'exoplanet hot Jupiter 51 Pegasi',
        hd209458b:      'HD 209458 b atmosphere transit exoplanet',
        'gliese-667cc': 'red dwarf exoplanet habitable',
        'kepler-186f':  'Kepler 186f Earth-size habitable zone',
        'trappist-1d':  'TRAPPIST-1 rocky planet habitable',
        'k2-18b':       'Hubble atmosphere exoplanet water',
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
