# Plan de implementación — Presentación interactiva de MCP

> Documento de planificación. Todavía no se ha escrito código.
> Fecha del plan: 1 de noviembre de 2026.

---

## 1. Objetivo

Construir una presentación HTML tipo PowerPoint que explique **qué es MCP (Model Context Protocol)**, a profundidad, para una persona con base técnica sólida: entiende IA generativa, APIs, APIs REST, bases de datos, frontend, microservicios y API Gateway, pero no ha logrado entender MCP.

La presentación debe:

- Explicar el protocolo, el problema que resuelve y cómo funciona.
- Usar **gráficos, flechas, direcciones y flujos** como recurso principal de explicación.
- Ser navegable como un deck de diapositivas.
- **Explicar todo en español**, con los términos técnicos en inglés (`host`, `client`, `server`, `LLM`, `tool`, `prompt`), que el destinatario ya domina.
- No inventar nada. Todo dato debe tener fuente primaria verificable.

### Perfil del destinatario

| Sabe | No sabe |
|---|---|
| IA generativa y qué es un LLM | Qué es MCP |
| API REST, JSON, HTTP | Cómo MCP se diferencia de una API |
| Bases de datos, microservicios | El modelo Host / Client / Server |
| API Gateway | Cómo encaja MCP en la arquitectura existente |
| Frontend, JS, Node | El flujo de mensajes del protocolo |

Por eso el plan **no** explica qué es una API ni qué es un LLM. Explica MCP **en contraste con lo que ya sabe**.

---

## 2. Investigación realizada (fuentes de verdad)

Toda la presentación se construye exclusivamente sobre estas fuentes. Ninguna afirmación técnica debe salir de memoria.

### Fuentes primarias oficiales

| ID | Fuente | URL | Qué se extrajo |
|---|---|---|---|
| S1 | *What is MCP?* — docs oficiales, rev. 2026-07-28 | `https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro` | Definición, analogía USB-C, beneficios por rol |
| S2 | *Architecture overview* — docs oficiales | `https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture` | Host/Client/Server, capas, primitivas, ejemplo JSON-RPC completo |
| S3 | *Understanding MCP servers* | `https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts` | Tools, Resources, Prompts; quién controla cada una; métodos |
| S4 | *Understanding MCP clients* | `https://modelcontextprotocol.io/docs/2026-07-28/learn/client-concepts` | Elicitation, Roots, Sampling; estados de deprecación |
| S5 | *Base protocol — Overview* — spec 2026-07-28 | `https://modelcontextprotocol.io/specification/2026-07-28/basic` | JSON-RPC 2.0, requests/responses/notifications, statelessness |
| S6 | *Transports* — spec 2026-07-28 | `https://modelcontextprotocol.io/specification/2026-07-28/basic/transports` | stdio y Streamable HTTP |
| S7 | *Security Best Practices* | `https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices` | Confused deputy, token passthrough, SSRF, servidores locales |
| S8 | *Versioning* | `https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning` | Formato `YYYY-MM-DD`, versión actual, deprecaciones |
| S9 | *Key Changes* (changelog 2026-07-28) | `https://modelcontextprotocol.io/specification/2026-07-28/changelog` | Qué cambió respecto a 2025-11-25 |
| S10 | *SDKs* | `https://modelcontextprotocol.io/docs/2026-07-28/sdk` | Tier 1/2/3 y lenguajes soportados |
| S11 | *Build an MCP server* | `https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server` | Código real del servidor `weather` en TypeScript |
| S12 | *Governance and Stewardship* | `https://modelcontextprotocol.io/community/governance` | Roles, SEPs, licencias, maintainers |
| S13 | *Introducing MCP* — Anthropic, 25 nov 2024 | `https://www.anthropic.com/news/model-context-protocol` | Origen, autores, motivación original |
| S14 | *Donating MCP to the Agentic AI Foundation* — Anthropic, 9 dic 2025 | `https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation` | Donación a Linux Foundation/AAIF, cifras de adopción |

### Hallazgo crítico de la investigación

