# basal-ai-web

Web pública de **Basal-AI Solutions, S.L.** — https://www.basal-ai.com

Sitio estático servido por GitHub Pages. Sin dependencias externas, sin cookies, sin analítica.

- `index.html` — propósito y contacto
- `aviso-legal.html` — LSSI-CE art. 10
- `privacidad.html` — RGPD art. 13
- `estilo.css` — estilos compartidos
- `CNAME` — dominio propio

Diseño y decisiones: repo privado `Trapaso-infra-Basal`,
`arquitectura/30-plan/WEB_MINIMA_BASAL_20260913.md` y `ADR-027`.

## Pendiente

Formulario de contacto vía Cloudflare Worker (requiere credenciales de Cloudflare
y un bot de Telegram propio). Mientras tanto, la página ofrece teléfono y correo.

## Bloque de subvención

`index.html` incluye un `<div id="subvencion" hidden>` reservado para la publicidad
exigida por la base 21 de la convocatoria BOAM 10.186. **No borrar.**
