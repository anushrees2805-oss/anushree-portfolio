/* ==========================================================================
   Anushree Sahu — Portfolio · interactions
   ========================================================================== */
(function () {
  'use strict';
  var S = window.SITE, D = window.DIMS;
  var root = document.documentElement;
  var REDUCED = root.classList.contains('reduced');
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- tiny UI sounds, synthesised live (no files) ----------
     Browsers keep sound locked until the visitor's first click / tap / key,
     so until then these simply stay silent. */
  var SFX = (function () {
    var AC = window.AudioContext || window.webkitAudioContext, ctx = null, out = null, noiseBuf = null, lastTick = 0, tock = false;
    function init() {
      if (ctx || !AC) return ctx;
      ctx = new AC(); out = ctx.createGain(); out.gain.value = 3.2;
      /* a gentle limiter so the louder effects never crackle */
      var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -10; lim.knee.value = 8; lim.ratio.value = 8; lim.attack.value = 0.002; lim.release.value = 0.15;
      out.connect(lim); lim.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return ctx;
    }
    var gestured = false;
    function unlock() {
      gestured = true;
      /* iPhone: let sound play even when the ring/silent switch is on */
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      if (!init()) return;
      if (ctx.state !== 'running') ctx.resume().catch(function () {});
      /* Safari / iOS: playing a silent sample inside the tap is what actually unlocks audio */
      try { var b = ctx.createBuffer(1, 1, 22050), sn = ctx.createBufferSource(); sn.buffer = b; sn.connect(ctx.destination); sn.start(0); } catch (e) {}
    }
    ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(function (ev) { addEventListener(ev, unlock, true); });
    function ready() {
      if (window.__muted || !init()) return false;
      if (ctx.state === 'running') return true;
      /* audio is still waking up after the first tap: queue the sound instead of dropping it */
      var act = gestured || (navigator.userActivation && navigator.userActivation.hasBeenActive);
      if (act) { ctx.resume().catch(function () {}); return true; }
      return false;
    }
    function noise(t, dur, type, f, q, vol, f2) {
      var src = ctx.createBufferSource(); src.buffer = noiseBuf;
      var bq = ctx.createBiquadFilter(); bq.type = type; bq.frequency.setValueAtTime(f, t); bq.Q.value = q;
      if (f2) bq.frequency.exponentialRampToValueAtTime(f2, t + dur);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
      src.connect(bq); bq.connect(g); g.connect(out); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
      return g.gain;
    }
    function tone(t, f, f2, dur, vol, type) {
      var o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      ctxGet: function () { return init(); },
      unlocked: function () { return gestured || !!(navigator.userActivation && navigator.userActivation.hasBeenActive); },
      isReady: function () { return ready(); },
      /* timeline: a soft, rounded wooden "tok" — no noise, low and quiet */
      tick: function () {
        /* a muted wooden tap, gentle — like a soft desk clock */
        if (!ready()) return; var now = performance.now(); if (now - lastTick < 110) return; lastTick = now;
        var t = ctx.currentTime; tock = !tock; var f = tock ? 560 : 640;
        var o = ctx.createOscillator(), lpf = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f * 1.04, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.015);
        lpf.type = 'lowpass'; lpf.frequency.value = 1100;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        o.connect(lpf); lpf.connect(g); g.connect(out); o.start(t); o.stop(t + 0.08);
      },
      /* the word reel: a quiet music-box note per word, stepping gently up and down a pentatonic scale */
      roll: function () {
        if (!ready()) return; var t = ctx.currentTime;
        var notes = [659.25, 783.99, 880, 987.77, 1174.66, 987.77, 880, 783.99];
        this._rn = ((this._rn || 0) + 1) % notes.length; var f = notes[this._rn];
        var o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 2400;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.03, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + 0.4);
      },
      /* gentle click for tags, projects and stories */
      click: function () {
        if (!ready()) return; var t = ctx.currentTime;
        var g = noise(t, 0.025, 'highpass', 2500, 0.7, 0); g.linearRampToValueAtTime(0.1, t + 0.001); g.exponentialRampToValueAtTime(0.0001, t + 0.03);
        tone(t, 1150, 700, 0.08, 0.1);
      },
      /* the faintest swish when the pointer brushes a keychain tag */
      hover: function () {
        if (!ready()) return; var now = performance.now(); if (now - lastTick < 90) return; lastTick = now;
        var t = ctx.currentTime;
        var g = noise(t, 0.09, 'bandpass', 1800, 1.2, 0, 3600); g.linearRampToValueAtTime(0.1, t + 0.03); g.exponentialRampToValueAtTime(0.0001, t + 0.09);
        tone(t, 2400, 2100, 0.05, 0.045);
      },
      /* a soft cardboard "pop" — the hamper lid lifting */
      pop: function () {
        if (!ready()) return; var t = ctx.currentTime;
        tone(t, 210, 90, 0.18, 0.12, 'sine');
        var g = noise(t, 0.12, 'lowpass', 900, 0.8, 0); g.linearRampToValueAtTime(0.06, t + 0.008); g.exponentialRampToValueAtTime(0.0001, t + 0.12);
      },
      /* a tiny, cute jingle — little bells as the charms swing into each other */
      jingle: function (amt) {
        if (!ready()) return; var now = performance.now(); if (now - (this._jl || 0) < 140) return; this._jl = now;
        var t = ctx.currentTime, v = Math.min(1, amt || 0.5), base = [2093, 2349, 2637, 3136, 3520];
        for (var k = 0; k < 2 + (v > 0.6 ? 1 : 0); k++) {
          var f = base[Math.floor(Math.random() * base.length)] * (1 + (Math.random() - .5) * 0.02), at = t + k * (0.035 + Math.random() * 0.03);
          tone(at, f, null, 0.35, 0.035 * v + 0.016);
          tone(at, f * 2.7, null, 0.08, 0.01 * v);
        }
      },
      /* her mouth opening: a soft little "pop" as the lips part, a breath of air as it widens,
         and a gentle bell that rings on and slowly fades away by itself (~4s) */
      mouth: function () {
        if (!ready()) return; var t = ctx.currentTime;
        /* pop */
        var o = ctx.createOscillator(), og = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(520, t + 0.16);
        og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.26, t + 0.012); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.25);
        /* breath of air, opening up */
        var g = noise(t + 0.05, 1.8, 'bandpass', 500, 0.8, 0, 2600);
        g.linearRampToValueAtTime(0.1, t + 0.6); g.exponentialRampToValueAtTime(0.0001, t + 1.85);
      },
      mouthEnd: function () {},
      /* the "ting" that rings as her name appears */
      ting: function () {
        if (!ready()) return; var t = ctx.currentTime - 0.1;
        [[0.12, 587.33, 0.065], [0.20, 739.99, 0.048], [0.30, 880.0, 0.04], [0.42, 1174.66, 0.028]].forEach(function (n) {
          var b = ctx.createOscillator(), h = ctx.createOscillator(), bg = ctx.createGain(), hg = ctx.createGain(), at = t + n[0];
          b.type = 'sine'; b.frequency.value = n[1]; h.type = 'sine'; h.frequency.value = n[1] * 2.76;
          bg.gain.setValueAtTime(0, at); bg.gain.linearRampToValueAtTime(n[2], at + 0.02); bg.gain.exponentialRampToValueAtTime(0.0001, at + 4.2);
          hg.gain.setValueAtTime(0, at); hg.gain.linearRampToValueAtTime(n[2] * 0.25, at + 0.01); hg.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
          b.connect(bg); h.connect(hg); bg.connect(out); hg.connect(out);
          b.start(at); h.start(at); b.stop(at + 4.3); h.stop(at + 1);
        });
      }

    };
  })();
  function lerp(a, b, t) { return a + (b - a) * t; }
  var ease = {
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    outExpo: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    inOutCubic: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    inOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; },
    outBack: function (t) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  function tween(ms, fn, ez) {
    ez = ez || ease.outCubic;
    return new Promise(function (res) {
      var t0 = performance.now();
      function step(now) {
        var t = clamp((now - t0) / ms, 0, 1);
        fn(ez(t), t);
        if (t < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* image lookup — n is the 1-based number of the image in its folder */
  function img(folder, n) {
    var row = D[folder][n - 1];
    var file = row[0], isGif = /\.gif$/.test(file);
    return {
      src: 'assets/' + folder + '/' + file,
      small: isGif ? 'assets/' + folder + '/' + file : 'assets/' + folder + '/' + file.replace('.webp', '-s.webp'),
      w: row[1], h: row[2], ar: row[1] / row[2], n: n, folder: folder
    };
  }
  function imgTag(o, opt) {
    opt = opt || {};
    var src = opt.small ? o.small : o.src;
    var srcset = (!opt.small && o.small !== o.src) ? ' srcset="' + o.small + ' 720w, ' + o.src + ' ' + o.w + 'w" sizes="' + (opt.sizes || '100vw') + '"' : '';
    return '<img src="' + src + '"' + srcset + ' alt="' + esc(opt.alt || '') + '" width="' + o.w + '" height="' + o.h + '" loading="' + (opt.eager ? 'eager' : 'lazy') + '" decoding="async"' + (opt.ar ? ' style="--ar:' + o.w + '/' + o.h + '"' : '') + '>';
  }
  function count(folder) { return D[folder].length; }
  /* a story's frames in their original order, minus any repeated shots listed in `skip` */
  function storyFrames(s) { var a = []; for (var n = 1; n <= count(s.folder); n++) if ((s.skip || []).indexOf(n) < 0) a.push(n); return a; }
  function project(slug) { return S.projects.filter(function (p) { return p.slug === slug; })[0]; }
  function story(slug) { return S.stories.filter(function (p) { return p.slug === slug; })[0]; }

  /* ======================================================================
     RENDER STATIC-FROM-DATA SECTIONS
     ====================================================================== */
  var TIMELINE = [
    { no: '01', title: 'Branding & Packaging', desc: 'Brand identities built from scratch, and packaging from dieline to shelf.', long: 'It starts with a name, a feeling and a lot of questions. I build **the whole identity** — logo, colour, type, voice — then carry it onto **boxes, jars, bags and signs**.', items: ['SunBuns', 'Kōgen', 'Pulse', 'Nexibles'], href: '#branding' },
    { no: '02', title: 'Visual Storytelling', sub: ' through my lens', desc: 'Short films, fashion shoots and places, told through light and framing.', long: '**Short films, fashion shoots** and the city when nobody is posing. **Light, framing and mood** do most of the talking here.', items: ['Films', 'Fashion shoots', 'Places'], href: '#lens' },
    { no: '03', title: 'Illustrations & Posters', desc: 'Characters, faces and type, drawn digitally.', long: '**Characters with too much personality**, pop-art faces and **posters that play with type**. Mostly drawn in Procreate, usually while overthinking one tiny detail.', items: ['Characters', 'Portraits', 'Posters'], href: '#illustration' }
  ];

  /* timeline wheel — words on an arc; scrolling turns it. Chapter names are the stops. */
  var ARC = [
    ['Research', null, 'b'], ['moodboards', null, 's'], ['References'], ['sketches', null, 's'], ['Questions', null, 'b'],
    ['Branding & Packaging', 0], ['Brand identity', null, 'b'], ['logo design', null, 's'], ['Colour palettes'], ['Typography', null, 'b'], ['brand voice', null, 's'], ['Packaging'], ['Dielines', null, 'b'], ['mockups', null, 's'], ['SunBuns', null, 'p'], ['Kōgen', null, 'p'], ['Pulse', null, 'p'], ['Nexibles', null, 'p'], ['monocartons', null, 's'],
    ['Visual Storytelling', 1], ['Short films', null, 'b'], ['film edits', null, 's'], ['Fashion shoots'], ['Styling', null, 'b'], ['places', null, 's'], ['Gulls at the Gateway'], ['Kumbharvada', null, 'p'], ['light', null, 's'], ['Framing', null, 'b'],
    ['Illustrations & Posters', 2], ['Character design', null, 'b'], ['portraits', null, 's'], ['Procreate'], ['Pop art', null, 'b'], ['line drawing', null, 's'], ['Typographic posters'], ['Product posters', null, 'b'], ['lettering', null, 's'],
    ['sound', null, 's'], ['Mood', null, 'b'], ['stories', null, 's']
  ];
  /* the process keyring — one hanging tag per step, each with a visual */
  var PROC = [
    { t: 'Research', d: 'Getting to know the brand — who it is for and what is already out there.', img: 'assets/research/p06-s.webp', c: 'red' },
    { t: 'Moodboard', d: 'Collecting visual references around the brand and connecting them with words.', img: 'assets/research/p09-s.webp', c: 'white' },
    { t: 'Ideation', d: 'Concepts, colour, pattern and type explorations.', img: 'assets/research/p08-s.webp', c: 'grey' },
    { t: 'Sketches', d: 'Characters and layouts, drawn by hand first.', img: 'assets/research/p10-s.webp', c: 'black' },
    { t: 'Execution', d: 'Brand identity, logo, colour palette, packaging and mockups.', img: 'assets/sunbuns/12-s.webp', c: 'red' },
    { t: 'Test prints', d: 'Printed, folded and checked in hand before the final file.', img: 'assets/nexibles/testprint-s.webp', c: 'white' },
    { t: 'On-shelf display', d: 'The final packs, out in the world.', img: 'assets/hamper/shelf.webp', c: 'grey' }
  ];
  function renderTimeline() {
    var host = $('#procTrack'); if (!host) return;
    host.insertAdjacentHTML('beforeend', PROC.map(function (p, i) {
      return '<figure class="ptag ptag--' + p.c + '" data-i="' + i + '">' +
        '<span class="ptag__ring" aria-hidden="true"></span><span class="ptag__body">' +
        '<span class="ptag__hole" aria-hidden="true"></span>' +
        '<span class="ptag__img"><img src="' + p.img + '" alt="' + esc(p.t) + '" loading="lazy" decoding="async"></span>' +
        '<span class="ptag__no mono">Step ' + pad(i + 1) + '</span><span class="ptag__t">' + esc(p.t) + '</span><span class="ptag__d">' + esc(p.d) + '</span>' +
        '</span></figure>';
    }).join(''));
  }

  /* the word "ad": its own full black screen between the hero and About that plays by itself like a short video.
     Every word has the same font, colour and size and sits dead centre; a soft scroll tick plays with each word.
     It restarts each time it comes into view and loops. */
  var VIBE = ['Curious', 'Creative', 'Imaginative', 'Out of the box', 'Playful', 'Observant', 'Bold', 'Detail-obsessed',
    'Storyteller', 'Hands-on', 'Experimental', 'Dreamy', 'Empathetic', 'Quirky'];
  function vibeRoll() {
    var host = $('#vibeRoll'), screen = $('#vibeScreen'); if (!host) return;
    var STEP = REDUCED ? 1100 : 460;
    host.innerHTML = VIBE.map(function (w) { return '<span class="vw">' + esc(w) + '</span>'; }).join('');
    var els = $$('.vw', host), n = els.length, i = 0, timer = 0, vis = false;
    /* one size for every word: the biggest that lets the longest word fit */
    function fit() {
      host.style.fontSize = '100px';
      var widest = Math.max.apply(null, els.map(function (e) { return e.scrollWidth; }));
      var size = 100 * (screen.clientWidth * 0.86) / widest;
      host.style.fontSize = Math.min(size, 150, screen.clientHeight * 0.3).toFixed(1) + 'px';
    }
    function paint() {
      els.forEach(function (el, k) {
        var r = ((k - i) % n + n) % n; if (r > n / 2) r -= n;
        el.className = 'vw ' + (r === 0 ? 'is-cur' : r === -1 ? 'is-prev' : r === 1 ? 'is-next' : r < 0 ? 'is-up' : 'is-down');
      });
    }
    function tick() { i = (i + 1) % n; paint(); SFX.roll(); timer = setTimeout(tick, STEP); }
    function play() { stop(); i = 0; paint(); SFX.roll(); timer = setTimeout(tick, STEP); }
    function stop() { clearTimeout(timer); timer = 0; }
    fit(); paint();
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fit);
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(fit, 120); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      var now = es[0].intersectionRatio >= 0.5; if (now === vis) return; vis = now;
      if (vis && !document.hidden) play(); else stop();
    }, { threshold: [0, 0.5, 1] }).observe(screen);
    else { vis = true; play(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (vis) play(); });
  }

  /* the ending video before Contact: rows of "let's …" lines flow sideways, each lighting up as it passes the
     middle (where you read it). After ~6s it lands on "Let's create." and the contact page glides up beneath it. */
  var OUTRO = [
    ["Let's create", "Let's collaborate", "Let's build a brand", "Let's design the box"],
    ["Your idea + my design", "Let's tell your story", "Let's make it memorable"],
    ["Let's work together", "Let's sketch it out", "Let's make people stop & look"],
    ["Say hello", "Let's talk", "Let's create something meaningful"]
  ];
  function outroReel() {
    var scr = $('#outroScreen'), host = $('#outroRows'), sec = $('#outro'), contact = $('#contact'); if (!scr) return;
    var DUR = REDUCED ? 1800 : 3400, SPEED = [0.09, -0.11, 0.08, -0.1];
    host.innerHTML = OUTRO.map(function (row) {
      var one = row.map(function (p) { return '<span class="op">' + esc(p) + '</span><i class="od"></i>'; }).join('');
      return '<div class="or"><div class="or__t">' + one + one + one + '</div></div>';
    }).join('');
    var tracks = $$('.or__t', host), spans = $$('.op', host), raf = 0, t0 = 0, vis = false, ended = false, segs = [];
    function measure() { segs = tracks.map(function (tr) { return tr.scrollWidth / 3; }); }
    function frame(now) {
      raf = 0; if (!vis) return;
      var t = now - t0, w = scr.clientWidth, cx = w / 2;
      tracks.forEach(function (tr, k) {
        var seg = segs[k] || 1, x = ((SPEED[k] * w * t / 1000) % seg + seg) % seg;
        tr.style.transform = 'translate3d(' + (-seg + x - (k % 2 ? seg * 0.35 : 0)).toFixed(1) + 'px,0,0)';
      });
      var sl = scr.getBoundingClientRect().left;
      spans.forEach(function (sp) {
        var r = sp.getBoundingClientRect(), d = Math.abs(r.left - sl + r.width / 2 - cx) / (w * 0.5);
        var o = 0.1 + 0.9 * Math.pow(Math.max(0, 1 - d), 1.8); sp.style.opacity = o.toFixed(3);
      });
      if (t > DUR && !scr.classList.contains('is-end')) scr.classList.add('is-end');
      if (t > DUR + 1000 && !ended) { ended = true; finish(); }
      if (!ended) raf = requestAnimationFrame(frame);
    }
    function finish() {
      if (contact) contact.classList.add('is-pop');
      /* if the viewer is still watching, bring the contact page up */
      var r = sec.getBoundingClientRect();
      if (!REDUCED && vis && Math.abs(r.top) < innerHeight * 0.25) {
        var y0 = scrollY, y1 = contact.getBoundingClientRect().top + scrollY;
        tween(1100, function (e) { scrollTo({ top: y0 + (y1 - y0) * e, behavior: 'instant' }); }, ease.inOutCubic);
      }
    }
    function play() { cancelAnimationFrame(raf); ended = false; scr.classList.remove('is-end'); measure(); t0 = performance.now(); raf = requestAnimationFrame(frame); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      var now = es[0].intersectionRatio >= 0.6; if (now === vis) return; vis = now;
      if (vis) play(); else { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: [0, 0.6, 1] }).observe(scr);
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(measure, 150); });
  }

  /* about: the hamper — a box full of packaging that opens as you arrive */
  var HAMPER = [
    ['h01', 'kogen'], ['h02', 'sunbuns'], ['h03', 'nexibles'], ['h04', 'sunbuns'], ['h05', 'nexibles'],
    ['h06', 'pulse'], ['h07', 'nexibles'], ['h08', 'nexibles'], ['h09', 'kogen']
  ];
  function renderHamper() {
    var host = $('#hamperPacks'); if (!host) return;
    var n = HAMPER.length;
    host.innerHTML = HAMPER.map(function (h, i) {
      var a = (i - (n - 1) / 2) / ((n - 1) / 2);            /* -1 … 1 across the fan */
      var x = a * 118, y = -(1 - a * a) * 46 - 150 + (i % 2) * 34, r = a * 26;
      return '<a class="hpack" href="#/work/' + h[1] + '" data-cursor="Open" style="--x:' + x.toFixed(0) + '%;--y:' + y.toFixed(0) + '%;--r:' + r.toFixed(1) + 'deg;--d:' + (i * 70) + 'ms;--z:' + (10 - Math.abs(i - (n - 1) / 2)).toFixed(0) + '">' +
        '<img src="assets/hamper/' + h[0] + '.webp" alt="' + h[1] + ' packaging" loading="lazy" decoding="async" width="640" height="640"></a>';
    }).join('');
  }

  function renderProjects() {
    var host = $('#plist'), h = '';
    S.projects.forEach(function (p, i) {
      if (p.internship) h += '<div class="plist__divider"><span class="pill pill--red mono">Internship</span><span class="mono dim">Real packaging, designed at Nexibles</span></div>';
      var t = p.logo ? { src: p.logo, small: p.logo.replace('.webp', '-s.webp'), w: 2400, h: 1350 } : img(p.folder, p.thumb);
      h += '<a class="prow" href="#/work/' + p.slug + '" data-cursor="Open">' +
        '<span class="prow__no mono">' + p.no + '</span>' +
        '<span class="prow__title">' + esc(p.title) + '</span>' +
        '<span class="prow__meta"><strong>' + esc(p.line) + '</strong><span class="mono dim">' + esc(p.discipline) + '</span>' +
        '<span class="pill mono' + (p.internship ? ' pill--red' : '') + '">' + esc(p.kind) + '</span></span>' +
        '<span class="prow__thumb">' + imgTag(t, { small: true, alt: p.title + ' preview' }) + '<span class="prow__arrow" aria-hidden="true">→</span></span>' +
        '</a>';
    });
    host.innerHTML = h;
  }

  var illList = [];
  function renderIllustrations() {
    /* two clear subsections — posters first, then illustrations — each a tidy row of equal-height pieces */
    var host = $('#illGallery'), h = '', I = S.illustrations, k = 0;
    [['Posters', function (it) { return /poster/i.test(it.title); }], ['Illustrations', function (it) { return !/poster/i.test(it.title); }]].forEach(function (grp) {
      var list = I.items.filter(grp[1]); if (!list.length) return;
      h += '<div class="ill-grp"><h3 class="ill-grp__h"><span>' + grp[0] + '</span><span class="mono dim">' + pad(list.length) + ' pieces</span></h3><div class="ill-row">';
      list.forEach(function (it, j) {
        var o = img(I.folder, it.n), i = k++;
        illList.push({ src: o.src, cap: it.title + ' — ' + it.note });
        h += '<figure class="gal reveal" style="flex:' + o.ar.toFixed(3) + ' 1 0" data-lb="ill" data-i="' + i + '" data-cursor="View" tabindex="0" role="button" aria-label="View ' + esc(it.title + ', ' + it.note) + '">' +
          '<div class="gal__img">' + imgTag(o, { sizes: '(max-width:640px) 100vw, 50vw', alt: it.title + ' — ' + it.note }) + '</div>' +
          '<figcaption><span class="mono">' + pad(j + 1) + ' — ' + esc(it.note) + '</span></figcaption></figure>';
      });
      h += '</div></div>';
    });
    host.innerHTML = h;
  }


  function renderFilms() {
    $('#films').innerHTML = S.films.map(function (f, i) {
      return '<button class="film reveal" type="button" data-film="' + i + '" data-cursor="Play" aria-label="Play ' + esc(f.title + ', ' + f.kind) + '">' +
        '<span class="film__frame"><img src="assets/films/' + f.file + '-poster.webp" alt="" loading="lazy" width="1600" height="900"><span class="film__play" aria-hidden="true"></span></span>' +
        '<span class="film__info"><span class="film__t">' + esc(f.title) + '</span><span class="mono dim">' + esc(f.kind) + ' · ' + f.dur + '</span></span></button>';
    }).join('');
  }

  function renderStories() {
    $('#stories').innerHTML = S.stories.map(function (s) {
      var c = img(s.folder, s.cover);
      return '<a class="story reveal" href="#/story/' + s.slug + '" data-cursor="Open">' +
        '<span class="story__frame" style="display:block">' + imgTag(c, { sizes: '(max-width:640px) 100vw, 45vw', ar: true, alt: s.title }) + '</span>' +
        '<span class="story__info"><span class="story__t">' + esc(s.title) + '</span><span class="mono">' + pad(storyFrames(s).length) + ' frames</span><span class="story__k mono">' + esc(s.kind) + '</span></span></a>';
    }).join('');
  }

  renderTimeline(); renderHamper(); vibeRoll(); outroReel(); renderProjects(); renderIllustrations(); renderFilms(); renderStories();

  /* ======================================================================
     REVEALS + NAV STATE + TIMELINE PROGRESS
     ====================================================================== */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }) : null;
  function observeReveals(ctx) {
    $$('.reveal, .reveal-lines, .tl__item', ctx).forEach(function (el) { if (io && !REDUCED) io.observe(el); else el.classList.add('in'); });
  }
  observeReveals(document);

  var navMap = { home: 'home', about: 'about', timeline: 'work', keychain: 'work', branding: 'work', illustration: 'work', lens: 'work', contact: 'contact' };
  var navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = navMap[e.target.id];
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-nav') === k); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navMap).forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  /* timeline wheel motion */
  (function arcWheel() {
    if (!$('#arc')) return;
    var arc = $('#arc'), wheelEl = $('#arcWheel'), words = $$('.arc__w', wheelEl), chs = $$('.arc__ch'), dots = $$('#arcDots span');
    var STEP = 5.4, stops = [];
    words.forEach(function (el, k) { if (el.classList.contains('arc__w--ch')) stops.push(k * STEP); });
    var R = 0, cx = 0, cy = 0, small = false, active = -1, cur = null, target = 0, raf = 0;
    function smoother(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function layout() {
      var W = arc.clientWidth, H = innerHeight;
      small = W < 760;
      R = small ? Math.min(H * 0.44, W * 1.0) : Math.min(H * 0.74, W * 0.44);
      cx = small ? -R * 0.66 : -R * 0.44; cy = small ? H * 0.36 : H * 0.52;
      wheelEl.style.left = cx + 'px'; wheelEl.style.top = cy + 'px';
      draw(cur == null ? 0 : cur, true);
    }
    function phiAt(x) { /* x: 0..2 chapter float, with a pause at each chapter */
      var i = Math.min(1, Math.floor(x)), f = x - i;
      if (x >= 2) return stops[2];
      return stops[i] + (stops[i + 1] - stops[i]) * smoother(f);
    }
    var tickIdx = null;
    function draw(x) {
      var phi = phiAt(x), lo = small ? -56 : -80, hi = small ? 24 : 80;
      var ti = Math.round(phi / STEP); /* tick each time a word passes */
      tickIdx = ti;
      words.forEach(function (el, k) {
        var a = k * STEP - phi, o;
        if (a < lo - 12 || a > hi + 12) { el.style.opacity = 0; el.style.visibility = 'hidden'; return; }
        o = a < lo ? 1 - (lo - a) / 12 : a > hi ? 1 - (a - hi) / 12 : 1;
        o *= 1 - Math.min(1, Math.max(0, Math.abs(a) - 45) / 60) * 0.55;
        el.style.visibility = ''; el.style.opacity = o.toFixed(3);
        el.style.transform = 'rotate(' + a.toFixed(2) + 'deg) translate(' + R.toFixed(1) + 'px,-50%)';
      });
      var n = Math.round(x);
      if (n !== active) {
        active = n;
        chs.forEach(function (c, i) { c.classList.toggle('is-on', i === n); });
        dots.forEach(function (c, i) { c.classList.toggle('is-on', i === n); });
        words.forEach(function (el) { el.classList.toggle('is-on', +el.getAttribute('data-ch') === n && el.hasAttribute('data-ch')); });
      }
    }
    function progress() {
      var r = arc.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      return clamp((p - 0.06) / 0.88, 0, 1) * 2;
    }
    function frame() {
      raf = 0;
      cur += (target - cur) * (REDUCED ? 1 : 0.14);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      draw(cur);
      if (cur !== target) raf = requestAnimationFrame(frame);
    }
    function onScroll() { target = progress(); if (cur == null) cur = target; if (!raf) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', function () { clearTimeout(layout.t); layout.t = setTimeout(layout, 120); });
    cur = progress(); target = cur; layout();
  })();

  /* ======================================================================
     HERO NAME — fit to width
     ====================================================================== */
  var heroName = $('#heroName'), heroFit = $('.fit', heroName);
  function fitHero() {
    var cs = getComputedStyle(heroName);
    var avail = heroName.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    heroFit.style.fontSize = '100px';
    var w = heroFit.getBoundingClientRect().width;
    var f = Math.floor(100 * avail / w * 0.995 * 100) / 100; /* full width, as it was */
    heroFit.style.fontSize = f + 'px';
    return f;
  }

  /* ======================================================================
     INTRO — character, mouth opens, name emerges, name drops into hero
     ====================================================================== */
  var intro = $('#intro');
  var introDone = !root.classList.contains('play-intro');

  function finishIntro(fast) {
    if (introDone) return;
    introDone = true;
    stopIntro();
    /* swallow leftover scroll momentum so the hero stays put for a beat */
    var hold = function (e) { e.preventDefault(); };
    addEventListener('wheel', hold, { passive: false }); addEventListener('touchmove', hold, { passive: false });
    setTimeout(function () { removeEventListener('wheel', hold); removeEventListener('touchmove', hold); }, 350);
    root.classList.add('hero-in');
    $('#nav').style.opacity = '';
    root.style.overflow = '';
    intro.classList.add('is-done');
    intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fast ? 350 : 1000, easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'forwards' }).onfinish = function () {
      intro.style.display = 'none';
      root.classList.remove('play-intro');
    };
  }

  /* Scroll-driven: scrolling opens her mouth fully, then the name fades up
     from low opacity inside the black, then it shifts down into the hero. */
  function runIntro() {
    var charEl = $('.intro__char', intro), mouth = $('.intro__mouth', intro), hintEl = $('.intro__hint', intro);
    try { $('span', hintEl).textContent = (FINE ? 'Click' : 'Tap') + ' to open — sound on 🔊'; } catch (e) {}
    var nameBox = $('.intro__name', intro), metas = $$('.intro__meta', intro);
    /* a white copy rides inside the black layer (so the curtain clips it) and a black copy sits on the white below */
    var nameDark = nameBox.cloneNode(false); nameDark.className = 'intro__name intro__name--dark';
    intro.insertBefore(nameDark, mouth); mouth.appendChild(nameBox);
    var dot2;
    var AR = 1289 / 1006, MX = 644.5 / 1289, MY = 675 / 1006;
    var vw, vh, cw, ch, cx, cy, left, top, rx0, ry0, R, clone, dot, s0, x0, y0, fx, fy;

    function layout() {
      vw = document.documentElement.clientWidth; vh = innerHeight;
      cw = Math.min(vw * (vw < 640 ? 0.96 : 0.74), vh * 0.6 * AR, 980); ch = cw / AR;
      cx = vw / 2; cy = vh * (vw < 640 ? 0.5 : 0.54);
      left = cx - MX * cw; top = cy - MY * ch;
      charEl.style.width = cw + 'px'; charEl.style.height = ch + 'px';
      charEl.style.transformOrigin = (MX * 100) + '% ' + (MY * 100) + '%';
      rx0 = cw * 25 / 1289; ry0 = cw * 28.5 / 1289;
      R = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) * 1.04;
      /* the name is an exact clone of the hero title, so it lands pixel-perfect */
      var F = fitHero();
      nameBox.innerHTML = '';
      clone = heroFit.cloneNode(true);
      clone.style.fontSize = F + 'px'; clone.style.transform = 'none';
      nameBox.appendChild(clone); nameBox.style.fontSize = F + 'px';
      nameDark.innerHTML = ''; nameDark.appendChild(clone.cloneNode(true)); nameDark.style.fontSize = F + 'px';
      dot = $('.dot', clone); dot2 = $('.dot', nameDark);
      nameBox.style.transform = 'none';
      var nb = clone.getBoundingClientRect();
      s0 = Math.min((vw * (vw < 640 ? 0.86 : 0.64)) / nb.width, 1);
      /* centre the letters themselves (not the text box, which has empty space above the capitals) */
      var inkC = nb.height / 2;
      try {
        var cs = getComputedStyle(clone), cv = document.createElement('canvas').getContext('2d');
        cv.font = cs.fontWeight + ' ' + F + 'px ' + cs.fontFamily;
        var m = cv.measureText('ANUSHREE SAHU');
        if (m.fontBoundingBoxAscent && m.actualBoundingBoxAscent) {
          var lead = (nb.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
          inkC = lead + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent / 2;
        }
      } catch (e) {}
      var ob = nameBox.getBoundingClientRect(), offX = nb.left - ob.left, offY = nb.top - ob.top; /* where the letters sit inside their wrapper */
      x0 = vw / 2 - (offX + nb.width / 2) * s0; y0 = vh / 2 - (offY + inkC) * s0; /* dead centre of the screen */
      var tr = heroFit.getBoundingClientRect(); fx = tr.left; fy = tr.top;
    }

    function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
    var mouthSnd = false, tingSnd = false;

    /* p: 0 → 1 over the whole intro */
    function render(p, time) {
      var a = ease.inOutCubic(seg(p, 0, 0.46));       /* mouth opens */
      /* play once sound is unlocked; if the tap is still unlocking it, try again next frame */
      if (p > 0.03 && p < 0.5 && !mouthSnd && SFX.isReady()) { mouthSnd = true; SFX.mouth(); }
      if (p > 0.40 && p < 0.75 && !tingSnd && SFX.isReady()) { tingSnd = true; SFX.ting(); }
      var b = seg(p, 0.38, 0.62);                     /* name fades up as the black fills the screen */
      var c = ease.inOutCubic(seg(p, 0.66, 1));       /* name shifts down */
      /* a tiny idle "breath" so she feels alive before you scroll */
      var breath = p < 0.02 ? 1 + Math.sin(time * 2.4) * 0.08 : 1;
      var rx = lerp(rx0 * breath, R, a), ry = lerp(ry0 * breath, R, Math.min(1, a * 1.15));
      /* once fully open the screen stays black — the hero is black too — and the name drops into place */
      mouth.style.clipPath = c > 0 ? 'none' : 'ellipse(' + rx.toFixed(2) + 'px ' + ry.toFixed(2) + 'px at ' + cx + 'px ' + cy + 'px)';
      charEl.style.transform = 'translate(' + left + 'px,' + top + 'px) scale(' + lerp(1, 1.12, a) + ')';
      charEl.style.opacity = a > 0.98 ? 0 : 1;
      hintEl.style.opacity = clamp(1 - p * 12, 0, 1);
      metas.forEach(function (m) { m.style.opacity = 1 - a; });
      /* name */
      nameBox.style.opacity = nameDark.style.opacity = b <= 0 ? 0 : lerp(0.1, 1, ease.outCubic(b));
      var sc = lerp(s0 * 0.94, s0, ease.outCubic(b));
      var s = lerp(sc, 1, c);
      nameBox.style.transform = nameDark.style.transform = 'translate(' + lerp(x0 + (s0 - sc) * clone.offsetWidth / 2, fx, c) + 'px,' + lerp(y0 + (s0 - sc) * clone.offsetHeight / 2, fy, c) + 'px) scale(' + s + ')';
      dot.style.transform = dot2.style.transform = 'scale(' + ease.outBack(seg(p, 0.5, 0.64)) + ')';
    }

    layout();
    var target = 0, cur = 0, raf = 0;
    var STEP = function () { return Math.max(800, innerHeight * 1.7); }; /* px of scrolling for the full intro */
    /* sound can only start after a click/tap/key — scrolling alone doesn't count — so the opening waits for one,
       otherwise the mouth "pop" and the name "ting" would be silently blocked by the browser */
    var nudgeT = 0;
    function nudge() {
      var now = performance.now(); if (now - nudgeT < 700) return; nudgeT = now;
      hintEl.classList.remove('nudge'); void hintEl.offsetWidth; hintEl.classList.add('nudge');
    }
    function push(d) {
      if (introDone || auto) return;
      if (d > 0 && !SFX.unlocked()) { nudge(); return; }
      target = clamp(target + d, 0, 1); kick();
    }
    var auto = null, handed = false; /* once the name starts to drop, it glides the rest of the way on its own */
    function frame(now) {
      raf = 0;
      if (introDone && !auto) return;
      if (!auto && target >= 0.7 && cur >= 0.62) auto = { from: cur, t0: now + 650, dur: 1300 }; /* rests in the centre for a beat, then drops */
      if (auto) {
        var at = clamp((now - auto.t0) / auto.dur, 0, 1);
        cur = auto.from + (1 - auto.from) * (1 - Math.pow(1 - at, 3)) ;
        render(cur, now / 1000);
        /* start the cross-fade while the name is still gliding, so there is never a dead stop */
        /* the name lands exactly on top of the hero title, then the black simply dissolves away around it */
        if (at >= 0.85 && !handed) { handed = true; finishIntro(false); }
        if (at < 1) raf = requestAnimationFrame(frame);
        return;
      }
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0006) cur = target;
      render(cur, now / 1000);
      if (cur >= 0.999) { render(1, 0); finishIntro(false); return; }
      if (cur !== target || cur < 0.02) kick();
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    kick();

    function onWheel(e) { e.preventDefault(); var d = e.deltaY * (e.deltaMode === 1 ? 32 : 1); push(d / STEP()); }
    var ty = null;
    function onTouchStart(e) { ty = e.touches[0].clientY; }
    function onTouchMove(e) { if (ty == null) return; e.preventDefault(); var y = e.touches[0].clientY; push((ty - y) * 1.6 / STEP()); ty = y; }
    function onKey(e) {
      var k = e.key;
      if (k === 'Escape') { finishIntro(true); return; }
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); push(0.14); }
      if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); push(-0.14); }
    }
    removeEventListener('wheel', earlyWheel); removeEventListener('touchstart', earlyTS); removeEventListener('touchmove', earlyTM);
    if (earlyD) push(earlyD / STEP());
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: false });
    addEventListener('keydown', onKey);
    /* a tap (which also unlocks sound) plays the whole opening by itself */
    function autoOpen(e) {
      if (introDone || (e && e.target.closest('.intro__skip'))) return;
      intro.removeEventListener('click', autoOpen);
      (function step() { if (introDone || auto) return; push(0.018); requestAnimationFrame(step); })();
    }
    intro.addEventListener('click', autoOpen);
    $('.intro__skip', intro).addEventListener('click', function () { finishIntro(true); });
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!introDone) { layout(); render(cur, 0); } }, 100); });
    stopIntro = function () {
      removeEventListener('wheel', onWheel); removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove); removeEventListener('keydown', onKey);
    };
  }
  var stopIntro = function () {};

  /* wrap hero words so the clone + hero share an identical layout */
  (function wrapHeroWords() {
    $$('.fit > span', heroName).forEach(function (s) {
      var w = document.createElement('span'); w.className = 'w';
      s.parentNode.insertBefore(w, s); w.appendChild(s);
    });
  })();

  function fontsReady() {
    return Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(2200)]);
  }
  if (!introDone) root.style.overflow = 'hidden';
  /* catch scrolling that happens before the intro is ready, so nothing is lost */
  var earlyD = 0, earlyY = null;
  function earlyWheel(e) { e.preventDefault(); earlyD += e.deltaY * (e.deltaMode === 1 ? 32 : 1); }
  function earlyTS(e) { earlyY = e.touches[0].clientY; }
  function earlyTM(e) { if (earlyY == null) return; e.preventDefault(); var y = e.touches[0].clientY; earlyD += (earlyY - y) * 1.6; earlyY = y; }
  if (!introDone) { addEventListener('wheel', earlyWheel, { passive: false }); addEventListener('touchstart', earlyTS, { passive: true }); addEventListener('touchmove', earlyTM, { passive: false }); }
  fontsReady().then(function () {
    fitHero();
    if (!introDone) runIntro(); else root.classList.add('hero-in');
  });
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { fitHero(); layoutJustified(); }, 120); });

  /* ======================================================================
     KEYCHAIN
     ====================================================================== */
  var KC = [
    { cat: 'branding', anchor: [368, 360], rest: 40 },
    { cat: 'illustration', anchor: [400, 372], rest: 0 },
    { cat: 'lens', anchor: [432, 360], rest: -40 }
  ];
  /* three identical motel-key tags — red, white, grey — sharing one type style */
  var TAGS = [
    { fill: '#FF3038', edge: '#d9222a', ink: '#FFFFFF', accent: '#FFFFFF', rule: 'rgba(255,255,255,.55)', focus: '#FFFFFF', lines: ['BRANDING', '&', 'PACKAGING'], foot: '4 PROJECTS →' },
    { fill: '#FFFFFF', edge: '#e4e4e4', ink: '#080808', accent: '#FF3038', rule: 'rgba(8,8,8,.35)', focus: '#FF3038', lines: ['VISUAL', 'STORYTELLING', 'through my lens'], foot: 'FILM · PHOTO →' },
    { fill: '#BDBDBD', edge: '#a6a6a6', ink: '#080808', accent: '#080808', rule: 'rgba(8,8,8,.35)', focus: '#FF3038', lines: ['ILLUSTRATIONS', '&', 'POSTERS'], foot: '4 PIECES →' }
  ];
  function tagSVG(i) {
    var c = S.categories[i], T = TAGS[i], a = KC[i].anchor, x = a[0], y = a[1];
    var wire = '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 44) + '" stroke="url(#kMetal)" stroke-width="3.5"/>' +
      '<circle cx="' + x + '" cy="' + (y + 52) + '" r="10" fill="none" stroke="url(#kMetal)" stroke-width="4"/>';
    var t = y + 40, w = 186, hh = 372, L = x - w / 2, Rr = x + w / 2, B = t + hh, mid = t + hh / 2;
    var p = 'M' + (x - 36) + ',' + t + ' Q' + x + ',' + (t - 10) + ' ' + (x + 36) + ',' + t + ' L' + Rr + ',' + (t + 66) + ' L' + Rr + ',' + (B - 66) + ' L' + (x + 36) + ',' + B + ' Q' + x + ',' + (B + 10) + ' ' + (x - 36) + ',' + B + ' L' + L + ',' + (B - 66) + ' L' + L + ',' + (t + 66) + 'Z';
    var txt = function (yy, cls, str, col) { return '<text x="' + x + '" y="' + yy + '" text-anchor="middle" class="' + cls + '" fill="' + (col || T.ink) + '">' + str + '</text>'; };
    var l3 = T.lines[2], third = /[a-z]/.test(l3) ? txt(t + 250, 'k-serif', esc(l3)) : txt(t + 250, 'k-big', esc(l3));
    var second = T.lines[1] === '&' ? txt(t + 220, 'k-serif', '&amp;') : txt(t + 220, 'k-big', esc(T.lines[1]));
    var s = '<g class="tag__body">' +
      '<path d="' + p + '" fill="' + T.fill + '" stroke="' + T.edge + '" stroke-width="14" stroke-linejoin="round"/>' +
      '<path class="tag__focus" d="' + p + '" fill="none" stroke="' + T.focus + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="' + p + '" fill="none" stroke="' + T.rule + '" stroke-width="1.5" stroke-linejoin="round" transform="translate(' + x + ' ' + mid + ') scale(.88 .93) translate(' + (-x) + ' ' + (-mid) + ')"/>' +
      '<circle cx="' + x + '" cy="' + (t + 12) + '" r="11" fill="#080808" stroke="' + T.rule + '" stroke-width="2"/>' +
      txt(t + 98, 'k-no', c.no) +
      txt(t + 126, 'k-mono', 'SELECTED WORKS') +
      '<line x1="' + (x - 58) + '" y1="' + (t + 146) + '" x2="' + (x + 58) + '" y2="' + (t + 146) + '" stroke="' + T.ink + '" stroke-opacity=".6" stroke-width="1"/>' +
      txt(t + 190, 'k-big', esc(T.lines[0])) + second + third +
      '<line x1="' + (x - 58) + '" y1="' + (t + 284) + '" x2="' + (x + 58) + '" y2="' + (t + 284) + '" stroke="' + T.ink + '" stroke-opacity=".6" stroke-width="1"/>' +
      txt(t + 310, 'k-mono', T.foot, T.accent) +
      '</g>';
    return '<a class="tag" data-i="' + i + '" href="#' + c.id + '" aria-label="' + c.no + ' — ' + esc(c.title) + '"><g class="tag__rot">' + wire + s + '</g></a>';
  }


  /* little charms on the keyring: a teddy, a pair of boxing gloves and a giraffe.
     Each is drawn hanging from (0,0); CHARMS gives where it hooks on and how it rests. */
  var CHARMS = [
    { name: 'giraffe', anchor: [358, 344], rest: 26 },
    { name: 'teddy', anchor: [374, 362], rest: 8 },
    { name: 'gloves', anchor: [428, 362], rest: -10 }
  ];
  /* soft plush shading + fuzzy edges for the charms */
  var CHARM_DEFS =
    '<radialGradient id="cBeige" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#fff4e4"/><stop offset=".55" stop-color="#ecd5b4"/><stop offset="1" stop-color="#c8a47c"/></radialGradient>' +
    '<radialGradient id="cBeigeLt" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#fffaf2"/><stop offset="1" stop-color="#f0dcc0"/></radialGradient>' +
    '<radialGradient id="cGiraffe" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#f5c75a"/><stop offset="1" stop-color="#d79a2c"/></radialGradient>' +
    '<radialGradient id="cSpot" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d48f45"/><stop offset="1" stop-color="#a5622a"/></radialGradient>' +
    '<radialGradient id="cGlove" cx=".35" cy=".28" r=".8"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".5" stop-color="#ff3a40"/><stop offset="1" stop-color="#b8141c"/></radialGradient>' +
    '<radialGradient id="cCuff" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e2e2"/></radialGradient>' +
    '<filter id="cFluff" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<filter id="cSoft" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter>';
  function chainSVG(len) {
    var h = '';
    for (var y = 2; y < len; y += 9) h += '<ellipse cx="0" cy="' + (y + 4) + '" rx="2.6" ry="5" fill="none" stroke="url(#kMetal)" stroke-width="2"/>';
    return h;
  }
  function eye(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#1a110a"/><circle cx="' + (x + r * .35) + '" cy="' + (y - r * .35) + '" r="' + (r * .38) + '" fill="#fff"/><circle cx="' + (x - r * .3) + '" cy="' + (y + r * .3) + '" r="' + (r * .15) + '" fill="#fff" fill-opacity=".7"/>';
  }
  function charmSVG(i) {
    var c = CHARMS[i], g = '';
    if (c.name === 'teddy') {
      var f = 'url(#cBeige)', lt = 'url(#cBeigeLt)', st = '#b8936a';
      g = chainSVG(18) + '<circle cx="0" cy="22" r="4.5" fill="none" stroke="url(#kMetal)" stroke-width="2.4"/>' +
        '<g filter="url(#cFluff)">' +
          '<circle cx="-15" cy="33" r="9" fill="' + f + '"/><circle cx="15" cy="33" r="9" fill="' + f + '"/>' +
          '<ellipse cx="-17" cy="76" rx="7" ry="10.5" transform="rotate(28 -17 76)" fill="' + f + '"/>' +
          '<ellipse cx="17" cy="76" rx="7" ry="10.5" transform="rotate(-28 17 76)" fill="' + f + '"/>' +
          '<ellipse cx="0" cy="84" rx="18" ry="19" fill="' + f + '"/>' +
          '<ellipse cx="-11" cy="101" rx="8.5" ry="7.5" fill="' + f + '"/><ellipse cx="11" cy="101" rx="8.5" ry="7.5" fill="' + f + '"/>' +
          '<ellipse cx="0" cy="48" rx="21" ry="19.5" fill="' + f + '"/>' +
        '</g>' +
        '<circle cx="-15" cy="33.5" r="4.6" fill="#e2bfa0" filter="url(#cSoft)"/><circle cx="15" cy="33.5" r="4.6" fill="#e2bfa0" filter="url(#cSoft)"/>' +
        '<ellipse cx="0" cy="87" rx="10" ry="11" fill="' + lt + '" filter="url(#cSoft)"/>' +
        '<ellipse cx="-11" cy="102.5" rx="4.3" ry="3.6" fill="#e2bfa0"/><ellipse cx="11" cy="102.5" rx="4.3" ry="3.6" fill="#e2bfa0"/>' +
        '<ellipse cx="0" cy="55" rx="10.5" ry="8" fill="' + lt + '" filter="url(#cSoft)"/>' +
        '<path d="M0 52 L0 57" stroke="#3a2416" stroke-width="1.1"/>' +
        '<ellipse cx="0" cy="51.5" rx="3.9" ry="2.9" fill="#3a2416"/><ellipse cx="-1" cy="50.6" rx="1.3" ry=".8" fill="#fff" fill-opacity=".6"/>' +
        '<path d="M-4 57.5 Q0 61 4 57.5" fill="none" stroke="#3a2416" stroke-width="1.2" stroke-linecap="round"/>' +
        eye(-7.5, 43.5, 2.9) + eye(7.5, 43.5, 2.9) +
        '<ellipse cx="-13.5" cy="52" rx="3.6" ry="2.4" fill="#ff9c9c" fill-opacity=".5"/><ellipse cx="13.5" cy="52" rx="3.6" ry="2.4" fill="#ff9c9c" fill-opacity=".5"/>' +
        '<path d="M0 66 C-3 66 -9 63 -9 68 C-9 73 -3 70 0 70 C3 70 9 73 9 68 C9 63 3 66 0 66Z" fill="#FF3038"/><circle cx="0" cy="68" r="2.3" fill="#c81d25"/>' +
        '<path d="M0 73 L0 100" stroke="' + st + '" stroke-width=".8" stroke-dasharray="1.6 1.6" stroke-opacity=".7"/>';
    } else if (c.name === 'gloves') {
      var glove = function (x, y, r, flip) {
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')' + (flip ? ' scale(-1 1)' : '') + '">' +
          '<g filter="url(#cSoft)">' +
            '<rect x="-11.5" y="13" width="23" height="14" rx="5" fill="url(#cCuff)"/>' +
            '<path d="M-14 12 C-18 -7 -10 -19 2 -19 C15 -19 19 -6 16 6 C15 11 12 14 8.5 14 L-9.5 14 C-12 14 -13.5 13 -14 12Z" fill="url(#cGlove)"/>' +
            '<path d="M-13.5 4 C-21 2 -22 -9 -14.5 -11 C-11 -11 -10 -6.5 -10 -2" fill="url(#cGlove)"/>' +
          '</g>' +
          '<rect x="-11.5" y="17.5" width="23" height="3.6" fill="#FF3038" opacity=".9"/>' +
          '<path d="M-10 -2 C-8 2 -4 4 0 4" fill="none" stroke="#a0121a" stroke-width="1" stroke-opacity=".6"/>' +
          '<path d="M-8 9 C0 11 8 10 13 6" fill="none" stroke="#fff" stroke-width=".9" stroke-dasharray="1.8 1.6" stroke-opacity=".55"/>' +
          '<ellipse cx="2" cy="-11" rx="8" ry="4" fill="#fff" fill-opacity=".35"/>' +
          '</g>';
      };
      g = chainSVG(14) + '<circle cx="0" cy="18" r="4.5" fill="none" stroke="url(#kMetal)" stroke-width="2.4"/>' +
        '<path d="M-2 21 Q-8 31 -11 41 M2 21 Q8 31 12 44" fill="none" stroke="#f5f5f5" stroke-width="1.8" stroke-linecap="round"/>' +
        glove(-12, 58, 8, false) + glove(13, 62, -8, true);
    } else {
      var y = 'url(#cGiraffe)', sp = 'url(#cSpot)';
      g = chainSVG(14) + '<circle cx="0" cy="18" r="4.5" fill="none" stroke="url(#kMetal)" stroke-width="2.4"/>' +
        '<g filter="url(#cFluff)">' +
          '<path d="M16 92 q13 -1 14 11" fill="none" stroke="#e0a63a" stroke-width="2.6" stroke-linecap="round"/>' +
          '<rect x="-6.5" y="96" width="6.5" height="22" rx="3.2" fill="' + y + '"/><rect x="2" y="97" width="6.5" height="21" rx="3.2" fill="' + y + '"/>' +
          '<rect x="12" y="97" width="6.5" height="21" rx="3.2" fill="' + y + '"/><rect x="20.5" y="96" width="6.5" height="22" rx="3.2" fill="' + y + '"/>' +
          '<ellipse cx="10" cy="92" rx="20" ry="12" fill="' + y + '"/>' +
          '<path d="M-7 50 C-8 66 -9 80 -9 92 L7 92 C7 80 7 66 7 50Z" fill="' + y + '"/>' +
          '<ellipse cx="-13.5" cy="33" rx="6.5" ry="3.4" transform="rotate(-25 -13.5 33)" fill="' + y + '"/>' +
          '<ellipse cx="13.5" cy="33" rx="6.5" ry="3.4" transform="rotate(25 13.5 33)" fill="' + y + '"/>' +
          '<ellipse cx="0" cy="39" rx="13" ry="12.5" fill="' + y + '"/>' +
        '</g>' +
        '<circle cx="30" cy="104" r="3" fill="#8a5426" filter="url(#cSoft)"/>' +
        ['-1.5,62,3.4', '1.5,74,3.8', '-3,85,3', '6,88,3.6', '15,94,4.2', '23,88,3', '2,96,2.6'].map(function (q) { q = q.split(','); return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + sp + '" filter="url(#cSoft)"/>'; }).join('') +
        '<line x1="-5" y1="29" x2="-6" y2="21" stroke="#c88a3a" stroke-width="2.6" stroke-linecap="round"/><circle cx="-6" cy="20.5" r="3.2" fill="#8a5426"/>' +
        '<line x1="5" y1="29" x2="6" y2="21" stroke="#c88a3a" stroke-width="2.6" stroke-linecap="round"/><circle cx="6" cy="20.5" r="3.2" fill="#8a5426"/>' +
        '<ellipse cx="0" cy="47.5" rx="9.5" ry="7" fill="#f7e1ae" filter="url(#cSoft)"/>' +
        '<ellipse cx="-3.2" cy="47.5" rx="1.3" ry="1" fill="#6b4317"/><ellipse cx="3.2" cy="47.5" rx="1.3" ry="1" fill="#6b4317"/>' +
        '<path d="M-3 51 Q0 53.5 3 51" fill="none" stroke="#6b4317" stroke-width="1" stroke-linecap="round"/>' +
        eye(-5.5, 37, 2.7) + eye(5.5, 37, 2.7) +
        '<ellipse cx="-9.5" cy="44" rx="2.8" ry="1.9" fill="#ff9c9c" fill-opacity=".5"/><ellipse cx="9.5" cy="44" rx="2.8" ry="1.9" fill="#ff9c9c" fill-opacity=".5"/>';
    }
    var a = c.anchor;
    return '<g class="charm" data-c="' + i + '" aria-hidden="true"><g class="charm__rot" transform="translate(' + a[0] + ' ' + a[1] + ') rotate(' + c.rest + ')"><g transform="scale(1.1)">' + g + '</g></g></g>';
  }

  /* one shared size for every big word on every tag, so the type matches */
  function fitTagType(svg) {
    var big = $$('.k-big', svg), maxW = 124, k = 1;
    big.forEach(function (t) { try { var l = t.getComputedTextLength(); if (l > 0) k = Math.min(k, maxW / l); } catch (e) {} });
    var px = Math.max(14, Math.min(22, Math.floor(30 * k * 10) / 10));
    big.forEach(function (t) { t.style.fontSize = px + 'px'; });
  }

  function buildKeychain() {
    var stage = $('#keysStage');
    var small = innerWidth < 700;
    var svg = '<svg viewBox="' + (small ? '0 70 800 800' : '0 0 800 880') + '" role="group" aria-label="Keychain with three category tags">' +
      '<defs>' +
      '<linearGradient id="kMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#9c9c9c"/><stop offset=".6" stop-color="#f2f2f2"/><stop offset="1" stop-color="#6b6b6b"/></linearGradient>' +
      '<linearGradient id="kMetalH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a7a7a"/><stop offset=".25" stop-color="#f4f4f4"/><stop offset=".55" stop-color="#a5a5a5"/><stop offset=".8" stop-color="#ededed"/><stop offset="1" stop-color="#6d6d6d"/></linearGradient>' +
      '<linearGradient id="kWhite" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ececec"/><stop offset="1" stop-color="#cfcfcf"/></linearGradient>' +
      '<linearGradient id="kBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a66ff"/><stop offset="1" stop-color="#2238c9"/></linearGradient>' +
      '<filter id="kShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".55"/></filter>' +
      CHARM_DEFS + '</defs>' +
      '<g id="kAll" filter="url(#kShadow)">' +
      /* carabiner */
      '<path d="M362 236 L362 96 A38 38 0 0 1 438 96 L438 236" fill="none" stroke="url(#kMetalH)" stroke-width="20" stroke-linecap="round"/>' +
      '<path d="M368 228 L368 98 A32 32 0 0 1 400 66" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="342" y="206" width="116" height="60" rx="9" fill="url(#kMetalH)" stroke="#5c5c5c" stroke-width="1.5"/>' +
      '<rect x="350" y="214" width="100" height="10" rx="4" fill="#fff" fill-opacity=".55"/>' +
      '<circle cx="370" cy="238" r="10" fill="#121212" stroke="#8a8a8a" stroke-width="2"/>' +
      '<rect x="380" y="264" width="40" height="20" rx="3" fill="url(#kMetalH)" stroke="#5c5c5c" stroke-width="1"/>' +
      '<rect x="370" y="282" width="60" height="12" rx="3" fill="url(#kMetalH)" stroke="#5c5c5c" stroke-width="1"/>' +
      /* split ring */
      '<circle cx="400" cy="326" r="44" fill="none" stroke="url(#kMetal)" stroke-width="9"/>' +
      '<circle cx="400" cy="326" r="38" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>' +
      '<g id="kTags">' + tagSVG(2) + tagSVG(0) + tagSVG(1) + '</g>' +
      '<g id="kCharms">' + CHARMS.map(function (c, i) { return charmSVG(i); }).join('') + '</g>' +
      '</g></svg>';
    stage.innerHTML = svg;
    if (small) stage.style.aspectRatio = '800/800';
    if (!FINE) $('.keys__hint').textContent = 'Tap a tag to open';
    var st = document.createElement('style');
    st.textContent = '.k-no{font:800 34px "Inter Tight","Inter Display",Inter,sans-serif;letter-spacing:-2px}.k-big{font:800 22px "Inter Tight","Inter Display",Inter,sans-serif;letter-spacing:-.6px}.k-serif{font:italic 400 22px "Instrument Serif",serif}.k-mono{font:400 9px "Space Mono",monospace;letter-spacing:1.2px}';
    stage.querySelector('svg').appendChild(st);
    fitTagType(stage.querySelector('svg'));
    if (document.fonts) document.fonts.ready.then(function () { fitTagType(stage.querySelector('svg')); });
    initKeyPhysics(stage.querySelector('svg'));
  }

  function initKeyPhysics(svg) {
    var tags = $$('.tag', svg), all = $('#kAll', svg), group = $('#kTags', svg);
    var label = $('#keysLabel'), hint = $('.keys__hint');
    var st = KC.map(function (k) { return { th: k.rest, w: 0, hover: false, drag: false, target: null, sc: 1 }; });
    var phi = 0, pw = 0, phiT = 0, hoverI = -1, last = null, running = false, visible = false, t0 = performance.now();
    var counts = ['4 projects', '3 films · 4 photo stories', '4 pieces'];
    var charmEls = $$('.charm__rot', svg), cs = CHARMS.map(function (c) { return { th: c.rest, w: 0 }; });

    function svgPt(e) {
      var r = svg.getBoundingClientRect();
      var vb = svg.viewBox.baseVal;
      return { x: vb.x + (e.clientX - r.left) / r.width * vb.width, y: vb.y + (e.clientY - r.top) / r.height * vb.height };
    }
    function setHover(i) {
      hoverI = i;
      svg.classList.toggle('has-hover', i >= 0);
      tags.forEach(function (t) { t.classList.toggle('is-hover', +t.getAttribute('data-i') === i); });
      if (i >= 0) {
        var c = S.categories[i];
        label.textContent = c.no + ' — ' + c.title + ' · ' + counts[i] + ' →';
        hint.style.opacity = 0;
        var el = tags.filter(function (t) { return +t.getAttribute('data-i') === i; })[0];
        if (group.lastElementChild !== el) group.appendChild(el); /* bring to front (only once, so clicks aren't interrupted) */
      } else { label.textContent = ''; hint.style.opacity = ''; }
    }
    function render(now) {
      var dt = Math.min(0.033, (now - (render.prev || now)) / 1000); render.prev = now;
      var time = (now - t0) / 1000;
      /* global sway */
      pw += (-(phi - phiT) * 30 - pw * 5) * dt; phi += pw * dt;
      all.setAttribute('transform', 'rotate(' + phi.toFixed(3) + ' 400 40)');
      st.forEach(function (s, i) {
        var a = KC[i].anchor;
        var rest = KC[i].rest + Math.sin(time * 0.8 + i * 1.7) * 0.7 - phi * 0.6;
        if (s.drag && s.target != null) { s.w += ((s.target - s.th) * 120 - s.w * 14) * dt; }
        else { s.w += (-(s.th - rest) * 42 - s.w * 3.6) * dt; }
        s.th += s.w * dt;
        s.th = clamp(s.th, -80, 80);
        s.sc += ((hoverI === i ? 1.035 : 1) - s.sc) * Math.min(1, dt * 8);
        var el = tags.filter(function (t) { return +t.getAttribute('data-i') === i; })[0];
        el.firstChild.setAttribute('transform', 'rotate(' + s.th.toFixed(3) + ' ' + a[0] + ' ' + a[1] + ') translate(' + a[0] + ' ' + a[1] + ') scale(' + s.sc.toFixed(4) + ') translate(' + (-a[0]) + ' ' + (-a[1]) + ')');
      });
      /* charms swing on their own little springs */
      cs.forEach(function (c, i) {
        var C = CHARMS[i], rest = C.rest + Math.sin(time * 1.3 + i * 2.1) * 2.2 - phi * 0.9;
        c.w += (-(c.th - rest) * 34 - c.w * 3.2) * dt; c.th = clamp(c.th + c.w * dt, -75, 75);
        charmEls[i].setAttribute('transform', 'translate(' + C.anchor[0] + ' ' + C.anchor[1] + ') rotate(' + c.th.toFixed(2) + ')');
        if (Math.abs(c.w) > 70 && Math.abs(c.w - (c.pw || 0)) > 30) SFX.jingle(Math.abs(c.w) / 260); c.pw = c.w;
      });
      if (visible) requestAnimationFrame(render); else running = false;
    }
    function start() { if (!running && !REDUCED) { running = true; render.prev = null; requestAnimationFrame(render); } }

    if (REDUCED) { /* static */
      tags.forEach(function (el) { var i = +el.getAttribute('data-i'), a = KC[i].anchor; el.firstChild.setAttribute('transform', 'rotate(' + KC[i].rest + ' ' + a[0] + ' ' + a[1] + ')'); });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var was = visible; visible = e.isIntersecting;
          if (visible) { if (!was) { st[0].w += 50; st[1].w -= 30; st[2].w += 60; } start(); }
        });
      }, { threshold: 0.1 }).observe(svg);
    } else { visible = true; start(); }

    $$('.charm', svg).forEach(function (el, i) {
      el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); cs[i].w += (i % 2 ? -1 : 1) * 260; SFX.click(); start(); });
      el.addEventListener('pointerenter', function () { cs[i].w += (i % 2 ? -1 : 1) * 60; SFX.hover(); start(); });
    });
    var dragI = -1, downPt = null, moved = false;
    svg.addEventListener('pointermove', function (e) {
      var p = svgPt(e), now = performance.now();
      if (last) {
        var vx = (p.x - last.x) / Math.max(8, now - last.t) * 16; /* px per frame */
        st.forEach(function (s, i) {
          var a = KC[i].anchor, d = Math.hypot(p.x - a[0], p.y - (a[1] + 180));
          var f = clamp(1 - d / 420, 0, 1);
          s.w -= vx * 1.4 * f;
        });
        cs.forEach(function (c, i) {
          var a = CHARMS[i].anchor, d = Math.hypot(p.x - a[0], p.y - (a[1] + 70));
          c.w -= vx * 2.2 * clamp(1 - d / 160, 0, 1);
        });
        pw += (p.x - last.x) * 0.006;
      }
      last = { x: p.x, y: p.y, t: now };
      phiT = clamp((p.x - 400) / 400, -1, 1) * 1.2;
      if (dragI >= 0) {
        var a = KC[dragI].anchor;
        st[dragI].target = clamp(-Math.atan2(p.x - a[0], p.y - a[1]) * 180 / Math.PI, -75, 75);
        if (downPt && Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y) > 6) moved = true;
      }
      start();
    });
    svg.addEventListener('pointerleave', function () { last = null; phiT = 0; if (dragI < 0) setHover(-1); });
    tags.forEach(function (el) {
      var i = +el.getAttribute('data-i');
      el.addEventListener('pointerenter', function () { if (hoverI !== i) SFX.hover(); setHover(i); });
      el.addEventListener('focus', function () { setHover(i); start(); });
      el.addEventListener('blur', function () { setHover(-1); });
      /* click a tag → jump straight to that work section */
      el.addEventListener('click', function (e) {
        e.preventDefault(); SFX.click();
        var target = document.getElementById(S.categories[i].id);
        if (target) target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      });
    });
    addEventListener('pointerup', function () {
      if (dragI >= 0) { st[dragI].drag = false; st[dragI].target = null; dragI = -1; }
    });
  }
  buildKeychain();

  /* smooth navigation to anchors (works also while a case study is open) */
  function goTo(hash) {
    if (location.hash === hash) { var el = document.getElementById(hash.slice(1)); if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); }
    else location.hash = hash;
  }

  /* ======================================================================
     CASE STUDIES / PHOTO STORIES (hash routes)
     ====================================================================== */
  var caseEl = $('#case'), caseScroll = $('#caseScroll'), caseInner = $('#caseInner'), curtain = $('.case__curtain'), curtainT = $('#curtainTitle');
  var caseOpen = false, lastFocus = null, caseLB = [];

  function plateHTML(o, total, extraCls, alt) {
    caseLB.push({ src: o.src, cap: alt + ' — ' + pad(o.n) + ' / ' + pad(total) });
    var portrait = o.h > o.w * 1.15;
    var cls = 'plate' + (extraCls ? ' ' + extraCls : '') + (portrait && !extraCls ? ' narrow' : '');
    return '<figure class="' + cls + ' reveal" data-lb="case" data-i="' + (caseLB.length - 1) + '" data-cursor="View" tabindex="0" role="button" aria-label="View plate ' + o.n + ' of ' + total + '">' +
      imgTag(o, { sizes: '(max-width:640px) 100vw, 90vw', alt: alt + ', plate ' + o.n }) +
      '<figcaption><span class="mono">' + pad(o.n) + ' / ' + pad(total) + '</span><span class="mono">' + esc(alt) + '</span></figcaption></figure>';
  }

  function projectHTML(p) {
    caseLB = [];
    var idx = S.projects.indexOf(p), total = count(p.folder);
    var prev = S.projects[(idx - 1 + S.projects.length) % S.projects.length], next = S.projects[(idx + 1) % S.projects.length];
    var hero = img(p.folder, p.cover);
    var h = '<div class="case__bar"><a class="case__back mono" href="#branding">← All work</a><span class="mono">' + esc(p.title) + ' — ' + esc(p.discipline) + '</span><span class="mono">' + p.no + ' / ' + pad(S.projects.length) + '</span></div>';
    h += '<header class="case__head">' +
      '<div class="case__label"><span class="mono">Branding &amp; Packaging · ' + p.no + '</span><span class="pill mono' + (p.internship ? ' pill--red' : '') + '">' + esc(p.kind) + '</span></div>' +
      '<h2 class="case__title" id="caseTitle">' + esc(p.title) + '</h2>' +
      '<p class="case__tag">' + esc(p.tagline) + '</p>' +
      '<dl class="case__facts">' + p.facts.map(function (f) { return '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl>' +
      '<div class="case__intro">' + p.intro.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
      (p.logo ? '<img class="case__logo" src="' + p.logo.replace('.webp', '-s.webp') + '" alt="' + esc(p.title) + ' logo" width="900" height="506" decoding="async">' : '') +
      '</header>';
    if (p.layout !== 'groups') h += '<figure class="case__hero">' + imgTag(hero, { eager: true, alt: p.title + ' — key visual', sizes: '100vw' }) + '</figure>';

    if (p.layout === 'groups') {
      if (p.research) h += nexiblesHTML(p, total);
      else p.groups.forEach(function (g, gi) {
        h += '<section class="group"><div class="group__head"><span class="group__no mono">' + pad(gi + 1) + ' / ' + pad(p.groups.length) + '</span><h4 class="group__t">' + esc(g.title) + '</h4><p class="group__s">' + esc(g.sub) + '</p></div><div class="group__plates">';
        g.images.forEach(function (n) { h += plateHTML(img(p.folder, n), total, 'full', g.title); });
        h += '</div></section>';
      });
    } else {
      var start = p.cover === 1 ? 2 : 1;
      h += '<div class="case__sec"><h3>The process</h3><span class="mono">Plates ' + pad(start) + '–' + pad(total) + '</span></div>';
      h += '<div class="plates' + (p.layout === 'duo' ? ' plates--duo' : '') + '">';
      /* side by side: pair up neighbouring landscape boards; anything odd-shaped gets its own full row */
      var ok = function (o) { return o && o.ar > 1.25 && o.ar < 1.95; };
      for (var n = start; n <= total; n++) {
        var o = img(p.folder, n), nx = n < total ? img(p.folder, n + 1) : null;
        if (p.layout === 'duo' && ok(o) && ok(nx)) { h += plateHTML(o, total, 'half', p.title) + plateHTML(nx, total, 'half', p.title); n++; }
        else h += plateHTML(o, total, p.layout === 'duo' && o.ar >= 1 ? 'full' : '', p.title);
      }
      h += '</div>';
    }
    h += navHTML('#/work/', prev, next, 'project');
    h += '<div class="case__all"><a class="btn mono" href="#branding">Back to all work</a></div>';
    return h;
  }

  /* Nexibles: how the boxes were made (primary research + test prints), then one block per
     brand — its research on the left (sticky), the final design beside it */
  function nexiblesHTML(p, total) {
    var R = p.research, labels = ['Research', 'Moodboard', 'Process'];
    function page(n, cap, sizes) {
      var src = 'assets/research/p' + pad(n) + '.webp';
      caseLB.push({ src: src, cap: cap });
      return '<figure class="nx__pg" data-lb="case" data-i="' + (caseLB.length - 1) + '" data-cursor="View" tabindex="0" role="button" aria-label="View ' + esc(cap) + '">' +
        '<img src="assets/research/p' + pad(n) + '-s.webp" srcset="assets/research/p' + pad(n) + '-s.webp 720w, ' + src + ' 1755w" sizes="' + (sizes || '(max-width:900px) 33vw, 12vw') + '" alt="' + esc(cap) + '" width="1755" height="1241" loading="lazy" decoding="async"></figure>';
    }
    var h = '';
    /* 1 — before the boxes */
    h += '<div class="case__sec"><h3>Before the boxes</h3><span class="mono">Primary research · sample prints</span></div>';
    caseLB.push({ src: 'assets/nexibles/testprint.webp', cap: 'Sample prints — every box was printed and checked before the final print-ready file' });
    var tpI = caseLB.length - 1;
    h += '<section class="bx">' +
      '<div class="bx__top">' +
        '<div class="bx__lead"><p class="bx__intro">' + esc(R.intro) + '</p>' +
          '<p class="bx__cap"><span class="mono">Sample prints →</span>Every box was test-printed and checked in hand — colour, folds, legibility — before the final print-ready file.</p></div>' +
        '<figure class="bx__photo reveal" data-lb="case" data-i="' + tpI + '" data-cursor="View" tabindex="0" role="button" aria-label="View the sample prints">' +
          '<img src="assets/nexibles/testprint-s.webp" srcset="assets/nexibles/testprint-s.webp 1100w, assets/nexibles/testprint.webp 2400w" sizes="(max-width:900px) 100vw, 560px" alt="Sample prints of the packaging, laid out in a tray" width="2400" height="1800" loading="lazy" decoding="async"></figure>' +
      '</div>' +
      '<div class="bx__cards">' + R.primary.map(function (c, k) { return '<div class="bx__card"><span class="mono">' + pad(k + 1) + '</span><h4>' + esc(c[0]) + '</h4><p>' + esc(c[1]) + '</p></div>'; }).join('') + '</div>' +
      '<div class="bx__pages"><span class="mono dim">From the research document</span><div>' + R.primaryImgs.map(function (n, k) { return page(n, 'Primary research — page ' + (k + 1), '(max-width:900px) 50vw, 300px'); }).join('') + '</div></div>' +
      '</section>';

    /* 2 — brand by brand */
    var byName = {}; R.projects.forEach(function (pr) { byName[pr.name] = pr; });
    var byGroup = {}; p.groups.forEach(function (g) { byGroup[g.title] = g; });
    var ORDER = [['Choco Chaabi', 'Choco Chaabi'], ['Faeve', 'Faeve'], ['Makhanmirch', 'Makhanmirch'], ['Embera', 'Embera'], ['Terra', null], ['Navs', 'Neem Aloe Vera Soap'], [null, 'Monocartons'], [null, 'Gooric']];
    h += '<div class="case__sec"><h3>Research → final design</h3><span class="mono">' + ORDER.length + ' packaging projects</span></div>';
    ORDER.forEach(function (o, k) {
      var pr = o[0] && byName[o[0]], g = o[1] && byGroup[o[1]];
      var name = pr ? pr.name : g.title, kind = pr ? pr.kind : g.sub;
      h += '<article class="nx' + (k % 2 ? ' nx--alt' : '') + '"><div class="nx__side"><div class="nx__stick">' +
        '<span class="nx__no">' + pad(k + 1) + '</span><span class="mono dim nx__kind">' + esc(kind) + '</span>' +
        '<h4 class="nx__t">' + esc(name) + '</h4>' +
        (pr ? '<p class="nx__idea">' + esc(pr.idea) + '</p><p class="nx__did"><span class="mono">Research</span>' + esc(pr.did) + '</p>' +
              '<div class="nx__rs">' + pr.imgs.map(function (n, j) { return '<div>' + page(n, pr.name + ' — ' + labels[j]) + '<span class="mono dim">' + labels[j] + '</span></div>'; }).join('') + '</div>'
            : '<p class="nx__idea">' + esc(g.sub) + '</p>') +
        '</div></div><div class="nx__work"><span class="mono nx__lbl">Final design</span>';
      if (g) g.images.forEach(function (n) { h += plateHTML(img(p.folder, n), total, 'full', name); });
      else (pr.finals || []).forEach(function (n) { h += '<div class="nx__big">' + page(n, name + ' — final design', '(max-width:900px) 100vw, 60vw') + '</div>'; });
      h += '</div></article>';
    });
    return h;
  }

  function storyHTML(s) {
    caseLB = [];
    var idx = S.stories.indexOf(s), frames = storyFrames(s), total = frames.length;
    var prev = S.stories[(idx - 1 + S.stories.length) % S.stories.length], next = S.stories[(idx + 1) % S.stories.length];
    var hero = img(s.folder, s.cover);
    var h = '<div class="case__bar"><a class="case__back mono" href="#lens">← All stories</a><span class="mono">' + esc(s.title) + '</span><span class="mono">' + pad(idx + 1) + ' / ' + pad(S.stories.length) + '</span></div>';
    h += '<header class="case__head">' +
      '<div class="case__label"><span class="mono">Visual storytelling · Photo story ' + pad(idx + 1) + '</span></div>' +
      '<h2 class="case__title" id="caseTitle">' + esc(s.title) + '</h2>' +
      '<p class="case__tag">' + esc(s.kind) + '</p>' +
      '<dl class="case__facts"><dt>Frames</dt><dd>' + total + '</dd><dt>Medium</dt><dd>Photography</dd>' + (s.camera ? '<dt>Shot on</dt><dd>' + esc(s.camera) + '</dd>' : '') + '</dl>' +
      '<div class="case__intro"><p>' + esc(s.intro) + '</p></div></header>';
    h += '<figure class="case__hero" style="background:#111">' + imgTag(hero, { eager: true, alt: s.title + ' — cover', sizes: '100vw' }).replace('<img ', '<img style="max-height:92vh;width:auto;margin:0 auto" ') + '</figure>';
    h += '<div class="case__sec"><h3>The full story</h3><span class="mono">' + total + ' frames · in sequence</span></div>';
    h += '<div class="jrows" data-justify="1">';
    frames.forEach(function (n, k) { var o = img(s.folder, n); o.n = k + 1; h += plateHTML(o, total, 'jitem', s.title); });
    h += '</div>';
    h += navHTML('#/story/', prev, next, 'story');
    h += '<div class="case__all"><a class="btn mono" href="#lens">Back to visual storytelling</a></div>';
    return h;
  }

  function navHTML(base, prev, next, kind) {
    return '<nav class="case__nav" aria-label="More ' + kind + 's">' +
      '<a href="' + base + prev.slug + '" data-cursor="Previous"><span class="mono">← Previous ' + kind + '</span><span class="big">' + esc(prev.title) + '</span></a>' +
      '<a href="' + base + next.slug + '" data-cursor="Next"><span class="mono">Next ' + kind + ' →</span><span class="big">' + esc(next.title) + '</span></a></nav>';
  }

  /* justified rows that keep the exact image order */
  function layoutJustified() {
    $$('[data-justify]', caseInner).forEach(function (box) {
      var items = $$('.jitem', box);
      if (!items.length) return;
      box.querySelectorAll('.jrow').forEach(function (r) { while (r.firstChild) box.appendChild(r.firstChild); r.remove(); });
      items.forEach(function (it) { box.appendChild(it); });
      var W = box.clientWidth, gap = W < 640 ? 6 : 10, H = W < 640 ? 220 : W < 1100 ? 320 : 420;
      box.style.setProperty('--jgap', gap + 'px');
      var row = [], sum = 0;
      function flush(final) {
        if (!row.length) return;
        var rowEl = document.createElement('div'); rowEl.className = 'jrow';
        var avail = W - gap * (row.length - 1) - 1, h = avail / sum;
        if (final && h > H * 1.15) h = H;
        row.forEach(function (it) {
          var ar = +it.getAttribute('data-ar');
          it.style.width = (h * ar).toFixed(2) + 'px';
          rowEl.appendChild(it);
        });
        box.appendChild(rowEl);
        row = []; sum = 0;
      }
      items.forEach(function (it) {
        var im = it.querySelector('img'); var ar = (+im.getAttribute('width')) / (+im.getAttribute('height'));
        it.setAttribute('data-ar', ar);
        row.push(it); sum += ar;
        if (sum * H + gap * (row.length - 1) >= W) flush(false);
      });
      flush(true);
    });
  }

  function openRoute(kind, slug) {
    var data = kind === 'work' ? project(slug) : story(slug);
    if (!data) { location.hash = '#work'; return; }
    var html = kind === 'work' ? projectHTML(data) : storyHTML(data);
    var first = !caseOpen;
    if (first) lastFocus = document.activeElement;
    caseOpen = true;
    caseEl.hidden = false;
    caseEl.classList.toggle('is-dark', kind === 'story');
    root.style.overflow = 'hidden';
    curtainT.textContent = data.title;
    var swap = function () {
      caseInner.innerHTML = html;
      caseScroll.scrollTop = 0;
      layoutJustified();
      observeReveals(caseInner);
      var h = $('#caseTitle', caseInner); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    };
    if (REDUCED) { swap(); return; }
    curtain.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 620, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).onfinish = function () {
      swap();
      setTimeout(function () {
        curtain.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 720, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
      }, 160);
    };
  }

  function closeRoute(then) {
    if (!caseOpen) { if (then) then(); return; }
    caseOpen = false;
    var done = function () {
      caseEl.hidden = true; caseInner.innerHTML = ''; root.style.overflow = '';
      curtain.getAnimations().forEach(function (a) { a.cancel(); });
      if (then) then();
    };
    if (REDUCED) { done(); return; }
    curtain.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 520, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).onfinish = function () {
      caseEl.hidden = true; root.style.overflow = '';
      if (then) then();
      caseEl.hidden = false;
      curtain.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 600, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).onfinish = function () {
        caseEl.hidden = true; caseInner.innerHTML = '';
        curtain.getAnimations().forEach(function (a) { a.cancel(); });
      };
    };
  }

  function route() {
    var h = location.hash || '';
    var m = h.match(/^#\/(work|story)\/([\w-]+)/);
    if (m) { openRoute(m[1], m[2]); return; }
    closeRoute(function () {
      var id = h.slice(1);
      var el = id && document.getElementById(id);
      if (el) {
        if (!introDone) finishIntro(true);
        el.scrollIntoView({ behavior: 'auto' });
      }
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} lastFocus = null; }
    });
  }
  addEventListener('hashchange', function () {
    var wasOpen = caseOpen;
    var h = location.hash || '';
    if (!/^#\//.test(h) && !wasOpen) {
      /* plain section link: let the browser scroll smoothly */
      return;
    }
    route();
  });
  if (/^#\//.test(location.hash)) route();
  else if (location.hash.length > 1) { var tgt = document.getElementById(location.hash.slice(1)); if (tgt) setTimeout(function () { tgt.scrollIntoView(); }, 50); }

  /* ======================================================================
     LIGHTBOX
     ====================================================================== */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbList = [], lbI = 0, lbFocus = null;
  function lbShow(i) {
    lbI = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbI].src; lbImg.alt = lbList[lbI].cap; lbCap.textContent = lbList[lbI].cap;
  }
  function lbOpen(list, i) {
    lbList = list; lbFocus = document.activeElement; lb.hidden = false; lbShow(i);
    $('.lb__close', lb).focus();
    lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUCED ? 1 : 260 });
  }
  function lbClose() { lb.hidden = true; lbImg.removeAttribute('src'); if (lbFocus) lbFocus.focus({ preventScroll: true }); }
  $('.lb__close', lb).addEventListener('click', lbClose);
  $('.lb__prev', lb).addEventListener('click', function () { lbShow(lbI - 1); });
  $('.lb__next', lb).addEventListener('click', function () { lbShow(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });

  function openFromEl(el) {
    var set = el.getAttribute('data-lb'), i = +el.getAttribute('data-i');
    lbOpen(set === 'ill' ? illList : caseLB, i);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-lb]');
    if (el) { e.preventDefault(); openFromEl(el); }
    if (e.target.closest('.prow, .story, .film, .gal')) SFX.click();
    var f = e.target.closest('[data-film]');
    if (f) playerOpen(+f.getAttribute('data-film'));
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbShow(lbI - 1);
      else if (e.key === 'ArrowRight') lbShow(lbI + 1);
      return;
    }
    if (!player.hidden) { if (e.key === 'Escape') playerClose(); return; }
    if (caseOpen && e.key === 'Escape') { var b = $('.case__back', caseInner); if (b) location.hash = b.getAttribute('href'); return; }
    var t = e.target.closest && e.target.closest('[data-lb]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFromEl(t); }
  });

  /* ======================================================================
     FILM PLAYER — one video at a time, never autoplaying in the page
     ====================================================================== */
  var player = $('#player'), video = $('#playerVideo'), pFocus = null;
  function playerOpen(i) {
    var f = S.films[i];
    document.dispatchEvent(new Event('film:open'));
    pFocus = document.activeElement;
    $('#playerTitle').textContent = f.title + ' — ' + f.kind + ' · ' + f.dur;
    video.poster = 'assets/films/' + f.file + '-poster.webp';
    playToken++;
    var seg = window.FILM_SEGMENTS && window.FILM_SEGMENTS[f.file], MSC = window.ManagedMediaSource || window.MediaSource;
    if (seg && MSC && MSC.isTypeSupported(seg.mime)) streamFilm(f, seg, MSC, playToken);
    else video.src = 'assets/films/' + f.file + '.mp4';
    player.hidden = false; root.style.overflow = 'hidden';
    $('.player__close', player).focus();
    var p = video.play(); if (p && p.catch) p.catch(function () {});
  }
  /* hosted copies of the films are split into small pieces; stream them in order */
  var playToken = 0;
  function streamFilm(f, seg, MSC, token) {
    var ms = new MSC();
    if (window.ManagedMediaSource && MSC === window.ManagedMediaSource) video.disableRemotePlayback = true;
    video.src = URL.createObjectURL(ms);
    ms.addEventListener('sourceopen', function () {
      var sb = ms.addSourceBuffer(seg.mime), base = 'assets/films/' + f.file + '/', i = -1;
      function next() {
        if (token !== playToken || ms.readyState !== 'open') return;
        i++;
        if (i > seg.n) { try { ms.endOfStream(); } catch (e) {} return; }
        var url = base + (i === 0 ? 'init.mp4' : 's' + ('00' + (i - 1)).slice(-3) + '.mp4');
        fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (b) {
          if (token !== playToken || ms.readyState !== 'open') return;
          try { sb.appendBuffer(b); } catch (e) {}
        }).catch(function () {});
      }
      sb.addEventListener('updateend', next);
      next();
    }, { once: true });
  }
  function playerClose() {
    playToken++;
    document.dispatchEvent(new Event('film:close'));
    video.pause(); video.removeAttribute('src'); video.load();
    player.hidden = true; if (!caseOpen) root.style.overflow = '';
    if (pFocus) pFocus.focus({ preventScroll: true });
  }
  $('.player__close', player).addEventListener('click', playerClose);

  /* ======================================================================
     CUSTOM CURSOR — her face, desktop + fine pointers only
     ====================================================================== */
  if (FINE) {
    var cur = $('#cursor'), curLabel = $('#cursorLabel');
    root.classList.add('has-cursor');
    var mx = -100, my = -100, px = -100, py = -100, on = false;
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!on) { on = true; px = mx; py = my; cur.classList.add('is-on'); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { on = false; cur.classList.remove('is-on'); });
    document.documentElement.addEventListener('mouseleave', function () { on = false; cur.classList.remove('is-on'); });
    addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('a, button, [data-cursor], [role="button"], .tag');
      cur.classList.toggle('is-hover', !!t);
      var lab = t && (t.getAttribute('data-cursor') || (t.classList.contains('tag') ? 'Pick me' : ''));
      curLabel.textContent = lab || '';
      cur.classList.toggle('has-label', !!lab);
    });
    (function loop() {
      var k = REDUCED ? 1 : 0.28;
      px += (mx - px) * k; py += (my - py) * k;
      cur.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* hero v3 — the headline words are filled with the work itself, and the cursor leaves a trail of images */
  (function heroV3() {
    var hx = $('#heroLead'), hero = $('#home'), trail = $('#trail');
    if (!hx || !$('.hx__words', hx)) return;
    var SETS = {
      image: ['assets/gateway/05.webp', 'assets/kumbharvada/03.webp', 'assets/outdoor/05.webp', 'assets/gateway/07.webp'],
      identity: ['assets/pulse/12.webp', 'assets/collage/01.webp', 'assets/collage/03.webp', 'assets/collage/07.webp', 'assets/collage/02.webp'],
      story: ['assets/films/havaijahaaz-poster.webp', 'assets/outdoor/22.webp', 'assets/films/kaun-poster.webp', 'assets/styling/04.webp']
    };
    var fills = $$('.fill', hx).map(function (el, k) {
      var set = SETS[el.getAttribute('data-set')], o = { el: el, set: set, i: 0, k: k };
      set = set.map(function (u) { return new URL(u, location.href).href; }); o.set = set;
      el.style.setProperty('--a', 'url("' + set[0] + '")');
      set.forEach(function (u) { var im = new Image(); im.src = u; });
      return o;
    });
    function swap(o) {
      o.i = (o.i + 1) % o.set.length;
      o.el.style.setProperty('--b', 'url("' + o.set[o.i] + '")');
      o.el.classList.add('swap');
      setTimeout(function () { o.el.style.setProperty('--a', 'url("' + o.set[o.i] + '")'); o.el.classList.remove('swap'); }, 1300);
    }
    var vid = $('#heroVideo'), heroImg = $('#heroImg'), vwrap = (vid || heroImg) && (vid || heroImg).parentNode;
    function startHero() {
      /* the photograph: it slowly settles into focus, then the words arrive */
      if (heroImg) {
        vwrap.classList.add('is-on'); startDust();
        setTimeout(function () { vwrap.classList.add('dim'); hx.classList.add('in'); SFX.mouthEnd(5); }, REDUCED ? 0 : 350);
        return;
      }
      /* the girl walks into the space first; the words arrive once she has entered */
      if (!vid || REDUCED) { if (vwrap) vwrap.classList.add('is-on', 'dim'); hx.classList.add('in'); return; }
      vwrap.classList.add('is-on');
      vid.currentTime = 0;
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
      setTimeout(function () { vwrap.classList.add('dim'); hx.classList.add('in'); }, 2600);
    }
    /* specks of dust drifting through the light beams */
    function startDust() {
      var cv = $('#heroDust'); if (!cv || REDUCED) return;
      var c = cv.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), parts = [];
      function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
      size(); addEventListener('resize', size);
      for (var i = 0; i < 70; i++) parts.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.15 + Math.random() * 0.5, ph: Math.random() * 6.28, tw: 0.6 + Math.random() * 1.6 });
      function tick(now) {
        requestAnimationFrame(tick);
        if (document.hidden || scrollY > innerHeight) return;
        var t = now / 1000; c.clearRect(0, 0, W, H);
        parts.forEach(function (p) {
          p.y -= p.s * 0.00022; p.x += Math.sin(t * 0.3 + p.ph) * 0.00012;
          if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
          /* brighter where the light falls (upper middle of the frame) */
          var glow = Math.max(0.15, 1 - Math.hypot(p.x - 0.62, (p.y - 0.25) * 1.3) * 1.3);
          var a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph))) * glow;
          c.beginPath(); c.arc(p.x * W, p.y * H, p.r, 0, 6.283);
          c.fillStyle = 'rgba(255,244,220,' + (a * 0.85).toFixed(3) + ')'; c.shadowColor = 'rgba(255,240,210,.9)'; c.shadowBlur = 6 * p.r; c.fill();
        });
      }
      requestAnimationFrame(tick);
    }
    if (vid) vid.addEventListener('timeupdate', function () {
      var left = vid.duration - vid.currentTime;
      vid.style.opacity = (left < 0.45 || vid.currentTime < 0.35) ? '0.35' : '';
    });
    if (root.classList.contains('hero-in')) startHero();
    else new MutationObserver(function (m, ob) { if (root.classList.contains('hero-in')) { ob.disconnect(); startHero(); } }).observe(root, { attributes: true, attributeFilter: ['class'] });

    /* image trail — switched off on the hero so the film can breathe */
    if (true || REDUCED || !trail) return;
    var pool = []; for (var k = 1; k <= 17; k++) pool.push('assets/collage/' + pad(k) + '.webp');
    var pi = 0, lastX = null, lastY = null, live = 0;
    function drop(x, y) {
      if (live > 9) return;
      var im = document.createElement('img');
      im.src = pool[pi++ % pool.length]; im.alt = '';
      im.style.left = x + 'px'; im.style.top = y + 'px';
      im.style.setProperty('--r', ((Math.random() - .5) * 16).toFixed(1) + 'deg');
      trail.appendChild(im); live++;
      setTimeout(function () { im.remove(); live--; }, 1300);
    }
    if (FINE) {
      hero.addEventListener('pointermove', function (e) {
        if (!root.classList.contains('hero-in')) return;
        var r = trail.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (y < 0 || y > r.height) return;
        if (lastX == null || Math.hypot(x - lastX, y - lastY) > 110) { drop(x, y); lastX = x; lastY = y; }
      }, { passive: true });
    } else {
      /* touch screens: the trail wanders by itself */
      var t = 0;
      setInterval(function () {
        if (document.hidden || scrollY > innerHeight || !root.classList.contains('hero-in')) return;
        var r = trail.getBoundingClientRect(); t += 0.9;
        drop(r.width * (0.5 + 0.38 * Math.sin(t * 0.9)), r.height * (0.3 + 0.18 * Math.sin(t * 1.7)));
      }, 900);
    }
  })();

  /* hero collage — one card riffles into a fan, bursts into a mixed-media
     cluster of mockups and location shots, shuffles, then folds back. Loops. */
  (function collage() {
    var host = $('#collage'); if (!host) return;
    var A = [1, 4/3, 4/3, 3/4, 4/5, 3/4, 1, 3/4, 4/3, 3/4, 3/4, 4/5, 1, 4/5, 4/3, 4/3, 4/5];
    /* cluster slots: centre offset (x,y) in stage units, width, depth */
    var SLOT = [
      [0, 0, .32, 60], [-.25, -.1, .23, 30], [.27, -.12, .27, 40], [-.04, -.31, .25, 10], [.05, .28, .25, 20],
      [-.38, .14, .2, 15], [.38, .14, .19, 25], [-.2, .25, .18, 45], [.22, .27, .21, 50], [-.42, -.2, .15, 5],
      [.44, -.22, .16, 8], [.17, -.33, .17, 12], [-.21, -.35, .15, 6], [-.52, -.01, .13, 2], [.54, .01, .14, 3],
      [-.07, .43, .17, 14], [.34, .4, .13, 4]
    ];
    var N = A.length, cards = [], S = 0, XS = 1, BASE = .32;
    for (var k = 0; k < N; k++) {
      var c = document.createElement('div'); c.className = 'collage__card';
      c.innerHTML = '<img src="assets/collage/' + pad(k + 1) + '.webp" alt="" decoding="async"' + (k < 6 ? '' : ' loading="lazy"') + '>';
      host.appendChild(c); cards.push(c);
    }
    function size() {
      var w = host.clientWidth, h = host.clientHeight;
      var wide = innerWidth >= 900;
      host.style.setProperty('--cx', wide ? '73%' : '50%');
      S = wide ? Math.min(w * 0.5 / 1.08, h / 1.0) : Math.min(w / 1.08, h / 1.04);
      XS = wide ? 1.12 : 1;
      cards.forEach(function (c, i) { var bw = S * BASE; c.style.width = bw + 'px'; c.style.height = (bw / A[i]) + 'px'; c.style.marginLeft = (-bw / 2) + 'px'; c.style.marginTop = (-bw / A[i] / 2) + 'px'; });
    }
    var last = null;
    function put(c, x, y, z, w, ry, rz, op, delay) {
      c.style.transitionDelay = (delay || 0) + 'ms';
      c.style.transform = 'translate3d(' + (x * S * XS).toFixed(1) + 'px,' + ((y - .02) * S).toFixed(1) + 'px,' + z + 'px) rotateY(' + ry + 'deg) rotateZ(' + rz + 'deg) scale(' + (w / BASE).toFixed(3) + ')';
      c.style.opacity = op;
      c.style.zIndex = Math.round(z + 200);
    }
    var hero = [0]; /* the card on top of the closed stack: Mirror Wala Moment */
    function stack() { last = stack; cards.forEach(function (c, i) { var top = i === hero[0]; put(c, 0, 0, top ? 2 : -i, .3, 0, -3, top ? 1 : 0, 0); }); }
    function fan() { last = fan; cards.forEach(function (c, i) { put(c, (i - (N - 1) / 2) * .045, 0, i, .22, -64, 0, 1, i * 18); }); }
    var perm = cards.map(function (c, i) { return i; });
    function cluster(stagger) {
      last = cluster;
      cards.forEach(function (c, i) {
        var s = SLOT[perm[i]], seed = Math.sin(i * 12.9 + perm[i] * 3.1);
        put(c, s[0], s[1], s[3] * 2, s[2], seed * 7, seed * 2.4, 1, stagger ? (N - perm[i]) * 22 : Math.abs(seed) * 120);
      });
    }
    function shuffle() { var a = perm.splice(0, 3); perm = perm.concat(a); var t = perm[0]; perm[0] = perm[5]; perm[5] = t; }

    var timer, running = false, visible = true, first = true, lead = $('#heroLead');
    var SEQ = [[stack, 900], [fan, 1100], [function () { cluster(true); }, 2400], [function () { shuffle(); cluster(false); }, 2300], [function () { shuffle(); cluster(false); }, 2300], [fan, 1000]];
    var step = 0;
    function tick() {
      if (!running) return;
      if (!visible || document.hidden) { timer = setTimeout(tick, 600); return; }
      SEQ[step][0]();
      timer = setTimeout(tick, SEQ[step][1]);
      step = (step + 1) % SEQ.length;
    }
    size(); stack();
    function resized() { var o = S; size(); if (Math.abs(S - o) > 1 && last) { cards.forEach(function (c) { c.style.transition = 'none'; }); last(false); host.offsetWidth; cards.forEach(function (c) { c.style.transition = ''; }); } }
    if ('ResizeObserver' in window) new ResizeObserver(resized).observe(host); else addEventListener('resize', resized);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(host);
    function start() {
      if (running) return;
      if (REDUCED) { cluster(false); lead.classList.add('in'); return; }
      running = true; step = 0; host.classList.add('is-live'); lead.classList.add('in'); tick();
    }
    if (root.classList.contains('hero-in')) start();
    else new MutationObserver(function (m, o) { if (root.classList.contains('hero-in')) { o.disconnect(); setTimeout(start, 250); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
  })();
  /* nav text turns black over light backgrounds, white over dark ones */
  (function navTone() {
    var nav = $('#nav'); if (!nav) return;
    var q = 0, last = '';
    function bgAt(x, y) {
      var el = document.elementFromPoint(x, y);
      while (el && el !== document.documentElement) {
        if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') return 'dark';
        var c = getComputedStyle(el).backgroundColor, m = c.match(/[\d.]+/g);
        if (m && (m.length < 4 || +m[3] > 0.5)) { var L = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255; return L > 0.62 ? 'light' : 'dark'; }
        el = el.parentElement;
      }
      return 'dark';
    }
    function upd() {
      q = 0;
      var parts = [[innerWidth * 0.06, 6], [innerWidth * 0.5, 6], [innerWidth * 0.94, 6]].map(function (p) { return bgAt(p[0], p[1]); });
      var k = parts.join(',') + (scrollY > innerHeight * 0.85);
      if (k === last) return; last = k;
      nav.classList.add('nav--tone');
      nav.classList.toggle('is-scrolled', scrollY > innerHeight * 0.85 || !!document.querySelector('.case.is-open, #case:not([hidden])'));
      nav.style.setProperty('--nav-bg', parts[1] === 'light' ? 'rgba(255,255,255,.86)' : 'rgba(8,8,8,.78)');
      ['brand', 'links', 'meta'].forEach(function (n, i) { nav.style.setProperty('--tone-' + n, parts[i] === 'light' ? '#080808' : '#ffffff'); });
    }
    function kick() { if (!q) q = requestAnimationFrame(upd); }
    addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick); addEventListener('hashchange', function () { setTimeout(kick, 400); });
    setInterval(kick, 700); kick();
  })();

  /* ======================================================================
     PROCESS KEYRING — pinned; scrolling slides the rail, the tags swing
     ====================================================================== */
  (function procRing() {
    var sec = $('#timeline.proc'), track = $('#procTrack'), bar = $('#procBar'); if (!sec || !track) return;
    var tags = $$('.ptag', track), small = false, maxX = 0, x = 0, tx = 0, lastY = scrollY, vel = 0, raf = 0, act = -1;
    var sw = tags.map(function (t, i) { return { th: (i % 2 ? 2 : -2), w: 0 }; });
    function size() {
      small = innerWidth < 760;
      sec.classList.toggle('proc--swipe', small);
      if (small) { maxX = 0; sec.style.height = ''; track.style.transform = ''; return; }   /* phones: swipe sideways instead of a pinned scroll */
      var last = tags[tags.length - 1];
      maxX = last ? Math.max(0, last.offsetLeft + last.offsetWidth + 60 - innerWidth) : 0;
      /* the pinned area is only as tall as its content, centred in the window — no empty band before the brands */
      var pin = $('.proc__pin', sec), ph = pin.offsetHeight;
      pin.style.top = Math.max(0, (innerHeight - ph) / 2) + 'px';
      sec.style.height = (ph + maxX) + 'px';
    }
    function prog() { var r = sec.getBoundingClientRect(), pin = $('.proc__pin', sec), top = parseFloat(pin.style.top) || 0; return clamp((top - r.top) / Math.max(1, sec.offsetHeight - pin.offsetHeight), 0, 1); }
    function frame(now) {
      raf = 0;
      var dt = 1 / 60, p = prog();
      if (small) { p = clamp(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth), 0, 1); tx = x; }
      else { tx = -p * maxX; x += (tx - x) * (REDUCED ? 1 : 0.14); track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)'; }
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var moving = Math.abs(tx - x) > 0.3;
      vel *= 0.9;
      var mid = innerWidth / 2, best = -1, bd = 1e9;
      tags.forEach(function (t, i) {
        var s = sw[i];
        s.w += (-(s.th) * 26 - s.w * 3.4 + vel * 0.9) * dt; s.th += s.w * dt; s.th = clamp(s.th, -24, 24);
        t.style.setProperty('--sw', s.th.toFixed(2) + 'deg');
        var r = t.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; }
      });
      if (best !== act) { act = best; tags.forEach(function (t, i) { t.classList.toggle('is-on', i === best); }); }
      if (moving || tags.some(function (t, i) { return Math.abs(sw[i].w) > 0.4 || Math.abs(sw[i].th) > 0.3; })) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', function () { var dy = scrollY - lastY; lastY = scrollY; if (prog() > 0 && prog() < 1) vel = clamp(vel - dy * 0.9, -160, 160); kick(); }, { passive: true });
    var lastL = 0;
    track.addEventListener('scroll', function () { if (!small) return; var dx = track.scrollLeft - lastL; lastL = track.scrollLeft; vel = clamp(vel - dx * 0.6, -160, 160); kick(); }, { passive: true });
    tags.forEach(function (t, i) { t.addEventListener('pointerenter', function () { sw[i].w += (i % 2 ? -1 : 1) * 70; kick(); }); });
    addEventListener('resize', function () { size(); kick(); });
    if (document.fonts) document.fonts.ready.then(function () { size(); kick(); });
    addEventListener('load', function () { size(); kick(); });
    size(); kick();
  })();

  /* the hamper opens when it comes into view; tap the lid to open / close */
  (function hamperBox() {
    var box = $('#hamper'); if (!box) return;
    var lid = $('.hamper__lid', box);
    function set(open, quiet) {
      if (box.classList.contains('is-open') === open) return;
      box.classList.toggle('is-open', open);
      if (!quiet) { SFX.pop(); if (open) setTimeout(function () { SFX.jingle(0.9); }, 380); }
    }
    if (REDUCED) { box.classList.add('is-open'); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio > 0.45) set(true); });
    }, { threshold: [0, 0.45, 0.7] }).observe(box);
    else set(true, true);
    lid.addEventListener('click', function () { set(!box.classList.contains('is-open')); });
  })();

  /* ======================================================================
     BACKGROUND MUSIC — original loops tied to sections:
       · the films area gets a slow, cinematic ambient score
       · the contact page gets a fun, upbeat loop
     Each fades in while its section is on screen and out when you leave.
     Browsers only allow sound after a click / tap / key press, so nothing plays
     until the visitor's first interaction (or the sound button).
     ====================================================================== */
  (function () {
    var TRACKS = [
      { src: 'assets/audio/cinema.mp3', loop: 48.0, vol: 0.16, el: $('#filmsZone'), top: 0.75, bottom: 0.25 },
      { src: 'assets/audio/contact-soft.mp3', loop: 41.7391, vol: 0.2, el: $('#contact'), el2: $('#outro'), top: 0.65, bottom: 0.2 }
    ].filter(function (t) { return t.el; });
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'snd mono'; btn.setAttribute('aria-label', 'Background music');
    btn.innerHTML = '<span class="snd__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="snd__t">Sound</span>';
    document.body.appendChild(btn);
    var want = true; try { want = localStorage.getItem('as-sound3') !== 'off'; } catch (e) {}
    window.__muted = !want;
    var ctx = null, filmOn = false, started = false, loading = null;
    function near(tr) {
      if (root.style.overflow === 'hidden') return false;
      return [tr.el, tr.el2].some(function (el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.top < innerHeight * tr.top && r.bottom > innerHeight * tr.bottom; });
    }
    function anyNear() { return TRACKS.some(near); }
    function level(tr) { return want && !filmOn && !document.hidden && near(tr) ? tr.vol : 0; }
    function ui() { btn.classList.toggle('is-on', want && started); btn.setAttribute('aria-pressed', want ? 'true' : 'false'); btn.querySelector('.snd__t').textContent = want ? 'Sound: on' : 'Sound: off — tap to turn on'; }
    function load() {
      if (loading) return loading;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return Promise.reject();
      ctx = SFX.ctxGet() || new AC();
      loading = Promise.all(TRACKS.map(function (tr) {
        tr.gain = ctx.createGain(); tr.gain.gain.value = 0; tr.gain.connect(ctx.destination);
        return fetch(tr.src).then(function (r) { return r.arrayBuffer(); })
          .then(function (a) { return new Promise(function (ok, no) { ctx.decodeAudioData(a, ok, no); }); })
          .then(function (b) { tr.buf = b; }).catch(function () {});
      }));
      return loading;
    }
    function begin() {
      TRACKS.forEach(function (tr) {
        if (tr.node || !tr.buf) return;
        /* skip the encoder's silent lead-in so the loop is seamless */
        var d = tr.buf.getChannelData(0), s0 = 0; while (s0 < 8192 && Math.abs(d[s0]) < 1e-4) s0++;
        var st = s0 / tr.buf.sampleRate;
        tr.node = ctx.createBufferSource(); tr.node.buffer = tr.buf; tr.node.loop = true;
        tr.node.loopStart = st; tr.node.loopEnd = Math.min(tr.buf.duration, st + tr.loop);
        tr.node.connect(tr.gain); tr.node.start(0, st); started = true;
      });
      ui(); fade();
    }
    function fade(sec) {
      if (!ctx) return;
      var t = ctx.currentTime;
      TRACKS.forEach(function (tr) {
        if (!tr.gain) return; var v = level(tr), g = tr.gain.gain;
        g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
        g.linearRampToValueAtTime(v, t + (sec || (v ? 2.5 : 1.4)));
      });
    }
    function go() {
      if (!want) return;
      load().then(function () { return ctx.state === 'suspended' ? ctx.resume() : 0; })
        .then(function () { if (ctx.state === 'running') begin(); fade(); }).catch(function () {});
    }
    function firstGesture() {
      ['pointerdown', 'mousedown', 'touchend', 'click', 'keydown'].forEach(function (ev) { removeEventListener(ev, firstGesture, true); });
      go();
    }
    ['pointerdown', 'mousedown', 'touchend', 'click', 'keydown'].forEach(function (ev) { addEventListener(ev, firstGesture, true); });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      want = !(want && started); window.__muted = !want; try { localStorage.setItem('as-sound3', want ? 'on' : 'off'); } catch (er) {}
      if (want) go(); else fade(0.6);
      ui();
    });
    var sc = 0;
    addEventListener('scroll', function () { if (!sc) sc = requestAnimationFrame(function () { sc = 0; fade(); }); }, { passive: true });
    document.addEventListener('visibilitychange', function () { fade(0.4); });
    document.addEventListener('film:open', function () { filmOn = true; fade(0.5); });
    document.addEventListener('film:close', function () { filmOn = false; fade(); });
    /* if the browser already allows sound (returning visitor), get ready silently */
    function onHero() { if (want) { load().then(function () { if (ctx.state === 'running') begin(); }).catch(function () {}); } }
    if (root.classList.contains('hero-in')) onHero();
    else new MutationObserver(function (m, o) { if (root.classList.contains('hero-in')) { o.disconnect(); onHero(); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
    ui();
  })();

  /* About heading: each line fades from faint to full opacity as it scrolls up into view */
  (function () {
    var lines = $$('#aboutTitle .ln>span'); if (!lines.length) return;
    if (REDUCED) { lines.forEach(function (l) { l.style.opacity = 1; }); return; }
    var q = 0;
    function upd() {
      q = 0;
      lines.forEach(function (l, k) {
        var r = l.getBoundingClientRect();
        var p = clamp((innerHeight * (0.98 - k * 0.06) - r.top) / (innerHeight * 0.5), 0, 1);
        l.style.opacity = (0.08 + 0.92 * p * p * (3 - 2 * p)).toFixed(3);
      });
    }
    addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(upd); }, { passive: true });
    addEventListener('resize', upd); upd();
  })();

  /* films area: a slow montage from the films plays faintly behind the covers, only while on screen */
  (function () {
    var v = $('#filmsBg'); if (!v) return;
    if (REDUCED) { v.remove(); return; }
    var io2 = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); } var p = v.play(); if (p && p.catch) p.catch(function () {}); v.classList.add('is-on'); }
        else { v.pause(); }
      });
    }, { rootMargin: '200px 0px' }) : null;
    if (io2) io2.observe(v.parentNode);
    document.addEventListener('film:open', function () { v.pause(); });
  })();
})();
