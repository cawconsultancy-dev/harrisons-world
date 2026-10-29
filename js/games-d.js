/* Harrison's World: games 26 to 36. Shapes, numbers, letters, weather, and art.
   Same rules as every other game: no timers, no scores, nothing marked wrong. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art;
  var NUMS = ["one", "two", "three", "four", "five"];
  var PALETTE = ["red", "yellow", "blue", "green", "orange", "purple"];

  function portrait(g) { var s = g.size(); return s.w < s.h * 1.05; }

  /* a set of round buttons (paint pots or stamps): a row along the bottom when the
     screen is upright, two columns on the right when it is sideways */
  function potGrid(g, items, render, onPick) {
    var n = items.length, grid = g.el("div", "pot-grid");
    grid.layout = function () {
      var s = g.size(), port = portrait(g);
      var size = port ? Math.max(56, Math.min((s.w - 24 - (n - 1) * 8) / n, s.h * 0.12, 96))
                      : Math.max(56, Math.min((s.h - 24 - 2 * 10) / 3, s.w * 0.11, 96));
      grid.style.cssText = port
        ? "left:50%;bottom:10px;transform:translateX(-50%);grid-template-columns:repeat(" + n + "," + size + "px);gap:8px"
        : "right:10px;top:50%;transform:translateY(-50%);grid-template-columns:repeat(2," + size + "px);gap:10px";
      grid._size = size; grid._port = port;
      (grid._btns || []).forEach(function (b) { b.style.width = b.style.height = size + "px"; });
    };
    grid.layout();
    grid._btns = items.map(function (it) {
      var b = HW.el("button", "pot", grid);
      b.style.width = b.style.height = grid._size + "px";
      b.setAttribute("aria-label", HW.word(it));
      b.appendChild(render(it)); b._item = it;
      g.tap(b, function () { grid._btns.forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); g.bounce(b); onPick(it, b); }, 300);
      return b;
    });
    grid._btns[0].classList.add("on");
    return grid;
  }
  /* one round button in the top corner (next picture, or clear the page); when the
     pots sit down the right-hand side it moves just to their left */
  function cornerButton(g, grid, label, inner) {
    var b = g.el("button", "abs corner-btn"); b.setAttribute("aria-label", label);
    if (typeof inner === "string") b.innerHTML = inner; else b.appendChild(inner);
    b.layout = function () { b.style.top = "12px"; b.style.right = grid._port ? "12px" : (grid._size * 2 + 10 + 32) + "px"; };
    b.layout();
    return b;
  }
  /* the space left for a picture once the pots and the corner button are placed */
  function picArea(g, grid) {
    var s = g.size();
    if (grid._port) return { x: 12, y: 12, w: s.w - 24, h: s.h - grid._size - 42 };
    var right = grid._size * 2 + 10 + 32 + 84 + 12;
    return { x: 12, y: 12, w: s.w - right - 12, h: s.h - 24 };
  }

  /* ================= 26 Shape builder ================= */
  var BUILDS = [
    { key: "house", go: "bounce", pieces: [
      { shape: "square", t: "rect", x: 70, y: 128, w: 160, h: 142, fill: "#f2c53d" },
      { shape: "triangle", t: "poly", pts: [[46, 134], [150, 38], [254, 134]], fill: "#e2574c" },
      { shape: "rectangle", t: "rect", x: 128, y: 196, w: 44, h: 74, fill: "#3f7fdc" }] },
    { key: "rocket", go: "up", pieces: [
      { shape: "rectangle", t: "rect", x: 112, y: 92, w: 76, h: 144, fill: "#e7eaf0" },
      { shape: "triangle", t: "poly", pts: [[112, 94], [150, 20], [188, 94]], fill: "#e2574c" },
      { shape: "circle", t: "circle", cx: 150, cy: 138, r: 22, fill: "#3f7fdc" },
      { shape: "triangle", t: "poly", pts: [[112, 170], [70, 250], [112, 236]], fill: "#f08a35" },
      { shape: "triangle", t: "poly", pts: [[188, 170], [230, 250], [188, 236]], fill: "#f08a35" }] },
    { key: "car", go: "drive", pieces: [
      { shape: "rectangle", t: "rect", x: 30, y: 150, w: 240, h: 64, fill: "#e2574c" },
      { shape: "rectangle", t: "rect", x: 86, y: 98, w: 120, h: 54, fill: "#8fc8ef" },
      { shape: "circle", t: "circle", cx: 88, cy: 222, r: 32, fill: "#3c4256" },
      { shape: "circle", t: "circle", cx: 212, cy: 222, r: 32, fill: "#3c4256" }] },
    { key: "snowman", go: "bounce", pieces: [
      { shape: "circle", t: "circle", cx: 150, cy: 210, r: 64, fill: "#f4f8fc" },
      { shape: "circle", t: "circle", cx: 150, cy: 104, r: 44, fill: "#f4f8fc" },
      { shape: "rectangle", t: "rect", x: 112, y: 34, w: 76, h: 34, fill: "#3c4256" },
      { shape: "triangle", t: "poly", pts: [[146, 102], [196, 112], [146, 122]], fill: "#f08a35" }] },
    { key: "tree", go: "bounce", pieces: [
      { shape: "rectangle", t: "rect", x: 132, y: 200, w: 36, h: 80, fill: "#8a5a3b" },
      { shape: "triangle", t: "poly", pts: [[54, 214], [150, 112], [246, 214]], fill: "#43a058" },
      { shape: "triangle", t: "poly", pts: [[78, 150], [150, 40], [222, 150]], fill: "#4caf62" }] }
  ];
  function pieceBox(p) {
    if (p.t === "rect") return { x: p.x, y: p.y, w: p.w, h: p.h };
    if (p.t === "circle") return { x: p.cx - p.r, y: p.cy - p.r, w: p.r * 2, h: p.r * 2 };
    var xs = p.pts.map(function (q) { return q[0]; }), ys = p.pts.map(function (q) { return q[1]; });
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
    return { x: x0, y: y0, w: Math.max.apply(null, xs) - x0, h: Math.max.apply(null, ys) - y0 };
  }
  function pieceMarkup(p, attrs) {
    if (p.t === "rect") return '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="8" ' + attrs + "/>";
    if (p.t === "circle") return '<circle cx="' + p.cx + '" cy="' + p.cy + '" r="' + p.r + '" ' + attrs + "/>";
    return '<polygon points="' + p.pts.map(function (q) { return q.join(","); }).join(" ") + '" stroke-linejoin="round" ' + attrs + "/>";
  }
  var PAD = 8;
  function pieceSvg(p) {
    var b = pieceBox(p);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (b.x - PAD) + " " + (b.y - PAD) + " " + (b.w + PAD * 2) + " " + (b.h + PAD * 2) + '">' +
      pieceMarkup(p, 'fill="' + p.fill + '" stroke="#23305e" stroke-opacity=".25" stroke-width="4"') + "</svg>";
  }

  HW.registerGame({
    id: "shapebuilder", title: "Shape builder", desc: "Tap the shapes and they make a picture",
    world: "shapes", worlds: ["shapes"], bg: "day", voice: ["circle", "square", "triangle", "rectangle", "house", "rocket", "car", "snowman", "tree"],
    icon: function () { return HW.svgEl(A.shape2("triangle", "#e2574c")); },
    start: function (g) {
      var bi = 0, box = null, row = null;
      function build() {
        if (box) box.remove(); if (row) row.remove();
        var B = BUILDS[bi % BUILDS.length], s = g.size();
        var size = Math.min(s.w * 0.9, s.h * 0.6, 460);
        box = g.el("div", "abs"); box.style.cssText = "left:50%;top:4%;width:" + size + "px;height:" + size + "px;margin-left:-" + size / 2 + "px";
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">' +
          B.pieces.map(function (p) { return pieceMarkup(p, 'fill="rgba(255,255,255,.45)" stroke="#23305e" stroke-opacity=".4" stroke-width="4" stroke-dasharray="12 9"'); }).join("") +
          B.pieces.map(function (p, i) { return '<g class="bp" data-i="' + i + '" opacity="0">' + pieceMarkup(p, 'fill="' + p.fill + '" stroke="#23305e" stroke-opacity=".25" stroke-width="4"') + "</g>"; }).join("") + "</svg>";
        box.appendChild(HW.svgEl(svg)); box.firstChild.style.cssText = "width:100%;height:100%";
        var placed = 0, order = HW.shuffle(B.pieces.map(function (p, i) { return i; }));
        row = g.el("div", "choices n" + Math.max(3, B.pieces.length));
        order.forEach(function (i) {
          var p = B.pieces[i], b = HW.el("button", "choice", row);
          b.setAttribute("aria-label", HW.word(p.shape));
          var holder = HW.el("div", "", b); holder.appendChild(HW.svgEl(pieceSvg(p))); holder.firstChild.style.cssText = "width:100%;height:100%";
          g.tap(b, async function () {
            if (b._used) return;
            b._used = true; HW.audio.sfx("note", 2 + placed); g.name(p.shape);
            /* fly the piece from the button to its place in the picture */
            var st = g.size(), bb = box.getBoundingClientRect(), sc = bb.width / 300, pb = pieceBox(p);
            var tw = (pb.w + PAD * 2) * sc, th = (pb.h + PAD * 2) * sc;
            var tx = bb.left - st.left + (pb.x - PAD) * sc, ty = bb.top - st.top + (pb.y - PAD) * sc;
            var hr = holder.getBoundingClientRect(), a = tw / th, fw, fh;
            if (a > hr.width / hr.height) { fw = hr.width; fh = fw / a; } else { fh = hr.height; fw = fh * a; }
            var fly = g.el("div", "abs"); fly.style.cssText = "left:" + tx + "px;top:" + ty + "px;width:" + tw + "px;height:" + th + "px;z-index:8;pointer-events:none";
            fly.appendChild(HW.svgEl(pieceSvg(p))); fly.firstChild.style.cssText = "width:100%;height:100%";
            var dx = hr.left - st.left + hr.width / 2 - (tx + tw / 2), dy = hr.top - st.top + hr.height / 2 - (ty + th / 2);
            b.classList.add("gone");
            await g.anim(fly, [{ transform: "translate(" + dx + "px," + dy + "px) scale(" + fw / tw + ")" }, { transform: "none" }], { duration: 750 });
            box.querySelector('.bp[data-i="' + i + '"]').setAttribute("opacity", "1");
            fly.remove(); placed++;
            if (placed === B.pieces.length) finish(B);
          }, 500);
        });
      }
      async function finish(B) {
        g.busy = true;
        await g.wait(500);
        g.bounce(box); HW.audio.sfx("grow");
        g.show(B.key); await g.say(B.key);
        if (B.go === "up") { HW.audio.sfx("whoosh", 1.4); await g.anim(box, [{ transform: "none" }, { transform: "translateY(-120%)", opacity: 0 }], { duration: 1400, easing: "ease-in" }); }
        else if (B.go === "drive") { HW.audio.sfx("engine", 1.6); await g.anim(box, [{ transform: "none" }, { transform: "translateX(120%)", opacity: 0 }], { duration: 1500, easing: "ease-in" }); }
        else await g.praise(box);
        if (B.go !== "bounce") await g.praise(null);
        await g.wait(700);
        bi++; g.busy = false; build();
      }
      build();
    }
  });

  /* ================= 27 Find the shape ================= */
  HW.registerGame({
    id: "findshape", title: "Find the shape", desc: "Emma says a shape, tap the one that fits",
    world: "shapes", worlds: ["shapes"], bg: "day", voice: ["circle", "square", "triangle", "star", "heart"],
    icon: function () { return HW.svgEl(A.shape2("heart", "#e2574c")); },
    start: function (g) {
      var SH = ["circle", "square", "triangle", "star", "heart"], cols = Object.keys(A.COLOURS), last = "", row = null;
      var hole = g.el("div", "abs"); hole.style.cssText = "left:50%;top:4%;width:min(38vmin,46%,300px);aspect-ratio:1;transform:translateX(-50%)";
      hole._baseTransform = "translateX(-50%)";
      function round() {
        if (row) row.remove();
        var target; do { target = HW.pick(SH); } while (target === last); last = target;
        hole.innerHTML = ""; hole.appendChild(HW.svgEl(A.shape2(target, "rgba(255,255,255,.5)", "#23305e", true)));
        var others = HW.shuffle(SH.filter(function (k) { return k !== target; })).slice(0, HW.settings.choices - 1);
        var items = HW.shuffle([target].concat(others)), pal = HW.shuffle(cols), right = null;
        row = g.choices(items, function (k) { return HW.svgEl(A.shape2(k, A.COLOURS[pal[items.indexOf(k)]])); }, async function (k, btn) {
          if (k !== target) { g.help(btn, right, target); return; }
          g.busy = true;
          row._btns.forEach(function (x) { g.glow(x, false); if (x !== btn) x.classList.add("gone"); });
          var h = g.centre(hole), c = g.centre(btn);
          await g.flyToPoint(btn, h.x, h.y, 800, h.w / c.w);
          hole.innerHTML = ""; hole.appendChild(HW.svgEl(A.shape2(k, A.COLOURS[pal[items.indexOf(k)]])));
          btn.classList.add("gone"); g.bounce(hole);
          g.show(k); await g.say(k);
          await g.praise(hole);
          await g.wait(600);
          g.busy = false; round();
        });
        right = row._btns[items.indexOf(target)];
        g.later(300, function () { g.name(target); });
      }
      round();
    }
  });

  /* ================= 28 Block tower ================= */
  HW.registerGame({
    id: "blocktower", title: "Block tower", desc: "Tap to stack five blocks, then knock them down",
    world: "numbers", worlds: ["numbers"], bg: "kitchen", voice: NUMS.concat(["whoosh"]),
    icon: function () { return HW.svgEl(A.block("#e2574c", 1)); },
    start: function (g) {
      var COLS = ["#e2574c", "#f2c53d", "#3f7fdc", "#4caf62", "#8e5cc7"], blocks = [], state = "build";
      var floor = g.el("div", "abs"); floor.style.cssText = "left:0;right:0;bottom:0;height:12%;background:#d8b98d;border-top:6px solid #c9a678";
      var ghost = g.el("div", "abs ghost-block glow-soft");
      function geo() { var s = g.size(), size = Math.min(s.h * 0.14, s.w * 0.22, 110); return { s: s, size: size, x: s.w / 2 - size / 2, base: s.h * 0.88 }; }
      function placeGhost() {
        var G = geo();
        ghost.style.cssText = "left:" + G.x + "px;top:" + (G.base - (blocks.length + 1) * G.size) + "px;width:" + G.size + "px;height:" + G.size + "px;display:" + (blocks.length < 5 ? "block" : "none");
      }
      async function add() {
        if (g.busy) return;
        if (state === "done") { tumble(); return; }
        if (state !== "build" || blocks.length >= 5) return;
        g.busy = true;
        var G = geo(), n = blocks.length, last = n === 4, b = g.el("div", "abs");
        var y = G.base - (n + 1) * G.size;
        b.style.cssText = "left:" + (G.x + HW.rand(-5, 5)) + "px;top:" + y + "px;width:" + G.size + "px;height:" + G.size + "px;z-index:3";
        b.appendChild(HW.svgEl(A.block(COLS[n], n + 1)));
        blocks.push(b); placeGhost();
        await g.anim(b, [{ transform: "translateY(" + (-y - G.size) + "px)" }, { transform: "none" }], { duration: 600, easing: "cubic-bezier(.3,.6,.4,1)" });
        HW.audio.sfx("woodblock"); g.bounce(b);
        g.show(NUMS[n], 1600); g.busy = false; await g.say(NUMS[n]);
        if (last && state === "build") {
          state = "wait"; await g.praise(blocks[4]);
          state = "done"; blocks.forEach(function (x) { g.glow(x, true, true); });
        }
      }
      async function tumble() {
        state = "falling"; g.busy = true;
        var G = geo();
        blocks.forEach(function (x) { g.glow(x, false); });
        HW.audio.sfx("whoosh", 0.9); g.show("whoosh"); g.say("whoosh");
        await Promise.all(blocks.map(function (b, i) {
          /* each block lands on the floor beside the others, flat on one of its sides */
          var step = Math.min(G.size * 1.2, (G.s.w - G.size - 24) / 4);
          var tx = (i - 2) * step + HW.rand(-6, 6), ty = i * G.size, rot = HW.pick([-90, 0, 90]) + HW.rand(-5, 5);
          return g.anim(b, [{ transform: "none" }, { transform: "translate(" + tx + "px," + ty + "px) rotate(" + rot + "deg)" }], { duration: 800 + i * 90, easing: "cubic-bezier(.5,0,.7,1)" });
        }));
        HW.audio.sfx("woodblock");
        await g.wait(1300);
        await Promise.all(blocks.map(function (b) { return g.anim(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, always: true }); }));
        blocks.forEach(function (b) { b.remove(); }); blocks = [];
        state = "build"; g.busy = false; placeGhost();
      }
      g.tap(g.stage, add, 300);
      placeGhost();
    }
  });

  /* ================= 29 Number pictures ================= */
  HW.registerGame({
    id: "numberpics", title: "Number pictures", desc: "See a number, tap to count that many",
    world: "numbers", worlds: ["numbers", "cars", "sea"], bg: "day", voice: NUMS.concat(["car", "clownfish", "apple", "star", "rocket"]),
    icon: function () { return HW.svgEl(A.glyph("3", "#fff", 150)); },
    start: function (g) {
      var ITEMS = ["car", "clownfish", "apple", "star", "rocket"], num = 1, round = 0, filled = 0, slots = [], tile = null;
      function setup() {
        if (tile) tile.remove(); slots.forEach(function (x) { x.remove(); }); slots = []; filled = 0;
        var s = g.size(), port = portrait(g);
        var ts = Math.min(s.h * (port ? 0.3 : 0.36), s.w * 0.4, 220);
        tile = g.el("div", "abs num-tile"); tile.style.cssText = "width:" + ts + "px;height:" + ts + "px;left:" + (port ? s.w / 2 - ts / 2 : s.w * 0.06) + "px;top:" + (port ? s.h * 0.05 : s.h / 2 - ts / 2) + "px";
        tile.appendChild(HW.svgEl(A.glyph(String(num), "#2a1d05", 150)));
        var areaX = port ? 0 : s.w * 0.06 + ts, areaW = s.w - areaX, areaY = port ? s.h * 0.05 + ts : 0, areaH = s.h - areaY;
        var per = port ? Math.min(num, 3) : Math.min(num, 5), rows = Math.ceil(num / per);
        var size = Math.min((areaW * 0.9) / per - 12, (areaH * 0.85) / rows - 12, 150);
        for (var i = 0; i < num; i++) {
          var r = Math.floor(i / per), c = i % per, inRow = Math.min(per, num - r * per);
          var cx = areaX + areaW / 2 + (c - (inRow - 1) / 2) * (size + 14), cy = areaY + areaH / 2 + (r - (rows - 1) / 2) * (size + 14);
          var sl = g.el("div", "abs slot"); sl.style.cssText = "left:" + (cx - size / 2) + "px;top:" + (cy - size / 2) + "px;width:" + size + "px;height:" + size + "px";
          slots.push(sl);
        }
        slots[0].classList.add("glow-soft");
      }
      g.tap(g.stage, async function () {
        if (g.busy || filled >= num) return;
        var sl = slots[filled], key = ITEMS[round % ITEMS.length];
        sl.classList.remove("glow-soft"); sl.classList.add("filled");
        var p = HW.picture(key); p.style.cssText = "width:84%;height:84%;margin:8%"; sl.appendChild(p);
        g.anim(p, [{ scale: ".3", opacity: 0 }, { scale: "1", opacity: 1 }], { duration: 450 });
        HW.audio.sfx("note", 2 + filled); filled++;
        if (filled < num) slots[filled].classList.add("glow-soft");
        g.show(NUMS[filled - 1], 1600);
        if (filled < num) { g.say(NUMS[filled - 1]); return; }
        g.busy = true;
        await g.say(NUMS[filled - 1]);
        await g.wait(400);
        g.bounce(tile); g.show(NUMS[num - 1]); await g.say(NUMS[num - 1]);
        await g.praise(tile);
        await g.wait(600);
        num = num >= HW.settings.countTo ? 1 : num + 1; round++;
        g.busy = false; setup();
      }, 250);
      setup();
    }
  });

  /* ================= 30 Letter pictures ================= */
  var LETTERS = [["a", "apple"], ["b", "bus"], ["c", "car"], ["d", "dog"], ["e", "egg"], ["f", "fish"], ["g", "grapes"], ["h", "house"],
    ["i", "igloo"], ["j", "jellyfish"], ["k", "kite"], ["l", "lemon"], ["m", "moon"], ["n", "nest"], ["o", "octopus"], ["p", "pear"],
    ["q", "queen"], ["r", "rocket"], ["s", "sun"], ["t", "tractor"], ["u", "umbrella"], ["v", "van"], ["w", "whale"], ["x", "fox"],
    ["y", "yoyo"], ["z", "zebra"]];
  var LETTER_COLS = ["#e2574c", "#3f7fdc", "#4caf62", "#8e5cc7", "#f08a35", "#2c8580"];
  HW.registerGame({
    id: "letters", title: "Letter pictures", desc: "Tap a big letter to see its picture",
    world: "letters", worlds: ["letters"], bg: "day", voice: LETTERS.map(function (l) { return l[1]; }),
    icon: function () { return HW.svgEl(A.wordIcon("abc")); },
    start: function (g) {
      var i = 0, shown = false, reveals = 0;
      var s = g.size(), port = portrait(g);
      var ls = Math.min(port ? s.h * 0.34 : s.h * 0.62, port ? s.w * 0.62 : s.w * 0.36, 300);
      var letter = g.el("button", "abs big-letter");
      letter.style.cssText = "width:" + ls + "px;height:" + ls + "px;font-size:" + ls * 0.72 + "px;" +
        (port ? "left:" + (s.w / 2 - ls / 2) + "px;top:" + s.h * 0.04 + "px" : "left:" + (s.w * 0.28 - ls / 2) + "px;top:" + (s.h * 0.46 - ls / 2) + "px");
      var ps = Math.min(port ? s.h * 0.3 : s.h * 0.5, port ? s.w * 0.6 : s.w * 0.34, 280);
      var pic = g.el("button", "abs letter-pic");
      pic.style.cssText = "width:" + ps + "px;" + (port ? "left:" + (s.w / 2 - ps / 2) + "px;top:" + (s.h * 0.06 + ls) + "px" : "left:" + (s.w * 0.68 - ps / 2) + "px;top:" + (s.h * 0.42 - ps / 2) + "px");
      var next = g.el("button", "abs big-btn btn-go"); next.style.cssText = "right:4%;bottom:5%;min-width:0;width:clamp(96px,20vmin,140px);height:clamp(96px,20vmin,140px);padding:0";
      next.setAttribute("aria-label", "Next"); next.innerHTML = HW.icons.arrow;
      function caption(word, ch) {
        var text = HW.word(word).replace(/\.$/, "").toLowerCase(), at = text.indexOf(ch), out = "";
        for (var k = 0; k < text.length; k++) out += k === at ? '<b style="color:' + LETTER_COLS[i % LETTER_COLS.length] + '">' + text[k] + "</b>" : text[k];
        return out;
      }
      function show() {
        var L = LETTERS[i]; shown = false;
        if (letter.getAnimations) letter.getAnimations().forEach(function (a) { a.cancel(); });
        letter.textContent = L[0]; letter.style.color = LETTER_COLS[i % LETTER_COLS.length];
        letter.setAttribute("aria-label", "Letter " + L[0]);
        pic.innerHTML = ""; pic.style.visibility = "hidden";
        g.glow(letter, true, true);
        g.anim(letter, [{ transform: "scale(.6)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 450, fill: "none" });
      }
      function reveal() {
        var L = LETTERS[i];
        if (!shown) {
          shown = true; g.glow(letter, false);
          pic.innerHTML = ""; var box = HW.el("div", "lp-img", pic); box.appendChild(HW.picture(L[1]));
          HW.el("div", "lp-word", pic).innerHTML = caption(L[1], L[0]);
          pic.setAttribute("aria-label", HW.word(L[1]));
          pic.style.visibility = "visible";
          g.anim(pic, [{ transform: "scale(.4)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 500 });
          HW.audio.sfx("reveal"); reveals++;
          g.name(L[1]).then(function () { if (reveals % 5 === 0) g.praise(pic); });
        } else { g.bounce(pic); g.name(L[1]); }
      }
      var changing = false;
      g.tap(letter, function () { if (changing) return; g.bounce(letter); reveal(); }, 600);
      g.tap(pic, function () { if (shown) { g.bounce(pic); g.name(LETTERS[i][1]); } }, 600);
      g.tap(next, async function () {
        if (changing) return;
        changing = true; HW.audio.sfx("click");
        await g.anim(letter, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
        i = (i + 1) % LETTERS.length; show(); changing = false;
      }, 700);
      show();
    }
  });

  /* ================= 31 My name ================= */
  HW.registerGame({
    id: "myname", title: "My name", desc: "Tap each letter to spell Harrison",
    world: "letters", worlds: ["letters"], bg: "space", voice: ["harrison"],
    icon: function () { return HW.svgEl(A.glyph("H", "#fff", 150)); },
    start: function (g) {
      var NAME = "Harrison", COLS = ["#e2574c", "#f2c53d", "#4caf62", "#3f7fdc", "#f08a35", "#b3b8ec", "#8fd0f5", "#f3a3c0"];
      var slots = [], k = 0, big = null, rounds = 0;
      var s = g.size(), sw = Math.min((s.w * 0.94) / NAME.length, 84, s.h * 0.2);
      var bar = g.el("div", "abs name-row"); bar.style.cssText = "left:50%;top:5%;transform:translateX(-50%);display:flex;gap:0";
      for (var i = 0; i < NAME.length; i++) {
        var sl = HW.el("div", "name-slot", bar); sl.style.cssText = "width:" + sw + "px;height:" + sw * 1.15 + "px;font-size:" + sw * 0.95 + "px";
        slots.push(sl);
      }
      var bs = Math.min(s.h * 0.42, s.w * 0.5, 260);
      function nextLetter() {
        if (big) big.remove();
        big = g.el("button", "abs big-letter glow-soft");
        big.style.cssText = "width:" + bs + "px;height:" + bs + "px;left:" + (s.w / 2 - bs / 2) + "px;top:" + (s.h * (portrait(g) ? 0.56 : 0.62) - bs / 2) + "px;font-size:" + bs * 0.72 + "px;color:" + COLS[(k + rounds) % COLS.length];
        big.textContent = NAME[k]; big.setAttribute("aria-label", "Letter " + NAME[k]);
        g.anim(big, [{ transform: "scale(.5)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, fill: "none" });
        g.tap(big, place, 500);
      }
      async function place() {
        if (g.busy) return;
        g.busy = true;
        var me = big, slot = slots[k], t = g.centre(slot), c = g.centre(me);
        me.classList.remove("glow-soft");
        HW.audio.sfx("note", 1 + k);
        await g.flyToPoint(me, t.x, t.y, 650, t.w / c.w);
        slot.textContent = NAME[k]; slot.style.color = COLS[(k + rounds) % COLS.length]; slot.classList.add("on");
        me.remove(); big = null; k++;
        if (k < NAME.length) { g.busy = false; nextLetter(); return; }
        for (var j = 0; j < slots.length; j++) { (function (el, d) { g.later(d, function () { g.bounce(el); }); })(slots[j], j * 110); }
        await g.wait(500);
        g.show("harrison"); await g.say("harrison");
        await g.praise(bar);
        await g.wait(1500);
        slots.forEach(function (x) { x.textContent = ""; x.classList.remove("on"); });
        k = 0; rounds++; g.busy = false; nextLetter();
      }
      nextLetter();
    }
  });

  /* ================= 32 Weather window ================= */
  var WX = ["sunny", "rain", "snow", "windy", "rainbow"];
  HW.registerGame({
    id: "weather", title: "Weather window", desc: "Tap the window to change the weather",
    world: "weather", worlds: ["weather"], bg: "kitchen", voice: WX,
    icon: function () { return HW.img("rainbow"); },
    start: function (g) {
      var s = g.size(), cur = "", n = 0;
      var w = Math.min(s.w * 0.9, (s.h * 0.64) * 1.35, 680), h = Math.min(s.h * 0.64, w * (portrait(g) ? 1.05 : 0.74));
      var rowTop = s.h - Math.min(Math.max(58, Math.min(s.w * 0.17, s.h * 0.19)), 150) - s.h * 0.06;
      var win = g.el("button", "abs wx-window"); win.setAttribute("aria-label", "Window");
      win.style.cssText = "left:" + (s.w / 2 - w / 2) + "px;top:" + Math.max(s.h * 0.03, (rowTop - h) / 2) + "px;width:" + w + "px;height:" + h + "px;--d:" + h + "px";
      var sky = HW.el("div", "wx-sky", win);
      var sun = HW.el("div", "wx-sun", win); sun.appendChild(HW.svgEl(A.sunRays()));
      var c1 = HW.el("div", "wx-cloud c1", win), c2 = HW.el("div", "wx-cloud c2", win);
      c1.appendChild(HW.svgEl(A.cloud())); c2.appendChild(HW.svgEl(A.cloud()));
      var rainbow = HW.el("div", "wx-arc", win); rainbow.appendChild(HW.svgEl(A.rainbow()));
      var rain = HW.el("div", "wx-layer wxl-rain rain-drops", win), snow = HW.el("div", "wx-layer wxl-snow", win), wind = HW.el("div", "wx-layer wxl-wind", win);
      for (var i = 0; i < 22; i++) { var d = HW.el("i", "", rain); d.style.cssText = "--y:" + HW.rand(5, 85).toFixed(0) + "%;left:" + HW.rand(2, 98) + "%;animation-delay:-" + HW.rand(0, 1.2).toFixed(2) + "s;animation-duration:" + HW.rand(0.9, 1.3).toFixed(2) + "s"; }
      for (i = 0; i < 16; i++) { var f = HW.svgEl(A.snowflake()); var z = HW.rand(14, 26); f.style.cssText = "--y:" + HW.rand(5, 80).toFixed(0) + "%;left:" + HW.rand(2, 94) + "%;width:" + z + "px;height:" + z + "px;animation-delay:-" + HW.rand(0, 7).toFixed(1) + "s;animation-duration:" + HW.rand(6, 9).toFixed(1) + "s"; snow.appendChild(f); }
      [0, 1].forEach(function (j) { var l = HW.svgEl(A.windLines()); l.style.cssText = "top:" + (18 + j * 30) + "%;animation-delay:-" + j * 1.4 + "s"; wind.appendChild(l); });
      var hill = HW.el("div", "wx-hill", win); hill.appendChild(HW.svgEl(A.hillTree())); hill.firstChild.setAttribute("preserveAspectRatio", "none");
      var snowCap = HW.el("div", "wx-snowcap", win);
      var tree = HW.el("div", "wx-tree", win); tree.appendChild(HW.svgEl(A.tree()));
      HW.el("div", "wx-bars", win);
      var row = g.el("div", "choices n5");
      var btns = WX.map(function (k) {
        var b = HW.el("button", "choice", row); b.setAttribute("aria-label", HW.word(k));
        b.appendChild(HW.svgEl(A.weatherIcon(k)));
        g.tap(b, function () { g.bounce(b); set(k); }, 500);
        return b;
      });
      var SFX = { sunny: "reveal", rain: "drip", snow: "sparkle", windy: "whoosh", rainbow: "grow" };
      function set(k) {
        if (k === cur) { g.bounce(win); g.name(k); return; }
        cur = k; n++;
        win.className = "abs wx-window wx-" + k;
        btns.forEach(function (b, j) { b.classList.toggle("on", WX[j] === k); });
        HW.audio.sfx(SFX[k]);
        g.name(k).then(function () { if (n % 6 === 0) g.praise(win); });
      }
      g.tap(win, function () { set(WX[(WX.indexOf(cur) + 1) % WX.length]); }, 600);
      set("sunny");
    }
  });

  /* ================= 33 Puddle splash ================= */
  HW.registerGame({
    id: "puddles", title: "Puddle splash", desc: "Tap a puddle to splash in wellies",
    world: "weather", worlds: ["weather"], bg: "garden", voice: ["puddle", "splash", "rain"],
    icon: function () { return HW.svgEl(A.wellies()); },
    start: function (g) {
      var s = g.size(), splashes = 0;
      var cloud = g.el("button", "abs"); cloud.setAttribute("aria-label", "Rain cloud");
      var cw = Math.min(s.w * 0.4, s.h * 0.4, 300);
      cloud.style.cssText = "left:" + (s.w / 2 - cw / 2) + "px;top:2%;width:" + cw + "px;height:" + cw * 0.62 + "px;z-index:3";
      cloud.appendChild(HW.svgEl(A.greyCloud()));
      var rain = g.el("div", "abs puddle-rain rain-drops"); rain.style.cssText = "left:" + (s.w / 2 - cw * 0.4) + "px;top:" + (s.h * 0.02 + cw * 0.5) + "px;width:" + cw * 0.8 + "px;height:" + s.h * 0.45 + "px;--d:" + s.h * 0.45 + "px";
      for (var i = 0; i < 12; i++) { var d = HW.el("i", "", rain); d.style.cssText = "--y:" + HW.rand(5, 85).toFixed(0) + "%;left:" + HW.rand(4, 96) + "%;animation-delay:-" + HW.rand(0, 1.4).toFixed(2) + "s;animation-duration:" + HW.rand(1.1, 1.6).toFixed(2) + "s"; }
      var pw = Math.min(s.w * 0.31, 260), ph = Math.max(72, pw * 0.36), puddles = [];
      [0.18, 0.5, 0.82].forEach(function (x, j) {
        var p = g.el("button", "abs puddle glow-soft"); p.setAttribute("aria-label", "Puddle");
        p.style.cssText = "left:" + (s.w * x - pw / 2) + "px;top:" + (s.h * (j === 1 ? 0.8 : 0.7) - ph / 2) + "px;width:" + pw + "px;height:" + ph + "px";
        p.appendChild(HW.svgEl(A.puddle()));
        g.tap(p, function () { splash(p); }, 400);
        puddles.push(p);
      });
      async function splash(p) {
        if (p._busy) return;
        p._busy = true;
        puddles.forEach(function (q) { q.classList.remove("glow-soft"); });
        var c = g.centre(p), bw = pw * 0.62;
        var boots = g.el("div", "abs"); boots.style.cssText = "left:" + (c.x - bw / 2) + "px;top:" + (c.y - bw * 0.6) + "px;width:" + bw + "px;height:" + bw * 0.63 + "px;z-index:4;pointer-events:none";
        boots.appendChild(HW.svgEl(A.wellies()));
        await g.anim(boots, [{ transform: "translateY(-" + bw + "px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "ease-in" });
        HW.audio.sfx("splash"); g.anim(p, [{ scale: "1" }, { scale: "1.12" }, { scale: "1" }], { duration: 500 });
        for (var k = 0; k < (HW.reducedMotion() ? 0 : 10); k++) {
          var dr = g.el("div", "abs drop"); var dz = HW.rand(10, 18);
          dr.style.cssText = "left:" + (c.x - dz / 2) + "px;top:" + (c.y - dz / 2) + "px;width:" + dz + "px;height:" + dz + "px";
          var ang = Math.PI * (0.1 + 0.8 * k / 9), dist = HW.rand(pw * 0.4, pw * 0.75);
          /* keep every drop on the screen */
          var room = Math.cos(ang) > 0 ? c.x - 8 : s.w - c.x - 8;
          if (Math.abs(Math.cos(ang)) > 0.05) dist = Math.min(dist, room / Math.abs(Math.cos(ang)));
          (function (el, dx, dy) {
            g.anim(el, [{ transform: "translate(0,0)", opacity: 1 }, { transform: "translate(" + dx * 0.6 + "px," + (dy - 30) + "px)", opacity: 1, offset: 0.5 }, { transform: "translate(" + dx + "px," + (dy * 0.2) + "px)", opacity: 0 }],
              { duration: 800, easing: "ease-out", always: true }).then(function () { el.remove(); });
          })(dr, -Math.cos(ang) * dist, -Math.sin(ang) * dist * 0.7);
        }
        splashes++;
        g.show("splash", 1500);
        var talk = g.say("splash");
        await g.wait(600);
        await g.anim(boots, [{ transform: "none", opacity: 1 }, { transform: "translateY(-" + bw * 0.6 + "px)", opacity: 0 }], { duration: 450 });
        boots.remove();
        await talk;
        if (splashes % 4 === 0) await g.praise(p);
        p._busy = false;
      }
      g.tap(cloud, function () { g.wiggle(cloud); HW.audio.sfx("drip"); g.name("rain"); }, 600);
      g.later(500, function () { g.name("puddle"); });
    }
  });

  /* ================= 34 Colouring ================= */
  HW.registerGame({
    id: "colouring", title: "Colouring", desc: "Pick a colour, then tap the picture",
    world: "art", worlds: ["art", "dinner"], bg: "kitchen", voice: PALETTE.concat(A.COLOURING_ORDER), keepOnResize: true,
    icon: function () { return HW.img("palette"); },
    start: function (g) {
      var pi = 0, colour = PALETTE[0], pic = null, praised = false;
      var grid = potGrid(g, PALETTE, function (n) { return HW.svgEl(A.paintPot(A.COLOURS[n])); }, function (n) { colour = n; g.name(n); });
      var next = cornerButton(g, grid, "Next picture", HW.icons.arrow); next.classList.add("go");
      function show() {
        if (pic) pic.remove();
        var key = A.COLOURING_ORDER[pi % A.COLOURING_ORDER.length];
        pic = g.el("div", "abs colour-pic");
        place();
        pic.appendChild(HW.svgEl(A.COLOURING[key]()));
        praised = false; next.classList.remove("glow");
        g.anim(pic, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
        g.tap(pic, function (ev) { fill(ev); }, 120);
        g.later(300, function () { g.name(key); });
      }
      function place() {
        var W = picArea(g, grid);
        pic.style.cssText = "left:" + W.x + "px;top:" + W.y + "px;width:" + W.w + "px;height:" + W.h + "px";
      }
      g.onResize(function () { grid.layout(); next.layout(); if (pic) place(); });
      function fill(ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest(".cz") : null;
        if (!t) {
          /* forgiving: a tap just outside a shape colours the nearest one */
          var best = null, bd = 48;
          pic.querySelectorAll(".cz").forEach(function (el) {
            var r = el.getBoundingClientRect();
            var dx = Math.max(r.left - ev.clientX, 0, ev.clientX - r.right), dy = Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom);
            var dd = Math.sqrt(dx * dx + dy * dy); if (dd < bd) { bd = dd; best = el; }
          });
          t = best;
        }
        if (!t) return;
        t.style.fill = A.COLOURS[colour]; t._done = true;
        HW.audio.sfx("note", HW.randInt(2, 8));
        var all = [].every.call(pic.querySelectorAll(".cz"), function (el) { return el._done; });
        if (all && !praised) { praised = true; g.praise(pic); g.glow(next, true); }
      }
      g.tap(next, async function () {
        HW.audio.sfx("click");
        await g.anim(pic, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
        pi++; show();
      }, 700);
      show();
    }
  });

  /* ================= 35 Finger paint ================= */
  var GLOW = { red: "#ff6b6b", yellow: "#ffd84a", blue: "#5fb0ff", green: "#5fe08a", orange: "#ffa24a", purple: "#c48bff" };
  HW.registerGame({
    id: "fingerpaint", title: "Finger paint", desc: "Draw with a finger in glowing colours",
    world: "art", worlds: ["art", "dinner", "calm"], bg: "night", voice: PALETTE, keepOnResize: true,
    icon: function () { return HW.svgEl(A.paintPot("#c48bff")); },
    start: function (g) {
      var colour = "yellow", ptrs = {}, dpr = Math.min(window.devicePixelRatio || 1, 2), strokes = 0;
      var cv = g.el("canvas", "abs paint-canvas"); cv.style.cssText = "left:0;top:0;width:100%;height:100%;touch-action:none";
      var ctx = cv.getContext("2d");
      var order = ["yellow", "red", "blue", "green", "orange", "purple"];
      var grid = potGrid(g, order, function (n) { return HW.svgEl(A.paintPot(GLOW[n])); }, function (n) { colour = n; g.name(n); });
      var clear = cornerButton(g, grid, "Clear the picture", HW.img("sponge"));
      function size() {
        var r = g.stage.getBoundingClientRect(), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
        if (cv.width === w && cv.height === h) return;
        var old = null;
        if (cv.width && cv.height) { old = document.createElement("canvas"); old.width = cv.width; old.height = cv.height; old.getContext("2d").drawImage(cv, 0, 0); }
        cv.width = w; cv.height = h;
        if (old) ctx.drawImage(old, 0, 0);
      }
      size();
      var onResize = function () { size(); };
      window.addEventListener("resize", onResize);
      g.onCleanup(function () { window.removeEventListener("resize", onResize); });
      g.onResize(function () { size(); grid.layout(); clear.layout(); });
      function width() { var r = g.stage.getBoundingClientRect(); return Math.max(10, Math.min(24, Math.min(r.width, r.height) * 0.035)) * dpr; }
      function pt(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * (cv.width / r.width), y: (ev.clientY - r.top) * (cv.height / r.height) }; }
      function stroke(a, b, c) {
        ctx.save();
        ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = width();
        ctx.strokeStyle = GLOW[c]; ctx.shadowColor = GLOW[c]; ctx.shadowBlur = width() * 1.1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + 0.01, b.y); ctx.stroke();
        ctx.restore();
      }
      cv.addEventListener("pointerdown", function (ev) {
        if (!g.alive) return;
        HW.audio.unlock();
        try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
        var p = pt(ev); ptrs[ev.pointerId] = p; stroke(p, p, colour);
        var r = cv.getBoundingClientRect();
        HW.audio.sfx("note", Math.round((1 - (ev.clientY - r.top) / r.height) * (HW.audio.pentaCount - 1)));
        strokes++;
        if (strokes === 25) g.praise(null);
      });
      cv.addEventListener("pointermove", function (ev) {
        var last = ptrs[ev.pointerId]; if (!last) return;
        var list = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev];
        if (!list.length) list = [ev];
        list.forEach(function (e) { var p = pt(e); stroke(last, p, colour); last = p; });
        ptrs[ev.pointerId] = last;
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { cv.addEventListener(t, function (ev) { delete ptrs[ev.pointerId]; }); });
      g.tap(clear, async function () {
        HW.audio.sfx("whoosh", 0.8); g.wiggle(clear);
        await g.anim(cv, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, always: true });
        ctx.clearRect(0, 0, cv.width, cv.height);
        cv.getAnimations && cv.getAnimations().forEach(function (a) { a.cancel(); });
        cv.style.opacity = 1; strokes = 0;
      }, 900);
      g.later(400, function () { g.name("yellow"); });
    }
  });

  /* ================= 36 Stamp pictures ================= */
  HW.registerGame({
    id: "stamps", title: "Stamp pictures", desc: "Pick a stamp, then tap to stamp it anywhere",
    world: "art", worlds: ["art", "dinner", "planets", "cars"], bg: "kitchen", voice: ["saturn", "car", "clownfish", "apple", "star", "rocket"], keepOnResize: true,
    icon: function () { return HW.img("rocket"); },
    start: function (g) {
      var STAMPS = ["saturn", "car", "clownfish", "apple", "star", "rocket"], pick = STAMPS[0], live = [], count = 0;
      var grid = potGrid(g, STAMPS, function (k) { return HW.picture(k); }, function (k) { pick = k; g.name(k); });
      var clear = cornerButton(g, grid, "Clear the picture", HW.img("sponge"));
      g.onResize(function () { grid.layout(); clear.layout(); });
      g.tap(g.stage, function (ev) {
        if (ev.target.closest && ev.target.closest("button, .pot-grid")) return;
        var s = g.size(), x = (ev.clientX || 0) - s.left, y = (ev.clientY || 0) - s.top;
        var z = Math.max(64, Math.min(150, Math.min(s.w, s.h) * 0.22));
        var st = g.el("div", "abs stamp"); st.style.cssText = "left:" + (x - z / 2) + "px;top:" + (y - z / 2) + "px;width:" + z + "px;height:" + z + "px;rotate:" + HW.rand(-12, 12).toFixed(0) + "deg";
        st.appendChild(HW.picture(pick));
        g.anim(st, [{ scale: "1.5", opacity: 0 }, { scale: "1", opacity: 1 }], { duration: 260, easing: "ease-out" });
        HW.audio.sfx("stamp"); live.push(st); count++;
        if (live.length > 40) { var old = live.shift(); g.anim(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, always: true }).then(function () { old.remove(); }); }
        if (count === 1 || count % 10 === 0) g.name(pick);
      }, 150);
      g.tap(clear, async function () {
        HW.audio.sfx("whoosh", 0.8); g.wiggle(clear);
        var all = live; live = [];
        await Promise.all(all.map(function (el) { return g.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, always: true }); }));
        all.forEach(function (el) { el.remove(); });
      }, 900);
      g.later(400, function () { g.name(pick); });
    }
  });

  /* earlier games that also belong in the new worlds */
  function tag(id, w) { var d = HW.gameById[id]; if (d && d.worlds.indexOf(w) < 0) d.worlds.push(w); }
  tag("garage", "shapes");
  tag("count", "numbers"); tag("fishhome", "numbers");
  tag("paint", "art"); tag("colourfish", "art");
  ["twinkle", "fishtank", "bubbles", "seafriends", "weather"].forEach(function (id) { tag(id, "dinner"); });
})();
