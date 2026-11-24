/* Marigold Social — interactions */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  document.body.classList.add('is-loading');

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      lenis ? lenis.scrollTo(el, { offset: -20 }) : el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('mobileMenu');
  function closeMenu() {
    mobile.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', () => {
    const open = !mobile.classList.contains('is-open');
    mobile.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Nav hide on scroll ---------- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('is-hidden', y > lastY && y > 400 && !mobile.classList.contains('is-open'));
    lastY = y;
  }, { passive: true });

  /* ---------- Split story heading into words ---------- */
  const storyH = document.querySelector('.reveal-words');
  if (storyH) {
    storyH.innerHTML = storyH.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  }

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const countEl = document.getElementById('loaderCount');
  function finishLoad() {
    document.body.classList.remove('is-loading');
    if (!hasGsap || reduce) { loader.remove(); return; }
    gsap.timeline()
      .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: 1, ease: 'expo.inOut' })
      .add(() => loader.remove())
      .add(() => intro.play(), '-=0.45');
  }
  let intro = null;
  if (hasGsap && !reduce) {
    intro = heroIntro().pause();
    gsap.set(loader, { clipPath: 'circle(150% at 50% 50%)' });
    const c = { v: 0 };
    gsap.to(c, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => countEl.textContent = Math.round(c.v) + '%', onComplete: finishLoad });
  } else {
    window.addEventListener('load', finishLoad);
    setTimeout(finishLoad, 1500);
  }

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);

  function heroIntro() {
    const tl = gsap.timeline();
    tl.from('.hero-title .line > span', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .12 })
      .from('.hero-kicker, .hero-sub, .hero-actions', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.7')
      .from('.hero-blob', { scale: .6, rotate: -30, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0)
      .from('.hero-plate', { scale: .4, rotate: -120, duration: 1.4, ease: 'expo.out' }, .1);
    if (document.querySelector('.hero-chip')) {
      tl.from('.hero-chip', { scale: 0, duration: .9, ease: 'back.out(1.8)', stagger: .12 }, .6);
    }
    if (document.querySelector('.hero-badge')) {
      tl.from('.hero-badge', { scale: 0, rotate: -90, duration: .9, ease: 'back.out(1.6)' }, .8);
    }
    gsap.from('.nav', { opacity: 0, duration: .8, delay: .3 });
    return tl;
  }
  if (reduce) return;

  /* Hero plate spins slowly with scroll, chips drift */
  gsap.to('#heroPlate', { rotate: 90, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  if (document.querySelector('.chip-a')) gsap.to('.chip-a', { y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  if (document.querySelector('.chip-b')) gsap.to('.chip-b', { y: 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Mouse tilt on hero visual */
  const hv = document.querySelector('.hero-visual');
  if (hv && window.matchMedia('(pointer:fine)').matches) {
    const qx = gsap.quickTo(hv, 'rotationY', { duration: .8, ease: 'power3' });
    const qy = gsap.quickTo(hv, 'rotationX', { duration: .8, ease: 'power3' });
    gsap.set(hv, { transformPerspective: 900 });
    window.addEventListener('mousemove', e => {
      qx((e.clientX / innerWidth - .5) * 10);
      qy((e.clientY / innerHeight - .5) * -10);
    });
  }

  /* Story: parallax images + word reveal + counters */
  document.querySelectorAll('[data-speed]').forEach(el => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { yPercent: s * 100 }, { yPercent: -s * 100, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.story-img img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.to('.story-copy h2 .w', { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.story-copy h2', start: 'top 80%', end: 'bottom 45%', scrub: true } });
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true }, onUpdate: () => el.textContent = o.v.toFixed(dec) });
  });

  /* Signatures: horizontal pinned scroll (desktop/tablet) */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 561px)', () => {
    const track = document.getElementById('sigTrack');
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.sig-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    gsap.utils.toArray('.sig-card').forEach((card, i) => {
      gsap.from(card, { rotate: i % 2 ? 6 : -6, y: 60, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 60%', scrub: true } });
      gsap.to(card.querySelector('img'), { xPercent: -8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
  });

  /* Section headings rise once */
  gsap.utils.toArray('.menu-head h2, .evenings h2, .reserve-copy h2, .sig-head h2').forEach(h => {
    gsap.from(h, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* Evenings cards: clip open */
  gsap.utils.toArray('.ev').forEach((ev, i) => {
    gsap.from(ev, { clipPath: 'inset(100% 0 0 0 round 28px)', duration: 1.2, delay: i * .12, ease: 'expo.out', scrollTrigger: { trigger: '.ev-grid', start: 'top 80%' } });
  });

  /* Gallery rows move opposite ways */
  gsap.fromTo('.gal-row-1', { x: 0 }, { x: () => -(document.querySelector('.gal-row-1').scrollWidth - innerWidth) * .6, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.gal-row-2', { x: () => -(document.querySelector('.gal-row-2').scrollWidth - innerWidth) * .6 }, { x: 0, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Footer wordmark slides in */
  gsap.from('.foot-big', { xPercent: 30, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 30%', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();

/* ---------- Menu tabs (works with or without GSAP) ---------- */
(() => {
  const photos = {
    small: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&q=80&auto=format&fit=crop', 'Crisp samosas with chutney'],
    grill: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80&auto=format&fit=crop', 'Charcoal-grilled ribs'],
    mains: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1000&q=80&auto=format&fit=crop', 'Butter chicken curry'],
    sweet: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1000&q=80&auto=format&fit=crop', 'Plated dessert']
  };
  Object.values(photos).forEach(([src]) => { const i = new Image(); i.src = src; });
  const tabs = document.querySelectorAll('.menu-tabs [role="tab"]');
  const img = document.getElementById('menuPhoto');
  const hasGsap = typeof window.gsap !== 'undefined';
  function select(tab) {
    const key = tab.dataset.tab;
    tabs.forEach(t => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
    document.querySelectorAll('.menu-list').forEach(l => l.classList.toggle('is-active', l.dataset.panel === key));
    const [src, alt] = photos[key];
    if (hasGsap) {
      gsap.timeline()
        .to(img, { clipPath: 'circle(0% at 50% 50%)', duration: .35, ease: 'power2.in' })
        .add(() => { img.src = src; img.alt = alt; })
        .to(img, { clipPath: 'circle(75% at 50% 50%)', duration: .6, ease: 'expo.out' });
      gsap.from('.menu-list.is-active li', { y: 20, opacity: 0, duration: .5, stagger: .05, ease: 'power3.out' });
    } else { img.src = src; img.alt = alt; }
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); select(n);
    });
  });

  /* Reviews rotator */
  const reviews = document.querySelectorAll('.review');
  const dots = document.querySelectorAll('.review-dots button');
  let idx = 0, timer;
  function show(n) {
    idx = n;
    reviews.forEach((r, i) => r.classList.toggle('is-active', i === n));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === n));
  }
  function auto() { clearInterval(timer); timer = setInterval(() => show((idx + 1) % reviews.length), 5500); }
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); auto(); }));
  auto();

  /* Reservation form */
  const form = document.getElementById('reserveForm');
  const note = document.getElementById('formNote');
  const date = form.querySelector('[name="date"]');
  date.min = new Date().toISOString().split('T')[0];
  form.addEventListener('submit', e => {
    e.preventDefault();
    const missing = [...form.querySelectorAll('[required]')].filter(f => !f.value.trim());
    if (missing.length) {
      note.textContent = 'Add your ' + missing.map(f => f.name).join(', ') + ' to request a table.';
      note.classList.add('is-error');
      missing[0].focus();
      return;
    }
    const g = form.querySelector('[name="guests"]:checked').value;
    note.classList.remove('is-error');
    note.textContent = `Booking requested for ${g} on ${date.value} at ${form.time.value}. We'll confirm on WhatsApp within 15 minutes.`;
    form.reset();
  });
})();
