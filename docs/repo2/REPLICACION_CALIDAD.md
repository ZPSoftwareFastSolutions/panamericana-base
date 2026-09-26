# Replicación del incremento de calidad y legal — guía de gestión para Ángel

> **Fecha:** 26/09/2026 · **Para:** Ángel (Scrum Master) · **Documento interno:** no se copia al repositorio del equipo.
> **Referencia:** rama `calidad-y-legal` de `panamericana-base` (creada desde `sprint04`).
> **Requisito previo:** el incremento 4 fusionado en el repositorio del equipo (`REPLICACION_SPRINT_04.md` §11) y `CORRECCIONES_04.md` aplicada.
> **Cuándo:** antes de la demo final o al inicio de la fase final, **antes del despliegue oficial**.

---

## 0. Resumen

| | |
|---|---|
| **Incremento** | Pasar las pruebas de calidad y cumplir la normativa boliviana: tarifas diferenciadas de ley, consentimiento al vender, documentos legales, datos del operador, accesibilidad (WCAG 2.2 AA), buscadores y textos con tildes |
| **Base de datos** | Migración **12** `20260926034529_tarifas_diferenciadas.sql` (tabla `tipos_pasajero` y columna `pasajes.tipo_pasajero`). **Ya está aplicada en la base compartida:** solo se copia el archivo |
| **Contrato** | `GET /v1/catalogos/tipos-pasajero` (nuevo, público) · la reserva y la venta en taquilla **exigen** `acepta_condiciones: true` (sin eso, 400) · cada pasajero puede llevar `tipo_pasajero` · la disponibilidad devuelve `precios_por_tarifa` por asiento · venta y boleto devuelven `tipo_pasajero` · `shared/src/negocio.ts` con los datos de la empresa |
| **Pruebas** | 119 unitarias · 3 de integración · **31 casos de aceptación** (`docs/pruebas/aceptacion_calidad.mjs`) · regresión 60/60, 52/52 y 22/22 · humo en orden · seguridad 15/15 (3 controles legales nuevos) · axe-core sin violaciones en 24 pantallas · sin desplazamiento horizontal a 375 px |
| **Pendiente de la empresa** | Razón social, NIT, dirección, teléfono, correo y autorización de la ATT (`shared/src/negocio.ts`). Mientras falten se ven como `[por completar]` y el sitio oficial **no se puede construir** |
| **Tu trabajo** | Ordenar los tres PR de la §3, PAN-45, revisar con la §6 y cerrar con la §8 |

---

## 1. Tarjetas (para Trello)

### 1.1 Resumen y carga

| Tarjeta | Responsable | Trabajo | Pts | PR | Revisor |
|---|---|---|---|---|---|
| **PAN-47** | Brisa | Accesibilidad de los componentes compartidos y del panel | 3 | A | Karime |
| **PAN-44** | John | Tarifas diferenciadas de ley (API) | 3 | B | Grisel |
| **PAN-45** | Ángel | Consentimiento obligatorio al vender, controles legales y mensajes con tildes (API) | 2 | B | John |
| **PAN-49** | Karime | Tarifa y casilla de aceptación en la compra y la taquilla (web) | 2 | B | Brisa |
| **PAN-46** | Karime | Documentos legales, datos del operador, pie del portal y portada | 3 | C | Brisa |
| **PAN-48** | Karime | Buscadores: `robots.txt`, mapa del sitio, títulos y `noindex` | 1 | C | Brisa |
| **PAN-50** | Grisel | Clientes sin fecha de nacimiento y casilla de privacidad en clientes y encomiendas | 1 | C | Brisa |

Carga: Karime 6 · Brisa 3 · John 3 · Ángel 2 · Grisel 1 (15 pts).

### 1.2 Descripción y criterios (textos para las tarjetas)

**PAN-44 · Tarifas diferenciadas de ley · John · 3 pts**
Como pasajero adulto mayor, con discapacidad o menor de 12 años quiero comprar con el descuento de la ley. Catálogo `tipos_pasajero` (general 0 %, adulto mayor 20 %, discapacidad 50 %, menor de 3 a 12 años 50 %), endpoint `GET /v1/catalogos/tipos-pasajero`, precio con descuento redondeado hacia abajo a Bs 0,50 (`precioConDescuento` en `compartido/dominio/Tramo.ts`), `precios_por_tarifa` en la disponibilidad y la tarifa guardada en el pasaje.
- [ ] El catálogo responde las 4 tarifas en orden, con el documento a presentar
- [ ] Cama Bs 60 con 20 % = Bs 48; semicama Bs 47,50 con 50 % = Bs 23,50
- [ ] Una tarifa que no existe responde 400
- [ ] Venta, boleto y anulación usan el precio con descuento

