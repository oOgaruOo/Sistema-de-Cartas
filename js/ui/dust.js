/* ============================================================
   dust.js · motas doradas flotando de fondo (canvas)
   ============================================================ */
(function (App) {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = { areaPorParticula: 26000, maximo: 58 };

  var cv, ctx, W = 0, H = 0, parts = [];

  function sembrar() {
    var n = Math.min(cfg.maximo, Math.round(W * H / cfg.areaPorParticula));
    parts = [];
    for (var i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * W, y: Math.random() * H,
        r: .6 + Math.random() * 1.3,
        a: .18 + Math.random() * .4,
        sp: 4 + Math.random() * 9,
        ph: Math.random() * Math.PI * 2,
        fr: .2 + Math.random() * .5,
        tw: .4 + Math.random() * .8
      });
    }
  }

  function dibujarEstatico() {
    ctx.clearRect(0, 0, W, H);
    parts.forEach(function (d) {
      ctx.fillStyle = 'rgba(179,129,58,' + (d.a * .5).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
    });
  }

  function redimensionar() {
    var dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sembrar();
    if (REDUCED) dibujarEstatico();
  }

  App.Dust = {
    init: function (conf) {
      if (conf) Object.keys(conf).forEach(function (k) { if (k in cfg) cfg[k] = conf[k]; });
      cv = App.U.$('dust');
      ctx = cv.getContext('2d');
      addEventListener('resize', redimensionar);
      redimensionar();
    },
    step: function (now, dt) {
      if (REDUCED) return;
      ctx.clearRect(0, 0, W, H);
      var t = now * .001;
      for (var i = 0; i < parts.length; i++) {
        var d = parts[i];
        d.y -= d.sp * dt;
        if (d.y < -6) { d.y = H + 6; d.x = Math.random() * W; }
        var x = d.x + Math.sin(t * d.fr + d.ph) * 12;
        var alpha = d.a * (.45 + .55 * Math.sin(t * d.tw + d.ph));
        if (alpha <= .02) continue;
        ctx.fillStyle = 'rgba(179,129,58,' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, d.y, d.r, 0, 7); ctx.fill();
      }
    }
  };
})(window.App = window.App || {});