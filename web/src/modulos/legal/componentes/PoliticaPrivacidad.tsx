import Link from 'next/link';
import { DatoDelNegocio } from '@/compartido/componentes/DatoDelNegocio';
import { DatosDeLaEmpresa, DocumentoLegal, Seccion } from './DocumentoLegal';

/**
 * POLITICA DE PRIVACIDAD. Cubre lo que el reglamento de la Ley 164 (DS 1793) pide informar antes
 * de recolectar datos: para que se usan, quien los recibe, quien es el responsable y como ejercer
 * los derechos de acceso, rectificacion, actualizacion, cancelacion y oposicion.
 * Si el sistema empieza a pedir otro dato o a usar otro proveedor, este texto se actualiza.
 */
export function PoliticaPrivacidad() {
  return (
    <DocumentoLegal ruta="/privacidad">
      <p>
        En Panamericana cuidamos los datos personales de pasajeros, remitentes y destinatarios de encomiendas. Aquí explicamos
        qué datos pedimos, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus derechos. Al comprar un
        pasaje o registrar una encomienda se te pide aceptar esta política.
      </p>

      <Seccion titulo="1. Responsable de los datos">
        <p>El responsable del tratamiento de tus datos es:</p>
        <DatosDeLaEmpresa />
      </Seccion>

      <Seccion titulo="2. Qué datos pedimos">
        <p>Solo pedimos los datos necesarios para prestar el servicio:</p>
        <ul>
          <li>
            <strong>Compra de pasajes (portal y taquilla):</strong> por cada pasajero, el tipo y número de documento (carnet de
            identidad, cédula de extranjero o pasaporte), los nombres y apellidos, la tarifa elegida y, si lo das, un número
            de celular. Guardamos también el viaje, el tramo, el asiento, el precio y el estado del pasaje.
          </li>
          <li>
            <strong>Encomiendas:</strong> el documento, los nombres y apellidos y, si lo das, el celular del remitente y del
            destinatario; además, la descripción, el peso y el costo del envío.
          </li>
          <li>
            <strong>Clientes registrados en taquilla:</strong> documento, nombres y apellidos y, de forma opcional, celular y
            correo.
          </li>
          <li>
            <strong>Personal de Panamericana:</strong> correo de acceso, nombres, apellidos, documento y rol dentro del
            sistema.
          </li>
        </ul>
        <p>
          <strong>Pagos:</strong> en esta versión del portal el pago con tarjeta es simulado. No pedimos ni guardamos números
          de tarjeta ni datos bancarios.
        </p>
        <p>
          <strong>Tarifa para personas con discapacidad:</strong> solo registramos que el pasaje se vendió con esa tarifa. El
          carnet de discapacidad se muestra al subir al bus; no lo copiamos ni lo guardamos.
        </p>
        <p>
          <strong>Datos técnicos:</strong> para evitar abusos, el servidor usa la dirección IP de forma temporal (en memoria y
          por pocos minutos) para limitar las reservas seguidas; no la guarda. Los proveedores que alojan el sistema pueden
          registrar datos técnicos de las conexiones por seguridad.
        </p>
      </Seccion>

      <Seccion titulo="3. Para qué usamos tus datos">
        <ul>
          <li>Reservar y vender pasajes, emitir el boleto y controlar el abordaje con la lista de pasajeros de cada viaje.</li>
          <li>Aplicar las tarifas diferenciadas que establece la ley.</li>
          <li>Registrar, transportar y entregar encomiendas a la persona correcta.</li>
          <li>Atender anulaciones, reembolsos, consultas y reclamos.</li>
          <li>Cumplir obligaciones legales, tributarias y las que fije la autoridad de transporte.</li>
          <li>Proteger el sistema contra usos indebidos.</li>
          <li>
            Preparar estadísticas y estimar la demanda de cada ruta con datos agrupados (cantidad de pasajes por día y ruta),
            sin identificar a ninguna persona.
          </li>
        </ul>
        <p>
          No usamos tus datos para publicidad, no los vendemos y no tomamos decisiones automáticas que te afecten
          personalmente.
        </p>
      </Seccion>

      <Seccion titulo="4. Tu consentimiento">
        <p>
          Antes de comprar en el portal debes marcar la casilla en la que aceptas los Términos y Condiciones y esta política.
          En la taquilla, el personal te informa de esta política y confirma tu aceptación en el sistema antes de emitir
          el pasaje o registrar la encomienda. Si compras para otras personas, declaras que cuentas con su autorización para darnos sus datos; si
          son menores de edad, los datos los entrega su madre, padre o tutor.
        </p>
      </Seccion>

      <Seccion titulo="5. Con quién compartimos tus datos">
        <ul>
          <li>
            <strong>Proveedores tecnológicos</strong> que alojan el sistema por encargo nuestro y no pueden usar los datos para
            otros fines: Supabase (base de datos y acceso del personal) y Vercel (alojamiento del portal). Sus servidores
            pueden estar fuera de Bolivia, por ejemplo en Estados Unidos.
          </li>
          <li>
            <strong>Autoridades</strong> competentes, cuando la ley lo exija o por orden judicial (por ejemplo, la autoridad de
            regulación del transporte, la administración tributaria o el Órgano Judicial).
          </li>
        </ul>
        <p>No entregamos tus datos a otras personas o empresas sin tu consentimiento o sin una orden judicial.</p>
        <p>
          <strong>Consultas públicas por código:</strong> quien tenga el código de un pasaje puede ver el boleto, que muestra
          el nombre del pasajero y el documento parcialmente oculto. El seguimiento de encomiendas no muestra datos
          personales. Guarda tus códigos y compártelos solo con quien necesites.
        </p>
      </Seccion>

      <Seccion titulo="6. Cuánto tiempo guardamos tus datos">
        <p>
          Guardamos los datos de pasajes, ventas y encomiendas mientras se necesiten para prestar el servicio y atender
          reclamos, y durante los plazos que exigen las normas tributarias y de transporte. Cumplidos esos plazos, los
          eliminamos o los dejamos anónimos.
        </p>
      </Seccion>

      <Seccion titulo="7. Tus derechos">
        <p>Puedes pedirnos en cualquier momento:</p>
        <ul>
          <li>
            <strong>Acceso:</strong> saber qué datos tuyos tenemos.
          </li>
          <li>
            <strong>Rectificación y actualización:</strong> corregir datos incorrectos o desactualizados.
          </li>
          <li>
            <strong>Cancelación:</strong> que eliminemos tus datos cuando ya no sean necesarios o no exista una obligación
            legal de conservarlos.
          </li>
          <li>
            <strong>Oposición:</strong> que dejemos de usar tus datos para un fin determinado.
          </li>
          <li>
            <strong>Revocación del consentimiento:</strong> retirar tu autorización; esto no afecta lo realizado antes de
            retirarla.
          </li>
        </ul>
        <p>
          Para ejercerlos, escribe a <DatoDelNegocio dato="correo" /> o acércate a nuestras oficinas en{' '}
          <DatoDelNegocio dato="direccion" /> con tu documento de identidad. Te responderemos por el mismo medio. También
          puedes acudir a la vía judicial mediante la Acción de Protección de Privacidad que reconoce la Constitución Política
          del Estado.
        </p>
      </Seccion>

      <Seccion titulo="8. Cómo protegemos tus datos">
        <ul>
          <li>Los datos solo se consultan a través de nuestro sistema; la base de datos no tiene acceso público.</li>
          <li>El personal ingresa con usuario y contraseña, y cada rol ve solo lo que necesita para su trabajo.</li>
          <li>Los códigos de pasajes y encomiendas son aleatorios y difíciles de adivinar.</li>
          <li>En las consultas públicas el número de documento se muestra parcialmente oculto.</li>
        </ul>
      </Seccion>

      <Seccion titulo="9. Cookies y almacenamiento del navegador">
        <p>
          El portal no usa cookies de analítica ni de publicidad. Los detalles están en la{' '}
          <Link href="/cookies">Política de Cookies</Link>.
        </p>
      </Seccion>

      <Seccion titulo="10. Cambios a esta política">
        <p>
          Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de actualización. Si el
          cambio afecta el uso de tus datos, te pediremos nuevamente tu aceptación en la siguiente compra.
        </p>
      </Seccion>

      <Seccion titulo="11. Normas que aplicamos">
        <p>
          Tratamos los datos conforme a la Constitución Política del Estado (derecho a la privacidad e intimidad y Acción de
          Protección de Privacidad), la Ley N° 164 General de Telecomunicaciones, Tecnologías de Información y Comunicación y
          su reglamento aprobado por el Decreto Supremo N° 1793, la Ley N° 453 General de los Derechos de las Usuarias y los
          Usuarios y de las Consumidoras y los Consumidores, y las normas que las complementen o reemplacen.
        </p>
      </Seccion>
    </DocumentoLegal>
  );
}
