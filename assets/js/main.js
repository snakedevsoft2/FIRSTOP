/* First Stop Laundry & Sastrería — interacciones del sitio */
(() => {
  'use strict';

  // ---- Datos del negocio (cámbialos aquí si cambian) ----
  const WHATSAPP = '19396555329';
  const TIME_ZONE = 'America/Puerto_Rico';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  // ---- Idioma: español / inglés ----
  // Los textos en inglés están en el HTML (data-en, data-en-html, data-en-aria-label, data-en-alt, data-en-title).
  const metaDesc = $('meta[name="description"]');
  const UI = {
    es: {
      title: document.title,
      description: metaDesc ? metaDesc.content : '',
      review: (n) => `Ver reseña ${n}`,
    },
    en: {
      title: 'Laundry & Dry Cleaning in Río Grande, PR | First Stop',
      description: 'Laundry, dry cleaning, pressing and tailoring in Río Grande, Puerto Rico. Pickup and delivery in Luquillo, Fajardo, Canóvanas and the east area.',
      review: (n) => `Show review ${n}`,
    },
  };
  const ATTRS = ['aria-label', 'alt', 'title'];
  let lang = 'es';

  // Guardar los textos originales en español
  $$('[data-en]').forEach((el) => { el.dataset.es = el.textContent; });
  $$('[data-en-html]').forEach((el) => { el.dataset.esHtml = el.innerHTML; });
  ATTRS.forEach((attr) => $$(`[data-en-${attr}]`).forEach((el) => {
    el.setAttribute(`data-es-${attr}`, el.getAttribute(attr) || '');
  }));

  // Enlaces de WhatsApp con el mensaje listo en el idioma elegido
  const updateWaLinks = () => {
    $$('[data-wa]').forEach((link) => {
      const msg = lang === 'en' && link.dataset.waEn ? link.dataset.waEn : link.dataset.wa;
      link.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    });
  };

  const applyLang = (next, remember) => {
    lang = next === 'en' ? 'en' : 'es';
    const en = lang === 'en';
    document.documentElement.lang = en ? 'en' : 'es-PR';
    $$('[data-en]').forEach((el) => { el.textContent = en ? el.dataset.en : el.dataset.es; });
    $$('[data-en-html]').forEach((el) => { el.innerHTML = en ? el.dataset.enHtml : el.dataset.esHtml; });
    ATTRS.forEach((attr) => $$(`[data-en-${attr}]`).forEach((el) => {
      el.setAttribute(attr, el.getAttribute(`data-${en ? 'en' : 'es'}-${attr}`));
    }));
    document.title = UI[lang].title;
    if (metaDesc) metaDesc.content = UI[lang].description;
    $$('.lang-switch [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    updateWaLinks();
    document.dispatchEvent(new CustomEvent('langchange'));
    if (remember) {
      try { window.localStorage.setItem('fs-lang', lang); } catch (_) { /* sin almacenamiento */ }
    }
  };

  let savedLang = null;
  try { savedLang = window.localStorage.getItem('fs-lang'); } catch (_) { /* sin almacenamiento */ }
  if (savedLang === 'en') applyLang('en', false);
  else updateWaLinks();

  $$('.lang-switch [data-lang]').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang, true)));

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  // ---- Header fijo y transparente (el logo se achica un poco al bajar) ----
  const header = $('#site-header');
  const menuBtn = $('.menu-fab');
  const panel = $('#site-menu');
  let openedAtY = 0;
  let ticking = false;

  const isOpen = () => menuBtn.getAttribute('aria-expanded') === 'true';

  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    panel.inert = !open;
    if (open) openedAtY = window.scrollY;
  };

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);

    // Si el visitante sigue bajando o subiendo, el menú se guarda solo
    if (isOpen() && Math.abs(y - openedAtY) > 120) setMenu(false);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // ---- Menú flotante: se abre con el botón y se guarda al elegir, al tocar fuera o con Escape ----
  panel.inert = true;
  menuBtn.addEventListener('click', () => setMenu(!isOpen()));
  $$('a', panel).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (e) => {
    if (isOpen() && !panel.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // ---- Sección activa en el menú ----
  const navLinks = $$('.nav-link');
  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  // Secciones sin enlace propio en el menú se marcan con la opción más cercana
  const ALIAS = { bienvenida: 'inicio', proceso: 'servicios' };
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(ALIAS[entry.target.id] || entry.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'bienvenida', 'nosotros', 'servicios', 'proceso', 'resenas', 'contacto']
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((section) => spy.observe(section));

  // ---- Animaciones al entrar en pantalla ----
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Hero: solo el video. Cuando termina, la página baja sola a la bienvenida ----
  const hero = $('.hero');
  const video = $('.hero-video');
  const nextSection = $('#bienvenida');
  if (hero && video) {
    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    if (reduceMotion || saveData) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      video.addEventListener('ended', () => {
        // Solo si el visitante sigue viendo el video
        const stillWatching = hero.getBoundingClientRect().top > -hero.offsetHeight * 0.5;
        if (nextSection && stillWatching && !document.hidden && !isOpen()) {
          window.scrollTo({ top: nextSection.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
        }
      });
      play();

      // Al salir del hero se pausa; al volver, el video empieza de nuevo si ya había terminado
      new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          if (!video.paused) video.pause();
        } else {
          if (video.ended) video.currentTime = 0;
          play();
        }
      }, { threshold: 0.35 }).observe(hero);
    }
  }

  // ---- Videos de cada sección (detrás de los textos) ----
  // Cada escena tiene su propio video corto: se descarga al acercarse, se reproduce una vez al llegar
  // y se queda en su último cuadro (la ropa "se queda ahí"). Al salir de pantalla vuelve al inicio.
  const sceneVideos = $$('.scene-video');
  if (sceneVideos.length) {
    const still = reduceMotion || saveData;
    const toEnd = (v) => {
      if (Number.isFinite(v.duration)) {
        try { v.currentTime = Math.max(0, v.duration - 0.05); } catch (_) { /* sin datos todavía */ }
      }
    };
    const load = (v) => {
      if (v.dataset.loaded) return;
      v.dataset.loaded = '1';
      v.preload = 'auto';
      if (still) v.addEventListener('loadedmetadata', () => toEnd(v), { once: true });
      v.load();
    };

    const near = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { load(e.target); near.unobserve(e.target); }
      });
    }, { rootMargin: '120% 0px' });
    sceneVideos.forEach((v) => near.observe(v));

    if (!still) {
      const view = new IntersectionObserver((entries) => {
        entries.forEach(({ target: v, isIntersecting, intersectionRatio }) => {
          if (isIntersecting && intersectionRatio >= 0.4) {
            if (v.dataset.played === '1') return;
            v.dataset.played = '1';
            load(v);
            try { v.currentTime = 0; } catch (_) { /* sin datos todavía */ }
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else if (!isIntersecting && v.dataset.played === '1') {
            v.pause();
            v.dataset.played = '';
            try { v.currentTime = 0; } catch (_) { /* sin datos todavía */ }
          }
        });
      }, { threshold: [0, 0.4] });
      sceneVideos.forEach((v) => view.observe(v));
    }
  }

  // ---- Profundidad 3D: el video de cada escena se mueve más lento que el texto y se inclina ----
  const sceneBgs = $$('.scene-bg');
  if (sceneBgs.length && !reduceMotion) {
    let depthRaf = 0;
    const depth = () => {
      depthRaf = 0;
      const vh = window.innerHeight;
      sceneBgs.forEach((bg) => {
        const r = bg.parentElement.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        bg.style.setProperty('--py', `${(p * 46).toFixed(1)}px`);
        bg.style.setProperty('--rx', `${(p * 9).toFixed(2)}deg`);
        bg.style.setProperty('--sc', (1.05 - Math.abs(p) * 0.06).toFixed(3));
      });
    };
    window.addEventListener('scroll', () => { if (!depthRaf) depthRaf = window.requestAnimationFrame(depth); }, { passive: true });
    window.addEventListener('resize', depth);
    depth();
  }

  // ---- Inclinación 3D de las tarjetas de servicio (solo con mouse) ----
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    $$('.service-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('is-tilting');
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  // ---- Carrusel de reseñas (móvil) ----
  const track = $('.reviews-track');
  const dotsWrap = $('.reviews-dots');
  if (track && dotsWrap) {
    const cards = $$('.review-card', track);
    const mobile = window.matchMedia('(max-width: 760px)');
    let index = 0;
    let timer = null;
    let inView = false;
    let userTouched = false;

    const go = (i) => {
      index = (i + cards.length) % cards.length;
      const card = cards[index];
      track.scrollTo({
        left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    };
    const stop = () => { window.clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (mobile.matches && inView && !userTouched && !reduceMotion) {
        timer = window.setInterval(() => go(index + 1), 5000);
      }
    };

    const dots = cards.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => { userTouched = true; stop(); go(i); });
      dotsWrap.appendChild(b);
      return b;
    });
    const labelDots = () => dots.forEach((b, i) => b.setAttribute('aria-label', UI[lang].review(i + 1)));
    labelDots();
    document.addEventListener('langchange', labelDots);

    const sync = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      index = best;
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === best)));
    };

    track.addEventListener('scroll', () => window.requestAnimationFrame(sync), { passive: true });
    track.addEventListener('pointerdown', () => { userTouched = true; stop(); });
    mobile.addEventListener('change', start);
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; start(); }, { threshold: 0.4 }).observe(track);
    sync();
  }

  // ---- Horario: resaltar el día de hoy (hora de Puerto Rico) ----
  const highlightToday = () => {
    let day;
    try {
      const weekday = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(new Date());
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
    } catch (_) { return; }
    $$('[data-days]').forEach((el) => {
      el.classList.toggle('is-today', el.dataset.days.split(',').map(Number).includes(day));
    });
  };
  highlightToday();
  window.setInterval(highlightToday, 10 * 60 * 1000);
})();
