/* First Stop Laundry & Sastrería — interacciones del sitio */
(() => {
  'use strict';

  // ---- Datos del negocio (cámbialos aquí si cambian) ----
  const WHATSAPP = '13322315033';
  const TIME_ZONE = 'America/Puerto_Rico';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  // ---- Idioma: español / inglés ----
  // Los textos en inglés están en el HTML (data-en, data-en-html, data-en-aria-label, data-en-alt, data-en-title,
  // data-en-content, data-en-href). El inglés también tiene su propia dirección (/en/) para que Google lo encuentre;
  // el botón cambia el idioma al instante, sin recargar, y la elección se recuerda en las dos direcciones.
  const ATTRS = ['aria-label', 'alt', 'title', 'content', 'href'];
  const pageLang = document.documentElement.lang.startsWith('en') ? 'en' : 'es';
  let lang = pageLang;

  // Guardar los textos en español (en /en/ ya vienen escritos en la página)
  $$('[data-en]').forEach((el) => { if (el.dataset.es === undefined) el.dataset.es = el.textContent; });
  $$('[data-en-html]').forEach((el) => { if (el.dataset.esHtml === undefined) el.dataset.esHtml = el.innerHTML; });
  ATTRS.forEach((attr) => $$(`[data-en-${attr}]`).forEach((el) => {
    if (!el.hasAttribute(`data-es-${attr}`)) el.setAttribute(`data-es-${attr}`, el.getAttribute(attr) || '');
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
    $$('.lang-switch [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    updateWaLinks();
    document.dispatchEvent(new CustomEvent('langchange'));
    if (remember) {
      try { window.localStorage.setItem('fs-lang', lang); } catch (_) { /* sin almacenamiento */ }
    }
  };

  // Si el visitante ya había elegido un idioma, la página se muestra en ese idioma
  let savedLang = null;
  try { savedLang = window.localStorage.getItem('fs-lang'); } catch (_) { /* sin almacenamiento */ }
  if ((savedLang === 'en' || savedLang === 'es') && savedLang !== pageLang) applyLang(savedLang, false);
  else updateWaLinks();

  $$('.lang-switch [data-lang]').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang, true)));

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  // ---- Header fijo y transparente (el logo se achica un poco al bajar) ----
  const header = $('#site-header');
  const menuBtn = $('.menu-fab');
  const panel = $('#site-menu');
  let openedAtY = 0;
  let ticking = false;

  // En celular el menú va siempre desplegado dentro del header (navegación rápida)
  const appNav = window.matchMedia('(max-width: 760px)');
  const isOpen = () => menuBtn.getAttribute('aria-expanded') === 'true';

  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    panel.inert = appNav.matches ? false : !open;
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
  panel.inert = !appNav.matches;
  appNav.addEventListener('change', () => setMenu(false));
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
  const ALIAS = { bienvenida: 'inicio' };
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(ALIAS[entry.target.id] || entry.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'bienvenida', 'nosotros', 'servicios', 'proceso', 'contacto']
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

  // ---- Hero: el video se repite sin parar. Cuando termina, la página baja sola a la bienvenida ----
  const hero = $('.hero');
  const video = $('.hero-video');
  const nextSection = $('#bienvenida');
  // Ir a una sección dejando libre el header (en celular el header queda fijo arriba)
  const goTo = (el) => {
    const offset = appNav.matches ? header.offsetHeight : 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  };

  // iPhone con ahorro de batería: el sistema no deja reproducir videos solos. En ese caso se muestra
  // el mismo video como imagen animada (Safari sí la reproduce); si no se puede, queda la portada.
  const swapToImage = (v, onReady) => {
    if (v.dataset.swapped) return;
    v.dataset.swapped = '1';
    const source = v.querySelector('source');
    const src = source ? source.getAttribute('src') : v.getAttribute('src');
    if (!src) return;
    const img = document.createElement('img');
    img.className = `${v.className} video-as-img`;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.display = 'none';
    img.addEventListener('load', () => {
      img.style.display = '';
      v.style.display = 'none';
      if (onReady) onReady();
    }, { once: true });
    img.addEventListener('error', () => img.remove(), { once: true });
    img.src = src;
    v.after(img);
  };
  const playSafe = (v, onSwap) => {
    if (v.dataset.swapped) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => { if (err && err.name === 'NotAllowedError') swapToImage(v, onSwap); });
    }
  };
  let heroVisible = true;
  if (hero && video) {
    if (reduceMotion || saveData) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      // Bajar solo si el visitante sigue viendo el video
      const advance = () => {
        const stillWatching = hero.getBoundingClientRect().top > -hero.offsetHeight * 0.5;
        if (nextSection && stillWatching && !document.hidden && !isOpen()) goTo(nextSection);
      };
      // Si el video se muestra como imagen animada (no avisa cuando termina), se baja cada 10 s
      const onHeroSwap = () => window.setInterval(() => { if (heroVisible) advance(); }, 10000);
      video.addEventListener('ended', () => {
        advance();
        // ...y vuelve a empezar: nunca se queda congelado
        video.currentTime = 0;
        if (heroVisible) playSafe(video, onHeroSwap);
      });
      playSafe(video, onHeroSwap);

      // Fuera de pantalla se pausa (ahorra batería); al volver sigue reproduciéndose
      new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) playSafe(video, onHeroSwap); else if (!video.dataset.swapped) video.pause();
      }, { threshold: 0.1 }).observe(hero);
    }
  }

  // ---- Videos de cada sección ----
  // Cada escena tiene su propio video corto en bucle (su final se funde con el inicio, así nunca se ve
  // parado). Su portada y el video se descargan al acercarse (no compiten con la carga inicial) y el video
  // se reproduce mientras se ve; fuera de pantalla se pausa.
  // Con "reducir movimiento" o ahorro de datos se queda la imagen de portada.
  const scenes = $$('.scene').filter((s) => $('.scene-video', s));
  const videoOf = (scene) => $('.scene-video', scene);
  const showPoster = (v) => { if (v.dataset.poster && !v.getAttribute('poster')) v.poster = v.dataset.poster; };
  const playScenes = !reduceMotion && !saveData;
  const visibleVideos = new Set();
  if (scenes.length && !('IntersectionObserver' in window)) {
    scenes.forEach((s) => showPoster(videoOf(s)));
  } else if (scenes.length) {
    const prepare = (v) => {
      if (v.dataset.ready) return;
      v.dataset.ready = '1';
      v.muted = true;          // el celular solo permite reproducir solo si está en silencio
      v.playsInline = true;
      v.autoplay = true;
      v.preload = 'auto';
      v.load();
    };

    const near = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const v = videoOf(e.target);
        showPoster(v);
        if (playScenes) prepare(v);
        near.unobserve(e.target);
      });
    }, { rootMargin: '150% 0px' });
    scenes.forEach((s) => near.observe(s));

    if (playScenes) {
      const view = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const v = videoOf(target);
          if (isIntersecting) {
            visibleVideos.add(v);
            showPoster(v);
            prepare(v);
            playSafe(v);
          } else {
            visibleVideos.delete(v);
            v.pause();
          }
        });
      }, { threshold: 0.15 });
      scenes.forEach((s) => view.observe(s));
    }
  }

  // Si el navegador bloquea la reproducción automática (por ejemplo, con el ahorro de batería
  // del celular), el primer toque en la página pone a andar los videos que se están viendo
  if (!reduceMotion && !saveData) {
    const unlock = () => {
      if (video && heroVisible && video.paused) playSafe(video);
      visibleVideos.forEach((v) => { if (v.paused) playSafe(v); });
    };
    ['touchend', 'click', 'keydown'].forEach((ev) => document.addEventListener(ev, unlock, { passive: true }));
  }

  // ---- Profundidad 3D (computadora): el video de cada escena se mueve más lento que el texto ----
  // En celular el video va completo y quieto, sin este efecto.
  const sceneBgs = $$('.scene-bg');
  const wide = window.matchMedia('(min-width: 761px)');
  if (sceneBgs.length && !reduceMotion) {
    let depthRaf = 0;
    const depth = () => {
      depthRaf = 0;
      if (!wide.matches) {
        sceneBgs.forEach((bg) => ['--py', '--rx', '--sc'].forEach((p) => bg.style.removeProperty(p)));
        return;
      }
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

  // ---- Botones flotantes: se esconden al llegar al footer (ahí ya están WhatsApp y el teléfono) ----
  const floats = $('.float-actions');
  const footerSection = $('.site-footer');
  if (floats && footerSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      floats.classList.toggle('is-away', entry.isIntersecting);
    }, { rootMargin: '0px 0px -15% 0px' }).observe(footerSection);
  }

  // ---- Carro de lavandería del footer: entra rodando al verse y, con mouse, sigue al cursor en 3D ----
  const cart = $('.footer-cart');
  if (cart) {
    if ('IntersectionObserver' in window) {
      const cartIO = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { cart.classList.add('is-in'); cartIO.disconnect(); }
      }, { threshold: 0.35 });
      cartIO.observe(cart);
    } else {
      cart.classList.add('is-in');
    }
    const footerEl = $('.site-footer');
    const cart3d = $('.cart-3d', cart);
    if (footerEl && cart3d && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      footerEl.addEventListener('pointermove', (e) => {
        const r = cart.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 500));
        const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 400));
        cart3d.style.setProperty('--tilt-y', `${(x * 16).toFixed(1)}deg`);
        cart3d.style.setProperty('--tilt-x', `${(-y * 8).toFixed(1)}deg`);
      });
      footerEl.addEventListener('pointerleave', () => {
        cart3d.style.removeProperty('--tilt-y');
        cart3d.style.removeProperty('--tilt-x');
      });
    }
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

  // ---- Fotos del local (Nosotros): pasan solas cada 5 s mientras se ven ----
  // Con el mouse encima o con el teclado dentro se detienen. Al tocar un punto o deslizar de lado,
  // se queda en la foto elegida (ya no pasan solas). Con "reducir movimiento" no pasan solas.
  const gallery = $('.local-gallery');
  if (gallery) {
    const slides = $$('.local-slide', gallery);
    const dots = $$('.local-dot', gallery);
    let current = 0;
    let timer = 0;
    let auto = !reduceMotion && slides.length > 1;
    let inView = false;
    let paused = false;

    const show = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
      dots.forEach((d, n) => d.setAttribute('aria-pressed', String(n === current)));
    };
    const schedule = () => {
      window.clearTimeout(timer);
      if (auto && inView && !paused && !document.hidden) {
        timer = window.setTimeout(() => { show(current + 1); schedule(); }, 5000);
      }
    };
    const choose = (i) => {
      auto = false;
      window.clearTimeout(timer);
      show(i);
    };

    dots.forEach((d, n) => d.addEventListener('click', () => choose(n)));

    // Deslizar de lado (celular) o arrastrar con el mouse
    let start = null;
    const track = $('.local-slides', gallery);
    track.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; });
    track.addEventListener('pointerup', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) choose(current + (dx < 0 ? 1 : -1));
    });
    track.addEventListener('pointercancel', () => { start = null; });

    const pause = (on) => { paused = on; schedule(); };
    gallery.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pause(true); });
    gallery.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') pause(false); });
    gallery.addEventListener('focusin', () => pause(true));
    gallery.addEventListener('focusout', () => pause(false));
    document.addEventListener('visibilitychange', schedule);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        schedule();
      }, { threshold: 0.4 }).observe(gallery);
    }
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
