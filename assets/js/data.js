/* =====================================================================
   Body Space — усі дані сайту в одному місці.
   Сторінки будуються з цього файлу. Щоб змінити ціну, майстриню чи
   посилання — міняйте тут, і зміниться на всіх сторінках.

   Джерела: сторіс-хайлайти Instagram, живі сторінки Altegio (11.11.2026),
   Google. Нічого не вигадано: чого немає — null і позначка
   «// TODO власниця».
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- Бренд і контакти ---------- */
  const brand = {
    name: "Body Space",
    tagline: "Місце, де про вас турбуються",       // з біо Instagram
    about: "Масаж | для вагітних | ендосфера | Київ", // з біо Instagram
    note: "Усі майстрині — дівчата",                 // з біо Instagram
    instagram: "https://www.instagram.com/body__space/",
    instagramHandle: "@body__space",
    direct: "https://ig.me/m/body__space",          // запасний шлях запису
    telegram: "https://t.me/+OLutqxuYHAtlZDY6",
    threads: "https://www.threads.net/@body__space",
    altegioNetwork: "https://n803030.alteg.io/select-city/4/select-branch",
    altegioBase: "https://n803030.alteg.io/company/",
    phone: null,   // TODO власниця: номер телефону (одного чи кожної студії)
    email: null,   // TODO власниця: пошта для заявок Formspree
    instagramFollowers: 9390 // станом на 11.11.2026
  };

  /* ---------- Студії ----------
     hours — [відкриття, закриття] за київським часом, щодня (біо Instagram).
     lat/lng — з OpenStreetMap, для сортування за відстанню. */
  const studios = [
    {
      id: "obolon",
      district: "Оболонь",
      complex: null,                 // TODO власниця: назва ЖК на Оболоні (якщо є)
      label: "Оболонь",
      address: "вул. Героїв полку «Азов», 12в",
      landmark: "Біля метро «Оболонь»",
      hours: [9, 21],
      days: "Пн–Нд",
      lat: 50.5040, lng: 30.4908,
      altegioId: 754773,
      google: { rating: 4.8, count: 39 },
      hasTesters: true,              // тестери гелів White Mandarin — лише тут
      phone: null,                   // TODO власниця
      howToGet: null,                // TODO власниця: вхід, поверх, паркінг
      entrancePhoto: null,           // TODO власниця: фото входу
      interiorPhotos: []             // TODO власниця: 2–3 фото інтер'єру
    },
    {
      id: "teremky",
      district: "Теремки",
      complex: "ЖК Нова Англія",
      label: "Теремки | ЖК Нова Англія",
      address: "вул. Михайла Максимовича, 24б",
      landmark: "Біля метро «Васильківська»",
      hours: [9, 21],
      days: "Пн–Нд",
      lat: 50.3935, lng: 30.4743,
      altegioId: 771775,
      google: { rating: 5.0, count: 1 },
      hasTesters: false,
      phone: null,
      howToGet: null,
      entrancePhoto: null,
      interiorPhotos: []
    },
    {
      id: "solomianka",
      district: "Солом’янка",
      complex: "ЖК Смарагдовий",
      label: "Солом’янка | ЖК Смарагдовий",
      address: "вул. Генерала Шаповала, 2а",
      landmark: "Усередині Naumova stretching studio, поруч Солом’янський ландшафтний парк",
      hours: [9, 21],
      days: "Пн–Нд",
      lat: 50.4306, lng: 30.4832,
      altegioId: 771774,
      google: { rating: 5.0, count: 28 },
      hasTesters: false,
      phone: null,
      howToGet: null,
      entrancePhoto: null,
      interiorPhotos: []
    },
    {
      id: "varshavskyi",
      district: "Поділ",            // TODO власниця: як ви називаєте район (Виноградар? Поділ?)
      complex: "ЖК Варшавський+",
      label: "ЖК Варшавський+",
      address: "вул. Олександра Олеся, 8а",
      landmark: "Поруч ЖК Варшавський 3",
      hours: [9, 21],
      days: "Пн–Нд",
      lat: 50.5003, lng: 30.4082,    // приблизно, за ЖК Варшавський 3
      altegioId: 754774,
      google: null,                  // TODO власниця: профілю в Google не знайдено
      hasTesters: false,
      phone: null,
      howToGet: null,
      entrancePhoto: null,
      interiorPhotos: []
    }
  ];

  /* ---------- Категорії прайсу ---------- */
  const categories = [
    { id: "ozdorovchyi",  name: "Оздоровчий масаж" },
    { id: "vagitnym",     name: "Для вагітних" },
    { id: "figura",       name: "Корекція фігури" },
    { id: "endosfera",    name: "Ендосфера" },
    { id: "vidnovlennia", name: "Відновлення" },
    { id: "kompleksy",    name: "Комплекси" },
    { id: "obhortannia",  name: "Обгортання" },
    { id: "teipuvannia",  name: "Тейпування" }
  ];

  /* ---------- Послуги ----------
     durations — хвилини; price.top / price.lead — ціни рівнів «топ» і
     «провідна» в тому ж порядку, що й durations. Якщо ціна одна для всіх —
     price.all. steps — 3 кроки процедури (TODO власниця: перевірити
     формулювання). product — засіб, яким працюють, якщо відомо. */
  const services = [
    // Оздоровчий масаж
    { id: "spyna", cat: "ozdorovchyi", name: "Масаж спини",
      short: "Шия, плечі, лопатки й поперек — там, де накопичується напруга від сидячої роботи.",
      durations: [45, 60], price: { top: [1150, 1300], lead: [1300, 1500] },
      steps: ["Розмова про самопочуття і бажаний тиск", "Розігрів і глибше пропрацювання м’язів спини та шиї", "Спокійне завершення й кілька хвилин тиші"],
      product: null },
    { id: "zahalnyi", cat: "ozdorovchyi", name: "Загальний масаж",
      short: "Усе тіло від стоп до шиї — коли хочеться відчути легкість повністю.",
      durations: [60, 90, 120], price: { top: [1300, 1800, 2300], lead: [1500, 2050, 2550] },
      steps: ["Розмова про самопочуття і зони, що турбують", "Масаж усього тіла в комфортному для вас темпі", "Спокійне завершення й кілька хвилин тиші"],
      product: null },
    { id: "limfodrenazh", cat: "ozdorovchyi", name: "Лімфодренажний масаж",
      short: "М’які ритмічні рухи для відчуття легкості в тілі й ногах.",
      durations: [60], price: { top: [1300], lead: [1500] },
      steps: ["Розмова про самопочуття", "М’які ритмічні рухи по всьому тілу", "Відпочинок після процедури"],
      product: null },
    { id: "oblychchia", cat: "ozdorovchyi", name: "Масаж обличчя",
      short: "Обличчя, шия й зона декольте — для свіжого вигляду і розслаблених м’язів обличчя.",
      durations: [40, 60], price: { top: [1150, 1300], lead: [1300, 1500] },
      steps: ["Очищення шкіри", "Масаж обличчя, шиї та декольте", "За бажанням — доглядова маска"],
      product: null },

    // Для вагітних (ціни з Altegio)
    { id: "vagitni-spyna", cat: "vagitnym", name: "Масаж спини для вагітних",
      short: "Зони сідниць, грудний відділ, шия та руки.",
      durations: [40], price: { top: [1150], lead: [1300] },
      steps: ["Розмова про термін і самопочуття", "Комфортне положення — лежачи на боці або сидячи", "М’які, делікатні рухи"],
      product: null, pregnancy: true },
    { id: "vagitni-zahalnyi", cat: "vagitnym", name: "Загальний масаж для вагітних",
      short: "Усе тіло, окрім попереку та живота.",
      durations: [60, 90], price: { top: [1300, 1800], lead: [1500, 2050] },
      steps: ["Розмова про термін і самопочуття", "Комфортне положення — лежачи на боці або сидячи", "М’які, делікатні рухи"],
      product: null, pregnancy: true },
    { id: "vagitni-oblychchia", cat: "vagitnym", name: "Загальний масаж для вагітних + обличчя",
      short: "Для максимального розслаблення.",
      durations: [90], price: { top: [2200], lead: [2500] },
      steps: ["Розмова про термін і самопочуття", "Масаж тіла в комфортному положенні", "Масаж обличчя наприкінці"],
      product: null, pregnancy: true },

    // Корекція фігури
    { id: "antytselulitnyi", cat: "figura", name: "Антицелюлітний масаж",
      short: "Інтенсивний масаж для тонусу й гладкості шкіри.",
      durations: [60, 75], price: { top: [1400, 1650], lead: [1600, 1850] },
      steps: ["Розмова про зони, з якими працюємо", "Інтенсивний масаж проблемних зон", "Нанесення засобу для догляду"],
      product: null },
    { id: "antytselulitnyi-zona", cat: "figura", name: "Антицелюлітний масаж (одна зона)",
      short: "Коли хочеться попрацювати з однією зоною.",
      durations: [30, 40], price: { top: [1050, 1200], lead: [1200, 1400] },
      steps: ["Обираємо зону", "Інтенсивний масаж зони", "Нанесення засобу для догляду"],
      product: null },
    { id: "modeliuiuchyi", cat: "figura", name: "Моделюючий масаж",
      short: "Довга процедура для тонусу й підтягнутого вигляду тіла.",
      durations: [90], price: { top: [1900], lead: [2150] },
      steps: ["Розмова про зони, з якими працюємо", "Моделюючий масаж тіла", "Нанесення засобу для догляду"],
      product: null },

    // Ендосфера (тіло; курси — у розділі endosphere нижче)
    { id: "endosfera-test", cat: "endosfera", name: "Тест-драйв ендосфери",
      short: "30 хвилин на апараті — щоб спробувати процедуру. Ноги, сідниці, талія, живіт.",
      durations: [30], price: { all: [850] },
      steps: ["Знайомство з апаратом і розмова", "Процедура на зонах ніг, сідниць, талії й живота", "Порада, чи варто брати курс"],
      product: null },
    { id: "endosfera", cat: "endosfera", name: "Ендосфера",
      short: "Апаратний масаж тіла. 45 хв — ноги, сідниці, спина, живіт; 60 хв — ще стопи, руки й долоні.",
      durations: [45, 60], price: { top: [1300, 1600], lead: [1400, 1700] },
      steps: ["Розмова й вибір зон", "Апаратний масаж на ендосфері", "Порада щодо догляду вдома"],
      product: null },
    { id: "endosfera-oblychchia", cat: "endosfera", name: "Ендосфера обличчя",
      short: "Зона декольте, шия, обличчя.",
      durations: [30], price: { top: [800], lead: [900] },
      steps: ["Очищення шкіри", "Апаратний масаж обличчя, шиї й декольте", "Догляд після процедури"],
      product: null },
    { id: "endosfera-kompleks", cat: "endosfera", name: "Ендосфера тіла + обличчя",
      short: "Стопи, ноги, сідниці, спина, руки, долоні й обличчя за один візит.",
      durations: [75], price: { top: [1950], lead: [2050] },
      steps: ["Розмова й вибір зон", "Ендосфера тіла", "Ендосфера обличчя"],
      product: null },

    // Відновлення
    { id: "sportyvnyi", cat: "vidnovlennia", name: "Спортивний масаж",
      short: "Глибока робота з м’язами після тренувань і навантажень.",
      durations: [60, 90], price: { top: [1400, 1900], lead: [1600, 2150] },
      steps: ["Розмова про навантаження і зони, що турбують", "Глибоке пропрацювання м’язів", "Розтягнення й спокійне завершення"],
      product: null },
    { id: "relaks", cat: "vidnovlennia", name: "Релакс-масаж",
      short: "М’які, плавні рухи й глибокий, але комфортний вплив. Якщо заснете — це цілком нормально.",
      durations: [60, 90], price: { top: [1300, 1800], lead: [1500, 2050] },
      steps: ["Тиша, тепле світло й зручне положення", "М’які, плавні рухи по всьому тілу", "Кілька хвилин, щоб повільно повернутися"],
      product: null },
    { id: "presoterapiia", cat: "vidnovlennia", name: "Пресотерапія",
      short: "Апаратна процедура для відчуття легкості в ногах.",
      durations: [40], price: { top: [700], lead: [750] },
      steps: ["Зручне положення лежачи", "Апаратна процедура", "Відпочинок після процедури"],
      product: null },
    { id: "stoun", cat: "vidnovlennia", name: "Стоун-масаж",
      short: "Масаж з теплим камінням — для глибокого розслаблення.",
      durations: [90], price: { top: [2100], lead: [2250] },
      steps: ["Підготовка теплого каміння", "Масаж тіла з камінням", "Спокійне завершення"],
      product: null },

    // Комплекси
    { id: "kompleks-zahalnyi-oblychchia", cat: "kompleksy", name: "Загальний масаж + масаж обличчя",
      short: "Тіло й обличчя за один візит.",
      durations: [90, 120], price: { top: [2200, 2600], lead: [2500, 2950] },
      steps: ["Розмова про самопочуття", "Загальний масаж", "Масаж обличчя"], product: null },
    { id: "kompleks-spyna-endosfera", cat: "kompleksy", name: "Масаж спини + ендосфера",
      short: "Ручний масаж спини і апаратна процедура.",
      durations: [90], price: { top: [2100], lead: [2300] },
      steps: ["Масаж спини", "Ендосфера", "Порада щодо догляду"], product: null },
    { id: "kompleks-zahalnyi-endosfera", cat: "kompleksy", name: "Загальний масаж + ендосфера",
      short: "Дві послуги за вигіднішою ціною.",
      durations: [90], price: { top: [1950], lead: [2100] },
      steps: ["Загальний масаж", "Ендосфера", "Порада щодо догляду"], product: null },
    { id: "kompleks-antytselulit-obhortannia", cat: "kompleksy", name: "Антицелюлітний масаж + обгортання (до грудей)",
      short: "Масаж і обгортання за один візит.",
      durations: [135], price: { top: [2300], lead: [2500] },
      steps: ["Антицелюлітний масаж", "Обгортання", "Відпочинок у теплі"], product: null },
    { id: "kompleks-modeliuiuchyi-obhortannia", cat: "kompleksy", name: "Моделюючий масаж + обгортання (до грудей)",
      short: "Найдовший ритуал для тіла.",
      durations: [165], price: { top: [2800], lead: [3000] },
      steps: ["Моделюючий масаж", "Обгортання", "Відпочинок у теплі"], product: null },
    { id: "kompleks-obhortannia-oblychchia", cat: "kompleksy", name: "Обгортання (до грудей) + масаж обличчя 40 хв",
      short: "Поки працює обгортання — масаж обличчя.",
      durations: [75], price: { top: [2100], lead: [2250] },
      steps: ["Обгортання", "Масаж обличчя", "Завершення"], product: null },

    // Обгортання (одна ціна)
    { id: "obh-massena", cat: "obhortannia", name: "Обгортання MASSENA",
      short: "Зволожуюче, антицелюлітне або ліфтингове — на вибір.",
      durations: [75], price: { all: [1200] }, steps: null, product: "Massena" },
    { id: "obh-massena-bandazh", cat: "obhortannia", name: "Бандажне обгортання Massena",
      short: "Антицелюлітне, лімфодренажне.",
      durations: [75], price: { all: [1300] }, steps: null, product: "Massena" },
    { id: "obh-celo-hrudy", cat: "obhortannia", name: "Термоактивне обгортання Celo gel (до грудей)",
      short: "Зігріваюче обгортання.",
      durations: [75], price: { all: [1100] }, steps: null, product: "STYX" },
    { id: "obh-celo-tilo", cat: "obhortannia", name: "Термоактивне обгортання Celo gel (все тіло)",
      short: "Зігріваюче обгортання всього тіла.",
      durations: [75], price: { all: [1300] }, steps: null, product: "STYX" },
    { id: "obh-viski-hrudy", cat: "obhortannia", name: "«Віскі» сповивання (до грудей)",
      short: "Сповивання STYX.",
      durations: [90], price: { all: [1500] }, steps: null, product: "STYX" },
    { id: "obh-viski-tilo", cat: "obhortannia", name: "«Віскі» сповивання (все тіло)",
      short: "Сповивання STYX усього тіла.",
      durations: [90], price: { all: [1850] }, steps: null, product: "STYX" },
    { id: "obh-parafin", cat: "obhortannia", name: "Обгортання холодним парафіном",
      short: "Обгортання від Bruno Vasari.",
      durations: [90], price: { all: [1800] }, steps: null, product: "Bruno Vasari" },

    // Тейпування (одна ціна, без тривалості)
    { id: "teip-miazovi", cat: "teipuvannia", name: "М’язові аплікації", group: "Реабілітаційне",
      durations: null, price: { all: [400] }, priceFrom: true, steps: null, product: null },
    { id: "teip-trapetsiia", cat: "teipuvannia", name: "Трапеція", group: "Реабілітаційне", durations: null, price: { all: [500] }, steps: null, product: null },
    { id: "teip-kholka", cat: "teipuvannia", name: "Холка", group: "Реабілітаційне", durations: null, price: { all: [600] }, steps: null, product: null },
    { id: "teip-viddil", cat: "teipuvannia", name: "Грудний або поперековий відділ", group: "Реабілітаційне", durations: null, price: { all: [650] }, steps: null, product: null },
    { id: "teip-postava", cat: "teipuvannia", name: "Корекція постави", group: "Реабілітаційне", durations: null, price: { all: [1000] }, steps: null, product: null },
    { id: "teip-suglob", cat: "teipuvannia", name: "Коліно, плече або лікоть", group: "Реабілітаційне", note: "два — 600 грн",
      durations: null, price: { all: [400] }, steps: null, product: null },
    { id: "teip-zhyvit", cat: "teipuvannia", name: "Живіт", group: "Естетичне", durations: null, price: { all: [600] }, steps: null, product: null },
    { id: "teip-taliia", cat: "teipuvannia", name: "Талія", group: "Естетичне", durations: null, price: { all: [600] }, steps: null, product: null },
    { id: "teip-zhyvit-taliia", cat: "teipuvannia", name: "Живіт + талія", group: "Естетичне", durations: null, price: { all: [900] }, steps: null, product: null },
    { id: "teip-sidnytsi", cat: "teipuvannia", name: "Сідниці", group: "Естетичне", durations: null, price: { all: [600] }, steps: null, product: null },
    { id: "teip-stehno", cat: "teipuvannia", name: "Внутрішня, зовнішня або задня частина стегна", group: "Естетичне", durations: null, price: { all: [700] }, steps: null, product: null },
    { id: "teip-sidnytsi-stehna", cat: "teipuvannia", name: "Сідниці + стегна", group: "Естетичне", durations: null, price: { all: [1200] }, steps: null, product: null },
    { id: "teip-homilka", cat: "teipuvannia", name: "Гомілка", group: "Естетичне", durations: null, price: { all: [600] }, steps: null, product: null }
  ];

  /* Доповнення до масажу */
  const addons = [
    { id: "maska", name: "Доглядова маска", duration: 15, price: { top: 200, lead: 200 } },
    { id: "holova", name: "Масаж голови", duration: 15, price: { top: 250, lead: 300 } },
    { id: "skrab", name: "Скрабування Bruno Vasari", duration: 20, price: { top: 400, lead: 400 } },
    { id: "krem", name: "Антицелюлітний крем", duration: null, price: { top: 200, lead: 200 } }
  ];

  /* ---------- Курси ----------
     Ендосфера: 5 процедур −10%, 10 процедур −20%.
     Обгортання й тейпування: 5 — −5%, 10 — −10%.
     Термін: 5 візитів — 60 днів, 10 — 90 днів з першого відвідування. */
  const courses = {
    validity: { 5: 60, 10: 90 },
    endosphereDiscount: { 5: 0.10, 10: 0.20 },
    wrapsTapingDiscount: { 5: 0.05, 10: 0.10 },
    gift: { 10: "1 антицелюлітне обгортання" } // лише до курсу 10 процедур тіла
  };

  /* Ендосфера: точні суми з прайсу (не рахуємо — беремо як у студії).
     Для калькулятора на сайті. */
  const endosphere = {
    testDrive: { minutes: 30, price: 850 },
    body: {
      45: { zones: "ноги, сідниці, спина, живіт",
            top:  { 1: 1300, 5: 5850, 10: 10400 },
            lead: { 1: 1400, 5: 6300, 10: 11200 } },
      60: { zones: "стопи, ноги, сідниці, спина, руки, долоні",
            top:  { 1: 1600, 5: 7200, 10: 12800 },
            lead: { 1: 1700, 5: 7650, 10: 13600 } }
    },
    face: { minutes: 30, zones: "зона декольте, шия, обличчя",
            top: { 1: 800, 5: 3600, 10: 6400 }, lead: { 1: 900, 5: 4050, 10: 7200 } },
    bodyFace: { minutes: 75, zones: "стопи, ноги, сідниці, спина, руки, долоні, обличчя",
            top: { 1: 1950, 5: 8750, 10: 15600 }, lead: { 1: 2050, 5: 9200, 10: 16400 } }
            // TODO власниця: 5 процедур — 8750 / 9200 у прайсі, а −10% дає 8775 / 9225
  };

  /* ---------- Майстрині ----------
     tier: "top" | "lead" | "apparatus" — від нього залежить ціна.
     altegio — ID майстрині в кожній студії (запис до неї в 1 клік).
     altegioReviews — кількість відгуків в Altegio (11.11.2026).
     specs: vagitni, endosfera, sport, oblychchia, teipuvannia, limfodrenazh,
     antytselulit, relaks, ozdorovchyi. */
  const masters = [
    { id: "asya", name: "Ася", studios: ["solomianka"], tier: "top", since: 2021, sinceMonth: null,
      education: null, specs: ["ozdorovchyi", "sport"],
      bio: null,
      quote: "Я спеціалізуюся на оздоровчих масажах, які знімають напругу, полегшують біль і дарують легкість тілу. Найбільше у своїй роботі ціную можливість допомагати людям почуватися краще",
      photo: "assets/img/masters/master-asya", handsPhoto: null, days: null,
      altegio: { solomianka: 2235780 }, altegioReviews: 29 },
    { id: "kateryna", name: "Катерина", studios: ["solomianka"], tier: "top", since: 2024, sinceMonth: null,
      education: null, specs: ["ozdorovchyi", "antytselulit", "vagitni"],
      bio: "Спеціалізуюсь на загальних масажах та антицелюлітних програмах",
      quote: "У своїй практиці я пропрацьовую тригерні точки для зняття дискомфорту, допомагаю розслабити тіло та повернути внутрішню гармонію",
      photo: "assets/img/masters/master-kateryna", handsPhoto: null, days: null,
      altegio: { solomianka: 2690318 }, altegioReviews: 77 },
    { id: "bohdana", name: "Богдана", studios: ["varshavskyi"], tier: "top", since: 2013, sinceMonth: null,
      education: "Медична освіта", specs: ["ozdorovchyi", "relaks"],
      bio: null,
      quote: "Мені подобається бачити результат своєї роботи: коли людина розслабляється, відчуває легкість у тілі та виходить із сеансу з посмішкою",
      photo: "assets/img/masters/master-bohdana", handsPhoto: null, days: null,
      altegio: { varshavskyi: 3004476 }, altegioReviews: 11 },
    { id: "diana", name: "Діана", studios: ["obolon"], tier: "top", since: 2025, sinceMonth: null,
      education: "Медична освіта", specs: ["vagitni", "relaks"],
      bio: null,
      quote: "У своїй роботі я дбаю не лише про фізичне розслаблення, а й про емоційний стан. Масаж — це мова дотику, яка допомагає зняти накопичений стрес, втому й тривожність",
      photo: "assets/img/masters/master-diana", handsPhoto: null, days: null,
      altegio: { obolon: 2855554 }, altegioReviews: 66 },
    { id: "mariia", name: "Марія", studios: ["obolon"], tier: "lead", since: 2021, sinceMonth: 9,
      // В Altegio підпис «Топ масажист», але записують за цінами провідної. TODO власниця: уточнити рівень
      education: "Медична освіта", specs: ["vagitni", "relaks", "ozdorovchyi"],
      bio: null,
      quote: "Я завжди поєдную техніки для досягнення максимального задоволення, розслаблення та оздоровлення організму",
      photo: "assets/img/masters/master-mariia", handsPhoto: null, days: null,
      altegio: { obolon: 2764145 }, altegioReviews: 137 },
    { id: "liudmyla", name: "Людмила", studios: ["teremky"], tier: "apparatus", since: 2003, sinceMonth: 9,
      // TODO власниця: за якими цінами (топ / провідна) записують Людмилу
      education: "Медична освіта", specs: ["endosfera"],
      bio: "Майстриня апаратного масажу",
      quote: "Працюю у сфері естетичної медицини, спеціалізуюся на апаратних методиках корекції фігури та обгортаннях",
      photo: "assets/img/masters/master-liudmyla", handsPhoto: null, days: null,
      altegio: { teremky: 3027248 }, altegioReviews: 18 },
    { id: "anna", name: "Анна", studios: ["varshavskyi"], tier: "top", since: 2025, sinceMonth: null,
      education: "Медична освіта", specs: ["ozdorovchyi", "relaks"],
      bio: null,
      quote: "Найбільше люблю працювати з оздоровчим та релакс-масажем, адже саме ці техніки допомагають зняти напругу, відновити сили та повернути тілу відчуття легкості",
      photo: "assets/img/masters/master-anna", handsPhoto: null, days: null,
      altegio: { varshavskyi: 3034457 }, altegioReviews: 3 },
    { id: "valeriia", name: "Валерія", studios: ["teremky"], tier: "top", since: 2020, sinceMonth: null,
      education: null, specs: ["relaks", "vagitni"],
      bio: "Спеціалізуюсь на релакс-масажі та масажі для вагітних",
      quote: "Масаж — це не просто техніка, це про гармонію, енергію та дбайливий підхід до вашого тіла",
      photo: "assets/img/masters/master-valeriia", handsPhoto: null, days: null,
      altegio: { teremky: 2637248 }, altegioReviews: 155 },
    { id: "nataliia", name: "Наталія", studios: ["obolon"], tier: "lead", since: 2022, sinceMonth: null,
      education: null, specs: ["ozdorovchyi"],
      bio: "Цікавлюся фізіологією, нейробіологією, біомеханікою та ендокринологією",
      quote: "Для мене масаж — це не просто техніка, а мистецтво допомагати тілу працювати краще",
      photo: "assets/img/masters/master-nataliia", handsPhoto: null, days: null,
      altegio: { obolon: 2160443 }, altegioReviews: 194 },
    { id: "tetiana", name: "Тетяна", studios: ["teremky", "obolon"], tier: "lead", since: 2011, sinceMonth: null,
      education: "Середня медична освіта, магістр фізичної реабілітації", specs: ["ozdorovchyi", "sport", "vagitni"],
      bio: null,
      quote: "У своїй практиці обираю комплексний погляд, працюючи з різними напрямами тілесних практик. Поєдную м’язово-фасціальні і остеопатичні підходи, роблю точковий тригерний масаж з елементами кінезіології",
      photo: "assets/img/masters/master-tetiana", handsPhoto: null, days: null,
      altegio: { teremky: 2878160, obolon: 2889683 }, altegioReviews: 71 },
    { id: "liubov", name: "Любов", studios: ["obolon"], tier: "top", since: 2024, sinceMonth: 9,
      education: "Курс практичної кінезіології", specs: ["ozdorovchyi", "relaks", "sport", "antytselulit", "oblychchia", "vagitni"],
      bio: "Спеціалізуюсь на оздоровчому, релакс, спортивному та антицелюлітному масажі, а також на масажах обличчя",
      // Виправлено «інтергую» → «інтегрую». TODO власниця: погодити
      quote: "Пройшла курс практичної кінезіології, тож при потребі інтегрую ці знання в масажну практику",
      photo: "assets/img/masters/master-liubov", handsPhoto: null, days: null,
      altegio: { obolon: 2891770 }, altegioReviews: 67 }
  ];
  // TODO власниця: робочі дні та фото рук кожної майстрині.
  // TODO власниця: у Altegio є ще Марина (Оболонь, Варшавський) і Алла (Солом’янка) — додати?

  const specs = [
    { id: "vagitni", name: "Вагітні" },
    { id: "endosfera", name: "Ендосфера" },
    { id: "sport", name: "Спорт і відновлення" },
    { id: "oblychchia", name: "Обличчя" },
    { id: "antytselulit", name: "Антицелюлітний" },
    { id: "relaks", name: "Релакс" },
    { id: "ozdorovchyi", name: "Оздоровчий" }
    // «Тейпування» і «Лімфодренаж» — TODO власниця: хто з майстринь це робить
  ];

  const tiers = {
    top: { name: "Топ майстриня", short: "Топ" },
    lead: { name: "Провідна майстриня", short: "Провідна" },
    apparatus: { name: "Майстриня апаратного масажу", short: "Апаратний масаж" }
  };
  // Підказка біля перемикача рівнів (стратегія): «Провідна — найбільший досвід».
  // TODO власниця: чи хоче перейменувати рівні «топ / провідна».

  /* ---------- Відгуки ----------
     Дослівно зі скриншотів (емодзі прибрано, слова не змінено).
     source: "altegio?" — картки з зірками і датою (джерело уточнити),
     "direct" — повідомлення в Instagram. tags — для фільтрів. */
  const reviews = [
    // Ася
    { master: "asya", rating: 5, date: "2025-02-07", tags: ["sport"], source: "altegio?",
      text: "Дуже подобається ця майстриня. Після спортивних навантажень, а потім масажу відчуваю сильне полегшення!" },
    { master: "asya", rating: 5, date: "2025-11-17", source: "altegio?",
      text: "Прекрасний майстер, дуже подобається відчуття після масажу" },
    { master: "asya", rating: 5, date: "2025-01-29", source: "altegio?", text: "Ася найкраща!" },
    { master: "asya", rating: 5, date: "2025-11-14", source: "altegio?",
      text: "Отримала неймовірне розслаблення після масажу спини! Масажистка має золоті руки — все акуратно, якісно та з великою увагою. Повернусь ще" },
    { master: "asya", rating: 5, date: "2026-02-13", source: "altegio?", featured: true,
      text: "Хочу щиро подякувати цій неймовірній дівчині-масажисту за її професіоналізм і золоті руки! З першої хвилини відчувається турбота, уважність і любов до своєї справи. Вона дуже делікатна, тактовна й водночас впевнена у своїх рухах. Після сеансу відчуття повного розслаблення, легкості в тілі та внутрішнього спокою. Зникла напруга у спині, покращився настрій і навіть сон став кращим. Атмосфера під час процедури – затишна, спокійна, все продумано до дрібниць. Рекомендую від щирого серця! Якщо ви шукаєте майстра, який поєднує професіоналізм, уважність і приємну енергетику – вам точно до неї" },

    // Катерина
    { master: "kateryna", rating: 5, date: "2025-07-27", source: "altegio?",
      text: "Все супер на 100/10, після візиту чоловік нарешті перестав боятись масажу та згодився пройти оздоровчий курс" },
    { master: "kateryna", rating: 5, date: "2025-11-11", source: "altegio?", text: "Катя неймовірний професіонал! Дякую! До зустрічі!" },
    { master: "kateryna", rating: 5, date: "2025-11-18", source: "altegio?", text: "Дуже задоволений" },
    { master: "kateryna", rating: 5, date: "2026-04-30", source: "altegio?", text: "Катя неймовірна! тисне свме так, як треба))" },
    { master: "kateryna", rating: 5, date: "2026-03-10", tags: ["vagitni"], source: "altegio?", featured: true,
      text: "Дуже сподобався масаж для вагітних! Масажистка Катя — справжній професіонал. Вона була дуже уважною, обережною та створила максимально комфортну і спокійну атмосферу. Після сеансу відчула легкість у тілі, розслаблення та значно менше напруження в спині. Дуже вдячна Каті за турботу та такий приємний досвід. Однозначно рекомендую всім майбутнім мамам!" },
    { master: "kateryna", rating: 5, date: "2026-02-17", source: "altegio?", text: "Чарівна Катерина з неймовірними руками. Найкраща!" },

    // Богдана
    { master: "bohdana", rating: 5, date: "2026-10-05", source: "altegio?", text: "Щиро дякую Богдані за її майстерність. Кожен сеанс-це повний релакс!" },
    { master: "bohdana", rating: 5, date: "2026-10-31", source: "altegio?", text: "Все пройшло на найкращому рівні" },
    { master: "bohdana", rating: 5, date: "2026-10-10", source: "altegio?",
      text: "Дуже задоволена. Приємна атмосфера, професійний підхід та турбота про клієнта. Після процедури відчувається легкість, розслаблення. Обіцяю незабаром повернутися" },
    { master: "bohdana", rating: null, date: null, source: "direct",
      text: "Вітаю. Все ідеально, дякую, я давно себе так добре не почувала. Поки не потрібно, я повернусь самостійно" },
    { master: "bohdana", rating: null, date: null, source: "direct", text: "Я тепер всім рекомендую цей масаж)) Дуже дякую))" },

    // Діана
    { master: "diana", rating: 5, date: "2026-08-20", source: "altegio?", text: "Справжній релакс! Дуже дякую за чудовий масаж, одне задоволення!" },
    { master: "diana", rating: 4, date: "2026-05-18", source: "altegio?", text: "Ходжу до Діани регулярно, дуже класна майстриня" },
    { master: "diana", rating: 5, date: "2026-02-12", tags: ["vagitni"], source: "altegio?",
      text: "Хочу залишити щирий відгук про Діану. Я її клієнтка вже давно і роблю в неї масаж для вагітних ще з 4–5 місяця. За час, поки Діана була на лікарняному, я встигла побувати в інших майстрів - хороші дівчата, але саме Діана підійшла мені найбільше. Я справді скучила за її руками. Сьогодні нарешті знову потрапила до неї і це був справжній кайф. Ми і наговорилися, і я по-справжньому відпочила. Моя спина та ніжки нарешті знову відчули, що таке руки професіонала. Після масажу зійшла зайва вода, з’явилась легкість і неймовірне відчуття турботи. Діана - дуже уважна, делікатна та професійна майстриня. Щиро рада, що вона відновилась і повернулась до роботи. Рекомендую від усього серця" },
    { master: "diana", rating: 5, date: "2026-02-24", source: "altegio?",
      text: "Чудовий майстер. Пропрацьовує кожну ділянку, охайна. Задоволена, буду відвідувати її ще не один раз" },

    // Марія
    { master: "mariia", rating: 5, date: "2025-12-20", source: "altegio?", text: "Дмитру все дуже сподобалось. Марії дуже дякує за масаж!)" },
    { master: "mariia", rating: 5, date: "2025-12-05", source: "altegio?", text: "Дуже вдячна за класні масажі" },
    { master: "mariia", rating: 5, date: "2026-02-14", source: "altegio?", featured: true,
      text: "Величезна подяка майстру за надану допомогу! Тривалий час мене турбували болі в спині, але вже після першого візиту я відчула значне полегшення. Записалась ще , пораджусь при наступному візиті про курс масажів. Сьогодні мій поперек сказав :\"Дякую\"" },
    { master: "mariia", rating: 5, date: "2025-11-10", source: "altegio?",
      text: "Марія - справді топ-масажист! Має просто божественні руки! Дякую вчергове за релакс-масаж а масаж голови додатково спробувала - це взагалі якийсь космос! Дякую @body_space" },
    { master: "mariia", rating: 5, date: "2025-09-24", tags: ["endosfera"], source: "altegio?",
      text: "Марія дуже крутий майстер. Вічлива та приємна людина. У неї золоті руки. Була на ендосфері та загальному масажі - ніби у раю!" },
    { master: "mariia", rating: null, date: null, tags: ["vagitni"], source: "direct",
      text: "Дякую велике масажисту Марії за якісний масаж для вагітних !))) після масажу тіло відновило життя... таку легкість я давно не відчувала...))) обов’язково завітаю знову!" },
    { master: "mariia", rating: null, date: null, source: "direct",
      text: "Добрий день. Вперше була на масажі. Я дуже задоволена! Загальний масаж 90 хвилин неймовірне задоволення. Дякую Марії" },

    // Людмила
    { master: "liudmyla", rating: 5, date: "2026-06-04", source: "altegio?", featured: true,
      text: "На таких процедурах критично важливо почуватися комфортно та легко. Так і було! Людмила дуже приємна людина та гарний майстер своєї справи!" },
    { master: "liudmyla", rating: 5, date: "2026-08-09", source: "altegio?", text: "Дякую все дуже сподобалося." },
    { master: "liudmyla", rating: 5, date: "2026-05-22", source: "altegio?",
      text: "Ну що тут сказати! Все пречудово) Відчуття турботи про людину та націленість на результат. Моя щира рекомендація" },
    { master: "liudmyla", rating: 5, date: "2026-06-14", tags: ["endosfera"], source: "altegio?",
      text: "Людмила неймовірна майстриня своєї справи, записалась ще на ендосферу" },
    { master: "liudmyla", rating: 5, date: "2026-05-18", source: "altegio?", text: "Все просто чудово) Людмила професійна і чуйна, дуже сподобалось" },

    // Анна
    { master: "anna", rating: 4, date: "2026-11-04", source: "altegio?", text: "Такий кайф і розслаблення після масажу" },
    { master: "anna", rating: 5, date: "2026-07-11", source: "altegio?", text: "Чудова атмосфера і масаж! Дякую!" },
    { master: "anna", rating: 4, date: "2026-03-04", source: "altegio?", text: "Велике дякую за такий кайф! Масаж супер, все дуже сподобалось" },
    { master: "anna", rating: 5, date: "2026-03-20", source: "altegio?", text: "Чудовий спеціаліст та гарна людина" },

    // Валерія (відгук від 13.06.2026 на картці був двічі — беремо один раз)
    { master: "valeriia", rating: 5, date: "2026-08-18", source: "altegio?",
      text: "масаж був чудовий, дуже приємна й уважна Валерія зробила все на вищому рівні, дякую вам дуже!" },
    { master: "valeriia", rating: 5, date: "2026-07-16", source: "altegio?", text: "Чудова майстриня, відлітаєш в космос" },
    { master: "valeriia", rating: 5, date: "2026-07-25", source: "altegio?", text: "Валерія прекрасний спеціаліст до якого хочеться повернутись!" },
    { master: "valeriia", rating: 5, date: "2026-06-18", source: "altegio?",
      text: "Неймовірно задоволена. Майстер була дуже акуратно, якісно виконувала все, я навіть засунула під кінець процедури) Отримала повний релакс - раджу!" },
    { master: "valeriia", rating: 5, date: "2026-06-13", source: "altegio?", featured: true,
      text: "Абсолютно фантастичне враження від масажу Валерії. Дуже професійна фахівчиня, вихована, делікатна. Залишилась задоволена. Масаж на вищому рівні. Рекомендую." },

    // Наталія
    { master: "nataliia", rating: 5, date: "2026-01-14", source: "altegio?", featured: true,
      text: "Вже вдруге відвідую загальний масаж у цього майстра. Це кращій масаж який коли-небудь мені робили. Чудовий спеціаліст" },
    { master: "nataliia", rating: 5, date: "2025-12-20", source: "altegio?",
      text: "Масаж від Наталії, це щось більше ніж просто масаж. Дуже дякую , це було неперевершено!" },
    { master: "nataliia", rating: 5, date: "2025-12-20", source: "altegio?",
      text: "Наталя як завжди на висоті. Справжня мануальщик, чітко працює по проблемним зонам" },
    { master: "nataliia", rating: 5, date: "2026-01-07", source: "altegio?",
      text: "Дуже сподобалось. Робила загальний масаж і я в захваті. Раджу Наталью як майстера - приємна, чемна і уважна" },
    { master: "nataliia", rating: 5, date: "2026-03-09", source: "altegio?",
      text: "Обожнюю масаж у виконанні Наталії) вона профі) вже й чоловіка записала) дякую)" },

    // Тетяна
    { master: "tetiana", rating: 5, date: "2026-08-24", source: "altegio?",
      text: "Дуже чекала на масаж у майстрині Тетяни. Неймовірна людина і великий професіонал" },
    { master: "tetiana", rating: 5, date: "2026-06-19", tags: ["vagitni"], source: "altegio?", featured: true,
      text: "Мої вагітні ноги готові співати оди кохання рукам Тетяни. Дуже професійний майстер і приємна людина. Рекомендую" },
    { master: "tetiana", rating: 5, date: "2026-04-03", source: "altegio?",
      text: "Дуже сподобалось, Тетяна круто пропрацювала все тіло, використовуючи як м’які такі більш глибокі техніки, вийшов з відчуттям легкості за що дуже вдячний" },
    { master: "tetiana", rating: 5, date: "2026-03-06", source: "altegio?",
      text: "Обожнюю відвідувати масаж у майстрині Тетяни. Завжди відчуваю легкість після процедури" },
    { master: "tetiana", rating: 5, date: "2025-12-07", tags: ["sport"], source: "altegio?",
      text: "Дуже дякую Тетяні! Масажист від Бога! Спортивний масаж просто поставив мене на ноги, зняв кріпатуру, затиски в тілі, я стабілізувала свій стан! Хочу до Тетяни ще і вже записалась! Дуже раджу цього спеціаліста!" },

    // Любов
    { master: "liubov", rating: 5, date: "2026-01-02", source: "altegio?",
      text: "Майстер Любов має чарівні ручки . Вийшла після масажу, як нова копійка . Дякую" },
    { master: "liubov", rating: 5, date: "2025-12-07", source: "altegio?", featured: true, nearHome: true,
      text: "Чудовий масаж був! Я дуже задоволена і рада, що знайшла поруч з домом салон масажу, де справді круті спеціалісти!" },
    { master: "liubov", rating: 5, date: "2026-01-30", source: "altegio?",
      text: "У мене був перший сеанс масажу. Моя думка, Дуже якісний і професійний масажист Любов і професіонал своєї справи. Якісно промасажирували все тіло, в мене боліла права плечова частина, але після масажу все пройшло. Багато було зажимів по всьому тілу, але якісно проробили всі частини тіла і абсолютно по іншому тіло ожило і почало дихати. Дуже і Дуже Дякую" },
    { master: "liubov", rating: 5, date: "2026-01-04", source: "altegio?",
      text: "Дуже сподобалося, Любов зосередилась на проблемних місцях, за що вдячна, тому що турбувало неодноразово.Рекомендую усім дівчатам, не забувати про своє тіло.Обовязково завітаю до Вас знову" },
    { master: "liubov", rating: null, date: null, tags: ["vagitni"], source: "direct", featured: true,
      text: "Хочу поділитися чудовим досвідом масажу для вагітних у майстрині Любов. Прийшла до неї з сильним болем у спині , а вийшла зовсім іншою — розслабленою, спокійною та без тієї тягнучої болі, яка мучила кілька днів. Любов працює дуже ніжно, дбайливо і професійно. Вона уважно розпитала про самопочуття, пояснила кожен етап і створила абсолютно комфортну атмосферу. Після масажу я вперше нормально відчула полегшення. Щиро рекомендую Любов усім вагітним, хто хоче безпечно зняти напругу та отримати справжню турботу" },

    // Без імені майстрині
    { master: null, rating: null, date: null, tags: ["vagitni"], source: "direct",
      text: "Це релакс! Затишна атмосфера, професійні руки чудової майстрині. Повністю зняли стрес і напругу Обов’язково повернуся ще!" }
  ];
  // TODO власниця: звідки відгуки з зірками (Altegio чи Google) і чи можна їх показувати.

  /* ---------- «Що вас турбує?» ----------
     6 відчуттів (стратегія) → послуга. Формулювання — про відчуття,
     без діагнозів і обіцянок. */
  const concerns = [
    { id: "desk", label: "Сиджу за комп’ютером, напружена шия", service: "spyna", duration: 60,
      text: "Масаж спини, шиї й плечей — там, де за день збирається напруга.",
      photo: "assets/img/massage-neon-healthy", photoW: 720, photoH: 733 },
    { id: "legs", label: "Важкість у ногах", service: "limfodrenazh", duration: 60,
      text: "М’які ритмічні рухи, після яких у тілі й ногах з’являється легкість.",
      photo: null }, // TODO власниця: фото масажу ніг
    { id: "stress", label: "Стрес, погано сплю", service: "relaks", duration: 60,
      text: "М’які, плавні рухи і тиша, щоб відпустити напругу. Якщо заснете — це цілком нормально.",
      photo: "assets/img/massage-relax-green", photoW: 720, photoH: 800 },
    { id: "figure", label: "Хочу підтягнути фігуру", service: "endosfera", duration: 45,
      text: "Апаратний масаж ендосферою — для тонусу й гладкості шкіри. Почніть з тест-драйву.",
      photo: null }, // TODO власниця: фото процедури ендосфери
    { id: "pregnant", label: "Я вагітна", service: "vagitni-zahalnyi", duration: 60, link: "vagitnym.html",
      text: "Масаж у положенні на боці або сидячи, з м’якими рухами. Перед записом погодьте масаж з лікарем.",
      photo: "assets/img/pregnancy-belly", photoW: 720, photoH: 779 },
    { id: "sport", label: "Відновлення після тренувань", service: "sportyvnyi", duration: 60,
      text: "Глибоке пропрацювання м’язів після навантажень.",
      photo: "assets/img/massage-hands-back", photoW: 720, photoH: 380 }
  ];

  /* ---------- Засоби «Догляд вдома» ----------
     Лише косметика (рішення: добавки й побутову хімію не показуємо).
     Тексти — без медичних обіцянок. */
  const products = [
    { id: "styx-contour", brand: "STYX", line: "Aroma Derm", name: "Contour Creme Warmend",
      kind: "Зігріваючий крем для тіла", volume: null, price: 1275, need: ["tonus"],
      use: "Масажними рухами на зони стегон, сідниць і живота.", after: "antytselulitnyi",
      photo: "assets/img/products/styx-contour-creme-warmend" },
    { id: "styx-zell", brand: "STYX", line: "Aroma Derm", name: "Zell Aktiv Gel з корицею",
      kind: "Термоактивний гель для тіла", volume: null, price: 1275, need: ["tonus"],
      use: "Тонким шаром на потрібні зони, можна перед тренуванням. Дає відчуття тепла.", after: "endosfera",
      photo: "assets/img/products/styx-zell-aktiv-gel" },
    { id: "styx-cool", brand: "STYX", line: "Aroma Derm", name: "Cool Gel",
      kind: "Охолоджуючий гель для ніг", volume: null, price: 1275, need: ["lehkist"],
      use: "Знизу вгору, від стоп до колін, коли ноги втомилися за день.", after: "limfodrenazh",
      photo: "assets/img/products/styx-cool-gel" },
    { id: "styx-algen", brand: "STYX", line: "Aroma Derm", name: "Algen Creme Forte",
      kind: "Крем з водоростями для тіла", volume: null, price: 1275, need: ["tonus", "hladkist"],
      use: "Масажними рухами на чисту шкіру.", after: "antytselulitnyi",
      photo: "assets/img/products/styx-algen-creme-forte" },
    { id: "styx-straff", brand: "STYX", line: "Aroma Derm", name: "Straffungsgel Forte",
      kind: "Гель для пружності шкіри", volume: null, price: 1275, need: ["tonus"],
      use: "На зони, де хочеться більше пружності, вранці й увечері.", after: "modeliuiuchyi",
      photo: "assets/img/products/styx-straffungsgel-forte" },
    { id: "styx-kaviar", brand: "STYX", line: "Aroma Derm", name: "Nachbehandlungscreme mit Kaviar",
      kind: "Крем з екстрактом ікри лосося", volume: "150 мл", price: 1375, need: ["zvolozhennia"],
      use: "На чисту шкіру після душу, вранці та ввечері.", after: "endosfera",
      photo: "assets/img/products/styx-kaviar-creme" },
    { id: "styx-coolhot", brand: "STYX", line: "Aroma Derm", name: "Cool & Hot Gel",
      kind: "Гель з ефектом тепла й прохолоди", volume: null, price: 1425, need: ["tonus"],
      use: "Тонким шаром на потрібні зони.", after: "antytselulitnyi",
      photo: "assets/img/products/styx-cool-hot-gel" },
    { id: "wm-pleasure", brand: "White Mandarin", line: "Mood", name: "Mood Pleasure",
      kind: "Гель для душу · ваніль і рожевий перець", volume: null, price: 472, need: ["aromat"],
      use: "Очищення і зволоження. Аромат можна обрати за тестером на Оболоні.", after: "relaks", tester: "obolon",
      photo: "assets/img/products/wm-mood-pleasure" },
    { id: "wm-creative", brand: "White Mandarin", line: "Mood", name: "Mood Creative",
      kind: "Гель для душу · базилік і полуниця", volume: null, price: 472, need: ["aromat"],
      use: "Очищення і тонізування. Аромат можна обрати за тестером на Оболоні.", after: "relaks", tester: "obolon",
      photo: "assets/img/products/wm-mood-creative" },
    { id: "wm-energy", brand: "White Mandarin", line: "Mood", name: "Mood Energy",
      kind: "Гель для душу · імбир і грейпфрут", volume: null, price: 472, need: ["aromat"],
      use: "Бадьорий цитрусовий аромат для ранкового душу. Тестер — на Оболоні.", after: "sportyvnyi", tester: "obolon",
      photo: "assets/img/products/wm-mood-energy" },
    { id: "wm-kids", brand: "White Mandarin", line: "Kids", name: "Захисний дитячий крем Mango Seed Oil",
      kind: "Захист, живлення, зволоження · 0+", volume: "50 мл", price: 170, need: ["dity"],
      use: "Для дитячої шкіри в морозну чи сонячну погоду.", after: null,
      photo: "assets/img/products/wm-kids-cream" }
  ];
  // TODO власниця: об’єми засобів STYX і гелів White Mandarin.

  const productNeeds = [
    { id: "tonus", name: "Тонус і пружність" },
    { id: "hladkist", name: "Гладкість шкіри" },
    { id: "lehkist", name: "Легкість у ногах" },
    { id: "zvolozhennia", name: "Зволоження" },
    { id: "aromat", name: "Гелі для душу" },
    { id: "dity", name: "Для дітей" }
  ];

  const shop = {
    delivery: "Можлива доставка Новою поштою",
    order: "Для замовлення напишіть нам у Direct"
  };

  /* ---------- Правила (дослівно за змістом зі сторіс) ---------- */
  const rules = [
    { id: "late", title: "Якщо ви запізнюєтесь",
      text: "Час запізнення віднімається від часу вашого масажу. Якщо потрібна парковка, закладіть ще 5–10 хвилин." },
    { id: "cancel", title: "Перенесення і скасування — щонайпізніше за 6 годин",
      text: "Якщо скасувати пізніше, просимо відшкодувати 50% вартості за час, який майстриня тримала для вас. Повітряна тривога — виняток. Якщо запис скасовуємо ми, даруємо вам 50% знижки на наступний візит." },
    { id: "health", title: "Здоров’я понад усе",
      text: "Якщо стан здоров’я не дозволяє провести масаж чи послугу, майстриня має право відмовити." },
    { id: "course", title: "Термін дії курсу",
      text: "5 візитів — 60 днів, 10 візитів — 90 днів з першого відвідування." },
    { id: "certificate", title: "Термін дії сертифіката",
      text: "30 днів з моменту дарування." }
  ];

  /* ---------- Вагітним ---------- */
  const pregnancy = {
    fromWeek: null, // TODO власниця: з якого терміну приймаєте
    positions: "Лежачи на боці або сидячи — залежно від терміну вагітності та самопочуття.",
    approach: "Рухи м’які й делікатні: майстриня орієнтується на ваші відчуття, щоб процедура була максимально комфортною.",
    doctorNote: "Перед записом обов’язково узгодьте масаж зі своїм акушером-гінекологом, особливо якщо вагітність має ускладнення.",
    contraindications: [
      "кров’янисті виділення",
      "підтікання навколоплідних вод",
      "сильний біль у животі або регулярні болісні скорочення матки",
      "підвищений тиск",
      "підвищений тонус матки"
    ],
    contraNote: "За будь-яких сумнівів спочатку зверніться до лікаря.",
    oils: null,       // TODO власниця: якими оліями працюєте з вагітними
    whatToBring: null // TODO власниця: що взяти з собою
  };

  /* ---------- Сертифікати ---------- */
  const certificate = {
    validityDays: 30,
    nominals: null,   // TODO власниця: номінали сертифікатів (або тільки на процедуру?)
    formats: ["Цифровий (PDF)", "Друкований у студії"], // TODO власниця: підтвердити
    designs: ["Лісовий", "Кремовий", "Свічковий"]       // дизайни карток на сайті
  };

  /* ---------- Що входить у вартість візиту ---------- */
  const included = null; // TODO власниця: чай, тепла кушетка, душ, засоби — що саме?

  /* ---------- Formspree ---------- */
  const FORMSPREE_ID = null; // TODO: вставити ID Formspree (напр. "xyzabcd")

  /* ---------- Допоміжні функції ---------- */
  const byId = (list, id) => list.find((x) => x.id === id) || null;

  /** Посилання на запис в Altegio: студія + (необов’язково) майстриня. */
  function bookingUrl(studioId, masterId) {
    const studio = byId(studios, studioId);
    if (!studio || !studio.altegioId) return brand.direct;
    let url = brand.altegioBase + studio.altegioId + "/personal/menu";
    const master = masterId ? byId(masters, masterId) : null;
    const mId = master && master.altegio ? master.altegio[studioId] : null;
    if (mId) url += "?o=m" + mId;
    return url;
  }

  /** Ціна послуги для рівня й тривалості. */
  function priceOf(service, tier, duration) {
    if (!service || !service.price) return null;
    const i = service.durations ? Math.max(0, service.durations.indexOf(duration)) : 0;
    if (service.price.all) return service.price.all[i] ?? service.price.all[0];
    const t = tier === "lead" ? "lead" : "top";
    return service.price[t][i] ?? service.price[t][0];
  }

  window.BS = {
    brand, studios, categories, services, addons, courses, endosphere,
    masters, specs, tiers, reviews, concerns, products, productNeeds, shop,
    rules, pregnancy, certificate, included, FORMSPREE_ID,
    byId, bookingUrl, priceOf
  };
})();
