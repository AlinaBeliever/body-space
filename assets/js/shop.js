/* =====================================================================
   Засоби «Догляд вдома»: картки, «Список для замовлення» (localStorage)
   і замовлення одним повідомленням у Direct.
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;

  /* ---------- Список для замовлення ---------- */
  const getList = () => { const l = UI.store.get("shopList", []); return Array.isArray(l) ? l.filter((id) => BS.byId(BS.products, id)) : []; };
  const setList = (l) => { UI.store.set("shopList", l); document.dispatchEvent(new CustomEvent("bs:shop", { detail: l })); };
  function toggle(id) {
    const l = getList();
    const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    setList(l);
    const p = BS.byId(BS.products, id);
    UI.toast(i >= 0 ? `Прибрано зі списку: ${p.name}` : `Додано до списку: ${p.name}`);
  }
  function orderText(list = getList()) {
    const items = list.map((id) => BS.byId(BS.products, id));
    const sum = items.reduce((a, p) => a + p.price, 0);
    return "Вітаю! Хочу замовити засоби з сайту Body Space:\n" +
      items.map((p, i) => `${i + 1}. ${p.brand} ${p.name}${p.volume ? ", " + p.volume : ""} — ${p.price} грн`).join("\n") +
      `\nРазом: ${sum} грн.\nДоставка Новою поштою: місто, відділення, ПІБ, телефон — `;
  }

  const afterName = (id) => { const s = id ? BS.byId(BS.services, id) : null; return s ? s.name.toLowerCase() : null; };

  function productCard(p) {
    const inList = getList().includes(p.id);
    const after = afterName(p.after);
    const tester = p.tester ? `<span class="tag tag--sand">Тестер на ${UI.esc(BS.byId(BS.studios, p.tester).short)}</span>` : "";
    return `<article class="product-card" data-id="${p.id}">
      <div class="product-card__media">${UI.img(p.photo, 400, 400, `${p.brand} ${p.name}`, { cls: "no-bg" })}</div>
      <div class="product-card__body">
        <p class="product-card__brand">${UI.esc(p.brand)}</p>
        <h3 class="product-card__name">${UI.esc(p.name)}</h3>
        <p class="product-card__kind">${UI.esc(p.kind)}${p.volume ? " · " + UI.esc(p.volume) : ""}</p>
        ${after ? `<p class="product-card__after small">Радимо після: ${UI.esc(after)}</p>` : ""}
        ${tester}
        <div class="product-card__foot">
          <span class="product-card__price">${UI.fmt(p.price)} <small>грн</small></span>
          <button class="btn btn--sm ${inList ? "" : "btn--ghost"} js-shop-toggle" type="button" data-id="${p.id}" aria-pressed="${inList}">
            ${inList ? '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>У списку' : "До списку"}
          </button>
        </div>
      </div>
    </article>`;
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest(".js-shop-toggle");
    if (b) { toggle(b.dataset.id); return; }
    if (e.target.closest(".js-shop-order")) { const l = getList(); if (l.length) UI.copyAndOpenDirect(orderText(l)); }
  });

  /* Оновлюємо кнопки без перемальовки всієї сторінки */
  document.addEventListener("bs:shop", () => {
    const l = getList();
    UI.$$(".js-shop-toggle").forEach((b) => {
      const on = l.includes(b.dataset.id);
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("btn--ghost", !on);
      b.innerHTML = on ? '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>У списку' : "До списку";
    });
    UI.$$(".js-shop-count").forEach((el) => { el.textContent = l.length; });
  });

  window.BSShop = { productCard, getList, setList, orderText, toggle };

  /* ---------- Головна: 4 засоби ---------- */
  const row = UI.$(".js-products");
  if (row) {
    const HOME = ["styx-kaviar", "styx-cool", "styx-contour", "wm-pleasure"];
    row.innerHTML = HOME.map((id) => productCard(BS.byId(BS.products, id))).join("");
  }
})();
