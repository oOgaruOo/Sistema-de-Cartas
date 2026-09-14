/* ============================================================
   effects.js · lluvia de pétalos y corazones (canvas)
   v2 — colores según el tema de la carta
   ============================================================ */
(function (App) {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORES = ['#c76a63', '#d98e86', '#e5b3a4', '#a4392f', '#d4a24e', '#e8cfa0'];

  var cfg = { emisionPorSegundo: 26, probCorazon: .22, colores: null, colorCorazon: '#96271f' };
  var cv, ctx, W = 0, H = 0;
  var partes = [], emision = 0, acumulado = 0;
  var corriendo = false, ultimo = 0;

  function crear() {
    var corazon = Math.random() < cfg.probCorazon;
    var paleta = cfg.colores || COLORES;
    partes.push({
      heart: corazon,
      bx: Math.random() * W, y: -30 - Math.random() * 60,
      vy: 55 + Math.random() * 95, drift: (Math.random() - .5) * 22,
      s: corazon ? 5 + Math.random() * 5 : 7 + Math.random() * 9,
      rot: Math.random() * 6.28, spin: (Math.random() - .5) * 2.6,
      amp: 18 + Math.random() * 42, fr: .6 + Math.random() * 1.2,
      ph: Math.random() * 6.28,
      color: corazon ? cfg.colorCorazon : paleta[(Math.random() * paleta.length) | 0],
      alpha: .72 + Math.random() * .28
    });
  }

  function dibujarPetalo(p) {
    ctx.save();
    ctx.translate(p.bx + Math.sin(p.ph) * p.amp, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    var s = p.s;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    if (p.heart) {
      ctx.moveTo(0, -s * .55);
      ctx.bezierCurveTo(s * .7, -s * 1.05, s * 1.25, -s * .15, 0, s * .75);
      ctx.bezierCurveTo(-s * 1.25, -s * .15, -s * .7, -s * 1.05, 0, -s * .55);
    } else {
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * .85, -s * .5, s * .7, s * .5, 0, s);
      ctx.bezierCurveTo(-s * .7, s * .5, -s * .85, -s * .5, 0, -s);
    }
    ctx.fill();
    if (!p.heart) {
      ctx.strokeStyle = 'rgba(90,30,20,.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -s * .8);
      ctx.quadraticCurveTo(s * .16, 0, 0, s * .8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function redimensionar() {
    var dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  App.FX = {
    init: function (conf) {
      if (conf) Object.keys(conf).forEach(function (k) { if (k in cfg && conf[k] != null) cfg[k] = conf[k]; });
      cv = App.U.$('fx');
      ctx = cv.getContext('2d');
      addEventListener('resize', redimensionar);
      redimensionar();
    },
    rafaga: function (seg) {
      if (REDUCED) seg = Math.min(seg, 1.6);
      emision = Math.max(emision, seg);
      for (var i = 0; i < 12; i++) crear();
      if (!corriendo) { corriendo = true; ultimo = performance.now(); }
    },
    step: function (ahora) {
      if (!corriendo) return;
      var d = Math.min((ahora - ultimo) / 1000, .05); ultimo = ahora;
      if (emision > 0) {
        emision -= d;
        acumulado += (REDUCED ? 8 : cfg.emisionPorSegundo) * d;
        while (acumulado > 1) { crear(); acumulado--; }
      }
      ctx.clearRect(0, 0, W, H);
      for (var i = partes.length - 1; i >= 0; i--) {
        var p = partes[i];
        p.y += p.vy * d; p.bx += p.drift * d; p.ph += p.fr * d; p.rot += p.spin * d;
        if (p.y > H + 50) { partes.splice(i, 1); continue; }
        dibujarPetalo(p);
      }
      if (!partes.length && emision <= 0) {
        corriendo = false;
        ctx.clearRect(0, 0, W, H);
      }
    }
  };
})(window.App = window.App || {});