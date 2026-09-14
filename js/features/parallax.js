/* ============================================================
   parallax.js · inclinación 3D del sobre según el puntero
   ============================================================ */
(function (App) {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = null;
  var objetivo = { x: 0, y: 0 }, actual = { x: 0, y: 0 };
  var activo = false;

  App.Parallax = {
    init: function () {
      el = App.U.$('envParallax');
      if (!el || REDUCED) return;
      addEventListener('pointermove', function (e) {
        if (!activo) return;
        objetivo.x = (e.clientX / innerWidth - .5) * 9;
        objetivo.y = (e.clientY / innerHeight - .5) * -7;
      });
    },
    setActivo: function (v) {
      activo = v;
      if (!v) { objetivo.x = 0; objetivo.y = 0; }
    },
    step: function () {
      if (!el) return;
      actual.x += (objetivo.x - actual.x) * .06;
      actual.y += (objetivo.y - actual.y) * .06;
      if (Math.abs(actual.x) > .01 || Math.abs(actual.y) > .01) {
        el.style.transform = 'rotateY(' + actual.x.toFixed(2) + 'deg) rotateX(' + actual.y.toFixed(2) + 'deg)';
      }
    }
  };
})(window.App = window.App || {});