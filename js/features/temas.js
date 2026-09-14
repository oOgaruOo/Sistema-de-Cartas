/* ============================================================
   temas.js · v4 — personalidades + obertura de inicio
   ============================================================ */
(function (App) {
  'use strict';

  var CORAZON = '<path d="M50 76 C28 60 10 46 10 28 C10 14 21 7 31 7 C40 7 47 13 50 20 C53 13 60 7 69 7 C79 7 90 14 90 28 C90 46 72 60 50 76"/>';

  /* ---- OBERTURA DEL INICIO · Re mayor (D–Bm–G–A) ----
     Melodía exclusiva de la portada: ningún tema la usa. */
  var MUSICA_INICIO = {
    compas: 3200, paso: .5, vol: .085, nota: 587.33, acorde: 146.83,
    progresion: [
      { bajo: 146.83, notas: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99] },
      { bajo: 123.47, notas: [246.94, 293.66, 369.99, 493.88, 369.99, 293.66] },
      { bajo:  98.00, notas: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94] },
      { bajo: 110.00, notas: [220.00, 277.18, 329.63, 440.00, 329.63, 277.18] },
      { bajo: 146.83, notas: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99] },
      { bajo:  98.00, notas: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94] },
      { bajo: 123.47, notas: [246.94, 293.66, 369.99, 493.88, 369.99, 293.66] },
      { bajo: 110.00, notas: [220.00, 277.18, 329.63, 440.00, 329.63, 277.18] }
    ]
  };

  var TEMAS = {
    disculpa: {
      etiqueta: 'Pedir perdón',
      clase: 'tema-disculpa',
      sello: 'Este perdón se selló',
      emblema: CORAZON,
      fx: { corazon: '#96271f' },
      sonido: {
        compas: 3400, paso: .5, vol: .085, nota: 392.00, acorde: 196.00,
        progresion: [
          { bajo: 110.00, notas: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63] },
          { bajo:  87.31, notas: [174.61, 220.00, 261.63, 349.23, 261.63, 220.00] },
          { bajo: 130.81, notas: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] },
          { bajo:  98.00, notas: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94] },
          { bajo:  82.41, notas: [164.81, 196.00, 246.94, 329.63, 246.94, 196.00] },
          { bajo: 110.00, notas: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63] },
          { bajo:  87.31, notas: [174.61, 220.00, 261.63, 349.23, 261.63, 220.00] },
          { bajo:  82.41, notas: [164.81, 207.65, 246.94, 329.63, 246.94, 207.65] }
        ]
      },
      portada: null, pregunta: null, finales: null
    },
    teextrano: {
      etiqueta: 'Te extraño',
      clase: 'tema-teextrano',
      sello: 'Este momento quedó guardado',
      emblema:
        '<g class="em-plane">' +
          '<path class="em-trail" d="M6 74 C 16 76, 24 68, 32 62"/>' +
          '<path d="M84 16 L16 52 L42 60 Z"/>' +
          '<path d="M84 16 L42 60 L52 82 Z"/>' +
        '</g>',
      fx: { colores: ['#c98f3d', '#d9a75a', '#a9552e', '#8a5a2a', '#d4b483', '#e8d5a0'], corazon: '#a9552e', emision: 24 },
      sonido: {
        compas: 3800, paso: .6, vol: .075, nota: 349.23, acorde: 174.61,
        progresion: [
          { bajo: 174.61, notas: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00] },
          { bajo: 146.83, notas: [293.66, 349.23, 440.00, 587.33, 440.00, 349.23] },
          { bajo: 116.54, notas: [233.08, 293.66, 349.23, 466.16, 349.23, 293.66] },
          { bajo: 130.81, notas: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] },
          { bajo: 174.61, notas: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00] },
          { bajo: 146.83, notas: [293.66, 349.23, 440.00, 587.33, 440.00, 349.23] },
          { bajo: 116.54, notas: [233.08, 293.66, 349.23, 466.16, 349.23, 293.66] },
          { bajo: 130.81, notas: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] }
        ]
      },
      portada: {
        eyebrow: 'Una carta desde la distancia',
        titulo: 'Te extraño<em>,</em>',
        subtitulo: 'Hay silencios que pesan más que las palabras.<br>Esta carta es mi forma de romperlos.',
        hint: 'Léela despacio: así la escribí.'
      },
      pregunta: { titulo: '¿Sigo en tu corazón?', subtitulo: 'Contesta con la verdad.<br>Las dos respuestas valen.', botonSi: 'Sí, siempre', botonNo: 'Ya no' },
      finales: {
        perdon: { titulo: 'Y tú en el mío.', texto: 'La distancia cambió el mapa,<br>pero nunca el sentimiento. <b>Este corazón sigue teniendo tu nombre.</b>' },
        duele: { titulo: 'Gracias por tu honestidad.', texto: 'Duele leerlo, pero lo respeto.<br><b>Lo nuestro fue real</b>, y eso no lo borra ninguna distancia.' }
      }
    },
    cumple: {
      etiqueta: 'Feliz cumpleaños',
      clase: 'tema-cumple',
      sello: 'Este deseo se pidió',
      emblema:
        '<g class="em-cake">' +
          '<path class="em-flame" d="M50 7 C 46.8 12, 46.4 18, 50 22.5 C 53.6 18, 53.2 12, 50 7 Z"/>' +
          '<line x1="50" y1="22.5" x2="50" y2="29"/>' +
          '<rect x="46.8" y="29" width="6.4" height="12" rx="2"/>' +
          '<path d="M27 49 q 5.75 -7, 11.5 0 t 11.5 0 t 11.5 0 t 11.5 0"/>' +
          '<path d="M27 49 h46 v13 a6 6 0 0 1 -6 6 h-34 a6 6 0 0 1 -6 -6 Z"/>' +
        '</g>',
      fx: { colores: ['#e05c4b', '#e8b23a', '#3f9d8a', '#5b8bd4', '#d473b0', '#8bc34a'], corazon: '#c2483f', emision: 34 },
      sonido: {
        compas: 2600, paso: .38, vol: .09, nota: 523.25, acorde: 261.63,
        progresion: [
          { bajo: 130.81, notas: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25] },
          { bajo:  98.00, notas: [392.00, 493.88, 587.33, 783.99, 587.33, 493.88] },
          { bajo: 110.00, notas: [440.00, 523.25, 659.25, 880.00, 659.25, 523.25] },
          { bajo: 174.61, notas: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00] },
          { bajo: 130.81, notas: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25] },
          { bajo:  98.00, notas: [392.00, 493.88, 587.33, 783.99, 587.33, 493.88] },
          { bajo: 174.61, notas: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00] },
          { bajo: 130.81, notas: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25] }
        ]
      },
      portada: {
        eyebrow: 'Una carta para tu día',
        titulo: 'Feliz cumpleaños<em>,</em>',
        subtitulo: 'Un año más de ti: el mejor regalo que da el calendario.<br>Esta carta es el mío.',
        hint: 'Pide un deseo antes de abrirla.'
      },
      pregunta: { titulo: '¿Pides un deseo?', subtitulo: 'Cierra los ojos un segundo.<br>El mío ya lo pedí: tú.', botonSi: 'Deseo pedido', botonNo: 'Hoy no quiero' },
      finales: {
        perdon: { titulo: 'Que se cumpla.', texto: 'Hoy el mundo celebra que existes.<br><b>Y yo lo celebro más que nadie.</b>' },
        duele: { titulo: 'Está bien no estar bien.', texto: 'Los cumpleaños también pueden pesar.<br><b>Aquí sigo</b>, con o sin confeti.' }
      }
    },
    madre: {
      etiqueta: 'Para mamá',
      clase: 'tema-madre',
      sello: 'Este abrazo se quedó',
      emblema:
        '<g class="em-flower">' +
          '<g class="em-petals">' +
            '<ellipse cx="50" cy="15" rx="8" ry="11.5"/>' +
            '<ellipse cx="50" cy="15" rx="8" ry="11.5" transform="rotate(60 50 30)"/>' +
            '<ellipse cx="50" cy="15" rx="8" ry="11.5" transform="rotate(120 50 30)"/>' +
            '<ellipse cx="50" cy="15" rx="8" ry="11.5" transform="rotate(180 50 30)"/>' +
            '<ellipse cx="50" cy="15" rx="8" ry="11.5" transform="rotate(240 50 30)"/>' +
            '<ellipse cx="50" cy="15" rx="8" ry="11.5" transform="rotate(300 50 30)"/>' +
          '</g>' +
          '<circle cx="50" cy="30" r="7"/>' +
          '<path d="M50 45 C 49 62, 52 74, 50 87"/>' +
          '<path d="M50 68 C 42 66, 37 59, 35 53 C 44 55, 49 61, 50 68 Z"/>' +
        '</g>',
      fx: { colores: ['#e0a8bd', '#c9779a', '#b04a6e', '#e8cdd6', '#d495ae', '#f2dde4'], corazon: '#b04a6e', emision: 28 },
      sonido: {
        compas: 3000, paso: .45, vol: .08, nota: 493.88, acorde: 196.00,
        progresion: [
          { bajo:  98.00, notas: [392.00, 493.88, 587.33, 783.99, 587.33, 493.88] },
          { bajo:  82.41, notas: [329.63, 392.00, 493.88, 659.25, 493.88, 392.00] },
          { bajo: 130.81, notas: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] },
          { bajo: 146.83, notas: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99] },
          { bajo:  98.00, notas: [392.00, 493.88, 587.33, 783.99, 587.33, 493.88] },
          { bajo:  82.41, notas: [329.63, 392.00, 493.88, 659.25, 493.88, 392.00] },
          { bajo: 130.81, notas: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] },
          { bajo: 146.83, notas: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99] }
        ]
      },
      portada: {
        eyebrow: 'Una carta para mamá',
        titulo: 'Para ti, mamá<em>,</em>',
        subtitulo: 'Hay deudas que no se pagan con regalos.<br>Esta carta es mi intento más honesto.',
        hint: 'Léela con calma: así la escribí.'
      },
      pregunta: { titulo: '¿Me das un abrazo?', subtitulo: 'Aunque el tiempo pase,<br>siempre seré tu niño.', botonSi: 'Sí, mi amor', botonNo: 'Hoy no puedo' },
      finales: {
        perdon: { titulo: 'Gracias, mamá.', texto: 'Todo lo que soy empieza en ti.<br><b>Te amo hoy y siempre.</b>' },
        duele: { titulo: 'Gracias por tu honestidad.', texto: 'También entre madres e hijos hay heridas.<br><b>Tómate tu tiempo.</b> Yo no me voy a ninguna parte.' }
      }
    },
    aniversario: {
      etiqueta: 'Aniversario',
      clase: 'tema-aniversario',
      sello: 'Esta promesa se selló',
      emblema:
        '<g class="em-rings">' +
          '<circle cx="39" cy="48" r="23"/>' +
          '<circle cx="61" cy="48" r="23"/>' +
          '<circle class="em-ring-shine" cx="61" cy="48" r="23" pathLength="100"/>' +
          '<path class="em-spark" d="M61 14 l2 5 L68 21 l-5 2 L61 28 l-2 -5 L54 21 l5 -2 Z"/>' +
        '</g>',
      fx: { colores: ['#9c4a6c', '#7a2a52', '#c9779a', '#e0c3cf', '#b56a8a', '#5e2a44'], corazon: '#7a2a52', emision: 26 },
      sonido: {
        compas: 3200, paso: .48, vol: .085, nota: 440.00, acorde: 220.00,
        progresion: [
          { bajo: 110.00, notas: [440.00, 554.37, 659.25, 880.00, 659.25, 554.37] },
          { bajo:  82.41, notas: [329.63, 415.30, 493.88, 659.25, 493.88, 415.30] },
          { bajo:  92.50, notas: [369.99, 440.00, 554.37, 739.99, 554.37, 440.00] },
          { bajo: 146.83, notas: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99] },
          { bajo: 110.00, notas: [440.00, 554.37, 659.25, 880.00, 659.25, 554.37] },
          { bajo:  82.41, notas: [329.63, 415.30, 493.88, 659.25, 493.88, 415.30] },
          { bajo:  92.50, notas: [369.99, 440.00, 554.37, 739.99, 554.37, 440.00] },
          { bajo:  82.41, notas: [329.63, 415.30, 493.88, 659.25, 493.88, 415.30] }
        ]
      },
      portada: {
        eyebrow: 'Una carta por nuestro aniversario',
        titulo: 'Otro año contigo<em>,</em>',
        subtitulo: 'No es solo una fecha: es mi lugar favorito del calendario.<br>Esta carta lo celebra.',
        hint: 'Ábrela cuando estemos tranquilos.'
      },
      pregunta: { titulo: '¿Seguimos?', subtitulo: 'Un año más, y todavía te elijo.<br>¿Y tú?', botonSi: 'Sí, te elijo', botonNo: 'Hablemos' },
      finales: {
        perdon: { titulo: 'Que sigan los años.', texto: 'Cada aniversario es una promesa cumplida.<br><b>La próxima también la cumplo contigo.</b>' },
        duele: { titulo: 'Gracias por tu honestidad.', texto: 'Entonces hablemos.<br><b>Lo nuestro merece esa conversación.</b>' }
      }
    }
  };

  function def(id) { return TEMAS[TEMAS[id] ? id : 'disculpa']; }

  var SELECTORES_EMBLEMA = ['.cover-heart-bg', '.gate-heart', '.q-heart', '.big-heart', '.ny-heart', '.mini-heart', '.seal-heart'];

  App.Temas = {
    validar: function (id) { return TEMAS[id] ? id : 'disculpa'; },
    def: def,

    lista: function () {
      var out = [];
      Object.keys(TEMAS).forEach(function (k) { out.push({ id: k, etiqueta: TEMAS[k].etiqueta }); });
      return out;
    },

    aplicar: function (id) {
      var d = def(id);
      Object.keys(TEMAS).forEach(function (k) { document.body.classList.remove(TEMAS[k].clase); });
      document.body.classList.add(d.clase);
      return d;
    },

    emblemaInner: function (id) { return def(id).emblema; },

    aplicarEmblemas: function (id) {
      var inner = def(id).emblema;
      SELECTORES_EMBLEMA.forEach(function (s) {
        var els = document.querySelectorAll(s);
        for (var i = 0; i < els.length; i++) {
          els[i].innerHTML = inner;
          els[i].classList.add('embl');
        }
      });
    },

    /* Llena los íconos del índice de la portada */
    pintarIndice: function () {
      var items = document.querySelectorAll('.home-item[data-tema]');
      for (var i = 0; i < items.length; i++) {
        var svg = items[i].querySelector('.ti-embl svg');
        if (svg) svg.innerHTML = def(items[i].getAttribute('data-tema')).emblema;
      }
    },

    preview: function (id, contEl) {
      if (!contEl) return;
      var svg = contEl.querySelector('svg');
      if (svg) svg.innerHTML = def(id).emblema;
    },

    musica: function (id) { return def(id).sonido; },
    musicaInicio: function () { return MUSICA_INICIO; },

    textosPara: function (id, cont) {
      var d = def(id);
      if (!d.portada && !d.pregunta && !d.finales) return cont;
      return {
        portada: d.portada || cont.portada,
        sobre: cont.sobre,
        carta: cont.carta,
        pregunta: d.pregunta || cont.pregunta,
        finales: d.finales || cont.finales
      };
    },

    fx: function (id, p) {
      var d = def(id);
      var f = {};
      f.emisionPorSegundo = (d.fx && d.fx.emision) || (p && p.emisionPorSegundo) || 26;
      f.probCorazon = (p && p.probCorazon != null) ? p.probCorazon : .22;
      if (d.fx && d.fx.colores) f.colores = d.fx.colores;
      if (d.fx && d.fx.corazon) f.colorCorazon = d.fx.corazon;
      return f;
    }
  };
})(window.App = window.App || {});