/* Harrison's World: games 44 to 48. Finger trails, Drive the road, Heavy and light,
   Alien moves, and Morning time. No timers, no scores, nothing marked wrong. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art;

  /* ---------- paths a finger can follow, as points across an area ---------- */
  var SHAPES = [
    function (t) { return [t, 0.5 + 0.32 * Math.sin(t * Math.PI * 3)]; },                 /* wave */
    function (t) { var k = t * 4, f = k - Math.floor(k); return [t, (Math.floor(k) % 2 ? 1 - f : f) * 0.7 + 0.15]; }, /* zig-zag */
    function (t) { return [0.5 - 0.4 * Math.cos(t * Math.PI), 0.85 - 0.7 * Math.sin(t * Math.PI)]; },   /* rainbow arc */
    function (t) { return [t, 0.5 + 0.3 * Math.sin(t * Math.PI * 2)]; }                   /* S curve */
  ];
  function makePath(shape, area, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) { var p = shape(i / n); pts.push({ x: area.x + p[0] * area.w, y: area.y + p[1] * area.h }); }
    return pts;
  }
  function svgPath(pts, w, h, attrs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '"><polyline points="' +
      pts.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ") + '" fill="none" stroke-linecap="round" stroke-linejoin="round" ' + attrs + "/></svg>";
  }
  function canvasFor(g) {
    var cv = g.el("canvas", "abs"), r = g.stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.cssText = "left:0;top:0;width:100%;height:100%;pointer-events:none";
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    return { cv: cv, ctx: ctx };
  }

  /* textures drawn by the app, so nothing is downloaded */
  function texture(kind) {
    var c = document.createElement("canvas"); c.width = c.height = 64; var x = c.getContext("2d"), i;
    if (kind === "grass") {
      x.fillStyle = "#5fb35a"; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#3f8f40"; x.lineWidth = 3; x.lineCap = "round";
      for (i = 0; i < 14; i++) { var gx = (i * 37) % 64, gy = (i * 23) % 64; x.beginPath(); x.moveTo(gx, gy + 10); x.lineTo(gx + 3, gy); x.stroke(); }
    } else if (kind === "sand") {
      x.fillStyle = "#f0d49a"; x.fillRect(0, 0, 64, 64); x.fillStyle = "#d9b26a";
      for (i = 0; i < 26; i++) { x.beginPath(); x.arc((i * 41) % 64, (i * 29) % 64, 1.6, 0, 7); x.fill(); }
    } else {
      x.fillStyle = "#4aa3e0"; x.fillRect(0, 0, 64, 64); x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 3;
      for (i = 0; i < 3; i++) { x.beginPath(); x.moveTo(0, 12 + i * 22); x.quadraticCurveTo(16, 4 + i * 22, 32, 12 + i * 22); x.quadraticCurveTo(48, 20 + i * 22, 64, 12 + i * 22); x.stroke(); }
    }
    return c;
  }
  function near(pts, x, y, r) {
    var best = -1, bd = r * r;
    for (var i = 0; i < pts.length; i++) { var dx = pts[i].x - x, dy = pts[i].y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
    return best;
  }

  /* ================= 44 Finger trails ================= */
  var TEX = ["grass", "sand", "water"];
  HW.registerGame({
    id: "texture", title: "Finger trails", desc: "Follow the line to find grass, sand, or water",
    world: "art", worlds: ["art", "calm", "shapes"], bg: "kitchen", voice: TEX,
    icon: function () { return HW.img("leaf"); },
    start: function (g) {
      var round = 0, pts = [], hit = [], count = 0, done = false, guide = null, C = null, pat = null, r = 30, dot = null;
      function build() {
        if (guide) guide.remove(); if (C) C.cv.remove(); if (dot) dot.remove();
        var s = g.size(), pad = Math.min(s.w, s.h) * 0.12;
        var area = { x: pad, y: pad, w: s.w - pad * 2, h: s.h - pad * 2 };
        r = Math.max(26, Math.min(s.w, s.h) * 0.07);
        pts = makePath(SHAPES[round % SHAPES.length], area, 90); hit = pts.map(function () { return false; }); count = 0; done = false;
        guide = g.el("div", "abs trail-guide"); guide.style.cssText = "left:0;top:0;pointer-events:none";
        guide.innerHTML = svgPath(pts, s.w, s.h, 'stroke="rgba(74,58,28,.18)" stroke-width="' + r * 2 + '"') ;
        guide.innerHTML += svgPath(pts, s.w, s.h, 'stroke="rgba(74,58,28,.45)" stroke-width="6" stroke-dasharray="4 16"').replace("<svg ", '<svg style="position:absolute;left:0;top:0" ');
        C = canvasFor(g); pat = C.ctx.createPattern(texture(TEX[round % TEX.length]), "repeat");
        dot = g.el("div", "abs trail-start glow-soft"); dot.style.cssText = "left:" + (pts[0].x - 28) + "px;top:" + (pts[0].y - 28) + "px;width:56px;height:56px";
      }
      function paint(i) {
        var c = C.ctx; c.save(); c.strokeStyle = pat; c.lineWidth = r * 2; c.lineCap = "round"; c.lineJoin = "round";
        c.beginPath(); var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        c.moveTo(a.x, a.y); c.lineTo(pts[i].x, pts[i].y); c.lineTo(b.x, b.y); c.stroke(); c.restore();
      }
      async function finish() {
        done = true; if (dot) { dot.remove(); dot = null; }
        for (var i = 0; i < pts.length; i++) paint(i);
        var key = TEX[round % TEX.length];
        HW.audio.sfx("grow");
        await g.name(key);
        await g.praise(null);
        await g.wait(900);
        round++; build();
      }
      var down = false, lastNote = 0;
      function touch(ev) {
        if (done) return;
        var s = g.size(), x = ev.clientX - s.left, y = ev.clientY - s.top, i = near(pts, x, y, r * 1.4);
        if (i < 0) return;
        if (dot) { dot.remove(); dot = null; }
        for (var k = Math.max(0, i - 2); k <= Math.min(pts.length - 1, i + 2); k++) { if (!hit[k]) { hit[k] = true; count++; } paint(k); }
        if (Date.now() - lastNote > 160) { lastNote = Date.now(); HW.audio.sfx("note", Math.round(i / pts.length * (HW.audio.pentaCount - 1))); }
        if (count > pts.length * 0.85) finish();
      }
      g.stage.addEventListener("pointerdown", function (ev) { if (!g.alive) return; down = true; HW.audio.unlock(); touch(ev); });
      g.stage.addEventListener("pointermove", function (ev) { if (g.alive && (down || ev.pointerType === "touch")) touch(ev); });
      function up() { down = false; }
      window.addEventListener("pointerup", up); g.onCleanup(function () { window.removeEventListener("pointerup", up); });
      build();
    }
  });

  /* ================= 45 Drive the road ================= */
  HW.registerGame({
    id: "road", title: "Drive the road", desc: "Move your finger along the road to drive the car home",
    world: "cars", worlds: ["cars"], bg: "garden", voice: ["home", "star", "car"],
    icon: function () { return HW.img("house"); },
    start: function (g) {
      var round = 0, pts = [], at = 0, car = null, house = null, guide = null, done = false, stars = [], r = 34;
      function build() {
        [car, house, guide].forEach(function (e) { if (e) e.remove(); }); stars.forEach(function (e) { e.remove(); }); stars = [];
        var s = g.size(), pad = Math.min(s.w, s.h) * 0.14;
        r = Math.max(30, Math.min(s.w, s.h) * 0.08);
        pts = makePath(SHAPES[(round + 3) % SHAPES.length], { x: pad, y: pad, w: s.w - pad * 2.6, h: s.h - pad * 2 }, 120); at = 0; done = false;
        guide = g.el("div", "abs"); guide.style.cssText = "left:0;top:0;pointer-events:none";
        guide.innerHTML = svgPath(pts, s.w, s.h, 'stroke="#7c8496" stroke-width="' + r * 1.6 + '"');
        guide.innerHTML += svgPath(pts, s.w, s.h, 'stroke="#fff" stroke-width="5" stroke-dasharray="18 16" opacity=".85"').replace("<svg ", '<svg style="position:absolute;left:0;top:0" ');
        var e = pts[pts.length - 1], hs = r * 3;
        house = g.el("div", "abs"); house.style.cssText = "left:" + (e.x - hs * 0.2) + "px;top:" + (e.y - hs * 0.8) + "px;width:" + hs + "px;height:" + hs + "px;pointer-events:none";
        house.appendChild(HW.img("house"));
        var cw = r * 2.6;
        car = g.el("div", "abs road-car glow-soft"); car.style.cssText = "width:" + cw + "px;height:" + cw * 0.56 + "px;pointer-events:none";
        car.appendChild(HW.svgEl(A.car(A.COLOURS.red)));
        place();
      }
      function place() {
        var p = pts[at], q = pts[Math.min(pts.length - 1, at + 3)], ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
        var w = parseFloat(car.style.width), h = parseFloat(car.style.height);
        car.style.left = (p.x - w / 2) + "px"; car.style.top = (p.y - h * 0.7) + "px";
        car.style.transform = "rotate(" + Math.max(-35, Math.min(35, ang)) + "deg)";
      }
      async function home() {
        done = true; car.classList.remove("driving", "glow-soft");
        HW.audio.sfx("chime");
        await g.name("home");
        await g.praise(house);
        await g.wait(900);
        round++; build();
      }
      var down = false, lastStar = 0;
      function touch(ev) {
        if (done) return;
        var s = g.size(), x = ev.clientX - s.left, y = ev.clientY - s.top, best = -1, bd = (r * 1.5) * (r * 1.5);
        /* the car only moves forward, up to a short way ahead of where it is */
        for (var i = at + 1; i <= Math.min(pts.length - 1, at + 18); i++) { var dx = pts[i].x - x, dy = pts[i].y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
        if (best < 0) return;
        at = best; place(); car.classList.add("driving"); car.classList.remove("glow-soft");
        if (at - lastStar >= 15) {
          lastStar = at; var st = g.el("div", "abs road-star"); var z = r * 0.9;
          st.style.cssText = "left:" + (pts[at].x - z / 2) + "px;top:" + (pts[at].y - r * 1.6) + "px;width:" + z + "px;height:" + z + "px;pointer-events:none";
          st.appendChild(HW.svgEl(A.star())); stars.push(st); HW.audio.sfx("note", 2 + (stars.length % 7));
          g.anim(st, [{ scale: ".3", opacity: 0 }, { scale: "1", opacity: 1 }], { duration: 400 });
        }
        if (at >= pts.length - 2) home();
      }
      function up() { down = false; if (car) car.classList.remove("driving"); }
      g.stage.addEventListener("pointerdown", function (ev) { if (!g.alive) return; down = true; HW.audio.unlock(); lastStar = Math.min(lastStar, at); touch(ev); });
      g.stage.addEventListener("pointermove", function (ev) { if (g.alive && (down || ev.pointerType === "touch")) touch(ev); });
      window.addEventListener("pointerup", up); g.onCleanup(function () { window.removeEventListener("pointerup", up); });
      build();
      g.later(500, function () { g.name("car"); });
    }
  });

  /* ================= 46 Heavy and light ================= */
  var THINGS = { feather: "light", leaf: "light", balloon: "light", rock: "heavy", watermelon: "heavy", pumpkin: "heavy" };
  HW.registerGame({
    id: "heavy", title: "Heavy and light", desc: "Tap each one and watch it fall or float",
    world: "weather", worlds: ["weather", "shapes"], bg: "day", voice: ["heavy", "light", "feather", "leaf", "balloon", "rock", "watermelon", "pumpkin"],
    icon: function () { return HW.img("feather"); },
    start: function (g) {
      var sets = [["feather", "rock", "balloon"], ["leaf", "watermelon", "feather"], ["balloon", "pumpkin", "leaf"], ["rock", "feather", "watermelon"]], si = 0, left = 0, items = [];
      var floor = g.el("div", "abs"); floor.style.cssText = "left:0;right:0;bottom:0;height:14%;background:#a8d39b;border-top:6px solid #8fc283";
      var shelf = g.el("div", "abs heavy-shelf");
      function lay() {
        items.forEach(function (b) { b.remove(); }); items = [];
        var s = g.size(), set = sets[si % sets.length], z = Math.min(s.w * 0.24, s.h * 0.2, 170);
        shelf.style.cssText = "left:6%;right:6%;top:" + (s.h * 0.08 + z) + "px;height:12px";
        left = set.length;
        set.forEach(function (k, i) {
          var b = g.el("button", "abs heavy-item"); b.setAttribute("aria-label", HW.word(k));
          b.style.cssText = "left:" + (s.w * (i + 1) / (set.length + 1) - z / 2) + "px;top:" + s.h * 0.08 + "px;width:" + z + "px;height:" + z + "px";
          b.appendChild(HW.picture(k)); b._key = k;
          g.tap(b, function () { drop(b); }, 500);
          items.push(b);
        });
      }
      async function drop(b) {
        if (b._gone) return;
        b._gone = true;
        var s = g.size(), c = g.centre(b), kind = THINGS[b._key], fall = s.h * 0.86 - c.y - c.h * 0.45;
        g.name(b._key);
        if (b._key === "balloon") {
          HW.audio.sfx("whoosh", 2);
          await g.anim(b, [{ transform: "none" }, { transform: "translate(20px," + (-c.y - c.h) + "px)" }], { duration: 3000, easing: "ease-in" });
        } else if (kind === "light") {
          HW.audio.sfx("whoosh", 2.4);
          await g.anim(b, [{ transform: "none" }, { transform: "translate(40px," + fall * 0.3 + "px) rotate(20deg)" }, { transform: "translate(-40px," + fall * 0.65 + "px) rotate(-20deg)" }, { transform: "translate(10px," + fall + "px) rotate(8deg)" }], { duration: 3600, easing: "ease-in-out" });
        } else {
          await g.anim(b, [{ transform: "none" }, { transform: "translateY(" + fall + "px)" }], { duration: 650, easing: "cubic-bezier(.5,0,.9,.6)" });
          HW.audio.sfx("drum"); g.bounce(b);
        }
        g.show(kind); await g.say(kind);
        left--;
        if (left === 0) {
          g.busy = true;
          await g.praise(null);
          await g.wait(800);
          si++; g.busy = false; lay();
        }
      }
      lay();
    }
  });

  /* ================= 47 Alien moves ================= */
  var MOVES = ["jump", "spin", "dance", "sleep", "wave"];
  var UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 40V10M12 22 24 9l12 13" fill="none" stroke="#3f7fdc" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SPIN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M38 24a14 14 0 1 1-6-11.5" fill="none" stroke="#8e5cc7" stroke-width="6" stroke-linecap="round"/><path d="M33 5v9h-9" fill="none" stroke="#8e5cc7" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  HW.registerGame({
    id: "actions", title: "Alien moves", desc: "Tap a word and the alien does it",
    world: "planets", worlds: ["planets", "music", "letters"], bg: "space", voice: MOVES,
    icon: function () { return HW.img("wave"); },
    start: function (g) {
      var s = g.size(), size = Math.min(s.w * 0.5, s.h * 0.42, 300), taps = 0, moving = false;
      var box = g.el("div", "abs"); box.style.cssText = "left:" + (s.w / 2 - size / 2) + "px;top:" + s.h * 0.08 + "px;width:" + size + "px;height:" + size * 1.05 + "px";
      var body = HW.el("div", "alien-body", box); body.appendChild(HW.svgEl(A.alien()));
      var extra = HW.el("div", "alien-extra", box);
      var row = g.el("div", "choices n5");
      var ICONS = { jump: function () { return HW.svgEl(UP); }, spin: function () { return HW.svgEl(SPIN); }, dance: function () { return HW.img("note"); }, sleep: function () { return HW.img("zzz"); }, wave: function () { return HW.img("wave"); } };
      MOVES.forEach(function (m) {
        var b = HW.el("button", "choice", row); b.setAttribute("aria-label", HW.word(m)); b.appendChild(ICONS[m]());
        g.tap(b, async function () {
          if (moving) return;
          moving = true; g.bounce(b); taps++;
          g.show(m); g.say(m);
          await act(m);
          moving = false;
          if (taps % 6 === 0) g.praise(box);
        }, 500);
      });
      async function act(m) {
        extra.innerHTML = "";
        if (m === "jump") { HW.audio.sfx("reveal"); await g.anim(body, [{ transform: "none" }, { transform: "translateY(-40%) scale(1.05,.95)", offset: 0.45 }, { transform: "none" }], { duration: 900, easing: "ease-in-out" }); }
        else if (m === "spin") { HW.audio.sfx("whoosh", 1); await g.anim(body, [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 1100 }); }
        else if (m === "dance") {
          HW.audio.sfx("note", 4); g.later(300, function () { HW.audio.sfx("note", 6); }); g.later(600, function () { HW.audio.sfx("note", 8); });
          await g.anim(body, [{ transform: "none" }, { transform: "rotate(-12deg) translateX(-10%)" }, { transform: "rotate(12deg) translateX(10%)" }, { transform: "rotate(-12deg) translateX(-10%)" }, { transform: "none" }], { duration: 1400 });
        } else if (m === "sleep") {
          var z = HW.img("zzz"); z.className = "alien-zzz"; extra.appendChild(z);
          body.classList.add("asleep");
          await g.anim(body, [{ transform: "none" }, { transform: "rotate(-14deg)" }], { duration: 700 });
          await g.wait(1600);
          await g.anim(body, [{ transform: "rotate(-14deg)" }, { transform: "none" }], { duration: 600 });
          body.classList.remove("asleep"); extra.innerHTML = "";
        } else {
          var h = HW.img("wave"); h.className = "alien-hand"; extra.appendChild(h);
          await g.anim(h, [{ transform: "rotate(-20deg)" }, { transform: "rotate(20deg)" }, { transform: "rotate(-20deg)" }, { transform: "rotate(20deg)" }, { transform: "none" }], { duration: 1400 });
          extra.innerHTML = "";
        }
      }
      g.later(500, function () { g.glow(row.children[0], true); g.later(3000, function () { g.glow(row.children[0], false); }); });
    }
  });

  /* ================= 48 Morning time ================= */
  var STEPS = [["wakeup", "sunface"], ["teeth", "toothbrush"], ["dressed", "tshirt"], ["breakfast", "bowl"], ["shoes", "shoes"]];
  HW.registerGame({
    id: "routine", title: "Morning time", desc: "First this, then that, then play time",
    world: "calm", worlds: ["calm", "letters"], bg: "day", voice: ["first", "then", "playtime"].concat(STEPS.map(function (x) { return x[0]; })),
    icon: function () { return HW.img("toothbrush"); },
    start: function (g) {
      var step = 0, firstCard = null, thenCard = null, track = null;
      function card(cls, label, img) {
        var b = g.el("button", "abs ft-card " + cls);
        HW.el("div", "ft-label", b).textContent = label;
        var pic = HW.el("div", "ft-pic", b); pic.appendChild(HW.img(img));
        return b;
      }
      function layout() {
        var s = g.size(), port = s.w < s.h, cw = port ? Math.min(s.w * 0.42, s.h * 0.3, 260) : Math.min(s.w * 0.3, s.h * 0.56, 300);
        var top = port ? s.h * 0.1 : s.h * 0.08, gap = Math.min(s.w * 0.06, 40);
        [firstCard, thenCard].forEach(function (c, i) {
          c.style.width = cw + "px"; c.style.height = cw * 1.25 + "px"; c.style.top = top + "px";
          c.style.left = (s.w / 2 + (i === 0 ? -cw - gap / 2 : gap / 2)) + "px";
        });
      }
      function show() {
        if (firstCard) firstCard.remove(); if (thenCard) thenCard.remove();
        var cur = STEPS[step], nxt = STEPS[step + 1] || ["playtime", "teddy"];
        firstCard = card("ft-first glow", "First", cur[1]); firstCard.setAttribute("aria-label", HW.word(cur[0]));
        thenCard = card("ft-then", "Then", nxt[1]); thenCard.setAttribute("aria-label", HW.word(nxt[0]));
        layout();
        track.querySelectorAll(".ft-dot").forEach(function (d, i) { d.classList.toggle("done", i < step); d.classList.toggle("now", i === step); });
        g.tap(firstCard, doStep, 900);
        g.tap(thenCard, function () { g.wiggle(thenCard); g.glow(firstCard, true); g.name(cur[0]); }, 700);
        g.later(300, async function () { g.show("first", 1200); await g.say("first"); g.show(cur[0]); await g.say(cur[0]); });
      }
      async function doStep() {
        if (g.busy) return;
        g.busy = true; g.glow(firstCard, false); g.bounce(firstCard);
        HW.audio.sfx("sparkle");
        firstCard.classList.add("ticked");
        await g.name(STEPS[step][0]);
        await g.wait(400);
        step++;
        if (step < STEPS.length) { g.busy = false; show(); return; }
        /* all done: play time */
        firstCard.remove(); thenCard.remove();
        track.querySelectorAll(".ft-dot").forEach(function (d) { d.classList.add("done"); d.classList.remove("now"); });
        var s = g.size(), z = Math.min(s.w * 0.5, s.h * 0.45, 320);
        var teddy = g.el("button", "abs"); teddy.setAttribute("aria-label", "Teddy");
        teddy.style.cssText = "left:" + (s.w / 2 - z / 2) + "px;top:" + s.h * 0.1 + "px;width:" + z + "px;height:" + z + "px";
        teddy.appendChild(HW.img("teddy"));
        g.tap(teddy, function () { g.bounce(teddy); HW.audio.sfx("note", HW.randInt(3, 9)); g.sparkle(teddy); }, 300);
        g.show("playtime"); await g.say("playtime");
        await g.praise(teddy);
        await g.wait(4000);
        teddy.remove(); step = 0; g.busy = false; show();
      }
      track = g.el("div", "abs ft-track");
      STEPS.forEach(function (st) { var d = HW.el("div", "ft-dot", track); d.appendChild(HW.img(st[1])); });
      var end = HW.el("div", "ft-dot ft-end", track); end.appendChild(HW.img("teddy"));
      g.onResize(function () { if (firstCard && firstCard.isConnected) layout(); });
      show();
    },
    keepOnResize: true
  });
})();
