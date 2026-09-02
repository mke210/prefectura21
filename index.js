/**
 * Cloud Functions para la app de Prefectura Escolar
 * Escuela Secundaria General "21 de Noviembre"
 *
 * Qué hacen estas dos funciones:
 *
 * 1) telegramWebhook
 *    Recibe los mensajes que Telegram le manda a tu bot. Cuando un papá
 *    abre el enlace que le compartiste (t.me/TU_BOT?start=2024001) y
 *    presiona "Iniciar", Telegram le envía a esta función un mensaje con
 *    el "chat_id" del papá y el "2024001" (la matrícula) que venía en el
 *    enlace. La función guarda esa pareja en la base de datos, en
 *    /prefectura/telegram/2024001, y le contesta al papá confirmando
 *    que quedó vinculado.
 *
 * 2) onEntradaRegistrada
 *    Se activa SOLA, en automático, cada vez que la app de Prefectura
 *    escribe una entrada nueva en /prefectura/asistencia/{fecha}/{matricula}
 *    (es decir, cada vez que se escanea el QR de un alumno). Busca si ese
 *    alumno tiene un papá vinculado y, si sí, le manda el mensaje de
 *    "ya entró a la escuela" por Telegram.
 *
 * No necesitas tocar la app de Prefectura para que esto funcione: en
 * cuanto despliegues estas funciones y configures el webhook de Telegram,
 * los mensajes empiezan a salir solos.
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onValueCreated} = require("firebase-functions/v2/database");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

// El token del bot se guarda como "secret" de Firebase (nunca queda escrito
// en el código ni en GitHub). Se configura una sola vez con:
//   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");

/**
 * Envía un mensaje de texto a un chat de Telegram usando la API del bot.
 */
async function sendTelegramMessage(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    logger.error("Telegram no aceptó el mensaje", data);
  }
  return data;
}

/**
 * Webhook que Telegram llama cada vez que alguien le escribe al bot.
 * URL pública que debes configurar en Telegram (ver guía paso a paso).
 */
exports.telegramWebhook = onRequest(
    {secrets: [TELEGRAM_BOT_TOKEN], region: "us-central1"},
    async (req, res) => {
      try {
        const update = req.body;
        const message = update && update.message;

        if (!message || !message.text) {
          res.sendStatus(200);
          return;
        }

        const chatId = message.chat.id;
        const texto = message.text.trim();
        const token = TELEGRAM_BOT_TOKEN.value();

        // Deep link: t.me/TU_BOT?start=2024001  -> Telegram lo manda como "/start 2024001"
        const match = texto.match(/^\/start(?:@\w+)?\s+(\S+)/);

        if (match) {
          const matricula = match[1];

          // Verificamos que la matrícula exista en la base de alumnos
          const alumnoSnap = await admin
              .database()
              .ref("students")
              .orderByChild("matricula")
              .equalTo(matricula)
              .once("value");

          let alumno = null;
          alumnoSnap.forEach((child) => {
            alumno = child.val();
          });

          if (!alumno) {
            await sendTelegramMessage(
                token,
                chatId,
                "No encontré esa matrícula. Pide de nuevo el enlace en la escuela.",
            );
            res.sendStatus(200);
            return;
          }

          await admin.database().ref(`prefectura/telegram/${matricula}`).set({
            chatId,
            telegramUser: message.from && message.from.username ? message.from.username : null,
            telegramNombre: message.from
              ? `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim()
              : null,
            vinculadoEn: Date.now(),
          });

          await sendTelegramMessage(
              token,
              chatId,
              `✅ Quedaste vinculado con <b>${alumno.nombre}</b> (${alumno.grado}°${alumno.grupo}).\n` +
              `Te voy a avisar aquí cada vez que entre a la escuela.`,
          );
        } else if (texto === "/start") {
          await sendTelegramMessage(
              token,
              chatId,
              "Hola 👋 Este bot avisa cuando tu hijo(a) entra a la escuela. " +
              "Pide en Prefectura el enlace de vinculación de tu hijo(a) para activarlo.",
          );
        }

        res.sendStatus(200);
      } catch (err) {
        logger.error("Error en telegramWebhook", err);
        res.sendStatus(200); // Telegram reintenta si no respondemos 200
      }
    },
);

/**
 * Se dispara sola cada vez que se registra una entrada en Prefectura.
 * Ruta que observa: /prefectura/asistencia/{fecha}/{matricula}
 */
exports.onEntradaRegistrada = onValueCreated(
    {
      ref: "/prefectura/asistencia/{fecha}/{matricula}",
      secrets: [TELEGRAM_BOT_TOKEN],
      region: "us-central1",
    },
    async (event) => {
      const registro = event.data.val();
      const matricula = event.params.matricula;

      const telegramSnap = await admin
          .database()
          .ref(`prefectura/telegram/${matricula}`)
          .once("value");
      const telegramData = telegramSnap.val();

      if (!telegramData || !telegramData.chatId) {
        // Ese alumno no tiene papá vinculado todavía, no hay nada que enviar.
        return null;
      }

      const texto =
        `✅ <b>${registro.nombre}</b> ingresó a la escuela hoy a las ${registro.hora} ` +
        `(${registro.turno}).`;

      await sendTelegramMessage(TELEGRAM_BOT_TOKEN.value(), telegramData.chatId, texto);
      return null;
    },
);
