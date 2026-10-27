# Prefectura Escolar v2 — Guía de instalación

Esc. Sec. Gral. "21 de Noviembre" · Powered by elprofe chan

Esta versión **no modifica nada del Sistema de Credenciales**. Solo **lee** la lista
de alumnos. Todo lo de Prefectura se guarda en un apartado nuevo de Firebase llamado
`prefecturaV2`. Los registros de la app anterior (apartado `prefectura`) se quedan
intactos.

---

## Paso 1 — Respaldo (2 minutos, hazlo antes que nada)

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) → proyecto
   **credenciales21-526be** → **Realtime Database**.
2. Pestaña **Datos** → menú ⋮ (arriba a la derecha) → **Exportar JSON**. Guarda el archivo.
3. Pestaña **Reglas** → selecciona todo el texto y cópialo en un Bloc de notas.
   Guárdalo como `reglas_anteriores.txt`. Si algo falla, lo pegas de vuelta y listo.

## Paso 2 — Publicar las reglas de seguridad

1. En la pestaña **Reglas**, borra el texto y pega el contenido completo de
   `database.rules.json`.
2. Presiona **Publicar**.

Qué hacen estas reglas:

| Apartado | Antes | Ahora |
|---|---|---|
| `alumnos`, `configuracion` y lo demás de Credenciales | abierto | **igual que antes** (Credenciales funciona sin cambios) |
| `usuarios` (cuentas de Credenciales) | cualquiera podía escribir | solo un **administrador** de Credenciales puede modificarlo, para que nadie se vuelva administrador por su cuenta |
| `prefecturaV2` | — | solo prefectas dadas de alta y administradores pueden leer o escribir |

Además, en `prefecturaV2`:

- Una prefecta **no puede borrar** el historial. Solo puede quitar un reporte suyo en
  los primeros 15 minutos, por si se equivocó de botón.
- Una entrada o salida ya registrada **no se puede sobrescribir**, aunque dos tabletas
  escaneen al mismo alumno al mismo tiempo.
- Solo administradores cambian ajustes o dan de alta a otras prefectas.

## Paso 3 — Subir la app

Sube a la carpeta de Prefectura en GitHub (reemplazando los archivos de la versión
anterior):

- `index.html`
- `sw.js`
- `manifest.webmanifest`
- `escudo.png`
- `icon-192.png`
- `icon-512.png`

Los archivos de Telegram (`functions/`, `index.js`, `package.json`, `firebase.json`,
`.firebaserc`, `GUIA_TELEGRAM.md`) ya no se usan en esta versión.

## Paso 4 — Primer ingreso y configuración

1. Abre la app y entra con tu cuenta de **administrador de Credenciales**
   (`elprofechan@gmail.com` o `melchor21n@gmail.com`, con su misma contraseña).
2. Ve a **⚙️ Ajustes**:
   - **Prefectas y prefectos**: da de alta a cada prefecta con usuario, nombre,
     contraseña y **turno** (Matutino, Mixto o Ambos). Los botones **Barbara, Zonia,
     Mirna, Yolanda y Haide** llenan el nombre y el usuario (`prefecta.barbara`, etc.);
     solo falta escribir la contraseña. Esas cuentas **no** pueden entrar a Credenciales.
   - Cuando se roten los turnos, cambia el turno de cada prefecta en su lista
     desplegable. Se guarda al momento.
   - **Horarios**: la salida ya viene en 1:20 pm (Matutino) y 3:00 pm (Mixto). Si
     escribes la hora de **entrada**, la app marca retardos.
   - **Días de Educación Física**: marca los días de cada grupo. Así, al escanear, la
     app le dice a la prefecta qué uniforme le toca al alumno ese día.
   - **Tipos de reporte**: agrega los que falten (por ejemplo "Uñas pintadas"). Las
     prefectas también pueden agregarlos (ver Uso diario).
   - Escribe el **nombre para firmar** los informes.
3. Presiona **💾 Guardar ajustes**.

## Uso diario

- **Al formar**: modo **✅ Entrada**. Se escanea una credencial tras otra sin tocar
  nada. Cada lectura suena y se pone en verde, y el nombre aparece sobre la cámara.
  Si el alumno trae algo mal (zapatos, uniforme, cabello, maquillaje…), se toca el
  botón del reporte en la tarjeta de la derecha. Es un solo toque.
