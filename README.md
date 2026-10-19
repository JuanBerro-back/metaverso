# Metaverso explicativo de Xupply

Museo 3D interactivo que **explica los módulos del ecosistema Xupply.D** (ERP B2B y logística para
restaurantes) en un recorrido guiado **en primera persona**, con cuatro estaciones interactivas y
**WebXR opcional** para gafas autónomas.

- **Demo publicada:** <https://juanberro-back.github.io/metaverso/>
- **Proyecto que explica:** <https://github.com/JuanBerro-back/xupply-D>

> **Modo demostración local.** No hay backend, ni registro, ni multijugador real, ni datos reales.
> La experiencia es **individual**: no hay otros visitantes ni se interactúa con nadie. **Todas las
> cifras de las estaciones son ficticias (DEMO)**, incluidas expresamente para que nadie las confunda
> con datos de negocio. Se indica en la interfaz, en la pantalla de inicio y en cada ficha de módulo.

---

## 1. Qué incluye

| Pieza | Descripción |
| --- | --- |
| **Pantalla de inicio** | Apodo (se guarda localmente), calidad gráfica, botón de VR (solo si hay gafas compatibles) y aviso honesto de demo. |
| **Cámara y control** | **Primera persona por defecto** (inmersiva), conmutable a 3.ª con `V`; WASD/flechas, correr, saltar y colisiones simples. |
| **4 estaciones (museo)** | M1 catálogo mayorista · M2 pedidos y seguimiento GPS · M3 inventario y contabilidad · M4 copiloto de IA. Cada una tiene cartel 3D, explicación breve, datos DEMO ficticios y botón de vuelta. |
| **Recorrido guiado** | Barra de progreso, *Siguiente / Anterior / Reiniciar*, «Saltar a módulo», pantalla completa, «Salir» y «Saltar recorrido». Los personajes kawaii (Xuppy el gato-ovni y Burgy la hamburguesa) hacen de guías. |
| **Experiencia individual** | Sin otros visitantes y sin interacción con nadie: no hay NPC con los que hablar. Ver *Por qué no hay otros visitantes*. |
| **Minijuego** | Se conserva la banda logística original (clasificar cajas), accesible desde el museo. |
| **WebXR** | `VRButton`, `renderer.xr`, teletransporte con el gatillo, locomoción con joystick, **giro por pasos** y una **pizarra 3D** con los controles y las fichas dentro del visor (los paneles HTML no existen en VR). Funciona con **cualquier mando** WebXR. |
| **Errores y recuperación** | Pantalla de recuperación con ayuda accionable y botón *Reintentar* cuando falta WebGL o la escena se cae: **nunca** queda una pantalla en blanco. |
| **Móvil / táctil** | Joystick, arrastre para mirar y botón `E`. También se puede activar a mano en escritorio («controles sin ratón»). |

---

## 2. Requisitos

- Node.js 18 o superior (probado con Node 24).
- Un navegador actualizado con **aceleración por hardware** (WebGL 2).
- Para VR: gafas compatibles (Meta Quest, Pico…) con navegador WebXR y **HTTPS** (o `localhost`).

## 3. Ejecutar en local

```bash
npm install
npm run dev        # servidor de desarrollo → http://localhost:5173/metaverso/
```

Para probar exactamente el resultado del despliegue:

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ → http://localhost:4173/metaverso/
```

> La app vive bajo `base: '/metaverso/'`. Con `npm run preview` la URL correcta del museo es
> `http://localhost:4173/metaverso/` (sin la barra final `/metaverso` también redirige).

### Resultado de `npm run build` (última ejecución)

```
vite v5.4.21 building for production...
✓ 107 modules transformed.
dist/index.html                  3.64 kB │ gzip:   1.74 kB
dist/assets/index-*.css         22.07 kB │ gzip:   5.33 kB
dist/assets/index-*.js       1,102.08 kB │ gzip: 308.62 kB
✓ built in ~4 s
```

El aviso de Rollup sobre *chunks > 500 kB* es esperado: Three.js va en un único paquete. No se añade
ninguna dependencia nueva para no engordar el bundle (ver *Rendimiento*).

## 4. Despliegue en GitHub Pages

El repositorio ya trae el flujo `.github/workflows/deploy.yml`:

