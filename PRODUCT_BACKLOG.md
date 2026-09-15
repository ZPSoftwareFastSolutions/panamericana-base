# Product Backlog — Panamericana (MVP en 3 sprints)

> **Versión:** 1.0 · **Fecha:** 2026-09-15 · **Estado:** Aprobado para planificar el Sprint 2
> **Fuentes:** `PLANIFICACION.md` v0.4 · análisis deductivo-inductivo (fase alpha) · `PROPUESTA_BD.md` v1.0 · ADR-001, ADR-002, ADR-003
> **Documento interno del Repositorio 1.** Al equipo le llega como **tarjetas de Trello** (una por cada `PAN-xx`), nunca como archivo.

---

## 0. Cómo leer este documento

| Código | Qué es | Ejemplo |
|---|---|---|
| **E#** | Épica: un bloque grande de funcionalidad | `E5` Venta web con control de concurrencia |
| **HU-###** | Historia de usuario: *Como… quiero… para…* | `HU-020` Reservar asiento con retención temporal |
| **PAN-##** | Tarjeta de Trello: una tarea con **un solo responsable** | `PAN-21` Reservar asiento (API) — John |

| Campo | Valores |
|---|---|
| **Prioridad (MoSCoW)** | **Must** (sin esto no hay MVP) · **Should** (importante, entra si el sprint se cumple) · **Could** (deseable, fuera del compromiso) · **Won't** (fuera del MVP) |
| **Puntos** | Fibonacci: 1, 2, 3, 5, 8. Una historia de más de 8 se divide |
| **Estado** | ✅ Hecho · 🔄 En curso · ⏳ Pendiente · 🚫 Fuera del MVP |

---

## 1. Calendario y objetivo de cada sprint

| Sprint | Fechas | Estado | Objetivo (incremento) | Puntos comprometidos |
|---|---|---|---|---|
| **Sprint 1** | 08/09/2026 → 19/09/2026 | 🔄 En curso · confirmado | **Base operativa:** el equipo trabaja sobre la misma base, primeros catálogos (terminales, usuarios, clientes), maqueta del portal y primer despliegue en la nube | 34 |
| **Sprint 2** | 22/09/2026 → 03/10/2026 | ✅ Confirmado | **MVP 1 — Venta web con control de concurrencia en la nube:** el administrador programa rutas y viajes; el cliente busca, elige asiento por tramo, reserva y compra; es imposible vender dos veces el mismo asiento | 46 |
| **Sprint 3** | *06/10/2026 → 17/10/2026 (tentativo)* | ⚠️ **Sin confirmar por el docente** | **MVP 2 — Multicanal, control e IA:** taquilla, anulación, encomiendas, boleto con QR, panel de indicadores con predicción de demanda (machine learning) y PWA | 47 |

> **Regla de diseño del plan:** cada sprint termina con un incremento **demostrable por sí solo**. Si el Sprint 3 no se confirma o se acorta, el **MVP 1 del Sprint 2** es un producto completo que se puede presentar. Ver el plan de contingencia (sección 7).

### 1.1 Capacidad por integrante

Se compromete como máximo el **80 %** de la capacidad (regla 2.6 de `PLANIFICACION.md`). Los valores se recalibran en la Review del Sprint 1 con la velocidad real.

| Integrante | Dedicación | Puntos por sprint (80 %) |
|---|---|---|
| John | 100 % BE | 10 |
| Grisel | 50 % BE · 50 % FE | 10 |
| Brisa | 100 % FE | 10 |
| Karime | 100 % FE | 10 |
| Ángel | 40 % SM · 60 % BE | 6 |
| **Total** | | **46** |

El Sprint 1 compromete menos (34) porque ya estaba en curso cuando se cambió el calendario y es un sprint de aprendizaje.

---

## 2. Decisiones de alcance del MVP

Estas decisiones responden de forma **provisional** las preguntas abiertas de `PROPUESTA_BD.md` (sección 6) para que el MVP no quede bloqueado. **Ninguna requiere migración nueva.** El Product Owner puede cambiarlas después del MVP.

