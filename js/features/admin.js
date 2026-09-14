/* ============================================================
   admin.js · v10 — editor con tema fijo y ejemplo por tipo
   - Tema elegido en la portada (cabecera estática de referencia)
   - Placeholder del textarea ACORDE al tipo de carta
   - Llave del editor + borrador automático + anti-doble-clic
   ============================================================ */
(function (App) {
  'use strict';

  var U = App.U;
  var montado = false;
  var phpOK = false;
  var editando = false;
  var cartaId = null;
  var datos = null;
  var DOM = {};

  var DRAFT_KEY = 'disculpa-borrador';
  var LOK = 'disculpa-editor-ok-';
  var hashEditor = null;
  var tBorrador = null;

  /* Frase de referencia por tema (acompaña al nombre en la cabecera) */
  var FRASES_TEMA = {
    disculpa:    'Una carta para pedir perdón',
    teextrano:   'Una carta desde la distancia',
    cumple:      'Una carta para celebrar su día',
    madre:       'Una carta para mamá',
    aniversario: 'Una carta por su aniversario'
  };

  /* Texto de ejemplo del textarea, según el tipo de carta */
  var EJEMPLOS = {
    disculpa:
      'Llevo días queriendo decirte esto. Lo ensayé mil veces en mi cabeza y, ahora que por fin me decido, ninguna palabra me parece suficiente.\n\n' +
      '*Lo siento.*\n\n' +
      'Y no lo digo por decir: lo digo porque me duele lo que te hice. Sé que un «perdón» no borra lo que pasó, pero quiero demostrarte con hechos que aprendí.\n\n' +
      'Tómate el tiempo que necesites. Yo aquí estaré.',
    teextrano:
      'No sé en qué momento la distancia empezó a pesar tanto. Solo sé que hay cosas de mi día que todavía quiero contarte a ti.\n\n' +
      '*Te extraño.*\n\n' +
      'No te escribo para pedir nada: solo para que sepas que sigues en mis pensamientos, en mis canciones y en los lugares que recorrimos.\n\n' +
      'Si algún día quieres hablar, aquí sigo.',
    cumple:
      'Hoy amanecí pensando que el mundo tiene suerte: un día como hoy, naciste tú.\n\n' +
      '*Feliz cumpleaños.*\n\n' +
      'Ojalá este año te devuelva todo lo bueno que le has dado a los demás, y ojalá yo esté ahí para verlo.\n\n' +
      'Pide un deseo por mí también.',
    madre:
      'Hay cosas que llevo años queriendo decirte y nunca encontré el momento ni las palabras correctas.\n\n' +
      '*Gracias, mamá.*\n\n' +
      'Por todo lo que hiciste callada, por lo que sacrificaste sin que yo lo notara, y por seguir ahí aunque a veces no lo merecí.\n\n' +
      'Te amo hoy y siempre.',
    aniversario:
      'Otro año contigo, y todavía me sorprendes.\n\n' +
      '*Feliz aniversario.*\n\n' +
      'Gracias por cada día: por los fáciles y por los que nos costaron, porque de todo aprendimos algo juntos.\n\n' +
      'Que sigan los años, y que me sigas eligiendo como yo a ti.'
  };

  var FONDOS_ADMIN = {
    disculpa:    'linear-gradient(180deg,#f3ecdd 0%,#ece2cc 100%)',
    teextrano:   'linear-gradient(180deg,#f6efdc 0%,#eddfbe 100%)',
    cumple:      'linear-gradient(180deg,#f0f2e4 0%,#e1ebd8 100%)',
    madre:       'linear-gradient(180deg,#f8ecea 0%,#f3dae1 100%)',
    aniversario: 'linear-gradient(180deg,#f4eef2 0%,#eadbe4 100%)'
  };

  /* El tema queda fijado al entrar (se decide en la portada) */
  var temaFijo = 'disculpa';

  function base() {
    return location.origin + location.pathname.replace(/index\.html$/i, '').replace(/\/+$/, '') + '/';
  }

  function bloquesATexto(bloques) {
    var out = [];
    (bloques || []).forEach(function (b) {
      if (b.tipo === 'parrafo') out.push(b.texto);
      else if (b.tipo === 'enfasis') out.push('*' + b.texto + '*');
    });
    return out.join('\n\n');
  }

  function msg(txt, tipo) {
    DOM.msg.textContent = txt || '';
    DOM.msg.className = 'admin-msg' + (tipo ? ' ' + tipo : '');
  }

  function copiar(btn, texto) {
    function listo() {
      var o = btn.textContent;
      btn.textContent = '¡Copiado!';
      setTimeout(function () { btn.textContent = o; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(listo, function () { listo(); });
    } else listo();
  }

  function boton(texto, ghost, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-sm' + (ghost ? ' btn-ghost' : '');
    b.textContent = texto;
    b.addEventListener('click', fn);
    return b;
  }

  function filaEnlace(titulo, url, botones) {
    var fila = document.createElement('div');
    fila.className = 'admin-link';
    var t = document.createElement('p');
    t.className = 'admin-link-t'; t.textContent = titulo;
    var c = document.createElement('code');
    c.textContent = url;
    var cont = document.createElement('div');
    cont.className = 'admin-link-btns';
    botones.forEach(function (b) { cont.appendChild(boton(b[0], b[1], b[2])); });
    fila.appendChild(t); fila.appendChild(c); fila.appendChild(cont);
    return fila;
  }

  function mostrarEnlaces(id, hashClave, palabraEnClaro) {
    var zona = DOM.links;
    zona.innerHTML = '';
    zona.classList.remove('hide');

    var limpio = base() + '?carta=' + id;
    var directo = base() + '?carta=' + id + '&k=' + hashClave;
    var editar = base() + '?carta=' + id + '#admin';

    zona.appendChild(filaEnlace('Enlace para esa persona — digita la palabra secreta', limpio, [
      ['Copiar', false, function () { copiar(this, limpio); }],
      ['Probar', true, function () { location.href = limpio; }]
    ]));
    zona.appendChild(filaEnlace('Enlace directo — la carta se abre sola', directo, [
      ['Copiar', false, function () { copiar(this, directo); }],
      ['WhatsApp', true, function () {
        window.open('https://wa.me/?text=' + encodeURIComponent(
          'Hay algo que escribí para ti, y me gustaría que lo leyeras cuando tengas un momento tranquilo:\n' + directo), '_blank');
      }]
    ]));
    zona.appendChild(filaEnlace('Tu enlace para editar esta carta más adelante', editar, [
      ['Copiar', false, function () { copiar(this, editar); }]
    ]));

    var p = document.createElement('p');
    p.className = 'admin-recordar';
    p.innerHTML = palabraEnClaro
      ? 'Palabra secreta: <b>' + palabraEnClaro.replace(/[<>&]/g, '') + '</b> (mayúsculas y acentos no importan). Guárdala junto con tu enlace de edición.'
      : 'La palabra secreta no cambió: sigue siendo la que ya conocías.';
    zona.appendChild(p);
  }

  /* ---------- Cabecera estática del tema ---------- */
  function pintarCabeceraTema(temaId) {
    if (!App.Temas) return;
    var d = App.Temas.def(temaId);
    var nombre = DOM.cabNombre, frase = DOM.cabFrase, emblema = DOM.cabEmblema;

    if (nombre) nombre.textContent = d.etiqueta;
    if (frase) frase.textContent = FRASES_TEMA[temaId] || '';
    if (emblema) {
      var svg = emblema.querySelector('svg');
      if (svg) svg.innerHTML = d.emblema;
    }
  }

  function aplicarFondoTema(temaId) {
    var escena = U.$('scene-admin');
    var fondo = U.$('adminFondo');
    if (escena) escena.style.background = FONDOS_ADMIN[temaId] || FONDOS_ADMIN.disculpa;
    if (fondo && App.Temas) {
      var svg = fondo.querySelector('svg');
      if (svg) svg.innerHTML = App.Temas.emblemaInner(temaId);
    }
  }

  /* Texto de ejemplo acorde al tipo (solo si aún no hay nada escrito) */
  function aplicarEjemplo(temaId) {
    if (DOM.texto && DOM.texto.value === '') {
      DOM.texto.placeholder = EJEMPLOS[temaId] || EJEMPLOS.disculpa;
    }
  }

  function aplicarTemaUI(val) {
    temaFijo = App.Temas ? App.Temas.validar(val) : 'disculpa';
    if (App.Temas) App.Temas.aplicar(temaFijo);
    pintarCabeceraTema(temaFijo);
    aplicarFondoTema(temaFijo);
    aplicarEjemplo(temaFijo);
    if (App.Musica && App.Temas && typeof App.Musica.cambiar === 'function') {
      App.Musica.cambiar(App.Temas.musica(temaFijo));
    }
  }

  /* ---------- Borrador automático ---------- */
  function horaCorta(ts) {
    try {
      return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(ts));
    } catch (e) { return ''; }
  }

  function leerBorrador() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      return (d && typeof d === 'object') ? d : null;
    } catch (e) { return null; }
  }

  function hayBorrador(d) {
    return !!(d && (d.texto || d.para || d.de || d.despedida || d.pista || d.clave));
  }

  function guardarBorrador() {
    if (editando) return;
    var d = {
      para: DOM.para.value, de: DOM.de.value,
      despedida: DOM.despedida.value, texto: DOM.texto.value,
      pista: DOM.pista.value, clave: DOM.clave.value,
      tema: temaFijo,
      cuando: Date.now()
    };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) { return; }
    if (DOM.status) DOM.status.textContent = 'Borrador guardado automáticamente · ' + horaCorta(Date.now());
  }

  function borrarBorrador() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    if (DOM.status) DOM.status.textContent = '';
  }

  function programarGuardado() {
    clearTimeout(tBorrador);
    tBorrador = setTimeout(guardarBorrador, 1500);
  }

  function mostrarCajaBorrador(d) {
    DOM.draftTxt.textContent = 'Encontramos un borrador sin terminar' +
      (d.cuando ? ' (' + horaCorta(d.cuando) + ')' : '') + '.';
    DOM.draftBox.classList.remove('hide');
  }
  function ocultarCajaBorrador() { DOM.draftBox.classList.add('hide'); }

  function recuperarBorrador(d) {
    DOM.para.value = d.para || '';
    DOM.de.value = d.de || '';
    DOM.despedida.value = d.despedida || '';
    DOM.texto.value = d.texto || '';
    DOM.pista.value = d.pista || '';
    DOM.clave.value = d.clave || '';
    aplicarTemaUI(App.Temas ? App.Temas.validar(d.tema || temaFijo) : temaFijo);
    ocultarCajaBorrador();
    msg('Borrador recuperado. Termina tu carta cuando quieras.', 'exito');
  }

  /* ---------- Montaje ---------- */
  function montar() {
    DOM.form = U.$('adminForm');
    DOM.para = U.$('adminPara');
    DOM.de = U.$('adminDe');
    DOM.despedida = U.$('adminDespedida');
    DOM.texto = U.$('adminTexto');
    DOM.clave = U.$('adminClave');
    DOM.pista = U.$('adminPista');
    DOM.pass = U.$('adminPass');
    DOM.msg = U.$('adminMsg');
    DOM.links = U.$('adminLinks');
    DOM.sub = U.$('adminSub');
    DOM.notaClave = U.$('adminClaveNota');
    DOM.titulo = U.$('adminTitle');
    DOM.guardar = U.$('adminGuardar');
    DOM.idBadge = U.$('adminId');
    DOM.cabecera = U.$('temaCabecera');
    DOM.cabEmblema = U.$('temaCabEmblema');
    DOM.cabNombre = U.$('temaCabNombre');
    DOM.cabFrase = U.$('temaCabFrase');
    DOM.cambiar = U.$('temaCambiar');
    DOM.draftBox = U.$('draftBox');
    DOM.draftTxt = U.$('draftTxt');
    DOM.status = U.$('draftStatus');

    if (!DOM.form) return false;

    /* Fondo del escritorio (inyectado una vez, con sus estilos) */
    if (!U.$('adminFondo')) {
      var escena = U.$('scene-admin');
      if (escena) {
        var st = document.createElement('style');
        st.textContent =
          '#scene-admin{ transition:background .7s ease; }' +
          '#scene-admin .scene-inner{ position:relative; z-index:1; }' +
          '.admin-fondo{ position:absolute; inset:0; display:grid; place-items:center; pointer-events:none; }' +
          '.admin-fondo svg{ width:min(62vmin,440px); height:auto; opacity:.1; color:var(--crimson); }' +
          '.admin-fondo svg path,.admin-fondo svg circle,.admin-fondo svg ellipse,.admin-fondo svg rect,.admin-fondo svg line{ fill:none; stroke:currentColor; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; }';
        document.head.appendChild(st);

        var f = document.createElement('div');
        f.className = 'admin-fondo';
        f.id = 'adminFondo';
        f.setAttribute('aria-hidden', 'true');
        f.innerHTML = '<svg viewBox="0 0 100 90"></svg>';
        escena.insertBefore(f, escena.firstChild);
      }
    }

    /* Cabecera estática de referencia: sus estilos */
    if (DOM.cabecera) {
      var st2 = document.createElement('style');
      st2.textContent =
        '.tema-cabecera{ display:flex; align-items:center; gap:16px; border:1px solid var(--line); border-radius:3px; background:rgba(255,252,244,.65); padding:14px 16px; margin:0 0 20px; }' +
        '.tema-cabecera .tc-emblema{ width:52px; height:47px; flex:0 0 52px; color:var(--crimson); }' +
        '.tema-cabecera .tc-emblema svg{ width:100%; height:100%; display:block; }' +
        '.tema-cabecera .tc-emblema svg path,.tema-cabecera .tc-emblema svg circle,.tema-cabecera .tc-emblema svg ellipse,.tema-cabecera .tc-emblema svg rect,.tema-cabecera .tc-emblema svg line{ fill:none; stroke:currentColor; stroke-width:2.8; stroke-linecap:round; stroke-linejoin:round; }' +
        '.tema-cabecera .tc-txt{ display:flex; flex-direction:column; gap:1px; min-width:0; text-align:left; }' +
        '.tema-cabecera .tc-nombre{ font-style:italic; font-weight:600; font-size:21px; }' +
        '.tema-cabecera .tc-frase{ font-size:14px; font-style:italic; color:var(--ink-soft); }' +
        '.tema-cabecera .tc-cambiar{ margin-left:auto; flex:0 0 auto; }' +
        '@media (max-width:560px){ .tema-cabecera{ gap:12px; padding:12px; } .tema-cabecera .tc-emblema{ width:40px; height:36px; flex-basis:40px; } .tema-cabecera .tc-nombre{ font-size:18px; } }';
      document.head.appendChild(st2);
    }

    /* Cambiar de tipo → volver a la portada (el índice) */
    if (DOM.cambiar) DOM.cambiar.addEventListener('click', function () {
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
      location.href = base();
    });

    [DOM.para, DOM.de, DOM.despedida, DOM.texto, DOM.pista, DOM.clave].forEach(function (el) {
      if (el) el.addEventListener('input', function () { if (!editando) programarGuardado(); });
    });

    var bRec = U.$('draftRecuperar'), bDes = U.$('draftDescartar');
    if (bRec) bRec.addEventListener('click', function () {
      var d = leerBorrador();
      if (hayBorrador(d)) recuperarBorrador(d); else ocultarCajaBorrador();
    });
    if (bDes) bDes.addEventListener('click', function () {
      borrarBorrador();
      ocultarCajaBorrador();
    });

    DOM.form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg('');

      if (!phpOK) { msg('Este servidor no puede guardar cartas: se necesita un hosting con PHP.', 'error'); return; }

      var pass = U.normalizarClave(DOM.pass.value);
      var palabra = U.normalizarClave(DOM.clave.value);
      if (!pass && !hashEditor) { msg('Escribe la contraseña de editor.', 'error'); return; }
      if (!palabra && !editando) { msg('Escribe la palabra secreta que la otra persona deberá digitar.', 'error'); return; }
      if (!DOM.texto.value.trim()) { msg('Escribe tu carta.', 'error'); return; }

      var payload = {
        para: DOM.para.value.trim().slice(0, 24),
        de: DOM.de.value.trim().slice(0, 24),
        despedida: DOM.despedida.value.trim().slice(0, 60),
        pista: DOM.pista.value.trim().slice(0, 80),
        clave: palabra ? U.sha256Hex(palabra) : '',
        admin: pass ? U.sha256Hex(pass) : hashEditor,
        texto: DOM.texto.value,
        tema: temaFijo
      };
      if (editando) payload.id = cartaId;

      var btn = DOM.guardar;
      if (btn.disabled) return;
      btn.disabled = true;

      msg('Guardando…');
      App.Ajax.post('api/guardar.php', payload)
        .then(function (r) {
          if (!r || !r.ok) throw new Error((r && r.error) || 'respuesta inesperada');
          App.AudioFX.sello();

          if (!editando) {
            editando = true;
            cartaId = r.id;
            DOM.titulo.textContent = 'Editar carta';
            DOM.guardar.textContent = 'Guardar cambios';
            msg('¡Tu carta está lista! Envíale uno de los enlaces de abajo.', 'exito');
            borrarBorrador();
            ocultarCajaBorrador();
          } else {
            msg('Guardado. Los cambios ya están publicados.', 'exito');
          }
          datos = { para: payload.para, de: payload.de, pista: payload.pista };
          DOM.pass.value = '';
          DOM.clave.value = '';
          DOM.notaClave.textContent = 'Déjala vacía para mantener la actual.';
          DOM.idBadge.textContent = 'Código de esta carta: ' + cartaId;
          DOM.idBadge.classList.remove('hide');
          mostrarEnlaces(cartaId, r.clave, palabra);
        })
        .catch(function (e) { msg('No se pudo guardar: ' + e.message, 'error'); })
        .then(function () { btn.disabled = false; });
    });

    return true;
  }

  /* ---------- Llave del editor ---------- */
  function sesionLeer(id) { try { return sessionStorage.getItem(LOK + id) || null; } catch (e) { return null; } }
  function sesionGuardar(id, hash) { try { sessionStorage.setItem(LOK + id, hash); } catch (e) {} }
  function sesionBorrar(id) { try { sessionStorage.removeItem(LOK + id); } catch (e) {} }

  function verificarClave(idCarta, opts, hash, silencioso) {
    var input = U.$('lockInput'), error = U.$('lockError'), form = U.$('lockForm');
    if (!silencioso && error) error.textContent = 'Verificando…';

    App.Ajax.json('api/carta.php?id=' + encodeURIComponent(idCarta) +
                  '&editar=1&admin=' + hash + '&t=' + Date.now())
      .then(function (r) {
        if (!r || !r.ok || !r.datos) throw new Error((r && r.error) || 'respuesta inesperada');
        sesionGuardar(idCarta, hash);
        hashEditor = hash;
        if (form) form.onsubmit = null;
        App.Admin.init({
          php: opts.php !== false,
          datos: r.datos,
          id: idCarta,
          edicion: true,
          temaInicial: (r.datos && r.datos.tema) || 'disculpa'
        });
        App.SceneManager.mostrar('admin');
      })
      .catch(function (e) {
        sesionBorrar(idCarta);
        if (silencioso) {
          App.Admin.abrirContrasena(opts);
          return;
        }
        form.classList.remove('erronea');
        void form.offsetWidth;
        form.classList.add('erronea');
        error.textContent = e.message + ' Inténtalo de nuevo.';
        input.value = '';
        input.focus();
      });
  }

  /* ---------- API pública ---------- */
  App.Admin = {
    init: function (opts) {
      opts = opts || {};
      phpOK = !!opts.php;
      datos = opts.datos || null;
      cartaId = opts.id || null;
      editando = !!(opts.edicion && cartaId && datos && datos.bloques);
      if (!editando) hashEditor = null;

      if (!montado) { montado = montar() === true; }
      if (!montado) {
        console.error('[Disculpa] Falta la escena #scene-admin o #adminForm en index.html.');
        var av = U.$('homeAviso');
        if (av) {
          av.textContent = 'No se pudo abrir el editor: falta la escena del editor en index.html. Vuelve a subir el index.html completo.';
          av.classList.remove('hide');
        }
        return;
      }

      DOM.para.value = (datos && datos.para) || '';
      DOM.de.value = (datos && datos.de) || '';
      DOM.despedida.value = (datos && datos.despedida) || '';
      DOM.pista.value = (datos && datos.pista) || '';
      DOM.texto.value = editando ? bloquesATexto(datos.bloques) : '';
      DOM.clave.value = '';
      DOM.pass.value = '';
      DOM.links.classList.add('hide');
      DOM.links.innerHTML = '';
      DOM.msg.textContent = '';
      DOM.msg.className = 'admin-msg';
      if (DOM.status) DOM.status.textContent = '';
      DOM.pass.placeholder = (editando && hashEditor)
        ? 'déjala vacía: ya abriste la llave'
        : 'para editar esta carta después';

      /* Tema fijado: el de la portada (nueva) o el de la carta (edición) */
      var temaIni = 'disculpa';
      if (App.Temas) {
        temaIni = App.Temas.validar(opts.temaInicial || (datos && datos.tema) || 'disculpa');
      }
      aplicarTemaUI(temaIni);
      if (DOM.texto) DOM.texto.placeholder = EJEMPLOS[temaFijo] || EJEMPLOS.disculpa;

      if (!editando) {
        var borrador = leerBorrador();
        if (hayBorrador(borrador)) mostrarCajaBorrador(borrador);
        else ocultarCajaBorrador();
      } else ocultarCajaBorrador();

      if (editando) {
        DOM.titulo.textContent = 'Editar carta';
        DOM.guardar.textContent = 'Guardar cambios';
        DOM.notaClave.textContent = 'Déjala vacía para mantener la actual.';
        DOM.idBadge.textContent = 'Código de esta carta: ' + cartaId;
        DOM.idBadge.classList.remove('hide');
        DOM.sub.textContent = 'Ajusta lo que necesites: los cambios se publican al instante para quien abra el enlace.';
      } else {
        DOM.titulo.textContent = 'Escribe tu carta';
        DOM.guardar.textContent = 'Crear carta';
        DOM.notaClave.textContent = '';
        DOM.idBadge.classList.add('hide');
        DOM.sub.textContent = 'Escríbela con calma: se guarda sola mientras escribes, y al crearla recibirás los enlaces para enviarla.';
      }
    },

    abrirContrasena: function (opts) {
      opts = opts || {};
      var idCarta = opts.id;
      if (!idCarta) {
        App.Admin.init(opts);
        App.SceneManager.mostrar('admin');
        return;
      }

      var form = U.$('lockForm'), input = U.$('lockInput'), error = U.$('lockError');
      if (!form || !input || !error) {
        App.Admin.init(opts);
        App.SceneManager.mostrar('admin');
        return;
      }

      input.value = '';
      error.textContent = '';
      form.classList.remove('erronea');

      var hashSesion = sesionLeer(idCarta);
      if (hashSesion) { verificarClave(idCarta, opts, hashSesion, true); return; }

      form.onsubmit = function (e) {
        e.preventDefault();
        var pass = U.normalizarClave(input.value);
        if (!pass) { error.textContent = 'Escribe la contraseña de editor.'; return; }
        verificarClave(idCarta, opts, U.sha256Hex(pass), false);
      };
      App.SceneManager.mostrar('lock');
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 700);
    }
  };
})(window.App = window.App || {});