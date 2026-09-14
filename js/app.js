/* ============================================================
   app.js · v10 — portada índice + clic de tipo blindado
   ============================================================ */
(function (App) {
  'use strict';

  var VERSION = 'plataforma multi-cartas · v10';

  var U = App.U;
  var ESCENAS = ['home', 'gate', 'lock', 'cover', 'envelope', 'letter', 'question', 'forgiven', 'notyet', 'admin'];

  var config = null, contenido = null, privado = {};
  var ctx = { modo: 'inicio', id: null, k: null, phpOK: false, error: '' };
  var selloPuesto = false;
  var cerrojoMontado = false;
  var temaActual = 'disculpa';
  var temasOk = false;
  var indiceMontado = false;

  var CONFIG_FALLBACK = {
    maquina: { baseMs: 24, varMs: 34, pausaComa: 170, pausaPunto: 340 },
    petalos: { emisionPorSegundo: 26, probCorazon: .22, duracionRafaga: 4.5 },
    polvo: { areaPorParticula: 26000, maximo: 58 }
  };
  var CONTENIDO_FALLBACK = {
    portada: {
      eyebrow: 'Una carta para pedir perdón',
      titulo: 'Lo siento<em>,</em>',
      subtitulo: 'Hay cosas que no caben en un mensaje de texto.<br>Esta merecía ser una <em>carta</em>.',
      hint: 'Toma un minuto. Vale la pena leerlo despacio.'
    },
    sobre: { eyebrow: 'Carta entregada a mano', hint: 'Toca el <em>sello de cera</em> para abrirla' },
    carta: {
      despedida: 'Con todo mi corazón,',
      bloques: [
        { tipo: 'parrafo', texto: 'Llevo días queriendo decirte esto. Lo ensayé mil veces en mi cabeza y, ahora que por fin me decido, ninguna palabra me parece suficiente. Aun así, aquí voy:' },
        { tipo: 'enfasis', texto: 'Lo siento.' },
        { tipo: 'parrafo', texto: 'Y no lo digo por decir, ni para salir del paso. Lo digo porque me duele lo que te hice, y porque callarlo sería fallarte una segunda vez.' },
        { tipo: 'firma' }
      ]
    },
    pregunta: {
      titulo: '¿Me perdonas?',
      subtitulo: 'Puedes responder con la verdad.<br>Las dos respuestas están bien.',
      botonSi: 'Sí, te perdono', botonNo: 'Todavía me duele'
    },
    finales: {
      perdon: { titulo: 'Gracias.', texto: 'No doy este momento por sentado.<br>Lo que pasó me enseñó; <b>lo que viene, lo pienso cuidar contigo.</b>' },
      duele: { titulo: 'Gracias por tu honestidad.', texto: 'Nadie puede exigirte sanar con prisa; yo, menos que nadie.<br><b>Tómate tu tiempo.</b> Esta carta seguirá guardada, y yo también aquí seguiré.' }
    }
  };

  function html(id, v) { if (v != null) { var el = U.$(id); if (el) el.innerHTML = v; } }
  function text(id, v) { if (v != null) { var el = U.$(id); if (el) el.textContent = v; } }

  function aplicarTextos(c) {
    if (c.portada) { html('coverEyebrow', c.portada.eyebrow); html('coverTitle', c.portada.titulo); html('coverSub', c.portada.subtitulo); html('coverHint', c.portada.hint); }
    if (c.sobre) { html('envEyebrow', c.sobre.eyebrow); html('envHint', c.sobre.hint); }
    if (c.pregunta) { html('qTitle', c.pregunta.titulo); html('qSub', c.pregunta.subtitulo); text('forgiveBtn', c.pregunta.botonSi); text('notYetBtn', c.pregunta.botonNo); }
    if (c.finales) {
      if (c.finales.perdon) { html('forgivenTitle', c.finales.perdon.titulo); html('forgivenText', c.finales.perdon.texto); }
      if (c.finales.duele) { html('notyetTitle', c.finales.duele.titulo); html('notyetText', c.finales.duele.texto); }
    }
  }

  function fechaCarta(priv) {
    if (priv && priv.creada) {
      try {
        var d = new Date(priv.creada);
        if (!isNaN(d.getTime()))
          return 'Escrita el ' + new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      } catch (e) {}
    }
    return U.fechaLarga();
  }

  function momentoSellado() {
    var frase = 'Este momento se selló';
    try { if (temasOk) frase = App.Temas.def(temaActual).sello || frase; } catch (e) {}
    try {
      var d = new Date();
      var dia = new Intl.DateTimeFormat('es', { weekday: 'long' }).format(d);
      var hora = new Intl.DateTimeFormat('es', { hour: 'numeric', minute: '2-digit' }).format(d);
      return frase + ' un ' + dia + ' a las ' + hora + '.';
    } catch (e) { return frase + '.'; }
  }

  function tituloFinal() {
    var base = 'Gracias.';
    try { base = contenido.finales.perdon.titulo || base; } catch (e) {}
    var para = String(privado.para || '').trim();
    if (!para || temaActual === 'madre') return base;
    return base.replace(/\.$/, '') + ', ' + para + '.';
  }

  function duracionRafaga() {
    return (config && config.petalos && config.petalos.duracionRafaga) || 4.5;
  }

  function gateListo() {
    return !!(U.$('gateForm') && U.$('gateInput') && U.$('gateError') && U.$('gatePista'));
  }
  function claveSesion() { return 'disculpa-desbloqueada' + (ctx.id ? '-' + ctx.id : ''); }
  function cerrojoDesbloqueada() {
    try { return sessionStorage.getItem(claveSesion()) === 'si'; } catch (e) { return false; }
  }
  function desbloquear() {
    try { sessionStorage.setItem(claveSesion(), 'si'); } catch (e) {}
    try {
      history.replaceState(null, '', ctx.id ? ('?carta=' + encodeURIComponent(ctx.id)) : location.pathname);
    } catch (e) {}
    App.SceneManager.mostrar('cover');
  }

  function montarCerrojo() {
    if (cerrojoMontado) return;
    cerrojoMontado = true;
    if (privado.pista) U.$('gatePista').textContent = privado.pista;
    U.$('gateForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var hash = U.sha256Hex(U.normalizarClave(U.$('gateInput').value));
      if (hash === String(privado.clave || '').trim().toLowerCase()) {
        desbloquear();
      } else {
        this.classList.remove('erronea');
        void this.offsetWidth;
        this.classList.add('erronea');
        U.$('gateError').textContent = 'Esa no es la palabra… inténtalo de nuevo.';
        U.$('gateInput').value = '';
        U.$('gateInput').focus();
      }
    });
  }

  /* ---------- Índice de la portada ---------- */
  function pintarFondoHome(temaId) {
    var svg = document.querySelector('#scene-home .home-fondo svg');
    if (svg && temasOk) svg.innerHTML = App.Temas.emblemaInner(temaId);
  }

  function previsualizarTema(temaId) {
    if (!temasOk) return;
    App.Temas.aplicar(temaId);
    pintarFondoHome(temaId);
    if (App.Musica && typeof App.Musica.cambiar === 'function') {
      App.Musica.cambiar(App.Temas.musica(temaId));
    }
  }

  function restablecerPortada() {
    if (!temasOk) return;
    App.Temas.aplicar('disculpa');
    pintarFondoHome('disculpa');
    if (App.Musica && typeof App.Musica.cambiar === 'function') {
      App.Musica.cambiar(App.Temas.musicaInicio());
    }
  }

  function abrirEditorConTema(temaId) {
    if (App.Musica) App.Musica.arrancar();

    var av = U.$('homeAviso');
    var aviso = function (t) { if (av) { av.textContent = t; av.classList.remove('hide'); } };

    if (!App.SceneManager || !App.Admin) {
      console.error('[Disculpa] Falta js/ui/scenes.js o js/features/admin.js en el servidor.');
      aviso('No se pudo abrir el editor: falta un archivo en el servidor (js/features/admin.js). Vuelve a subirlo.');
      return;
    }
    if (!document.getElementById('scene-admin')) {
      console.error('[Disculpa] Falta la escena #scene-admin en index.html.');
      aviso('No se pudo abrir el editor: falta la escena del editor en index.html. Vuelve a subir el index.html completo.');
      return;
    }

    try {
      App.Admin.init({ php: ctx.phpOK, datos: null, id: null, edicion: false, temaInicial: temaId });
      App.SceneManager.mostrar('admin');
    } catch (e) {
      console.error('[Disculpa] Error al abrir el editor:', e);
      aviso('No se pudo abrir el editor: ' + (e && e.message ? e.message : 'error inesperado') + '. Revisa la consola (F12).');
    }
  }

  function montarIndice() {
    if (indiceMontado) return;
    var idx = U.$('homeIndex');
    if (!idx) {
      /* Portada sin índice (index.html viejo): no romper nada */
      console.warn('[Disculpa] La portada no tiene el índice de tipos (#homeIndex). ¿Subiste el index.html nuevo?');
      return;
    }
    indiceMontado = true;

    var items = idx.querySelectorAll('.home-item');
    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var temaId = item.getAttribute('data-tema') || 'disculpa';
        item.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'touch') return;
          previsualizarTema(temaId);
        });
        item.addEventListener('pointerleave', function (e) {
          if (e.pointerType === 'touch') return;
          restablecerPortada();
        });
        item.addEventListener('focus', function () { previsualizarTema(temaId); });
        item.addEventListener('blur', restablecerPortada);
        item.addEventListener('click', function () { abrirEditorConTema(temaId); });
      })(items[i]);
    }
  }

  /* ---------- Eventos ---------- */
  function irAlSobre() {
    if (selloPuesto) return;
    selloPuesto = true;
    App.AudioFX.sello();
    App.SceneManager.mostrar('envelope');
  }

  function conectarEventos() {
    U.$('soundBtn').addEventListener('click', function () {
      App.AudioFX.alternar();
      this.classList.toggle('muted', !App.AudioFX.activado);
    });

    /* Compatibilidad: si existiera un crearBtn (index viejo), que funcione igual */
    var crear = U.$('crearBtn');
    if (crear) crear.addEventListener('click', function () {
      abrirEditorConTema('disculpa');
    });

    U.$('startBtn').addEventListener('click', irAlSobre);

    App.Envelope.alAbrir(function () {
      App.SceneManager.mostrar('letter');
      setTimeout(function () { App.Letter.reproducir(); }, 900);
    });

    U.$('forgiveBtn').addEventListener('click', function () {
      U.$('forgivenTitle').textContent = tituloFinal();
      var s = U.$('selladoTxt');
      if (s) s.textContent = momentoSellado();
      App.SceneManager.mostrar('forgiven');
      App.AudioFX.latido();
      App.FX.rafaga(duracionRafaga());
    });
    U.$('reliveBtn').addEventListener('click', function () {
      App.AudioFX.latido();
      App.FX.rafaga(duracionRafaga() * .9);
    });
    U.$('notYetBtn').addEventListener('click', function () { App.SceneManager.mostrar('notyet'); });
    U.$('rereadBtn').addEventListener('click', function () {
      App.SceneManager.mostrar('letter');
      setTimeout(function () { App.Letter.reproducir(); }, 850);
    });
    U.$('restartBtn1').addEventListener('click', function () {
      selloPuesto = false;
      App.Envelope.reset();
      App.Letter.reiniciar();
      App.SceneManager.mostrar('cover');
    });
    U.$('restartBtn2').addEventListener('click', function () {
      selloPuesto = false;
      App.Envelope.reset();
      App.Letter.reiniciar();
      App.SceneManager.mostrar('cover');
    });
  }

  function iniciarBucle() {
    var prev = performance.now();
    (function frame(now) {
      var dt = Math.min((now - prev) / 1000, .06);
      prev = now;
      App.Dust.step(now, dt);
      App.FX.step(now);
      App.Parallax.step();
      requestAnimationFrame(frame);
    })(prev);
  }

  /* ---------- Arranque ---------- */
  function arrancar(cfg, cont, priv) {
    config = cfg;
    privado = priv || {};
    temasOk = !!App.Temas;

    temaActual = temasOk ? App.Temas.validar(privado && privado.tema) : 'disculpa';
    if (temasOk) App.Temas.aplicar(temaActual);
    if (temasOk) App.Temas.aplicarEmblemas(temaActual);

    if (temasOk && App.Musica && typeof App.Musica.cambiar === 'function') {
      App.Musica.cambiar(ctx.modo === 'inicio' ? App.Temas.musicaInicio() : App.Temas.musica(temaActual));
    }

    contenido = temasOk ? App.Temas.textosPara(temaActual, cont) : cont;

    aplicarTextos(contenido);
    U.$('letterDate').textContent = fechaCarta(privado);

    var para = String(privado.para || '').trim().slice(0, 24);
    U.$('envName').textContent = para ? 'Para ' + para : 'Para ti';
    U.$('letterTo').textContent = para ? 'Para ' + para : 'Para ti';
    App.Letter.establecerNombres({ to: para, from: String(privado.de || '').trim().slice(0, 24) });
    U.$('coverForm').classList.add('hide');
    U.$('startBtn').textContent = 'Abrir la carta';

    var contenidoCarta = (privado.bloques && privado.bloques.length)
      ? { despedida: privado.despedida || 'Con todo mi corazón,', bloques: privado.bloques }
      : cont.carta;

    App.Dust.init(cfg.polvo);
    App.FX.init(temasOk ? App.Temas.fx(temaActual, cfg.petalos) : cfg.petalos);
    App.Parallax.init();
    App.SceneManager.init(ESCENAS);
    App.SceneManager.alCambiar(function (n) {
      App.Parallax.setActivo(n === 'envelope');
      if (App.Musica) App.Musica.arrancar();
    });
    App.Envelope.init();
    App.Letter.init();
    App.Letter.cargarContenido(contenidoCarta);
    App.Typewriter.configurar(cfg.maquina);
    conectarEventos();

    if (ctx.modo === 'admin') {
      if (App.Admin && ctx.id && privado && privado.clave) {
        App.Admin.abrirContrasena({ php: ctx.phpOK, datos: privado, id: ctx.id, edicion: true });
      } else if (App.Admin) {
        App.Admin.init({ php: ctx.phpOK, datos: null, id: null, edicion: false });
        App.SceneManager.mostrar('admin');
      } else {
        console.error('[Disculpa] Falta js/features/admin.js en el servidor.');
        App.SceneManager.mostrar('home');
      }

    } else if (ctx.modo === 'lectura') {
      var k = String(ctx.k || '').trim().toLowerCase();
      if (k && k === String(privado.clave || '').trim().toLowerCase()) {
        desbloquear();
      } else if (gateListo() && !cerrojoDesbloqueada()) {
        montarCerrojo();
        if (k) U.$('gateError').textContent = 'El enlace que abriste ya no coincide con esta carta. Escribe la palabra a mano.';
        App.SceneManager.mostrar('gate');
        setTimeout(function () { try { U.$('gateInput').focus(); } catch (e) {} }, 700);
      } else {
        App.SceneManager.mostrar('cover');
      }

    } else {
      montarIndice();
      if (temasOk) App.Temas.pintarIndice();
      pintarFondoHome('disculpa');
      restablecerPortada();

      var aviso = U.$('homeAviso');
      if (aviso) {
        if (ctx.error) {
          aviso.textContent = ctx.error;
          aviso.classList.remove('hide');
        } else if (!ctx.phpOK) {
          aviso.textContent = 'Este servidor aún no puede crear cartas: necesita un hosting con PHP (por ejemplo, InfinityFree).';
          aviso.classList.remove('hide');
        }
      }
      App.SceneManager.mostrar('home');
    }

    iniciarBucle();
    quitarBoot();
  }

  function quitarBoot() {
    var b = U.$('boot');
    if (!b) return;
    b.classList.add('oculto');
    setTimeout(function () { if (b.parentNode) b.remove(); }, 700);
  }

  function avisoFallback(archivo, err) {
    console.warn('[Disculpa] AJAX falló para ' + archivo + ' → ' + err.message + '. Usando respaldo local.');
  }

  function salvavidas(detalle) {
    if (!document.getElementById('boot')) return;
    try { console.error('[Disculpa] El arranque falló' + (detalle ? ' — ' + detalle : '') + '.'); } catch (e) {}
    try {
      App.SceneManager.init(ESCENAS);
      App.SceneManager.mostrar('home');
    } catch (e) {
      var h = document.getElementById('scene-home');
      if (h) h.classList.add('active');
    }
    var b = document.getElementById('boot');
    if (b) { b.style.transition = 'opacity .4s ease'; b.style.opacity = '0'; setTimeout(function () { b.remove(); }, 450); }
  }
  window.addEventListener('error', function () { if (document.getElementById('boot')) salvavidas('error de script'); });
  window.addEventListener('unhandledrejection', function () { if (document.getElementById('boot')) salvavidas('promesa sin manejar'); });
  setTimeout(function () { if (document.getElementById('boot')) salvavidas('tiempo de carga agotado'); }, 12000);

  document.addEventListener('DOMContentLoaded', function () {
    console.info('[Disculpa] Ejecutando: ' + VERSION);
    var NO_CACHE = '?t=' + Date.now();

    var qs; try { qs = new URLSearchParams(location.search); } catch (e) { qs = null; }
    var id = qs ? (qs.get('carta') || '').trim() : '';
    var k = qs ? (qs.get('k') || '').trim() : '';

    var esAdmin = !!(id && /#admin/i.test(location.hash));
    if (!id && /#admin/i.test(location.hash)) {
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    }
    ctx.id = id || null;
    ctx.k = k || null;

    var sonda = App.Ajax.json('api/carta.php' + NO_CACHE)
      .then(function () { ctx.phpOK = true; })
      .catch(function () { ctx.phpOK = false; });

    var cfgP = App.Ajax.json('data/config.json' + NO_CACHE)
      .catch(function (e) { avisoFallback('config.json', e); return CONFIG_FALLBACK; });
    var cartaP = App.Ajax.json('data/carta.json' + NO_CACHE)
      .catch(function (e) { avisoFallback('carta.json', e); return CONTENIDO_FALLBACK; });

    var cartaDatos = id
      ? App.Ajax.json('api/carta.php?id=' + encodeURIComponent(id) + '&t=' + Date.now())
          .catch(function () { ctx.error = 'No se pudo cargar esa carta (quizá no exista).'; return null; })
      : Promise.resolve(null);

    Promise.all([sonda, cfgP, cartaP, cartaDatos]).then(function (res) {
      var api = res[3];
      if (api && api.ok && api.datos) {
        privado = api.datos;
        ctx.modo = esAdmin ? 'admin' : 'lectura';
      } else if (id) {
        if (!ctx.error) ctx.error = 'Esa carta no existe (o fue retirada).';
        ctx.modo = 'inicio';
      } else {
        ctx.modo = esAdmin ? 'admin' : 'inicio';
      }
      try { arrancar(res[1], res[2], privado); }
      catch (e) { salvavidas(e && e.message); }
    }).catch(function (err) { salvavidas(err && err.message); });
  });
})(window.App = window.App || {});