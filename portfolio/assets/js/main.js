/* =========================================================
   MAIN — smooth scroll, hero, nav, reveals, modals, gallery,
   accordion, copy, quick contact, resume button
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  window.SITE = { lenis: null, isTouch: isTouch, reduceMotion: reduceMotion };

  /* ---------- 1. Mount the designed project visuals ---------- */
  function mountVisuals(root) {
    $$('[data-viz]', root).forEach(function (el) {
      if (el.childElementCount) return;
      var tpl = document.getElementById('viz-' + el.getAttribute('data-viz'));
      if (tpl) el.appendChild(tpl.content.cloneNode(true));
    });
    $$('.db__cells', root).forEach(function (cells) {
      if (cells.childElementCount) return;
      for (var i = 0; i < 54; i++) {
        var c = document.createElement('i');
        var v = Math.max(0.06, Math.abs(Math.sin(i * 1.7) * Math.cos(i * .37)));
        c.style.setProperty('--o', v.toFixed(2));
        cells.appendChild(c);
      }
    });
  }
  window.SITE.mountVisuals = mountVisuals;
  mountVisuals(document);

  /* ---------- 2. Marquee: duplicate content for a seamless loop ---------- */
  $$('[data-marquee] .marquee__track').forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---------- 3. Smooth scrolling (Lenis) synced with GSAP ---------- */
  if (window.Lenis && !reduceMotion && !isTouch) {
    // lerp-based smoothing: follows the wheel closely (controlled), never floaty
    var lenis = new window.Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      // let popups, menus and text areas scroll natively
      prevent: function (node) { return !!(node.closest && node.closest('[data-lenis-prevent], .modal, .menu, textarea')); }
    });
    window.SITE.lenis = lenis;
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  function scrollToTarget(target, offset) {
    if (window.SITE.lenis) window.SITE.lenis.scrollTo(target, { offset: offset || 0, duration: 1.1, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } });
    else {
      var y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + (offset || 0);
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  window.SITE.scrollToTarget = scrollToTarget;

  // in-page anchor links
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2 && id !== '#') return;
    var el = id === '#top' || id === '#' ? 0 : $(id);
    if (el === null) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(el, el === 0 ? 0 : (id === '#work' ? 0 : -16));
  });

  /* ---------- 4. Hero video (desktop / mobile file picked by width) ---------- */
  var video = $('.hero__video');
  if (video) {
    var base = window.innerWidth < 768 ? video.dataset.srcMobile : video.dataset.srcDesktop;
    ['webm', 'mp4'].forEach(function (ext) {
      var s = document.createElement('source');
      s.src = base + '.' + ext; s.type = 'video/' + ext;
      video.appendChild(s);
    });
    var startVideo = function () {
      var p = video.play();
      if (p && p.then) p.then(function () { video.classList.add('is-playing'); }).catch(function () {});
      else video.classList.add('is-playing');
    };
    var beginVideo = function () {
      video.load();
      if (!reduceMotion) video.addEventListener('canplay', startVideo, { once: true });
    };
    if (document.readyState === 'complete') setTimeout(beginVideo, 200);
    else window.addEventListener('load', function () { setTimeout(beginVideo, 200); }, { once: true });
    // pause when off-screen to save battery
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (reduceMotion) return; if (en.isIntersecting) video.play().catch(function () {}); else video.pause(); });
      }).observe(video);
    }
  }

  /* ---------- 5. Navbar: transparent on hero, frosted after, hides on scroll down ---------- */
  var nav = $('[data-nav]');
  var hero = $('.hero');
  var lastY = window.scrollY;
  function onNavScroll() {
    var y = window.scrollY;
    var heroEnd = hero ? hero.offsetHeight - 90 : 200;
    nav.classList.toggle('is-solid', y > heroEnd);
    var goingDown = y > lastY + 4, goingUp = y < lastY - 4;
    if (y > heroEnd + 200 && goingDown && !doc.classList.contains('menu-open')) nav.classList.add('is-hidden');
    if (goingUp || y < heroEnd) nav.classList.remove('is-hidden');
    if (Math.abs(y - lastY) > 4) lastY = y;
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // current section highlight
  var navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        navLinks.forEach(function (l) { l.classList.toggle('is-current', l.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'experience', 'stack', 'about', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) sectionObs.observe(s); });
  }

  /* ---------- 6. Mobile menu ---------- */
  var menu = $('[data-menu]');
  var burger = $('[data-menu-open]');
  function openMenu() { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); doc.classList.add('menu-open'); lock(true); }
  function closeMenu() { if (!menu.classList.contains('is-open')) return; menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); doc.classList.remove('menu-open'); lock(false); }
  burger.addEventListener('click', openMenu);
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(); });

  function lock(on) {
    document.body.classList.toggle('is-locked', on);
    if (window.SITE.lenis) on ? window.SITE.lenis.stop() : window.SITE.lenis.start();
  }

  /* ---------- 7. Scroll reveals + split headings (GSAP) ---------- */
  if (hasGsap && !reduceMotion) {
    gsap.registerPlugin(window.ScrollTrigger);
    doc.classList.add('has-motion');
    // below-the-fold animation setup waits for an idle moment (keeps first load snappy)
    var whenIdle = window.requestIdleCallback ? function (cb) { window.requestIdleCallback(cb, { timeout: 1200 }); } : function (cb) { setTimeout(cb, 200); };

    // hero intro
    var heroTitle = $('[data-hero-title]');
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .15 });
    tl.from('.hero__media', { scale: 1.16, duration: 2.4, ease: 'power2.out' }, 0);
    if (window.SplitText && heroTitle) {
      gsap.set(heroTitle, { opacity: 0 });
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
        var hs = new window.SplitText(heroTitle, { type: 'lines', mask: 'lines' });
        gsap.set(heroTitle, { opacity: 1 });
        gsap.from(hs.lines, { yPercent: 105, duration: 1.1, stagger: .09, ease: 'power3.out' });
      });
    } else if (heroTitle) {
      tl.from(heroTitle, { y: 30, opacity: 0, duration: 1 }, .25);
    }
    tl.from('[data-hero-item]', { y: 22, opacity: 0, duration: .9, stagger: .1 }, .45);

    // hero media drifts slower than the page (parallax)
    gsap.to('.hero__media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // headings: line-by-line mask reveal (after fonts load so lines split correctly)
    var splitHeadings = function () {
    $$('[data-split]').forEach(function (el) {
      el.style.visibility = 'visible';
      if (!window.SplitText) { gsap.from(el, { y: 30, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 88%' } }); return; }
      var st = new window.SplitText(el, { type: 'lines', mask: 'lines' });
      gsap.from(st.lines, { yPercent: 105, duration: 1.05, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { whenIdle(splitHeadings); });

    whenIdle(function () {
    $$('[data-reveal]').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-reveal-stagger]').forEach(function (group) {
      gsap.to(group.children, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: group, start: 'top 85%' } });
    });

    // count-up stats
    $$('[data-count]').forEach(function (el) {
      var end = +el.getAttribute('data-count'); var o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: function () { el.textContent = Math.round(o.v); } });
    });

    });
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
  } else {
    $$('[data-split]').forEach(function (el) { el.style.visibility = 'visible'; });
  }

  /* ---------- 8. Modals ---------- */
  var modal = $('[data-modal]');
  var modalBody = $('[data-modal-body]');
  var lastFocus = null;
  function openModal(id) {
    var tpl = document.getElementById('m-' + id);
    if (!tpl) return;
    lastFocus = document.activeElement;
    modalBody.innerHTML = '';
    modalBody.appendChild(tpl.content.cloneNode(true));
    mountVisuals(modalBody);
    modalBody.scrollTop = 0;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lock(true);
    setTimeout(function () { var c = $('.modal__close', modal); if (c) c.focus({ preventScroll: true }); }, 60);
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lock(false);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-modal-open]');
    if (o) { e.preventDefault(); openModal(o.getAttribute('data-modal-open')); return; }
    if (e.target.closest('[data-modal-close]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeMenu(); closeQuick(); }
    if (e.key === 'Tab' && modal.classList.contains('is-open')) { // keep focus inside the dialog
      var f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', modal);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- 9. Accordion (one open at a time) ---------- */
  $$('[data-accordion]').forEach(function (acc) {
    $$('.accordion__head', acc).forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.parentElement, open = !item.classList.contains('is-open');
        $$('.accordion__item', acc).forEach(function (i) { i.classList.remove('is-open'); $('.accordion__head', i).setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('is-open'); head.setAttribute('aria-expanded', 'true'); }
        if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 520);
      });
    });
  });

  /* ---------- 10. Gallery (about) ---------- */
  var gal = $('[data-gallery]');
  if (gal) {
    var slides = $$('.about__slide', gal), thumbs = $$('.about__thumb', gal), cur = 0;
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === cur); });
      thumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === cur); });
    };
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    $('[data-gallery-prev]', gal).addEventListener('click', function () { go(cur - 1); });
    $('[data-gallery-next]', gal).addEventListener('click', function () { go(cur + 1); });
    var sx = null, stage = $('.about__stage', gal);
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- 11. Copy to clipboard + toast ---------- */
  var toast = $('[data-toast]'), toastT;
  function showToast(msg) { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 1800); }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () { b.classList.add('is-copied'); var l = $('span', b); if (l) l.textContent = 'Copied'; showToast('Copied: ' + text); setTimeout(function () { b.classList.remove('is-copied'); if (l) l.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
      else { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (err) {} document.body.removeChild(ta); done(); }
    });
  });

  /* ---------- 12. Quick contact ---------- */
  var quick = $('[data-quick]'), qbtn = $('[data-quick-toggle]');
  function closeQuick() { if (!quick) return; quick.classList.remove('is-open'); qbtn.setAttribute('aria-expanded', 'false'); }
  qbtn.addEventListener('click', function (e) { e.stopPropagation(); var o = !quick.classList.contains('is-open'); quick.classList.toggle('is-open', o); quick.classList.add('is-seen'); qbtn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', function (e) { if (!e.target.closest('[data-quick]')) closeQuick(); });

  /* ---------- 13. Contact form ---------- */
  // On Netlify the form is captured by Netlify Forms (no backend needed).
  // Anywhere else the POST fails, so it falls back to opening the visitor's
  // email app with the message pre-filled. Nothing is ever lost.
  var form = $('[data-contact-form]');
  if (form) {
    var status = $('[data-form-status]'), done = $('[data-form-done]');
    var submitBtn = $('button[type="submit"]', form), submitLabel = $('[data-submit-label]', form);
    var MAIL = 'shashwatdogra13@gmail.com';
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      email: function (v) { return emailOk(v.trim()); },
      message: function (v) { return v.trim().length >= 10; }
    };
    var tried = false;
    function check(field) {
      var el = form.elements[field]; var ok = rules[field](el.value);
      el.closest('.cform__field').classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    }
    Object.keys(rules).forEach(function (f) {
      var el = form.elements[f];
      var err = $('[data-err="' + f + '"]', form);
      if (err) { err.id = 'err-' + f; el.setAttribute('aria-describedby', err.id); }
      el.addEventListener('input', function () { if (tried) check(f); });
      el.addEventListener('blur', function () { if (tried) check(f); });
    });
    function setStatus(html, isError) { status.innerHTML = html; status.classList.toggle('is-error', !!isError); }
    function topic() { var t = form.querySelector('input[name="topic"]:checked'); return t ? t.value : 'Message'; }
    function mailtoFallback() {
      var f = form.elements;
      var subject = topic() + ' — from ' + f.name.value.trim();
      var body = f.message.value.trim() + '\n\n— ' + f.name.value.trim() + '\n' + f.email.value.trim();
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      setStatus('Your email app should open with the message ready to send. If it doesn\'t, write to <a href="mailto:' + MAIL + '">' + MAIL + '</a>.');
    }
    function showDone() {
      form.hidden = true; done.hidden = false; done.setAttribute('tabindex', '-1'); done.focus({ preventScroll: true });
    }
    var sending = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      tried = true;
      var valid = Object.keys(rules).map(check).every(Boolean);
      if (!valid) { setStatus('Please fix the highlighted fields.', true); var bad = $('.is-invalid input, .is-invalid textarea', form); if (bad) bad.focus(); return; }
      if (form.elements.company_website && form.elements.company_website.value) { showDone(); return; } // bot trap
      setStatus('');
      if (!/^https?:$/.test(location.protocol)) { mailtoFallback(); return; }
      sending = true; submitBtn.classList.add('is-loading'); if (submitLabel) submitLabel.textContent = 'Sending…';
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { if (!r.ok) throw new Error('not captured'); showDone(); })
        .catch(function () { mailtoFallback(); })
        .then(function () { sending = false; submitBtn.classList.remove('is-loading'); if (submitLabel) submitLabel.textContent = 'Send message'; });
    });
  }

  /* ---------- 14. Final section video (the hero loop), loaded only when near ---------- */
  var ctaVideo = $('.cta__video');
  if (ctaVideo && !reduceMotion && 'IntersectionObserver' in window) {
    var loaded = false;
    new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          if (!loaded) {
            loaded = true;
            var b = window.innerWidth < 768 ? ctaVideo.dataset.srcMobile : ctaVideo.dataset.srcDesktop;
            ['webm', 'mp4'].forEach(function (ext) { var so = document.createElement('source'); so.src = b + '.' + ext; so.type = 'video/' + ext; ctaVideo.appendChild(so); });
            ctaVideo.load();
            ctaVideo.addEventListener('canplay', function () { ctaVideo.play().then(function () { ctaVideo.classList.add('is-playing'); }).catch(function () {}); }, { once: true });
          } else ctaVideo.play().catch(function () {});
        } else if (loaded) ctaVideo.pause();
      });
    }, { rootMargin: '200px 0px' }).observe(ctaVideo);
  }

  /* ---------- 15. Resume button ---------- */
  // Switch on in index.html: <meta name="resume-available" content="yes">
  // after saving the file as assets/resume/Shashwat-Sharma-Resume.pdf
  var resumeMeta = document.querySelector('meta[name="resume-available"]');
  if (!resumeMeta || resumeMeta.content !== 'yes') {
    $$('[data-resume]').forEach(function (a) {
      var span = document.createElement('span');
      span.className = a.className + ' is-disabled';
      span.setAttribute('aria-disabled', 'true');
      span.innerHTML = a.innerHTML;
      var l = $('[data-resume-label]', span); if (l) l.textContent = 'Resume coming soon';
      a.parentNode.replaceChild(span, a);
    });
  }
})();
