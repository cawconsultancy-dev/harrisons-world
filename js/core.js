/* Harrison's World: core helpers, settings, routing and the shared game kit. */
(function () {
  "use strict";
  var HW = (window.HW = window.HW || {});
  HW.version = "1.1.0";

  /* ---------- settings: stored only on this tablet ---------- */
  var DEFAULTS = {
    music: true, musicVol: "quiet", voice: true, voiceSpeed: "normal", sfx: true,
    choices: 2, countTo: 3, motion: "normal",
    hidden: [], today: "auto", recent: []
  };
  var KEY = "hw-settings-v1";
  function load() {
    var s = {};
    try { s = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { s = {}; }
    var out = {};
    for (var k in DEFAULTS) out[k] = (k in s) ? s[k] : DEFAULTS[k];
    return out;
  }
  HW.settings = load();
  HW.saveSettings = function () {
    try { localStorage.setItem(KEY, JSON.stringify(HW.settings)); } catch (e) { /* private mode: keep in memory */ }
    document.body.classList.toggle("reduce-motion", HW.settings.motion === "reduced");
  };

  /* ---------- tiny DOM helpers ---------- */
  HW.el = function (tag, cls, parent, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  HW.rand = function (a, b) { return a + Math.random() * (b - a); };
  HW.randInt = function (a, b) { return Math.floor(HW.rand(a, b + 1)); };
  HW.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  HW.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  HW.word = function (key) { return (HW.WORDS && HW.WORDS[key]) || key; };
  HW.reducedMotion = function () {
    return HW.settings.motion === "reduced" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  };

  /* Tap handler built for small hands: reacts on touch-down, ignores repeat
     taps on the same thing within a short window, and stops long-press menus. */
  HW.onTap = function (el, fn, gapMs) {
    var last = 0, gap = gapMs == null ? 350 : gapMs;
    function handler(ev) {
      if (ev.type === "pointerdown" && ev.button && ev.button !== 0) return;
      var now = Date.now();
      if (now - last < gap) return;
      last = now;
      if (ev.cancelable) ev.preventDefault();
      HW.audio && HW.audio.unlock();
      fn(ev);
    }
    if (window.PointerEvent) el.addEventListener("pointerdown", handler);
    else { el.addEventListener("touchstart", handler, { passive: false }); el.addEventListener("mousedown", handler); }
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    return el;
  };

  /* Press handler for scrolling pages (home, grown-ups): only fires if the finger
     lifts without moving, so scrolling never starts a game by accident. */
  HW.onPress = function (el, fn, gapMs) {
    var last = 0, gap = gapMs == null ? 500 : gapMs, sx = 0, sy = 0, active = false, t0 = 0;
    el.addEventListener("pointerdown", function (ev) { active = true; sx = ev.clientX; sy = ev.clientY; t0 = Date.now(); HW.audio && HW.audio.unlock(); });
    el.addEventListener("pointermove", function (ev) { if (active && (Math.abs(ev.clientX - sx) > 12 || Math.abs(ev.clientY - sy) > 12)) active = false; });
    el.addEventListener("pointercancel", function () { active = false; });
    el.addEventListener("pointerleave", function () { active = false; });
    el.addEventListener("pointerup", function (ev) {
      if (!active) return; active = false;
      var now = Date.now();
      if (now - t0 > 1500 || now - last < gap) return;
      last = now;
      HW.audio && HW.audio.unlock();
      fn(ev);
    });
    el.addEventListener("click", function (ev) { if (ev.detail === 0) { fn(ev); } }); /* keyboard */
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    return el;
  };

  /* Images: emoji artwork files or inline art */
  HW.img = function (name, cls) {
    var i = document.createElement("img");
    i.src = "img/e/" + name + ".svg";
    i.alt = "";
    i.draggable = false;
    if (cls) i.className = cls;
    return i;
  };
  HW.svgEl = function (svgString, cls) {
    var d = document.createElement("div");
    d.innerHTML = svgString.trim();
    var s = d.firstChild;
    if (cls) s.setAttribute("class", cls);
    return s;
  };

  /* ---------- the shared game kit ---------- */
  HW.games = [];
  HW.gameById = {};
  HW.registerGame = function (def) { HW.games.push(def); HW.gameById[def.id] = def; };

  HW.makeKit = function (stage, def, intro) {
    var g = { alive: true, stage: stage, def: def, busy: false, timers: [], cleanups: [] };
    var never = new Promise(function () {});
    var introDone = intro || Promise.resolve();
    g.later = function (ms, fn) {
      var t = setTimeout(function () { if (g.alive) fn(); }, ms);
      g.timers.push(t);
      return t;
    };
    g.wait = function (ms) { return new Promise(function (res) { g.later(ms, res); }); };
    g.guard = function (p) { return p.then(function (v) { return g.alive ? v : never; }); };
    /* the game's name is spoken first; game words wait for it to finish */
    g.say = function (key) { return g.alive ? g.guard(introDone.then(function () { return g.alive ? HW.audio.say(key) : never; })) : never; };
    g.el = function (tag, cls, parent, html) { return HW.el(tag, cls, parent || stage, html); };
    g.tap = function (el, fn, gap) {
      return HW.onTap(el, function (ev) { if (!g.alive) return; fn(ev); }, gap);
    };
    g.onCleanup = function (fn) { g.cleanups.push(fn); };

    /* the written word appears big in the top bar, so it never covers the game */
    var bar = stage.parentNode && stage.parentNode.querySelector(".topbar-title");
    var wordEl = bar ? bar.querySelector(".tb-word") : HW.el("div", "word-label", stage);
    var labelTimer = null;
    g.show = function (key, ms) {
      wordEl.textContent = HW.word(key).replace(/\.+$/, "");
      (bar || wordEl).classList.add(bar ? "showing" : "show");
      clearTimeout(labelTimer);
      labelTimer = setTimeout(function () { (bar || wordEl).classList.remove(bar ? "showing" : "show"); }, ms || 2200);
    };
    /* say the word and show it written: the same word every time */
    g.name = function (key) { g.show(key); return g.say(key); };

    g.bounce = function (el) { restartClass(el, "bounce"); };
    g.wiggle = function (el) { restartClass(el, "wiggle"); };
    g.glow = function (el, on, soft) {
      if (on === false) { el.classList.remove("glow", "glow-soft"); return; }
      el.classList.add(soft ? "glow-soft" : "glow");
    };

    /* gentle praise: soft chime, slow drifting stars, one kind word */
    var PRAISE = ["welldone", "yay", "goodjob", "brilliant", "yay", "welldone", "welldone_h"];
    var lastPraise = "";
    g.praise = function (atEl) {
      HW.audio.sfx("chime");
      g.sparkle(atEl);
      var p;
      do { p = HW.pick(PRAISE); } while (p === lastPraise);
      lastPraise = p;
      return g.say(p);
    };
    g.sparkle = function (atEl) {
      if (HW.reducedMotion()) return;
      var sr = stage.getBoundingClientRect();
      var cx = sr.width / 2, cy = sr.height / 2;
      if (atEl && atEl.getBoundingClientRect) {
        var r = atEl.getBoundingClientRect();
        cx = r.left - sr.left + r.width / 2; cy = r.top - sr.top + r.height / 2;
      }
      for (var i = 0; i < 8; i++) {
        var s = HW.svgEl(HW.art.star("#ffd86b"), "spark");
        var a = (Math.PI * 2 * i) / 8 + HW.rand(-.2, .2), d = HW.rand(70, 130);
        s.style.left = (cx - 17) + "px"; s.style.top = (cy - 17) + "px";
        s.style.setProperty("--dx", Math.cos(a) * d + "px");
        s.style.setProperty("--dy", Math.sin(a) * d + "px");
        stage.appendChild(s);
        (function (node) { setTimeout(function () { node.remove(); }, 1700); })(s);
      }
    };

    /* errorless help: the tapped one wiggles, the word is said again,
       and the right one glows softly. Nothing is marked as wrong. */
    g.help = function (wrongEl, rightEl, key) {
      g.wiggle(wrongEl);
      g.glow(rightEl, true);
      return g.name(key);
    };

    /* a row of big picture buttons */
    g.choices = function (items, render, onPick) {
      var row = g.el("div", "choices n" + items.length);
      var btns = items.map(function (it) {
        var b = HW.el("button", "choice", row);
        b.setAttribute("aria-label", HW.word(it.key || it));
        b.appendChild(render(it));
        b._item = it;
        g.tap(b, function () { if (!g.busy) onPick(it, b, btns); });
        return b;
      });
      row._btns = btns;
      return row;
    };

    /* positions inside the stage */
    g.size = function () { var r = stage.getBoundingClientRect(); return { w: r.width, h: r.height, left: r.left, top: r.top }; };
    g.centre = function (el) {
      var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height };
    };
    g.flyToPoint = function (el, x, y, ms, scale, extra) {
      var c = g.centre(el);
      var dur = HW.reducedMotion() ? 10 : (ms || 700);
      var base = el._baseTransform || "";
      el.style.transition = "transform " + dur + "ms cubic-bezier(.4,.1,.3,1), opacity .4s";
      el.style.transform = base + " translate(" + (x - c.x) + "px," + (y - c.y) + "px) scale(" + (scale == null ? 1 : scale) + ")" + (extra || "");
      return g.wait(dur + 30);
    };
    /* web animation helper that respects reduced motion */
    g.anim = function (el, frames, opts) {
      if (HW.reducedMotion() && !(opts && opts.always)) opts = Object.assign({}, opts, { duration: 10 });
      if (!el.animate) { return g.wait(0); }
      var a = el.animate(frames, Object.assign({ fill: "forwards", easing: "cubic-bezier(.4,.1,.3,1)" }, opts));
      return new Promise(function (res) { a.onfinish = res; a.oncancel = res; }).then(function () { return g.alive ? a : never; });
    };

    g.stop = function () {
      g.alive = false;
      g.timers.forEach(clearTimeout);
      clearTimeout(labelTimer);
      g.cleanups.forEach(function (fn) { try { fn(); } catch (e) {} });
      HW.audio.stopVoice();
    };
    return g;
  };

  function restartClass(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 900);
  }

  /* move an element to sit over another (for "fly into the basket" moments) */
  HW.flyTo = function (el, target, ms, scale) {
    var a = el.getBoundingClientRect(), b = target.getBoundingClientRect();
    var dx = b.left + b.width / 2 - (a.left + a.width / 2);
    var dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var dur = HW.reducedMotion() ? 10 : (ms || 700);
    el.style.transition = "transform " + dur + "ms cubic-bezier(.4,.1,.3,1)";
    el.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + (scale == null ? 1 : scale) + ")";
    return new Promise(function (res) { setTimeout(res, dur + 30); });
  };

  /* Common svg icons for buttons */
  HW.icons = {
    home: '<svg viewBox="0 0 48 48"><path d="M8 22 24 9l16 13v17a2 2 0 0 1-2 2H29V29h-10v12H10a2 2 0 0 1-2-2z" fill="#fbf3e2"/></svg>',
    music: '<svg viewBox="0 0 48 48"><path d="M19 8v22.5a7 7 0 1 0 4 6.3V17l14-4v12.5a7 7 0 1 0 4 6.3V3z" fill="#fbf3e2"/></svg>',
    musicOff: '<svg viewBox="0 0 48 48"><path d="M19 8v22.5a7 7 0 1 0 4 6.3V17l14-4v12.5a7 7 0 1 0 4 6.3V3z" fill="#fbf3e2" opacity=".55"/><path d="M6 6l36 36" stroke="#e9b949" stroke-width="5" stroke-linecap="round"/></svg>',
    person: '<svg viewBox="0 0 48 48"><circle cx="24" cy="16" r="8" fill="none" stroke="#fbf3e2" stroke-width="4"/><path d="M9 41c1.5-8.5 7.5-13 15-13s13.5 4.5 15 13" fill="none" stroke="#fbf3e2" stroke-width="4" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M5 3.5v17L20 12z" fill="#e9b949"/></svg>',
    plus: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#fff" opacity=".25"/><path d="M24 12v24M12 24h24" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 48 48"><path d="M14 24h22M26 13l11 11-11 11" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    turns: '<svg viewBox="0 0 48 48"><path d="M10 18a14 14 0 0 1 26-5M38 30a14 14 0 0 1-26 5" fill="none" stroke="#fbf3e2" stroke-width="4" stroke-linecap="round"/><path d="M37 5v9h-9M11 43v-9h9" fill="none" stroke="#fbf3e2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    free: '<svg viewBox="0 0 48 48"><path d="M19 8v22.5a7 7 0 1 0 4 6.3V17l14-4v12.5a7 7 0 1 0 4 6.3V3z" fill="#fbf3e2"/></svg>'
  };

  /* tablets only allow sound to start or resume on a completed tap */
  ["pointerup", "touchend", "click"].forEach(function (t) {
    document.addEventListener(t, function () { if (HW.audio) HW.audio.unlock(); }, true);
  });
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });
})();
