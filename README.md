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

## Pendiente: activar el formulario

El formulario **ya está escrito** (HTML, CSS y JS en `index.html`, backend en
`worker/contacto-worker.js`) pero está **desactivado**, porque desplegarlo necesita
credenciales que no estaban disponibles al publicar: una cuenta de Cloudflare y un
bot de Telegram **propio de la empresa** (no el de operaciones).

Para activarlo, tres pasos:

1. Desplegar `worker/contacto-worker.js` en Cloudflare (instrucciones en su cabecera).
   Las dos credenciales van al Vaultwarden de la nube, organización Basal.
2. En `index.html`, poner la URL del Worker en `const ENDPOINT = ""`.
3. Quitar `hidden` del `<form id="formulario">` y añadírselo a `#aviso-sin-formulario`.

Mientras tanto la página ofrece teléfono y correo, que funcionan.

## Bloque de subvención

`index.html` incluye un `<div id="subvencion" hidden>` reservado para la publicidad
exigida por la base 21 de la convocatoria BOAM 10.186. **No borrar.**
