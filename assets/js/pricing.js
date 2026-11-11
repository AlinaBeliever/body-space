/* =====================================================================
   Прайс: перемикачі рівня (Топ / Провідна) і тривалості з aria-pressed.
   Змінюються лише цифри (анімація), вибір рівня зберігається на всіх
   сторінках. Тут же — список масажів для вагітних на головній.
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;

  /* ---------- Перемикач рівня — спільний для всіх сторінок ---------- */
  function syncTierToggles() {
    const tier = UI.getTier();
    UI.$$(".js-tier-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tier === tier)));
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".js-tier-toggle button");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    UI.setTier(b.dataset.tier);
  });
  document.addEventListener("bs:tier", syncTierToggles);
  syncTierToggles();

  /* ---------- Картки цін на головній ---------- */
  const cardsBox = UI.$(".js-price-cards");
  const HOME = [
    { id: "spyna", photo: "assets/img/massage-neon-healthy", w: 720, h: 733, alt: "Майстриня робить масаж спини біля неонової лінії" },
    { id: "zahalnyi", photo: "assets/img/massage-relax-room", w: 720, h: 675, alt: "Майстриня в кабінеті з темно-зеленою шторою" },
    { id: "relaks", photo: "assets/img/massage-relax-green", w: 720, h: 800, alt: "Релакс-масаж спини, м’які плавні рухи" },
    { id: "vagitni-zahalnyi", photo: "assets/img/massage-pregnant-side", w: 600, h: 1269, alt: "Масаж для вагітної в положенні на боці" },
    { id: "endosfera", photo: null },
    { id: "sportyvnyi", photo: "assets/img/massage-hands-back", w: 720, h: 380, alt: "Руки майстрині під час масажу спини" }
  ];
  let durIdx = 0;

  function renderCards(first) {
    if (!cardsBox) return;
    const tier = UI.getTier();
    if (first) {
      cardsBox.innerHTML = HOME.map((h) => {
        const s = BS.byId(BS.services, h.id);
        return `<article class="price-card reveal" data-id="${s.id}">
          <div class="price-card__media">${h.photo ? UI.img(h.photo, h.w, h.h, h.alt) : UI.placeholder()}</div>
          <div class="price-card__body">
            <h3 class="price-card__name">${UI.esc(s.name)}</h3>
            <p class="price-card__short">${UI.esc(s.short)}</p>
            <div class="price-card__row">
              <p class="price-card__price"><span class="num js-p">—</span><span class="price-card__cur">грн</span></p>
              <p class="price-card__dur"><span class="js-d"></span> хв</p>
            </div>
            <a class="btn btn--cream btn--block js-book" data-service="${s.id}" href="${BS.brand.direct}">Записатися<span class="js-book-studio"></span></a>
          </div>
        </article>`;
      }).join("");
      UI.refreshBooking();
    }
    UI.$$(".price-card", cardsBox).forEach((card) => {
      const s = BS.byId(BS.services, card.dataset.id);
      const d = s.durations[Math.min(durIdx, s.durations.length - 1)];
      UI.rollNumber(UI.$(".js-p", card), BS.priceOf(s, tier, d), 200);
      UI.$(".js-d", card).textContent = d;
    });
  }
  UI.$$(".js-dur-toggle").forEach((t) => t.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    durIdx = Number(b.dataset.dur);
    UI.$$("button", t).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderCards();
  }));
  document.addEventListener("bs:tier", () => renderCards());
  renderCards(true);

  /* ---------- Вагітним (головна): 3 види з цінами ---------- */
  const pregList = UI.$(".js-preg-list");
  function renderPreg() {
    if (!pregList) return;
    const tier = UI.getTier();
    pregList.innerHTML = BS.services.filter((s) => s.pregnancy).map((s) => {
      const prices = s.durations.map((d) => BS.priceOf(s, tier, d));
      return `<li><span class="preg__name">${UI.esc(s.name.replace(" для вагітних", ""))}<small>${UI.esc(s.short)}</small></span>
        <span class="preg__price">${s.durations.join(" / ")} хв · <b>${prices.map(UI.fmt).join(" / ")}</b> грн</span></li>`;
    }).join("");
    const note = UI.$(".js-preg-note");
    if (note) note.textContent = BS.pregnancy.doctorNote;
  }
  document.addEventListener("bs:tier", renderPreg);
  renderPreg();

  /* =====================================================================
     Сторінка «Послуги і ціни»: вкладки категорій (фільтр в адресі ?cat=),
     картки послуг з 3 кроками і засобом, курси, доповнення.
     ===================================================================== */
  const tabs = UI.$(".js-svc-tabs"), list = UI.$(".js-svc-list");
  if (tabs && list) {
    const cats = BS.categories;
    const durSel = {}; // обрана тривалість для кожної картки
    const getCat = () => { try { return new URLSearchParams(location.search).get("cat") || "all"; } catch (e) { return "all"; } };
    let cat = cats.some((c) => c.id === getCat()) ? getCat() : "all";

    tabs.innerHTML = [{ id: "all", name: "Усі" }].concat(cats).map((c) =>
      `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === cat}">${UI.esc(c.name)}</button>`).join("");

    const simple = (s) => !s.steps; // обгортання, тейпування — компактні рядки
    function card(s) {
      const tier = UI.getTier();
      const d = durSel[s.id] || (s.durations ? s.durations[0] : null);
      const price = BS.priceOf(s, tier, d);
      if (simple(s)) {
        return `<li class="svc-row" data-id="${s.id}">
          <span class="svc-row__name">${UI.esc(s.name)}${s.short ? `<small>${UI.esc(s.short)}</small>` : ""}${s.note ? `<small>${UI.esc(s.note)}</small>` : ""}</span>
          <span class="svc-row__meta">${s.durations ? s.durations[0] + " хв" : ""}${s.product ? ` · ${UI.esc(s.product)}` : ""}</span>
          <span class="svc-row__price">${s.priceFrom ? "від " : ""}<b>${UI.fmt(price)}</b> грн</span>
        </li>`;
      }
      const durs = s.durations.length > 1
        ? `<div class="toggle toggle--sm" role="group" aria-label="Тривалість: ${UI.esc(s.name)}">${s.durations.map((x) =>
            `<button type="button" data-dur="${x}" aria-pressed="${x === d}">${x} хв</button>`).join("")}</div>`
        : `<span class="svc-card__dur">${d} хв</span>`;
      return `<article class="svc-card reveal" data-id="${s.id}">
        <div class="svc-card__head">
          <h3 class="svc-card__name">${UI.esc(s.name)}</h3>
          <p class="svc-card__short">${UI.esc(s.short)}</p>
        </div>
        <div class="svc-card__price-row">
          ${durs}
          <p class="svc-card__price"><span class="num js-sp" data-value="${price}">${UI.fmt(price)}</span> <small>грн</small></p>
        </div>
        ${s.price.all ? '<p class="small muted">Ціна однакова в усіх майстринь</p>' : ""}
        <ol class="svc-card__steps">${s.steps.map((t) => `<li>${UI.esc(t)}</li>`).join("")}</ol>
        ${s.product ? `<p class="tag tag--sand">Засоби: ${UI.esc(s.product)}</p>` : ""}
        <a class="btn btn--block js-book" data-service="${s.id}" href="${BS.brand.direct}">Записатися<span class="js-book-studio"></span></a>
      </article>`;
    }
    function render() {
      const shown = cat === "all" ? cats : cats.filter((c) => c.id === cat);
      list.innerHTML = shown.map((c) => {
        const items = BS.services.filter((s) => s.cat === c.id);
        if (!items.length) return "";
        const rows = items.every(simple);
        let inner;
        if (rows) {
          const groups = [...new Set(items.map((s) => s.group || ""))];
          inner = groups.map((g) => `${g ? `<h4 class="svc-group">${UI.esc(g)}</h4>` : ""}<ul class="svc-rows">${items.filter((s) => (s.group || "") === g).map(card).join("")}</ul>`).join("");
          if (c.id === "teipuvannia" || c.id === "obhortannia") inner += `<p class="small muted svc-note">Курсом вигідніше: 5 послуг — мінус ${BS.courses.wrapsTapingDiscount[5] * 100}%, 10 — мінус ${BS.courses.wrapsTapingDiscount[10] * 100}%.</p>`;
          inner += `<div class="svc-rows__book">${'<a class="btn js-book" data-service="' + items[0].id + '" href="' + BS.brand.direct + '">Записатися<span class="js-book-studio"></span></a>'}</div>`;
        } else {
          inner = `<div class="svc-grid">${items.map(card).join("")}</div>`;
        }
        const extra = c.id === "endosfera" ? `<a class="link-arrow" href="endosfera.html#kalkulyator">Курси й калькулятор ендосфери<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>` :
          c.id === "vagitnym" ? `<a class="link-arrow" href="vagitnym.html">Усе для вагітних<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>` : "";
        return `<section class="svc-cat" id="cat-${c.id}" aria-labelledby="h-${c.id}">
          <div class="svc-cat__head"><h2 id="h-${c.id}">${UI.esc(c.name)}</h2>${extra}</div>${inner}</section>`;
      }).join("");
      UI.refreshBooking();
      UI.observeReveal(list);
    }
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      cat = b.dataset.cat;
      UI.$$("[data-cat]", tabs).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      // фільтр в адресі — таке посилання можна вставити в сторіс
      try { const u = new URL(location.href); if (cat === "all") u.searchParams.delete("cat"); else u.searchParams.set("cat", cat); history.replaceState(null, "", u); } catch (err) { /* ок */ }
      render();
    });
    list.addEventListener("click", (e) => {
      const b = e.target.closest(".svc-card .toggle button");
      if (!b) return;
      const cardEl = b.closest(".svc-card");
      const s = BS.byId(BS.services, cardEl.dataset.id);
      durSel[s.id] = Number(b.dataset.dur);
      UI.$$(".toggle button", cardEl).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      UI.rollNumber(UI.$(".js-sp", cardEl), BS.priceOf(s, UI.getTier(), durSel[s.id]), 200);
    });
    document.addEventListener("bs:tier", () => {
      UI.$$(".svc-card", list).forEach((el) => {
        const s = BS.byId(BS.services, el.dataset.id);
        UI.rollNumber(UI.$(".js-sp", el), BS.priceOf(s, UI.getTier(), durSel[s.id] || s.durations[0]), 200);
      });
      UI.$$(".svc-row", list).forEach((el) => {
        const s = BS.byId(BS.services, el.dataset.id);
        UI.$(".svc-row__price b", el).textContent = UI.fmt(BS.priceOf(s, UI.getTier(), s.durations ? s.durations[0] : null));
      });
    });
    render();
  }

  /* Курси */
  const coursesBox = UI.$(".js-courses");
  if (coursesBox) {
    const C = BS.courses, pct = (x) => Math.round(x * 100) + "%";
    coursesBox.innerHTML = `
      <article class="course-card reveal"><p class="course-card__k">Ендосфера</p><p class="course-card__num">−${pct(C.endosphereDiscount[5])}</p>
        <p>5 процедур · діє ${C.validity[5]} днів</p></article>
      <article class="course-card course-card--accent reveal"><p class="course-card__k">Ендосфера</p><p class="course-card__num">−${pct(C.endosphereDiscount[10])}</p>
        <p>10 процедур · діє ${C.validity[10]} днів</p><p class="course-card__gift"><svg class="icon" aria-hidden="true"><use href="#i-gift"/></svg>Подарунок: ${UI.esc(C.gift[10])}</p>
        <a class="link-arrow" href="endosfera.html#kalkulyator">Порахувати<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></article>
      <article class="course-card reveal"><p class="course-card__k">Обгортання і тейпування</p><p class="course-card__num">−${pct(C.wrapsTapingDiscount[5])} / −${pct(C.wrapsTapingDiscount[10])}</p>
        <p>5 або 10 послуг · діє ${C.validity[5]} / ${C.validity[10]} днів</p></article>`;
  }

  /* Доповнення */
  const addonsBox = UI.$(".js-addons");
  function renderAddons() {
    if (!addonsBox) return;
    const t = UI.getTier();
    addonsBox.innerHTML = BS.addons.map((a) => `<li><span>${UI.esc(a.name)}${a.duration ? ` <small>${a.duration} хв</small>` : ""}</span><b>${UI.fmt(a.price[t])} грн</b></li>`).join("");
  }
  document.addEventListener("bs:tier", renderAddons);
  renderAddons();

  /* Правила (послуги, FAQ) */
  UI.$$(".js-rules").forEach((dl) => {
    dl.innerHTML = BS.rules.map((r) => `<div><dt>${UI.esc(r.title)}</dt><dd>${UI.esc(r.text)}</dd></div>`).join("");
  });

  /* =====================================================================
     Сторінка «Вагітним»
     ===================================================================== */
  const typesBox = UI.$(".js-preg-types");
  const PREG_PHOTO = { "vagitni-spyna": ["assets/img/massage-relax-green", 720, 800], "vagitni-zahalnyi": ["assets/img/massage-pregnant-side", 600, 1269], "vagitni-oblychchia": ["assets/img/studio-lamp", 720, 456] };
  function renderTypes() {
    if (!typesBox) return;
    const tier = UI.getTier();
    typesBox.innerHTML = BS.services.filter((s) => s.pregnancy).map((s, i) => {
      const p = PREG_PHOTO[s.id];
      return `<article class="preg-type reveal">
        <div class="preg-type__media">${p ? UI.img(p[0], p[1], p[2], s.name) : UI.placeholder()}</div>
        <div class="preg-type__body">
          <span class="preg-type__n">0${i + 1}</span>
          <h3>${UI.esc(s.name.replace(" для вагітних", ""))}</h3>
          <p class="muted">${UI.esc(s.short)}</p>
          <ul class="preg-type__prices">${s.durations.map((d) => `<li><span>${d} хв</span><b>${UI.fmt(BS.priceOf(s, tier, d))} грн</b></li>`).join("")}</ul>
          <a class="btn btn--block js-book" data-service="${s.id}" href="${BS.brand.direct}">Записатися<span class="js-book-studio"></span></a>
        </div>
      </article>`;
    }).join("");
    UI.refreshBooking();
    UI.observeReveal(typesBox);
  }
  document.addEventListener("bs:tier", renderTypes);
  renderTypes();

  const P = BS.pregnancy;
  const safe = UI.$(".js-preg-safe");
  if (safe) {
    safe.innerHTML = [
      ["Положення", P.positions],
      ["Рухи", P.approach],
      ["Зони", "У загальному масажі — усе тіло, окрім попереку та живота."],
      ["Атмосфера", "Під час масажу для нас важливо не просто попрацювати з напруженням у тілі, а й створити атмосферу, у якій ви зможете розслабитися та бути в комфорті."]
    ].concat(P.fromWeek ? [["Термін", P.fromWeek]] : []).map(([t, d]) => `<div><dt>${UI.esc(t)}</dt><dd>${UI.esc(d)}</dd></div>`).join("");
  }
  const contra = UI.$(".js-preg-contra");
  if (contra) contra.innerHTML = P.contraindications.map((c) => `<li>${UI.esc(c[0].toUpperCase() + c.slice(1))}</li>`).join("");
  const cn = UI.$(".js-preg-contra-note"); if (cn) cn.textContent = P.contraNote;
  const doc = UI.$(".js-preg-doctor"); if (doc) doc.textContent = P.doctorNote;
})();