**PAN-45 · Consentimiento y controles legales · Ángel · 2 pts**
Sin aceptar los Términos y la Política de Privacidad no se vende. `acepta_condiciones` obligatorio en reservas y taquilla (se revisa antes de consultar el viaje). `npm run prueba:seguridad` revisa datos del negocio, documentos legales y que no haya analíticas ni scripts de terceros. Mensajes de la API con tildes.
- [ ] Reserva sin `acepta_condiciones` o con `false` → 400, también con un viaje inexistente
- [ ] Taquilla sin aceptar → 400
- [ ] `npm run prueba:seguridad` con los 3 controles de "legal"

**PAN-47 · Accesibilidad · Brisa · 3 pts**
`Campo` con etiqueta, ayuda y error enlazados; `CampoCasilla`; `Boton` de 44 px; foco visible y colores con contraste en `globals.css`; favicon propio; formulario de buses con etiquetas; tablas y grillas que no desbordan en el celular; gráficos con tabla para lectores de pantalla; textos del panel con tildes.
- [ ] Todos los campos del panel tienen etiqueta visible
- [ ] Con Tab se ve dónde está el foco; "Saltar al contenido" es lo primero
- [ ] Ninguna pantalla del panel se desplaza de costado a 375 px

**PAN-49 · Tarifa y aceptación en la compra · Karime · 2 pts**
Selector "Tarifa" por pasajero con el documento a presentar, total con los precios que manda la API, casilla obligatoria de aceptación (portal) o de confirmación (taquilla), tarifa en el detalle, el boleto y la venta de taquilla.
- [ ] Sin marcar la casilla el formulario no se envía
- [ ] El total mostrado es igual al que cobra la API
- [ ] El boleto dice la tarifa y qué documento presentar

**PAN-46 · Documentos legales · Karime · 3 pts**
Páginas `/terminos`, `/privacidad`, `/reembolsos` y `/cookies` (módulo `legal`), datos del operador en el pie y el boleto con `DatoDelNegocio`, portada sin afirmaciones que el sistema no cumple.
- [ ] Las 4 páginas enlazadas en el pie de todo el portal
- [ ] Datos faltantes de la empresa se ven como `[por completar]`
- [ ] Con dominio oficial y datos faltantes, la web no se construye

**PAN-48 · Buscadores · Karime · 1 pt**
`robots.ts` y `sitemap.ts` (cerrados sin `NEXT_PUBLIC_SITIO_URL`), título por página, `noindex` en el panel, compras, boletos y encomiendas.
- [ ] Sin dominio: `robots.txt` con `Disallow: /` y mapa vacío
- [ ] Cada página con su título

**PAN-50 · Datos mínimos y privacidad · Grisel · 1 pt**
El formulario y la tabla de clientes dejan de pedir y mostrar la fecha de nacimiento. Casilla "fue informado de la Política de Privacidad" en clientes y encomiendas.
- [ ] No se puede registrar un cliente ni una encomienda sin marcar la casilla

---

## 2. Qué cambia para todos

- **Formularios:** siempre `Campo`, `CampoSeleccion` o `CampoCasilla` (guía v1.6, §6.3).
- **Textos visibles con tildes**; identificadores sin tildes.
- **Reservas y ventas:** mandar `acepta_condiciones`. Quien pruebe con `curl` debe agregarlo al cuerpo.
- **Datos de la empresa:** solo en `shared/src/negocio.ts` (lo completa el Product Owner con la empresa).
- **`web/.env.local`:** nueva línea `NEXT_PUBLIC_SITIO_URL=` (vacía hasta el despliegue oficial).

---

## 3. Orden de los PR

El contrato vuelve **obligatorio** `acepta_condiciones`: si el contrato entra solo, la web deja de compilar. Por eso las tarjetas se agrupan en tres PR que se fusionan en orden, uno por día:

| Día | PR | Tarjetas | Qué entra |
|---|---|---|---|
| 1 | **A** | PAN-47 | Componentes compartidos, `globals.css`, favicon y pantallas del panel. No depende del contrato |
| 2 | **B** | PAN-44 + PAN-45 + PAN-49 | Migración (archivo), contrato `shared/`, API y compra/taquilla en la web. John abre el PR y Ángel y Karime suben sus commits a la misma rama `dev/john` antes de pedir la revisión |
| 3 | **C** | PAN-46 + PAN-48 + PAN-50 | Documentos legales, pie, portada, buscadores, clientes y encomiendas |

