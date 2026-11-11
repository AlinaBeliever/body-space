/* =====================================================================
   Калькулятор курсу ендосфери.
   Входи: 45 / 60 хв, 1 / 5 / 10 процедур. Суми — точно з прайсу студії
   (data.js → endosphere), нічого не округлюємо самі.
   Виходи: сума, ціна за процедуру, економія, термін дії, таймлайн
   (≈ 2 візити на тиждень), подарунок, кнопка запису.
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;
  const E = BS.endosphere;

  // Текст про тест-драйв (головна і сторінка ендосфери)
  UI.$$(".js-endo-test").forEach((el) => {
    el.innerHTML = `${E.testDrive.minutes} хвилин на апараті — ноги, сідниці, талія й живіт — за <b>${UI.fmt(E.testDrive.price)} грн</b>. Щоб зрозуміти, чи ваше, ще до курсу.`;
  });

  UI.$$(".js-endo-price").forEach((el) => { el.innerHTML = `${UI.fmt(E.testDrive.price)} <small>грн · ${E.testDrive.minutes} хв</small>`; });

  /* Таблиця всіх цін ендосфери (сторінка «Ендосфера») */
  const table = UI.$(".js-endo-table");
  function renderTable() {
    if (!table) return;
    const tier = UI.getTier() === "lead" ? "lead" : "top";
    const rows = [
      { name: "Тіло · 45 хв", zones: E.body[45].zones, p: E.body[45][tier], svc: "endosfera" },
      { name: "Тіло · 60 хв", zones: E.body[60].zones, p: E.body[60][tier], svc: "endosfera" },
      { name: `Обличчя · ${E.face.minutes} хв`, zones: E.face.zones, p: E.face[tier], svc: "endosfera-oblychchia" },
      { name: `Тіло + обличчя · ${E.bodyFace.minutes} хв`, zones: E.bodyFace.zones, p: E.bodyFace[tier], svc: "endosfera-kompleks" }
    ];
    table.innerHTML = `<div class="endo-table__head" aria-hidden="true"><span></span><span>1 процедура</span><span>5 процедур</span><span>10 процедур</span></div>` +
      rows.map((r) => `<div class="endo-table__row">
        <div class="endo-table__name"><b>${UI.esc(r.name)}</b><small>${UI.esc(r.zones)}</small></div>
        <div><span class="endo-table__k">1 процедура</span><b>${UI.fmt(r.p[1])}</b> грн</div>
        <div><span class="endo-table__k">5 процедур</span><b>${UI.fmt(r.p[5])}</b> грн<small>${UI.fmt(Math.round(r.p[5] / 5))} / процедура</small></div>
        <div><span class="endo-table__k">10 процедур</span><b>${UI.fmt(r.p[10])}</b> грн<small>${UI.fmt(Math.round(r.p[10] / 10))} / процедура</small></div>
      </div>`).join("") +
      `<p class="endo-table__note small">Ціни ${tier === "lead" ? "провідної " : "топ-"}майстрині. Курс з 5 процедур діє ${BS.courses.validity[5]} днів, з 10 — ${BS.courses.validity[10]} днів. Подарунок «${BS.courses.gift[10]}» — до курсу з 10 процедур тіла. Тест-драйв — ${UI.fmt(E.testDrive.price)} грн у всіх майстринь.</p>`;
  }
  document.addEventListener("bs:tier", renderTable);
  renderTable();

  UI.$$(".js-calc").forEach((root) => {
    const out = UI.$(".js-calc-out", root);
    const state = { dur: 45, n: 10 };
    const read = (sel) => { const b = UI.$(sel + ' [aria-pressed="true"]', root); return b ? Number(b.dataset.v) : null; };
    state.dur = read(".js-calc-dur") || 45;
    state.n = read(".js-calc-n") || 10;

    /** Розрахунок — окрема функція, щоб її можна було перевірити. */
    function calc(dur, n, tier) {
      const t = E.body[dur][tier === "lead" ? "lead" : "top"];
      const single = t[1], total = t[n];
      return {
        total, single,
        per: Math.round(total / n),
        saving: single * n - total,
        validity: BS.courses.validity[n] || null,
        gift: n === 10 ? BS.courses.gift[10] : null,
        zones: E.body[dur].zones
      };
    }
    root.calc = calc; // для перевірки: document.querySelector('.js-calc').calc(45, 5, 'top')

    out.innerHTML = `
      <div class="calc__total"><span class="calc__label">Разом</span><span class="calc__sum"><span class="num js-sum">—</span> <span class="calc__cur">грн</span></span></div>
      <dl class="calc__facts">
        <div><dt>За процедуру</dt><dd><span class="num js-per"></span> грн</dd></div>
        <div><dt>Економія</dt><dd class="js-save-wrap"><span class="num js-save"></span> грн</dd></div>
        <div><dt>Курс діє</dt><dd class="js-valid"></dd></div>
      </dl>
      <div class="calc__timeline js-timeline" aria-hidden="true"></div>
      <p class="calc__tl-note small muted js-tl-note"></p>
      <p class="calc__gift js-gift" hidden><svg class="icon" aria-hidden="true"><use href="#i-gift"/></svg><span></span></p>
      <p class="calc__zones small muted js-zones"></p>
      <a class="btn btn--block js-book" data-service="endosfera" href="${BS.brand.direct}">Записатися на першу процедуру<span class="js-book-studio"></span></a>
      <p class="calc__tier small muted js-tier-note"></p>`;
    UI.refreshBooking();

    function render() {
      const tier = UI.getTier();
      const r = calc(state.dur, state.n, tier);
      UI.rollNumber(UI.$(".js-sum", out), r.total);
      UI.rollNumber(UI.$(".js-per", out), r.per);
      const saveWrap = UI.$(".js-save-wrap", out);
      if (r.saving > 0) { saveWrap.innerHTML = `<span class="num js-save">${UI.fmt(r.saving)}</span> грн`; }
      else { saveWrap.textContent = "—"; }
      UI.$(".js-valid", out).textContent = r.validity ? `${r.validity} днів` : "одна процедура";
      // Таймлайн: N точок, ≈ 2 візити на тиждень
      const weeks = Math.ceil(state.n / 2);
      UI.$(".js-timeline", out).innerHTML = Array.from({ length: state.n }, (_, i) =>
        `<span class="calc__dot${i === 0 ? " is-first" : ""}" style="--i:${i}"></span>`).join("");
      UI.$(".js-tl-note", out).textContent = state.n > 1
        ? `≈ 2 візити на тиждень — курс займе близько ${weeks} ${weeks === 1 ? "тижня" : "тижнів"}`
        : "Спробуйте одну процедуру або почніть з тест-драйву";
      const gift = UI.$(".js-gift", out);
      gift.hidden = !r.gift;
      if (r.gift) UI.$("span", gift).textContent = "Подарунок до курсу: " + r.gift;
      UI.$(".js-zones", out).textContent = `${state.dur} хв: ${r.zones}`;
      UI.$(".js-tier-note", out).textContent = tier === "lead"
        ? "Ціни провідної майстрині. Перемкнути рівень можна в прайсі."
        : "Ціни топ-майстрині. Перемкнути рівень можна в прайсі.";
    }

    root.addEventListener("click", (e) => {
      const b = e.target.closest(".toggle button");
      if (!b) return;
      const group = b.closest(".toggle");
      UI.$$("button", group).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (group.classList.contains("js-calc-dur")) state.dur = Number(b.dataset.v);
      if (group.classList.contains("js-calc-n")) state.n = Number(b.dataset.v);
      render();
    });
    document.addEventListener("bs:tier", render);
    render();
  });
})();