1. **Settings → Pages → Source: GitHub Actions**.
2. `git push` a `main` (o *Actions → Deploy to GitHub Pages → Run workflow*).
3. El flujo ejecuta `npm ci`, `npm run build` y publica `dist/`.

Detalles que no conviene romper:

- `vite.config.js` mantiene `base: '/metaverso/'` porque el sitio se sirve en
  `https://<usuario>.github.io/metaverso/`.
- Las rutas de recursos (`portada.jpeg`, `presentacion.mp4`, iconos) se resuelven con
  `import.meta.env.BASE_URL`, no con `/media/...` (eso daría 404 en Pages).
- Si mueves la demo a otro repositorio o a un dominio propio, cambia `base` y la URL de `index.html`.

## 5. Cómo probar el modo VR

1. Abre la demo en las gafas (Quest Browser, Wolvic…) o desde escritorio con un headset conectado.
2. Pulsa **Entrar en VR** en la pantalla de inicio. El botón solo aparece si
   `navigator.xr.isSessionSupported('immersive-vr')` responde que sí; si no, se explica en español y se
   ofrece seguir en escritorio.
3. Dentro de la sesión aparece una **pizarra de ayuda** con los controles (se retira sola al empezar a
   caminar o al abrir una ficha):
   - **Teletransporte:** apunta al suelo con el mando y aprieta el **gatillo**; verás un anillo verde
     donde vas a caer. Sirve con el gatillo de cualquier mando.
   - **Caminar:** **joystick** del mando (izquierdo o el único que traiga). Relativo a hacia dónde miras.
   - **Girar:** **joystick derecho**, en pasos de 30°. Es el método cómodo: evita el mareo del giro
     continuo. Si solo tienes un mando, ese mismo mando camina (nunca te quedas sin poder moverte).
   - **Fichas:** apunta a una estación o cartel y aprieta el gatillo para abrir su ficha en la **pizarra
     3D**; el gatillo al suelo teletransporta y cierra la pizarra.
   - **Háptica:** los mandos compatibles dan una vibración corta al teletransportarse o abrir una ficha.
4. Al salir de la sesión, la escena vuelve al modo escritorio, en primera persona y mirando hacia donde
   mirabas en el visor, con las sombras restauradas.

Notas:

- **Opcional de verdad:** la VR no es necesaria para nada del recorrido. Si el dispositivo no la
  soporta, el modo escritorio sigue funcionando igual.
- **Cualquier mando:** se usa el mapa estándar de WebXR (`xr-standard`, joystick en los ejes 2-3;
  *fallback* a los ejes 0-1 para mandos que solo publiquen dos). No hay ataduras a una marca concreta.
- Si algo falla al preparar WebXR, se registra un aviso en consola y **la demo continúa**.
- Para desactivar la VR en un despliegue concreto: variable de entorno `VITE_ENABLE_XR=false`
  (por ejemplo en un `.env.local`, que no se sube) o el parámetro de URL `?xr=0`.
- Rendimiento en autónomas: se apagan las sombras y hay que evitar `devicePixelRatio` alto; la calidad
  gráfica se limita sola (`QUALITY_PRESETS` y `dpr={[1, ...]}` en el `Canvas`).

## 6. Controles

**Escritorio y táctil**

| Acción | Escritorio | Táctil |
| --- | --- | --- |
| Moverse | `W` `A` `S` `D` o flechas | Joystick izquierdo |
| Mirar | Ratón (puntero capturado) | Arrastrar en la pantalla |
| Interactuar | `E` o clic con el ratón capturado | Botón `E` |
| Correr / saltar | `Shift` / `Espacio` | Botones `⚡` / `⤒` |
| Cambiar de cámara | `V` (**1.ª por defecto** / 3.ª) | Botón en el HUD |
| Recorrido guiado | `M` (empezar / salir) | Botón `▶ Recorrido` |
| Pausa y menú | `ESC` | Botón `☰ Menú` |
| Cerrar una ficha | `C` o `ESC` | Botón `×` |

**Gafas VR (cualquier mando WebXR)**

| Acción | Mando |
| --- | --- |
| Teletransportarse | Apuntar al suelo + **gatillo** |
| Abrir/cerrar una ficha | Apuntar a la estación o cartel + **gatillo** |
| Caminar | **Joystick** (izquierdo o el único disponible) |
| Girar 30° por pasos | **Joystick derecho** |
| Pizarra de ayuda | Se muestra al entrar; se retira al caminar |