Entre el PR B y el C, los enlaces de la casilla de aceptación apuntan a páginas que aún no existen y `prueba:seguridad` marca "documentos legales": se resuelve al fusionar el C al día siguiente.

---

## 4. Archivos por PR

### 4.1 PR A · PAN-47 (Brisa)

`web/src/app/globals.css`, `web/src/app/favicon.ico`, `web/src/compartido/componentes/{Boton,Campo,CodigoQR,GraficoBarras,MenuLateral,PlanoAsientos}.tsx`, `web/src/compartido/servicios/clienteHttp.ts`, sesión (`PanelConSesion`, `FormularioLogin`, `Bienvenida`, `sesionServicio`), buses, terminales, rutas, viajes, croquis, panel y encomiendas (componentes del panel), las 10 páginas de `app/(backoffice)/` y su `layout.tsx`.

### 4.2 PR B · PAN-44, PAN-45 y PAN-49 (John, Ángel y Karime)

- **Migración (solo el archivo):** `supabase/migrations/20260926034529_tarifas_diferenciadas.sql`.
- **Contrato:** `shared/src/{negocio.ts,index.ts,endpoints.ts}`, `shared/src/tipos/{catalogo,venta,pasaje,viaje,panel}.ts`.
- **PAN-44 (John):** módulo `catalogos` (dominio, caso de uso `ListarTiposPasajero`, repositorio y rutas), `compartido/dominio/Tramo.ts` y su prueba, `ventas` (dominio, repositorios, `ReservarAsientos` y pruebas), `viajes` (`ViajeRepositorio`, `PgViajeRepositorio`, `ConsultarDisponibilidad`) y `contenedor.ts`.
- **PAN-45 (Ángel):** `ventaRutas.ts`, `infraestructura/{pruebaHumo,revisionSeguridad,verificarConexion}.ts` y los archivos con mensajes corregidos (§5, bloque PAN-45).
- **PAN-49 (Karime):** `catalogosServicio.ts`, `useCatalogos.ts`, `DatoDelNegocio.tsx` y los componentes de `ventas` y `taquilla`.

### 4.3 PR C · PAN-46, PAN-48 y PAN-50 (Karime y Grisel)

Módulo `web/src/modulos/legal/`, las 4 páginas legales, `app/layout.tsx`, `app/(publico)/layout.tsx` y `page.tsx`, `robots.ts`, `sitemap.ts`, `compartido/sitio.ts`, las páginas públicas (títulos y `noindex`), `web/.env.local.example`, y de Grisel `FormularioCliente`, `TablaClientes` y `FormularioEncomienda`.

---

## 5. Modo rescate (copiar desde la referencia)

Misma función `Copiar-Archivos` (`REPLICACION_SPRINT_01.md` §7.1), con `panamericana-base` en la rama `calidad-y-legal`. Se copia **solo** la lista de la tarjeta, en la rama de su responsable.

