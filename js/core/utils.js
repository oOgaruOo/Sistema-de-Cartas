/* ============================================================
   utils.js · utilidades compartidas
   ============================================================ */
(function (App) {
  'use strict';

  var MAPA_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  /* ---------- SHA-256 compacto (síncrono, sin dependencias) ---------- */
  var K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];

  function utf8(s) {
    var b = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) b.push(c);
      else if (c < 0x800) b.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else b.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return b;
  }

  function sha256Hex(s) {
    var h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var msg = utf8(String(s));
    var bitLen = msg.length * 8;
    var w = new Array(64);
    var i, t, off, a, b, c, d, e, f, g, hh, S0, S1, ch, maj, t1, t2, s0, s1;

    function rotr(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }

    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);
    msg.push(0, 0, 0, 0,
      (bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);

    for (off = 0; off < msg.length; off += 64) {
      for (t = 0; t < 16; t++) {
        i = off + t * 4;
        w[t] = ((msg[i] << 24) | (msg[i + 1] << 16) | (msg[i + 2] << 8) | msg[i + 3]) >>> 0;
      }
      for (t = 16; t < 64; t++) {
        s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      a = h[0]; b = h[1]; c = h[2]; d = h[3];
      e = h[4]; f = h[5]; g = h[6]; hh = h[7];
      for (i = 0; i < 64; i++) {
        S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        ch = (e & f) ^ (~e & g);
        t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
        S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        maj = (a & b) ^ (a & c) ^ (b & c);
        t2 = (S0 + maj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0;
      h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0;
      h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
    }

    var out = '', m, shift, nib;
    for (m = 0; m < 8; m++) {
      for (shift = 28; shift >= 0; shift -= 4) {
        nib = (h[m] >>> shift) & 15;
        out += nib < 10 ? String.fromCharCode(48 + nib) : String.fromCharCode(87 + nib);
      }
    }
    return out;
  }

  App.U = {
    $: function (id) { return document.getElementById(id); },

    escapeHtml: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) { return MAPA_ESCAPE[c]; });
    },

    clamp: function (v, min, max) { return Math.max(min, Math.min(max, v)); },

    fechaLarga: function () {
      try {
        return new Intl.DateTimeFormat('es', {
          day: 'numeric', month: 'long', year: 'numeric'
        }).format(new Date());
      } catch (e) { return ''; }
    },

    /* Lleva la palabra secreta a una forma canónica:
       mayúsculas, acentos y espacios extra no importan */
    normalizarClave: function (s) {
      return String(s || '')
        .trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
    },

    sha256Hex: sha256Hex
  };
})(window.App = window.App || {});