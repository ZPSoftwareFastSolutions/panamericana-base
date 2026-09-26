# Informe de calidad y cumplimiento legal — Panamericana

> **Fecha:** 26/09/2026 · **Rama:** `calidad-y-legal` (desde `sprint04`) · **Documento interno** de `panamericana-base`.
> **Alcance:** verificación completa del sistema (portal, panel y API) con el modelo de datos v2.0 + migración 12, y revisión de la normativa boliviana aplicable.
> **Aviso:** esta revisión es técnica. Los documentos legales publicados son una base sólida, pero **deben revisarlos un abogado boliviano y la empresa** antes del despliegue oficial.

---

## 1. Resumen

| Área | Resultado |
|---|---|
| Pruebas unitarias | ✅ 119/119 |
| Pruebas de integración (base real) | ✅ 3/3 (20 compras simultáneas del mismo asiento → gana 1) |
| Aceptación del incremento | ✅ 31/31 (`docs/pruebas/aceptacion_calidad.mjs`) |
| Regresión | ✅ Sprint 2: 60/60 · Sprint 3: 52/52 · Incremento 4: 22/22 |
| Prueba de humo | ✅ "Todo en orden" (incluye tarifas y consentimiento) |
| Revisión de seguridad | ✅ 15/15 en desarrollo (3 controles legales nuevos); en producción **bloquea** mientras falten los datos de la empresa, como se decidió |
| Accesibilidad (axe-core 4.13, WCAG 2.2 A/AA + buenas prácticas) | ✅ 0 violaciones en 24 pantallas (14 del portal y 10 del panel) |
| Contraste (verificador propio, ver §4) | ✅ 0 textos por debajo de 4,5:1 (3:1 en texto grande) |
| Celular (375 px) | ✅ Sin desplazamiento horizontal en ninguna pantalla (se corrigieron 3) |
| Cookies y terceros | ✅ Sin cookies, sin almacenamiento en el portal, sin recursos de otros sitios |
| Lint, tipos y build | ✅ |
| Base de datos tras las pruebas | ✅ Igual que antes (las pruebas borran lo que crean) |

---

## 2. Normativa verificada y cómo la cumple el sistema

| Norma | Qué exige | Cómo se cumple | Estado |
|---|---|---|---|
| **Constitución Política del Estado** (art. 21 y 130) | Derecho a la privacidad; Acción de Protección de Privacidad | Política de Privacidad con los derechos y la vía constitucional | ✅ |
| **Ley 164 y DS 1793** (reglamento, art. 56) | Conocimiento previo y **consentimiento expreso** (por escrito o medio equiparable) para tratar datos; transferir solo con consentimiento u orden judicial; derechos de acceso, rectificación, actualización, cancelación y oposición | Casilla obligatoria en el portal; la API rechaza la venta sin `acepta_condiciones`; Política de Privacidad con finalidades, destinatarios, responsable y derechos | ✅ (ver §7.2 sobre la taquilla) |
| **Ley de datos personales** | — | Bolivia **no tiene** todavía una ley específica: hay un anteproyecto de AGETIC (2024–2025). La política se redactó para seguir sus principios y dice "y las normas que las complementen o reemplacen" | ⚠️ Revisar si se aprueba |
| **Ley 453 y DS 2130** (derechos del consumidor) | Información veraz, completa y oportuna antes de comprar; reclamos | Precios en Bs antes de confirmar, total con descuentos, pago simulado **declarado**, Términos y Reembolsos públicos, canal de reclamos | ✅ |
| **Reglamento de transporte terrestre de pasajeros (ATT)** | Datos del operador y del pasajero en el boleto, equipaje de 20 kg sin costo, devolución ≥ 85 % hasta 2 h antes (art. 78), 100 % si el operador cancela o se demora más de 30 min, menores (art. 81), lista de pasajeros | Boleto con operador, pasajero, tramo, hora, asiento, placa, tarifa y precio; reembolso del **100 %** hasta 2 h antes (mejor que el mínimo); Términos y Reembolsos con los derechos por cancelación y demora | ✅ con pendientes de §7 |
| **Ley 1886, art. 6** (adulto mayor) | 20 % de descuento por viaje en transporte interdepartamental, personal, presentando la cédula; si no se aplica, el operador devuelve el doble | Tarifa `adulto_mayor` (20 %), el boleto indica presentar la cédula | ✅ |
| **Ley 223 y DS 1893, art. 34** (discapacidad) | Tarifa preferencial regulada por la ATT: 50 % para discapacidad grave o muy grave | Tarifa `discapacidad` (50 % sobre el precio del pasaje); carnet al subir; no se guarda el número del carnet | ✅ (ver §7.1) |
| **Reglamento de la ATT, art. 81** (menores) | Hasta 3 años gratis en el asiento del adulto; de 3 a 12 años 50 % con asiento propio; identidad del menor en la lista | Tarifa `menor` (50 %); los Términos explican el viaje gratis en brazos | ✅ |
| **Ley 548** (Código Niña, Niño y Adolescente) | Autorización de viaje de menores cuando corresponda | Mencionada en los Términos | ✅ |

