/* =====================================================================
   «Що вас турбує?» — підбір масажу за один клік.
   Клік по відчуттю → кругле фото м'яко змінюється (crossfade 400 мс),
   показуємо масаж, тривалість і ціну (ціна «докручується»).
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;
  const chipsBox = UI.$(".js-concerns");
  const photoBox = UI.$(".js-concern-photo");
  const cardBox = UI.$(".js-concern-card");
  if (!chipsBox || !photoBox || !cardBox) return;

  let current = null;

  // Куди веде «Детальніше» для кожної послуги
  const moreLink = (c, svc) => c.link || (svc.cat === "endosfera" ? "endosfera.html" : "poslugy.html?cat=" + svc.cat);

  chipsBox.innerHTML = BS.concerns.map((c, i) =>
    `<button class="chip" type="button" data-id="${c.id}" aria-pressed="${i === 0}">
       <svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(c.label)}
     </button>`).join("");

  // Фото: два шари для плавної зміни
  photoBox.innerHTML = `<div class="xfade"><div class="xfade__layer is-on"></div><div class="xfade__layer"></div></div>`;
  const layers = UI.$$(".xfade__layer", photoBox);
  let front = 0;
  function setPhoto(c) {
    const html = c.photo ? UI.img(c.photo, c.photoW, c.photoH, c.label) : UI.placeholder("Body Space");
    const next = layers[1 - front];
    next.innerHTML = html;
    next.classList.add("is-on");
    layers[front].classList.remove("is-on");
    front = 1 - front;
  }

  function render(c, first) {
    const svc = BS.byId(BS.services, c.service);
    const tier = UI.getTier();
    const price = BS.priceOf(svc, tier, c.duration);
    const tierName = BS.tiers[tier].short.toLowerCase();
    if (first || !cardBox.firstElementChild) {
      cardBox.innerHTML = `
        <p class="concerns__kicker">Вам підійде</p>
        <h3 class="concerns__name js-c-name"></h3>
        <p class="concerns__text js-c-text"></p>
        <p class="concerns__meta"><span class="js-c-dur"></span><span class="concerns__price"><span class="num js-c-price"></span> грн</span></p>
        <p class="concerns__tier small muted js-c-tier"></p>
        <div class="concerns__actions">
          <a class="btn js-book js-c-book" href="${BS.brand.direct}">Записатися<span class="js-book-studio"></span></a>
          <a class="link-arrow js-c-more" href="poslugy.html"><span class="js-c-more-t">Усе про масаж</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        </div>`;
    }
    UI.$(".js-c-name", cardBox).textContent = svc.name;
    UI.$(".js-c-text", cardBox).textContent = c.text;
    UI.$(".js-c-dur", cardBox).textContent = c.duration + " хв";
    UI.rollNumber(UI.$(".js-c-price", cardBox), price);
    UI.$(".js-c-tier", cardBox).textContent = svc.price.all ? "Ціна однакова для всіх майстринь" : `Ціна в ${tierName === "топ" ? "топ-майстрині" : "провідної майстрині"}`;
    UI.$(".js-c-book", cardBox).dataset.service = svc.id;
    UI.$(".js-c-more", cardBox).href = moreLink(c, svc);
    UI.$(".js-c-more-t", cardBox).textContent = c.link ? "Усе для майбутніх мам" : svc.cat === "endosfera" ? "Усе про ендосферу" : "Усі ціни: " + BS.byId(BS.categories, svc.cat).name.toLowerCase();
    UI.refreshBooking();
  }

  function select(id, first) {
    const c = BS.byId(BS.concerns, id);
    if (!c || (current && current.id === id && !first)) return;
    current = c;
    UI.$$(".chip", chipsBox).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    setPhoto(c);
    render(c, first);
  }

  chipsBox.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) select(b.dataset.id);
  });
  document.addEventListener("bs:tier", () => current && render(current));

  select(BS.concerns[0].id, true);
})();