- **Situación nueva**: si lo que trae el alumno no tiene botón, se toca **➕ Otra
  situación**, se escribe qué es (por ejemplo "Sin suéter") y se guarda. Queda como
  botón para todas las prefectas. Solo un administrador puede ocultar botones.
- **Turno de hoy**: arriba, junto al nombre, cada prefecta elige el turno que cubre
  hoy (☀️ Matutino, 🌤️ Mixto o Ambos). Los contadores y las estadísticas se ajustan a
  ese turno. Al día siguiente vuelve solo al turno asignado.
- **¿En qué clase está?**: el horario oficial de los 27 grupos (archivo
  "Agosto04R5 · Grupos de alumnos") ya viene dentro de la app. Al escanear o buscar a
  un alumno se muestra su clase de ese momento (materia y maestro), o si está en
  receso o en hora libre. En **👥 Alumnos** se ve el horario de cada grupo por día,
  dónde está cada maestro y qué horas no tienen maestro (vacantes).
- Los días de **Educación Física** de cada grupo ya vienen marcados según el horario.
  Al escanear, la app indica si al alumno le toca el uniforme de deportes.
- **🔎 ¿Dónde debe estar?** (cuarto modo de escaneo): solo consulta, no registra nada.
  Al escanear a un alumno en el pasillo dice en qué **módulo** va y qué clase y maestro le
  tocan. Si no debería estar ahí, se toca **🚶 Fuera del salón en horario de clase**.
- **Intento de salir antes de hora**: en modo 🏁 Salida, si el alumno aún no tiene su
  hora (matutino 1:20, mixto 3:00, o la del horario alterno), aparece el botón
  **🚪 No tiene permiso: levantar reporte**. Queda en su expediente y no se registra
  la salida.
- **✂️ Horario alterno (recorte de módulos)**: en Ajustes ya viene el de módulos de 40
  minutos (matutino 7 módulos, mixto 5, salida 12:10). Se elige la fecha y se presiona
  **Programar**. Ese día la app ajusta los módulos, las clases, la salida y los retardos,
  y avisa arriba en Escanear. El módulo 1 corresponde a la 1ª hora del horario normal,
  el 2 a la 2ª, etc. Se pueden crear otros horarios alternos.
- **🚫 Días sin clases**: en Ajustes se agregan uno o varios días (desde–hasta) con su
  motivo: Consejo Técnico, día festivo, suspensión oficial o vacaciones. El botón
  **Agregar los últimos viernes de cada mes** agrega de una vez los Consejos Técnicos del
  ciclo escolar. Cualquiera se puede quitar si cambia. Esos días la app avisa que no hay
  clases y esas faltas no se cuentan en la asistencia del alumno.
- **Sin credencial**: se busca por nombre en el recuadro de abajo de la cámara. El
  registro queda marcado como manual.
- **Se sintió mal**: modo **🤒 Salida anticipada** → escanear → elegir motivo → registrar.
- **Fin de turno** (1:20 pm / 3:00 pm): modo **🏁 Salida** y se escanea al salir. Si se
  escanea antes de la hora, la app pregunta si es salida anticipada.
- **📊 Estadísticas**: llegaron, no llegaron, faltas por enfermedad, alumnos con
  reporte, reincidentes, salidas anticipadas y retardos. Incluye los botones
  **Imprimir** y **Descargar Word**. En "No llegaron", el botón **¿Por qué?** registra
  la falta por enfermedad.
- **👥 Alumnos**: expediente con historial, impresión con firma del tutor y envío por
  WhatsApp al teléfono registrado en Credenciales.

Consejos:

- Funciona con lector QR de pistola (USB o Bluetooth).
- Si el internet se cae, los registros se guardan en la tableta y se envían solos al
  volver la conexión. El punto verde o rojo de arriba indica el estado de la conexión.
- La linterna 🔦 aparece si la cámara de la tableta la tiene.

## Pendientes de seguridad (cuando decidas tocar Credenciales)

1. **Token del bot de Telegram anterior**: quedó guardado de forma visible en
   `prefectura/config`. Revócalo desde Telegram con **@BotFather** → `/revoke`, y
   cuando integremos Telegram usaremos uno nuevo.
2. **`alumnos` sigue siendo de lectura y escritura pública**, como hoy. No se cerró
   para no romper Credenciales, que carga los alumnos antes de iniciar sesión. Para
   cerrarlo hay que hacer un ajuste pequeño en Credenciales: cargar los datos después
   del login. Cuando quieras, lo hacemos juntos con respaldo previo.
