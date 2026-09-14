/* ============================================================
   ajax.js · módulo de carga de datos por HTTP (AJAX)
   GET con reintentos + POST en JSON (para api/guardar.php)
   ============================================================ */
(function (App) {
  'use strict';

  var REINTENTOS = 2;
  var TIMEOUT_MS = 8000;

  /* ---------- GET con reintentos (espera progresiva) ---------- */
  function pedir(url, intento) {
    intento = intento || 0;
    return new Promise(function (resolver, rechazar) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);          /* true = asíncrono */
      xhr.timeout = TIMEOUT_MS;
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolver(xhr.responseText);
        else fallo(new Error('HTTP ' + xhr.status));
      };
      xhr.onerror = function () { fallo(new Error('error de red')); };
      xhr.ontimeout = function () { fallo(new Error('tiempo agotado')); };

      xhr.send(null);

      function fallo(err) {
        if (intento < REINTENTOS) {
          setTimeout(function () {
            pedir(url, intento + 1).then(resolver, rechazar);
          }, 350 * (intento + 1));
        } else {
          rechazar(new Error(err.message + ' · ' + url));
        }
      }
    });
  }

  /* ---------- Parseo tolerante: algunos hostings imprimen avisos
     PHP antes/después del JSON; aislamos el objeto si hace falta ---------- */
  function parsearJSON(txt) {
    var s = String(txt || '').trim();
    if (s === '') throw new Error('respuesta vacía del servidor');
    var i = s.indexOf('{'), f = s.lastIndexOf('}');
    if (i > 0 && f > i) s = s.slice(i, f + 1);
    return JSON.parse(s);
  }

  App.Ajax = {
    /* GET → texto plano */
    texto: function (url) { return pedir(url); },

    /* GET → JSON parseado */
    json: function (url) {
      return pedir(url).then(function (txt) {
        try { return parsearJSON(txt); }
        catch (e) { throw new Error('JSON inválido · ' + url); }
      });
    },

    /* POST en JSON → respuesta parseada.
       Sin reintentos: un guardado no debe dispararse dos veces solo. */
    post: function (url, datos) {
      return new Promise(function (resolver, rechazar) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.timeout = 10000;
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolver(parsearJSON(xhr.responseText)); }
            catch (e) { rechazar(new Error('respuesta inválida del servidor')); }
          } else {
            var msg = 'HTTP ' + xhr.status;
            try {
              var j = parsearJSON(xhr.responseText);
              if (j && j.error) msg = j.error;
            } catch (e) {}
            rechazar(new Error(msg));
          }
        };
        xhr.onerror = function () { rechazar(new Error('error de red')); };
        xhr.ontimeout = function () { rechazar(new Error('tiempo agotado')); };

        xhr.send(JSON.stringify(datos || {}));
      });
    }
  };
  
})(window.App = window.App || {});