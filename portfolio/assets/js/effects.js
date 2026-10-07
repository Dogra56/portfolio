/* =========================================================
   EFFECTS — cursor, magnetic buttons, 3D tilt, mouse parallax,
   tool orbit, draggable highlights wall. Pointer devices only
   where it matters; everything degrades to static on touch.
   ========================================================= */
(function () {
  'use strict';
  var SITE = window.SITE || {};
  var touch = SITE.isTouch, still = SITE.reduceMotion;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lerp = function (a, b, n) { return a + (b - a) * n; };
  // Runs step() every frame, but only while el is on screen (saves battery and CPU).
  function loopWhileVisible(el, step) {
    var running = false, id = 0;
    var tick = function () { step(); id = requestAnimationFrame(tick); };
    var start = function () { if (!running) { running = true; id = requestAnimationFrame(tick); } };
    var stop = function () { running = false; cancelAnimationFrame(id); };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }, { rootMargin: '100px 0px' }).observe(el);
    else start();
    return { start: start, stop: stop };
  }

  /* ---------- Custom cursor ---------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && !touch && !still) {
    document.documentElement.classList.add('has-cursor');
    var dot = cursor.querySelector('.cursor__dot'), ring = cursor.querySelector('.cursor__ring'), label = cursor.querySelector('.cursor__label');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; }, { passive: true });
    (function loop() { rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18); ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest('a, button, [data-tilt], .accordion__head, .about__thumb');
      cursor.classList.toggle('is-hover', !!hot);
      var drag = e.target.closest('[data-wall]');
      cursor.classList.toggle('is-drag', !!drag && !hot);
      label.textContent = drag ? 'Drag' : '';
    });
    addEventListener('mousedown', function () { cursor.classList.add('is-down'); });
    addEventListener('mouseup', function () { cursor.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
  }

  /* ---------- Magnetic buttons + sheen follows the pointer ---------- */
  if (!touch && !still) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty('--mx', (x / r.width * 100) + '%');
        el.style.transform = 'translate(' + ((x - r.width / 2) * .18) + 'px,' + ((y - r.height / 2) * .28) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!touch && !still) {
    $$('[data-tilt]').forEach(function (el) {
      var target = el.querySelector('.how-card__visual') || el;
      target.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      target.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        target.style.transform = 'perspective(900px) rotateY(' + (px * 8) + 'deg) rotateX(' + (-py * 8) + 'deg) translateZ(0)';
      });
      el.addEventListener('mouseleave', function () { target.style.transform = ''; });
    });
  }

  /* ---------- Work stage: visuals follow the mouse in 3D ---------- */
  var stage = document.querySelector('.work__stage');
  if (stage && !touch && !still) {
    var tx = 0, ty = 0, cx = 0, cy = 0, inside = false;
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; inside = true;
    });
    stage.addEventListener('mouseleave', function () { tx = 0; ty = 0; inside = false; });
    var mounts = $$('.work__viz .viz-mount', stage);
    mounts.forEach(function (m) { m.style.transition = 'none'; });
    loopWhileVisible(stage, function () {
      cx = lerp(cx, tx, .07); cy = lerp(cy, ty, .07);
      var t = 'rotateY(' + (cx * -14) + 'deg) rotateX(' + (cy * 10) + 'deg) translate3d(' + (cx * -14) + 'px,' + (cy * -10) + 'px,0)';
      mounts.forEach(function (m) { m.style.transform = t; });
    });
  }

  /* ---------- Hero: soft pointer parallax on the copy ---------- */
  var heroCopy = document.querySelector('.hero__copy');
  if (heroCopy && !touch && !still) {
    var hx = 0, hy = 0, chx = 0, chy = 0;
    document.querySelector('.hero').addEventListener('mousemove', function (e) { hx = e.clientX / innerWidth - .5; hy = e.clientY / innerHeight - .5; });
    loopWhileVisible(document.querySelector('.hero'), function () { chx = lerp(chx, hx, .06); chy = lerp(chy, hy, .06); heroCopy.style.transform = 'translate3d(' + (chx * -10) + 'px,' + (chy * -6) + 'px,0)'; });
  }

  /* ---------- Orbit: tools circling a glowing core ---------- */
  var orbit = document.querySelector('[data-orbit]');
  if (orbit) {
    var items = $$('.orbit__ring span', orbit), n = items.length, angle = 0, speed = still ? 0 : .0035, hover = false;
    orbit.addEventListener('mouseenter', function () { hover = true; });
    orbit.addEventListener('mouseleave', function () { hover = false; });
    loopWhileVisible(orbit, function () {
      angle += hover ? speed * .25 : speed;
      var w = orbit.clientWidth, Rx = w * .44, Ry = orbit.clientHeight * .3;
      items.forEach(function (el, i) {
        var a = angle + i / n * Math.PI * 2, cos = Math.cos(a), depth = (cos + 1) / 2;
        var x = Math.sin(a) * Rx, y = cos * Ry, s = .72 + depth * .32;
        el.style.transform = 'translate(-50%,0) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
        el.style.opacity = (.35 + depth * .65).toFixed(2);
        el.style.zIndex = cos > 0 ? 3 : 1;
        el.style.filter = depth < .35 ? 'blur(' + ((.35 - depth) * 4).toFixed(1) + 'px)' : 'none';
      });
    });
  }

  /* ---------- Highlights wall: drag with inertia + slow auto drift ---------- */
  var wall = document.querySelector('[data-wall]');
  if (wall) {
    var track = wall.querySelector('.wall__track');
    var x = 0, v = 0, dragging = false, startX = 0, startPos = 0, lastX = 0, moved = false;
    var maxX = function () { return Math.min(0, wall.clientWidth - track.scrollWidth); };
    var down = function (px) { dragging = true; moved = false; startX = lastX = px; startPos = x; v = 0; wall.classList.add('is-dragging'); };
    var move = function (px) { if (!dragging) return; var d = px - startX; if (Math.abs(d) > 3) moved = true; x = startPos + d; v = px - lastX; lastX = px; };
    var up = function () { if (!dragging) return; dragging = false; wall.classList.remove('is-dragging'); };
    wall.addEventListener('mousedown', function (e) { e.preventDefault(); down(e.clientX); });
    addEventListener('mousemove', function (e) { move(e.clientX); });
    addEventListener('mouseup', up);
    wall.addEventListener('touchstart', function (e) { down(e.touches[0].clientX); }, { passive: true });
    wall.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
    wall.addEventListener('touchend', up);
    wall.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    var dir = -1;
    loopWhileVisible(wall, function () {
      if (!dragging) {
        x += v; v *= .93;
        if (!still && Math.abs(v) < .2) x += dir * .35;   // slow drift, ping-pongs at the ends
        var m = maxX();
        if (x > 0) { x = lerp(x, 0, .12); dir = -1; }
        if (x < m) { x = lerp(x, m, .12); dir = 1; }
      }
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    });
  }
})();
