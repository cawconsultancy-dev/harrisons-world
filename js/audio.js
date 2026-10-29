/* Harrison's World: sound.
   - Calm instrumental music composed live on the tablet (no files, no vocals),
     always in F major so every game sound fits with it.
   - Emma's recorded words, one clip per word.
   - Soft sound effects. A limiter on the output means nothing is ever sudden or loud. */
(function () {
  "use strict";
  var HW = window.HW;
  var ctx = null, out, limiter, musicBus, musicDuck, voiceBus, sfxBus, reverb, revSend;
  var started = false, musicPlaying = false, schedTimer = null, nextBarTime = 0, barIndex = 0;
  var buffers = {}, pending = {}, current = null, currentResolve = null;

  var BPM = 60, BEAT = 60 / BPM, BAR = BEAT * 4;
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* F major pentatonic, used by every tapped note so it always sounds kind */
  var PENTA = [65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91];

  /* 8 bar loop: F, Am7, Dm7, Bbmaj7, F, Gm7, Bbmaj7, Cadd9 */
  var CHORDS = [
    { root: 41, tones: [53, 57, 60, 64] },
    { root: 45, tones: [52, 55, 57, 60] },
    { root: 38, tones: [53, 57, 60, 62] },
    { root: 46, tones: [50, 53, 57, 62] },
    { root: 41, tones: [53, 57, 60, 65] },
    { root: 43, tones: [50, 53, 55, 58] },
    { root: 46, tones: [53, 57, 58, 62] },
    { root: 48, tones: [52, 55, 60, 62] }
  ];
  var MELODY_POOL = [
    [72, 77, 81, 84], [72, 76, 79, 81], [74, 77, 81, 86], [70, 74, 77, 81],
    [72, 77, 81, 84], [74, 77, 79, 82], [70, 74, 77, 81], [72, 74, 79, 84]
  ];

  function volFor(level) { return level === "medium" ? 0.5 : 0.32; }

  function makeImpulse(seconds, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    var buf = ctx.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function init() {
    if (ctx) return true;
    try { if (navigator.audioSession) navigator.audioSession.type = "ambient"; } catch (e) {}
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC({ latencyHint: "interactive" }); } catch (e) { ctx = new AC(); }

    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -16; limiter.knee.value = 10; limiter.ratio.value = 8;
    limiter.attack.value = 0.004; limiter.release.value = 0.3;
    out = ctx.createGain(); out.gain.value = 0.85;
    out.connect(limiter); limiter.connect(ctx.destination);

    reverb = ctx.createConvolver(); reverb.buffer = makeImpulse(3.4, 2.6);
    var revOut = ctx.createGain(); revOut.gain.value = 0.55;
    reverb.connect(revOut); revOut.connect(out);

    musicBus = ctx.createGain(); musicBus.gain.value = 0;
    musicDuck = ctx.createGain(); musicDuck.gain.value = 1;
    var musicTone = ctx.createBiquadFilter(); musicTone.type = "lowpass"; musicTone.frequency.value = 2600;
    musicBus.connect(musicDuck); musicDuck.connect(musicTone); musicTone.connect(out);
    revSend = ctx.createGain(); revSend.gain.value = 0.6; musicDuck.connect(revSend); revSend.connect(reverb);

    voiceBus = ctx.createGain(); voiceBus.gain.value = 1.0; voiceBus.connect(out);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(out);
    var sfxRev = ctx.createGain(); sfxRev.gain.value = 0.35; sfxBus.connect(sfxRev); sfxRev.connect(reverb);

    document.addEventListener("visibilitychange", function () {
      if (!ctx) return;
      if (document.hidden) { try { ctx.suspend(); } catch (e) {} }
      else if (started) { try { ctx.resume(); } catch (e) {} }
    });
    return true;
  }

  /* Must be called from a tap: tablets only allow sound after a touch. */
  function unlock() {
    if (!init()) return;
    if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    if (!started) {
      started = true;
      var b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); try { s.start(0); } catch (e) {}
      applyMusic();
    }
  }

  /* ---------------- music ---------------- */
  function seeded(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function padNote(m, t, dur, vol) {
    var f = mtof(m);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 1.6);
    g.gain.setValueAtTime(vol, t + dur - 0.2);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 2.4);
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 950; lp.Q.value = 0.3;
    [-4, 4].forEach(function (cents, i) {
      var o = ctx.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f; o.detune.value = cents;
      o.connect(lp); o.start(t); o.stop(t + dur + 2.6);
    });
    lp.connect(g); g.connect(musicBus);
  }

  function bell(m, t, vol, bus, decay) {
    var f = mtof(m), d = decay || 2.2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    var o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
    var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2.01;
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(0.22, t); g2.gain.exponentialRampToValueAtTime(0.001, t + d * 0.45);
    var o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = f * 3.98;
    var g3 = ctx.createGain(); g3.gain.setValueAtTime(0.06, t); g3.gain.exponentialRampToValueAtTime(0.0005, t + d * 0.25);
    o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g);
    g.connect(bus || musicBus);
    [o1, o2, o3].forEach(function (o) { o.start(t); o.stop(t + d + 0.1); });
  }

  function scheduleBar(t, n) {
    var ch = CHORDS[n % 8];
    ch.tones.forEach(function (m) { padNote(m, t, BAR, 0.045); });
    padNote(ch.root, t, BAR, 0.05);
    /* a few music-box notes per bar, gently varied each time round */
    var pool = MELODY_POOL[n % 8];
    var pattern = [[0, 2], [0, 1.5, 3], [1, 2.5], [0, 2, 3]][Math.floor(seeded(n) * 4)];
    pattern.forEach(function (beat, i) {
      var m = pool[Math.floor(seeded(n * 7 + i * 13) * pool.length)];
      bell(m, t + beat * BEAT + 0.02, 0.05, musicBus, 2.6);
    });
  }

  function scheduler() {
    if (!musicPlaying) return;
    while (nextBarTime < ctx.currentTime + 2.5) {
      scheduleBar(nextBarTime, barIndex);
      nextBarTime += BAR; barIndex++;
    }
  }

  function startMusic() {
    if (!ctx || musicPlaying) return;
    musicPlaying = true;
    nextBarTime = ctx.currentTime + 0.15;
    scheduler();
    schedTimer = setInterval(scheduler, 400);
  }
  function stopMusicSoon() {
    musicPlaying = false;
    clearInterval(schedTimer); schedTimer = null;
  }

  function applyMusic() {
    if (!ctx || !started) return;
    var on = HW.settings.music;
    var now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setValueAtTime(musicBus.gain.value, now);
    if (on) {
      startMusic();
      musicBus.gain.linearRampToValueAtTime(volFor(HW.settings.musicVol), now + 2.5);
    } else {
      musicBus.gain.linearRampToValueAtTime(0, now + 1.2);
      setTimeout(function () { if (!HW.settings.music) stopMusicSoon(); }, 1400);
    }
  }

  function duck(on) {
    if (!ctx) return;
    var now = ctx.currentTime;
    musicDuck.gain.cancelScheduledValues(now);
    musicDuck.gain.setValueAtTime(musicDuck.gain.value, now);
    musicDuck.gain.linearRampToValueAtTime(on ? 0.45 : 1, now + (on ? 0.15 : 0.8));
  }

  /* ---------------- voice ---------------- */
  function decode(ab) {
    return new Promise(function (res, rej) {
      var p = ctx.decodeAudioData(ab, res, rej);
      if (p && p.then) p.then(res, rej);
    });
  }
  /* Emma's words: normal speed in audio/v, a slower copy of each in audio/s */
  function loadVoice(key) {
    var path = (HW.settings.voiceSpeed === "slower" ? "audio/s/" : "audio/v/") + key + ".mp3";
    if (buffers[path]) return Promise.resolve(buffers[path]);
    if (pending[path]) return pending[path];
    if (!ctx) return Promise.reject(new Error("no audio"));
    var timeout = new Promise(function (_, rej) { setTimeout(function () { rej(new Error("slow " + key)); }, 4000); });
    pending[path] = Promise.race([fetch(path), timeout])
      .then(function (r) { if (!r.ok) throw new Error("missing " + key); return r.arrayBuffer(); })
      .then(decode)
      .then(function (b) { buffers[path] = b; delete pending[path]; return b; })
      .catch(function (e) { delete pending[path]; throw e; });
    return pending[path];
  }
  function preload(keys) { if (ctx) keys.forEach(function (k) { loadVoice(k).catch(function () {}); }); }

  function stopVoice() {
    if (current) { try { current.stop(); } catch (e) {} current = null; }
    if (currentResolve) { var r = currentResolve; currentResolve = null; r(); }
    duck(false);
  }

  function say(key) {
    return new Promise(function (resolve) {
      if (!ctx || !started || !HW.settings.voice) { setTimeout(resolve, 350); return; }
      stopVoice();
      var myResolve = resolve;
      currentResolve = myResolve;
      loadVoice(key).then(function (buf) {
        if (currentResolve !== myResolve) return;
        var s = ctx.createBufferSource(); s.buffer = buf; s.connect(voiceBus);
        current = s; duck(true);
        function finish() {
          if (current === s) { current = null; duck(false); }
          if (currentResolve === myResolve) { currentResolve = null; myResolve(); }
        }
        s.onended = finish;
        /* never let a game wait forever on a word, even if sound is paused */
        setTimeout(finish, buf.duration * 1000 + 1500);
        s.start();
      }).catch(function () { if (currentResolve === myResolve) { currentResolve = null; myResolve(); } });
    });
  }

  /* ---------------- sound effects (all soft) ---------------- */
  function noiseBuf() {
    if (noiseBuf.b) return noiseBuf.b;
    var len = ctx.sampleRate, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (noiseBuf.b = b);
  }
  function noise(t, dur, type, freq, q, vol, attack) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
    var g = ctx.createGain(); var a = attack || 0.01;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur + 0.05);
    return f;
  }
  function tone(type, f0, f1, t, dur, vol) {
    var o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }

  var SFX = {
    chime: function (t) { [77, 81, 84].forEach(function (m, i) { bell(m, t + i * 0.14, 0.11, sfxBus, 1.8); }); },
    note: function (t, i) { bell(PENTA[Math.max(0, Math.min(PENTA.length - 1, i))], t, 0.16, sfxBus, 2.4); },
    pop: function (t) { tone("sine", 700, 220, t, 0.09, 0.14); noise(t, 0.05, "highpass", 2500, 0.7, 0.03); },
    bubble: function (t) { for (var i = 0; i < 3; i++) tone("sine", HW.rand(900, 1500), HW.rand(1600, 2200), t + i * 0.06, 0.06, 0.05); },
    whoosh: function (t, dur) {
      var d = dur || 1.2, f = noise(t, d, "bandpass", 300, 0.8, 0.09, d * 0.45);
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1400, t + d * 0.6);
    },
    engine: function (t, dur) {
      var d = dur || 2;
      [55, 55.7].forEach(function (fr) {
        var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(fr, t);
        o.frequency.linearRampToValueAtTime(fr * 1.35, t + d * 0.5); o.frequency.linearRampToValueAtTime(fr, t + d);
        var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320;
        var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.35);
        g.gain.setValueAtTime(0.06, t + d - 0.5); g.gain.linearRampToValueAtTime(0.0001, t + d);
        o.connect(lp); lp.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + d + 0.05);
      });
    },
    munch: function (t) { for (var i = 0; i < 3; i++) noise(t + i * 0.18, 0.09, "bandpass", 900, 1.2, 0.09); },
    drum: function (t) { tone("sine", 150, 55, t, 0.45, 0.4); noise(t, 0.06, "lowpass", 1200, 0.7, 0.06); },
    shake: function (t) { for (var i = 0; i < 3; i++) noise(t + i * 0.09, 0.07, "highpass", 6000, 0.7, 0.09); },
    bells: function (t) { bell(81, t, 0.12, sfxBus, 1.6); bell(86, t + 0.12, 0.1, sfxBus, 1.6); },
    woodblock: function (t) { tone("sine", 1050, 900, t, 0.08, 0.22); noise(t, 0.03, "bandpass", 1800, 4, 0.08); },
    reveal: function (t) { tone("sine", 440, 880, t, 0.5, 0.07); },
    drip: function (t) { for (var i = 0; i < 3; i++) tone("sine", 1200 - i * 150, 500, t + i * 0.2, 0.12, 0.08); },
    sparkle: function (t) { [89, 86, 84, 81].forEach(function (m, i) { bell(m, t + i * 0.09, 0.06, sfxBus, 1.2); }); },
    stir: function (t) { noise(t, 1.0, "bandpass", 600, 1.5, 0.05, 0.4); },
    grow: function (t) { [65, 69, 72, 77].forEach(function (m, i) { bell(m, t + i * 0.16, 0.09, sfxBus, 1.6); }); },
    click: function (t) { tone("sine", 660, 600, t, 0.06, 0.06); },
    splash: function (t) { noise(t, 0.4, "lowpass", 1500, 0.8, 0.11, 0.005); for (var i = 0; i < 4; i++) tone("sine", HW.rand(500, 900), HW.rand(1100, 1600), t + 0.05 + i * 0.05, 0.07, 0.04); },
    stamp: function (t) { tone("sine", 190, 90, t, 0.16, 0.22); noise(t, 0.05, "lowpass", 700, 0.7, 0.05); }
  };

  function sfx(name, arg) {
    if (!ctx || !started || !HW.settings.sfx) return;
    if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    var fn = SFX[name]; if (fn) fn(ctx.currentTime + 0.01, arg);
  }

  HW.audio = {
    unlock: unlock, say: say, stopVoice: stopVoice, preload: preload, sfx: sfx,
    applyMusic: applyMusic, isStarted: function () { return started; },
    /* used only by the automated checks to record a sample of the sound */
    captureStream: function () { if (!ctx) return null; var d = ctx.createMediaStreamDestination(); limiter.connect(d); return d.stream; },
    pentaCount: PENTA.length
  };
})();