| # | Pregunta | Decisión para el MVP | Motivo |
|---|---|---|---|
| P5 | ¿Cuenta obligatoria para comprar por web? | **Compra como invitado**, con los datos del pasajero. La cuenta de cliente queda como *Could* (HU-008) | Menos dependencias en el Sprint 2 (`ventas.cliente_id` y `clientes.usuario_id` ya admiten nulos) |
| P6 | Minutos de retención del asiento | **10 minutos** (`MINUTOS_RESERVA_ASIENTO=10`) | Valor propuesto en ADR-001 |
| P8 | Métodos de pago | **Pago simulado**: web registra `tarjeta` y taquilla `efectivo`, ambos con estado `aprobado`. `referencia_externa` = `SIMULADO-<codigo>` | Una pasarela real (HU-032) no cabe en 3 sprints |
| P10 | ¿Se anulan pasajes? | **Sí, hasta 2 horas antes de la salida**, solo desde taquilla. El pago pasa a `reembolsado` como registro; la devolución de dinero es manual | Cubre el caso sin un flujo de devoluciones |
| P15 | ¿Tarifas por viaje o por ruta? | **Por viaje**, como está en el modelo | Sin cambios en la base |
| P17 | ¿Precio de un tramo? | **Proporcional al tiempo**: precio completo × (minutos del tramo ÷ duración total), redondeado a 0,50 | Se calcula con `rutas_paradas.minutos_desde_origen` |
| — | Canal móvil | **PWA** (portal web instalable). La app nativa queda fuera del MVP (HU-027) | Cumple "web y móvil" del título sin duplicar el frontend |
| — | Liberar reservas vencidas | **Al consultar o reservar**, no con una tarea programada | No depende de un cron (ver ADR-002) |

> ⚠️ **Pendiente de decisión (P12):** el modelo acepta `dni`, `ce` y `pasaporte`, con la regla "DNI de 8 dígitos". Esos son documentos de Perú; en Bolivia el documento es la **cédula de identidad (CI)**. Si el Product Owner confirma que el caso es La Paz, hace falta una migración que agregue `ci` a la lista permitida, antes de que Grisel cierre PAN-06 o como primera tarea del Sprint 2.

---

## 3. Épicas

| Épica | Nombre | Módulo del análisis deductivo | Prioridad | Sprints | Responsables |
|---|---|---|---|---|---|
| **E0** | Fundaciones y plataforma en la nube | Transversal (**cloud computing**) | Must | 1–2 | Ángel · John · todos |
| **E1** | Identidad y acceso | Transaccional e Interfaz de Usuario (autenticación y perfiles) | Must | 1–2 | John · Brisa |
| **E2** | Clientes | Transaccional e Interfaz de Usuario | Must | 1 | Grisel |
| **E3** | Terminales, flota y croquis de asientos | Operativo (configuración de flotas) | Must | 1–3 | Ángel · Grisel · Brisa |
| **E4** | Rutas, viajes y tarifas | Operativo (gestión de rutas y asignación de horarios) | Must | 2–3 | Ángel · Grisel · Brisa · Karime |
| **E5** | Venta web con control de concurrencia | Transaccional e Interfaz + **Concurrencia y Consistencia** | Must | 1–3 | John · Grisel · Karime |
| **E6** | Encomiendas | Sector: logística de encomiendas | Should | 3 | Grisel |
| **E7** | Taquilla (venta presencial) | Transaccional + Concurrencia (mismo inventario) | Must | 3 | John · Brisa |
| **E8** | Canal móvil | Transaccional e Interfaz de Usuario | Should | 3 | Karime |
| **E9** | Control, comprobantes y reportes | Control, Historial y Comprobantes | Should | 3 | Grisel · Brisa · Karime |
| **E10** | Calidad y endurecimiento | Transversal | Must | 3 | Karime · todos |
| **E11** | Inteligencia artificial | Inteligencia Artificial (**machine learning**) | Must | 3 | Ángel · John · Brisa |

> Se mantienen los códigos `E0`–`E10` de la versión anterior del roadmap para no romper referencias; se agrega **E11**.

---

## 4. Historias de usuario

### E0 — Fundaciones y plataforma en la nube

#### HU-001 · Entorno de desarrollo del equipo
**Como** integrante del equipo **quiero** levantar el proyecto conectado a la base de datos real **para** desarrollar todos sobre la misma base.
- `npm run db:verificar` responde "Conexion correcta" y lista 16 tablas.
- `/admin/buses` muestra los buses de prueba.
- Capturas de las dos pruebas en la tarjeta de Trello.

**Must · 5 pts (1 por integrante) · Sprint 1 · PAN-01 · 🔄**

#### HU-002 · Repositorio del equipo y tablero
**Como** Scrum Master **quiero** el repositorio del equipo con `main` protegida, una rama por integrante y el tablero de Trello **para** tener trazabilidad Épica → Historia → Tarjeta.
- Repositorio 2 creado según `REPLICACION_REPO2.md` (solo stack, sin `.md` internos).
- 5 ramas `dev/*`; `main` exige PR, CI en verde y 1 aprobación.
- Tablero con listas `To Do → In Progress → Review → Done` y las tarjetas del sprint.

**Must · 3 pts · Sprint 1 · PAN-02 · 🔄**

#### HU-003 · Integración continua y revisión de código
**Como** equipo **quiero** que cada PR ejecute lint, pruebas y build **para** que `main` nunca se rompa.
- La CI corre en cada PR y bloquea la fusión si falla.
- Cada PR del sprint tiene revisor asignado según la tabla 2.4.

