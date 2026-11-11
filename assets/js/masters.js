/* =====================================================================
   Майстрині: картки (портрет, фото рук, рівень, роки практики, робочі
   дні, цитата, відгук, запис у 1 клік) + каруселька на головній.
   Відгуки: один великий відгук у фокусі зі стрілками.
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS, UI = window.BSUI;

  const studioOf = (id) => BS.byId(BS.studios, id);
  const reviewsOf = (m) => BS.reviews.filter((r) => r.master === m.id);
  const stars = (n) => (n ? `<span class="stars" aria-label="${n} з 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>` : "");
  const MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

  // «з вересня 2003 року · 23 роки практики» (рахується від поточного року за Києвом)
  function sinceLabel(m) {
    const years = UI.kyivYear() - m.since;
    const from = m.sinceMonth ? `з ${MONTHS[m.sinceMonth - 1]} ${m.since} року` : `з ${m.since} року`;
    return years >= 1 ? `${from} · ${years} ${UI.yearsWord(years)} практики` : from;
  }

  /** Найкоротший змістовний відгук для картки */
  function cardReview(m) {
    const list = reviewsOf(m).filter((r) => r.text.length >= 30 && r.text.length <= 150);
    list.sort((a, b) => (b.rating || 5) - (a.rating || 5) || b.text.length - a.text.length);
    return list[0] || reviewsOf(m)[0] || null;
  }

  function masterCard(m, opts = {}) {
    const tier = BS.tiers[m.tier];
    const studios = m.studios.map((s) => studioOf(s).short).join(" · ");
    const rev = cardReview(m);
    const days = m.days && m.days.length
      ? `<ul class="master-card__days" aria-label="Робочі дні">${m.days.map((d) => `<li>${UI.esc(d)}</li>`).join("")}</ul>` : "";
    const hands = m.handsPhoto
      ? UI.img(m.handsPhoto, 200, 200, `Руки ${m.nameTo} за роботою`)
      : `<span class="ph"><svg aria-hidden="true"><use href="#i-leaf"/></svg></span>`;
    return `<article class="master-card${opts.cls ? " " + opts.cls : ""}" data-id="${m.id}">
      <div class="master-card__media">
        ${UI.img(m.photo, 360, 450, `${m.name}, ${tier.name.toLowerCase()} Body Space`, { cls: "no-bg" })}
        <span class="master-card__hands frame-circle" ${m.handsPhoto ? "" : 'title="Фото рук — скоро"'}>${hands}</span>
      </div>
      <div class="master-card__body">
        <p class="master-card__tier"><span class="tag${m.tier === "lead" ? " tag--sand" : ""}">${UI.esc(tier.name)}</span></p>
        <h3 class="master-card__name">${UI.esc(m.name)}</h3>
        <p class="master-card__since">${UI.esc(sinceLabel(m))}</p>
        <p class="master-card__studio"><svg class="icon" aria-hidden="true"><use href="#i-pin"/></svg>${UI.esc(studios)}</p>
        ${days}
        <blockquote class="master-card__quote"><p>${UI.esc(m.quote)}</p></blockquote>
        ${rev ? `<figure class="master-card__review"><figcaption>${stars(rev.rating)}${rev.date ? ` <span>${UI.fmtDate(rev.date)}</span>` : ""}</figcaption><blockquote><p>«${UI.esc(rev.text)}»</p></blockquote></figure>` : ""}
        <div class="master-card__actions">
          <a class="btn btn--block js-book" data-master="${m.id}" href="${BS.brand.direct}">Записатися до ${UI.esc(m.nameTo)}</a>
          ${opts.more ? `<button class="link-arrow js-master-more" type="button" data-id="${m.id}">Усі відгуки (${reviewsOf(m).length})<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>` : ""}
        </div>
      </div>
    </article>`;
  }

  window.BSMasters = { masterCard, reviewsOf, sinceLabel, stars };

  /* ---------- Каруселька на головній ---------- */
  const track = UI.$(".js-masters-track");
  if (track) {
    const HOME = ["valeriia", "nataliia", "kateryna", "tetiana", "bohdana", "liudmyla"];
    const sub = UI.$(".js-masters-sub");
    function renderTrack() {
      let list = HOME.map((id) => BS.byId(BS.masters, id));
      const st = UI.studio;
      if (st) {
        // майстрині обраної студії — першими
        const mine = BS.masters.filter((m) => m.studios.includes(st));
        list = mine.concat(list.filter((m) => !m.studios.includes(st))).slice(0, 6);
      }
      track.innerHTML = `<div class="masters__inner">${list.map((m) => masterCard(m)).join("")}</div>`;
      if (sub) sub.textContent = st
        ? `Спершу — майстрині студії «${studioOf(st).short}». Запис до конкретної майстрині — в один клік.`
        : `${BS.masters.length} майстринь у ${BS.studios.length} студіях. Запис до конкретної майстрині — в один клік.`;
      UI.refreshBooking();
    }
    renderTrack();
    document.addEventListener("bs:studio", renderTrack);
    const step = () => { const c = UI.$(".master-card", track); return c ? c.getBoundingClientRect().width + 20 : 320; };
    const prev = UI.$(".js-masters-prev"), next = UI.$(".js-masters-next");
    const behavior = UI.reducedMotion ? "auto" : "smooth";
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior }));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step(), behavior }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step(), behavior }); }
    });
  }

  /* ---------- Відгук у фокусі ---------- */
  UI.$$(".js-review").forEach((box) => {
    const filter = box.dataset.tag || null;
    let list = BS.reviews.filter((r) => r.featured && (!filter || (r.tags || []).includes(filter)));
    if (filter) list = BS.reviews.filter((r) => (r.tags || []).includes(filter));
    // першим — відгук про «поруч з домом»: це головна ідея Body Space
    list.sort((a, b) => (b.nearHome ? 1 : 0) - (a.nearHome ? 1 : 0));
    if (!list.length) { box.hidden = true; return; }
    let i = 0;
    box.innerHTML = `
      <div class="review-focus__stage js-rf-stage"></div>
      <div class="review-focus__nav">
        <button class="round-btn js-rf-prev" type="button" aria-label="Попередній відгук"><svg class="icon" aria-hidden="true"><use href="#i-arrow-left"/></svg></button>
        <span class="review-focus__count js-rf-count" aria-hidden="true"></span>
        <button class="round-btn js-rf-next" type="button" aria-label="Наступний відгук"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
      </div>`;
    const stage = UI.$(".js-rf-stage", box), count = UI.$(".js-rf-count", box);
    function show(n) {
      i = (n + list.length) % list.length;
      const r = list[i];
      const m = r.master ? BS.byId(BS.masters, r.master) : null;
      const where = m ? m.studios.map((s) => studioOf(s).short).join(" · ") : "";
      stage.classList.remove("is-in");
      const paint = () => {
        stage.innerHTML = `<figure class="review-focus__fig">
            <blockquote><p>${UI.esc(r.text)}</p></blockquote>
            <figcaption>
              ${stars(r.rating)}
              <span class="review-focus__meta">${[r.date ? UI.fmtDate(r.date) : (r.source === "direct" ? "Повідомлення в Direct" : ""), m ? `майстриня ${m.name}` : "", where].filter(Boolean).map(UI.esc).join(" · ")}</span>
              ${m ? `<a class="link-arrow js-book" data-master="${m.id}" href="${BS.brand.direct}">Записатися до ${UI.esc(m.nameTo)}<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>` : ""}
            </figcaption>
          </figure>`;
        UI.refreshBooking();
        stage.getBoundingClientRect();
        stage.classList.add("is-in");
      };
      if (UI.reducedMotion || !stage.firstElementChild) paint(); else setTimeout(paint, 220);
      count.textContent = String(i + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
    }
    UI.$(".js-rf-prev", box).addEventListener("click", () => show(i - 1));
    UI.$(".js-rf-next", box).addEventListener("click", () => show(i + 1));
    show(0);
  });
})();
