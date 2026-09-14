# Carta de disculpas — sistema web interactivo

Experiencia narrativa en varias escenas: portada → sobre con sello de cera →
carta escrita a máquina → pregunta final → desenlaces.

## Estructura
- `index.html` — estructura de escenas.
- `css/` — estilos divididos por escena.
- `js/core/` — AJAX, utilidades y audio.
- `js/ui/` — canvas de fondo, efectos y gestor de escenas.
- `js/features/` — parallax, máquina de escribir, sobre y carta.
- `js/app.js` — arranque y cableado.
- `data/` — contenido y configuración (cargados por AJAX).

## Ejecutar
El AJAX requiere servir por HTTP (no abrir con doble clic):

    python -m http.server 8000
    # luego abre http://localhost:8000

(o usa la extensión "Live Server" de VS Code, o `npx serve .`)

## Personalizar la carta
Edita `data/carta.json`: textos de portada, párrafos, énfasis,
despedida y desenlaces. Ajusta velocidades en `data/config.json`.
Si la carga AJAX falla, la app usa un respaldo local e informa en consola.