**Must · 2 pts · Sprint 1 · PAN-05 · 🔄**

#### HU-004 · Despliegue en la nube
**Como** Product Owner **quiero** ver el sistema publicado en una URL de la nube **para** validar cada incremento sin instalar nada.
- ADR-002 aceptada con el resultado del spike (Vercel para web y API, Supabase para datos).
- La web y la API responden en URLs de staging; `/salud` devuelve `{"estado":"ok"}`.
- Las claves solo están en las variables de entorno del proveedor, nunca en el repositorio.
- Desde el Sprint 2, cada fusión a `main` despliega sola.

**Must · 4 pts · Sprints 1–2 · PAN-09 (S1), PAN-24 (S2) · 🔄**

### E1 — Identidad y acceso

#### HU-005 · Inicio de sesión y control por rol en el backoffice
**Como** usuario interno (administrador, vendedor o encargado de encomiendas) **quiero** iniciar sesión **para** acceder solo a las funciones de mi rol.
- La web inicia sesión con Supabase Auth y envía el token a la API.
- La API rechaza sin token (401) y con rol no permitido (403).
- `/admin/*` redirige al login si no hay sesión; el menú muestra solo las opciones del rol.
- Las rutas públicas de búsqueda y compra no piden sesión.

**Must · 6 pts · Sprint 2 · PAN-10, PAN-11 · ⏳**

#### HU-006 · Registro de usuarios internos
**Como** administrador **quiero** registrar y listar usuarios internos con su rol **para** controlar quién opera el sistema.
- Correo con formato válido y único (409 si se repite).
- `rol` solo `administrador`, `vendedor`, `encomiendas` o `cliente` (400 si no).
- En el MVP, la cuenta de acceso se crea en Supabase Auth y el `id` se copia al registro.

**Must · 3 pts · Sprint 1 · PAN-04 · 🔄**

#### HU-007 · Pantalla de usuarios internos
**Como** administrador **quiero** gestionar usuarios desde el backoffice **para** no depender del panel de Supabase.

**Could · 3 pts (estimado) · Sin sprint · ⏳**

#### HU-008 · Cuenta de cliente en el portal
**Como** cliente **quiero** crear una cuenta **para** ver mi historial de compras.

**Could · 5 pts (estimado) · Sin sprint · ⏳** (en el MVP se compra como invitado, decisión P5)

### E2 — Clientes

#### HU-009 · Registrar y consultar clientes
**Como** vendedor **quiero** registrar pasajeros, remitentes y destinatarios con su documento **para** no duplicarlos y reutilizarlos en ventas y encomiendas.
- `tipo_documento` solo en la lista permitida; no se repite tipo + número (409).
- Desde `/admin/clientes` se registra un cliente y aparece en la tabla.
- Existe una búsqueda por tipo y número de documento (la usan la compra y la taquilla).

**Must · 5 pts · Sprint 1 · PAN-06 · 🔄**

### E3 — Terminales, flota y croquis de asientos

#### HU-010 · Gestionar terminales
**Como** administrador **quiero** registrar y listar terminales **para** usarlas como paradas de las rutas.
- Nombre obligatorio y único (409).
- Pantalla `/admin/terminales` accesible desde el menú, con estados cargando, vacío y error.

**Must · 8 pts · Sprint 1 · PAN-03, PAN-07 · 🔄**

#### HU-011 · Gestionar buses
**Como** administrador **quiero** registrar y listar buses **para** asignarlos a viajes.

**Must · ✅ Hecho** (módulo de referencia construido el 11–12/09, antes del Sprint 1)

#### HU-012 · Croquis de asientos de un bus
**Como** administrador **quiero** definir los asientos de un bus (número, piso, fila, columna y tipo) **para** que el cliente vea el croquis real al comprar.
- La API genera un croquis estándar (filas × columnas por piso) y permite registrar asientos sueltos.
- No se repite `numero` ni la posición (`piso`, `fila`, `columna`) en el mismo bus (409).
- *Sprint 3:* editor visual que cambia el tipo de cada asiento (`normal`, `semicama`, `cama`).

**Must · 4 pts · Sprints 2–3 · PAN-12 (S2), PAN-37 (S3) · ⏳**

#### HU-013 · Choferes y tripulación
**Como** administrador **quiero** registrar choferes y asignarlos a viajes **para** que ningún viaje salga sin conductor habilitado.
- Licencia vigente; un chofer no se asigna a dos viajes con horario cruzado.

**Could · 5 pts (estimado) · Sin sprint · ⏳**

### E4 — Rutas, viajes y tarifas