## 7. Recorrido guiado y estaciones

El recorrido (`src/tour/steps.js`) tiene 6 pasos: bienvenida, los 4 módulos y cierre. Cada paso de
módulo teletransporta al visitante frente a la estación, orienta la cámara, abre la ficha y publica la
frase del guía en la burbuja de Xuppy/Burgy.

Cada estación (`src/museum/stations.js`) incluye: *pitch*, viñetas, «cómo funciona», un **ejemplo con
datos DEMO ficticios** (tabla + métricas) y el descargo `DEMO_DISCLAIMER`. Los datos son inventados:
SKUs, precios y pedidos no corresponden a ningún negocio real.

## 8. Arquitectura y cambios por archivo

```
src/
  main.jsx                    arranque + red de seguridad global (errores no capturados)
  App.jsx                     comprobación de WebGL, calidad, Canvas, ErrorBoundary, watchdog
  Experience.jsx              composición de la escena 3D
  Overlay.jsx                 HUD, pausa, ficha de cartel, atajos V/M/C/ESC
  store.js                    estado global (Zustand) + presets de calidad
  styles.css                  estilos (se conservan los originales y se añade la UI nueva)
  lib/capabilities.js         WebGL/WebXR/táctil, DPR acotado, ayuda de errores
  lib/bootFallback.js         pantalla de recuperación sin React ni CSS
  player/{state,input,collide}.js   estado del jugador, entrada táctil, colisiones
  net/visitors.js             texto oficial «Modo demostración local» (sin bots)
  tour/{steps.js,TourDirector.jsx}  recorrido guiado
  xr/XRSupport.jsx            VRButton, mandos, teletransporte, ciclo de sesión
  museum/{config,stations,poster,registry,exhibits}.js  museo, estaciones y carteles
  components/                 Avatar, Player, Stations, StationPanel, TourHud,
                              StartScreen, RecoveryScreen, TouchControls, XRInfoBoard, …
```