La versión **actual** del protocolo es **2026-07-28** y representa un cambio arquitectónico mayor:

- MCP pasó a ser **stateless**: se eliminó el handshake `initialize` / `notifications/initialized`.
- Cada request lleva su versión de protocolo y capacidades en `_meta`.
- Se agregó `server/discover` como RPC obligatorio.
- `Roots`, `Sampling` y `Logging` quedaron **deprecados**.
- El transporte HTTP+SSE quedó deprecado en favor de Streamable HTTP.

**Consecuencia para la presentación:** la mayoría del contenido que existe en internet (tutoriales, blogs, videos) describe la versión anterior, stateful, con handshake. Un lector que mezcla ambas fuentes termina sin entender el protocolo. El deck debe explicar la versión actual **y** señalar explícitamente qué cambió, con un slide dedicado.

### Skills consultados (Find Skills)

Se ejecutó la skill `find-skills` y luego `npx skills find "presentation slides design"`. Resultados evaluados:

| Skill | Instalaciones | Repo | Decisión |
|---|---|---|---|
| `claude-office-skills/skills@ppt-visual` | 12.3K | — | No aplica: orientado a PPTX |
| `jwynia/agent-skills@presentation-design` | 2.6K | 180 ★ | No se instala: es un diagnóstico de diseño, aporta poco sobre las skills locales |
| `zarazhangrui/frontend-slides@frontend-slides` | 1.1K | 31.7K ★ | No se instala (Socket: Warn), pero **se adopta su principio** de escenario fijo 16:9 |
| `lingzhi227/...@slide-generation` | 1.6K | — | No aplica |

**Decisión:** no instalar ninguna skill externa. Se usan las skills ya presentes y auditadas en el entorno:

- `frontend-design` — dirección estética, tipografía, evitar el look genérico.
- `impeccable` — jerarquía, layout, tipografía, color, motion, accesibilidad, responsive.
- `web-design-guidelines` — auditoría de accesibilidad y UX.
- `ui-ux-pro-max` — paletas, parejas tipográficas, guías de interacción.
- `archify` — criterios para diagramas de arquitectura y flujos.

Del skill `frontend-slides` se toma prestado **un solo principio**, el más valioso: *escenario fijo de 1920×1080 escalado como un todo*, en lugar de reflow responsive. Así una diapositiva se ve como diapositiva en cualquier pantalla, incluido móvil.

---

## 3. Decisiones de producto

| Decisión | Elección | Motivo |
|---|---|---|
| **Idioma** | **Español (es-ES), de principio a fin** | Requisito explícito del usuario |
| Profundidad | Deep-dive, ~27 slides | El usuario pidió entender "a profundidad" |
| Código | Una slide con TypeScript real | Desmitifica el protocolo, conecta con su base técnica |
| Tema visual | Dark blueprint + light paper, con toggle | Se ofrecieron ambos; el usuario eligió ambos |
| Dependencias runtime | Cero | Debe abrirse con doble clic, offline |
| Build | Node + script propio | Node ya está instalado (v24.22.1) |
| Formato de salida | Un solo `dist/index.html` autocontenido | Portabilidad total |
| Fuente editable | `src/` con un archivo por slide | Facilita edición posterior |

### Política de idioma

**La explicación va en español. Los términos técnicos van en inglés.**

Esa es la regla completa. No hay glosas forzadas ni traducciones inventadas entre paréntesis: quien lee esto ya sabe qué es un `host`, un `client`, un `server` o un `LLM`, y las traducciones lo único que hacen es añadir ruido.

**1. Términos técnicos → en inglés, sin traducir y sin glosa.**

| Se escribe | No se escribe |
|---|---|
| `Host` / `Client` / `Server` | Anfitrión / Cliente / Servidor |
| `Tools` / `Resources` / `Prompts` | Herramientas / Recursos / Indicaciones |
| `Sampling` / `Elicitation` / `Roots` | Muestreo / Elicitación / Raíces |
| `LLM`, `tool call`, `prompt`, `token`, `context window` | Modelo grande de lenguaje, llamada de herramienta... |
| `payload`, `endpoint`, `request`, `response`, `runtime` | Carga útil, punto final, petición... |
| `stateless`, `stateful`, `transport` | Sin estado, con estado, transporte |