#### HU-014 · Rutas con paradas
**Como** administrador **quiero** registrar rutas con paradas ordenadas **para** vender pasajes por tramo.
- Una ruta tiene al menos 2 paradas; `orden` y `terminal_id` no se repiten dentro de la ruta.
- `minutos_desde_origen` crece con el orden; la última parada coincide con `duracion_estimada_min`.
- Pantalla para crear la ruta y ordenar sus paradas.

**Must · 8 pts · Sprint 2 · PAN-13, PAN-14 · ⏳**

#### HU-015 · Programar viajes
**Como** administrador **quiero** programar un viaje con ruta, bus, fecha de salida y precio base **para** ponerlo a la venta.
- El bus debe estar `activo` y no tener otro viaje con horario cruzado (409).
- `fecha_llegada_estimada` se calcula con la duración de la ruta y es posterior a la salida.
- El viaje nace `programado`; la pantalla lista los viajes por fecha.

**Must · 6 pts · Sprint 2 · PAN-15, PAN-16 · ⏳**

#### HU-016 · Tarifas por tipo de asiento
**Como** administrador **quiero** definir el precio por tipo de asiento de cada viaje **para** cobrar distinto la cama y la semicama.
- Un solo precio por viaje + tipo; precio mayor que 0.
- Si no hay tarifa para un tipo, se usa `precio_base`.
- El croquis y el checkout muestran el precio del asiento, calculado por tramo (decisión P17).

**Should · 5 pts · Sprint 3 · PAN-35, PAN-36 · ⏳**

### E5 — Venta web con control de concurrencia

#### HU-017 · Portal público con buscador
**Como** cliente **quiero** una portada con un buscador de viajes **para** empezar mi compra desde el celular o la computadora.
- Buscador con origen, destino y fecha; valida que origen y destino sean distintos.
- Se ve bien en celular y en computadora.

**Must · 5 pts · Sprint 1 · PAN-08 · 🔄**

#### HU-018 · Buscar viajes disponibles
**Como** cliente **quiero** buscar viajes por origen, destino y fecha **para** ver horarios y precios.
- La búsqueda encuentra viajes cuya ruta pasa por el origen **antes** que por el destino (incluye tramos intermedios).
- Solo muestra viajes `programados` y con salida futura.
- Cada resultado muestra hora de paso por el origen, llegada estimada al destino, precio del tramo y asientos libres.

**Must · 4 pts · Sprint 2 · PAN-17, PAN-18 · ⏳**

#### HU-019 · Ver disponibilidad y elegir asiento por tramo
**Como** cliente **quiero** ver en el croquis qué asientos están libres **para mi tramo** **para** elegir uno.
- Un asiento es libre si no tiene un pasaje `reservado` vigente o `pagado` cuyo tramo se cruce con el elegido.
- Las reservas vencidas se muestran como libres.
- El croquis respeta pisos, filas y columnas, y distingue libre, ocupado y seleccionado.

**Must · 8 pts · Sprint 2 · PAN-19, PAN-20 · ⏳**

#### HU-020 · Reservar asiento con retención temporal
**Como** cliente **quiero** que mi asiento quede retenido mientras pago **para** que nadie me lo quite.
- Al continuar al pago se crean la venta `pendiente` y los pasajes `reservado` con `reservado_hasta` = ahora + 10 min.
- Antes de reservar, las reservas vencidas del viaje pasan a `expirado`.
- **Tres defensas (ADR-001):** retención temporal, `select ... for update` en la transacción y la restricción `pasajes_asiento_sin_traslape`.
- Si el asiento ya no está libre, la API responde **409 `asiento_no_disponible`** y no crea nada.
- **Prueba de aceptación:** un script lanza dos reservas simultáneas del mismo asiento con tramos cruzados → una 201 y una 409. Con tramos que no se cruzan → dos 201.

**Must · 5 pts · Sprint 2 · PAN-21 · ⏳**

#### HU-021 · Confirmar compra y obtener pasaje
**Como** cliente **quiero** ingresar los datos del pasajero, pagar y recibir el código de mi pasaje **para** poder viajar.
- El checkout pide los datos del pasajero; si ya existe por documento, se reutiliza (HU-009).
- Pago simulado (decisión P8): pago `aprobado`, venta `pagada` y pasajes `pagado`, todo en una transacción.
- Si la reserva venció, la API responde **409 `reserva_expirada`** y la web ofrece volver al croquis.
- La confirmación muestra el código de la venta y de cada pasaje.
- La web maneja el 409: avisa y refresca el croquis.

**Must · 6 pts · Sprint 2 · PAN-22, PAN-23 · ⏳**

#### HU-022 · Prueba automatizada de compras simultáneas
**Como** equipo **quiero** una prueba automatizada que demuestre que no hay doble venta **para** detectar cualquier regresión en la concurrencia.
- Prueba de integración contra la base con N reservas simultáneas del mismo asiento y tramo: exactamente 1 éxito.
- Casos de tramos cruzados y no cruzados.
- Documenta cómo ejecutarla (no corre en la CI si necesita la base real).

