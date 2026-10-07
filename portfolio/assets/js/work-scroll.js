/* =========================================================
   SELECTED WORK — pinned scroll story
   a sticky full-screen stage; scroll position picks a target
   step, and the visible step ticks toward it one at a time
   (600ms apart) so every transition gets to play.
   ========================================================= */
(function () {
  'use strict';
  var section = document.querySelector('[data-work]');
  if (!section) return;

  var bgs = section.querySelectorAll('[data-work-bg]');
  var contents = section.querySelectorAll('[data-work-content]');
  var chips = section.querySelectorAll('[data-work-chips]');
  var navItems = section.querySelectorAll('[data-work-nav]');
  var progress = section.querySelector('.work__progress');
  var TOTAL = bgs.length;
  var TICK = 600;          // normal scrolling: each slide gets time to play
  var FAST_TICK = 260;     // clicking 01–05: glide quickly through the in-between slides
  var tickMs = TICK;

  section.style.setProperty('--work-steps', TOTAL);

  var current = 0, target = 0, lastTick = 0, raf = null;

  function setLight(on) { section.classList.toggle('is-light', on); }

  function setActive(index) {
    if (index === current || index < 0 || index >= TOTAL) return;
    var prev = current;
    current = index;
    lastTick = performance.now();
    section.classList.toggle('is-reverse', index < prev);

    bgs.forEach(function (el) {
      var i = +el.getAttribute('data-work-bg');
      el.classList.remove('is-active', 'is-prev');
      if (i === prev) el.classList.add('is-prev');
      if (i === index) { void el.offsetWidth; el.classList.add('is-active'); }
    });
    [contents, chips, navItems].forEach(function (list) {
      list.forEach(function (el) {
        var attr = el.getAttribute('data-work-content') || el.getAttribute('data-work-chips') || el.getAttribute('data-work-nav');
        el.classList.toggle('is-active', +attr === index);
      });
    });
    // the first step is a light scene; the rest are dark
    setLight(bgs[index].classList.contains('is-light'));
  }

  function tick() {
    if (current === target) { raf = null; return; }
    if (performance.now() - lastTick >= tickMs) setActive(current + (target > current ? 1 : -1));
    if (current === target) tickMs = TICK;
    raf = requestAnimationFrame(tick);
  }

  function onScroll() {
    var rect = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    var p = Math.min(1, Math.max(0, -rect.top / scrollable));
    if (progress) progress.style.setProperty('--p', p.toFixed(4));
    var t = Math.min(TOTAL - 1, Math.floor(p * TOTAL));
    if (t !== target) { target = t; if (raf === null) raf = requestAnimationFrame(tick); }
  }

  // first background starts in place (no slide-in on load)
  bgs[0].classList.add('is-active');
  setLight(bgs[0].classList.contains('is-light'));

  // clicking an index item jumps to that step's scroll position
  navItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = +btn.getAttribute('data-work-nav');
      tickMs = FAST_TICK;
      var top = section.getBoundingClientRect().top + window.scrollY;
      var scrollable = section.offsetHeight - window.innerHeight;
      var y = top + scrollable * ((i + .5) / TOTAL);
      if (window.SITE && window.SITE.scrollToTarget) window.SITE.scrollToTarget(y); else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
