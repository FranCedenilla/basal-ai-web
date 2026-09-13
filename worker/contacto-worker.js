/**
 * Cloudflare Worker — backend del formulario de contacto de www.basal-ai.com
 *
 * Por qué existe: GitHub Pages es estático y no puede procesar un formulario.
 * Este Worker lo recibe, lo valida y lo reenvía. Así la web no necesita ningún
 * servidor propio y no se abre ni un puerto en el VPS (ver ADR-027 / #1891 / #1924).
 *
 * DESPLIEGUE (requiere cuenta de Cloudflare del PO):
 *   1. Dashboard → Workers & Pages → Create Worker → nombre: `contacto-basal`
 *   2. Pegar este código.
 *   3. Settings → Variables and Secrets:
 *        Secret   TELEGRAM_BOT_TOKEN = token de un bot NUEVO, propio de la empresa
 *        Variable TELEGRAM_CHAT_ID   = chat de destino
 *      ⚠️ Bot NUEVO, no el de operaciones: este endpoint es público y un bot
 *         compartido permitiría inundar el canal de alertas desde la web.
 *      ⚠️ Las dos credenciales van al Vaultwarden de la nube (org Basal).
 *   4. Desplegar y anotar la URL resultante.
 *   5. En `index.html`, poner esa URL en ENDPOINT y quitar el `hidden` del formulario.
 *
 * El correo a info@basal-ai.com no lo manda el Worker: Cloudflare no habla SMTP.
 * El aviso llega por Telegram, y se responde desde Zimbra con «enviar como» info@.
 */

const ORIGENES_PERMITIDOS = [
  'https://www.basal-ai.com',
  'https://basal-ai.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

const MAX = { nombre: 100, email: 150, mensaje: 4000 };

function cors(request) {
  const origin = request.headers.get('Origin') || '';
  const permitido = ORIGENES_PERMITIDOS.includes(origin) ? origin : ORIGENES_PERMITIDOS[0];
  return {
    'Access-Control-Allow-Origin': permitido,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const escapar = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export default {
  async fetch(request, env) {
    const cabeceras = cors(request);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cabeceras });
    if (request.method !== 'POST') return new Response('Método no permitido', { status: 405, headers: cabeceras });

    // Solo se aceptan envíos desde los orígenes propios.
    const origin = request.headers.get('Origin') || '';
    if (!ORIGENES_PERMITIDOS.includes(origin)) {
      return new Response(JSON.stringify({ ok: false }), { status: 403, headers: cabeceras });
    }

    let datos;
    try {
      datos = await request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Petición mal formada' }),
        { status: 400, headers: { ...cabeceras, 'Content-Type': 'application/json' } });
    }

    // Campo trampa: los bots rellenan todo; una persona no ve este campo.
    // Se responde 200 a propósito, para no enseñarle al bot que ha fallado.
    if (datos.web) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cabeceras });

    const nombre = (datos.nombre || '').trim().slice(0, MAX.nombre);
    const email = (datos.email || '').trim().slice(0, MAX.email);
    const mensaje = (datos.mensaje || '').trim().slice(0, MAX.mensaje);
    const consentimiento = datos.consentimiento === true;

    if (!nombre || !mensaje || !consentimiento || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Faltan datos obligatorios' }),
        { status: 400, headers: { ...cabeceras, 'Content-Type': 'application/json' } });
    }

    const texto =
      `<b>Contacto desde basal-ai.com</b>\n\n` +
      `<b>Nombre:</b> ${escapar(nombre)}\n` +
      `<b>Correo:</b> ${escapar(email)}\n\n` +
      `${escapar(mensaje)}\n\n` +
      `<i>Responder desde Zimbra con «enviar como» info@basal-ai.com</i>`;

    try {
      const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: texto, parse_mode: 'HTML' }),
      });
      if (!r.ok) throw new Error(`Telegram ${r.status}`);
    } catch {
      // No se detalla el error al visitante: solo que no se ha podido entregar.
      return new Response(JSON.stringify({ ok: false, error: 'No se ha podido enviar' }),
        { status: 502, headers: { ...cabeceras, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }),
      { status: 200, headers: { ...cabeceras, 'Content-Type': 'application/json' } });
  },
};
