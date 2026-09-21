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

  // Reveal on scroll
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Swipe demo
  var deck = document.getElementById('deck');
  if (!deck) return;
  var cards = [
    { e: '☕', name: 'IMG_2040', mb: 3.6, note: 'Near-duplicate', where: '📱' },
    { e: '🌅', name: 'IMG_2041', mb: 4.1, note: 'Sunset · similar ×3', where: '☁︎' },
    { e: '📱', name: 'Screenshot', mb: 1.2, note: 'OTP code · Feb 2024', where: '📱' },
    { e: '🐶', name: 'IMG_2049', mb: 3.9, note: 'Blurry', where: '📱' },
    { e: '🍝', name: 'IMG_2052', mb: 4.4, note: 'Burst · 6 frames', where: '☁︎' },
    { e: '🧾', name: 'Screenshot', mb: 0.9, note: 'Receipt · 2023', where: '📱' }
  ];
  var idx = 0, kept = 0, removed = 0, saved = 0;
  var top = document.getElementById('topCard');
  var back = deck.querySelector('.swipe-card.back');
  var statK = document.getElementById('statKept'), statR = document.getElementById('statRemoved'), statS = document.getElementById('statSaved');

  function fill(el, c) {
    el.querySelector('.face').textContent = c.e;
    el.querySelector('.cloud').textContent = c.where;
    el.querySelector('.meta').innerHTML = '<span>' + c.name + ' · ' + c.mb + ' MB</span><span>' + c.note + '</span>';
  }
  function fillBack() {
    var c = cards[(idx + 1) % cards.length];
    back.innerHTML = '<span>' + c.e + '</span><span class="cloud">' + c.where + '</span><div class="meta"><span>' + c.name + ' · ' + c.mb + ' MB</span><span>' + c.note + '</span></div>';
  }
  function stats() {
    statK.textContent = kept + ' kept';
    statR.textContent = removed + ' removed';
    statS.textContent = saved.toFixed(1) + ' MB reclaimable';
  }
  function reset() { top.style.transition = 'none'; top.style.transform = ''; top.style.opacity = ''; setTag(0); void top.offsetWidth; top.style.transition = ''; }
  function setTag(dx) {
    var k = top.querySelector('.tag.keep'), d = top.querySelector('.tag.del');
    k.style.opacity = Math.max(0, Math.min(1, dx / 80));
    d.style.opacity = Math.max(0, Math.min(1, -dx / 80));
  }
  function commit(dir) {
    var c = cards[idx % cards.length];
    if (dir > 0) kept++; else { removed++; saved += c.mb; }
    if (navigator.vibrate) navigator.vibrate(12);
    top.style.transform = 'translateX(' + (dir * 520) + 'px) rotate(' + (dir * 22) + 'deg)';
    top.style.opacity = '0';
    setTimeout(function () {
      idx++;
      fill(top, cards[idx % cards.length]);
      fillBack();
      reset();
      stats();
    }, 220);
  }
  var startX = 0, dragging = false;
  top.addEventListener('pointerdown', function (e) { dragging = true; startX = e.clientX; top.setPointerCapture(e.pointerId); top.style.transition = 'none'; });
  top.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    top.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 18) + 'deg)';
    setTag(dx);
  });
  function up(e) {
    if (!dragging) return; dragging = false; top.style.transition = '';
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 90) commit(dx > 0 ? 1 : -1); else { top.style.transform = ''; setTag(0); }
  }
  top.addEventListener('pointerup', up); top.addEventListener('pointercancel', up);
  document.getElementById('btnKeep').addEventListener('click', function () { commit(1); });
  document.getElementById('btnDel').addEventListener('click', function () { commit(-1); });
  fillBack(); stats();
})();
function launchSubmit(ev) {
  ev.preventDefault();
  var email = document.getElementById('email').value;
  window.location.href = 'mailto:info@cleansight.ai?subject=' + encodeURIComponent('CleanSight launch access') + '&body=' + encodeURIComponent('Please add ' + email + ' to the launch list.');
  return false;
}
