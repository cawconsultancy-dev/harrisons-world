/* Harrison's World: games 11 to 20. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art;
  var FRUIT = HW.FRUIT, VEG = HW.VEG;

  /* 11 --------------------------------------------------------------- */
  HW.registerGame({
    id: "carwash", title: "Car wash", desc: "Tap or rub the mud and the bubbles wash it away",
    world: "cars", worlds: ["cars"], bg: "day", voice: ["cleancar", "bubbles"],
    icon: function () { return HW.img("sponge"); },
    start: function (g) {
      var ground = g.el("div", "abs"); ground.style.cssText = "left:0;right:0;bottom:0;height:30%;background:#bcd7e6";
      var carBox = g.el("div", "abs"); carBox.style.cssText = "left:50%;top:50%;transform:translate(-50%,-55%);width:min(90vw,80vh,680px);aspect-ratio:270/150";
      carBox._baseTransform = "translate(-50%,-55%)";
      carBox.appendChild(HW.svgEl(A.car(A.COLOURS.yellow)));
      var spots = [], cleaning = false;
      var SPOTS = [[18, 42], [30, 58], [44, 36], [52, 60], [62, 30], [70, 56], [82, 50], [40, 66]];
      function muddy() {
        spots.forEach(function (s) { s.remove(); }); spots = [];
        SPOTS.forEach(function (p, i) {
          var m = HW.el("button", "abs mud", carBox);
          m.style.cssText = "left:" + (p[0] - 8) + "%;top:" + (p[1] - 13) + "%;width:17%;aspect-ratio:70/66;transition:opacity .7s,transform .7s";
          m.setAttribute("aria-label", "Mud");
          m.appendChild(HW.svgEl(A.mud(i)));
          spots.push(m);
        });
      }
      function wash(m) {
        if (m._clean || cleaning) return;
        m._clean = true;
        HW.audio.sfx("bubble");
        var c = g.centre(m);
        for (var i = 0; i < 4; i++) {
          var b = HW.svgEl(A.bubble(), "abs"); var sz = HW.rand(26, 46);
          b.style.cssText = "left:" + (c.x - sz / 2 + HW.rand(-20, 20)) + "px;top:" + (c.y - sz / 2 + HW.rand(-14, 14)) + "px;width:" + sz + "px;height:" + sz + "px;pointer-events:none";
          g.stage.appendChild(b);
          (function (el) {
            g.anim(el, [{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1)", opacity: 1, offset: .3 }, { transform: "translateY(-50px) scale(1.1)", opacity: 0 }], { duration: 1400 })
              .then(function () { el.remove(); });
          })(b);
        }
        m.style.opacity = 0; m.style.transform = "scale(.6)";
        if (spots.every(function (s) { return s._clean; })) done();
      }
      async function done() {
        cleaning = true;
        await g.wait(700);
        HW.audio.sfx("sparkle"); g.sparkle(carBox);
        g.bounce(carBox);
        await g.name("cleancar");
        await g.praise(carBox);
        await g.wait(600);
        carBox.classList.add("driving"); HW.audio.sfx("engine", 2.4);
        var w = g.size().w;
        await g.anim(carBox, [{ transform: "translate(-50%,-55%)" }, { transform: "translate(" + (w * 0.8) + "px,-55%)" }], { duration: 1600, fill: "forwards" });
        muddy();
        await g.anim(carBox, [{ transform: "translate(" + (-w * 1.3) + "px,-55%)" }, { transform: "translate(-50%,-55%)" }], { duration: 1600, fill: "forwards" });
        carBox.classList.remove("driving");
        cleaning = false;
      }
      muddy();
      /* tap or rub: anything the finger passes over gets washed */
      function under(ev) {
        var t = document.elementFromPoint(ev.clientX, ev.clientY);
        var m = t && t.closest && t.closest(".mud");
        if (m) wash(m);
      }
      var down = false;
      g.stage.addEventListener("pointerdown", function (ev) { down = true; HW.audio.unlock(); under(ev); });
      g.stage.addEventListener("pointermove", function (ev) { if (down || ev.pointerType === "touch") under(ev); });
      window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
      function up() { down = false; }
      g.onCleanup(function () { window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); });
      g.later(500, function () { g.name("bubbles"); });
    }
  });

  /* 12 --------------------------------------------------------------- */
  HW.registerGame({
    id: "stopgo", title: "Stop and go", desc: "Red light stops the car, green light makes it go",
    world: "cars", worlds: ["cars"], bg: "day", voice: ["stop", "go"],
    icon: function () { return HW.svgEl(A.trafficLight()); },
    start: function (g) {
      var going = false, changes = 0;
      var ground = g.el("div", "abs"); ground.style.cssText = "left:0;right:0;bottom:0;height:36%;background:var(--grass)";
      var road = g.el("div", "abs"); road.style.cssText = "left:0;right:0;bottom:10%;height:18%;background:#7c8496;border-top:5px solid #6a7184;border-bottom:5px solid #6a7184;overflow:hidden";
      var dash = HW.el("div", "abs road-dash", road); dash.style.cssText = "left:0;right:-80px;top:46%;height:6px;background:repeating-linear-gradient(90deg,#fff 0 40px,transparent 40px 80px);opacity:.85";
      var clouds = [];
      for (var i = 0; i < 2; i++) {
        var c = g.el("div", "abs cloud-drift"); c.style.cssText = "top:" + (6 + i * 14) + "%;left:0;width:min(26vmin,180px);opacity:.9;animation-delay:-" + (8 + i * 14) + "s";
        c.appendChild(HW.svgEl(A.cloud())); clouds.push(c);
      }
      var lightBox = g.el("div", "abs"); lightBox.style.cssText = "left:4%;top:6%;width:min(25vw,24vh,210px);aspect-ratio:130/330";
      var light = HW.svgEl(A.trafficLight()); lightBox.appendChild(light);
      var redLamp = light.querySelector(".lamp-red"), greenLamp = light.querySelector(".lamp-green");
      var redBtn = HW.el("button", "abs", lightBox); redBtn.style.cssText = "left:0;right:0;top:0;height:33%;border-radius:50%";
      var greenBtn = HW.el("button", "abs", lightBox); greenBtn.style.cssText = "left:0;right:0;top:31%;height:33%;border-radius:50%";
      redBtn.setAttribute("aria-label", "Stop"); greenBtn.setAttribute("aria-label", "Go");
      var car = g.el("div", "abs"); car.style.cssText = "left:max(36%,calc(8% + min(25vw,24vh,210px)));bottom:15%;width:min(50vw,40vh,330px);aspect-ratio:270/150";
      car.appendChild(HW.svgEl(A.car(A.COLOURS.red)));
      function lamps() {
        redLamp.setAttribute("fill", going ? "#5a2a2a" : "#ff6a5c");
        greenLamp.setAttribute("fill", going ? "#5bdc86" : "#1f4a2e");
        redLamp.style.filter = going ? "" : "drop-shadow(0 0 12px rgba(255,110,90,.8))";
        greenLamp.style.filter = going ? "drop-shadow(0 0 12px rgba(90,220,130,.8))" : "";
        g.stage.classList.toggle("moving", going);
        car.classList.toggle("driving", going);
      }
      lamps();
      async function set(go) {
        if (go === going) { g.bounce(go ? greenBtn : redBtn); g.name(go ? "go" : "stop"); return; }
        going = go; lamps(); changes++;
        if (go) HW.audio.sfx("engine", 1.6);
        g.bounce(car);
        await g.name(go ? "go" : "stop");
        if (changes % 4 === 0) g.praise(car);
      }
      g.tap(redBtn, function () { set(false); }, 600);
      g.tap(greenBtn, function () { set(true); }, 600);
      g.later(500, function () { g.glow(greenBtn, true, true); g.later(4000, function () { g.glow(greenBtn, false, true); }); g.name("stop"); });
    }
  });

  /* 13 --------------------------------------------------------------- */
  HW.registerGame({
    id: "bubbles", title: "Space bubbles", desc: "Pop the slow bubbles, then ask for More",
    world: "calm", worlds: ["calm", "music"], bg: "space", voice: ["bubbles", "pop", "more", "more_q"],
    icon: function () { return HW.svgEl(A.bubble()); },
    start: function (g) {
      var live = 0, popped = 0, moreBtn = null, batch = 0;
      function spawn(n) {
        var s = g.size();
        for (var i = 0; i < n; i++) (function (k) {
          g.later(k * 900, function () {
            var size = HW.rand(96, 150);
            var b = g.el("button", "abs bubble");
            b.setAttribute("aria-label", "Bubble");
            b.style.cssText = "left:" + HW.rand(4, 96 - size / s.w * 100) + "%;top:100%;width:" + size + "px;height:" + size + "px";
            b.appendChild(HW.svgEl(A.bubble()));
            live++;
            var dur = HW.rand(11000, 15000), sway = HW.rand(-40, 40);
            var a = b.animate ? b.animate([
              { transform: "translate(0,0)" }, { transform: "translate(" + sway + "px," + (-(s.h + size) * 0.5) + "px)" },
              { transform: "translate(" + (-sway * .5) + "px," + (-(s.h + size * 2)) + "px)" }], { duration: HW.reducedMotion() ? dur * 1.4 : dur, easing: "linear", fill: "forwards" }) : null;
            function gone() { live--; b.remove(); check(); }
            if (a) a.onfinish = function () { if (!b._popped) gone(); };
            else g.later(dur, function () { if (!b._popped) gone(); });
            g.tap(b, function () {
              if (b._popped) return; b._popped = true; popped++;
              if (a) a.pause();
              HW.audio.sfx("pop"); HW.audio.sfx("note", HW.randInt(3, 9));
              if (popped % 4 === 1) { g.show("pop", 1000); g.say("pop"); }
              g.anim(b, [{ scale: "1", opacity: 1 }, { scale: "1.35", opacity: 0 }], { duration: 300, always: true }).then(gone);
              g.sparkle(b);
            }, 50);
          });
        })(i);
      }
      function check() {
        if (live === 0 && !moreBtn) {
          moreBtn = g.el("button", "abs big-btn btn-more center");
          moreBtn.innerHTML = HW.icons.plus + "<span>More</span>";
          g.glow(moreBtn, true);
          g.show("more_q"); g.say("more_q");
          g.tap(moreBtn, async function () { var m = moreBtn; moreBtn = null; m.remove(); g.show("more"); await g.say("more"); go(); }, 800);
        }
      }
      function go() { batch++; if (batch === 1) { g.show("bubbles"); g.say("bubbles"); } spawn(8); }
      g.later(400, go);
    }
  });

  /* 14 --------------------------------------------------------------- */
  HW.registerGame({
    id: "rocket", title: "Rocket trip", desc: "Tap the rocket to fly past the Sun and the planets",
    world: "planets", worlds: ["planets"], bg: "space", voice: ["whoosh", "sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"],
    icon: function () { return HW.img("rocket"); },
    start: function (g) {
      var ORDER = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"], i = 0, flying = false;
      var planet = g.el("div", "abs"); planet.style.cssText = "right:6%;top:50%;transform:translateY(-55%);width:min(56vmin,420px);aspect-ratio:1";
      var rocket = g.el("button", "abs"); rocket.style.cssText = "left:6%;top:50%;transform:translateY(-60%) rotate(45deg);width:min(30vmin,210px);aspect-ratio:1";
      rocket.setAttribute("aria-label", "Rocket"); rocket.appendChild(HW.img("rocket"));
      rocket.classList.add("float");
      var dots = g.el("div", "abs"); dots.style.cssText = "left:50%;bottom:5%;transform:translateX(-50%);display:flex;gap:12px";
      var dotEls = ORDER.map(function () { var d = HW.el("div", "", dots); d.style.cssText = "width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.25);transition:background .5s,transform .5s"; return d; });
      function setPlanet() {
        planet.innerHTML = ""; planet.appendChild(HW.svgEl(A.planet(ORDER[i])));
        dotEls.forEach(function (d, k) { d.style.background = k === i ? "#e9b949" : (k < i ? "rgba(233,185,73,.5)" : "rgba(255,255,255,.25)"); d.style.transform = k === i ? "scale(1.4)" : "none"; });
      }
      setPlanet();
      async function fly() {
        if (flying) return; flying = true;
        rocket.classList.remove("float");
        HW.audio.sfx("whoosh", 1.3); g.show("whoosh", 1000); g.say("whoosh");
        var w = g.size().w;
        g.anim(planet, [{ transform: "translateY(-55%)", opacity: 1 }, { transform: "translate(-60%,-55%) scale(.6)", opacity: 0 }], { duration: 900 });
        await g.anim(rocket, [{ transform: "translateY(-60%) rotate(45deg)" }, { transform: "translate(" + (w * 1.1) + "px,-60%) rotate(45deg)" }], { duration: 1000 });
        var wrapped = i === ORDER.length - 1;
        i = (i + 1) % ORDER.length; setPlanet();
        g.anim(planet, [{ transform: "translate(40%,-55%) scale(.6)", opacity: 0 }, { transform: "translateY(-55%)", opacity: 1 }], { duration: 900 });
        await g.anim(rocket, [{ transform: "translate(" + (-w * 0.3) + "px,-60%) rotate(45deg)" }, { transform: "translateY(-60%) rotate(45deg)" }], { duration: 900 });
        rocket.classList.add("float");
        await g.name(ORDER[i]);
        if (wrapped || i === ORDER.length - 1) await g.praise(planet);
        flying = false;
      }
      g.tap(rocket, fly);
      g.tap(planet, function () { if (!flying) { g.bounce(planet); g.name(ORDER[i]); } });
      g.later(500, function () { g.name(ORDER[i]); g.glow(rocket, true, true); g.later(5000, function () { g.glow(rocket, false, true); }); });
    }
  });

  /* 15 --------------------------------------------------------------- */
  HW.registerGame({
    id: "bigsmall", title: "Big and small", desc: "Tap the big one and the small one",
    world: "planets", worlds: ["planets", "fruitveg", "cars"], bg: "space", voice: ["big", "small"],
    icon: function () { return HW.svgEl(A.planet("jupiter")); },
    start: function (g) {
      var PAIRS = [["jupiter", "mercury"], ["apple", "apple"], ["car", "car"], ["strawberry", "strawberry"], ["saturn", "moon"], ["bus", "bus"], ["sun", "earth"], ["watermelon", "watermelon"]];
      var p = 0, wrap = null;
      function round() {
        if (wrap) wrap.remove();
        var pair = PAIRS[p % PAIRS.length], bigLeft = Math.random() < .5, tapped = { big: false, small: false };
        wrap = g.el("div", "abs"); wrap.style.cssText = "left:4%;right:4%;top:10%;bottom:6%;display:flex;align-items:center;justify-content:space-around;flex-direction:" + (bigLeft ? "row" : "row-reverse");
        var s = g.size(), base = Math.min(s.w * 0.5, s.h * 0.72, 460);
        [["big", pair[0], base], ["small", pair[1], base * 0.42]].forEach(function (d) {
          var b = HW.el("button", "", wrap);
          b.style.cssText = "width:" + d[2] + "px;height:" + d[2] + "px;flex:none;display:grid;place-items:center;min-width:110px;min-height:110px";
          b.setAttribute("aria-label", HW.word(d[0]));
          var pic = HW.picture(d[1]); pic.style.width = "100%"; pic.style.height = "100%"; b.appendChild(pic);
          g.tap(b, async function () {
            g.bounce(b); HW.audio.sfx("note", d[0] === "big" ? 1 : 8);
            await g.name(d[0]);
            if (!tapped[d[0]]) { tapped[d[0]] = true; if (tapped.big && tapped.small) { g.busy = true; await g.praise(wrap); await g.wait(900); p++; g.busy = false; round(); } }
          }, 700);
        });
        g.anim(wrap, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
      }
      round();
    }
  });

  /* 16 --------------------------------------------------------------- */
  HW.registerGame({
    id: "grow", title: "Grow a carrot", desc: "Seed, water, sun, then pull up the carrot",
    world: "fruitveg", worlds: ["fruitveg"], bg: "garden", voice: ["seed", "water", "sun", "carrot"],
    icon: function () { return HW.img("carrot"); },
    start: function (g) {
      var STEPS = ["seed", "water", "sun", "carrot"], step = 0;
      var sunEl = g.el("div", "abs"); sunEl.style.cssText = "right:6%;top:60%;width:min(26vmin,180px);aspect-ratio:1;opacity:0;transition:top 1.4s cubic-bezier(.4,.1,.3,1),opacity 1.2s";
      sunEl.appendChild(HW.svgEl(A.planet("sun")));
      var soil = g.el("div", "abs"); soil.style.cssText = "left:50%;bottom:22%;transform:translateX(-50%);width:min(70vw,60vh,460px);aspect-ratio:260/90;z-index:2";
      soil.appendChild(HW.svgEl(A.soil()));
      var plantWin = g.el("div", "abs"); plantWin.style.cssText = "left:50%;transform:translateX(-50%);width:min(30vw,26vh,200px);aspect-ratio:160/200;overflow:hidden;z-index:1";
      var plant = HW.el("button", "abs", plantWin); plant.style.cssText = "inset:0;transition:transform 1.2s cubic-bezier(.4,.1,.3,1)";
      plant.setAttribute("aria-label", "Carrot");
      plant.appendChild(HW.svgEl(A.carrotPlant()));
      var tools = g.el("div", "choices n3");
      var toolEls = {};
      [["seed", A.seedPacket()], ["water", A.wateringCan()], ["sun", A.planet("sun")]].forEach(function (t) {
        var b = HW.el("button", "choice", tools); b.setAttribute("aria-label", HW.word(t[0])); b.appendChild(HW.svgEl(t[1]));
        g.tap(b, function () { useTool(t[0], b); }, 700);
        toolEls[t[0]] = b;
      });
      function placePlant() {
        var s = g.size(), sr = g.centre(soil);
        plantWin.style.bottom = (s.h - sr.y + sr.h * 0.05) + "px";
      }
      function reset() {
        step = 0; plant.style.transform = "translateY(100%)"; sunEl.style.opacity = 0; sunEl.style.top = "60%";
        placePlant(); highlight();
      }
      function highlight() {
        Object.keys(toolEls).forEach(function (k) {
          var on = STEPS[step] === k; toolEls[k].style.opacity = on || step === 3 ? 1 : .5; g.glow(toolEls[k], on);
        });
        g.glow(plant, step === 3, true);
      }
      async function useTool(name, btn) {
        if (g.busy) return;
        if (STEPS[step] !== name) { g.help(btn, step === 3 ? plant : toolEls[STEPS[step]], STEPS[step]); return; }
        g.busy = true; g.bounce(btn);
        var c = g.centre(soil);
        if (name === "seed") {
          for (var i = 0; i < 5; i++) {
            var d = g.el("div", "abs"); d.style.cssText = "width:14px;height:20px;border-radius:50%;background:#6a432b;left:" + (c.x + HW.rand(-40, 40)) + "px;top:" + (c.y - 160) + "px;z-index:3";
            (function (el, k) { g.anim(el, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(150px)", opacity: 0 }], { duration: 900 + k * 120, always: true }).then(function () { el.remove(); }); })(d, i);
          }
          HW.audio.sfx("click");
        } else if (name === "water") {
          for (var j = 0; j < 6; j++) {
            var w = HW.img("droplet", "abs"); w.style.cssText = "width:34px;height:34px;left:" + (c.x + HW.rand(-60, 60)) + "px;top:" + (c.y - 180) + "px;z-index:3";
            g.stage.appendChild(w);
            (function (el, k) { g.anim(el, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(160px)", opacity: 0 }], { duration: 900 + k * 140, always: true }).then(function () { el.remove(); }); })(w, j);
          }
          HW.audio.sfx("drip");
        } else if (name === "sun") {
          sunEl.style.opacity = 1; sunEl.style.top = "6%";
          HW.audio.sfx("grow");
          g.later(700, function () { plant.style.transform = "translateY(52%)"; });
        }
        await g.name(name);
        step++; highlight(); g.busy = false;
      }
      g.tap(plant, async function () {
        if (step !== 3 || g.busy) return;
        g.busy = true; g.glow(plant, false, true);
        plantWin.style.overflow = "visible";
        plant.style.transform = "translateY(-28%)";
        HW.audio.sfx("sparkle");
        await g.wait(900);
        await g.name("carrot");
        await g.praise(plant);
        await g.wait(1400);
        plantWin.style.overflow = "hidden"; plant.style.transition = "none"; reset();
        void plant.offsetWidth; plant.style.transition = "transform 1.2s cubic-bezier(.4,.1,.3,1)";
        g.busy = false;
      }, 700);
      window.addEventListener("resize", placePlant); g.onCleanup(function () { window.removeEventListener("resize", placePlant); });
      reset();
      g.later(500, function () { g.name("seed"); });
    }
  });

  /* 17 --------------------------------------------------------------- */
  HW.registerGame({
    id: "salad", title: "Fruit salad", desc: "Tap each fruit into the bowl, then stir",
    world: "fruitveg", worlds: ["fruitveg"], bg: "kitchen", voice: ["stir", "fruitsalad", "yum"].concat(FRUIT),
    icon: function () { return HW.img("grapes"); },
    start: function (g) {
      var bowl = g.el("div", "abs"); bowl.style.cssText = "left:50%;bottom:6%;transform:translateX(-50%);width:min(64vw,50vh,420px);aspect-ratio:260/150;z-index:2";
      bowl.appendChild(HW.svgEl(A.bowl()));
      var fruits = [], inBowl = 0, spoon = null;
      function build() {
        fruits.forEach(function (f) { f.remove(); }); fruits = []; inBowl = 0;
        var n = 5, set = HW.shuffle(FRUIT).slice(0, n), s = g.size();
        var wide = s.w > s.h * 1.6;
        var w = wide ? Math.min(s.w * 0.15, s.h * 0.3, 150) : Math.min(s.w * 0.25, s.h * 0.17, 150);
        var SPOT = wide ? [[12, 8], [31, 8], [50, 8], [69, 8], [88, 8]] : [[20, 6], [50, 6], [80, 6], [35, 26], [65, 26]];
        set.forEach(function (k, i) {
          var b = g.el("button", "abs"); b.setAttribute("aria-label", HW.word(k));
          var left = SPOT[i][0], top = SPOT[i][1];
          b.style.cssText = "left:calc(" + left + "% - " + w / 2 + "px);top:" + top + "%;width:" + w + "px;height:" + w + "px;z-index:3";
          b.appendChild(HW.img(k));
          g.tap(b, function () { drop(b, k); });
          fruits.push(b);
        });
      }
      async function drop(b, k) {
        if (b._in || g.busy) return;
        b._in = true; inBowl++;
        g.name(k);
        var c = g.centre(bowl);
        await g.flyToPoint(b, c.x + HW.rand(-c.w * .22, c.w * .22), c.y - c.h * .28 + HW.rand(-8, 8), 700, 0.55);
        if (inBowl === fruits.length && !spoon) {
          spoon = true;
          await g.wait(600);
          spoon = g.el("button", "abs big-btn btn-gold"); spoon.style.cssText = "left:50%;top:30%;transform:translateX(-50%);z-index:4";
          spoon.innerHTML = '<img src="img/e/spoon.svg" alt=""><span>Stir</span>';
          g.glow(spoon, true);
          g.tap(spoon, stir, 900);
        }
      }
      async function stir() {
        if (g.busy || !spoon || spoon === true) return; g.busy = true;
        spoon.remove(); spoon = null;
        HW.audio.sfx("stir");
        g.wiggle(bowl); fruits.forEach(function (f) { g.wiggle(f); });
        g.show("stir"); await g.say("stir");
        g.wiggle(bowl); fruits.forEach(function (f) { g.wiggle(f); });
        await g.name("fruitsalad");
        await g.say("yum");
        await g.praise(bowl);
        await g.wait(900);
        g.busy = false; build();
      }
      build();
    }
  });

  /* 18 --------------------------------------------------------------- */
  HW.registerGame({
    id: "puzzles", title: "Puzzles", desc: "Find the other half of the picture",
    world: "cars", worlds: ["cars", "planets", "fruitveg"], bg: "kitchen",
    voice: ["car", "saturn", "earth", "apple", "watermelon", "bus", "tractor", "strawberry", "rocket"],
    icon: function () { return HW.img("puzzle"); },
    start: function (g) {
      var POOL = ["car", "saturn", "earth", "apple", "watermelon", "bus", "tractor", "strawberry", "rocket"], last = "";
      var board = g.el("div", "abs"); board.style.cssText = "left:50%;top:6%;transform:translateX(-50%);width:min(50vmin,330px);aspect-ratio:1;border-radius:30px;background:rgba(255,255,255,.65);border:5px dashed #c9b48a";
      var row = null;
      function half(key, side) {
        var box = document.createElement("div"); box.style.cssText = "width:100%;height:100%;position:relative";
        var p = HW.picture(key); p.style.cssText = "position:absolute;inset:6%;width:88%;height:88%;clip-path:" + (side === "L" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)");
        box.appendChild(p); return box;
      }
      function round() {
        if (row) row.remove();
        var key; do { key = HW.pick(POOL); } while (key === last); last = key;
        board.innerHTML = ""; board.appendChild(half(key, "L"));
        var others = HW.shuffle(POOL.filter(function (k) { return k !== key; })).slice(0, HW.settings.choices - 1);
        var items = HW.shuffle([key].concat(others)), right = null;
        row = g.choices(items, function (k) {
          var h = half(k, "R"); h.firstChild.style.transform = "translateX(-25%)"; return h;
        }, async function (k, btn, btns) {
          if (k !== key) { g.help(btn, right, key); return; }
          g.busy = true; g.glow(btn, false);
          btns.forEach(function (b) { b.classList.add("gone"); });
          var r = half(key, "R"); r.style.cssText += ";position:absolute;inset:0"; board.appendChild(r);
          g.anim(r, [{ transform: "translateY(30%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 600 });
          await g.wait(650);
          board.style.borderStyle = "solid";
          g.bounce(board);
          await g.name(key);
          await g.praise(board);
          await g.wait(700);
          board.style.borderStyle = "dashed";
          g.busy = false; round();
        });
        right = row._btns.filter(function (b) { return b._item === key; })[0];
      }
      round();
    }
  });

  /* 19 --------------------------------------------------------------- */
  HW.registerGame({
    id: "band", title: "Fruit and veg band", desc: "Pumpkin drum, pea shaker, cherry bells, and coconut",
    world: "music", worlds: ["music", "fruitveg"], bg: "night", voice: ["pumpkin", "peas", "cherries", "coconut"],
    icon: function () { return HW.img("drum"); },
    start: function (g) {
      /* each picture keeps its own name, the same word it has in every other game */
      var INST = [["pumpkin", "pumpkin", "drum"], ["peas", "peas", "shake"], ["cherries", "cherries", "bells"], ["coconut", "coconut", "woodblock"]];
      var grid = g.el("div", "abs"); grid.style.cssText = "left:5%;right:5%;top:6%;bottom:6%;display:grid;gap:5%;place-items:center";
      function layout() { var s = g.size(), a = Math.min(s.w / 4, s.h), b = Math.min(s.w / 2, s.h / 2); grid.style.gridTemplateColumns = a > b ? "repeat(4,1fr)" : "repeat(2,1fr)"; }
      layout(); window.addEventListener("resize", layout); g.onCleanup(function () { window.removeEventListener("resize", layout); });
      var lastWord = 0;
      INST.forEach(function (it) {
        var b = HW.el("button", "", grid);
        b.style.cssText = "width:100%;max-width:260px;aspect-ratio:1;border-radius:36px;background:rgba(255,255,255,.1);border:3px solid rgba(233,185,73,.45);display:grid;place-items:center";
        b.setAttribute("aria-label", HW.word(it[0]));
        var pic = it[1] === "pumpkin" ? HW.svgEl(A.pumpkin()) : HW.img(it[1]);
        pic.style.width = "70%"; pic.style.height = "70%"; b.appendChild(pic);
        g.tap(b, function () {
          HW.audio.sfx(it[2]); g.wiggle(b);
          var now = Date.now();
          if (now - lastWord > 3200) { lastWord = now; g.name(it[0]); } else g.show(it[0], 1200);
        }, 120);
      });
    }
  });

  /* 20 --------------------------------------------------------------- */
  HW.registerGame({
    id: "sleepy", title: "Sleepy moon", desc: "A calm place to end with a soft goodbye",
    world: "calm", worlds: ["calm"], bg: "night", voice: ["nightnight", "moon", "star", "byebye"],
    icon: function () { return HW.svgEl(A.sleepyMoon()); },
    start: function (g) {
      var s = g.size();
      var SPOTS = [[10, 8], [30, 4], [70, 5], [90, 10], [8, 34], [92, 36], [16, 62], [50, 2]];
      if (s.w <= s.h * 1.5) SPOTS.push([84, 64]);
      for (var i = 0; i < SPOTS.length; i++) {
        var st = g.el("button", "abs twinkle-star"); var z = HW.rand(64, 80);
        st.style.cssText = "left:clamp(4px, calc(" + SPOTS[i][0] + "% - " + z / 2 + "px), calc(100% - " + (z + 4) + "px));top:" + SPOTS[i][1] + "%;width:" + z + "px;height:" + z + "px;animation-delay:-" + HW.rand(0, 5).toFixed(1) + "s";
        st.setAttribute("aria-label", "Star");
        st.appendChild(HW.svgEl(A.star("#ffe9a3")));
        (function (b, k) { g.tap(b, function () { HW.audio.sfx("note", 5 + (k % 5)); g.bounce(b); g.name("star"); }, 500); })(st, i);
      }
      var moon = g.el("button", "abs center breathe"); moon.style.cssText += ";width:" + Math.min(s.w * 0.56, s.h * 0.5, 400) + "px;aspect-ratio:1;top:42%";
      moon.setAttribute("aria-label", "Moon");
      moon.appendChild(HW.svgEl(A.sleepyMoon()));
      g.tap(moon, function () { HW.audio.sfx("note", 0); g.name("moon"); }, 900);
      var bye = g.el("button", "abs big-btn btn-done");
      bye.style.cssText = s.w > s.h * 1.5 ? "right:4%;bottom:6%" : "left:50%;bottom:6%;transform:translateX(-50%)";
      bye.innerHTML = '<img src="img/e/wave.svg" alt=""><span>Bye bye</span>';
      g.tap(bye, async function () { g.show("byebye", 3000); await g.say("byebye"); await g.wait(400); HW.goStart(); }, 1500);
      g.later(800, function () { g.name("nightnight"); });
    }
  });
})();
