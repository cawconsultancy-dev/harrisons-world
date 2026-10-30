/* Harrison's World: games 37 to 43, and stickers for Space bubbles.
   Same rules as every other game: no timers, no scores, nothing marked wrong. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art;
  function portrait(g) { var s = g.size(); return s.w < s.h * 1.05; }

  /* ================= Space bubbles: each popped bubble leaves a sticker ================= */
  (function () {
    var def = HW.gameById.bubbles; if (!def) return;
    var STICKERS = ["star", "saturn", "earth", "moon", "rocket", "clownfish", "jupiter", "mars"];
    var inner = def.start;
    def.voice = def.voice.concat(["sticker"]);
    def.desc = "Pop the slow bubbles to collect stickers";
    def.start = function (g) {
      var shelf = g.el("div", "sticker-shelf"), got = 0;
      g.stickerAt = function (bubble) {
        var key = STICKERS[got % STICKERS.length]; got++;
        var st = HW.el("div", "sticker", shelf); st.appendChild(HW.picture(key)); st.style.opacity = 0;
        while (shelf.children.length > 10) shelf.removeChild(shelf.firstChild);
        var from = g.centre(bubble), to = g.centre(st);
        var fly = g.el("div", "abs sticker fly"); fly.appendChild(HW.picture(key));
        fly.style.left = (to.x - to.w / 2) + "px"; fly.style.top = (to.y - to.h / 2) + "px";
        fly.style.width = to.w + "px"; fly.style.height = to.h + "px";
        g.anim(fly, [{ transform: "translate(" + (from.x - to.x) + "px," + (from.y - to.y) + "px) scale(1.6)" }, { transform: "none" }], { duration: 900 })
          .then(function () { st.style.opacity = 1; fly.remove(); g.bounce(st); });
        if (got === 1) g.later(500, function () { g.show("sticker", 1500); g.say("sticker"); });
      };
      inner(g);
    };
  })();

  /* ================= 37 Picture strips ================= */
  HW.registerGame({
    id: "strips", title: "Picture strips", desc: "Tap the three strips to make the picture",
    world: "cars", worlds: ["cars", "planets", "sea", "shapes"], bg: "kitchen",
    voice: ["car", "saturn", "earth", "rocket", "bus", "tractor", "clownfish", "whale", "turtle"],
    icon: function () { return HW.img("puzzle"); },
    start: function (g) {
      var POOL = ["car", "saturn", "rocket", "clownfish", "bus", "earth", "whale", "tractor", "turtle"], pi = 0, row = null;
      var board = g.el("div", "abs strip-board");
      function layoutBoard() {
        var s = g.size(), w = Math.min(s.w * 0.86, s.h * 0.52, 420);
        board.style.cssText = "left:" + (s.w / 2 - w / 2) + "px;top:" + Math.max(10, s.h * 0.04) + "px;width:" + w + "px;height:" + w + "px";
      }
      function strip(key, k, inButton) {
        var box = document.createElement("div"); box.className = "strip-box";
        var p = HW.picture(key);
        p.style.cssText = "position:absolute;left:6%;top:6%;width:88%;height:88%;clip-path:inset(0 " + (2 - k) * 33.34 + "% 0 " + k * 33.33 + "%)" +
          (inButton ? ";transform:translateX(" + (1 - k) * 33.33 + "%) scale(1.25)" : "");
        box.appendChild(p); return box;
      }
      function round() {
        if (row) row.remove();
        layoutBoard();
        var key = POOL[pi % POOL.length], placed = 0;
        board.innerHTML = "";
        /* a faint copy of the whole picture shows what he is making */
        var ghost = HW.picture(key); ghost.classList.add("strip-ghost"); board.appendChild(ghost);
        var slots = [0, 1, 2].map(function (k) { var sl = HW.el("div", "strip-slot", board); sl.style.left = (k * 33.33) + "%"; return sl; });
        var layers = [0, 1, 2].map(function (k) { var l = strip(key, k, false); l.classList.add("strip-layer"); board.appendChild(l); return l; });
        row = g.el("div", "choices n3");
        HW.shuffle([0, 1, 2]).forEach(function (k) {
          var b = HW.el("button", "choice", row); b.setAttribute("aria-label", "Picture strip");
          b.appendChild(strip(key, k, true));
          g.tap(b, async function () {
            if (b._used) return;
            b._used = true; HW.audio.sfx("note", 3 + placed);
            var t = g.centre(slots[k]), c = g.centre(b);
            await g.flyToPoint(b, t.x, t.y, 650, Math.min(t.w / c.w * 2, 1.4));
            b.classList.add("gone"); layers[k].classList.add("on"); slots[k].classList.add("filled");
            placed++;
            if (placed === 3) {
              g.busy = true;
              await g.wait(400);
              board.classList.add("done"); g.bounce(board);
              await g.name(key);
              await g.praise(board);
              await g.wait(700);
              board.classList.remove("done"); pi++; g.busy = false; round();
            }
          }, 500);
        });
      }
      round();
    }
  });

  /* ================= 38 Breathe with me ================= */
  HW.registerGame({
    id: "breathe", title: "Breathe with me", desc: "Tap the bubble and breathe in and out slowly",
    world: "calm", worlds: ["calm", "dinner"], bg: "night", voice: ["breathein", "breatheout", "more_q", "more", "welldone"],
    icon: function () { return HW.svgEl(A.breathBall()); },
    start: function (g) {
      var s = g.size(), size = Math.min(s.w * 0.62, s.h * 0.5, 380), going = false;
      var ball = g.el("button", "abs breath-ball glow-soft"); ball.setAttribute("aria-label", "Breathing bubble");
      ball.style.cssText = "left:" + (s.w / 2 - size / 2) + "px;top:" + (s.h * 0.45 - size / 2) + "px;width:" + size + "px;height:" + size + "px";
      var inner = HW.el("div", "breath-inner", ball); inner.appendChild(HW.svgEl(A.breathBall()));
      var calm = HW.reducedMotion();
      function grow(on, ms) {
        /* with less movement, the bubble brightens and dims instead of growing */
        var frames = calm ? [{ filter: on ? "brightness(.8)" : "brightness(1.25)" }, { filter: on ? "brightness(1.25)" : "brightness(.8)" }]
                          : [{ transform: on ? "scale(.6)" : "scale(1)" }, { transform: on ? "scale(1)" : "scale(.6)" }];
        return g.anim(inner, frames, { duration: ms, easing: "ease-in-out", always: true });
      }
      inner.style.transform = calm ? "" : "scale(.6)";
      async function breathe() {
        if (going) return;
        going = true; g.glow(ball, false);
        for (var i = 0; i < 3; i++) {
          g.show("breathein", 3800); g.say("breathein"); HW.audio.sfx("whoosh", 3.6);
          await grow(true, 4000);
          await g.wait(500);
          g.show("breatheout", 4800); g.say("breatheout");
          await grow(false, 5000);
          await g.wait(600);
        }
        await g.praise(ball);
        going = false; g.glow(ball, true, true);
      }
      g.tap(ball, breathe, 800);
    }
  });

  /* ================= 39 Pop-up garden ================= */
  HW.registerGame({
    id: "popup", title: "Pop-up garden", desc: "Tap the vegetable when it pops up",
    world: "fruitveg", worlds: ["fruitveg", "dinner"], bg: "garden",
    voice: ["carrot", "broccoli", "peas", "sweetcorn", "tomato", "potato", "pumpkin", "pepper"],
    icon: function () { return HW.img("carrot"); },
    start: function (g) {
      var VEG = ["carrot", "broccoli", "pumpkin", "sweetcorn", "tomato", "potato", "pepper", "peas"], vi = 0, taps = 0, lastHole = -1;
      var s = g.size(), port = portrait(g);
      var SPOTS = port ? [[25, 58], [75, 58], [50, 74], [25, 90], [75, 90]] : [[18, 66], [50, 62], [82, 66], [32, 88], [68, 88]];
      var w = Math.min(s.w * (port ? 0.34 : 0.2), s.h * (port ? 0.17 : 0.3), 220);
      var holes = SPOTS.map(function (p) {
        var cx = s.w * p[0] / 100, cy = s.h * p[1] / 100 - w * 0.12;
        var back = g.el("div", "abs"); back.style.cssText = "left:" + (cx - w / 2) + "px;top:" + (cy - w * 0.15) + "px;width:" + w + "px;height:" + w * 0.3 + "px";
        back.appendChild(HW.svgEl(A.holeBack()));
        var clip = g.el("div", "abs veg-clip"); clip.style.cssText = "left:" + (cx - w / 2) + "px;top:" + (cy - w * 0.95) + "px;width:" + w + "px;height:" + w * 0.95 + "px";
        var btn = HW.el("button", "veg-pop", clip); btn.setAttribute("aria-label", "Vegetable");
        var front = g.el("div", "abs"); front.style.cssText = "left:" + (cx - w / 2) + "px;top:" + (cy - w * 0.12) + "px;width:" + w + "px;height:" + w * 0.3 + "px;pointer-events:none";
        front.appendChild(HW.svgEl(A.holeFront()));
        return { clip: clip, btn: btn, up: false };
      });
      async function popUp() {
        var h; do { h = HW.randInt(0, holes.length - 1); } while (h === lastHole);
        lastHole = h;
        var H = holes[h], key = VEG[vi % VEG.length]; vi++;
        H.btn.innerHTML = ""; H.btn.appendChild(HW.picture(key)); H.btn._key = key; H.btn.setAttribute("aria-label", HW.word(key));
        H.up = true; H.btn.classList.add("up");
        HW.audio.sfx("grow");
      }
      holes.forEach(function (H) {
        g.tap(H.btn, async function () {
          if (!H.up || g.busy) return;
          H.up = false; g.busy = true;
          g.bounce(H.btn.firstChild); HW.audio.sfx("pop"); taps++;
          await g.name(H.btn._key);
          H.btn.classList.remove("up");
          if (taps % 5 === 0) await g.praise(H.clip);
          await g.wait(700);
          g.busy = false; popUp();
        }, 400);
      });
      g.later(900, popUp);
    }
  });

  /* ================= 40 Car patterns ================= */
  HW.registerGame({
    id: "patterns", title: "Car patterns", desc: "Which car comes next in the line?",
    world: "cars", worlds: ["cars", "shapes", "numbers"], bg: "day", voice: ["red", "blue", "yellow", "green", "purple", "orange"],
    icon: function () { return HW.svgEl(A.car(A.COLOURS.blue)); },
    start: function (g) {
      var SETS = [["red", "blue"], ["yellow", "green"], ["blue", "orange"], ["purple", "yellow"], ["green", "red", "blue"], ["orange", "purple", "yellow"]];
      var r = 0, row = null, line = null;
      var road = g.el("div", "abs pattern-road");
      function build() {
        if (row) row.remove(); if (line) line.remove();
        var set = SETS[r % SETS.length], len = set.length === 2 ? 5 : 6, seq = [];
        for (var i = 0; i < len; i++) seq.push(set[i % set.length]);
        var answer = seq[len - 1], s = g.size();
        var cw = Math.min((s.w * 0.94) / len - 6, 150), ch = cw * 0.56, y = s.h * (portrait(g) ? 0.3 : 0.26);
        road.style.cssText = "left:0;right:0;top:" + (y + ch * 0.8) + "px;height:" + Math.max(18, ch * 0.3) + "px";
        line = g.el("div", "abs pattern-line"); line.style.cssText = "left:" + (s.w / 2 - (len * (cw + 6)) / 2) + "px;top:" + y + "px;height:" + ch + "px";
        var cars = seq.map(function (c, i) {
          var d = HW.el("div", "pattern-car" + (i === len - 1 ? " gap glow-soft" : ""), line); d.style.width = cw + "px"; d.style.height = ch + "px";
          if (i < len - 1) d.appendChild(HW.svgEl(A.car(A.COLOURS[c])));
          return d;
        });
        /* each car bounces in turn with a note, so the pattern can be heard as well as seen */
        cars.slice(0, -1).forEach(function (d, i) { g.later(300 + i * 520, function () { g.bounce(d); HW.audio.sfx("note", set.indexOf(seq[i]) * 2 + 3); }); });
        var opts = HW.shuffle(set.filter(function (c) { return c !== answer; })).slice(0, HW.settings.choices - 1);
        var items = HW.shuffle([answer].concat(opts)), right = null;
        row = g.choices(items, function (c) { return HW.svgEl(A.car(A.COLOURS[c])); }, async function (c, btn, btns) {
          if (c !== answer) { g.help(btn, right, answer); return; }
          g.busy = true; g.glow(btn, false);
          btns.forEach(function (b) { if (b !== btn) b.classList.add("gone"); });
          var gap = cars[len - 1], t = g.centre(gap), cc = g.centre(btn);
          await g.flyToPoint(btn, t.x, t.y, 800, t.w / cc.w);
          gap.classList.remove("gap", "glow-soft"); gap.appendChild(HW.svgEl(A.car(A.COLOURS[c]))); btn.classList.add("gone");
          await g.name(c);
          await g.praise(gap);
          line.classList.add("driving"); HW.audio.sfx("engine", 1.6);
          await g.anim(line, [{ transform: "none" }, { transform: "translateX(" + (s.w * 1.1) + "px)" }], { duration: 1600, easing: "ease-in" });
          r++; g.busy = false; build();
        });
        right = row._btns[items.indexOf(answer)];
      }
      build();
    }
  });

  /* ================= 41 Sorting ================= */
  var SORTS = [
    { a: "fruit", b: "veg", ai: "apple", bi: "carrot", A: ["apple", "banana", "strawberry", "grapes", "pear", "cherries", "orange", "watermelon"], B: ["carrot", "broccoli", "peas", "sweetcorn", "potato", "cucumber", "pepper", "pumpkin"] },
    { a: "red", b: "yellow", colour: true, A: ["apple", "strawberry", "tomato", "cherries"], B: ["banana", "lemon", "sweetcorn", "star"] }
  ];
  HW.registerGame({
    id: "sorting", title: "Sorting", desc: "Put each one in the right basket",
    world: "fruitveg", worlds: ["fruitveg", "shapes"], bg: "kitchen",
    voice: ["fruit", "veg", "red", "yellow", "apple", "banana", "strawberry", "grapes", "pear", "cherries", "orange", "watermelon", "carrot", "broccoli", "peas", "sweetcorn", "potato", "cucumber", "pepper", "pumpkin", "tomato", "lemon", "star"],
    icon: function () { return HW.svgEl(A.basket()); },
    start: function (g) {
      var mode = 0, queue = [], item = null, bins = [], count = 0;
      function setup() {
        bins.forEach(function (b) { b.remove(); }); bins = [];
        var S = SORTS[mode % SORTS.length], s = g.size(), port = portrait(g);
        var bw = Math.min(s.w * (port ? 0.42 : 0.3), s.h * 0.32, 260);
        [["a", S.a, S.ai], ["b", S.b, S.bi]].forEach(function (d, i) {
          var b = g.el("button", "abs sort-bin"); b.setAttribute("aria-label", HW.word(d[1]));
          b.style.cssText = "width:" + bw + "px;height:" + bw * 0.92 + "px;bottom:4%;" + (i === 0 ? "left:" : "right:") + (port ? 4 : 10) + "%";
          var sign = HW.el("div", "sort-sign", b);
          if (S.colour) { sign.appendChild(HW.svgEl(A.paintPot(A.COLOURS[d[1]]))); }
          else sign.appendChild(HW.picture(d[2]));
          var bk = HW.el("div", "sort-basket", b); bk.appendChild(HW.svgEl(A.basket()));
          b._side = d[0]; b._key = d[1];
          g.tap(b, function () { drop(b); }, 600);
          bins.push(b);
        });
        queue = HW.shuffle(S.A.map(function (k) { return [k, "a"]; }).concat(S.B.map(function (k) { return [k, "b"]; }))).slice(0, 6);
        g.later(400, async function () { g.show(S.a); await g.say(S.a); g.show(S.b); await g.say(S.b); next(); });
      }
      function next() {
        if (item) item.remove();
        if (!queue.length) { finish(); return; }
        var q = queue.shift(), s = g.size(), z = Math.min(s.w * 0.36, s.h * 0.28, 220);
        item = g.el("div", "abs sort-item float"); item._key = q[0]; item._side = q[1];
        item.style.cssText = "left:" + (s.w / 2 - z / 2) + "px;top:" + s.h * 0.1 + "px;width:" + z + "px;height:" + z + "px";
        item.appendChild(HW.picture(q[0]));
        g.anim(item, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, always: true });
        g.name(q[0]);
      }
      async function drop(bin) {
        if (!item || g.busy) return;
        var right = bins.filter(function (b) { return b._side === item._side; })[0];
        if (bin !== right) { g.wiggle(bin); g.glow(right, true); g.name(right._key); return; }
        g.busy = true; g.glow(right, false); item.classList.remove("float");
        var t = g.centre(right);
        HW.audio.sfx("note", 3 + count % 5);
        await g.flyToPoint(item, t.x, t.y + t.h * 0.15, 700, 0.45);
        item.remove(); item = null; g.bounce(right); count++;
        await g.name(right._key);
        g.busy = false; next();
      }
      async function finish() {
        g.busy = true;
        await g.praise(null);
        await g.wait(600);
        mode++; g.busy = false; setup();
      }
      setup();
    }
  });

  /* ================= 42 Feelings faces ================= */
  HW.registerGame({
    id: "feelings", title: "Feelings faces", desc: "Tap a feeling and the face shows it",
    world: "calm", worlds: ["calm", "letters"], bg: "day", voice: A.FEELINGS,
    icon: function () { return HW.svgEl(A.face("happy")); },
    start: function (g) {
      var s = g.size(), size = Math.min(s.w * 0.7, s.h * 0.48, 380), cur = "happy", taps = 0;
      var face = g.el("button", "abs feel-face"); face.setAttribute("aria-label", "Face");
      face.style.cssText = "left:" + (s.w / 2 - size / 2) + "px;top:" + Math.max(10, s.h * 0.05) + "px;width:" + size + "px;height:" + size + "px";
      function draw(f) {
        var old = face.firstChild, n = HW.svgEl(A.face(f)); n.classList.add("feel-svg"); face.appendChild(n);
        if (old) { g.anim(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, always: true }).then(function () { old.remove(); }); }
      }
      draw(cur);
      var row = g.el("div", "choices n4");
      A.FEELINGS.forEach(function (f) {
        var b = HW.el("button", "choice", row); b.setAttribute("aria-label", HW.word(f));
        b.appendChild(HW.svgEl(A.face(f)));
        g.tap(b, async function () {
          row.querySelectorAll(".choice").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
          g.bounce(b); taps++;
          if (f !== cur) { cur = f; draw(f); HW.audio.sfx(f === "happy" ? "chime" : "note", f === "sad" ? 1 : 5); }
          g.bounce(face);
          await g.name(f);
          if (taps % 6 === 0) g.praise(face);
        }, 600);
      });
      row.firstChild.classList.add("on");
      g.tap(face, function () { g.bounce(face); g.name(cur); }, 700);
      g.later(400, function () { g.name("happy"); });
    }
  });

  /* ================= 43 Dress for the weather ================= */
  var OUTFITS = { sunny: ["sunhat", "sunglasses", "tshirt"], rain: ["coat", "wellies", "umbrella"], snow: ["coat", "scarf", "gloves"] };
  HW.registerGame({
    id: "dress", title: "Dress for the weather", desc: "Pick the right clothes for sun, rain, or snow",
    world: "weather", worlds: ["weather"], bg: "kitchen",
    voice: ["sunny", "rain", "snow", "sunhat", "sunglasses", "tshirt", "coat", "wellies", "umbrella", "scarf", "gloves"],
    icon: function () { return HW.img("coat"); },
    start: function (g) {
      var ORDER = ["sunny", "rain", "snow"], wi = 0, row = null, todo = [], weather = "";
      var s = g.size(), port = portrait(g);
      var ww = Math.min(port ? s.w * 0.4 : s.w * 0.26, s.h * 0.3, 240);
      var win = g.el("div", "abs dress-window"); win.style.cssText = "left:" + (port ? 12 : s.w * 0.06) + "px;top:12px;width:" + ww + "px;height:" + ww * 0.8 + "px;--d:" + ww * 0.8 + "px";
      /* the child stands clear of the weather window and the row of clothes */
      var choiceH = Math.max(110, Math.min(s.w * 0.34, s.h * 0.28, 230)), kh, kw, kx, ky;
      if (port) { ky = ww * 0.8 + 24; kh = Math.min(s.h - ky - choiceH - 44, s.w * 0.62 * 1.6); kw = kh / 1.6; kx = s.w / 2 - kw / 2; }
      else { kh = Math.min(s.h * 0.85, s.w * 0.28 * 1.6); kw = kh / 1.6; kx = s.w * 0.83 - kw / 2; ky = (s.h - kh) / 2; }
      var kid = g.el("div", "abs dress-kid"); kid.style.cssText = "left:" + kx + "px;top:" + ky + "px;width:" + kw + "px;height:" + kh + "px";
      kid.appendChild(HW.svgEl(A.kid()));
      function scene(k) {
        win.innerHTML = ""; win.className = "abs dress-window dw-" + k;
        if (k === "sunny") { var sun = HW.el("div", "dw-sun", win); sun.appendChild(HW.svgEl(A.sunRays())); }
        else {
          var cl = HW.el("div", "dw-cloud", win); cl.appendChild(HW.svgEl(A.greyCloud()));
          var lay = HW.el("div", k === "rain" ? "dw-fall rain-drops" : "dw-fall dw-snow", win);
          for (var i = 0; i < (k === "rain" ? 12 : 9); i++) {
            var d = k === "rain" ? HW.el("i", "", lay) : HW.svgEl(A.snowflake());
            if (k !== "rain") lay.appendChild(d);
            d.style.cssText = "--y:" + HW.rand(30, 85).toFixed(0) + "%;left:" + HW.rand(4, 90) + "%;animation-delay:-" + HW.rand(0, 6).toFixed(1) + "s" + (k === "rain" ? "" : ";width:16px;height:16px");
          }
        }
      }
      function wear(item) {
        var w = A.WEAR[item], el = HW.el("div", "worn worn-" + item, kid);
        el.style.cssText = "left:" + w[0] + "%;top:" + w[1] + "%;width:" + w[2] + "%";
        if (item === "gloves") { el.appendChild(HW.picture("gloves")); el.appendChild(HW.picture("gloves")); }
        else el.appendChild(HW.picture(item));
        return el;
      }
      function newWeather() {
        weather = ORDER[wi % ORDER.length]; wi++;
        kid.querySelectorAll(".worn").forEach(function (e) { e.remove(); });
        scene(weather); todo = OUTFITS[weather].slice();
        g.later(300, function () { g.name(weather); });
        g.later(1500, nextItem);
      }
      function nextItem() {
        if (row) row.remove();
        if (!todo.length) { done(); return; }
        var want = todo[0];
        var wrongPool = [].concat(OUTFITS.sunny, OUTFITS.rain, OUTFITS.snow).filter(function (k) { return OUTFITS[weather].indexOf(k) < 0; });
        var items = HW.shuffle([want].concat(HW.shuffle(wrongPool).slice(0, HW.settings.choices - 1))), right = null;
        row = g.choices(items, function (k) { return HW.picture(k); }, async function (k, btn, btns) {
          if (k !== want) { g.help(btn, right, want); return; }
          g.busy = true; g.glow(btn, false);
          btns.forEach(function (b) { if (b !== btn) b.classList.add("gone"); });
          var el = wear(k); el.style.opacity = 0;
          var t = g.centre(el), c = g.centre(btn);
          await g.flyToPoint(btn, t.x, t.y, 700, t.w / c.w);
          el.style.opacity = 1; btn.classList.add("gone"); g.bounce(el);
          HW.audio.sfx("sparkle");
          await g.name(k);
          todo.shift(); g.busy = false; nextItem();
        });
        right = row._btns[items.indexOf(want)];
      }
      async function done() {
        g.busy = true; g.bounce(kid);
        await g.name(weather);
        await g.praise(kid);
        await g.wait(900);
        g.busy = false; newWeather();
      }
      newWeather();
    }
  });

  /* earlier worlds that also suit the new games */
  var bub = HW.gameById.bubbles; if (bub && bub.worlds.indexOf("dinner") < 0) bub.worlds.push("dinner");
})();