Estos términos se usan tal cual dentro de una frase en español. Ejemplo del registro que se busca:

> "El **host** crea un **client** por cada **server**. Cada **client** mantiene una conexión 1:1, y esa conexión es la que transporta los mensajes JSON-RPC."

No:

> "El anfitrión crea un cliente por cada servidor. Cada cliente mantiene una conexión uno a uno..."

**2. Identificadores técnicos → nunca se traducen.**

Métodos (`tools/list`, `tools/call`, `server/discover`), campos (`inputSchema`, `_meta`), transportes (`stdio`, `Streamable HTTP`), códigos de error (`-32022`), nombres de paquetes (`@modelcontextprotocol/server`), y los payloads JSON completos.

**3. JSON y código → sintaxis intacta, comentarios en español.**

```ts
// Registra una tool que consulta el clima
server.registerTool("get_forecast", { /* ... */ })
```

Los comentarios explican en español; los identificadores siguen siendo los del SDK real, porque el código debe ser copiable y ejecutable.

**4. Todo lo que no es término técnico → en español.**

Títulos, subtítulos, prosa explicativa, etiquetas de figura (`FIG. 04 — EL MURO N×M`), notas del presentador, mensajes de la interfaz, botones, ayuda de atajos y nombres de archivo visibles.

La prueba para decidir en cada caso: **¿este término lo buscaría alguien en la documentación oficial?** Si la respuesta es sí, va en inglés. Si es una palabra que solo sirve para explicar, va en español.

**Convenciones de español:**

- Se usa **"el deck"** y **"la slide"** (préstamos asentados en el habla técnica hispana), no "la presentación" y "la diapositiva" de forma exclusiva.
- Se evita el "tú" genérico anglicado; se usa **segunda persona neutra** ("verás", "puedes").
- Comillas angulares «» solo en citas textuales largas; comillas rectas en código.
- Se usa la raya (—) para incisos, no el guion.
- Cifras: punto para miles (`10.000`), coma para decimales (`4,5:1`), excepto dentro de código y JSON.

---

## 4. Dirección visual

### Concepto

**Blueprint / plano técnico de ingeniería.** MCP es un protocolo: habla de contratos, mensajes, direcciones y límites. El lenguaje visual de un plano de ingeniería le queda natural, y hace que las flechas y los flujos sean los protagonistas en lugar de decoración.

### Paleta

**Dark (por defecto)**

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0A1017` | Fondo |
| `--bg-elev` | `#111A24` | Tarjetas, paneles |
| `--grid` | `rgba(120, 190, 220, 0.06)` | Retícula de plano |
| `--ink` | `#E6EDF3` | Texto principal |
| `--ink-dim` | `#8FA3B4` | Texto secundario |
| `--flow` | `#38D9D9` | Flujo de datos, flechas primarias |
| `--model` | `#8B7CF6` | El modelo / LLM |
| `--warn` | `#F0B429` | Advertencias, deprecaciones |
| `--risk` | `#FF6B6B` | Riesgos de seguridad |
| `--ok` | `#4ADE80` | Resultados, éxito |

**Light (paper)**

Mismos roles semánticos, recalibrados para contraste AA sobre `#F7F5F0`. El cian se oscurece a `#0E7C7C`; el ámbar a `#8A5A00`; el riesgo a `#B3261E`.

Ambos temas se implementan con custom properties en `:root` y `[data-theme="light"]`. El toggle persiste en `localStorage` y respeta `prefers-color-scheme` en la primera visita.

### Tipografía

Self-hosted, sin CDN:

- **Space Grotesk** — títulos y cifras grandes. Geométrica, con carácter técnico.
- **IBM Plex Sans** — cuerpo. Alta legibilidad en pantalla.
- **IBM Plex Mono** — etiquetas de figura, JSON, código, badges de fuente.

