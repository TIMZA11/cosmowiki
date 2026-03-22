/**
 * CosmoWiki — Каталог космических объектов
 * Данные категорий, объектов и маппинг на статьи Википедии
 * Версия 2.0 — расширенный каталог (10+ объектов в каждой категории)
 */

const CATEGORIES = [
    {
        id: 'stars',
        name: 'Звёзды',
        icon: '⭐',
        description: 'Раскалённые газовые шары, излучающие свет и тепло',
        objects: [
            { id: 'sun',          name: 'Солнце',              wiki: 'Солнце',                    distanceKm: 149600000 },
            { id: 'sirius',       name: 'Сириус',              wiki: 'Сириус',                    distanceKm: 8.134e+13 },
            { id: 'betelgeuse',   name: 'Бетельгейзе',         wiki: 'Бетельгейзе',               distanceKm: 6.08e+15 },
            { id: 'polaris',      name: 'Полярная звезда',     wiki: 'Полярная_звезда',           distanceKm: 4.07e+15 },
            { id: 'proxima',      name: 'Проксима Центавра',   wiki: 'Проксима_Центавра',         distanceKm: 4.01e+13 },
            { id: 'vega',         name: 'Вега',                wiki: 'Вега',                      distanceKm: 2.37e+14 },
            { id: 'altair',       name: 'Альтаир',             wiki: 'Альтаир',                   distanceKm: 1.60e+14 },
            { id: 'rigel',        name: 'Ригель',              wiki: 'Ригель',                    distanceKm: 7.73e+15 },
            { id: 'antares',      name: 'Антарес',             wiki: 'Антарес',                   distanceKm: 5.54e+15 },
            { id: 'aldebaran',    name: 'Альдебаран',          wiki: 'Альдебаран',                distanceKm: 1.97e+15 }
        ]
    },
    {
        id: 'planets',
        name: 'Планеты',
        icon: '🪐',
        description: 'Планеты Солнечной системы',
        objects: [
            { id: 'mercury', name: 'Меркурий', wiki: 'Меркурий_(планета)', distanceKm: 77000000 },
            { id: 'venus',   name: 'Венера',   wiki: 'Венера_(планета)',   distanceKm: 38000000 },
            { id: 'earth',   name: 'Земля',    wiki: 'Земля',             distanceKm: 0 },
            { id: 'mars',    name: 'Марс',     wiki: 'Марс_(планета)',    distanceKm: 55000000 },
            { id: 'jupiter', name: 'Юпитер',   wiki: 'Юпитер_(планета)',  distanceKm: 588000000 },
            { id: 'saturn',  name: 'Сатурн',   wiki: 'Сатурн_(планета)',  distanceKm: 1200000000 },
            { id: 'uranus',  name: 'Уран',     wiki: 'Уран_(планета)',    distanceKm: 2600000000 },
            { id: 'neptune', name: 'Нептун',   wiki: 'Нептун_(планета)',  distanceKm: 4300000000 }
        ]
    },
    {
        id: 'dwarf-planets',
        name: 'Карликовые планеты',
        icon: '🔵',
        description: 'Небольшие тела, вращающиеся вокруг Солнца',
        objects: [
            { id: 'pluto',       name: 'Плутон',    wiki: 'Плутон',                           distanceKm: 5900000000 },
            { id: 'ceres',       name: 'Церера',    wiki: 'Церера_(карликовая_планета)',       distanceKm: 413000000 },
            { id: 'eris',        name: 'Эрида',     wiki: 'Эрида_(карликовая_планета)',        distanceKm: 14500000000 },
            { id: 'haumea',      name: 'Хаумеа',   wiki: 'Хаумеа',                            distanceKm: 6450000000 },
            { id: 'makemake',    name: 'Макемаке',  wiki: 'Макемаке_(карликовая_планета)',     distanceKm: 6850000000 },
            { id: 'gonggong',    name: 'Гунгун',    wiki: 'Гунгун_(карликовая_планета)',       distanceKm: 16500000000 },
            { id: 'quaoar',      name: 'Квавар',    wiki: 'Квавар',                            distanceKm: 6500000000 },
            { id: 'sedna',       name: 'Седна',     wiki: 'Седна_(карликовая_планета)',        distanceKm: 13000000000 },
            { id: 'orcus',       name: 'Орк',       wiki: 'Орк_(карликовая_планета)',          distanceKm: 5900000000 },
            { id: 'salacia',     name: 'Салация',   wiki: 'Салация_(карликовая_планета)',      distanceKm: 6300000000 }
        ]
    },
    {
        id: 'moons',
        name: 'Спутники',
        icon: '🌙',
        description: 'Естественные спутники планет Солнечной системы',
        objects: [
            { id: 'moon',       name: 'Луна',       wiki: 'Луна',                distanceKm: 384400 },
            { id: 'io',         name: 'Ио',          wiki: 'Ио_(спутник)',        distanceKm: 588300000 },
            { id: 'europa',     name: 'Европа',      wiki: 'Европа_(спутник)',    distanceKm: 591100000 },
            { id: 'ganymede',   name: 'Ганимед',     wiki: 'Ганимед_(спутник)',   distanceKm: 594600000 },
            { id: 'titan',      name: 'Титан',       wiki: 'Титан_(спутник)',     distanceKm: 1222000000 },
            { id: 'enceladus',  name: 'Энцелад',     wiki: 'Энцелад_(спутник)',   distanceKm: 1238000000 },
            { id: 'triton',     name: 'Тритон',      wiki: 'Тритон_(спутник)',    distanceKm: 4338000000 },
            { id: 'callisto',   name: 'Каллисто',    wiki: 'Каллисто_(спутник)',  distanceKm: 594600000 },
            { id: 'miranda',    name: 'Миранда',     wiki: 'Миранда_(спутник)',   distanceKm: 2600000000 },
            { id: 'oberon',     name: 'Оберон',      wiki: 'Оберон_(спутник)',    distanceKm: 2600000000 }
        ]
    },
    {
        id: 'asteroids',
        name: 'Астероиды',
        icon: '🌑',
        description: 'Малые небесные тела Солнечной системы',
        objects: [
            { id: 'vesta',      name: 'Веста',      wiki: 'Веста_(астероид)',    distanceKm: 260000000 },
            { id: 'pallas',     name: 'Паллада',    wiki: 'Паллада_(астероид)', distanceKm: 414000000 },
            { id: 'hygiea',     name: 'Гигея',      wiki: 'Гигея_(астероид)',   distanceKm: 400000000 },
            { id: 'bennu',      name: 'Бенну',      wiki: 'Бенну_(астероид)',   distanceKm: 105000000 },
            { id: 'itokawa',    name: 'Итокава',    wiki: 'Итокава_(астероид)', distanceKm: 24000000 },
            { id: 'ryugu',      name: 'Рюгу',       wiki: 'Рюгу_(астероид)',    distanceKm: 180000000 },
            { id: 'apophis',    name: 'Апофис',     wiki: 'Апофис_(астероид)',  distanceKm: 37000000 },
            { id: 'eros',       name: 'Эрос',       wiki: 'Эрос_(астероид)',    distanceKm: 169000000 },
            { id: 'ida',        name: 'Ида',        wiki: 'Ида_(астероид)',     distanceKm: 356000000 },
            { id: 'mathilde',   name: 'Матильда',   wiki: 'Матильда_(астероид)', distanceKm: 396000000 }
        ]
    },
    {
        id: 'comets',
        name: 'Кометы',
        icon: '☄️',
        description: 'Ледяные тела с характерным хвостом',
        objects: [
            { id: 'halley',       name: 'Комета Галлея',             wiki: 'Комета_Галлея',                    distanceKm: 5240000000 },
            { id: 'churyumov',    name: 'Чурюмова — Герасименко',    wiki: 'Комета_Чурюмова_—_Герасименко',    distanceKm: 720000000 },
            { id: 'hale-bopp',    name: 'Комета Хейла — Боппа',      wiki: 'Комета_Хейла_—_Боппа',            distanceKm: 3.7e+13 },
            { id: 'neowise',      name: 'Комета NEOWISE',            wiki: 'C/2020_F3_(NEOWISE)',             distanceKm: 1.03e+11 },
            { id: 'encke',        name: 'Комета Энке',               wiki: 'Комета_Энке',                     distanceKm: 166000000 },
            { id: 'wild2',        name: 'Вильда 2',                  wiki: 'Вильда_2',                        distanceKm: 475000000 },
            { id: 'tempel1',      name: 'Темпеля 1',                 wiki: 'Темпеля_1',                       distanceKm: 460000000 },
            { id: 'hyakutake',    name: 'Комета Хякутакэ',           wiki: 'Комета_Хякутакэ',                 distanceKm: 1.5e+13 },
            { id: 'shoemaker',    name: 'Шумейкеров — Леви 9',       wiki: 'Шумейкеров_—_Леви_9',             distanceKm: 588000000 },
            { id: 'lovejoy',      name: 'Комета Лавджоя',            wiki: 'C/2014_Q2_(Lovejoy)',             distanceKm: 9.0e+10 }
        ]
    },
    {
        id: 'galaxies',
        name: 'Галактики',
        icon: '🌌',
        description: 'Гигантские скопления звёзд, газа и пыли',
        objects: [
            { id: 'milky-way',    name: 'Млечный Путь',                   wiki: 'Млечный_Путь',                   distanceKm: 0 },
            { id: 'andromeda',    name: 'Галактика Андромеды',             wiki: 'Галактика_Андромеды',             distanceKm: 2.37e+19 },
            { id: 'triangulum',   name: 'Галактика Треугольника',          wiki: 'Галактика_Треугольника',          distanceKm: 2.73e+19 },
            { id: 'lmc',          name: 'Большое Магелланово Облако',      wiki: 'Большое_Магелланово_Облако',      distanceKm: 1.58e+18 },
            { id: 'smc',          name: 'Малое Магелланово Облако',        wiki: 'Малое_Магелланово_Облако',        distanceKm: 1.96e+18 },
            { id: 'whirlpool',    name: 'Галактика Водоворот',             wiki: 'Водоворот_(галактика)',           distanceKm: 2.27e+20 },
            { id: 'sombrero',     name: 'Галактика Сомбреро',              wiki: 'Сомбреро_(галактика)',            distanceKm: 2.84e+20 },
            { id: 'cartwheel',    name: 'Галактика Тележное колесо',       wiki: 'Тележное_колесо_(галактика)',     distanceKm: 4.73e+21 },
            { id: 'centaurus-a',  name: 'Центавр A',                      wiki: 'Центавр_A',                      distanceKm: 1.19e+20 },
            { id: 'bodes',        name: 'Галактика Боде',                  wiki: 'Галактика_Боде',                 distanceKm: 1.18e+20 }
        ]
    },
    {
        id: 'nebulae',
        name: 'Туманности',
        icon: '🌊',
        description: 'Облака газа и пыли в межзвёздном пространстве',
        objects: [
            { id: 'orion-nebula',    name: 'Туманность Ориона',         wiki: 'Туманность_Ориона',         distanceKm: 1.27e+16 },
            { id: 'crab-nebula',     name: 'Крабовидная туманность',    wiki: 'Крабовидная_туманность',    distanceKm: 6.15e+16 },
            { id: 'ring-nebula',     name: 'Туманность Кольцо',         wiki: 'Туманность_Кольцо',         distanceKm: 2.28e+16 },
            { id: 'eagle-nebula',    name: 'Туманность Орёл',           wiki: 'Туманность_Орёл',           distanceKm: 6.60e+16 },
            { id: 'helix-nebula',    name: 'Туманность Улитка',         wiki: 'Туманность_Улитка',         distanceKm: 6.39e+15 },
            { id: 'lagoon-nebula',   name: 'Туманность Лагуна',         wiki: 'Туманность_Лагуна',         distanceKm: 1.25e+16 },
            { id: 'horsehead',       name: 'Туманность Конская голова', wiki: 'Туманность_Конская_голова', distanceKm: 1.51e+16 },
            { id: 'butterfly',       name: 'Туманность Бабочка',        wiki: 'Туманность_Бабочка',        distanceKm: 1.34e+16 },
            { id: 'cat-eye',         name: 'Туманность Кошачий глаз',  wiki: 'Туманность_Кошачий_глаз',   distanceKm: 3.30e+15 },
            { id: 'rosette',         name: 'Туманность Розетка',        wiki: 'Туманность_Розетка',        distanceKm: 5.2e+16 }
        ]
    },
    {
        id: 'black-holes',
        name: 'Чёрные дыры',
        icon: '⚫',
        description: 'Области пространства с экстремальной гравитацией',
        objects: [
            { id: 'sgr-a',        name: 'Стрелец A*',         wiki: 'Стрелец_A*',             distanceKm: 2.47e+17 },
            { id: 'm87',          name: 'M87*',               wiki: 'Messier_87',             distanceKm: 5.07e+20 },
            { id: 'cygnus-x1',    name: 'Лебедь X-1',        wiki: 'Лебедь_X-1',            distanceKm: 5.68e+16 },
            { id: 'grs1915',      name: 'GRS 1915+105',       wiki: 'GRS_1915+105',           distanceKm: 3.09e+17 },
            { id: 'v404-cygni',   name: 'V404 Лебедя',       wiki: 'V404_Лебедя',            distanceKm: 2.39e+17 },
            { id: 'xte-j1650',    name: 'XTE J1650-500',      wiki: 'XTE_J1650-500',          distanceKm: 6.17e+17 },
            { id: 'ngc1277',      name: 'NGC 1277',           wiki: 'NGC_1277',               distanceKm: 6.76e+21 },
            { id: 'holm15a',      name: 'Holm 15A*',          wiki: 'Abell_85',               distanceKm: 2.37e+21 },
            { id: 'ic10-x1',      name: 'IC 10 X-1',         wiki: 'IC_10',                  distanceKm: 7.10e+18 },
            { id: 'ss433',        name: 'SS 433',             wiki: 'SS_433',                 distanceKm: 1.71e+17 }
        ]
    },
    {
        id: 'quasars',
        name: 'Квазары',
        icon: '💠',
        description: 'Сверхъяркие ядра далёких галактик',
        objects: [
            { id: '3c273',        name: '3C 273',            wiki: '3C_273',            distanceKm: 2.4e+22 },
            { id: 'apm08279',     name: 'APM 08279+5255',    wiki: 'APM_08279+5255',    distanceKm: 1.13e+23 },
            { id: 'ton618',       name: 'TON 618',           wiki: 'TON_618',           distanceKm: 1.05e+23 },
            { id: 'markarian',    name: 'Маркарян 231',      wiki: 'Маркарян_231',      distanceKm: 5.6e+21 },
            { id: '3c48',         name: '3C 48',             wiki: '3C_48',             distanceKm: 4.7e+22 },
            { id: 'pks2349',      name: 'PKS 2349-014',      wiki: 'PKS_2349-014',      distanceKm: 4.4e+22 },
            { id: 'hs1700',       name: 'HS 1700+6416',      wiki: 'HS_1700+6416',      distanceKm: 1.1e+23 },
            { id: 'b1422',        name: 'B1422+231',         wiki: 'B1422+231',         distanceKm: 1.08e+23 },
            { id: 'sdss-j1030',   name: 'SDSS J1030+0524',   wiki: 'SDSS_J1030+0524',   distanceKm: 1.18e+23 },
            { id: 'ul-j0313',     name: 'J0313-1806',        wiki: 'J0313-1806',        distanceKm: 1.25e+23 }
        ]
    },
    {
        id: 'pulsars',
        name: 'Пульсары',
        icon: '📡',
        description: 'Быстровращающиеся нейтронные звёзды',
        objects: [
            { id: 'psr-b1919',    name: 'PSR B1919+21',         wiki: 'PSR_B1919+21',         distanceKm: 2.28e+16 },
            { id: 'crab-pulsar',  name: 'Крабовидный пульсар',  wiki: 'Крабовидный_пульсар',  distanceKm: 6.15e+16 },
            { id: 'psr-j0437',    name: 'PSR J0437-4715',       wiki: 'PSR_J0437-4715',       distanceKm: 1.39e+15 },
            { id: 'vela-pulsar',  name: 'Пульсар Вела',         wiki: 'Пульсар_в_Парусах',    distanceKm: 9.12e+15 },
            { id: 'millisecond',  name: 'PSR B1257+12',         wiki: 'PSR_B1257+12',         distanceKm: 2.28e+16 },
            { id: 'psr-j0030',    name: 'PSR J0030+0451',       wiki: 'PSR_J0030+0451',       distanceKm: 3.09e+15 },
            { id: 'double-psr',   name: 'PSR J0737-3039',       wiki: 'PSR_J0737-3039A/B',    distanceKm: 1.98e+16 },
            { id: 'psr-b1509',    name: 'PSR B1509-58',         wiki: 'PSR_B1509-58',         distanceKm: 1.70e+16 },
            { id: 'geminga',      name: 'Геминга',              wiki: 'Геминга',              distanceKm: 1.02e+15 },
            { id: 'magnetar',     name: 'SGR 1806-20',          wiki: 'SGR_1806-20',          distanceKm: 4.64e+17 }
        ]
    },
    {
        id: 'exoplanets',
        name: 'Экзопланеты',
        icon: '🪐',
        description: 'Планеты за пределами Солнечной системы',
        objects: [
            { id: 'proxima-b',    name: 'Проксима Центавра b',  wiki: 'Проксима_Центавра_b',  distanceKm: 4.01e+13 },
            { id: 'trappist-1e',  name: 'TRAPPIST-1 e',         wiki: 'TRAPPIST-1_e',         distanceKm: 3.73e+14 },
            { id: 'kepler-452b',  name: 'Kepler-452b',          wiki: 'Kepler-452_b',         distanceKm: 1.69e+16 },
            { id: '51-peg-b',     name: '51 Пегаса b',          wiki: '51_Пегаса_b',          distanceKm: 4.73e+14 },
            { id: 'hd209458b',    name: 'HD 209458 b',          wiki: 'HD_209458_b',          distanceKm: 1.47e+15 },
            { id: 'gliese-667cc', name: 'Gliese 667 Cc',        wiki: 'Gliese_667_Cc',        distanceKm: 2.17e+14 },
            { id: 'kepler-186f',  name: 'Kepler-186f',          wiki: 'Kepler-186_f',         distanceKm: 5.17e+15 },
            { id: 'trappist-1d',  name: 'TRAPPIST-1 d',         wiki: 'TRAPPIST-1_d',         distanceKm: 3.73e+14 },
            { id: 'k2-18b',       name: 'K2-18b',               wiki: 'K2-18b',               distanceKm: 1.24e+15 },
            { id: 'toi-700d',     name: 'TOI 700 d',            wiki: 'TOI_700_d',            distanceKm: 9.64e+14 }
        ]
    }
];
