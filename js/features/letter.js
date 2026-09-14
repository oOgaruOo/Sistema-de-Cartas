/* ============================================================
   letter.js · contenido y flujo de la carta en pantalla
   ============================================================ */
(function (App) {
  'use strict';

  var HEART_D = 'M50 76 C28 60 10 46 10 28 C10 14 21 7 31 7 C40 7 47 13 50 20 C53 13 60 7 69 7 C79 7 90 14 90 28 C90 46 72 60 50 76';

  var TW = null;
  var DOM = {};
  var datos = null;                 /* contenido cargado por AJAX */
  var nombres = { to: '', from: '' };
  var flujo = 0;

  /* ---------- Constructores de bloques ---------- */
  function bloques() {
    return (datos && datos.bloques) || [];
  }

  function construirFirma() {
    var d = document.createElement('div');
    d.className = 'signature';
    var despedida = (datos && datos.despedida) || 'Con todo mi corazón,';
    var nombre = nombres.from
      ? '<span class="sig-name">' + App.U.escapeHtml(nombres.from) + '</span>'
      : '';
    d.innerHTML =
      '<svg class="sig-heart" viewBox="0 0 100 90" aria-hidden="true">' +
        '<path class="trace-path" pathLength="1" d="' + HEART_D + '"/>' +
      '</svg>' +
      '<div class="sig-text">' +
        '<span class="sig-line">' + App.U.escapeHtml(despedida) + '</span>' + nombre +
      '</div>';
    return d;
  }

  function construirEnfasis(texto) {
    var e = document.createElement('div');
    e.className = 'emphasis';
    e.innerHTML = '<span class="orn"></span><span class="em-text">' +
      App.U.escapeHtml(texto || 'Lo siento.') +
      '</span><span class="orn"></span>';
    return e;
  }

  /* ---------- Flujo narrado con máquina de escribir ---------- */
  async function reproducir() {
    reiniciar();
    flujo = TW.iniciarFlujo();
    var lista = bloques();

    for (var i = 0; i < lista.length; i++) {
      var b = lista[i];

      if (b.tipo === 'parrafo') {
        var p = document.createElement('p');
        p.className = 'ltr-p';
        var caret = document.createElement('span');
        caret.className = 'caret';
        p.appendChild(caret);
        DOM.body.appendChild(p);
        if (!await TW.escribir(p, caret, b.texto, flujo)) return;
        caret.remove();
        if (!await TW.espera(620, flujo)) return;

      } else if (b.tipo === 'enfasis') {
        var e = construirEnfasis(b.texto);
        DOM.body.appendChild(e);
        if (!await TW.espera(500, flujo)) return;
        e.classList.add('show');
        App.AudioFX.nota(440);
        DOM.scroll.scrollTop = DOM.scroll.scrollHeight;
        if (!await TW.espera(1900, flujo)) return;

      } else if (b.tipo === 'firma') {
        var f = construirFirma();
        DOM.body.appendChild(f);
        if (!await TW.espera(500, flujo)) return;
        f.classList.add('show');
        DOM.scroll.scrollTop = DOM.scroll.scrollHeight;
        if (!await TW.espera(2100, flujo)) return;
      }
    }
    terminar(false);
  }

  /* ---------- Versión instantánea (botón "mostrar todo") ---------- */
  function pintarTodo() {
    DOM.body.innerHTML = '';
    bloques().forEach(function (b) {
      if (b.tipo === 'parrafo') {
        var p = document.createElement('p');
        p.className = 'ltr-p';
        p.textContent = b.texto;
        DOM.body.appendChild(p);
      } else if (b.tipo === 'enfasis') {
        var e = construirEnfasis(b.texto);
        e.classList.add('show', 'no-anim');
        DOM.body.appendChild(e);
      } else if (b.tipo === 'firma') {
        var f = construirFirma();
        f.classList.add('show', 'no-anim');
        DOM.body.appendChild(f);
      }
    });
        DOM.scroll.scrollTop = DOM.scroll.scrollHeight;
    terminar(true);
  }

  function terminar(instantaneo) {
    DOM.skip.classList.add('fading');
    setTimeout(function () { DOM.skip.classList.add('hide'); }, 550);
    DOM.continue.classList.remove('hide');
    if (!instantaneo) App.AudioFX.nota(523.25);
  }

  function reiniciar() {
    TW.cancelar();
    DOM.body.innerHTML = '';
    DOM.scroll.scrollTop = 0;
    DOM.skip.classList.remove('fading', 'hide');
    DOM.continue.classList.add('hide');
  }

  /* ---------- API pública del módulo ---------- */
  App.Letter = {
    init: function () {
      TW = App.Typewriter;
      DOM.body = App.U.$('letterBody');
      DOM.scroll = App.U.$('paperScroll');
      DOM.skip = App.U.$('skipBtn');
      DOM.continue = App.U.$('continueBtn');
      TW.montar(DOM.scroll);

      DOM.skip.addEventListener('click', function () {
        TW.cancelar();
        pintarTodo();
      });
      DOM.continue.addEventListener('click', function () {
        App.AudioFX.acorde();
        App.SceneManager.mostrar('question');
      });
    },
    cargarContenido: function (carta) { datos = carta; },
    establecerNombres: function (n) { nombres = n; },
    reproducir: reproducir,
    reiniciar: reiniciar
  };
})(window.App = window.App || {});