Escala tipográfica fija en `rem` sobre el canvas de 1920×1080, no fluida, para que el layout sea determinista.

### Motivos visuales recurrentes

- Etiquetas de figura tipo `FIG. 04 — EL MURO N×M` en monoespaciado, esquina superior derecha.
- Retícula sutil de 40px que solo aparece en slides de diagrama.
- Badge de fuente `[S5]` en la esquina inferior de cada slide que afirme algo técnico.
- Numeración de slide en mono, tipo `04 / 27`.

---

## 5. Estructura de slides (27)

> Todo el texto visible de estas 27 slides va en español, según la política de idioma de la sección 3.

### Acto 0 — Apertura

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 01 | Portada | *"MCP: el protocolo que le pone puertos a la IA"*. Subtítulo, fecha, aviso de versión del protocolo explicada | S1 |
| 02 | Mapa del recorrido | 5 bloques con tiempo estimado. Navegable: click en un bloque salta a ese acto | — |

### Acto 1 — El problema

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 03 | Qué sabe y qué no sabe un LLM | Diagrama de dos columnas. Izquierda: lo que hace (predecir tokens, razonar sobre lo que tiene en contexto). Derecha: lo que no hace (no accede a datos posteriores al corte, no ejecuta nada, no conoce tus sistemas). Cierre: "el modelo no está roto, está aislado" | S2, S13 |
| 04 | Function calling no es MCP | Flujo: usuario → app arma lista de funciones → modelo emite JSON de llamada → **la app ejecuta** → resultado vuelve al modelo. Punto clave: el modelo nunca ejecuta nada; y cada app define su propio formato. Funciona, pero no es un estándar entre apps | S2 |
| 05 | **El muro N×M** | 4 apps (Claude, ChatGPT, Cursor, VS Code) × 4 sistemas (GitHub, Postgres, Drive, Slack) = **16 conectores**. Cada línea con su auth, su formato, su mantenimiento. Animación: las líneas se dibujan una por una; el contador sube 1→16 | S13 |
| 06 | **La jugada de MCP** | Botón *"insertar el protocolo"*. Las 16 líneas se funden en 8 (4 apps → protocolo, protocolo → 4 sistemas). Contador `16 → 8`. Generalización a `N×M → N+M` con la fórmula animada | S13 |

### Acto 2 — La definición

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 07 | USB-C para la IA | La analogía oficial, citada textualmente. Diagrama: un conector, muchos dispositivos. Aclaración: es una analogía, no una especificación técnica | S1 |
| 08 | API REST vs MCP | Tabla de dos columnas. **Comparten:** HTTP, JSON, auth, versionado. **Difieren:** REST expone recursos con verbos; MCP expone *capacidades* con semántica para un modelo. REST requiere que el desarrollador lea la doc y escriba código; MCP permite **descubrimiento en runtime**. REST no tiene schema obligatorio; MCP sí (`inputSchema` en JSON Schema) | S2, S3, S5 |
| 09 | Qué NO es MCP | Cinco tarjetas de "no es": no es un modelo, no es un agente, no es un framework, no reemplaza tu API, no dicta cómo el host usa el contexto. Cita textual: *"MCP focuses solely on the protocol for context exchange—it does not dictate how AI applications use LLMs or manage the provided context"* | S2 |

### Acto 3 — Arquitectura

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 10 | Host, Client, Server | Diagrama de tres capas. Host = la app que el usuario usa (Claude Desktop, VS Code). Client = objeto que mantiene **una** conexión con **un** servidor (relación 1:1 explícita). Server = programa que expone capacidades. Un host con 3 servidores tiene 3 clients. Por qué: aislamiento y límites de seguridad | S2 |
| 11 | La pila de capas | Dos capas concéntricas. **Data layer**: JSON-RPC 2.0, descubrimiento, primitivas. **Transport layer**: cómo viajan los bytes (stdio, Streamable HTTP). Mensaje clave: el mismo JSON funciona sobre cualquier transporte | S2, S6 |
| 12 | Los tres tipos de mensaje | Request (tiene `id`, espera respuesta), Response (mismo `id`, result o error), Notification (sin `id`, nadie responde). Con el sobre JSON-RPC real de cada uno | S5 |

