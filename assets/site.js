// CleanSight site — no dependencies.
(function () {
  // Mobile menu
  var header = document.getElementById('header');
  var btn = document.getElementById('menuBtn');
  if (btn) btn.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var lite = reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  var hasIO = 'IntersectionObserver' in window;

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if (reduce || !hasIO) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Motion: each <video class="motion"> shows its poster until it is close to the
  // screen. Then the file is attached once, it plays while visible and pauses when
  // it is not. Reduced motion, Save-Data and 2G keep the poster and download nothing.
  var videos = document.querySelectorAll('video.motion[data-src]');
  if (videos.length && !lite && hasIO) {
    var play = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var attach = function (v) {
      if (v.dataset.on) return;
      v.dataset.on = '1';
      v.src = v.dataset.src;
      v.load();
    };
    var near = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { attach(e.target); near.unobserve(e.target); } });
    }, { rootMargin: '300px 0px' });
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        v.dataset.vis = e.isIntersecting ? '1' : '';
        if (!v.dataset.on) return;
        if (e.isIntersecting) play(v); else v.pause();
      });
    }, { threshold: 0.15 });
    videos.forEach(function (v) {
      v.addEventListener('canplay', function () { if (v.dataset.vis) play(v); });
      seen.observe(v);
      if (v.hasAttribute('data-eager')) {
        // the hero waits for the page to finish loading so it never delays the text
        var start = function () { attach(v); };
        if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
      } else {
        near.observe(v);
      }
    });
    document.addEventListener('visibilitychange', function () {
      videos.forEach(function (v) {
        if (!v.dataset.on) return;
        if (document.hidden) v.pause(); else if (v.dataset.vis) play(v);
      });
    });
  }

  // Sticky download bar on phones: hidden while either real button is on screen.
  var bar = document.getElementById('stickyCta');
  var heroCta = document.getElementById('heroCta');
  var closeCta = document.getElementById('closeCta');
  if (bar && heroCta && hasIO) {
    var link = bar.querySelector('a');
    var onScreen = { hero: true, close: false };
    var update = function () {
      var show = !onScreen.hero && !onScreen.close;
      bar.classList.toggle('show', show);
      if (show) link.removeAttribute('tabindex'); else link.setAttribute('tabindex', '-1');
    };
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === heroCta) onScreen.hero = e.isIntersecting;
        else onScreen.close = e.isIntersecting;
      });
      update();
    });
    watch.observe(heroCta);
    if (closeCta) watch.observe(closeCta);
  }
})();
