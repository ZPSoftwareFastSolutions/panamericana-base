import { DocumentoLegal, Seccion } from './DocumentoLegal';

/**
 * POLITICA DE COOKIES. El portal no usa cookies: solo el almacenamiento del navegador que hace
 * falta para funcionar (sesion del personal y archivos de la app instalable). Por eso no hay aviso
 * de consentimiento. Si algun dia se agrega analitica o publicidad, primero se pide el consentimiento
 * y se actualiza este texto (la revision de seguridad avisa si aparece un script de terceros).
 */
export function PoliticaCookies() {
  return (
    <DocumentoLegal ruta="/cookies">
      <p>
        Las cookies y el almacenamiento del navegador son pequeños datos que un sitio guarda en tu dispositivo. Aquí te
        contamos qué guarda nuestro portal y por qué.
      </p>

      <Seccion titulo="1. Lo que usamos">
        <ul>
          <li>
            <strong>No usamos cookies</strong> para comprar pasajes, consultar boletos ni seguir encomiendas.
          </li>
          <li>
            <strong>Sesión del personal:</strong> cuando una persona de Panamericana inicia sesión en el panel, el navegador
            guarda su sesión (almacenamiento local) para no pedirle la contraseña en cada página. Se borra al cerrar sesión.
            Solo existe si alguien del personal inició sesión y es estrictamente necesario para el panel.
          </li>
          <li>
            <strong>Archivos de la aplicación:</strong> para que el portal abra más rápido, se pueda instalar en el celular
            y muestre una página &quot;sin conexión&quot; cuando no hay internet, el navegador guarda una copia de los archivos de la
            aplicación (código, estilos e íconos). No guarda datos personales, precios ni compras.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="2. Lo que no usamos">
        <p>
          No usamos cookies ni herramientas de analítica, publicidad o redes sociales, ni permitimos que terceros guarden
          cookies a través del portal. El portal usa las fuentes de tu dispositivo, y los íconos y códigos QR se generan en el propio
          portal, sin llamar a otros sitios.
        </p>
      </Seccion>

      <Seccion titulo="3. Por qué no te pedimos permiso">
        <p>
          Como solo usamos el almacenamiento estrictamente necesario para que el servicio funcione, no mostramos un aviso de
          consentimiento. Si en el futuro incorporamos herramientas de analítica o publicidad, te pediremos tu consentimiento
          antes de activarlas y actualizaremos esta política.
        </p>
      </Seccion>

      <Seccion titulo="4. Cómo borrar estos datos">
        <p>
          Puedes borrar el almacenamiento del sitio desde la configuración de tu navegador (opción de datos de sitios o de
          navegación). Si lo haces, el personal deberá iniciar sesión de nuevo y el portal volverá a descargar sus
          archivos.
        </p>
      </Seccion>
    </DocumentoLegal>
  );
}
