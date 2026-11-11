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

  /* ---------- Сітка майстринь за спеціалізацією (Ендосфера, Вагітним) ---------- */
  UI.$$(".js-masters-grid").forEach((grid) => {
    const spec = grid.dataset.spec;
    const list = BS.masters.filter((m) => m.specs.includes(spec));
    grid.innerHTML = list.map((m) => masterCard(m, { cls: "reveal" })).join("");
    UI.refreshBooking();
    UI.observeReveal(grid);
  });

  /* ---------- Вікно майстрині з усіма відгуками ---------- */
  const mm = UI.$(".js-master-modal");
  function openMaster(id, trigger) {
    const m = BS.byId(BS.masters, id);
    if (!m || !mm) return;
    UI.$(".js-mm-tier", mm).textContent = BS.tiers[m.tier].name;
    UI.$(".js-mm-name", mm).textContent = m.name;
    const revs = reviewsOf(m);
    UI.$(".js-mm-body", mm).innerHTML = `
      <div class="mm">
        <div class="mm__photo">${UI.img(m.photo, 360, 450, m.name, { cls: "no-bg" })}</div>
        <div class="mm__info">
          <p class="master-card__since">${UI.esc(sinceLabel(m))}</p>
          ${m.education ? `<p><b>Освіта:</b> ${UI.esc(m.education)}</p>` : ""}
          ${m.bio ? `<p>${UI.esc(m.bio)}</p>` : ""}
          <blockquote class="master-card__quote"><p>${UI.esc(m.quote)}</p></blockquote>
          <div class="mm__book">${m.studios.map((s) => `<a class="btn btn--sm js-book" data-master="${m.id}" data-studio="${s}" href="${BS.brand.direct}">Записатися · ${UI.esc(studioOf(s).short)}</a>`).join("")}</div>
        </div>
      </div>
      <h3 class="mm__h">Відгуки (${revs.length})</h3>
      <ul class="mm__reviews">${revs.map((r) => `<li><p class="mm__meta">${stars(r.rating)} ${r.date ? UI.fmtDate(r.date) : r.source === "direct" ? "Повідомлення в Direct" : ""}</p><p>${UI.esc(r.text)}</p></li>`).join("")}</ul>`;
    UI.refreshBooking();
    UI.openModal(mm, trigger);
  }
  if (mm) {
    mm.addEventListener("click", (e) => { if (e.target.closest(".js-mm-close")) UI.closeModal(); });
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".js-master-more");
      if (b) openMaster(b.dataset.id, b);
    });
  }

  /* ---------- Сторінка «Команда»: фільтри студія + спеціалізація (?studio=&spec=) ---------- */
  const teamGrid = UI.$(".js-team-grid");
  if (teamGrid) {
    const fs = UI.$(".js-f-studio"), fp = UI.$(".js-f-spec");
    const params = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
    let st = BS.studios.some((s) => s.id === params.get("studio")) ? params.get("studio") : "";
    let sp = BS.specs.some((s) => s.id === params.get("spec")) ? params.get("spec") : "";
    const usedSpecs = BS.specs.filter((s) => BS.masters.some((m) => m.specs.includes(s.id)));

    function chips() {
      fs.innerHTML = [{ id: "", short: "Усі" }].concat(BS.studios).map((s) => {
        const n = BS.masters.filter((m) => !s.id || m.studios.includes(s.id)).length;
        return `<button class="chip" type="button" data-studio="${s.id}" aria-pressed="${s.id === st}"><svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(s.short)} <small>${n}</small></button>`;
      }).join("");
      fp.innerHTML = [{ id: "", name: "Будь-яка" }].concat(usedSpecs).map((s) => {
        const n = BS.masters.filter((m) => (!s.id || m.specs.includes(s.id)) && (!st || m.studios.includes(st))).length;
        return `<button class="chip" type="button" data-spec="${s.id}" aria-pressed="${s.id === sp}"><svg class="leaf-mark" aria-hidden="true"><use href="#i-leaf"/></svg>${UI.esc(s.name)} <small>${n}</small></button>`;
      }).join("");
    }
    function render() {
      const match = (m) => (!st || m.studios.includes(st)) && (!sp || m.specs.includes(sp));
      let list = BS.masters.filter(match);
      const note = UI.$(".js-team-note"), count = UI.$(".js-team-count");
      let noteText = "";
      // Порожнього стану «нічого не знайдено» не буває: показуємо найближчу альтернативу
      if (!list.length) {
        list = BS.masters.filter((m) => !sp || m.specs.includes(sp));
        noteText = `У студії «${studioOf(st).short}» цим займаються майстрині з інших студій — ось вони. Або напишіть нам у Direct, підберемо зручний варіант.`;
      }
      teamGrid.innerHTML = list.map((m) => masterCard(m, { more: true })).join("");
      count.textContent = noteText ? noteText : `Показано майстринь: ${list.length}`;
      if (note) note.textContent = "Чипів робочих днів і фото рук поки немає — додамо, щойно студія їх надішле.";
      UI.refreshBooking();
      try {
        const u = new URL(location.href);
        st ? u.searchParams.set("studio", st) : u.searchParams.delete("studio");
        sp ? u.searchParams.set("spec", sp) : u.searchParams.delete("spec");
        history.replaceState(null, "", u);
      } catch (e) { /* ок */ }
    }
    UI.$(".js-team-filters").addEventListener("click", (e) => {
      const a = e.target.closest("[data-studio]"), b = e.target.closest("[data-spec]");
      if (a) { st = a.dataset.studio; if (st) UI.setStudio(st); }
      if (b) sp = b.dataset.spec;
      if (a || b) { chips(); render(); }
      if (e.target.closest(".js-team-share")) {
        const url = location.href;
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
          () => UI.toast("Посилання скопійовано — можна вставити в сторіс"),
          () => UI.toast(url));
      }
    });
    chips(); render();
  }

  /* ---------- Сторінка «Студії» ---------- */
  const secBox = UI.$(".js-studio-sections");
  if (secBox) {
    const anchors = UI.$(".js-studio-anchors");
    if (anchors) anchors.innerHTML = BS.studios.map((s) => `<a class="chip" href="#${s.id}">${UI.esc(s.short)}</a>`).join("");
    secBox.innerHTML = BS.studios.map((s, i) => {
      const st = UI.openStatus(s);
      const q = encodeURIComponent("Київ, " + s.address);
      const team = BS.masters.filter((m) => m.studios.includes(s.id));
      const g = s.google ? `<p class="studio-sec__rating"><b>${s.google.rating.toFixed(1).replace(".", ",")}</b> <span class="stars" aria-hidden="true">★★★★★</span> ${s.google.count} відгуків у Google</p>` : "";
      return `<section class="section studio-sec${i % 2 ? " section--beige" : ""}" id="${s.id}" data-line="${i % 2 ? "right" : "left"}" aria-labelledby="st-${s.id}">
        <div class="container studio-sec__grid">
          <div class="studio-sec__info reveal">
            <p class="studio-card__num">0${i + 1}</p>
            <h2 id="st-${s.id}" class="studio-sec__title">${UI.studioTitle(s)}</h2>
            <p class="studio-sec__addr">${UI.esc(s.address)}</p>
            <p class="muted">${UI.esc(s.landmark || "")}</p>
            <p class="studio-sec__hours"><svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg>${UI.esc(s.days)} · ${s.hours[0]}:00–${s.hours[1]}:00 <span class="status js-status ${st.open ? "" : "is-closed"}" data-studio="${s.id}">${st.text}</span></p>
            ${g}
            <div class="studio-sec__how"><p class="toggle-label">Як дістатися</p>
              <p>${s.howToGet ? UI.esc(s.howToGet) : "Детальна підказка про вхід і паркінг — скоро. А поки напишіть у Direct, проведемо до дверей."}</p></div>
            <div class="studio-sec__actions">
              <a class="btn js-book" data-studio="${s.id}" href="${BS.brand.direct}">Записатися сюди</a>
              <a class="btn btn--ghost" href="https://www.google.com/maps/dir/?api=1&destination=${q}" target="_blank" rel="noopener"><svg class="icon" aria-hidden="true"><use href="#i-pin"/></svg>Маршрут</a>
              <a class="link-arrow" href="${s.phone ? "tel:" + s.phone : BS.brand.direct}" ${s.phone ? "" : 'target="_blank" rel="noopener"'}>${s.phone ? "Подзвонити" : "Написати в Direct"}<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
            </div>
          </div>
          <div class="studio-sec__media reveal">
            <div class="studio-sec__map"><iframe title="Карта: ${UI.esc(s.label)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=${q}&z=16&output=embed" width="600" height="420"></iframe></div>
            <div class="studio-sec__photos">${s.entrancePhoto ? UI.img(s.entrancePhoto, 720, 540, "Вхід у студію " + s.short) : UI.placeholder("Фото входу — від студії")}${s.interiorPhotos[0] ? UI.img(s.interiorPhotos[0], 720, 540, "Інтер’єр " + s.short) : UI.placeholder("Інтер’єр — від студії")}</div>
          </div>
          <div class="studio-sec__team reveal">
            <p class="toggle-label">Майстрині студії</p>
            <ul class="mini-team">${team.map((m) => `<li>
              <span class="mini-team__photo">${UI.img(m.photo, 360, 450, "", { cls: "no-bg" })}</span>
              <span class="mini-team__name"><b>${UI.esc(m.name)}</b><small>${UI.esc(BS.tiers[m.tier].name)}</small></span>
              <a class="btn btn--sm btn--ghost js-book" data-master="${m.id}" data-studio="${s.id}" href="${BS.brand.direct}">Записатися</a></li>`).join("")}</ul>
          </div>
        </div>
      </section>`;
    }).join("");
    UI.refreshBooking();
    UI.observeReveal(secBox);
  }
})();
