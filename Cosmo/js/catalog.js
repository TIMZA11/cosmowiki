/**
 * CosmoWiki — Каталог космических объектов
 * Данные категорий, объектов и маппинг на статьи Википедии
 */

const CATEGORIES = [
    {
        id: 'stars',
        name: 'Звёзды',
        icon: '\u2B50',
        description: 'Раскалённые газовые шары, излучающие свет и тепло',
        objects: [
            { id: 'sun',        name: 'Солнце',              wiki: 'Солнце',              distanceKm: 149600000 },
            { id: 'sirius',     name: 'Сириус',              wiki: 'Сириус',              distanceKm: 8.134e+13 },
            { id: 'betelgeuse', name: 'Бетельгейзе',         wiki: 'Бетельгейзе',         distanceKm: 6.08e+15 },
            { id: 'polaris',    name: 'Полярная звезда',     wiki: 'Полярная_звезда',     distanceKm: 4.07e+15 },
            { id: 'proxima',    name: 'Проксима Центавра',   wiki: 'Проксима_Центавра',   distanceKm: 4.01e+13 },
            { id: 'vega',       name: 'Вега',                wiki: 'Вега',                distanceKm: 2.37e+14 },
            { id: 'altair',     name: 'Альтаир',             wiki: 'Альтаир',             distanceKm: 1.60e+14 }
        ]
    },
    {
        id: 'planets',
        name: 'Планеты',
        icon: '\uD83E\uDE90',
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
        icon: '\uD83D\uDD35',
        description: 'Небольшие тела, вращающиеся вокруг Солнца',
        objects: [
            { id: 'pluto',    name: 'Плутон',   wiki: 'Плутон',           distanceKm: 5900000000 },
            { id: 'ceres',    name: 'Церера',    wiki: 'Церера_(карликовая_планета)', distanceKm: 413000000 },
            { id: 'eris',     name: 'Эрида',     wiki: 'Эрида_(карликовая_планета)', distanceKm: 14500000000 },
            { id: 'haumea',   name: 'Хаумеа',    wiki: 'Хаумеа',          distanceKm: 6450000000 },
            { id: 'makemake', name: 'Макемаке',   wiki: 'Макемаке_(карликовая_планета)', distanceKm: 6850000000 }
        ]
    },
    {
        id: 'moons',
        name: 'Спутники',
        icon: '\uD83C\uDF19',
        description: 'Естественные спутники планет Солнечной системы',
        objects: [
            { id: 'moon',      name: 'Луна',      wiki: 'Луна',                distanceKm: 384400 },
            { id: 'io',        name: 'Ио',         wiki: 'Ио_(спутник)',        distanceKm: 588300000 },
            { id: 'europa',    name: 'Европа',     wiki: 'Европа_(спутник)',    distanceKm: 591100000 },
            { id: 'ganymede',  name: 'Ганимед',    wiki: 'Ганимед_(спутник)',   distanceKm: 594600000 },
            { id: 'titan',     name: 'Титан',      wiki: 'Титан_(спутник)',     distanceKm: 1222000000 },
            { id: 'enceladus', name: 'Энцелад',    wiki: 'Энцелад_(спутник)',   distanceKm: 1238000000 },
            { id: 'triton',    name: 'Тритон',     wiki: 'Тритон_(спутник)',    distanceKm: 4338000000 }
        ]
    },
    {
        id: 'asteroids',
        name: 'Астероиды',
        icon: '\u2604\uFE0F',
        description: 'Малые небесные тела Солнечной системы',
        objects: [
            { id: 'vesta',    name: 'Веста',    wiki: 'Веста_(астероид)',  distanceKm: 260000000 },
            { id: 'pallas',   name: 'Паллада',  wiki: 'Паллада_(астероид)', distanceKm: 414000000 },
            { id: 'hygiea',   name: 'Гигея',    wiki: 'Гигея_(астероид)', distanceKm: 400000000 },
            { id: 'bennu',    name: 'Бенну',    wiki: 'Бенну_(астероид)', distanceKm: 105000000 },
            { id: 'itokawa',  name: 'Итокава',  wiki: 'Итокава_(астероид)', distanceKm: 24000000 }
        ]
    },
    {
        id: 'comets',
        name: 'Кометы',
        icon: '\u2604\uFE0F',
        description: 'Ледяные тела с характерным хвостом',
        objects: [
            { id: 'halley',    name: 'Комета Галлея',              wiki: 'Комета_Галлея',              distanceKm: 5240000000 },
            { id: 'churyumov', name: 'Чурюмова — Герасименко',     wiki: 'Комета_Чурюмова_—_Герасименко', distanceKm: 720000000 },
            { id: 'hale-bopp', name: 'Комета Хейла — Боппа',       wiki: 'Комета_Хейла_—_Боппа',       distanceKm: 3.7e+13 },
            { id: 'neowise',  name: 'Комета NEOWISE',              wiki: 'C/2020_F3_(NEOWISE)',         distanceKm: 1.03e+11 }
        ]
    },
    {
        id: 'galaxies',
        name: 'Галактики',
        icon: '\uD83C\uDF0C',
        description: 'Гигантские скопления звёзд, газа и пыли',
        objects: [
            { id: 'milky-way',   name: 'Млечный Путь',                    wiki: 'Млечный_Путь',                    distanceKm: 0 },
            { id: 'andromeda',   name: 'Галактика Андромеды',              wiki: 'Галактика_Андромеды',              distanceKm: 2.37e+19 },
            { id: 'triangulum', name: 'Галактика Треугольника',           wiki: 'Галактика_Треугольника',           distanceKm: 2.73e+19 },
            { id: 'lmc',        name: 'Большое Магелланово Облако',       wiki: 'Большое_Магелланово_Облако',       distanceKm: 1.58e+18 }
        ]
    },
    {
        id: 'nebulae',
        name: 'Туманности',
        icon: '\uD83C\uDF0A',
        description: 'Облака газа и пыли в межзвёздном пространстве',
        objects: [
            { id: 'orion-nebula', name: 'Туманность Ориона',       wiki: 'Туманность_Ориона',       distanceKm: 1.27e+16 },
            { id: 'crab-nebula',  name: 'Крабовидная туманность',  wiki: 'Крабовидная_туманность',  distanceKm: 6.15e+16 },
            { id: 'ring-nebula',  name: 'Туманность Кольцо',       wiki: 'Туманность_Кольцо',       distanceKm: 2.28e+16 },
            { id: 'eagle-nebula', name: 'Туманность Орёл',         wiki: 'Туманность_Орёл',         distanceKm: 6.60e+16 }
        ]
    },
    {
        id: 'black-holes',
        name: 'Чёрные дыры',
        icon: '\u26AB',
        description: 'Области пространства с экстремальной гравитацией',
        objects: [
            { id: 'sgr-a',     name: 'Стрелец A*',   wiki: 'Стрелец_A*',            distanceKm: 2.47e+17 },
            { id: 'm87',       name: 'M87*',          wiki: 'Messier_87',            distanceKm: 5.07e+20 },
            { id: 'cygnus-x1', name: 'Лебедь X-1',   wiki: 'Лебедь_X-1',           distanceKm: 5.68e+16 }
        ]
    },
    {
        id: 'quasars',
        name: 'Квазары',
        icon: '\uD83D\uDCA0',
        description: 'Сверхъяркие ядра далёких галактик',
        objects: [
            { id: '3c273',      name: '3C 273',            wiki: '3C_273',            distanceKm: 2.4e+22 },
            { id: 'apm08279',   name: 'APM 08279+5255',    wiki: 'APM_08279+5255',    distanceKm: 1.13e+23 },
            { id: 'ton618',     name: 'TON 618',           wiki: 'TON_618',           distanceKm: 1.05e+23 },
            { id: 'markarian',  name: 'Маркарян 231',      wiki: 'Маркарян_231',      distanceKm: 5.6e+21 }
        ]
    },
    {
        id: 'pulsars',
        name: 'Пульсары',
        icon: '\uD83D\uDCE1',
        description: 'Быстровращающиеся нейтронные звёзды',
        objects: [
            { id: 'psr-b1919',  name: 'PSR B1919+21',         wiki: 'PSR_B1919+21',         distanceKm: 2.28e+16 },
            { id: 'crab-pulsar', name: 'Крабовидный пульсар', wiki: 'Крабовидный_пульсар',  distanceKm: 6.15e+16 },
            { id: 'psr-j0437',  name: 'PSR J0437-4715',       wiki: 'PSR_J0437-4715',       distanceKm: 1.39e+15 },
            { id: 'vela-pulsar', name: 'Пульсар Вела',        wiki: 'Пульсар_в_Парусах',    distanceKm: 9.12e+15 }
        ]
    },
    {
        id: 'exoplanets',
        name: 'Экзопланеты',
        icon: '\uD83E\uDE90',
        description: 'Планеты за пределами Солнечной системы',
        objects: [
            { id: 'proxima-b',   name: 'Проксима Центавра b', wiki: 'Проксима_Центавра_b', distanceKm: 4.01e+13 },
            { id: 'trappist-1e', name: 'TRAPPIST-1 e',        wiki: 'TRAPPIST-1_e',        distanceKm: 3.73e+14 },
            { id: 'kepler-452b', name: 'Kepler-452b',          wiki: 'Kepler-452_b',        distanceKm: 1.69e+16 },
            { id: '51-peg-b',   name: '51 Пегаса b',          wiki: '51_Пегаса_b',         distanceKm: 4.73e+14 },
            { id: 'hd209458b',  name: 'HD 209458 b',          wiki: 'HD_209458_b',         distanceKm: 1.47e+15 }
        ]
    }
];
