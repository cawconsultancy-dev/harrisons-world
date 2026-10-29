/* Harrison's World: games 1 to 10. Every game: no timers, no scores, no losing. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art;

  var FRUIT = ["apple", "banana", "orange", "strawberry", "grapes", "pear", "watermelon", "cherries"];
  var VEG = ["carrot", "broccoli", "peas", "sweetcorn", "tomato", "potato", "cucumber", "pepper"];
  HW.FRUIT = FRUIT; HW.VEG = VEG;

  /* picture for any word in the app */
  HW.picture = function (key) {
    if (A.PLANETS.indexOf(key) >= 0) return HW.svgEl(A.planet(key));
    if (key === "car") return HW.svgEl(A.car(A.COLOURS.red));
    if (key === "star") return HW.svgEl(A.star());
    if (A.SEA && A.SEA[key]) return HW.svgEl(A.SEA[key]());
    if (key === "fish") return HW.svgEl(A.genericFish(A.COLOURS.orange));
    if (key === "igloo" || key === "queen" || key === "wellies") return HW.svgEl(A[key]());
    return HW.img(key);
  };
  function sizeBox(el, css) { el.style.cssText += ";" + css; return el; }

  /* 1 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "twinkle", title: "Twinkle sky", desc: "Tap the sky to make stars and soft notes",
    world: "calm", worlds: ["calm", "planets", "music"], bg: "space", voice: ["star", "moon"],
    icon: function () { return HW.svgEl(A.star()); },
    start: function (g) {
      var stage = g.stage, count = 0, live = [];
      var moon = g.el("button", "abs");
      sizeBox(moon, "right:5%;top:8%;width:min(22vmin,160px);aspect-ratio:1");
      moon.setAttribute("aria-label", "Moon");
      moon.appendChild(HW.svgEl(A.planet("moon")));
      g.tap(moon, function () { g.bounce(moon); HW.audio.sfx("note", 1); g.name("moon"); });

      g.tap(stage, function (ev) {
        if (ev.target.closest && ev.target.closest("button")) return;
        var s = g.size();
        var x = (ev.clientX || 0) - s.left, y = (ev.clientY || 0) - s.top;
        var size = HW.rand(56, 92);
        var star = HW.svgEl(A.star(HW.pick(["#ffd86b", "#ffe9a3", "#fff4cf", "#ffcf6b"])), "abs");
        star.style.cssText = "left:" + (x - size / 2) + "px;top:" + (y - size / 2) + "px;width:" + size + "px;height:" + size + "px;pointer-events:none";
        stage.appendChild(star);
        live.push(star);
        if (live.length > 24) live.shift().remove();
        var note = Math.round((1 - y / s.h) * (HW.audio.pentaCount - 1));
        HW.audio.sfx("note", note);
        count++;
        if (count === 1 || count % 7 === 0) g.name("star");
        var drift = HW.reducedMotion() ? 0 : -HW.rand(40, 90);
        if (star.animate) {
          var a = star.animate([
            { transform: "scale(.3) rotate(0deg)", opacity: 0 },
            { transform: "scale(1) rotate(10deg)", opacity: 1, offset: .12 },
            { transform: "translateY(" + drift + "px) scale(.9) rotate(20deg)", opacity: .85, offset: .6 },
            { transform: "translateY(" + (drift * 1.6) + "px) scale(.7) rotate(30deg)", opacity: 0 }
          ], { duration: 6500, easing: "ease-out", fill: "forwards" });
          a.onfinish = function () { star.remove(); };
        } else { g.later(6000, function () { star.remove(); }); }
      }, 90);
      g.later(500, function () { g.show("star"); });
    }
  });

  /* 2 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "readygo", title: "Ready, steady, go!", desc: "Wait for it, then tap Go to drive the car home",
    world: "cars", worlds: ["cars"], bg: "day", voice: ["ready", "steady", "go", "home"],
    icon: function () { return HW.svgEl(A.car(A.COLOURS.blue)); },
    start: function (g) {
      var stage = g.stage;
      var ground = g.el("div", "abs"); ground.style.cssText = "left:0;right:0;bottom:0;height:34%;background:var(--grass)";
      var road = g.el("div", "abs"); road.style.cssText = "left:0;right:0;bottom:8%;height:16%;background:#7c8496;border-top:5px solid #6a7184;border-bottom:5px solid #6a7184";
      var dash = HW.el("div", "abs", road); dash.style.cssText = "left:0;right:0;top:46%;height:6px;background:repeating-linear-gradient(90deg,#fff 0 40px,transparent 40px 76px);opacity:.85";
      var house = g.el("div", "abs"); house.style.cssText = "right:3%;bottom:20%;width:min(30vmin,220px);aspect-ratio:1";
      house.appendChild(HW.img("house"));
      var car = g.el("button", "abs"); car.setAttribute("aria-label", "Car");
      car.style.cssText = "left:3%;bottom:13%;width:min(46vw,44vh,340px);aspect-ratio:270/150";
      car.appendChild(HW.svgEl(A.car(A.COLOURS.blue)));
      var go = g.el("button", "abs big-btn btn-go");
      go.style.cssText = "left:50%;top:22%;transform:translateX(-50%);opacity:0;pointer-events:none;transition:opacity .5s";
      go.innerHTML = HW.icons.arrow + "<span>Go</span>";
      var waiting = false;

      async function round() {
        car.style.transition = "none"; car.style.transform = "none"; car.style.opacity = 1;
        await g.wait(700);
        g.show("ready", 1600); g.wiggle(car); await g.say("ready");
        await g.wait(500);
        g.show("steady", 1600); g.wiggle(car); await g.say("steady");
        go.style.opacity = 1; go.style.pointerEvents = "auto"; g.glow(go, true);
        waiting = true; /* the app waits here as long as he needs */
      }
      async function drive() {
        if (!waiting) return;
        waiting = false;
        go.style.opacity = 0; go.style.pointerEvents = "none"; g.glow(go, false);
        g.name("go");
        HW.audio.sfx("engine", 2.8);
        car.classList.add("driving");
        var s = g.size(), h = g.centre(house), c = g.centre(car);
        var dx = h.x - c.x - h.w * 0.35;
        car.style.transition = "transform " + (HW.reducedMotion() ? 10 : 2700) + "ms cubic-bezier(.45,.05,.35,1)";
        car.style.transform = "translateX(" + dx + "px)";
        await g.wait(2800);
        car.classList.remove("driving");
        g.name("home");
        await g.wait(900);
        await g.praise(house);
        car.style.transition = "opacity .6s"; car.style.opacity = 0;
        await g.wait(700);
        round();
      }
      g.tap(go, drive); g.tap(car, drive);
      round();
    }
  });

  /* 3 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "peekaboo", title: "Peekaboo planets", desc: "Tap the cloud to find a planet",
    world: "planets", worlds: ["planets"], bg: "space", voice: ["peekaboo"].concat(A.EIGHT),
    icon: function () { return HW.svgEl(A.planet("saturn")); },
    start: function (g) {
      var i = 0, state = "covered", reveals = 0;
      var wrap = g.el("div", "abs center"); wrap.style.cssText += ";width:min(64vmin,440px);aspect-ratio:1";
      var planet = HW.el("button", "abs", wrap); planet.style.cssText = "inset:0";
      planet.setAttribute("aria-label", "Planet");
      var cloud = HW.el("button", "abs", wrap); cloud.style.cssText = "left:-22%;top:-4%;width:144%;height:108%;transition:transform .9s cubic-bezier(.4,.1,.3,1),opacity .9s";
      cloud.setAttribute("aria-label", "Cloud");
      cloud.appendChild(HW.svgEl(A.cloud()));
      /* only the eight planets here, so "planet" always means a planet */
      function setPlanet() { planet.innerHTML = ""; planet.appendChild(HW.svgEl(A.planet(A.EIGHT[i]))); }
      setPlanet();
      async function reveal() {
        if (state !== "covered") return;
        state = "revealing";
        HW.audio.sfx("reveal");
        cloud.style.transform = "translateY(-70%) scale(.8)"; cloud.style.opacity = 0;
        await g.say("peekaboo");
        g.bounce(planet);
        await g.name(A.EIGHT[i]);
        state = "shown"; reveals++;
        if (reveals % 3 === 0) await g.praise(planet);
        await g.wait(3200);
        cover();
      }
      async function cover() {
        state = "covering";
        cloud.style.transform = "none"; cloud.style.opacity = 1;
        await g.wait(950);
        i = (i + 1) % A.EIGHT.length; setPlanet();
        state = "covered";
      }
      g.tap(cloud, reveal);
      g.tap(planet, function () { if (state === "shown") { g.bounce(planet); g.name(A.EIGHT[i]); } });
      g.tap(g.stage, function (ev) { if (!(ev.target.closest && ev.target.closest("button"))) reveal(); });
    }
  });

  /* 4 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "fruitveg", title: "Fruit and veg", desc: "One picture at a time, tap to hear its name",
    world: "fruitveg", worlds: ["fruitveg"], bg: "kitchen", voice: FRUIT.concat(VEG),
    icon: function () { return HW.img("apple"); },
    start: function (g) {
      var order = [], i = 0, taps = 0;
      for (var k = 0; k < 8; k++) { order.push(FRUIT[k]); order.push(VEG[k]); }
      var plate = g.el("div", "abs center"); plate.style.cssText += ";width:min(66vmin,460px);aspect-ratio:1;border-radius:50%;background:#fff;box-shadow:0 10px 30px rgba(120,90,40,.18)";
      var pic = HW.el("button", "abs", plate); pic.style.cssText = "inset:14%";
      var next = g.el("button", "abs big-btn btn-go"); next.style.cssText = "right:5%;bottom:6%;min-width:0;width:clamp(110px,22vmin,150px);padding:0";
      next.setAttribute("aria-label", "Next"); next.innerHTML = HW.icons.arrow;
      function show() {
        pic.innerHTML = ""; var p = HW.picture(order[i]); p.style.width = "100%"; p.style.height = "100%"; pic.appendChild(p);
        pic.setAttribute("aria-label", HW.word(order[i]));
        g.anim(pic, [{ transform: "translateX(40%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 500 });
        g.name(order[i]);
      }
      g.tap(pic, function () {
        g.bounce(pic); taps++;
        g.name(order[i]).then(function () { if (taps % 3 === 0) g.praise(pic); });
      });
      g.tap(next, async function () {
        HW.audio.sfx("click");
        await g.anim(pic, [{ transform: "none", opacity: 1 }, { transform: "translateX(-40%)", opacity: 0 }], { duration: 350 });
        i = (i + 1) % order.length; show();
      }, 700);
      g.later(300, show);
    }
  });

  /* 5 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "alien", title: "Hungry alien", desc: "Pick a food for the alien, then More or All done",
    world: "fruitveg", worlds: ["fruitveg", "planets"], bg: "space", voice: ["hungry", "yum", "more", "alldone"].concat(FRUIT, VEG),
    icon: function () { return HW.svgEl(A.alien()); },
    start: function (g) {
      var alienBox = g.el("div", "abs"); alienBox.style.cssText = "left:50%;top:5%;transform:translateX(-50%);width:min(44vmin,300px);aspect-ratio:200/210";
      var alien = HW.svgEl(A.alien()); alienBox.appendChild(alien);
      alienBox.classList.add("float");
      var smile = alien.querySelector(".mouth-smile"), open = alien.querySelector(".mouth-open");
      var row = null, after = null, last = [];
      function mouthOpen(on) { smile.style.display = on ? "none" : ""; open.style.display = on ? "" : "none"; }
      function offer() {
        if (after) { after.remove(); after = null; }
        var n = HW.settings.choices;
        var pool = HW.shuffle(FRUIT.concat(VEG)).filter(function (k) { return last.indexOf(k) < 0; });
        var picks = pool.slice(0, n); last = picks;
        row = g.choices(picks, function (k) { return HW.img(k); }, eat);
        g.bounce(alienBox); g.show("hungry"); g.say("hungry");
      }
      async function eat(key, btn, btns) {
        g.busy = true;
        btns.forEach(function (b) { if (b !== btn) b.classList.add("gone"); });
        g.name(key);
        var a = g.centre(alienBox);
        mouthOpen(true);
        await g.flyToPoint(btn, a.x, a.y + a.h * 0.17, 900, 0.3);
        btn.style.opacity = 0;
        HW.audio.sfx("munch");
        await g.wait(600);
        mouthOpen(false);
        g.bounce(alienBox);
        g.show("yum"); await g.say("yum");
        g.sparkle(alienBox);
        row.remove(); row = null;
        after = g.el("div", "choices");
        var more = HW.el("button", "big-btn btn-more", after); more.innerHTML = HW.icons.plus + "<span>More</span>";
        var done = HW.el("button", "big-btn btn-done", after); done.innerHTML = '<img src="img/e/alldone.svg" alt=""><span>All done</span>';
        g.tap(more, async function () { g.busy = true; g.show("more"); await g.say("more"); g.busy = false; offer(); }, 900);
        g.tap(done, async function () { g.show("alldone"); await g.say("alldone"); HW.leaveGame(); }, 900);
        g.busy = false;
      }
      g.later(500, offer);
    }
  });

  /* 6 ---------------------------------------------------------------- */
  var SAME_POOL = {
    fruit: FRUIT, veg: VEG,
    vehicles: ["car", "bus", "tractor", "fireengine", "rocket"],
    space: ["earth", "saturn", "jupiter", "moon", "sun", "mars"],
    sea: ["clownfish", "turtle", "octopus", "starfish", "crab", "whale"]
  };
  HW.registerGame({
    id: "same", title: "Same again", desc: "Find the picture that is the same",
    world: "fruitveg", worlds: ["fruitveg", "cars", "planets", "sea"], bg: "kitchen",
    voice: FRUIT.concat(VEG, SAME_POOL.vehicles, SAME_POOL.space, SAME_POOL.sea),
    icon: function () { return HW.img("pear"); },
    start: function (g) {
      var frame = g.el("div", "abs"); frame.style.cssText = "left:50%;top:7%;transform:translateX(-50%);width:min(48vw,32vh,280px);aspect-ratio:1;border-radius:34px;border:6px dashed #c9b48a;background:rgba(255,255,255,.55);display:grid;place-items:center";
      var row = null, lastKey = "", rounds = 0;
      function pictureFor(k) { var p = HW.picture(k); return p; }
      function round() {
        if (row) row.remove();
        frame.innerHTML = "";
        var cats = Object.keys(SAME_POOL), cat = HW.pick(cats), key;
        do { key = HW.pick(SAME_POOL[cat]); } while (key === lastKey);
        lastKey = key;
        var target = pictureFor(key); target.style.width = "74%"; target.style.height = "74%"; frame.appendChild(target);
        var others = HW.shuffle(cats.filter(function (c) { return c !== cat; })).slice(0, HW.settings.choices - 1)
          .map(function (c) { return HW.pick(SAME_POOL[c]); });
        var items = HW.shuffle([key].concat(others));
        var right = null;
        row = g.choices(items, pictureFor, async function (k, btn, btns) {
          if (k !== key) { g.help(btn, right, key); return; }
          g.busy = true; g.glow(btn, false);
          btns.forEach(function (b) { if (b !== btn) b.classList.add("gone"); });
          var f = g.centre(frame);
          await g.flyToPoint(btn, f.x, f.y, 700, 0.95);
          await g.name(key);
          rounds++;
          await g.praise(frame);
          await g.wait(500);
          g.busy = false; round();
        });
        right = row._btns.filter(function (b) { return b._item === key; })[0];
        g.anim(frame, [{ opacity: 0, transform: "translateX(-50%) scale(.9)" }, { opacity: 1, transform: "translateX(-50%) scale(1)" }], { duration: 400 });
        g.later(350, function () { g.name(key); });
      }
      round();
    }
  });

  /* 7 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "paint", title: "Paint the car", desc: "Tap a paint pot and the car changes colour",
    world: "cars", worlds: ["cars"], bg: "day", voice: ["red", "yellow", "blue", "green", "orange", "purple"],
    icon: function () { return HW.svgEl(A.paintPot("#e2574c")); },
    start: function (g) {
      var names = Object.keys(A.COLOURS), current = "", paints = 0;
      var ground = g.el("div", "abs"); ground.style.cssText = "left:0;right:0;bottom:0;height:38%;background:var(--grass)";
      var carBox = g.el("div", "abs"); carBox.style.cssText = "left:50%;top:14%;transform:translateX(-50%);width:min(84vw,72vh,620px);aspect-ratio:270/150";
      carBox._baseTransform = "translateX(-50%)";
      carBox.appendChild(HW.svgEl(A.car("#e7eaf0")));
      var paint = carBox.querySelector(".car-paint");
      paint.style.transition = "fill .8s ease";
      var row = null;
      function pots() {
        if (row) row.remove();
        var set = HW.shuffle(names.filter(function (n) { return n !== current; })).slice(0, 3);
        row = g.choices(set, function (n) { return HW.svgEl(A.paintPot(A.COLOURS[n])); }, async function (n, btn) {
          g.busy = true;
          g.bounce(btn);
          paint.style.fill = A.COLOURS[n];
          current = n;
          HW.audio.sfx("sparkle");
          g.bounce(carBox);
          await g.name(n);
          paints++;
          if (paints % 3 === 0) await g.praise(carBox);
          g.busy = false;
          pots();
        });
      }
      pots();
    }
  });

  /* 8 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "garage", title: "Shape garage", desc: "Match the shape on the door and the car drives in",
    world: "cars", worlds: ["cars"], bg: "day", voice: ["circle", "square", "triangle", "star"],
    icon: function () { return HW.svgEl(A.garage()); },
    start: function (g) {
      var SHAPES = ["circle", "square", "triangle", "star"], last = "";
      var ground = g.el("div", "abs"); ground.style.cssText = "left:0;right:0;bottom:0;height:46%;background:var(--grass)";
      var gar = g.el("div", "abs"); gar.style.cssText = "left:50%;top:3%;transform:translateX(-50%);width:min(62vw,52vh,460px);aspect-ratio:260/230";
      gar.appendChild(HW.svgEl(A.garage()));
      var doorWrap = HW.el("div", "abs", gar); doorWrap.style.cssText = "left:20%;top:45.2%;width:60%;height:50.4%;overflow:hidden";
      var door = HW.el("div", "abs", doorWrap); door.style.cssText = "inset:0;transition:transform 1s cubic-bezier(.4,.1,.3,1)";
      door.appendChild(HW.svgEl(A.garageDoor()));
      var slot = HW.el("div", "abs", door); slot.style.cssText = "left:50%;top:50%;width:58%;aspect-ratio:1;transform:translate(-50%,-50%)";
      var car = g.el("div", "abs"); car.style.cssText = "left:2%;bottom:30%;width:min(30vw,26vh,220px);aspect-ratio:270/150";
      car.appendChild(HW.svgEl(A.car(A.COLOURS.red)));
      var row = null, target = "";
      function round() {
        if (row) row.remove();
        door.style.transform = "none";
        car.style.transition = "none"; car.style.transform = "none"; car.style.opacity = 1;
        do { target = HW.pick(SHAPES); } while (target === last);
        last = target;
        slot.innerHTML = ""; slot.appendChild(HW.svgEl(A.shape(target, "none", "#5b6476", true)));
        var others = HW.shuffle(SHAPES.filter(function (s) { return s !== target; })).slice(0, HW.settings.choices - 1);
        var items = HW.shuffle([target].concat(others)), right = null;
        row = g.choices(items, function (s) { return HW.svgEl(A.shape(s, "#f2c53d", "#d9a826")); }, async function (s, btn, btns) {
          if (s !== target) { g.help(btn, right, target); return; }
          g.busy = true; g.glow(btn, false);
          btns.forEach(function (b) { if (b !== btn) b.classList.add("gone"); });
          var c = g.centre(slot);
          await g.flyToPoint(btn, c.x, c.y, 700, c.w / g.centre(btn).w);
          btn.style.opacity = 0;
          slot.innerHTML = ""; slot.appendChild(HW.svgEl(A.shape(target, "#f2c53d", "#d9a826")));
          g.name(target);
          await g.wait(700);
          door.style.transform = "translateY(-100%)";
          await g.wait(900);
          HW.audio.sfx("engine", 2);
          car.classList.add("driving");
          var gc = g.centre(doorWrap), cc = g.centre(car);
          car.style.transition = "transform 1.8s cubic-bezier(.45,.05,.35,1), opacity 1.8s";
          car.style.transform = "translate(" + (gc.x - cc.x) + "px," + (gc.y - cc.y + gc.h * 0.18) + "px) scale(.55)";
          car.style.opacity = 0.15;
          await g.wait(1900);
          car.classList.remove("driving");
          await g.praise(gar);
          await g.wait(600);
          g.busy = false; round();
        });
        right = row._btns.filter(function (b) { return b._item === target; })[0];
        g.later(400, function () { g.name(target); });
      }
      round();
    }
  });

  /* 9 ---------------------------------------------------------------- */
  HW.registerGame({
    id: "count", title: "Count with me", desc: "Tap each one into the basket: one, two, three",
    world: "fruitveg", worlds: ["fruitveg", "cars"], bg: "kitchen", voice: ["one", "two", "three", "four", "five"],
    icon: function () { return HW.img("strawberry"); },
    start: function (g) {
      var NUMS = ["one", "two", "three", "four", "five"];
      var themes = ["strawberry", "car", "carrot", "apple"], t = 0;
      var holder = null, items = [], count = 0;
      function build() {
        g.stage.querySelectorAll(".count-item,.count-holder").forEach(function (n) { n.remove(); });
        var n = HW.settings.countTo, theme = themes[t % themes.length];
        count = 0; items = [];
        holder = g.el("div", "abs count-holder"); holder.style.cssText = "left:50%;bottom:6%;transform:translateX(-50%);width:min(60vw,46vh,380px);aspect-ratio:" + (theme === "car" ? "260/230" : "260/170");
        holder.appendChild(HW.svgEl(theme === "car" ? A.garage() : A.basket()));
        var w = Math.min(g.size().w * 0.86 / n, g.size().h * 0.26, 170) * (theme === "car" ? 1.3 : 1);
        w = Math.min(w, g.size().w * 0.9 / n);
        for (var i = 0; i < n; i++) {
          var b = g.el("button", "abs count-item");
          var left = (100 / (n + 1)) * (i + 1);
          b.style.cssText = "left:calc(" + left + "% - " + w / 2 + "px);top:14%;width:" + w + "px;height:" + w + "px";
          b.appendChild(theme === "car" ? HW.svgEl(A.car(HW.pick(Object.keys(A.COLOURS).map(function (k) { return A.COLOURS[k]; })))) : HW.img(theme));
          b.setAttribute("aria-label", HW.word(theme));
          (function (btn) { g.tap(btn, function () { take(btn); }); })(b);
          items.push(b);
        }
      }
      async function take(btn) {
        if (btn._taken || g.busy) return;
        btn._taken = true;
        count++;
        var my = count, h = g.centre(holder);
        HW.audio.sfx("note", 2 + my);
        g.show(NUMS[my - 1], 1800); g.say(NUMS[my - 1]);
        await g.flyToPoint(btn, h.x + HW.rand(-h.w * .2, h.w * .2), h.y - h.h * .05, 650, 0.55);
        if (my === HW.settings.countTo) {
          g.busy = true;
          await g.wait(900);
          g.show(NUMS[my - 1]); await g.say(NUMS[my - 1]);
          await g.praise(holder);
          await g.wait(800);
          t++; g.busy = false; build();
        }
      }
      build();
    }
  });

  /* 10 --------------------------------------------------------------- */
  HW.registerGame({
    id: "planetmusic", title: "Planet music", desc: "Each planet plays a soft note. Try my turn, your turn",
    world: "music", worlds: ["music", "planets"], bg: "space", voice: ["myturn", "yourturn"].concat(A.EIGHT),
    icon: function () { return HW.img("note"); },
    start: function (g) {
      var mode = "free", token = 0, waitingChild = null;
      var grid = g.el("div", "abs"); grid.style.cssText = "left:3%;right:3%;top:16%;bottom:6%;display:grid;gap:3%;place-items:center";
      function layout() {
        var s = g.size(), w = s.w * 0.94, h = s.h * 0.78, best = 4, bestSize = 0;
        [[8, 1], [4, 2], [2, 4]].forEach(function (cr) { var sz = Math.min(w / cr[0], h / cr[1]); if (sz > bestSize) { bestSize = sz; best = cr[0]; } });
        grid.style.gridTemplateColumns = "repeat(" + best + ",1fr)";
        var px = Math.min(bestSize * 0.84, 210) + "px";
        grid.querySelectorAll("button").forEach(function (b) { b.style.width = px; b.style.height = px; });
      }
      window.addEventListener("resize", layout); g.onCleanup(function () { window.removeEventListener("resize", layout); });
      var btns = A.EIGHT.map(function (p, i) {
        var b = HW.el("button", "", grid); b.style.cssText = "border-radius:50%";
        b.setAttribute("aria-label", HW.word(p));
        b.appendChild(HW.svgEl(A.planet(p)));
        g.tap(b, function () { play(i); if (waitingChild) { var r = waitingChild; waitingChild = null; r(i); } }, 120);
        return b;
      });
      layout();
      function play(i) { HW.audio.sfx("note", 2 + i); g.bounce(btns[i]); g.show(A.EIGHT[i], 1200); }
      var modeBtn = g.el("button", "abs mode-btn"); modeBtn.style.cssText = "left:50%;top:2.5%;transform:translateX(-50%)";
      function setModeLabel() { modeBtn.innerHTML = (mode === "free" ? HW.icons.turns + "<span>My turn, your turn</span>" : HW.icons.free + "<span>Play freely</span>"); }
      setModeLabel();
      g.tap(modeBtn, function () {
        mode = mode === "free" ? "turns" : "free"; setModeLabel(); token++;
        btns.forEach(function (b) { g.glow(b, false, true); });
        if (waitingChild) { waitingChild = null; }
        if (mode === "turns") turns(token);
      }, 800);
      async function turns(my) {
        await g.wait(500);
        while (g.alive && mode === "turns" && my === token) {
          await g.say("myturn");
          if (my !== token) return;
          var i = HW.randInt(0, 7);
          g.glow(btns[i], true, true); play(i);
          await g.wait(1100);
          if (my !== token) return;
          await g.say("yourturn");
          if (my !== token) return;
          var tapped = await new Promise(function (res) { waitingChild = res; });
          g.glow(btns[i], false, true);
          if (my !== token) return;
          if (tapped === i) await g.praise(btns[i]); else { await g.wait(300); await g.say("yay"); }
          await g.wait(900);
        }
      }
    }
  });
})();
