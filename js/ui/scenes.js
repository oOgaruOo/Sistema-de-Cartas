/* ============================================================
   scenes.js · gestor de escenas (activación y eventos)
   ============================================================ */
(function (App) {
  'use strict';

  var escenas = {};
  var oyentes = [];

  App.SceneManager = {
    init: function (nombres) {
      nombres.forEach(function (n) {
        var el = App.U.$('scene-' + n);
        if (el) escenas[n] = el;
      });
    },
    mostrar: function (nombre) {
      if (!escenas[nombre]) return;
      Object.keys(escenas).forEach(function (n) {
        escenas[n].classList.toggle('active', n === nombre);
      });
      oyentes.forEach(function (fn) { fn(nombre); });
    },

    /* Vuelve a disparar la animación de entrada de una escena */
    reanimar: function (nombre) {
      var el = escenas[nombre];
      if (!el) return;
      el.classList.remove('active');
      void el.offsetWidth;          /* fuerza reflow: reinicia las animaciones */
      el.classList.add('active');
    },

    /* Permite que otros módulos reaccionen a los cambios de escena */
    alCambiar: function (fn) { oyentes.push(fn); }
  };
})(window.App = window.App || {});