/* Harrison's World: games 21 to 25, under the sea. Real species, original drawings. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art;
  var SEA = ["clownfish", "turtle", "bluetang", "octopus", "seahorse", "starfish", "crab", "jellyfish", "whale", "pufferfish", "shark"];
  var SWIMMERS = ["clownfish", "bluetang", "pufferfish", "turtle"];
  HW.SEA = SEA;

  function seaFloor(g) {
    var sand = g.el("div", "abs"); sand.style.cssText = "left:0;right:0;bottom:0;height:9%;background:#f3dfae;border-top:4px solid #e8cf94";
    [6, 22, 84].forEach(function (x, i) {
      var w = g.el("div", "abs sway"); w.style.cssText = "left:" + x + "%;bottom:6%;width:min(9vmin,64px);aspect-ratio:80/220;animation-delay:-" + (i * 1.7) + "s";
      w.appendChild(HW.svgEl(A.seaweed()));
    });
  }

  /* a fish that swims slowly back and forth across the stage, turning at each side */
  function swimmer(g, key, y, x0) {
    var s = g.size(), w = Math.min(s.w * 0.26, s.h * 0.22, 190);
    var box = g.el("button", "abs swimmer"); box.setAttribute("aria-label", HW.word(key));
    box.style.cssText = "left:0;top:" + y + "px;width:" + w + "px;height:" + w * 0.72 + "px";
    var inner = HW.el("div", "float", box); inner.style.cssText = "width:100%;height:100%;animation-delay:-" + HW.rand(0, 4).toFixed(1) + "s";
    inner.appendChild(HW.picture(key));
    var L = 8, R = Math.max(L + 1, s.w - w - 8);
    x0 = Math.max(L, Math.min(R, x0 == null ? HW.rand(L, R) : x0 - w / 2));
    var d1 = R - x0, d2 = R - L, d3 = x0 - L, total = Math.max(1, d1 + d2 + d3), e = 0.0005;
    var o1 = Math.min(0.998, Math.max(0.001, d1 / total)), o2 = Math.min(0.999, Math.max(o1 + 0.001, (d1 + d2) / total));
    var speed = HW.reducedMotion() ? 30 : 55;
    if (box.animate) {
      box._anim = box.animate([
        { offset: 0, transform: "translateX(" + x0 + "px) scaleX(1)" },
        { offset: o1 - e, transform: "translateX(" + R + "px) scaleX(1)" },
        { offset: o1, transform: "translateX(" + R + "px) scaleX(-1)" },
        { offset: o2 - e, transform: "translateX(" + L + "px) scaleX(-1)" },
        { offset: o2, transform: "translateX(" + L + "px) scaleX(1)" },
        { offset: 1, transform: "translateX(" + x0 + "px) scaleX(1)" }
      ], { duration: (total / speed) * 1000, iterations: Infinity, easing: "linear" });
    } else { box.style.transform = "translateX(" + x0 + "px)"; }
    box._key = key; box._inner = inner;
    return box;
  }

  /* 21 --------------------------------------------------------------- */
  HW.registerGame({
    id: "seafriends", title: "Sea friends", desc: "One sea animal at a time, tap to hear its name",
    world: "sea", worlds: ["sea"], bg: "sea", voice: SEA,
    icon: function () { return HW.svgEl(A.clownfish()); },
    start: function (g) {
      var i = 0, taps = 0;
      seaFloor(g);
      var ring = g.el("div", "abs center"); ring.style.cssText += ";width:min(66vmin,460px);aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.22);border:4px solid rgba(255,255,255,.5)";
      var pic = HW.el("button", "abs", ring); pic.style.cssText = "inset:12%";
      var next = g.el("button", "abs big-btn btn-go"); next.style.cssText = "right:5%;bottom:12%;min-width:0;width:clamp(110px,22vmin,150px);padding:0";
      next.setAttribute("aria-label", "Next"); next.innerHTML = HW.icons.arrow;
      function show() {
        pic.innerHTML = ""; var p = HW.picture(SEA[i]); p.style.width = "100%"; p.style.height = "100%"; pic.appendChild(p);
        pic.setAttribute("aria-label", HW.word(SEA[i]));
        g.anim(pic, [{ transform: "translateX(40%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 500 });
        HW.audio.sfx("bubble");
        g.name(SEA[i]);
      }
      g.tap(pic, function () {
        g.bounce(pic); taps++;
        g.name(SEA[i]).then(function () { if (taps % 3 === 0) g.praise(pic); });
      });
      g.tap(next, async function () {
        HW.audio.sfx("click");
        await g.anim(pic, [{ transform: "none", opacity: 1 }, { transform: "translateX(-40%)", opacity: 0 }], { duration: 350 });
        i = (i + 1) % SEA.length; show();
      }, 700);
      g.later(300, show);
    }
  });

  /* 22 --------------------------------------------------------------- */
  HW.registerGame({
    id: "fishtank", title: "Fish tank", desc: "Tap the water and a fish swims in",
    world: "sea", worlds: ["sea", "calm"], bg: "sea", voice: SWIMMERS.concat(["fish"]),
    icon: function () { return HW.svgEl(A.pufferfish()); },
    start: function (g) {
      seaFloor(g);
      var fish = [], adds = 1;
      function add(x, y, key) {
        var s = g.size();
        var f = swimmer(g, key, Math.max(s.h * 0.06, Math.min(s.h * 0.68, y - s.h * 0.08)), x);
        f._inner.style.opacity = 0;
        g.anim(f._inner, [{ opacity: 0, scale: ".4" }, { opacity: 1, scale: "1" }], { duration: 700, always: true });
        g.tap(f, function () { HW.audio.sfx("bubble"); g.wiggle(f._inner); g.name(f._key); }, 500);
        fish.push(f);
        if (fish.length > 8) {
          var old = fish.shift();
          g.anim(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, always: true }).then(function () { old.remove(); });
        }
        return f;
      }
      g.tap(g.stage, function (ev) {
        if (ev.target.closest && ev.target.closest("button")) return;
        var s = g.size(), key = SWIMMERS[adds % SWIMMERS.length];
        adds++;
        HW.audio.sfx("note", HW.randInt(2, 8));
        add((ev.clientX || 0) - s.left, (ev.clientY || 0) - s.top, key);
        g.name(key);
      }, 300);
      /* slow bubbles drifting up from the sand */
      function bubble() {
        var s = g.size(), size = HW.rand(18, 34);
        var b = HW.svgEl(A.bubble(), "abs");
        b.style.cssText = "left:" + HW.rand(5, 92) + "%;bottom:6%;width:" + size + "px;height:" + size + "px;pointer-events:none;opacity:.8";
        g.stage.appendChild(b);
        g.anim(b, [{ transform: "translateY(0)" }, { transform: "translateY(" + (-s.h * 0.95) + "px)" }], { duration: 9000, easing: "linear", always: true }).then(function () { b.remove(); });
        g.later(HW.rand(2500, 4500), bubble);
      }
      var s = g.size();
      add(s.w * 0.3, s.h * 0.4, "clownfish");
      g.later(800, function () { g.name("fish"); });
      g.later(1500, bubble);
    }
  });

  /* 23 --------------------------------------------------------------- */
  /* Each round has a different number of hungry fish. One shake of the pot feeds one fish,
     and Emma counts them. When every fish is fed, new fish swim in. */
  var FEED_ROUNDS = [2, 3, 4, 3, 5, 2, 4, 5];
  HW.registerGame({
    id: "feedfish", title: "Feed the fish", desc: "Shake the food once for every hungry fish",
    world: "sea", worlds: ["sea", "fruitveg", "numbers"], bg: "sea", voice: ["hungry", "yum", "fish", "one", "two", "three", "four", "five"],
    icon: function () { return HW.svgEl(A.foodPot()); },
    start: function (g) {
      seaFloor(g);
      var fish = [], fed = 0, r = 0, feeding = false;
      var pot = g.el("button", "abs"); pot.setAttribute("aria-label", "Fish food");
      pot.style.cssText = "left:50%;top:3%;transform:translateX(-50%);width:clamp(110px,20vmin,160px);aspect-ratio:120/140;z-index:5";
      pot._baseTransform = "translateX(-50%)";
      pot.appendChild(HW.svgEl(A.foodPot()));
      var NUMS = ["one", "two", "three", "four", "five"];
      function newRound() {
        fish.forEach(function (f) { f.remove(); }); fish = []; fed = 0; feeding = false;
        var n = FEED_ROUNDS[r % FEED_ROUNDS.length], s = g.size();
        for (var i = 0; i < n; i++) {
          var k = SWIMMERS[(i + r) % SWIMMERS.length];
          var f = swimmer(g, k, s.h * (0.3 + (i % 3) * 0.17) + (i > 2 ? s.h * 0.08 : 0), s.w * (0.15 + 0.7 * i / Math.max(1, n - 1)));
          f.style.pointerEvents = "none"; f._inner.classList.add("hungry-fish");
          g.anim(f._inner, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, always: true });
          fish.push(f);
        }
        g.glow(pot, true, true);
        g.later(400, function () { g.show("hungry"); g.say("hungry"); });
      }
      async function shake() {
        if (feeding || fed >= fish.length) return;
        feeding = true;
        var target = fish[fed];
        g.wiggle(pot); HW.audio.sfx("shake");
        var st = g.size(), c = g.centre(pot), t = g.centre(target);
        for (var i = 0; i < 6; i++) {
          var fl = g.el("div", "abs"); var z = HW.rand(9, 15);
          fl.style.cssText = "width:" + z + "px;height:" + z + "px;border-radius:40%;background:" + HW.pick(["#e08a2e", "#f2c53d", "#d9653a"]) + ";left:" + (t.x + HW.rand(-30, 30)) + "px;top:" + (c.y + c.h * 0.4) + "px;pointer-events:none;z-index:4";
          (function (el, k) {
            g.anim(el, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(" + Math.max(20, t.y - c.y - c.h * 0.4) + "px)", opacity: 0 }], { duration: 1100 + k * 80, easing: "ease-in", always: true }).then(function () { el.remove(); });
          })(fl, i);
        }
        await g.wait(1000);
        HW.audio.sfx("munch");
        target._inner.classList.remove("hungry-fish"); g.bounce(target._inner);
        fed++;
        g.show(NUMS[fed - 1], 1400); await g.say(NUMS[fed - 1]);
        feeding = false;
        if (fed === fish.length) {
          g.glow(pot, false);
          g.show("yum"); await g.say("yum");
          await g.praise(fish[0]);
          await g.wait(500);
          await Promise.all(fish.map(function (f) { return g.anim(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, always: true }); }));
          r++; newRound();
        }
      }
      g.tap(pot, shake, 600);
      newRound();
    }
  });

  /* 24 --------------------------------------------------------------- */
  HW.registerGame({
    id: "colourfish", title: "Colour the fish", desc: "Tap a paint pot and the fish changes colour",
    world: "sea", worlds: ["sea"], bg: "sea", voice: ["fish", "red", "yellow", "blue", "green", "orange", "purple"],
    icon: function () { return HW.svgEl(A.genericFish("#f2c53d")); },
    start: function (g) {
      seaFloor(g);
      var names = Object.keys(A.COLOURS), current = "", paints = 0, row = null;
      var box = g.el("div", "abs"); box.style.cssText = "left:50%;top:8%;transform:translateX(-50%);width:min(80vw,58vh,560px);aspect-ratio:200/140";
      box._baseTransform = "translateX(-50%)";
      var inner = HW.el("div", "float", box); inner.style.cssText = "width:100%;height:100%";
      inner.appendChild(HW.svgEl(A.genericFish("#e7eaf0")));
      var parts = box.querySelectorAll(".fish-paint");
      parts.forEach(function (p) { p.style.transition = "fill .8s ease"; });
      function pots() {
        if (row) row.remove();
        var set = HW.shuffle(names.filter(function (n) { return n !== current; })).slice(0, 3);
        row = g.choices(set, function (n) { return HW.svgEl(A.paintPot(A.COLOURS[n])); }, async function (n, btn) {
          g.busy = true; g.bounce(btn);
          parts.forEach(function (p) { p.style.fill = A.COLOURS[n]; });
          current = n; HW.audio.sfx("sparkle"); g.bounce(inner);
          await g.name(n);
          paints++;
          if (paints % 3 === 0) await g.praise(box);
          g.busy = false; pots();
        });
      }
      pots();
      g.later(400, function () { g.name("fish"); });
    }
  });

  /* 25 --------------------------------------------------------------- */
  HW.registerGame({
    id: "fishhome", title: "Fish home", desc: "Tap each fish and it swims home: one, two, three",
    world: "sea", worlds: ["sea"], bg: "sea", voice: ["one", "two", "three", "four", "five"].concat(SWIMMERS),
    icon: function () { return HW.svgEl(A.coral()); },
    start: function (g) {
      seaFloor(g);
      var NUMS = ["one", "two", "three", "four", "five"], t = 0, count = 0, items = [];
      var home = g.el("div", "abs"); home.style.cssText = "left:50%;bottom:5%;transform:translateX(-50%);width:min(64vw,44vh,400px);aspect-ratio:260/200;z-index:3";
      home.appendChild(HW.svgEl(A.coral()));
      function build() {
        items.forEach(function (b) { b.remove(); }); items = []; count = 0;
        var n = HW.settings.countTo, key = SWIMMERS[t % SWIMMERS.length], s = g.size();
        var w = Math.min(s.w * 0.86 / n, s.h * 0.24, 180);
        for (var i = 0; i < n; i++) {
          var b = g.el("button", "abs"); b.setAttribute("aria-label", HW.word(key));
          b.style.cssText = "left:calc(" + (100 / (n + 1)) * (i + 1) + "% - " + w / 2 + "px);top:" + (i % 2 ? 22 : 10) + "%;width:" + w + "px;height:" + w * 0.72 + "px;z-index:2";
          var inner = HW.el("div", "float", b); inner.style.cssText = "width:100%;height:100%;animation-delay:-" + i + "s";
          inner.appendChild(HW.picture(key));
          (function (btn) { g.tap(btn, function () { take(btn); }); })(b);
          items.push(b);
        }
        g.later(300, function () { g.name(key); });
      }
      async function take(btn) {
        if (btn._taken || g.busy) return;
        btn._taken = true; count++;
        var my = count, h = g.centre(home);
        HW.audio.sfx("note", 2 + my);
        g.show(NUMS[my - 1], 1800); g.say(NUMS[my - 1]);
        await g.flyToPoint(btn, h.x + HW.rand(-h.w * .2, h.w * .2), h.y + h.h * 0.1, 900, 0.4);
        btn.style.opacity = 0;
        if (my === HW.settings.countTo) {
          g.busy = true;
          await g.wait(800);
          g.show(NUMS[my - 1]); await g.say(NUMS[my - 1]);
          await g.praise(home);
          await g.wait(800);
          t++; g.busy = false; build();
        }
      }
      build();
    }
  });
})();