```powershell
# PR A · PAN-47 (Brisa)
Copiar-Archivos @("web\src\app\globals.css","web\src\app\favicon.ico","web\src\compartido\componentes\Boton.tsx","web\src\compartido\componentes\Campo.tsx","web\src\compartido\componentes\CodigoQR.tsx","web\src\compartido\componentes\GraficoBarras.tsx","web\src\compartido\componentes\MenuLateral.tsx","web\src\compartido\componentes\PlanoAsientos.tsx","web\src\compartido\servicios\clienteHttp.ts","web\src\modulos\sesion\componentes\PanelConSesion.tsx","web\src\modulos\sesion\componentes\FormularioLogin.tsx","web\src\modulos\sesion\componentes\Bienvenida.tsx","web\src\modulos\sesion\servicios\sesionServicio.ts","web\src\modulos\buses\componentes\FormularioBus.tsx","web\src\modulos\buses\componentes\TablaBuses.tsx","web\src\modulos\terminales\componentes\FormularioTerminal.tsx","web\src\modulos\terminales\componentes\TablaTerminales.tsx","web\src\modulos\rutas\componentes\FormularioRuta.tsx","web\src\modulos\rutas\componentes\TablaRutas.tsx","web\src\modulos\viajes\componentes\FormularioViaje.tsx","web\src\modulos\viajes\componentes\TablaViajes.tsx","web\src\modulos\viajes\componentes\EditorTarifas.tsx","web\src\modulos\viajes\componentes\ResultadosBusqueda.tsx","web\src\modulos\croquis\componentes\EditorCroquis.tsx","web\src\modulos\panel\componentes\PanelIndicadores.tsx","web\src\modulos\panel\componentes\PrediccionDemanda.tsx","web\src\modulos\panel\componentes\ResumenIndicadores.tsx","web\src\modulos\encomiendas\componentes\CambioDeEstado.tsx","web\src\modulos\encomiendas\componentes\EtiquetaEstado.tsx","web\src\modulos\encomiendas\componentes\SeguimientoEncomienda.tsx","web\src\modulos\encomiendas\componentes\TablaEncomiendas.tsx")
Copiar-Archivos @("web\src\app\(backoffice)\layout.tsx","web\src\app\(backoffice)\admin\page.tsx","web\src\app\(backoffice)\admin\buses\page.tsx","web\src\app\(backoffice)\admin\buses\[id]\croquis\page.tsx","web\src\app\(backoffice)\admin\clientes\page.tsx","web\src\app\(backoffice)\admin\encomiendas\page.tsx","web\src\app\(backoffice)\admin\panel\page.tsx","web\src\app\(backoffice)\admin\rutas\page.tsx","web\src\app\(backoffice)\admin\taquilla\page.tsx","web\src\app\(backoffice)\admin\terminales\page.tsx","web\src\app\(backoffice)\admin\viajes\page.tsx")

# PR B · contrato (John, primer commit de la rama)
Copiar-Archivos @("supabase\migrations\20260926034529_tarifas_diferenciadas.sql","shared\src\negocio.ts","shared\src\index.ts","shared\src\endpoints.ts","shared\src\tipos\catalogo.ts","shared\src\tipos\venta.ts","shared\src\tipos\pasaje.ts","shared\src\tipos\viaje.ts","shared\src\tipos\panel.ts")

# PR B · PAN-44 (John)
Copiar-Archivos @("backend\src\contenedor.ts","backend\src\compartido\dominio\Tramo.ts","backend\src\compartido\dominio\Tramo.test.ts","backend\src\modulos\catalogos\dominio\Catalogo.ts","backend\src\modulos\catalogos\dominio\CatalogoRepositorio.ts","backend\src\modulos\catalogos\casos-de-uso\ListarTiposPasajero.ts","backend\src\modulos\catalogos\adaptadores\PgCatalogoRepositorio.ts","backend\src\modulos\catalogos\adaptadores\catalogoRutas.ts","backend\src\modulos\ventas\dominio\Venta.ts","backend\src\modulos\ventas\dominio\VentaRepositorio.ts","backend\src\modulos\ventas\dominio\PasajeRepositorio.ts","backend\src\modulos\ventas\adaptadores\PgVentaRepositorio.ts","backend\src\modulos\ventas\adaptadores\PgPasajeRepositorio.ts","backend\src\modulos\ventas\adaptadores\ComprasSimultaneas.integracion.test.ts","backend\src\modulos\ventas\casos-de-uso\ReservarAsientos.ts","backend\src\modulos\ventas\casos-de-uso\ReservarAsientos.test.ts","backend\src\modulos\ventas\casos-de-uso\AnularPasaje.test.ts","backend\src\modulos\viajes\dominio\ViajeRepositorio.ts","backend\src\modulos\viajes\adaptadores\PgViajeRepositorio.ts","backend\src\modulos\viajes\casos-de-uso\ConsultarDisponibilidad.ts")

# PR B · PAN-45 (Angel): consentimiento, controles legales y mensajes con tildes
Copiar-Archivos @("backend\src\modulos\ventas\adaptadores\ventaRutas.ts","backend\src\modulos\ventas\dominio\errores.ts","backend\src\infraestructura\pruebaHumo.ts","backend\src\infraestructura\revisionSeguridad.ts","backend\src\infraestructura\verificarConexion.ts","backend\src\compartido\adaptadores\http\autorizacion.ts","backend\src\compartido\adaptadores\http\limiteDePeticiones.test.ts","backend\src\compartido\dominio\Persona.test.ts","backend\src\compartido\dominio\Tramo.ts","backend\src\compartido\dominio\erroresPersona.ts","backend\src\compartido\dominio\erroresViaje.ts","backend\src\modulos\buses\dominio\errores.ts","backend\src\modulos\clientes\casos-de-uso\RegistrarCliente.test.ts","backend\src\modulos\croquis\casos-de-uso\GenerarCroquis.test.ts","backend\src\modulos\croquis\dominio\Croquis.ts","backend\src\modulos\croquis\dominio\errores.ts","backend\src\modulos\encomiendas\casos-de-uso\CambiarEstadoEncomienda.ts","backend\src\modulos\encomiendas\casos-de-uso\RegistrarEncomienda.test.ts","backend\src\modulos\encomiendas\dominio\Encomienda.ts","backend\src\modulos\encomiendas\dominio\errores.ts","backend\src\modulos\panel\casos-de-uso\ObtenerIndicadores.test.ts","backend\src\modulos\panel\dominio\Periodo.ts")
Copiar-Archivos @("backend\src\modulos\prediccion\casos-de-uso\PredecirDemanda.test.ts","backend\src\modulos\prediccion\casos-de-uso\PredecirDemanda.ts","backend\src\modulos\prediccion\dominio\ModeloDemanda.ts","backend\src\modulos\prediccion\entrenamiento\entrenar.ts","backend\src\modulos\prediccion\entrenamiento\regresion.ts","backend\src\modulos\rutas\casos-de-uso\RegistrarRuta.test.ts","backend\src\modulos\rutas\casos-de-uso\RegistrarRuta.ts","backend\src\modulos\rutas\dominio\Ruta.ts","backend\src\modulos\rutas\dominio\errores.ts","backend\src\modulos\sesion\casos-de-uso\IdentificarUsuario.test.ts","backend\src\modulos\sesion\casos-de-uso\IdentificarUsuario.ts","backend\src\modulos\sesion\dominio\errores.ts","backend\src\modulos\terminales\casos-de-uso\RegistrarTerminal.test.ts","backend\src\modulos\terminales\dominio\errores.ts","backend\src\modulos\viajes\casos-de-uso\EditarTarifas.test.ts","backend\src\modulos\viajes\casos-de-uso\EditarTarifas.ts","backend\src\modulos\viajes\casos-de-uso\ProgramarViaje.test.ts","backend\src\modulos\viajes\casos-de-uso\ProgramarViaje.ts","backend\src\modulos\viajes\dominio\Programacion.ts")

# PR B · PAN-49 (Karime)
Copiar-Archivos @("web\src\modulos\catalogos\servicios\catalogosServicio.ts","web\src\modulos\catalogos\hooks\useCatalogos.ts","web\src\compartido\componentes\DatoDelNegocio.tsx","web\src\modulos\ventas\componentes\SeleccionDeAsientos.tsx","web\src\modulos\ventas\componentes\FormularioPasajeros.tsx","web\src\modulos\ventas\componentes\CompraDeAsientos.tsx","web\src\modulos\ventas\componentes\DetalleVenta.tsx","web\src\modulos\ventas\componentes\Boleto.tsx","web\src\modulos\ventas\componentes\Checkout.tsx","web\src\modulos\taquilla\componentes\VentaTaquilla.tsx","web\src\modulos\taquilla\componentes\AnulacionPasaje.tsx")

# PR C · PAN-46 y PAN-48 (Karime)
Copiar-Archivos @("web\src\modulos\legal\documentos.ts","web\src\modulos\legal\componentes\DocumentoLegal.tsx","web\src\modulos\legal\componentes\TerminosCondiciones.tsx","web\src\modulos\legal\componentes\PoliticaPrivacidad.tsx","web\src\modulos\legal\componentes\PoliticaReembolsos.tsx","web\src\modulos\legal\componentes\PoliticaCookies.tsx","web\src\app\(publico)\terminos\page.tsx","web\src\app\(publico)\privacidad\page.tsx","web\src\app\(publico)\reembolsos\page.tsx","web\src\app\(publico)\cookies\page.tsx","web\src\app\layout.tsx","web\src\app\(publico)\layout.tsx","web\src\app\(publico)\page.tsx","web\src\app\robots.ts","web\src\app\sitemap.ts","web\src\compartido\sitio.ts","web\.env.local.example")
Copiar-Archivos @("web\src\app\(publico)\boleto\page.tsx","web\src\app\(publico)\boleto\[codigo]\page.tsx","web\src\app\(publico)\compra\[codigo]\page.tsx","web\src\app\(publico)\login\page.tsx","web\src\app\(publico)\seguimiento\page.tsx","web\src\app\(publico)\seguimiento\[codigo]\page.tsx","web\src\app\(publico)\sin-conexion\page.tsx","web\src\app\(publico)\viajes\page.tsx","web\src\app\(publico)\viajes\[id]\page.tsx")

# PR C · PAN-50 (Grisel)
Copiar-Archivos @("web\src\modulos\clientes\componentes\FormularioCliente.tsx","web\src\modulos\clientes\componentes\TablaClientes.tsx","web\src\modulos\encomiendas\componentes\FormularioEncomienda.tsx")
```