---

## 3. Lo que se agregó o corrigió

**Legal**
- Cuatro documentos: **Términos y Condiciones**, **Política de Privacidad**, **Política de Reembolsos** y **Política de Cookies**, enlazados en el pie de todo el portal.
- **Consentimiento:** casilla obligatoria en la compra (portal), confirmación del vendedor en taquilla, casilla de información en clientes y encomiendas. La API responde 400 sin consentimiento **antes** de consultar el viaje.
- **Tarifas diferenciadas de ley** (migración 12): catálogo, precio con descuento calculado solo en la API (`precios_por_tarifa`), tarifa y documento a presentar en el detalle, el boleto y la taquilla.
- **Datos del operador** en el boleto y el pie desde un único archivo (`shared/src/negocio.ts`); si faltan se ven como `[por completar]` y el sitio oficial no se construye.
- **Datos mínimos:** el registro de clientes deja de pedir y mostrar la fecha de nacimiento (ningún proceso la usa).
- **Afirmaciones sin respaldo:** la portada decía "y más destinos" (solo hay 3 ciudades) y "sin filas"; se reemplazaron por lo que el sistema hace. No había reseñas ni testimonios.
- **Derechos de autor de imágenes:** el `favicon.ico` era el **logo de Vercel** que trae la plantilla de Next.js; se reemplazó por el ícono propio del bus. Los demás íconos (`web/public/`) son propios, dibujados para el proyecto. El portal no usa fotos ni fuentes externas.

**Accesibilidad y calidad de la interfaz** (guía UI/UX Pro Max: prioridades 1, 2, 5, 6 y 8)
- Todos los campos con etiqueta visible; ayuda y error enlazados con `aria-describedby`; el formulario de buses usaba solo `placeholder`.
- Foco visible en todo el sistema (se quitó `focus:outline-none`), enlace "Saltar al contenido", `lang="es-BO"`, títulos por página.
- Contraste: textos de `slate-400/500` pasados a `slate-600` donde no alcanzaban; barras del gráfico de `#94a3b8` (2,4:1) a `slate-500`; borde de los campos a `slate-500` (3:1).
- Botones y enlaces de acción de 44 px; asientos del croquis con precio en su nombre accesible y el ocupado tachado (no solo por color).
- Gráficos con tabla oculta para lectores de pantalla; íconos y flechas decorativas con `aria-hidden`.
- Movimiento reducido (`prefers-reduced-motion`) y texto de los campos de ejemplo con contraste.
- Celular: tres pantallas del panel se desbordaban (grilla con `1fr`, tabla oculta del gráfico y textos `sr-only` que escapaban de las tablas); corregido en la raíz.
- **Textos con tildes** en toda la web (etiquetas, mensajes, títulos) y 92 textos del backend: mensajes de la API y nombres de pruebas ("Número", "Código", "sesión", "está").

**Buscadores**
- `robots.txt` y mapa del sitio **cerrados** hasta configurar el dominio oficial (`NEXT_PUBLIC_SITIO_URL`); `noindex` en el panel, compras, boletos, encomiendas por código e inicio de sesión.

---

## 4. Cómo se verificó

- **axe-core 4.13.0** (el que ya instala el plugin de accesibilidad de ESLint), inyectado en cada pantalla desde un servidor local temporal. Su regla de contraste se desactivó porque Tailwind 4 genera colores `lab()` que axe no interpreta (daba un falso positivo en la cabecera).
- **Contraste propio:** cada texto visible se convirtió a RGB con un `canvas`, se mezclaron los fondos semitransparentes y se calculó la razón WCAG (4,5:1; 3:1 en texto grande). 0 textos por debajo.
- **Terceros y almacenamiento:** `document.cookie`, `localStorage` y la lista de recursos cargados en cada pantalla. El portal no carga nada de otro sitio; el panel solo guarda la sesión del personal (estrictamente necesaria).
- **Panel:** con una sesión de prueba inyectada y retirada al terminar.
- **Compra real en el navegador:** dos asientos, uno con tarifa de adulto mayor; el total (Bs 85,50) coincidió con el cobro de la API; se borró al terminar.
- **Búsqueda de rastros internos** en el código del equipo: limpio (se quitaron dos códigos `HU-` de comentarios; ver `CORRECCIONES_04.md`).
- **Revisión de código** del cambio completo: 1 hallazgo corregido (la web recalculaba el descuento; ahora lo informa la API, regla "una regla, un lugar").

---

## 5. Cookies: ¿hace falta un aviso de consentimiento?

**No.** El portal no usa cookies ni analíticas, publicidad o redes sociales. Solo usa almacenamiento **estrictamente necesario**: la sesión del personal en el panel y la caché de archivos de la aplicación (sin datos personales). La Política de Cookies lo explica y promete pedir consentimiento **antes** de activar cualquier herramienta de analítica. `npm run prueba:seguridad` falla si aparece un script de terceros, para que esa promesa no se rompa sin querer.

---