| Archivo | Cambio |
| --- | --- |
| `index.html` | Título y descripción en español, `<noscript>`, *watchdog* de arranque (15 s), favicon en línea (evita el 404 de `/favicon.ico`). |
| `src/main.jsx` | Manejo global de `error`/`unhandledrejection` antes del montaje; marca `__XUPPLY_MOUNTED__`. |
| `src/App.jsx` | **Gate de WebGL** con pantalla de recuperación, presets de calidad, `ErrorBoundary` con reintento, opciones de rendimiento del `Canvas`, vigilante de 20 s, detección de WebXR y de táctil. |
| `src/components/ErrorBoundary.jsx` | Reintento sin recargar (remonta el subárbol) y pasa el error al fallback. |
| `src/components/RecoveryScreen.jsx` | **Nuevo.** Pantalla de recuperación con causas probables, pasos de solución, «Reintentar» y detalle técnico plegable. |
| `src/lib/capabilities.js` | **Nuevo.** `XR_ENABLED`, `WS_URL`, `detectWebGL`, `detectWebXR`, `isTouchDevice`, `prefersReducedMotion`, `clampedPixelRatio`, `webglHelp`. |
| `src/lib/bootFallback.js` | **Nuevo.** Aviso de arranque con estilos en línea (funciona aunque el CSS no cargue). |
| `src/Experience.jsx` | Composición de la escena: museo, estaciones, guías kawaii, portal y VR. **Elimina a los visitantes simulados** (experiencia individual). |
| `src/store.js` | **Ampliado:** `view`, `nickname`, calidad, `cameraMode` (arranque en **`first`**), `touch`, `station`, `prompt`, `tour`, `netMode`, estado WebXR; se conserva la API del minijuego. |
| `src/components/LoadingScreen.jsx` | Rutas con `BASE_URL`, barra de progreso honesta, salida de emergencia si el motor se atasca, y *fallback* si falta la portada. |
| `src/components/StartScreen.jsx` | **Nuevo.** Apodo, calidad, «Entrar…con recorrido» / «sin recorrido», sección VR honesta (con controles de cualquier mando), módulos, controles y descargo de demo. |
| `src/components/Avatar.jsx` | **Nuevo.** Avatar low-poly kawaii con animación de caminar. Como la experiencia es en **primera persona**, no se renderiza (ni su cartel) salvo que se pulse `V`.
| `src/components/Player.jsx` | Controlador en 3.ª/1.ª persona, colisiones, salto, cámara con topes; se apaga durante una sesión XR. |
| `src/player/state.js` | **Nuevo.** Posición/velocidad del jugador, puntos de aparición, `teleportPlayer`, `yawTowards`. |
| `src/player/collide.js` | **Nuevo.** Resolución de colisiones contra cajas con límites de sala. |
| `src/player/input.js` | **Nuevo.** Entrada táctil fuera de React (joystick, correr, saltar, interactuar). |
| `src/hooks/useKeyboard.js` | WASD + flechas, `Shift`, `Espacio`. |
| `src/components/PointerLock.jsx` | Captura del ratón resiliente, `lockPointer`/`unlockPointer`, `pointerLockSupported`, estado de la mirada. |
| `src/components/Interaction.jsx` | Rayo desde la cámara, resaltado, pista contextual y apertura por `E`/clic/botón táctil sobre carteles y estaciones. Sin interacción con personas. |
| `src/components/TouchControls.jsx` | **Nuevo.** Joystick, arrastre para mirar y botones de acción. |
| `src/museum/stations.js` | **Nuevo.** Contenido de los 4 módulos + `DEMO_DISCLAIMER`. |
| `src/museum/config.js` | **Ampliado:** posiciones de las estaciones, colisionadores del museo (incluidas estaciones) y del minijuego. |
| `src/museum/poster.js` | **Ampliado:** `makeStationSign`, `makeStationSheet` y `makeHelpSheet` (carteles, fichas de módulo y pizarra de ayuda de VR dibujados en canvas, sin imágenes externas). |
| `src/museum/registry.js` | **Ampliado:** registros de carteles y estaciones para el raycast (el de NPC se retiró al quitar los visitantes). |
| `src/components/Stations.jsx` | **Nuevo.** Cuatro kioscos 3D con pantalla, cartel, aro de colocación y luz de acento. |
| `src/components/StationPanel.jsx` | **Nuevo.** Ficha lateral del módulo con datos DEMO, navegación y cierre. |
| `src/components/TourHud.jsx` | **Nuevo.** Barra del recorrido guiado (progreso, navegación, salto a módulo, pantalla completa). |
| `src/tour/steps.js` | **Nuevo.** Los 6 pasos del recorrido y utilidades. |
| `src/tour/TourDirector.jsx` | **Nuevo.** Teletransporte, orientación, apertura de fichas y frases de los guías. |
| `src/components/Visitors.jsx` | **Eliminado.** Los visitantes simulados (bots) ya no existen: la experiencia es individual y sin interacción con otras personas. Ver *Por qué no hay otros visitantes*. |
| `src/net/visitors.js` | **Simplificado.** Se queda solo el texto oficial `MODO_LOCAL` («Modo demostración local»); se retiraron los datos de los bots. |
| `src/components/ZuppyBot.jsx` | Guarda para no molestar durante el recorrido; estética y comportamiento original intactos. |
| `src/components/Portal.jsx` | Usa `playerState` para colocar al avatar en el portal. |
| `src/components/Museum.jsx`, `Warehouse.jsx` | Prop `detail` para bajar el detalle en calidad baja (rendimiento). |
| `src/xr/XRSupport.jsx` | **Nuevo.** WebXR: `VRButton`, rig, mandos, rayo, teletransporte, locomoción y **giro por pasos** con cualquier mando, háptica, pizarra de ayuda al entrar y ciclo de sesión (la cámara se vuelve a colgar del rig en cada sesión). |
| `src/components/XRInfoBoard.jsx` | **Nuevo.** Pizarra 3D legible dentro del visor: fichas de estación, carteles y los controles de VR. |
| `src/Overlay.jsx` | **Reescrito.** Compone pantalla de inicio, pausa, fichas, HUD, recorrido y controles táctiles; añade atajos `V`/`M`/`C`/`ESC`. |
| `src/styles.css` | Se conservan todas las clases originales; se añaden recuperación, inicio, fichas, recorrido, HUD, táctil, foco visible, `prefers-reduced-motion` y *media queries*. |
| `README.md` | **Nuevo.** Este documento: uso, despliegue, VR, limitaciones y cambios por archivo. |

No se añadió ninguna dependencia al `package.json`.

## 9. Por qué no hay otros visitantes (y cómo se haría un modo online)