**Must · 3 pts · Sprint 3 · PAN-25 · ⏳**

### E6 — Encomiendas

#### HU-023 · Registrar y dar seguimiento a encomiendas
**Como** encargado de encomiendas **quiero** registrar un envío y actualizar su estado **para** saber siempre dónde está y responder reclamos.
- Registro con remitente, destinatario, terminales de origen y destino, descripción, peso (mayor que 0) y costo; genera `codigo_seguimiento` único.
- Estados: `registrada → en_transito → en_destino → entregada` (o `cancelada`); no se permiten saltos inválidos.
- Cada cambio guarda una fila en `historial_encomiendas` con usuario y observación.
- Consulta pública por código de seguimiento que muestra estado e historial.

**Should · 8 pts · Sprint 3 · PAN-33, PAN-34 · ⏳**

### E7 — Taquilla

#### HU-024 · Vender pasajes en taquilla
**Como** vendedor **quiero** vender pasajes presenciales sobre el **mismo inventario** que la web **para** que nunca se crucen las ventas de los dos canales.
- Reutiliza los casos de uso de HU-020 y HU-021 con `canal = 'taquilla'`, `usuario_id` del vendedor y pago `efectivo`.
- La pantalla reutiliza el croquis y maneja el 409 igual que la web.
- Solo el rol `vendedor` o `administrador` accede.

**Must · 7 pts · Sprint 3 · PAN-30, PAN-31 · ⏳**

#### HU-025 · Anular pasajes
**Como** vendedor **quiero** anular un pasaje por su código **para** liberar el asiento cuando el pasajero no viaja.
- Solo hasta 2 horas antes de la salida (decisión P10).
- El pasaje pasa a `anulado`, el asiento queda libre y el pago se marca `reembolsado`.
- Incluye la consulta de un pasaje por código (la usa también HU-028).

**Should · 3 pts · Sprint 3 · PAN-32 · ⏳**

### E8 — Canal móvil

#### HU-026 · Portal instalable en el celular (PWA)
**Como** cliente **quiero** instalar el portal en mi celular **para** comprar como en una aplicación.
- Manifiesto con nombre, íconos y color; se instala desde el navegador en Android.
- El flujo de compra funciona completo en una pantalla de 375 px.

**Should · 2 pts · Sprint 3 · PAN-39 · ⏳**

#### HU-027 · Aplicación móvil nativa
**Won't · 🚫 Fuera del MVP** (épica posterior si el proyecto continúa)

### E9 — Control, comprobantes y reportes

#### HU-028 · Boleto electrónico con QR y consulta por código
**Como** cliente **quiero** un boleto electrónico con código QR **para** mostrarlo al abordar.
- El boleto muestra pasajero, viaje, tramo, asiento, precio y un QR con el código del pasaje.
- Vista imprimible.
- Consulta pública del pasaje ingresando su código.

**Should · 3 pts · Sprint 3 · PAN-38 · ⏳**

#### HU-029 · Panel de indicadores
**Como** administrador **quiero** ver ventas, ingresos y ocupación por viaje y por ruta **para** tomar decisiones con datos.
- Filtros por rango de fechas y ruta.
- Indicadores: pasajes vendidos, ingresos, ocupación (%) por viaje y ventas por canal.
- Incluye el gráfico de predicción de HU-033.

**Should · 5 pts · Sprint 3 · PAN-29, PAN-28 · ⏳**

### E10 — Calidad y endurecimiento

#### HU-030 · Pruebas de humo en staging y checklist de seguridad
**Como** equipo **quiero** verificar el flujo completo en la nube antes de la demo **para** presentar un MVP estable.
- Guion de humo ejecutado en staging: buscar → elegir asiento → reservar → pagar → boleto, más taquilla y encomienda.
- Checklist: RLS activo en las 16 tablas, sin claves en el repositorio, CORS limitado al dominio de la web y rutas `/admin` protegidas.
- Los defectos encontrados se registran como tarjetas.

**Must · 3 pts · Sprint 3 · PAN-40 · ⏳**

#### HU-031 · Validación automática del SQL
**Could · 2 pts (estimado) · Sin sprint · ⏳** (sqlfluff en la CI para la regla R1)

#### HU-032 · Pasarela de pago real
**Won't · 🚫 Fuera del MVP**

### E11 — Inteligencia artificial