## 6. Buscadores (cuando haya dominio)

1. Configurar `NEXT_PUBLIC_SITIO_URL` con el dominio oficial en Vercel (solo producción).
2. Completar `shared/src/negocio.ts` (si no, el build falla).
3. Verificar `https://<dominio>/robots.txt` y `/sitemap.xml`, y registrar el sitio en Google Search Console.

---

## 7. Pendientes y recomendaciones (no bloquean la demo)

| # | Tema | Por qué | Recomendación |
|---|---|---|---|
| 7.1 | Descuento por discapacidad "sobre la tarifa máxima de referencia" | La ATT describe el 50 % sobre la tarifa máxima de referencia; el sistema lo aplica sobre el precio del pasaje | Como el precio no puede superar esa tarifa, el pasajero paga igual o menos. Confirmar con la ATT |
| 7.2 | Consentimiento en taquilla | El DS 1793 pide consentimiento "por escrito o medio equiparable"; en taquilla lo confirma el vendedor | Tener impresa la Política de Privacidad en la boletería o imprimir el aviso en el boleto |
| 7.3 | **Facturación (SIN)** | Las ventas deben facturarse; el sistema no emite facturas | Integrar facturación en línea con el SIN o emitirla por el sistema actual de la empresa |
| 7.4 | Cancelación o demora del operador | Los Términos prometen 100 %; el sistema solo anula hasta 2 h antes | Mientras no exista, la taquilla devuelve en efectivo y lo registra aparte |
| 7.5 | Venta en línea | Un protocolo de la ATT de 2020 hablaba de venta solo en boletería | Confirmar con la ATT que la venta por internet está autorizada para el operador |
| 7.6 | "Venta desde 72 horas antes" (reglamento, art. 42.q) | Interpretación dudosa (¿mínimo o máximo?) | Confirmar con la ATT |
| 7.7 | Plazo de conservación de datos | La política dice "los plazos que exigen las normas" | Definir un plazo concreto con el contador de la empresa |
| 7.8 | Equipaje | Etiqueta de equipaje e indemnización por pérdida no están en el sistema | Procedimiento en terminal; fuera del alcance del MVP |
| 7.9 | Pago real | Hoy es simulado y se declara así | Al integrar una pasarela, actualizar Términos, Privacidad y Cookies |
| 7.10 | Revisión legal | Textos redactados por el equipo técnico | Revisión de un abogado antes de publicar |

---

## 8. Limitaciones de esta verificación

- La herramienta de búsqueda de la guía UI/UX Pro Max necesita Python, que no hay en la computadora de trabajo: se usaron sus referencias y datos directamente.
- El panel del navegador integrado no tenía el foco de la ventana: el recorrido con teclado se verificó por código (orden de tabulación, reglas de foco presentes en el CSS), no mirando el borde en pantalla. Conviene un recorrido rápido con Tab en Chrome.
- HawkScan (escaneo dinámico) no se ejecutó: falta `HAWK_API_KEY`.
- El registro del *service worker* sigue pendiente de confirmar en Chrome o Android (el navegador integrado no lo admite).

---

## 9. Fuentes

- [Decreto Supremo N° 1793 (reglamento de la Ley 164), Lexivox](https://www.lexivox.org/norms/BO-DS-N1793.html)
- [Ley N° 453 de los derechos de usuarios y consumidores, Lexivox](https://www.lexivox.org/norms/BO-L-N453.html) · [DS N° 2130, reglamento](https://www.lexivox.org/norms/BO-DS-N2130.html)
- [Ley N° 1886, artículo 6, Infoleyes](https://bolivia.infoleyes.com/articulo/44474)
- [DS N° 1893, reglamento de la Ley 223, Lexivox](https://www.lexivox.org/norms/BO-DS-N1893.html) · [ATT: descuentos para personas con discapacidad y adultos mayores](https://www.att.gob.bo/node/510)
- [Reglamento regulatorio de transporte terrestre de pasajeros, Infoleyes](https://bolivia.infoleyes.com/norma/6380/reglamento-regulatorio-para-la-modalidad-de-transporte-terrestre-de-pasajeros-y-carga-rrmttpc) · [art. 78, devoluciones](https://bolivia.infoleyes.com/articulo/88662) · [art. 81, menores](https://bolivia.infoleyes.com/articulo/88665) · [RM 266 de la ATT (PDF)](https://www.att.gob.bo/sites/default/files/archivos_listados_pdf/2023-05-09/RM%20No%20266%20REGULATORIO%20TRANSPORTE%20TERRESTRE.pdf)
- [Red Uno: descuento del 50 % para niñas y niños según la ATT](https://www.reduno.com.bo/noticias/viajas-con-ninos-asi-aplica-el-descuento-del-50-en-pasajes-de-bus-segun-la-att-2026113114313)
- [AGETIC: anteproyecto de Ley de Protección de Datos Personales (PDF)](https://agetic.gob.bo/sites/default/files/2025-06/DATOS-PERSONALES-PRESENTACION-ANTEPROYECTO-DE-LEY-2024-firmado.pdf)