La experiencia es **individual por decisión de diseño**: se pidió un metaverso inmersivo de
presentación, sin interacción con otras personas. Por eso:

- **No hay otros usuarios** ni NPC con los que hablar. Los únicos personajes son las mascotas de la
  marca (Xuppy y Burgy), que son decorativas y solo hablan en la burbuja del recorrido guiado.
- **No hay interacción con nadie**: el rayo solo apunta a carteles y estaciones del museo.
- La etiqueta honesta que se muestra es **«Modo demostración local»**.

> Si en el futuro se quisiera recuperar el espacio compartido, el punto de partida está en el historial
> de Git (el componente `Visitors.jsx` y los datos de los bots) para volver a activarlo como *feature
> flag* apagada por defecto.

Tampoco hay backend: el repositorio es estático (GitHub Pages) y no se mezcla backend con el despliegue
de la demo. No hay WebSocket, ni cuentas, ni salas.

Si algún día se quisiera un **multijugador real**, el camino previsto (**fuera** de este repositorio
estático) sería:

1. Servicio aparte con **Node + Express + Socket.io** (salas por museo, posición y animación).
2. En este proyecto, definir `VITE_WS_URL` (ya leído en `src/lib/capabilities.js` como `WS_URL`) y
   añadir los clientes remotos, manteniendo el modo individual como *fallback* si no conecta.
3. Documentar y avisar en la interfaz del cambio de modo (`netMode: 'local' | 'online'`).

## 10. Rendimiento y accesibilidad

- `devicePixelRatio` acotado (`dpr={[1, preset.pixelRatioMax]}`), sombras «soft» y desactivables,
  `antialias` según calidad y resolución del mapa de sombras por preset (baja/media/alta).
- Calidad automática: detecta *software rendering* (SwiftShader/llvmpipe), WebGL 1 y pantallas
  pequeñas y baja la calidad sin preguntar.
- Sin *post-processing* ni *assets* pesados: carteles, nombres y fichas se **dibujan en canvas**.
- En calidad baja se reduce el detalle del mobiliario (`detail={false}`).
- Accesibilidad: foco visible, etiquetas en los campos, botones grandes (≥44 px), alto contraste,
  `aria-*` en diálogos y barras de progreso, `prefers-reduced-motion`, opción de **saltar el recorrido**
  y textos de ayuda accionables.

## 11. Problemas conocidos y cómo se resuelven

| Síntoma | Causa | Solución |
| --- | --- | --- |
| «Tu navegador no puede crear un contexto WebGL» | WebGL desactivado, GPU bloqueada, escritorio remoto o política de empresa | Activar la aceleración por hardware, probar en el equipo local, revisar `chrome://gpu`, actualizar controladores |
| «El motor 3D se detuvo» | Error inesperado en la escena o contexto WebGL agotado | *Reintentar* (recrea el contexto) o *Reintentar en calidad baja* |
| La carga se queda al 90 % | El motor no confirma el arranque en 20 s | Aparecen *Reintentar* y *Calidad baja* en la pantalla de carga |
| El ratón no se captura | Iframe/kiosco o permiso del navegador | Menú (`ESC`) → «Activar controles sin ratón» |
| No aparece «Entrar en VR» | No hay gafas compatibles o `VITE_ENABLE_XR=false` / `?xr=0` | Es lo esperado; usar el modo escritorio |
| No me veo el avatar | La cámara arranca en **1.ª persona** (inmersiva) | Es lo previsto; pulsa `V` para pasar a 3.ª persona |
| El mando no mueve en VR | El mando no publica `gamepad.axes` (o está sin emparejar) | Usa el teletransporte con el gatillo; revisa el emparejamiento en el navegador del visor |
| El vídeo del módulo 08 no se ve | Falta `public/media/presentacion.mp4` | Añadir el archivo y recargar (hay un aviso en el propio panel) |

## 12. Próximos pasos sugeridos

1. Medir en gafas reales (Quest/Pico) el teletransporte, el joystick y el giro por pasos; ajustar
   presets de calidad para autónomas.
2. Sustituir el vídeo/portada por material definitivo del proyecto.
3. Añadir un modo «presentación desatendida» (recorrido automático con temporizador).
4. Traducir la interfaz (ES/EN) si se presenta a público internacional.
5. Si algún día se quiere multijugador real, seguir el plan de la sección 9 — que hoy está
   **fuera de alcance** a propósito: la experiencia es individual.