#### HU-033 · Predicción de demanda por ruta
**Como** administrador **quiero** ver la demanda estimada de pasajes por ruta para los próximos días **para** decidir a tiempo si programo buses de refuerzo.
- **Datos:** dataset histórico de al menos 12 meses por ruta, con estacionalidad (día de la semana, mes, feriados bolivianos). En el MVP es **sintético y se declara así** en el documento; se reentrena con ventas reales cuando existan. No se carga a la base compartida.
- **Modelo:** regresión lineal múltiple (aprendizaje supervisado) entrenada en un notebook de Python con scikit-learn, con partición entrenamiento/prueba y métricas **MAE, RMSE y R²** reportadas.
- **Integración:** los coeficientes se exportan a JSON y la API los usa en un caso de uso de predicción; la API no ejecuta Python.
- **Salida:** pasajes estimados por ruta y día para los próximos 7 días; alerta de "refuerzo sugerido" cuando la demanda estimada supera el 90 % de la capacidad programada.

**Must · 6 pts · Sprint 3 · PAN-26, PAN-27 (+ gráfico en PAN-28) · ⏳**

#### HU-034 · Asistente virtual de preguntas frecuentes (chatbot)
**Como** cliente **quiero** preguntar por horarios, equipaje, anulaciones y encomiendas **para** resolver dudas sin ir a la terminal.
- Usa un modelo de lenguaje por API **desde el backend** (la clave nunca llega a la web).
- Responde solo con la información pública del sistema (preguntas frecuentes y viajes programados); no accede a datos personales.

**Could · 5 pts (estimado) · Sin sprint · ⏳** — complementa a HU-033, **no la reemplaza** (ver `PLANIFICACION.md`, sección 9).

---

## 5. Sprint backlogs

### 5.1 Sprint 1 — 08/09 → 19/09 · Base operativa

Detalle de cada tarjeta: `docs/guias-sprint/GUIA_SPRINT_01.md`.

**Tablero de Trello (creado el 15/09):** https://trello.com/b/ida3R2kt/panamericana — listas `To Do → In Progress → Review → Done`, 9 tarjetas con fecha límite 19/09 y checklist de criterios de aceptación. PAN-01 y PAN-02 en *In Progress*. Las tarjetas no mencionan documentos internos.

| Tarjeta | Responsable | Trabajo | HU | Pts |
|---|---|---|---|---|
| PAN-01 | Todos | Entorno levantado y conectado a la base | HU-001 | 1 c/u |
| PAN-02 | Ángel | Repositorio 2, ramas, colaboradores y tablero de Trello | HU-002 | 3 |
| PAN-03 | Ángel | Módulo `terminales` (API) | HU-010 | 3 |
| PAN-04 | John | Módulo `usuarios` (API) | HU-006 | 3 |
| PAN-05 | John | Revisión de PR y CI en verde | HU-003 | 2 |
| PAN-06 | Grisel | Módulo `clientes` de punta a punta | HU-009 | 5 |
| PAN-07 | Brisa | Pantalla de terminales y menú lateral | HU-010 | 5 |
| PAN-08 | Karime | Portal público y maqueta del buscador | HU-017 | 5 |
| PAN-09 | John | Spike de despliegue: ADR-002 y primer despliegue en Vercel | HU-004 | 3 |

### 5.2 Sprint 2 — 22/09 → 03/10 · MVP 1

| Tarjeta | Responsable | Trabajo | HU | Pts | Depende de |
|---|---|---|---|---|---|
| PAN-10 | John | Autenticación en la API: validar el token de Supabase y los roles | HU-005 | 3 | — |
| PAN-11 | Brisa | Login del backoffice y protección de `/admin` por rol | HU-005 | 3 | PAN-10 (contrato) |
| PAN-12 | Grisel | Croquis de asientos de un bus (API) | HU-012 | 2 | — |
| PAN-13 | Ángel | Rutas con paradas (API) | HU-014 | 5 | PAN-03 |
| PAN-14 | Brisa | Pantalla de rutas y paradas | HU-014 | 3 | PAN-13 (contrato) |
| PAN-15 | Grisel | Programación de viajes (API) | HU-015 | 3 | PAN-13 |
| PAN-16 | Brisa | Pantalla de programación de viajes | HU-015 | 3 | PAN-15 (contrato) |
| PAN-17 | Grisel | Búsqueda de viajes por origen, destino y fecha (API) | HU-018 | 2 | PAN-15 |
| PAN-18 | Karime | Buscador conectado a la API y lista de resultados | HU-018 | 2 | PAN-17 (contrato) |
| PAN-19 | Grisel | Disponibilidad de asientos por tramo (API) | HU-019 | 3 | PAN-12, PAN-15 |
| PAN-20 | Karime | Croquis interactivo para elegir asiento por tramo | HU-019 | 5 | PAN-19 (contrato) |
| PAN-21 | John | Reservar asiento con retención y control de concurrencia (API) | HU-020 | 5 | PAN-19 |
| PAN-22 | John | Confirmar compra con pago simulado y emitir pasajes (API) | HU-021 | 3 | PAN-21 |
| PAN-23 | Karime | Checkout: datos del pasajero, pago simulado, confirmación y manejo del 409 | HU-021 | 3 | PAN-21, PAN-22 (contrato) |
| PAN-24 | Ángel | Despliegue automático de staging desde `main` | HU-004 | 1 | PAN-09 |

