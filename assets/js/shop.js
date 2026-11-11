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

  /* ---------- Рядки засобів: головна (4 засоби) або «після процедури» (data-after) ---------- */
  UI.$$(".js-products").forEach((row) => {
    let list;
    if (row.dataset.after) {
      const after = row.dataset.after.split(",");
      list = BS.products.filter((p) => after.includes(p.after));
    } else {
      list = ["styx-kaviar", "styx-cool", "styx-contour", "wm-pleasure"].map((id) => BS.byId(BS.products, id));
    }
    row.innerHTML = list.slice(0, 4).map(productCard).join("");
  });

  /* ---------- Сторінка «Засоби»: фільтр бренду й потреби (?brand=&need=) + список ---------- */
  const grid = UI.$(".js-shop-grid");
  if (grid) {
    const fb = UI.$(".js-f-brand"), fn = UI.$(".js-f-need");
    const brands = [...new Set(BS.products.map((p) => p.brand))];
    const q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
    let brand = brands.includes(q.get("brand")) ? q.get("brand") : "";
    let need = BS.productNeeds.some((n) => n.id === q.get("need")) ? q.get("need") : "";
    const match = (p, b, n) => (!b || p.brand === b) && (!n || p.need.includes(n));

    function chips() {
      fb.innerHTML = [""].concat(brands).map((b) =>
        `<button class="chip" type="button" data-brand="${UI.esc(b)}" aria-pressed="${b === brand}"><svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${b ? UI.esc(b) : "Усі"}</button>`).join("");
      // показуємо лише ті потреби, для яких є засоби обраного бренду — без порожніх результатів
      fn.innerHTML = [{ id: "", name: "Будь-яка" }].concat(BS.productNeeds.filter((n) => BS.products.some((p) => match(p, brand, n.id)))).map((n) =>
        `<button class="chip" type="button" data-need="${n.id}" aria-pressed="${n.id === need}"><svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(n.name)}</button>`).join("");
    }
    function render() {
      if (!BS.products.some((p) => match(p, brand, need))) need = "";
      chips();
      grid.innerHTML = BS.products.filter((p) => match(p, brand, need)).map(productCard).join("");
      try {
        const u = new URL(location.href);
        brand ? u.searchParams.set("brand", brand) : u.searchParams.delete("brand");
        need ? u.searchParams.set("need", need) : u.searchParams.delete("need");
        history.replaceState(null, "", u);
      } catch (e) { /* ок */ }
    }
    UI.$(".js-shop-filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-brand]"), n = e.target.closest("[data-need]");
      if (b) brand = b.dataset.brand;
      if (n) need = n.dataset.need;
      if (b || n) render();
    });
    render();

    // Список для замовлення
    const items = UI.$(".js-order-items"), sum = UI.$(".js-order-sum"), orderBtn = UI.$(".js-shop-order");
    function renderOrder() {
      const l = getList();
      UI.$$(".js-shop-count").forEach((el) => { el.textContent = l.length; });
      if (!l.length) {
        items.innerHTML = `<li class="order-list__hint">Натисніть «До списку» на засобі — він з’явиться тут.</li>`;
        sum.textContent = ""; orderBtn.disabled = true; return;
      }
      const ps = l.map((id) => BS.byId(BS.products, id));
      items.innerHTML = ps.map((p) => `<li><span>${UI.esc(p.name)}<small>${UI.esc(p.brand)}</small></span><b>${UI.fmt(p.price)} грн</b>
        <button class="order-list__rm js-shop-toggle" type="button" data-id="${p.id}" aria-label="Прибрати ${UI.esc(p.name)}"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button></li>`).join("");
      sum.innerHTML = `Разом: <b>${UI.fmt(ps.reduce((a, p) => a + p.price, 0))} грн</b> + доставка`;
      orderBtn.disabled = false;
    }
    document.addEventListener("bs:shop", renderOrder);
    UI.$(".js-order-clear").addEventListener("click", () => { setList([]); UI.toast("Список очищено"); });
    renderOrder();
  }
})();