### Acto 4 — Primitivas (el corazón)

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 13 | **Tools** | Funciones que el **modelo** decide invocar. JSON real de `weather_current` con `inputSchema`. Métodos `tools/list` y `tools/call`. Aclaración: requieren consentimiento del usuario; el host puede pedir aprobación por ejecución | S3 |
| 14 | **Resources** | Datos de solo lectura que la **aplicación** decide incluir. URIs únicas, MIME types, resource templates con parámetros. Métodos `resources/list`, `resources/templates/list`, `resources/read`. Diferencia con Tools: no ejecutan, informan | S3 |
| 15 | **Prompts** | Templates que el **usuario** invoca explícitamente. Argumentos tipados, completion de parámetros. Métodos `prompts/list`, `prompts/get`. Patrón de UI: slash commands | S3 |
| 16 | Tabla resumen | Quién controla qué: Tools → modelo, Resources → aplicación, Prompts → usuario. Cuándo usar cada una, con el ejemplo del viaje a Barcelona que usa las tres a la vez | S3 |

### Acto 5 — El flujo real

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 17 | Una llamada, paso a paso | Secuencia clickeable: ① `server/discover` ② `tools/list` ③ el modelo decide ④ `tools/call` ⑤ resultado ⑥ el modelo responde. Cada paso muestra el payload JSON-RPC real. Un paquete animado viaja por las flechas | S2 |
| 18 | **Stateless** | Por qué cada request lleva versión y capacidades en `_meta`. Qué se eliminó (handshake, sesiones). Por qué importa: **al leer docs viejas verás `initialize` y no existe más**. Tabla de qué cambió en 2026-07-28 | S5, S8, S9 |
| 19 | Los dos transportes | `stdio`: proceso local, sin red, un cliente por proceso. `Streamable HTTP`: remoto, POST + SSE opcional, OAuth 2.1. Diagrama lado a lado con el criterio de elección | S6 |
| 20 | El ciclo completo | End-to-end: usuario → host → modelo → client → server → sistema externo → resultado → modelo → usuario. Con el punto exacto donde el modelo decide y el punto exacto donde el host pide permiso | S2, S3 |

### Acto 6 — Seguridad, límites y contexto

