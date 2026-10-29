/* Harrison's World: start screen, home screen, game screen and the grown-ups area. */
(function () {
  "use strict";
  var HW = window.HW, A = HW.art, app = document.getElementById("app");
  var current = null, kit = null, inGame = false, pushedGame = false;

  var WORLDS = [
    { id: "all", key: "w_all", label: "All games", icon: function () { return HW.img("sparkles"); } },
    { id: "planets", key: "w_planets", label: "Planets", icon: function () { return HW.svgEl(A.planet("saturn")); } },
    { id: "fruitveg", key: "w_fruitveg", label: "Fruit and veg", icon: function () { return HW.img("apple"); } },
    { id: "cars", key: "w_cars", label: "Cars", icon: function () { return HW.svgEl(A.car(A.COLOURS.red)); } },
    { id: "sea", key: "w_sea", label: "Sea", icon: function () { return HW.svgEl(A.clownfish()); } },
    { id: "music", key: "w_music", label: "Music", icon: function () { return HW.img("note"); } },
    { id: "calm", key: "w_calm", label: "Calm", icon: function () { return HW.svgEl(A.sleepyMoon()); } }
  ];
  var worldFilter = "all";

  function visibleGames() { return HW.games.filter(function (g) { return HW.settings.hidden.indexOf(g.id) < 0; }); }
  function todayGame() {
    var vis = visibleGames(); if (!vis.length) return null;
    if (HW.settings.today !== "auto" && HW.gameById[HW.settings.today] && vis.indexOf(HW.gameById[HW.settings.today]) >= 0) return HW.gameById[HW.settings.today];
    var d = new Date(), day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
    return vis[day % vis.length];
  }

  function clear() {
    if (kit) { kit.stop(); kit = null; }
    app.innerHTML = "";
  }

  /* ---------- the hero planet circle ---------- */
  function heroOrbit(badgeEl) {
    var orbit = HW.el("div", "orbit");
    HW.el("div", "orbit-ring", orbit);
    var dw = HW.el("div", "orbit-dot-wrap", orbit); HW.el("div", "orbit-dot", dw);
    var circ = HW.el("div", "hero-circle", orbit);
    circ.appendChild(HW.svgEl(A.planet("earth")));
    if (badgeEl) { var b = HW.el("div", "hero-badge", orbit); b.appendChild(badgeEl); }
    return orbit;
  }

  function musicButton(cls) {
    var b = HW.el("button", "round-btn music-btn " + (cls || ""));
    function paint() {
      b.innerHTML = HW.settings.music ? HW.icons.music : HW.icons.musicOff;
      b.classList.toggle("off", !HW.settings.music);
      b.setAttribute("aria-label", HW.settings.music ? "Music on. Tap to turn off" : "Music off. Tap to turn on");
    }
    paint();
    HW.onPress(b, function () { HW.settings.music = !HW.settings.music; HW.saveSettings(); HW.audio.applyMusic(); paint(); }, 600);
    return b;
  }

  /* grown-ups button: press and hold for two seconds */
  function grownUpButton() {
    var b = HW.el("button", "pill-btn"); b.setAttribute("aria-label", "Grown-ups: press and hold");
    b.innerHTML = HW.icons.person;
    var ring = HW.el("div", "hold-ring", b);
    ring.innerHTML = '<svg width="100%" height="100%" preserveAspectRatio="none"><rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="32" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>';
    var rect = ring.querySelector("rect"), timer = null, t0 = 0, raf = null;
    function start(e) {
      if (e.cancelable) e.preventDefault();
      t0 = Date.now();
      raf = requestAnimationFrame(tick);
      timer = setTimeout(function () { stop(); HW.go("grownups"); }, 2000);
    }
    function tick() { var p = Math.min(1, (Date.now() - t0) / 2000); rect.setAttribute("stroke-dashoffset", String(100 - p * 100)); raf = requestAnimationFrame(tick); }
    function stop() {
      var held = Date.now() - t0;
      clearTimeout(timer); cancelAnimationFrame(raf); rect.setAttribute("stroke-dashoffset", "100");
      if (t0 && held < 600) showHint("Grown-ups: press and hold");
      t0 = 0;
    }
    b.addEventListener("pointerdown", start);
    b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop); b.addEventListener("pointercancel", stop);
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    return b;
  }
  function showHint(text) {
    var old = document.querySelector(".hint"); if (old) old.remove();
    var h = HW.el("div", "hint", document.body); h.textContent = text;
    setTimeout(function () { h.remove(); }, 2200);
  }

  function header(withButtons) {
    var h = HW.el("div", "header");
    var badge = HW.el("div", "badge", h); badge.appendChild(HW.svgEl(A.planet("saturn")));
    var t = HW.el("div", "title", h); t.textContent = "Harrison's World";
    if (withButtons) { h.appendChild(musicButton()); h.appendChild(grownUpButton()); }
    return h;
  }

  function worldClass(id) { return "w-" + id; }

  /* ---------- start screen: Hello, Harrison ---------- */
  function renderStart() {
    clear(); current = "start";
    var s = HW.el("div", "screen start stars-bg fade-in", app);
    var corner = HW.el("div", "start-corner", s); corner.appendChild(musicButton());
    s.appendChild(heroOrbit(null));
    var t = HW.el("div", "start-title", s); t.textContent = "Harrison's World";
    var play = HW.el("button", "play-btn", s);
    play.innerHTML = '<span class="play-ico">' + HW.icons.play + "</span><span>Play</span>";
    play.setAttribute("aria-label", "Play");
    HW.onPress(play, function () {
      HW.audio.unlock();
      HW.audio.say("hello");
      HW.audio.preload(["w_all", "w_planets", "w_fruitveg", "w_cars", "w_sea", "w_music", "w_calm"].concat(HW.games.map(function (g) { return "g_" + g.id; })));
      setTimeout(function () { HW.go("home"); }, 1300);
    }, 1500);
  }

  /* ---------- home screen ---------- */
  function renderHome() {
    clear(); current = "home";
    var s = HW.el("div", "screen scroll stars-bg fade-in", app);
    s.appendChild(header(true));
    var tg = todayGame();
    if (tg) {
      var hero = HW.el("div", "hero", s);
      var badge = tg.icon();
      hero.appendChild(heroOrbit(badge));
      HW.el("div", "hero-kicker", hero, "Today's game");
      HW.el("div", "hero-title", hero).textContent = tg.title;
      HW.el("div", "hero-sub", hero).textContent = tg.desc;
      var play = HW.el("button", "play-btn", hero);
      play.innerHTML = '<span class="play-ico">' + HW.icons.play + "</span><span>Play</span>";
      HW.onPress(play, function () { startGame(tg); }, 1200);
    }

    var recent = HW.settings.recent.map(function (id) { return HW.gameById[id]; })
      .filter(function (g) { return g && HW.settings.hidden.indexOf(g.id) < 0; }).slice(0, 4);
    if (recent.length) {
      HW.el("div", "section-title", s).textContent = "Play again";
      var chips = HW.el("div", "chips", s);
      recent.forEach(function (g) {
        var c = HW.el("button", "chip", chips);
        var ic = HW.el("div", "chip-ico " + worldClass(g.world), c); ic.appendChild(g.icon());
        HW.el("span", "", c).textContent = g.title;
        HW.onPress(c, function () { startGame(g); }, 1200);
      });
    }

    HW.el("div", "section-title", s).textContent = "Pick a world";
    var worlds = HW.el("div", "worlds", s);
    var grid = HW.el("div", "grid", s);
    WORLDS.forEach(function (w) {
      var b = HW.el("button", "world" + (w.id === worldFilter ? " on" : ""), worlds);
      var ic = HW.el("div", "world-ico " + worldClass(w.id), b); ic.appendChild(w.icon());
      HW.el("span", "", b).textContent = w.label;
      HW.onPress(b, function () {
        worldFilter = w.id; HW.audio.say(w.key);
        worlds.querySelectorAll(".world").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); fillGrid(grid);
      }, 700);
    });
    fillGrid(grid);
  }

  function fillGrid(grid) {
    grid.innerHTML = "";
    var list = visibleGames().filter(function (g) { return worldFilter === "all" || g.worlds.indexOf(worldFilter) >= 0; });
    if (!list.length) { var n = HW.el("div", "empty-note", grid); n.textContent = "No games here yet. A grown-up can show more games in the grown-ups area."; n.style.gridColumn = "1 / -1"; return; }
    list.forEach(function (g) {
      var c = HW.el("button", "card", grid);
      c.setAttribute("aria-label", g.title);
      var top = HW.el("div", "card-top " + worldClass(g.world), c); top.appendChild(g.icon());
      var body = HW.el("div", "card-body", c);
      HW.el("div", "card-title", body).textContent = g.title;
      HW.el("div", "card-desc", body).textContent = g.desc;
      HW.onPress(c, function () { startGame(g); }, 1200);
    });
  }

  /* ---------- games ---------- */
  function startGame(def) {
    HW.settings.recent = [def.id].concat(HW.settings.recent.filter(function (x) { return x !== def.id; })).slice(0, 6);
    HW.saveSettings();
    HW.audio.unlock();
    try { history.pushState({ g: def.id }, "", "#play-" + def.id); pushedGame = true; } catch (e) { pushedGame = false; }
    renderGame(def);
  }

  function renderGame(def) {
    clear(); current = "game"; inGame = true;
    var s = HW.el("div", "screen game-screen fade-in", app);
    var bar = HW.el("div", "topbar", s);
    var home = HW.el("button", "round-btn", bar); home.innerHTML = HW.icons.home; home.setAttribute("aria-label", "All done, go home");
    var title = HW.el("div", "topbar-title", bar);
    HW.el("span", "tb-name", title).textContent = def.title;
    HW.el("span", "tb-word", title);
    bar.appendChild(musicButton());
    var stage = HW.el("div", "stage " + (def.bg || "space"), s);
    HW.audio.preload((def.voice || []).concat(["welldone", "yay", "goodjob", "brilliant", "welldone_h", "alldone"]));
    var intro = HW.audio.say("g_" + def.id);
    HW.onTap(home, function () {
      if (kit) { kit.stop(); kit = null; }
      HW.audio.say("alldone");
      HW.leaveGame();
    }, 1000);
    kit = HW.makeKit(stage, def, intro);
    try { def.start(kit); } catch (e) { console.error(e); }
  }

  HW.leaveGame = function () {
    inGame = false;
    if (pushedGame) { pushedGame = false; try { history.back(); return; } catch (e) {} }
    renderHome();
  };
  HW.goStart = function () {
    inGame = false;
    if (pushedGame) { pushedGame = false; try { history.replaceState(null, "", "#"); } catch (e) {} }
    renderStart();
  };

  window.addEventListener("popstate", function () {
    var h = location.hash || "";
    if (h.indexOf("#play-") === 0 && HW.gameById[h.slice(6)] && current !== "game") { pushedGame = true; renderGame(HW.gameById[h.slice(6)]); return; }
    if (current === "game" || current === "grownups") { pushedGame = false; renderHome(); }
  });

  /* ---------- grown-ups area ---------- */
  function renderGrownUps() {
    clear(); current = "grownups";
    var s = HW.el("div", "screen scroll gu fade-in", app);
    var head = HW.el("div", "gu-head", s);
    HW.el("h1", "", head).textContent = "Grown-ups";
    var close = HW.el("button", "gu-close", head); close.textContent = "Back to games";
    HW.onPress(close, function () { renderHome(); }, 600);
    var body = HW.el("div", "gu-body", s);

    function section(t) { HW.el("h2", "", body).textContent = t; }
    function row(label, sub, control) {
      var r = HW.el("div", "gu-row", body);
      var l = HW.el("div", "", r); HW.el("div", "lbl", l).textContent = label;
      if (sub) HW.el("div", "sub", l).textContent = sub;
      r.appendChild(control); return r;
    }
    function toggle(key, after) {
      var b = HW.el("button", "switch" + (HW.settings[key] ? " on" : ""));
      b.setAttribute("role", "switch"); b.setAttribute("aria-checked", String(!!HW.settings[key]));
      HW.onPress(b, function () {
        HW.settings[key] = !HW.settings[key]; HW.saveSettings();
        b.classList.toggle("on", HW.settings[key]); b.setAttribute("aria-checked", String(HW.settings[key]));
        if (after) after();
      }, 300);
      return b;
    }
    function seg(key, options, after) {
      var w = HW.el("div", "seg");
      options.forEach(function (o) {
        var b = HW.el("button", HW.settings[key] === o[0] ? "on" : "", w); b.textContent = o[1];
        HW.onPress(b, function () {
          HW.settings[key] = o[0]; HW.saveSettings();
          w.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
          if (after) after();
        }, 300);
      });
      return w;
    }

    section("Sound");
    row("Music", "Calm music plays on every screen", toggle("music", HW.audio.applyMusic));
    row("Music volume", null, seg("musicVol", [["quiet", "Quiet"], ["medium", "Medium"]], HW.audio.applyMusic));
    row("Spoken words", "Emma says each word", toggle("voice"));
    row("Sound effects", "Soft taps, notes, and chimes", toggle("sfx"));

    section("Games");
    row("Pictures to choose from", "In matching games", seg("choices", [[2, "2"], [3, "3"]]));
    row("Count up to", "In Count with me", seg("countTo", [[3, "3"], [5, "5"]]));
    row("Movement", "Less movement if he finds it too busy", seg("motion", [["normal", "Normal"], ["reduced", "Less"]]));
    var sel = HW.el("select");
    var o0 = HW.el("option", "", sel); o0.value = "auto"; o0.textContent = "Changes each day";
    HW.games.forEach(function (g) { var o = HW.el("option", "", sel); o.value = g.id; o.textContent = g.title; });
    sel.value = HW.settings.today;
    sel.addEventListener("change", function () { HW.settings.today = sel.value; HW.saveSettings(); });
    row("Today's game", "The big game on the home screen", sel);

    section("Which games show");
    HW.el("p", "", body).textContent = "Fewer games means fewer choices for him. Tap a game to show or hide it.";
    var gl = HW.el("div", "gu-games", body);
    HW.games.forEach(function (g) {
      var b = HW.el("button", "gu-game" + (HW.settings.hidden.indexOf(g.id) < 0 ? " on" : ""), gl);
      var gi = HW.el("div", "gi " + worldClass(g.world), b); gi.appendChild(g.icon());
      HW.el("span", "", b).textContent = g.title; HW.el("span", "tick", b);
      HW.onPress(b, function () {
        var i = HW.settings.hidden.indexOf(g.id);
        if (i >= 0) HW.settings.hidden.splice(i, 1); else HW.settings.hidden.push(g.id);
        HW.saveSettings(); b.classList.toggle("on", i >= 0);
      }, 300);
    });

    section("Playing together");
    var ul = HW.el("ul", "", body);
    [
      "Sit with him when you can. Say the word with Emma, then pause and give him time to try.",
      "Copy what he does and enjoy it with him. There is no right or wrong way to play.",
      "In Ready, steady, go!, wait after “steady” so he can say “go” before you tap.",
      "Use More and All done in real life too, at snack time and bath time.",
      "UK guidance for 2 to 5 year olds is no more than an hour of screen time a day, and no screens in the hour before bed.",
      "This is a play app for fun and gentle learning, not therapy."
    ].forEach(function (t) { HW.el("li", "", ul).textContent = t; });

    section("Put it on the home screen");
    var ul2 = HW.el("ul", "", body);
    [
      "iPad: open this page in Safari, tap the Share button, then Add to Home Screen.",
      "Android tablet: open this page in Chrome, tap the three-dot menu, then Install app or Add to Home screen.",
      "Amazon Fire tablet: open this page in Silk and bookmark it. Fire tablets may not let it install or work offline.",
      "Open it once with internet so every game saves for offline play.",
      "To keep him in the app, search the tablet's Settings for Guided Access (iPad) or App pinning (Android).",
      "Works best on iPadOS 15 or later, or an up-to-date Android tablet with Chrome.",
      "No sound on an iPhone or older iPad? Check the silent switch and the volume buttons."
    ].forEach(function (t) { HW.el("li", "", ul2).textContent = t; });
    var off = HW.el("p", "", body); off.innerHTML = 'Offline: <span class="status-wait">checking…</span>';
    offlineStatus(off.querySelector("span"));

    section("Privacy");
    HW.el("p", "", body).textContent = "Harrison's World has no accounts, adverts, cookies, tracking, microphone, or links to other websites. Your settings are saved only on this tablet. The website host (GitHub) keeps visitor IP addresses in its own security logs.";

    section("About");
    var credits = HW.el("p", "", body);
    credits.innerHTML = "Version " + HW.version + ". Music is composed by the app as it plays. Words are spoken by a computer voice (Kokoro, Apache 2.0 licence). " +
      "Fruit, veg, and some vehicle pictures are Twemoji by Twitter, Inc and other contributors, licensed under CC-BY 4.0. Font: Fredoka, SIL Open Font Licence. Planet, car, alien, and sea animal drawings are original.";
  }

  function offlineStatus(el) {
    if (!("serviceWorker" in navigator) || !window.caches) { el.className = "status-wait"; el.textContent = "this browser cannot save it for offline use."; return; }
    caches.keys().then(function (keys) {
      var k = keys.filter(function (x) { return x.indexOf("hw-") === 0; }).pop();
      if (!k) { el.className = "status-wait"; el.textContent = "not saved yet. Open it once with internet."; return; }
      return caches.open(k).then(function (c) { return c.keys(); }).then(function (reqs) {
        var need = (window.HW_PRECACHE_COUNT || 0);
        if (need && reqs.length >= need) { el.className = "status-ok"; el.textContent = "ready. Every game works without internet."; }
        else { el.className = "status-wait"; el.textContent = "saving (" + reqs.length + " of " + (need || "?") + " files)."; }
      });
    }).catch(function () { el.textContent = "unknown."; });
  }

  HW.startGameById = function (id) { if (HW.gameById[id]) startGame(HW.gameById[id]); };
  HW.go = function (screen) {
    if (screen === "home") { if (inGame && pushedGame) { HW.leaveGame(); return; } renderHome(); }
    else if (screen === "grownups") renderGrownUps();
    else renderStart();
  };

  /* ---------- boot ---------- */
  HW.saveSettings();
  if (location.hash) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  renderStart();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        fetch("precache-count.json").then(function (r) { return r.json(); }).then(function (j) { window.HW_PRECACHE_COUNT = j.count; }).catch(function () {});
      }).catch(function () {});
    });
  }
})();
