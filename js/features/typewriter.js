/* ============================================================
   typewriter.js · motor de escritura con cancelación por token
   v2 — el cursor siempre visible para quien sigue la lectura
   ============================================================ */
(function (App) {
  'use strict';

  var CFG = { baseMs: 24, varMs: 34, pausaComa: 170, pausaPunto: 340 };
  var MARGEN_SEGUIMIENTO = 90;   /* px desde el fondo = "está siguiendo la lectura" */
  var papel = null;
  var token = 0;
  var saltar = false;

  /* ¿Está el lector cerca del final? Solo entonces auto-desplazamos */
  function siguiendo() {
    if (!papel) return true;
    return papel.scrollHeight - papel.scrollTop - papel.clientHeight < MARGEN_SEGUIMIENTO;
  }
  function llevarAlCursor() {
    if (papel && siguiendo()) papel.scrollTop = papel.scrollHeight;
  }

  App.Typewriter = {
    montar: function (contenedorScroll) { papel = contenedorScroll; },

    configurar: function (c) {
      if (!c) return;
      Object.keys(CFG).forEach(function (k) { if (k in c) CFG[k] = c[k]; });
    },

    iniciarFlujo: function () { token++; saltar = false; return token; },

    cancelar: function () { saltar = true; token++; return token; },

    espera: function (ms, t) {
      var t0 = performance.now();
      return new Promise(function (res) {
        (function chk() {
          if (saltar || t !== token) return res(false);
          if (performance.now() - t0 >= ms) return res(true);
          setTimeout(chk, 90);
        })();
      });
    },

    escribir: function (parrafo, caret, texto, t) {
      return new Promise(function (res) {
        var nodo = document.createTextNode('');
        parrafo.insertBefore(nodo, caret);
        var i = 0;
        (function paso() {
          if (saltar || t !== token) return res(false);
          if (i >= texto.length) return res(true);
          var ch = texto[i++];
          nodo.data += ch;
          llevarAlCursor();          /* desplaza en cada letra, si el lector acompaña */
          if (ch !== ' ') App.AudioFX.tecla();
          var d = CFG.baseMs + Math.random() * CFG.varMs;
          if (ch === ',' || ch === '—' || ch === ';') d += CFG.pausaComa;
          else if (ch === '.' || ch === '?' || ch === '!' || ch === ':' || ch === '»') d += CFG.pausaPunto;
          setTimeout(paso, d);
        })();
      });
    }
  };
})(window.App = window.App || {});