| # | Título | Contenido | Fuente |
|---|---|---|---|
| 21 | Los riesgos reales | Cuatro vectores documentados: **prompt injection** a través del output de un tool, **confused deputy**, **token passthrough**, y **servidores locales que ejecutan código**. Cada uno con su mitigación oficial | S7 |
| 22 | Qué NO resuelve MCP | Lista honesta de límites. Árbol de decisión: ¿necesito MCP? Sí si tienes M×N integrations o quieres que cualquier host use tus datos. No si tienes una sola app y una sola API | S1, S2 |
| 23 | MCP vs API Gateway | No son rivales. El gateway protege y enruta el backend; MCP describe capacidades a un modelo. Diagrama de ambas piezas en la misma arquitectura. Cuándo conviven | S2, S6 |
| 24 | El código | Servidor `weather` real del quickstart oficial en TypeScript. ~20 líneas visibles. Aclaración del paquete `@modelcontextprotocol/server` y `serveStdio` | S11 |
| 25 | Gobernanza y versiones | Creado en Anthropic (nov 2024, David Soria Parra y Justin Spahr-Summers). Donado a Linux Foundation / AAIF (dic 2025). Formato de versión `YYYY-MM-DD`. Versión actual: 2026-07-28 | S8, S12, S13, S14 |
| 26 | Ecosistema | SDKs Tier 1 (TypeScript, Python, C#, Go, Rust, Ruby). Adopción citada con fecha y atribución: >10,000 servidores públicos y 97M+ descargas mensuales de SDK, según Anthropic en dic 2025. **No se presenta como dato actual** | S10, S14 |
| 27 | Fuentes | Las 14 fuentes con URL completa. Nota metodológica: fecha de consulta y versión del protocolo usada | — |

---

## 6. Interacciones clave

| Slide | Interacción | Propósito |
|---|---|---|
| 05 | Las 16 líneas se dibujan secuencialmente; contador sube a 16 | Hacer *sentir* el costo del problema |
| 06 | Botón que transforma 16 → 8 con transición animada | El momento "ajá" del deck |
| 17 | Los 6 pasos avanzan con click; el payload cambia | Entender el protocolo sin leer un spec |
| 22 | Árbol de decisión ramificado | Responder "¿lo necesito?" |
| Todas | Toggle de tema, overview, notas | Uso real como presentación |

---

## 7. Arquitectura del proyecto

```
mcp-presentacion/
├── docs/
│   └── plan-implementacion.md     ← este documento
├── src/
│   ├── slides/
│   │   ├── 01-portada.html
│   │   ├── 02-mapa.html
│   │   ├── ...
│   │   └── 27-fuentes.html
│   ├── styles/
│   │   ├── tokens.css             ← paletas dark/light
│   │   ├── deck.css               ← canvas 16:9, navegación, chrome
│   │   ├── slides.css             ← layouts específicos
│   │   └── print.css              ← exportación a PDF
│   ├── scripts/
│   │   ├── deck.js                ← navegación, overview, notas, hash
│   │   └── diagrams.js            ← animaciones SVG por slide
│   └── index.template.html
├── assets/
│   └── fonts/                     ← .woff2 self-hosted
├── build.mjs                      ← ensambla y embebe todo en dist/
├── package.json
├── README.md
└── dist/
    └── index.html                 ← un solo archivo, offline, doble clic
```

### Por qué un archivo por slide

Permite editar una diapositiva sin tocar las otras 26, evita conflictos y hace que el `build.mjs` sea trivial: leer archivos en orden, inyectar en el template, embeber fuentes como base64, minificar y escribir `dist/index.html`.

---

## 8. Detalles técnicos de implementación

### Canvas 16:9

```css
.deck {
  --canvas-w: 1920;
  --canvas-h: 1080;
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.slide {
  width: calc(var(--canvas-w) * 1px);
  height: calc(var(--canvas-h) * 1px);
  transform: scale(var(--scale));
  transform-origin: center;
}
```

`--scale` se calcula en JS: `min(vw / 1920, vh / 1080)`. Se recalcula en `resize` y en `fullscreenchange`. Nunca se hace reflow del contenido.

### Navegación

| Tecla | Acción |
|---|---|
| `→` `↓` `Espacio` `PageDown` | Siguiente |
| `←` `↑` `PageUp` | Anterior |
| `Home` / `End` | Primera / última |
| `O` | Overview (grid de todas las slides) |
| `N` | Panel de notas del presentador |
| `T` | Toggle tema |
| `F` | Pantalla completa |
| `Esc` | Salir de overview/notas |
| `?` | Ayuda de atajos |

Rutas por hash: `#/12` abre la slide 12. Deep-link funciona al recargar.

### Diagramas SVG

Todos escritos a mano, con:

- `<defs><marker>` reales para las puntas de flecha, no caracteres tipográficos.
- `vector-effect="non-scaling-stroke"` para que el trazo no engorde al escalar.
- `pathLength` normalizado y `stroke-dasharray` para las animaciones de trazo.
- Animaciones disparadas por `IntersectionObserver` cuando la slide entra en viewport, y solo la primera vez.
- `role="img"` y `<title>`/`<desc>` en cada SVG para accesibilidad.

### Accesibilidad

- Contraste mínimo AA (4.5:1) verificado en ambos temas.
- `prefers-reduced-motion`: todas las animaciones se desactivan, los estados finales se aplican directo.
- Navegación completa por teclado.
- Foco visible en todos los controles.
- Cada slide es un `<section aria-label="...">`.
- Los estados de un paso (slide 17) son alcanzables con teclado, no solo con click.

### Impresión / PDF

`print.css` con `@page { size: 1920px 1080px; margin: 0 }`, una slide por página con `break-after: page`, animaciones desactivadas y estado final forzado. Permite "Imprimir → Guardar como PDF" y obtener un deck limpio.

---

## 9. Control de calidad

Antes de considerar la entrega terminada:

1. **Build limpio.** `node build.mjs` produce `dist/index.html` sin warnings.
2. **Render de las 27 slides.** Con Chrome DevTools, a 1600×900 y a 1280×720.
3. **Cero overflow.** Verificar que ningún elemento se sale de los 1920×1080 en cada slide.
4. **Cero errores de consola** en ninguna slide, en ambos temas.
5. **Contraste AA** verificado en dark y light.
6. **Navegación completa por teclado** en las 27 slides.
7. **Deep-link** `#/17` recarga correctamente.
8. **`prefers-reduced-motion`** no rompe ningún layout.
9. **PDF** exportado y revisado página por página.
10. **Offline real.** Abrir `dist/index.html` con el WiFi apagado y confirmar que no hay requests externos.

### QA de idioma (bloqueante)

11. **Barrido de texto visible.** Extraer todo el texto de las 27 slides y revisar que la prosa esté en español y que ningún término técnico haya sido traducido por accidente.
12. **Búsqueda de traducciones no deseadas.** `grep` de las formas que delatan una traducción forzada: `Anfitrión`, `Carga útil`, `Punto final`, `Herramientas MCP`, `Servidores MCP`, `Sin estado`. Si aparecen, se revierten al término en inglés.
13. **Búsqueda de fugas de inglés en la interfaz.** `grep` de `Next`, `Previous`, `Overview`, `Notes`, `Close`, `Loading`, `Click here`. La UI va en español; los términos técnicos no son UI.
14. **Verificar `lang="es"`** en el `<html>`, para que los lectores de pantalla y el corrector ortográfico del navegador usen español.
15. **Citas textuales.** Si una cita de la doc oficial está en inglés, se mantiene el original **y** se añade la traducción al español debajo, marcada como traducción propia.
16. **Revisión de modismos.** Confirmar que un hablante nativo de español no encuentre calcos del inglés ("hacer sentido", "asumir que", "eventualmente" por "finally").
17. **Prueba de lectura.** Leer una slide en voz alta: si suena a traducción automática en lugar a una explicación, se reescribe.

---

## 10. Reglas de honestidad intelectual

1. **Cada afirmación técnica tiene badge de fuente** que ancla a la slide 27.
2. **Las cifras llevan fecha y atribución.** "97M+ descargas mensuales" se presenta como *dato de Anthropic en diciembre de 2025*, no como verdad presente.
3. **No se inventan números.** No existe una cifra oficial de "empresas que usan MCP"; no se va a fabricar una.
4. **Lo deprecado se marca como deprecado**, no se omite ni se presenta como vigente.
5. **La analogía USB-C se presenta como analogía**, no como especificación.
6. **Si algo no se pudo verificar, se dice en la propia slide**, no se rellena con una aproximación plausible.
7. **El idioma no se improvisa.** La política de la sección 3 es vinculante: la explicación va en español y los términos técnicos se quedan en inglés. Nunca se inventa un equivalente castellano para un término que la industria usa en inglés.

### Puntos que quedaron explícitamente fuera por falta de verificación

- Cifra de adopción empresarial (no hay dato oficial).
- Comparación de rendimiento MCP vs integración directa (no hay benchmark oficial).
- Número exacto de servidores en el Registry a la fecha de hoy (el dato citado es de dic 2025).
- Detalle de la hoja de ruta futura más allá de lo publicado en el changelog.

---

## 11. Estado

- [x] Investigación de fuentes primarias
- [x] Búsqueda y evaluación de skills (Find Skills)
- [x] Definición de estructura de slides
- [x] Definición de dirección visual
- [x] Definición de stack técnico
- [x] Plan de QA
- [ ] Implementación
- [ ] Render y verificación visual
- [ ] Exportación a PDF
- [ ] README

**Siguiente paso:** construir `src/`, `build.mjs` y las 27 slides.
