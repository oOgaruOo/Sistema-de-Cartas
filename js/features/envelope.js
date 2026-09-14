/* ============================================================
   envelope.js · apertura del sobre (sello, solapa, carta)
   ============================================================ */
(function (App) {
  'use strict';

  var sello, solapa, miniCarta, escenario;
  var abierto = false;
  var oyentes = [];

  function avisar() { oyentes.forEach(function (fn) { fn(); }); }

  App.Envelope = {
    init: function () {
      sello = App.U.$('waxSeel');
      solapa = App.U.$('flap');
      miniCarta = App.U.$('letterMini');
      escenario = App.U.$('envStage');
      sello.addEventListener('click', function () {
        if (abierto) return;
        abierto = true;
        App.Envelope.abrir();
      });
    },

    /* Otros módulos se enteran cuando el sobre quedó abierto */
    alAbrir: function (fn) { oyentes.push(fn); },

    /* Secuencia completa: grietas → caída → solapa → carta asoma → salida */
    abrir: function () {
      App.AudioFX.crujido();
      sello.classList.add('cracked');
      setTimeout(function () { sello.classList.add('falling'); }, 300);
      setTimeout(function () { solapa.classList.add('open'); App.AudioFX.deslizar(); }, 520);
      setTimeout(function () { solapa.style.zIndex = 1; }, 980);
      setTimeout(function () { miniCarta.classList.add('risen'); }, 1250);
      setTimeout(function () {
        escenario.classList.add('away');
        avisar();
      }, 2250);
    },

    reset: function () {
      abierto = false;
      sello.classList.remove('cracked', 'falling');
      solapa.classList.remove('open');
      solapa.style.zIndex = '';
      miniCarta.classList.remove('risen');
      escenario.classList.remove('away');
    }
  };
})(window.App = window.App || {});