**Orden sugerido para no bloquear al frontend:**
1. **Días 1–2:** cada backend declara sus endpoints y tipos en `shared/src/` y abre ese PR primero (en el repositorio del equipo no existe `docs/`). El frontend trabaja contra el contrato (estado de error sin romperse, como en PAN-07).
2. **Días 3–7:** implementación del backend en paralelo, siguiendo la cadena PAN-13 → PAN-15 → PAN-19 → PAN-21 → PAN-22.
3. **Días 8–10:** integración web + API en staging y prueba de dos reservas simultáneas (criterio de HU-020).

### 5.3 Sprint 3 — 06/10 → 17/10 (tentativo) · MVP 2

| Tarjeta | Responsable | Trabajo | HU | Pts | Depende de |
|---|---|---|---|---|---|
| PAN-25 | John | Prueba automatizada de compras simultáneas | HU-022 | 3 | PAN-21 |
| PAN-26 | Ángel | Dataset histórico y entrenamiento del modelo de regresión (notebook + JSON) | HU-033 | 3 | — (**entregar en la semana 1**) |
| PAN-27 | John | Caso de uso y endpoint de predicción de demanda | HU-033 | 3 | PAN-26 |
| PAN-28 | Brisa | Panel de indicadores con gráfico de predicción | HU-029 | 3 | PAN-27, PAN-29 (contrato) |
| PAN-29 | Grisel | Métricas del panel: ventas, ingresos y ocupación (API) | HU-029 | 2 | PAN-22 |
| PAN-30 | John | Venta en taquilla (API) | HU-024 | 2 | PAN-22 |
| PAN-31 | Brisa | Pantalla de taquilla con croquis y botón de anulación | HU-024 | 5 | PAN-30, PAN-32 (contrato) |
| PAN-32 | John | Consultar y anular pasaje por código (API) | HU-025 | 3 | PAN-22 |
| PAN-33 | Grisel | Encomiendas: registro, estados, historial y seguimiento (API) | HU-023 | 5 | PAN-06 |
| PAN-34 | Grisel | Pantallas de encomiendas y consulta por código | HU-023 | 3 | PAN-33 (contrato) |
| PAN-35 | Ángel | Tarifas por tipo de asiento (API) | HU-016 | 3 | PAN-15 |
| PAN-36 | Karime | Precio por tipo de asiento en el croquis y el checkout | HU-016 | 2 | PAN-35 (contrato) |
| PAN-37 | Brisa | Editor de croquis de asientos | HU-012 | 2 | PAN-12 |
| PAN-38 | Karime | Boleto electrónico con QR y consulta por código | HU-028 | 3 | PAN-32 (contrato) |
| PAN-39 | Karime | Portal instalable como aplicación (PWA) | HU-026 | 2 | — |
| PAN-40 | Karime | Pruebas de humo en staging y checklist de seguridad | HU-030 | 3 | Todas (últimos días) |

---

## 6. Carga por integrante

| Integrante | Capacidad | Sprint 1 | Sprint 2 | Sprint 3 |
|---|---|---|---|---|
| John | 10 | 9 | 11 | 11 |
| Grisel | 10 | 6 | 10 (solo BE) | 10 |
| Brisa | 10 | 6 | 9 | 10 |
| Karime | 10 | 6 | 10 | 10 |
| Ángel | 6 | 7 | 6 | 6 |
| **Total** | **46** | **34** | **46** | **47** |

**Ajustes respecto al *ownership* de `PLANIFICACION.md` (2.1):**
- **Grisel apoya Operaciones en el Sprint 2** (croquis, viajes, búsqueda y disponibilidad), porque sus módulos propios (encomiendas y reportes) son del Sprint 3 y Ángel tiene solo 6 puntos. En el Sprint 2 hace solo backend; lo compensa en el Sprint 3.
- **Ángel entrena el modelo de IA (PAN-26):** es trabajo de análisis de datos, sin integración con el resto, compatible con su rol de Scrum Master.
- **John queda 1 punto sobre su capacidad** en los Sprints 2 y 3 (10 %), dentro de la regla de diferencia de carga ≤ 30 %. Si se atrasa, PAN-25 pasa a Grisel.

---

## 7. Plan de contingencia

### 7.1 Si el Sprint 3 no se confirma