`Tramo.ts` aparece en PAN-44 y en PAN-45 a propósito: es el mismo archivo final (precio con descuento y mensaje con tilde); basta copiarlo una vez.

---

## 6. Lista para revisar cada PR (además de las anteriores)

- [ ] Ningún `<input>` o `<select>` suelto: siempre `Campo`, `CampoSeleccion` o `CampoCasilla`.
- [ ] Textos visibles con tildes; nada de `text-slate-400` para texto ni `focus:outline-none`.
- [ ] La web no recalcula reglas del backend (el total sale de `precios_por_tarifa`).
- [ ] Reservas y ventas mandan `acepta_condiciones`; los formularios con datos de personas tienen su casilla.
- [ ] Ningún dato de la empresa escrito a mano: `DatoDelNegocio`.
- [ ] Páginas nuevas con `metadata` y `noindex` si muestran datos personales.
- [ ] A 375 px ninguna pantalla se desplaza de costado.

---

## 7. Datos de la empresa (Product Owner)

Antes del despliegue oficial hay que completar `shared/src/negocio.ts` con datos reales: razón social, NIT, dirección de la oficina principal, teléfono, correo y número de autorización de la ATT. Mientras falten:

- el portal los muestra como `[por completar]`;
- con `NEXT_PUBLIC_SITIO_URL` configurado, `npm run build` falla;
- `NODE_ENV=production npm run prueba:seguridad` falla.

