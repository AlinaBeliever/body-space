/* =====================================================================
   Body Space — спільна логіка для всіх сторінок:
   збереження вибору, студії і запис, панель вибору студії, статус
   «відкрито» за київським часом, шапка, меню, мобільна смуга, тост,
   анімовані числа, поява блоків.
   ===================================================================== */
(function () {
  "use strict";
  const BS = window.BS;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Збереження (localStorage може бути недоступний) ---------- */
  // Якщо браузер блокує localStorage — тримаємо вибір у пам'яті сторінки
  const mem = {};
  const store = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem("bs:" + key); if (v !== null) return JSON.parse(v); } catch (e) { /* немає сховища */ }
      return key in mem ? mem[key] : fallback;
    },
    set(key, value) {
      mem[key] = value;
      try { localStorage.setItem("bs:" + key, JSON.stringify(value)); } catch (e) { /* лише в пам'яті */ }
    }
  };

  /* ---------- Формат чисел: 12 800 ---------- */
  const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("uk-UA").replace(/\s/g, " "));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Плавно «докручує» число в елементі до нового значення. */
  function rollNumber(el, to, duration = 400) {
    if (!el) return;
    const from = Number(el.dataset.value || 0);
    el.dataset.value = to;
    if (reducedMotion || !from || from === to) { el.textContent = fmt(to); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Київський час і статус студії ---------- */
  function kyivNow() {
    // Беремо час саме Києва, а не пристрою (людина може бути в іншому поясі).
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Kyiv", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour").value);
      const m = Number(parts.find((p) => p.type === "minute").value);
      return { h, m };
    } catch (e) {
      const d = new Date(); return { h: d.getHours(), m: d.getMinutes() };
    }
  }
  /** Для тестів: BSUI.openStatus(studio, {h: 20, m: 59}) */
  // Якщо людина не в київському часовому поясі (напр. у Словенії) — уточнюємо «за Києвом»
  const outsideKyiv = (() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz === "Europe/Kyiv" || tz === "Europe/Kiev") return false;
      const now = new Date();
      const off = (zone) => new Date(now.toLocaleString("en-US", { timeZone: zone })).getTime();
      return off("Europe/Kyiv") !== off(tz);
    } catch (e) { return false; }
  })();
  function openStatus(studio, now = kyivNow()) {
    const [open, close] = studio.hours || [9, 21];
    const mins = now.h * 60 + now.m;
    const pad = (h) => String(h).padStart(2, "0") + ":00";
    const kyiv = outsideKyiv ? " за Києвом" : "";
    if (mins >= open * 60 && mins < close * 60) return { open: true, text: "Відкрито · до " + pad(close) + kyiv };
    if (mins < open * 60) return { open: false, text: "Зачинено · відкриємо о " + pad(open) + kyiv };
    return { open: false, text: "Зачинено · завтра з " + pad(open) + kyiv };
  }

  /* ---------- Відстань (лише з дозволу на геолокацію) ---------- */
  let userPos = null;
  function distanceKm(a, b) {
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const fmtKm = (km) => (km < 1 ? Math.round(km * 1000) + " м" : km.toFixed(1).replace(".", ",") + " км");

  /* ---------- Обрана студія ---------- */
  let currentStudio = store.get("studio");
  if (currentStudio && !BS.byId(BS.studios, currentStudio)) currentStudio = null;

  function setStudio(id) {
    currentStudio = id;
    store.set("studio", id);
    refreshBooking();
    document.dispatchEvent(new CustomEvent("bs:studio", { detail: id }));
  }
  const studioName = (s) => (s ? s.short : "");
  /** «Теремки <small>| ЖК Нова Англія</small>» */
  const studioTitle = (s) => {
    const [a, b] = s.label.split("|").map((x) => x.trim());
    return b ? `${esc(a)} <small>${esc(b)}</small>` : esc(a);
  };

  /* ---------- Кнопки запису ----------
     <a class="js-book" data-master="..." data-service="..."> — без JS ведуть у Direct.
     Якщо студію обрано — одразу в Altegio цієї студії (1 клік). */
  function masterStudios(masterId) {
    const m = masterId ? BS.byId(BS.masters, masterId) : null;
    return m ? m.studios : null;
  }
  /** Студії, де є послуга. Ендосфера — лише там, де працює майстриня з ендосферою. */
  function serviceStudios(serviceId) {
    const s = serviceId ? BS.byId(BS.services, serviceId) : null;
    if (!s || (s.cat !== "endosfera" && !/endosfera/.test(s.id))) return null;
    const ids = new Set();
    BS.masters.filter((m) => m.specs.includes("endosfera")).forEach((m) => m.studios.forEach((x) => ids.add(x)));
    return ids.size ? [...ids] : null;
  }
  function targetFor(el) {
    const masterId = el.dataset.master || null;
    const fixedStudio = el.dataset.studio || null;
    const ss = serviceStudios(el.dataset.service);
    if (ss && !masterId && !fixedStudio) {
      if (currentStudio && ss.includes(currentStudio)) return { studio: currentStudio, master: null };
      if (ss.length === 1) return { studio: ss[0], master: null };
      return null;
    }
    const ms = masterStudios(masterId);
    if (fixedStudio) return { studio: fixedStudio, master: masterId };
    if (ms && ms.length === 1) return { studio: ms[0], master: masterId };
    if (ms && currentStudio && ms.includes(currentStudio)) return { studio: currentStudio, master: masterId };
    if (!ms && currentStudio) return { studio: currentStudio, master: null };
    return null; // потрібно обрати студію
  }
  function refreshBooking() {
    document.documentElement.classList.toggle("has-studio", !!currentStudio);
    const s = currentStudio ? BS.byId(BS.studios, currentStudio) : null;
    $$(".js-studio-label").forEach((el) => { el.textContent = s ? s.short : "Оберіть студію"; });
    $$(".js-book").forEach((el) => {
      const t = targetFor(el);
      const label = el.querySelector(".js-book-studio");
      if (t) {
        el.href = BS.bookingUrl(t.studio, t.master);
        el.target = "_blank"; el.rel = "noopener";
        const st = BS.byId(BS.studios, t.studio);
        if (label && !el.dataset.master) label.textContent = " · " + studioName(st);
      } else {
        el.href = BS.brand.direct; el.removeAttribute("target");
        if (label) label.textContent = "";
      }
    });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".js-book");
    if (!a) return;
    const t = targetFor(a);
    if (t) return; // звичайне посилання в Altegio
    e.preventDefault();
    openStudioSheet({ mode: "book", master: a.dataset.master || null, service: a.dataset.service || null, trigger: a });
  });

  /* ---------- Модальні вікна: пастка фокусу, Esc ---------- */
  const overlay = $(".js-overlay");
  let activeModal = null, lastFocus = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function openModal(modal, trigger) {
    if (!modal) return;
    // відкриваємо вікно з іншого вікна — фокус потім повернемо туди, звідки відкрили перше
    const returnTo = activeModal ? lastFocus : (trigger || document.activeElement);
    if (activeModal) closeModal(true, false);
    lastFocus = returnTo;
    activeModal = modal;
    modal.hidden = false;
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = "hidden";
    modal.getBoundingClientRect(); // примусовий перерахунок, щоб анімація появи спрацювала
    modal.classList.add("is-open");
    if (overlay) overlay.classList.add("is-open");
    const first = $$(FOCUSABLE, modal).find((el) => !el.classList.contains("close-btn")) || modal;
    first.focus({ preventScroll: true });
  }
  function closeModal(instant, restoreFocus = true) {
    if (!activeModal) return;
    const modal = activeModal;
    activeModal = null;
    modal.classList.remove("is-open");
    if (overlay) overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    const done = () => { modal.hidden = true; if (overlay && !activeModal) overlay.hidden = true; };
    if (instant || reducedMotion) done(); else setTimeout(done, 380);
    if (lastFocus && lastFocus.hasAttribute && lastFocus.hasAttribute("aria-expanded")) lastFocus.setAttribute("aria-expanded", "false");
    if (restoreFocus && lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", (e) => {
    if (!activeModal) return;
    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
    if (e.key === "Tab") {
      const items = $$(FOCUSABLE, activeModal).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  if (overlay) overlay.addEventListener("click", () => closeModal());

  /* ---------- Панель вибору студії ---------- */
  const sheet = $(".js-studio-sheet");
  let sheetCtx = { mode: "select", master: null };

  function renderStudioList() {
    const list = $(".js-studio-list", sheet);
    if (!list) return;
    let studios = BS.studios.slice();
    const ms = masterStudios(sheetCtx.master) || serviceStudios(sheetCtx.service);
    if (ms) studios = studios.filter((s) => ms.includes(s.id));
    if (userPos) studios.sort((a, b) => distanceKm(userPos, a) - distanceKm(userPos, b));
    const master = sheetCtx.master ? BS.byId(BS.masters, sheetCtx.master) : null;

    list.innerHTML = studios.map((s, i) => {
      const st = openStatus(s);
      const dist = userPos ? `<span class="studio-option__dist">${i === 0 ? "Найближча · " : ""}${fmtKm(distanceKm(userPos, s))}</span>` : "";
      const name = studioTitle(s);
      const inner = `
        <span class="studio-option__name">${name}</span>
        <span class="studio-option__addr">${esc(s.address)}</span>
        <span class="studio-option__meta"><span class="status ${st.open ? "" : "is-closed"}">${st.text}</span>${dist}</span>
        <span class="studio-option__go" aria-hidden="true"><svg class="icon"><use href="#i-arrow"/></svg></span>`;
      const cur = s.id === currentStudio ? " is-current" : "";
      if (sheetCtx.mode === "book") {
        return `<li><a class="studio-option${cur}" href="${esc(BS.bookingUrl(s.id, master && master.id))}" target="_blank" rel="noopener" data-studio="${s.id}">${inner}</a></li>`;
      }
      return `<li><button class="studio-option${cur}" type="button" data-studio="${s.id}" aria-pressed="${s.id === currentStudio}">${inner}</button></li>`;
    }).join("");

    const title = $(".js-sheet-title", sheet), sub = $(".js-sheet-sub", sheet);
    if (title) title.textContent = master ? `Записатися до ${master.nameTo}` : sheetCtx.mode === "book" ? "Де вам зручніше?" : "Оберіть студію";
    if (sub) sub.textContent = sheetCtx.mode === "book"
      ? "Натисніть на студію — відкриється онлайн-запис Altegio. Дату й час оберете там."
      : "Запам’ятаємо вибір: кнопки запису одразу вестимуть у вашу студію.";
  }
  function openStudioSheet(ctx = {}) {
    if (!sheet) return;
    sheetCtx = { mode: ctx.mode || "select", master: ctx.master || null, service: ctx.service || null };
    renderStudioList();
    openModal(sheet, ctx.trigger);
  }
  if (sheet) {
    sheet.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-studio]");
      if (opt) {
        setStudio(opt.dataset.studio);
        if (sheetCtx.mode === "select") {
          const s = BS.byId(BS.studios, opt.dataset.studio);
          toast("Обрано студію: " + s.label);
        }
        closeModal();
        return;
      }
      if (e.target.closest(".js-sheet-close")) closeModal();
    });
    const geo = $(".js-geo", sheet);
    if (geo) {
      if (!("geolocation" in navigator)) geo.hidden = true;
      geo.addEventListener("click", () => {
        geo.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => { userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }; geo.disabled = false; renderStudioList(); },
          () => { geo.disabled = false; toast("Без доступу до геолокації — оберіть студію зі списку"); },
          { timeout: 8000, maximumAge: 600000 }
        );
      });
    }
  }
  $$(".js-studio-pill, .js-studio-change").forEach((b) => b.addEventListener("click", () => openStudioSheet({ mode: "select", trigger: b })));

  /* ---------- Тост ---------- */
  let toastTimer;
  function toast(text) {
    const t = $(".js-toast");
    if (!t) return;
    $("span", t).textContent = text;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 3200);
  }

  /* ---------- Копіювання тексту + Direct ---------- */
  async function copyAndOpenDirect(text) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      try {
        const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
        ok = document.execCommand("copy"); ta.remove();
      } catch (e2) { ok = false; }
    }
    toast(ok ? "Текст скопійовано — вставте його в повідомлення" : "Відкриваємо Direct — опишіть, що хочете замовити");
    window.open(BS.brand.direct, "_blank", "noopener");
  }

  /* ---------- Шапка, меню, мобільна смуга ---------- */
  const header = $(".site-header");
  const bar = $(".js-book-bar");
  const footer = $(".site-footer");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    if (bar && footer) {
      // ховаємо смугу, коли видно футер з великою кнопкою запису
      const r = footer.getBoundingClientRect();
      // на головній смуга з'являється лише після героя: там уже є кнопка запису
      const hero = $(".hero, .page-hero");
      const beforeHero = hero && hero.getBoundingClientRect().bottom > 0;
      bar.classList.toggle("is-hidden", r.top < window.innerHeight - 40 || !!beforeHero);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menu = $("#mobile-menu");
  const menuBtn = $(".js-menu-open");
  if (menu && menuBtn) {
    menuBtn.addEventListener("click", () => { menuBtn.setAttribute("aria-expanded", "true"); openModal(menu, menuBtn); });
    menu.addEventListener("click", (e) => {
      if (e.target.closest(".js-menu-close") || e.target.closest("a")) { menuBtn.setAttribute("aria-expanded", "false"); closeModal(true); }
    });
  }
  // позначка поточної сторінки в меню
  const here = location.pathname.split("/").pop() || "index.html";
  $$(".nav a, .mobile-menu a").forEach((a) => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

  /* ---------- Поява блоків (fade-up) ---------- */
  function observeReveal(root = document) {
    const els = $$(".reveal:not(.is-in)", root);
    if (reducedMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Спільні рендери для кількох сторінок ---------- */
  function renderFooter() {
    const box = $(".js-footer-studios");
    if (box) {
      box.innerHTML = BS.studios.map((s) => {
        const st = openStatus(s);
        return `<div class="footer__studio">
          <p class="footer__h">${esc(s.label.replace(" | ", " · "))}</p>
          <p>${esc(s.address)}</p>
          <p class="status js-status ${st.open ? "" : "is-closed"}" data-studio="${s.id}">${st.text}</p>
          <a class="footer__studio-book" href="${esc(BS.bookingUrl(s.id))}" target="_blank" rel="noopener">Записатися сюди</a>
        </div>`;
      }).join("");
    }
    const [o, c] = BS.studios[0].hours;
    $$(".js-hours").forEach((el) => { el.textContent = `Щодня ${o}:00–${c}:00`; });
    // посилання на соцмережі й Altegio — з data.js (у HTML лише запасні значення)
    const LINKS = { "https://ig.me/m/body__space": BS.brand.direct, "https://t.me/+OLutqxuYHAtlZDY6": BS.brand.telegram,
      "https://www.instagram.com/body__space/": BS.brand.instagram, "https://n803030.alteg.io/select-city/4/select-branch": BS.brand.altegioNetwork };
    $$("a[href]").forEach((a) => { const u = LINKS[a.getAttribute("href")]; if (u && !a.classList.contains("js-book")) a.href = u; });
    const rules = $(".js-footer-rules");
    if (rules) {
      rules.innerHTML = [
        "Перенести чи скасувати — не пізніше ніж за 6 годин до візиту",
        `Курс: 5 візитів — ${BS.courses.validity[5]} днів, 10 — ${BS.courses.validity[10]} днів`,
        `Сертифікат діє ${BS.certificate.validityDays} днів`
      ].map((t) => `<li>${esc(t)}</li>`).join("");
    }
  }
  function updateStatuses() { document.dispatchEvent(new CustomEvent("bs:tick")); }

  /* ---------- Плейсхолдер фото ---------- */
  const placeholder = (label = "Фото від студії") =>
    `<div class="ph" role="img" aria-label="${esc(label)}"><svg aria-hidden="true"><use href="#i-leaf"/></svg><span>${esc(label)}</span></div>`;

  /** <img> зі srcset 1x/2x для фото з assets/img (шлях без .webp). */
  function img(base, w, h, alt, opts = {}) {
    if (!base) return placeholder();
    return `<img src="${base}.webp" srcset="${base}.webp 1x, ${base}@2x.webp 2x" width="${w}" height="${h}" alt="${esc(alt)}"${opts.eager ? "" : ' loading="lazy"'}${opts.cls ? ` class="${opts.cls}"` : ""} decoding="async">`;
  }

  /* ---------- Рівень (топ / провідна) — спільний для всіх сторінок ---------- */
  function getTier() { const t = store.get("tier", "top"); return t === "lead" ? "lead" : "top"; }
  function setTier(t) { store.set("tier", t); document.dispatchEvent(new CustomEvent("bs:tier", { detail: t })); }

  const fmtDate = (iso) => {
    if (!iso) return "";
    try { return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso + "T12:00:00")).replace(" р.", ""); }
    catch (e) { return iso; }
  };
  const plural = (n, one, few, many) => {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  };
  const reviewsWord = (n) => plural(n, "відгук", "відгуки", "відгуків");
  const yearsWord = (n) => {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return "рік";
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "роки";
    return "років";
  };
  const kyivYear = () => { try { return Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Kyiv", year: "numeric" }).format(new Date())); } catch (e) { return new Date().getFullYear(); } };

  window.BSUI = {
    $, $$, store, fmt, esc, rollNumber, kyivNow, openStatus, distanceKm, setStudio,
    get studio() { return currentStudio; }, studioName, studioTitle, openStudioSheet, openModal, closeModal,
    toast, copyAndOpenDirect, observeReveal, placeholder, img, getTier, setTier, fmtDate, yearsWord, reviewsWord, kyivYear, serviceStudios,
    refreshBooking, reducedMotion
  };

  /* =====================================================================
     Блоки головної (і не лише): картки студій, факти, швидкий запис,
     історії, умови сертифіката. Кожен рендериться, лише якщо є на сторінці.
     ===================================================================== */

  /* Картки студій зі статусом «відкрито» */
  function renderStudioCards() {
    const box = $(".js-studio-cards");
    if (!box) return;
    let list = BS.studios.slice();
    if (currentStudio) list.sort((a, b) => (b.id === currentStudio) - (a.id === currentStudio));
    box.innerHTML = list.map((s) => {
      const st = openStatus(s);
      const n = String(BS.studios.indexOf(s) + 1).padStart(2, "0");
      const hasPhoto = s.interiorPhotos && s.interiorPhotos[0];
      // Поки немає фото інтер’єру — типографічна картка (TODO власниця: фото студій)
      const media = hasPhoto
        ? `<div class="studio-card__media">${img(s.interiorPhotos[0], 720, 540, "Інтер’єр студії " + s.short)}</div>`
        : `<svg class="studio-card__leaf" aria-hidden="true"><use href="#i-leaf"/></svg>`;
      return `<article class="studio-card reveal${hasPhoto ? "" : " studio-card--text"}${s.id === currentStudio ? " is-current" : ""}">
        ${media}
        <div class="studio-card__body">
          <p class="studio-card__num">${n}${s.id === currentStudio ? ‘ <span class="tag studio-card__mine">Ваша студія</span>’ : ""}</p>
          <h3 class="studio-card__name">${studioTitle(s)}</h3>
          <p class="studio-card__addr">${esc(s.address)}</p>
          <p class="studio-card__landmark small muted">${esc(s.landmark || "")}</p>
          <p class="studio-card__meta"><span class="status js-status ${st.open ? "" : "is-closed"}" data-studio="${s.id}">${st.text}</span></p>
          <div class="studio-card__actions">
            <a class="btn btn--sm js-book" data-studio="${s.id}" href="${BS.brand.direct}">Записатися сюди</a>
            <a class="link-arrow" href="studii.html#${s.id}">Як дістатися<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </div>
      </article>`;
    }).join("");
    refreshBooking();
    observeReveal(box);
  }
  document.addEventListener("bs:studio", renderStudioCards);
  document.addEventListener("bs:tick", () => {
    $$(".js-status").forEach((el) => {
      const st = openStatus(BS.byId(BS.studios, el.dataset.studio));
      el.textContent = st.text; el.classList.toggle("is-closed", !st.open);
    });
  });

  /* Факти (поки власниця не дала «що входить у вартість» — лише реальні цифри з даних) */
  function renderFacts() {
    const box = $(".js-facts");
    if (!box) return;
    if (Array.isArray(BS.included) && BS.included.length) {
      const t = $(".js-facts-title"); if (t) t.innerHTML = "У вартість кожного візиту <em>входить</em>";
      box.innerHTML = BS.included.map((f) => `<div class="fact reveal"><p class="fact__num">${esc(f.num)}</p><p class="fact__text">${esc(f.text)}</p></div>`).join("");
      return;
    }
    const med = BS.masters.filter((m) => m.education && /медичн/i.test(m.education)).length;
    const oldest = BS.masters.reduce((a, m) => (m.since < a.since ? m : a));
    const years = kyivYear() - oldest.since;
    const [o, c] = BS.studios[0].hours;
    const facts = [
      { num: String(BS.studios.length), text: "студії біля дому — у житлових районах, куди не треба їхати через усе місто" },
      { num: `${o}–${c}`, text: "щодня, без вихідних — і зранку до роботи, і ввечері після" },
      { num: `${med} з ${BS.masters.length}`, text: "майстринь мають медичну освіту" },
      { num: String(years), text: `${yearsWord(years)} — найдовша практика в команді: ${oldest.name}, з ${oldest.since} року` }
    ];
    box.innerHTML = facts.map((f) => `<div class="fact reveal"><p class="fact__num">${esc(f.num)}</p><p class="fact__text">${esc(f.text)}</p></div>`).join("");
  }

  /* Рядок швидкого запису: Студія · Послуга · Майстриня → Записатися */
  function quickbook() {
    const form = $(".js-quickbook");
    if (!form) return;
    form.addEventListener("submit", (e) => e.preventDefault());
    const sSel = $(".js-qb-studio", form), vSel = $(".js-qb-service", form), mSel = $(".js-qb-master", form), go = $(".js-qb-go", form);
    const MAIN = ["spyna", "zahalnyi", "relaks", "sportyvnyi", "oblychchia", "limfodrenazh", "antytselulitnyi", "endosfera-test", "endosfera", "vagitni-spyna", "vagitni-zahalnyi"];
    sSel.innerHTML = `<option value="">Оберіть студію</option>` + BS.studios.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join("");
    vSel.innerHTML = `<option value="">Будь-яка послуга</option>` + MAIN.map((id) => { const s = BS.byId(BS.services, id); return `<option value="${id}">${esc(s.name)}</option>`; }).join("");
    function specFor(serviceId) {
      const s = serviceId ? BS.byId(BS.services, serviceId) : null;
      if (!s) return null;
      if (s.pregnancy) return "vagitni";
      if (s.cat === "endosfera") return "endosfera";
      return null;
    }
    function fillMasters() {
      const st = sSel.value, spec = specFor(vSel.value), keep = mSel.value;
      let list = BS.masters.filter((m) => !st || m.studios.includes(st));
      if (spec) { const f = list.filter((m) => m.specs.includes(spec)); if (f.length) list = f; }
      mSel.innerHTML = `<option value="">Будь-яка майстриня</option>` + list.map((m) => `<option value="${m.id}">${esc(m.name)} · ${esc(BS.tiers[m.tier].short.toLowerCase())}</option>`).join("");
      if (list.some((m) => m.id === keep)) mSel.value = keep;
    }
    function update() {
      const st = sSel.value || (mSel.value ? BS.byId(BS.masters, mSel.value).studios[0] : "");
      if (st) { go.href = BS.bookingUrl(st, mSel.value || null); go.target = "_blank"; go.classList.remove("is-muted"); }
      else { go.href = BS.brand.direct; go.removeAttribute("target"); go.classList.add("is-muted"); }
    }
    sSel.value = currentStudio || "";
    fillMasters(); update();
    sSel.addEventListener("change", () => { if (sSel.value) setStudio(sSel.value); fillMasters(); update(); });
    vSel.addEventListener("change", () => { fillMasters(); update(); });
    mSel.addEventListener("change", update);
    go.addEventListener("click", (e) => {
      if (!sSel.value && !mSel.value) { e.preventDefault(); openStudioSheet({ mode: "book", trigger: go }); }
    });
    document.addEventListener("bs:studio", (e) => { if (sSel.value !== e.detail) { sSel.value = e.detail || ""; fillMasters(); update(); } });
  }

  /* Історії зі студії: обкладинки 9:16 з відео з Instagram (без вбудованих скриптів) */
  function renderStories() {
    const box = $(".js-stories");
    if (!box) return;
    const S = [
      { id: "pregnancy", title: "Як проходить масаж для вагітних" },
      { id: "healthy", title: "Оздоровчий масаж: коли він підійде" },
      { id: "relax", title: "Релакс-масаж: просто видихнути" },
      { id: "styx", title: "Засоби STYX у Body Space" }
    ];
    // reveal — на весь ряд, а не на кожну історію: зсув елементів усередині горизонтального скролера (overflow-y стає auto) давав ряду власну вертикальну прокрутку, і відео «літали» під пальцем
    box.classList.add("reveal");
    box.innerHTML = S.map((s) => `<figure class="story">
        <div class="story__media">
          <video class="story__video" muted playsinline loop preload="none" width="360" height="640"
            poster="assets/img/stories/story-${s.id}.webp" aria-label="${esc(s.title)}">
            <source src="assets/video/story-${s.id}.mp4" type="video/mp4">
          </video>
          <button class="story__play" type="button" aria-label="Відтворити: ${esc(s.title)}" aria-pressed="false">
            <svg class="icon" aria-hidden="true"><use href="#i-play"/></svg>
          </button>
        </div>
        <figcaption>${esc(s.title)}</figcaption>
      </figure>`).join("");
    box.addEventListener("click", (e) => {
      const b = e.target.closest(".story__play");
      if (!b) return;
      const v = b.parentElement.querySelector("video");
      $$("video", box).forEach((o) => { if (o !== v && !o.paused) { o.pause(); const ob = o.parentElement.querySelector(".story__play"); ob.setAttribute("aria-pressed", "false"); ob.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-play"/></svg>'; } });
      if (v.paused) {
        v.play().catch(() => {});
        b.setAttribute("aria-pressed", "true"); b.setAttribute("aria-label", "Пауза");
        b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-pause"/></svg>';
      } else {
        v.pause();
        b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Відтворити");
        b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-play"/></svg>';
      }
    });
  }

  function renderCertTerms() {
    $$(".js-cert-terms").forEach((el) => { el.textContent = `Діє ${BS.certificate.validityDays} днів з моменту дарування.`; });
  }

  /* Кнопка «Підібрати масаж»: квіз (якщо підключено), інакше — до «Що вас турбує?» */
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".js-quiz-open");
    if (!a || !window.BSQuiz) return;
    e.preventDefault();
    window.BSQuiz.open(a);
  });

  renderStudioCards();
  renderFacts();
  quickbook();
  renderStories();
  renderCertTerms();

  /* ---------- Старт ---------- */
  renderFooter();
  refreshBooking();
  // DOMContentLoaded настає після всіх скриптів сторінки — тоді вже все відмальовано
  document.addEventListener("DOMContentLoaded", () => { observeReveal(); });
  setInterval(updateStatuses, 60000); // статус «відкрито» оновлюється щохвилини
})();
