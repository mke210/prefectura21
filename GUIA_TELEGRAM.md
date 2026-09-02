# Guía: Notificaciones por Telegram en Prefectura Escolar

Esta guía conecta tu app de Prefectura con Telegram para que los papás
reciban un aviso automático cuando su hijo(a) entra a la escuela.

Hay tres piezas que vas a montar, en este orden:

1. El **bot** de Telegram (5 minutos).
2. Las **Cloud Functions** que hacen de "puente" entre Telegram y tu
   Firebase (15-20 minutos, se hace una sola vez).
3. Compartir el **enlace de vinculación** con cada papá desde la
   pestaña "Padres" de la app (ya está listo en el código que te di).

No necesitas saber programar para seguir los pasos 1 y 2: son
comandos que copias y pegas.

---

## Paso 1 — Crear el bot en Telegram

1. Abre Telegram y busca el usuario **@BotFather**.
2. Escríbele `/newbot`.
3. Te va a pedir un **nombre** (el que se muestra a los papás, ej.
   `Prefectura 21 de Noviembre`).
4. Luego te pide un **usuario** (debe terminar en `bot`, ej.
   `Prefectura21NBot`).
5. BotFather te va a dar un **token**, algo así:
   `7123456789:AAHk3f...............`
   **Guárdalo, lo vas a necesitar en el Paso 2.** No lo compartas ni lo
   subas a ningún repositorio público.

---

## Paso 2 — Desplegar las Cloud Functions

Estas funciones viven en el mismo proyecto Firebase que ya usas
(`credenciales21-526be`), así que no es una cuenta ni un proyecto
nuevo.

### 2.1 — Requisitos previos

- Tener **Node.js** instalado (18 o más reciente) — [nodejs.org](https://nodejs.org)
- Tener acceso de **propietario o editor** al proyecto Firebase
  `credenciales21-526be` en [console.firebase.google.com](https://console.firebase.google.com)

### 2.2 — Pasar el proyecto al plan Blaze

Las Cloud Functions necesitan salir a internet (para hablar con la
API de Telegram), y eso requiere el plan **Blaze** (pago por uso).
Para este volumen de mensajes (unos cientos al día), el costo real es
**$0 — cae dentro de la capa gratuita** de Cloud Functions. Blaze solo
es necesario para *habilitar* la posibilidad de llamadas a internet,
no significa que vayas a pagar.

En Firebase Console → ⚙️ (parte inferior izquierda) → **Uso y
facturación** → **Modificar plan** → elige **Blaze**.

### 2.3 — Instalar las herramientas de Firebase

En tu computadora, abre una terminal (o CMD/PowerShell en Windows) y
escribe:

```
npm install -g firebase-tools
firebase login
```

Esto abre tu navegador para que inicies sesión con la cuenta de
Google que administra `credenciales21-526be`.

### 2.4 — Copiar los archivos del proyecto

Te entregué una carpeta llamada `telegram-functions` con esta
estructura:

```
telegram-functions/
  firebase.json
  .firebaserc
  functions/
    index.js
    package.json
```

Cópiala a tu computadora tal cual (no necesitas tocar nada de estos
archivos, ya apuntan a tu proyecto).

### 2.5 — Instalar las dependencias

Dentro de la terminal, entra a la carpeta `functions` y ejecuta:

```
cd telegram-functions/functions
npm install
```

### 2.6 — Guardar el token del bot como secreto

Desde la carpeta `telegram-functions` (un nivel arriba de
`functions`):

```
cd ..
firebase functions:secrets:set TELEGRAM_BOT_TOKEN
```

Te va a pedir que pegues el token que te dio BotFather en el Paso 1.
Dale Enter. Este token queda guardado de forma segura en Google
Cloud, nunca en el código.

### 2.7 — Desplegar

```
firebase deploy --only functions
```

Espera unos minutos. Al terminar, la terminal te muestra dos URLs,
algo así:

```
✔  functions[telegramWebhook(us-central1)] https://us-central1-credenciales21-526be.cloudfunctions.net/telegramWebhook
✔  functions[onEntradaRegistrada(us-central1)]
```

**Copia la URL de `telegramWebhook`**, la necesitas en el siguiente
paso.

### 2.8 — Conectar el webhook con Telegram

Pega esta URL en tu navegador (cambia `TU_TOKEN` por el token del bot
y `TU_URL` por la URL que copiaste):

```
https://api.telegram.org/botTU_TOKEN/setWebhook?url=TU_URL
```

Ejemplo:

```
https://api.telegram.org/bot7123456789:AAHk3f.../setWebhook?url=https://us-central1-credenciales21-526be.cloudfunctions.net/telegramWebhook
```

Si todo salió bien, la página te muestra:

```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

Listo — el bot ya está conectado. A partir de aquí no necesitas volver
a tocar la terminal para el uso diario; solo si algún día cambias de
bot o quieres modificar el mensaje.

---

## Paso 3 — Configurar el bot en la app de Prefectura

1. Abre la app de Prefectura → pestaña **⚙️ Ajustes**.
2. En la tarjeta **"Bot de Telegram"**, escribe el usuario del bot
   (el de BotFather, sin la `@`, ej. `Prefectura21NBot`).
3. Guarda.

## Paso 4 — Vincular a un papá

1. Ve a la pestaña **👨‍👩‍👧 Padres**.
2. Busca al alumno. Si dice "Sin vincular", presiona **"Compartir
   enlace"**.
3. En celular, esto abre el menú para compartir por WhatsApp
   directamente; en computadora, copia el mensaje al portapapeles
   para que lo pegues donde quieras.
4. El papá abre el enlace, Telegram se abre solo, y presiona
   **"Iniciar"**.
5. El bot le contesta confirmando la vinculación, y en la app la
   pestaña Padres actualiza su estado a "Vinculado" en tiempo real.

Desde ese momento, cada vez que se escanee el QR de ese alumno en la
pestaña de Registro, el papá recibe el mensaje automáticamente — no
hay que hacer nada más.

---

## Notas importantes

- **Los teléfonos que se ven en la pestaña Padres son solo de
  referencia** (vienen del campo que ya llenan los secretarios en
  Credenciales). Telegram identifica al papá por el enlace que abrió,
  no por el número.
- Si un papá tiene dos hijos en la escuela, tiene que abrir el enlace
  de **cada** hijo por separado (una vez por cada uno) — cada
  vinculación es independiente.
- Si algún día cambias de bot, solo repites el Paso 2.6 a 2.8 con el
  nuevo token, y actualizas el usuario del bot en Ajustes (Paso 3).
- Si quieres que también se avise por **salidas anticipadas**, dímelo
  y agrego esa segunda función — el patrón es exactamente el mismo,
  solo cambia la ruta que observa (`/prefectura/salidas/...` en vez de
  `/prefectura/asistencia/...`).