Recomendación: que un abogado boliviano revise los cuatro documentos legales antes de publicar (ver `docs/calidad/INFORME_CALIDAD_LEGAL.md`).

---

## 8. Prueba de aceptación

Con la API y la web del equipo levantadas (`npm run dev:backend` y `npm run dev:web`):

```bash
PROYECTO="F:/Universidad/6to/Proyecto III/panamericana" CLAVE_DEMO=<contraseña> node docs/pruebas/aceptacion_calidad.mjs
```

Debe terminar con **`fallos: 0 de 31`** y `(igual que antes)`. Después, la regresión:

```bash
PROYECTO="F:/Universidad/6to/Proyecto III/panamericana" CLAVE_DEMO=<contraseña> node docs/pruebas/aceptacion_sprint04.mjs
```

Y en la carpeta del equipo:

```bash
npm run prueba:seguridad
```

---

## 9. Mensaje para el equipo (se puede copiar tal cual)

> **Calidad y parte legal antes de la demo**
>
> 1. **Día 1:** Brisa sube la base de accesibilidad (PAN-47): campos con etiqueta, foco visible, colores y pantallas que no se desbordan en el celular.
> 2. **Día 2:** John, Ángel y Karime suben juntos las tarifas de ley y la casilla de aceptación (PAN-44, PAN-45 y PAN-49) en la rama de John: el contrato cambia y tiene que entrar todo junto.
> 3. **Día 3:** Karime las páginas legales y los buscadores (PAN-46 y PAN-48) y Grisel la privacidad en clientes y encomiendas (PAN-50).
>
> Reglas nuevas: siempre `Campo`/`CampoSeleccion`/`CampoCasilla`, textos con tildes, solo los datos necesarios y la casilla de aceptación cuando se piden datos de personas. En `web/.env.local` agreguen la línea `NEXT_PUBLIC_SITIO_URL=` (vacía).

---

## 10. Estado

| Paso | Estado |
|---|---|
| Incremento construido y validado en `panamericana-base` (rama `calidad-y-legal`) | ✅ 26/09 |
| Migración 12 aplicada en la base compartida | ✅ 26/09 |
| `CORRECCIONES_04.md` aplicada | ⏳ |
| Tarjetas PAN-44 a PAN-50 en Trello | ⏳ cuando lo decidas |
| PR A · PR B · PR C | ⏳ |
| Datos de la empresa en `shared/src/negocio.ts` | ⏳ Product Owner |
| Revisión de los documentos legales por un abogado | ⏳ recomendada |
| Aceptación (§8) | ⏳ |
