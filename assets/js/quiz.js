/* =====================================================================
   Квіз «Який масаж потрібен вам зараз?» — модальне вікно (#pidbir),
   відкривається з будь-якої сторінки. 4 кроки, без форми з телефоном.
   Результат: послуга з цінами обох рівнів, 2 майстрині студії,
   «Записатися» і «Надіслати в Телеграм».
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;
  const modal = UI.$(".js-quiz");
  if (!modal) return;
  const body = UI.$(".js-quiz-body", modal);

  const STEPS = [
    { key: "goal", title: "Чого вам зараз хочеться?", options: [
      { v: "relax", label: "Розслабитися і відпочити" },
      { v: "back", label: "Зняти напругу в спині й шиї" },
      { v: "legs", label: "Легкість у ногах" },
      { v: "figure", label: "Попрацювати з фігурою" },
      { v: "face", label: "Подбати про обличчя" },
      { v: "sport", label: "Відновитися після спорту" }
    ] },
    { key: "pregnant", title: "Ви зараз вагітні?", options: [
      { v: "no", label: "Ні" },
      { v: "yes", label: "Так" }
    ] },
    { key: "pressure", title: "Який тиск вам приємний?", options: [
      { v: "soft", label: "М’який" },
      { v: "medium", label: "Середній" },
      { v: "strong", label: "Інтенсивний" }
    ] },
    { key: "time", title: "Скільки часу і де?", options: [
      { v: "short", label: "До години" },
      { v: "long", label: "Можна довше" }
    ], studios: true }
  ];

  /* Таблиця правил: відповіді → послуга і спеціалізація майстрині */
  function pick(a) {
    if (a.pregnant === "yes") {
      // для вагітних — лише масажі для вагітних, без апаратних
      if (a.time === "long" && (a.goal === "face" || a.goal === "relax")) return { service: "vagitni-oblychchia", spec: "vagitni" };
      if (a.time === "short" && (a.goal === "back" || a.goal === "face")) return { service: "vagitni-spyna", spec: "vagitni" };
      return { service: "vagitni-zahalnyi", spec: "vagitni" };
    }
    const T = {
      relax:  a.pressure === "strong" ? { service: "zahalnyi", spec: "ozdorovchyi" } : { service: "relaks", spec: "relaks" },
      back:   a.time === "long" ? { service: "zahalnyi", spec: "ozdorovchyi" } : { service: "spyna", spec: "ozdorovchyi" },
      legs:   a.pressure === "soft" ? { service: "limfodrenazh", spec: null } : { service: "presoterapiia", spec: null },
      figure: a.pressure === "strong" ? { service: "antytselulitnyi", spec: "antytselulit" } : { service: "endosfera", spec: "endosfera" },
      face:   a.pressure === "soft" ? { service: "oblychchia", spec: "oblychchia" } : { service: "endosfera-oblychchia", spec: "endosfera" },
      sport:  a.pressure === "soft" ? { service: "relaks", spec: "relaks" } : { service: "sportyvnyi", spec: "sport" }
    };
    return T[a.goal] || T.relax;
  }

  let step = 0, answers = {};

  function bar() {
    UI.$(".js-quiz-bar", modal).style.width = ((Math.min(step, 4)) / 4) * 100 + "%";
    UI.$(".js-quiz-step", modal).textContent = step < 4 ? `Крок ${step + 1} з 4` : "Ваш результат";
  }

  function renderStep() {
    const s = STEPS[step];
    UI.$(".js-quiz-title", modal).textContent = s.title;
    let html = `<div class="quiz__options" role="group" aria-label="${UI.esc(s.title)}">` +
      s.options.map((o) => `<button class="chip quiz__opt" type="button" aria-pressed="${answers[s.key] === o.v}" data-k="${s.key}" data-v="${o.v}">
        <svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(o.label)}</button>`).join("") + `</div>`;
    if (s.studios) {
      const cur = answers.studio || UI.studio || "";
      html += `<p class="quiz__sub">Студія</p><div class="quiz__options" role="group" aria-label="Студія">` +
        [{ id: "", short: "Будь-яка" }].concat(BS.studios).map((st) =>
          `<button class="chip quiz__opt" type="button" aria-pressed="${cur === st.id}" data-k="studio" data-v="${st.id}">
            <svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(st.short)}</button>`).join("") + `</div>`;
      if (!("studio" in answers)) answers.studio = cur;
    }
    if (s.key === "pregnant" && answers.pregnant === "yes") html += `<p class="quiz__note"><svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(BS.pregnancy.doctorNote)}</p>`;
    html += `<div class="quiz__nav">
      ${step > 0 ? `<button class="btn btn--ghost js-quiz-back" type="button"><svg class="icon" aria-hidden="true"><use href="#i-arrow-left"/></svg>Назад</button>` : "<span></span>"}
      <button class="btn js-quiz-next" type="button" ${answers[s.key] ? "" : "disabled"}>${step === 3 ? "Показати результат" : "Далі"}<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
    </div>`;
    body.innerHTML = html;
    bar();
  }

  function renderResult() {
    const r = pick(answers);
    const svc = BS.byId(BS.services, r.service);
    const idx = answers.time === "long" ? svc.durations.length - 1 : 0;
    const dur = svc.durations[idx];
    const top = BS.priceOf(svc, "top", dur), lead = BS.priceOf(svc, "lead", dur);
    let pool = BS.masters.filter((m) => !answers.studio || m.studios.includes(answers.studio));
    let fit = r.spec ? pool.filter((m) => m.specs.includes(r.spec)) : pool;
    // У цій студії ніхто цього не робить — показуємо майстринь з потрібною спеціалізацією в інших студіях
    let elsewhere = false;
    if (!fit.length && r.spec) { fit = BS.masters.filter((m) => m.specs.includes(r.spec)); elsewhere = !!answers.studio && fit.length > 0; }
    if (!fit.length) fit = pool;
    const two = fit.slice(0, 2);
    const studioName = answers.studio ? BS.byId(BS.studios, answers.studio).short : null;
    const mastersTitle = elsewhere
      ? `Найбільше досвіду в цьому — у майстринь інших студій`
      : "Майстрині" + (studioName ? " студії «" + UI.esc(studioName) + "»" : "");

    UI.$(".js-quiz-title", modal).textContent = "Вам підійде";
    const text = `Вітаю! Я з сайту Body Space, підбір порадив мені: ${svc.name}, ${dur} хв` +
      (studioName && !elsewhere ? `, студія ${studioName}` : "") + (two.length ? `. Хочу до майстрині: ${two.map((m) => m.name).join(" або ")}` : "") + ". Підкажіть, будь ласка, вільний час.";

    body.innerHTML = `
      <div class="quiz__result">
        <h3 class="quiz__svc">${UI.esc(svc.name)}</h3>
        <p class="muted">${UI.esc(svc.short)}</p>
        <div class="quiz__prices">
          <div><span>${dur} хв · топ</span><b>${UI.fmt(top)} грн</b></div>
          ${svc.price.all ? "" : `<div><span>${dur} хв · провідна</span><b>${UI.fmt(lead)} грн</b></div>`}
        </div>
        ${answers.pregnant === "yes" ? `<p class="quiz__note"><svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(BS.pregnancy.doctorNote)}</p>` : ""}
        ${two.length ? `<p class="quiz__sub">${mastersTitle}</p>
        <ul class="quiz__masters">${two.map((m) => `<li>
            ${UI.img(m.photo, 360, 450, m.name, { cls: "no-bg" })}
            <span><b>${UI.esc(m.name)}</b><small>${UI.esc(BS.tiers[m.tier].name)} · ${m.studios.map((s) => BS.byId(BS.studios, s).short).join(", ")}</small></span>
            <a class="btn btn--sm js-book" data-master="${m.id}" href="${BS.brand.direct}">Записатися</a>
          </li>`).join("")}</ul>` : ""}
        <div class="quiz__nav">
          <a class="btn js-book" data-service="${svc.id}" href="${BS.brand.direct}">Записатися<span class="js-book-studio"></span></a>
          <button class="btn btn--ghost js-quiz-direct" type="button"><svg class="icon" aria-hidden="true"><use href="#i-telegram"/></svg>Надіслати в Телеграм</button>
        </div>
        <button class="link-arrow js-quiz-restart" type="button">Пройти ще раз</button>
      </div>`;
    body.dataset.text = text;
    if (answers.studio && !elsewhere && answers.studio !== UI.studio) UI.setStudio(answers.studio);
    UI.refreshBooking();
    bar();
  }

  modal.addEventListener("click", (e) => {
    const opt = e.target.closest(".quiz__opt");
    if (opt) {
      answers[opt.dataset.k] = opt.dataset.v;
      UI.$$(`.quiz__opt[data-k="${opt.dataset.k}"]`, modal).forEach((b) => b.setAttribute("aria-pressed", String(b === opt)));
      const next = UI.$(".js-quiz-next", modal);
      if (next) next.disabled = !answers[STEPS[step].key];
      // підказка лікаря після «Так» — без перемальовування, щоб фокус лишився на кнопці
      if (opt.dataset.k === "pregnant") {
        const note = UI.$(".quiz__note", body);
        if (opt.dataset.v === "yes" && !note) {
          UI.$(".quiz__options", body).insertAdjacentHTML("afterend",
            `<p class="quiz__note"><svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(BS.pregnancy.doctorNote)}</p>`);
        } else if (opt.dataset.v !== "yes" && note) note.remove();
      }
      return;
    }
    if (e.target.closest(".js-quiz-next")) { step++; step >= 4 ? renderResult() : renderStep(); focusFirst(); return; }
    if (e.target.closest(".js-quiz-back")) { step--; renderStep(); focusFirst(); return; }
    if (e.target.closest(".js-quiz-restart")) { step = 0; answers = {}; renderStep(); focusFirst(); return; }
    if (e.target.closest(".js-quiz-direct")) { UI.copyAndOpenTelegram(body.dataset.text || "", { copied: "Заявку скопійовано. Якщо в Telegram поле порожнє, просто вставте текст", plain: "Відкриваємо Telegram. Напишіть, який масаж обрали" }); return; }
    if (e.target.closest(".js-quiz-close")) UI.closeModal();
  });
  function focusFirst() { const f = UI.$(".quiz__opt, .quiz__svc", body); if (f) { if (!f.matches("button")) f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); } }

  function open(trigger) {
    step = 0; answers = {};
    renderStep();
    UI.openModal(modal, trigger);
  }
  window.BSQuiz = { open, pick };
  if (location.hash === "#pidbir") open();
  window.addEventListener("hashchange", () => { if (location.hash === "#pidbir") open(); });
})();
