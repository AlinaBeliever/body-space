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
})();
