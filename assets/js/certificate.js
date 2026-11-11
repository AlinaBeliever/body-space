/* =====================================================================
   Конструктор подарункового сертифіката: процедура, дизайн, ім'я,
   побажання, формат — картка (CSS) оновлюється наживо.
   Відправка: Formspree (ID у data.js → FORMSPREE_ID) або «Оформити в Direct».
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;
  const form = UI.$(".js-cert-form");
  if (!form) return;
  const card = UI.$(".js-cert-card");

  // Процедури для сертифіката (ціна — з прайсу, рівень «топ», тобто «від»)
  const PROCS = [
    ["relaks", 60], ["relaks", 90], ["zahalnyi", 60], ["zahalnyi", 90], ["spyna", 60],
    ["kompleks-zahalnyi-oblychchia", 90], ["stoun", 90], ["oblychchia", 60],
    ["vagitni-zahalnyi", 60], ["endosfera-test", 30]
  ].map(([id, d]) => ({ s: BS.byId(BS.services, id), d }));
  const DESIGNS = [
    { id: "forest", name: "Лісовий", cls: "gift-card--forest" },
    { id: "cream", name: "Кремовий", cls: "gift-card--cream" },
    { id: "candle", name: "Свічковий", cls: "gift-card--candle" }
  ];
  const WISHES = ["Час для себе — з любов’ю", "Видихни і відпочинь", "Для майбутньої мами — з турботою", "Дякую, що ти є"];

  const isMama = (() => { try { return new URLSearchParams(location.search).get("for") === "mama"; } catch (e) { return false; } })();
  const state = {
    proc: isMama ? 8 : 0, design: isMama ? "candle" : "forest",
    format: BS.certificate.formats[0], pickup: UI.studio || BS.studios[0].id
  };
  if (isMama) form.wish.value = "Для майбутньої мами — з турботою";

  const procName = (p) => `${p.s.name} · ${p.d} хв`;
  const procPrice = (p) => BS.priceOf(p.s, "top", p.d);

  UI.$(".js-cert-proc").innerHTML = PROCS.map((p, i) =>
    `<button class="chip" type="button" role="radio" aria-checked="${i === state.proc}" data-i="${i}"><svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(p.s.name)} · ${p.d} хв</button>`).join("");
  UI.$(".js-cert-design").innerHTML = DESIGNS.map((d) =>
    `<button class="cert-swatch ${d.cls}" type="button" role="radio" aria-checked="${d.id === state.design}" data-d="${d.id}"><span>${d.name}</span></button>`).join("");
  UI.$(".js-wish-ideas").innerHTML = WISHES.map((w) => `<button class="chip" type="button" data-w="${UI.esc(w)}">${UI.esc(w)}</button>`).join("");
  UI.$(".js-cert-format").innerHTML = BS.certificate.formats.map((f) =>
    `<button class="chip" type="button" role="radio" aria-checked="${f === state.format}" data-f="${UI.esc(f)}"><svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(f)}</button>`).join("");
  form.pickup.innerHTML = BS.studios.map((s) => `<option value="${s.id}">${UI.esc(s.label)}</option>`).join("");
  form.pickup.value = state.pickup;
  UI.$(".js-cert-days").textContent = BS.certificate.validityDays;

  // Умови (нижня секція)
  const rules = UI.$(".js-cert-rules");
  if (rules) rules.innerHTML = [
    ["Термін дії", `${BS.certificate.validityDays} днів з моменту дарування.`],
    ["На що", "На обрану процедуру в будь-якій із чотирьох студій Body Space."],
    ["Формат", "Цифровий (PDF) або друкований — забрати у студії."],
    ["Оплата", "Після заявки адміністраторка напише вам і підкаже, як оплатити."]
  ].map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("");
  // TODO власниця: підтвердити формати, оплату і чи можна сертифікат на суму

  function render() {
    const p = PROCS[state.proc];
    DESIGNS.forEach((d) => card.classList.toggle(d.cls, d.id === state.design));
    UI.$(".js-cc-title", card).textContent = procName(p);
    const to = form.to.value.trim(), from = form.from.value.trim();
    // імена не відмінюємо (не знаємо відмінка) — тому формат «Олена — з турботою · Марина»
    UI.$(".js-cc-for", card).textContent = to ? `${to} — з турботою${from ? " · " + from : ""}` : "для вас — з турботою";
    UI.$(".js-cc-wish", card).textContent = form.wish.value.trim();
    UI.$(".js-cc-days", card).textContent = `Діє ${BS.certificate.validityDays} днів`;
    UI.$(".js-cc-format", card).textContent = state.format.startsWith("Друк") ? BS.byId(BS.studios, state.pickup).short : "PDF";
    UI.$(".js-cc-price").textContent = `від ${UI.fmt(procPrice(p))} грн`;
    UI.$(".js-wish-count").textContent = `${form.wish.value.length} / 90`;
    UI.$(".js-pickup").hidden = !state.format.startsWith("Друк");
  }

  form.addEventListener("click", (e) => {
    const c = e.target.closest("[data-i]"), d = e.target.closest("[data-d]"), f = e.target.closest("[data-f]"), w = e.target.closest("[data-w]");
    const check = (sel, el) => UI.$$(sel, form).forEach((x) => x.setAttribute("aria-checked", String(x === el)));
    if (c) { state.proc = Number(c.dataset.i); check("[data-i]", c); }
    if (d) { state.design = d.dataset.d; check("[data-d]", d); }
    if (f) { state.format = f.dataset.f; check("[data-f]", f); }
    if (w) { form.wish.value = w.dataset.w; }
    if (c || d || f || w) render();
  });
  form.addEventListener("input", (e) => { if (e.target.name === "pickup") state.pickup = e.target.value; render(); });
  form.addEventListener("change", (e) => { if (e.target.name === "pickup") { state.pickup = e.target.value; render(); } });

  function summary() {
    const p = PROCS[state.proc];
    return [
      "Вітаю! Хочу оформити подарунковий сертифікат Body Space:",
      `Процедура: ${procName(p)} (від ${procPrice(p)} грн)`,
      `Дизайн: ${DESIGNS.find((d) => d.id === state.design).name}`,
      form.to.value.trim() ? `Для: ${form.to.value.trim()}` : "",
      form.from.value.trim() ? `Від: ${form.from.value.trim()}` : "",
      form.wish.value.trim() ? `Побажання: ${form.wish.value.trim()}` : "",
      `Формат: ${state.format}${state.format.startsWith("Друк") ? " — забрати: " + BS.byId(BS.studios, state.pickup).label : ""}`,
      form.name.value.trim() ? `Моє ім’я: ${form.name.value.trim()}` : "",
      form.contact.value.trim() ? `Контакт: ${form.contact.value.trim()}` : ""
    ].filter(Boolean).join("\n");
  }

  UI.$(".js-cert-direct").addEventListener("click", () => UI.copyAndOpenDirect(summary()));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = UI.$(".js-cert-error");
    if (!form.name.value.trim() || !form.contact.value.trim()) {
      err.hidden = false; err.textContent = "Вкажіть, будь ласка, ім’я і телефон або Instagram — щоб ми могли з вами зв’язатися.";
      (form.name.value.trim() ? form.contact : form.name).focus();
      return;
    }
    err.hidden = true;
    if (!BS.FORMSPREE_ID) {
      // Поки Formspree не підключено — надсилаємо через Direct
      UI.copyAndOpenDirect(summary());
      return;
    }
    const btn = UI.$(".js-cert-submit");
    btn.disabled = true;
    try {
      const res = await fetch("https://formspree.io/f/" + BS.FORMSPREE_ID, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: "Сертифікат Body Space", message: summary() })
      });
      if (!res.ok) throw new Error(res.status);
      UI.toast("Дякуємо! Заявку надіслано — ми напишемо вам найближчим часом");
      form.reset(); render();
    } catch (er) {
      UI.toast("Не вдалося надіслати — оформимо в Direct");
      UI.copyAndOpenDirect(summary());
    } finally { btn.disabled = false; }
  });

  render();
})();
