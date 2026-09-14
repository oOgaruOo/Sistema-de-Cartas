/* ============================================================
   audio.js · v6 — SFX + melodía POR TEMA
   - App.Musica.cambiar(cfg): cambia progresión/tonalidad en vivo
   - nota() y acorde() armonizan con el tema activo
   - Motor: caja de música con bajo, reintentos y pausa por pestaña
   ============================================================ */
(function (App) {
  'use strict';

  var ctx = null;
  var activado = true;
  var MASTER = 0.9;

  /* Melodía por defecto (tema "Pedir perdón"): La menor */
  var MUSICA_BASE = {
    compas: 3400, paso: .5, vol: .085, nota: 392, acorde: 196,
    progresion: [
      { bajo: 110.00, notas: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63] },
      { bajo:  87.31, notas: [174.61, 220.00, 261.63, 349.23, 261.63, 220.00] },
      { bajo: 130.81, notas: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] },
      { bajo:  98.00, notas: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94] },
      { bajo:  82.41, notas: [164.81, 196.00, 246.94, 329.63, 246.94, 196.00] },
      { bajo: 110.00, notas: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63] },
      { bajo:  87.31, notas: [174.61, 220.00, 261.63, 349.23, 261.63, 220.00] },
      { bajo:  82.41, notas: [164.81, 207.65, 246.94, 329.63, 246.94, 207.65] }
    ]
  };

  function asegurar() {
    if (!activado) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  /* ---------- Efectos puntuales ---------- */
  function tono(freq, t0, dur, vol, tipo) {
    var c = asegurar(); if (!c) return;
    var t = c.currentTime + t0;
    var o = c.createOscillator(), g = c.createGain();
    o.type = tipo || 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * MASTER, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + .05);
    if (tipo !== 'sine') {
      var o2 = c.createOscillator(), g2 = c.createGain();
      o2.type = 'sine'; o2.frequency.value = freq * 2;
      g2.gain.setValueAtTime(.0001, t);
      g2.gain.exponentialRampToValueAtTime(vol * MASTER * .3, t + .012);
      g2.gain.exponentialRampToValueAtTime(.0001, t + dur * .85);
      o2.connect(g2); g2.connect(c.destination);
      o2.start(t); o2.stop(t + dur + .05);
    }
  }

  function golpe(freq, t0, dur, vol) {
    var c = asegurar(); if (!c) return;
    var t = c.currentTime + t0;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * .6, t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * MASTER, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + .05);
  }

  function ruido(t0, dur, vol, freq, q) {
    var c = asegurar(); if (!c) return;
    var len = Math.max(1, (dur * c.sampleRate) | 0);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    var g = c.createGain();
    var t = c.currentTime + t0;
    g.gain.setValueAtTime(vol * MASTER, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t); src.stop(t + dur + .02);
  }

  /* ---------- Motor de melodía ---------- */
  var musica = { iniciada: false, temporizador: null, indice: 0, reintentos: 0, cfg: MUSICA_BASE };

  function notaCaja(freq, t, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + 1.9);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 2);

    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * .28, t + .015);
    g2.gain.exponentialRampToValueAtTime(.0001, t + .9);
    o2.connect(g2); g2.connect(ctx.destination);
    o2.start(t); o2.stop(t + 1);
  }

  function bajoSuave(freq, t, vol) {
    var v = vol || .07;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + .5);
    g.gain.setValueAtTime(v, t + 2.4);
    g.gain.exponentialRampToValueAtTime(.0001, t + 3.4);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 3.5);
  }

  function compas() {
    if (!activado || !ctx || ctx.state !== 'running') return false;
    var m = musica.cfg;
    var c = m.progresion[musica.indice % m.progresion.length];
    musica.indice++;
    var t = ctx.currentTime + .06;
    bajoSuave(c.bajo, t, (m.vol || .085) * .85);
    var paso = m.paso || .5, vol = m.vol || .085;
    for (var i = 0; i < c.notas.length; i++) {
      notaCaja(c.notas[i], t + .18 + i * paso, vol + Math.random() * .025);
    }
    return true;
  }

  function iniciarMusica() {
    if (!activado || musica.temporizador || !ctx) return;
    if (!compas()) {
      if (musica.reintentos < 20) {
        musica.reintentos++;
        setTimeout(function () { asegurar(); iniciarMusica(); }, 200);
      }
      return;
    }
    musica.reintentos = 0;
    musica.temporizador = setInterval(compas, musica.cfg.compas || 3400);
  }

  function pararMusica() {
    if (musica.temporizador) { clearInterval(musica.temporizador); musica.temporizador = null; }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pararMusica();
    else if (activado && musica.iniciada) iniciarMusica();
  });

  function desbloquear() {
    var c = asegurar();
    if (!c) return;
    try {
      var o = c.createOscillator(), g = c.createGain();
      g.gain.value = .0001;
      o.connect(g); g.connect(c.destination);
      o.start(0); o.stop(c.currentTime + .05);
    } catch (e) {}
    if (!musica.iniciada) {
      musica.iniciada = true;
      if (activado) setTimeout(iniciarMusica, 500);
    }
  }
  if (document.addEventListener) {
    document.addEventListener('pointerdown', desbloquear, { once: true });
    document.addEventListener('keydown', desbloquear, { once: true });
  }

  /* ---------- APIs públicas ---------- */
  App.Musica = {
    arrancar: function () {
      var c = asegurar();
      if (!c) return;
      if (!musica.iniciada) musica.iniciada = true;
      if (activado) iniciarMusica();
    },

    /* Cambia la melodía (progresión, tempo, tonalidad) en vivo */
    cambiar: function (cfg) {
      if (!cfg || !cfg.progresion || !cfg.progresion.length) return;
      var distinta = cfg !== musica.cfg;
      musica.cfg = cfg;
      musica.indice = 0;
      if (distinta && musica.temporizador) {
        pararMusica();
        iniciarMusica();      /* la nueva tonalidad entra de inmediato */
      }
    }
  };

  App.AudioFX = {
    get activado() { return activado; },

    alternar: function () {
      activado = !activado;
      if (!activado) pararMusica();
      else if (musica.iniciada) iniciarMusica();
    },

    _vigilar: function () {
      if (activado && musica.iniciada && !musica.temporizador) iniciarMusica();
    },

    tecla:    function () { this._vigilar(); if (Math.random() < .8) tono(1250 + Math.random() * 950, 0, .05, .02, 'square'); },
    crujido:  function () { this._vigilar(); ruido(0, .16, .38, 850, 1.6); golpe(120, 0, .14, .16); },
    deslizar: function () { this._vigilar(); ruido(0, .42, .09, 650, .8); },
    sello:    function () { this._vigilar(); golpe(95, 0, .22, .34); ruido(0, .09, .2, 480, 1); golpe(48, .02, .18, .22); },

    /* la nota del énfasis armoniza con el tema activo */
    nota:     function (f) {
      this._vigilar();
      var fr = f || (musica.cfg && musica.cfg.nota) || 392;
      tono(fr, 0, 1.3, .14);
      tono(fr * 1.5, .04, 1.1, .06);
    },

    /* el acorde final, en la tonalidad del tema */
    acorde:   function () {
      this._vigilar();
      var raiz = (musica.cfg && musica.cfg.acorde) || 196;
      [1, 1.5, 2, 2.5, 3].forEach(function (m, i) { tono(raiz * m, i * .12, 2.2, .12); });
      golpe(49, 0, .5, .12);
    },

    latido:   function () { this._vigilar(); golpe(60, 0, .26, .34); golpe(52, .30, .32, .28); }
  };
})(window.App = window.App || {});