- El entregable es el **MVP 1** (Sprint 2): venta web por tramos con control de concurrencia, backoffice con login y despliegue en la nube. **Cumple el requisito de tecnología emergente con cloud computing.**
- La predicción de demanda es parte del **título**: si no hay Sprint 3, PAN-26 y PAN-27 se ejecutan igual como tarea de cierre (6 puntos), para sostener el título y el componente de machine learning.
- En el documento del proyecto, taquilla, encomiendas y reportes pasan a **1.6.2 Límites** como trabajo futuro.

### 7.2 Si el Sprint 3 se acorta (por ejemplo, a una semana)

Se ejecuta en este orden y se corta donde se acabe el tiempo:

| Orden | Tarjetas | Por qué primero |
|---|---|---|
| 1 | PAN-25 | Prueba el requisito crítico (sin doble venta) |
| 2 | PAN-26, PAN-27, PAN-28 | Predicción de demanda: está en el título y es el machine learning |
| 3 | PAN-30, PAN-31, PAN-32 | Taquilla: demuestra la concurrencia entre canales |
| 4 | PAN-38 | Boleto con QR: cierra la experiencia de compra |
| 5 | PAN-33, PAN-34 | Encomiendas |
| 6 | PAN-29, PAN-35, PAN-36, PAN-37, PAN-39 | Mejoras |
| Siempre | PAN-40 | Sin pruebas de humo no hay demo |

### 7.3 Si una tarjeta del Sprint 1 no se termina

Pasa **al inicio** del Sprint 2 con prioridad máxima, y se retira del Sprint 2 una tarjeta del mismo responsable de igual tamaño, empezando por las que no bloquean a nadie (por ejemplo, PAN-24 o PAN-16).

---

## 8. Fuera del compromiso del MVP

| HU | Nombre | Prioridad | Motivo |
|---|---|---|---|
| HU-007 | Pantalla de usuarios internos | Could | Se opera desde la API y Supabase |
| HU-008 | Cuenta de cliente | Could | Compra como invitado (P5) |
| HU-013 | Choferes y tripulación | Could | Tablas listas; no bloquea la venta |
| HU-031 | Validación automática del SQL | Could | La regla R1 se revisa en cada PR |
| HU-034 | Chatbot de preguntas frecuentes | Could | Complementa a la IA; entra si sobra capacidad |
| HU-027 | App móvil nativa | Won't | La PWA cubre el canal móvil |
| HU-032 | Pasarela de pago real | Won't | Pago simulado (P8) |

---

## 9. Trazabilidad

### 9.1 Con la problemática (1.2.3 del documento del proyecto)

| Problema específico | Historias que lo atacan |
|---|---|
| 1. Doble venta de asientos por concurrencia | HU-019, HU-020, HU-021, HU-022, HU-024 |
| 2. Venta descentralizada y tiempos de espera | HU-017, HU-018, HU-024, HU-026 |
| 3. Gestión operativa dispersa | HU-010, HU-011, HU-012, HU-014, HU-015 (y HU-013) |
| 4. Tarifas inconsistentes | HU-016 |
| 5. Encomiendas sin trazabilidad | HU-023 |
| 6. Falta de planificación ante la demanda | HU-033, HU-029 |
| 7. Información poco confiable para control | HU-005, HU-006, HU-009, HU-025, HU-028, HU-029 |

### 9.2 Con los módulos del análisis deductivo (fase alpha)

| Módulo original | Submódulos del análisis | Épicas e historias actuales |
|---|---|---|
| Operativo | Gestión de rutas · asignación de horarios · configuración de flotas | E3, E4 (HU-010 a HU-016) |
| Transaccional e Interfaz de Usuario | Autenticación y perfiles · búsqueda avanzada · selección gráfica de asientos | E1, E2, E5, E8 (HU-005, HU-006, HU-009, HU-017 a HU-021, HU-026) |
| Concurrencia y Consistencia | Prevención de sobreventa · control transaccional · bloqueo temporal | E5, E7 (HU-020, HU-021, HU-022, HU-024) |
| Inteligencia Artificial | Datos históricos · modelo de regresión · reportes estratégicos | E11, E9 (HU-033, HU-029; HU-034 opcional) |
| Control, Historial y Comprobantes | Registro histórico · comprobantes con QR · paneles de control | E9, E6 (HU-023, HU-025, HU-028, HU-029) |

---

## 10. Mantenimiento del backlog

| Cuándo | Qué se hace | Quién |
|---|---|---|
| Refinamiento (mitad de sprint) | Revisar criterios y estimaciones del sprint siguiente | Ángel con el equipo |
| Sprint Review | Marcar ✅ lo aceptado; recalibrar la capacidad (1.1) con la velocidad real | Ángel |
| Cambio de fechas o alcance | Actualizar la sección 1, `PLANIFICACION.md` (7.1) y la guía del sprint | Ángel + John |
| Nueva tarjeta | Numerar desde `PAN-41`; toda tarjeta pertenece a una HU | Ángel |
