import Link from 'next/link';
import { DatoDelNegocio } from '@/compartido/componentes/DatoDelNegocio';
import { DatosDeLaEmpresa, DocumentoLegal, Seccion } from './DocumentoLegal';

/**
 * TERMINOS Y CONDICIONES del servicio: compra por tramos, tarifas de ley, abordaje, equipaje,
 * encomiendas y reclamos. Las reglas del sistema (reserva de 10 minutos, 5 asientos por compra,
 * anulacion hasta 2 horas antes) estan escritas aqui tal como las aplica la API.
 */
export function TerminosCondiciones() {
  return (
    <DocumentoLegal ruta="/terminos">
      <p>
        Estos términos regulan la compra de pasajes y el envío de encomiendas con Panamericana, en el portal web y en
        nuestras taquillas. Al marcar la casilla de aceptación antes de comprar, aceptas estos términos, la{' '}
        <Link href="/privacidad">Política de Privacidad</Link> y la <Link href="/reembolsos">Política de Reembolsos</Link>.
      </p>

      <Seccion titulo="1. Quién presta el servicio">
        <DatosDeLaEmpresa />
      </Seccion>

      <Seccion titulo="2. Quién puede comprar">
        <p>
          Para comprar debes ser mayor de 18 años. Puedes comprar pasajes para otras personas si cuentas con su autorización
          para darnos sus datos. Las niñas, niños y adolescentes que viajen deben cumplir los requisitos de la Ley N° 548
          (Código Niña, Niño y Adolescente), como la autorización de viaje cuando corresponda.
        </p>
      </Seccion>

      <Seccion titulo="3. Compra de pasajes por tramos">
        <ul>
          <li>
            Vendemos pasajes por tramos: puedes subir y bajar en cualquier parada de la ruta, en el orden del recorrido.
          </li>
          <li>Los precios se muestran en bolivianos (Bs), por tramo y tipo de asiento, antes de confirmar la compra.</li>
          <li>Puedes elegir hasta 5 asientos por compra.</li>
          <li>
            Al continuar al pago, los asientos quedan reservados por 10 minutos. Si no se paga en ese tiempo, la reserva vence
            y los asientos se liberan sin ningún cobro.
          </li>
          <li>La compra se confirma al completar el pago; recién entonces se emiten los pasajes con su código y su QR.</li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Pago">
        <p>
          En esta versión del portal el pago con tarjeta es simulado: no se solicitan datos de tarjeta ni se realiza ningún
          cobro real. En la taquilla el pago es en efectivo.
        </p>
      </Seccion>

      <Seccion titulo="5. Tarifas diferenciadas">
        <p>Aplicamos los descuentos que establece la normativa boliviana. Elige la tarifa al escribir los datos de cada pasajero:</p>
        <ul>
          <li>
            <strong>Personas adultas mayores (60 años o más):</strong> 20 % de descuento (Ley N° 1886). Al subir se presenta la
            cédula de identidad.
          </li>
          <li>
            <strong>Personas con discapacidad grave o muy grave:</strong> 50 % de descuento (Ley N° 223 y Decreto Supremo N°
            1893). Al subir se presenta el carnet de discapacidad vigente.
          </li>
          <li>
            <strong>Niñas y niños de 3 a 12 años:</strong> 50 % de descuento, con asiento propio. Al subir se presenta la cédula
            de identidad o el certificado de nacimiento.
          </li>
          <li>
            <strong>Menores de hasta 3 años:</strong> viajan gratis en el mismo asiento de la persona adulta que los acompaña.
            Se registran en la lista de pasajeros al abordar.
          </li>
        </ul>
        <p>
          El descuento es personal e intransferible. Si al subir no se presenta el documento que corresponde, el descuento no
          se aplica y se debe pagar la diferencia con la tarifa general antes de abordar.
        </p>
      </Seccion>

      <Seccion titulo="6. Boleto y abordaje">
        <ul>
          <li>El pasaje es personal: el nombre y el documento del boleto deben coincidir con los de quien viaja.</li>
          <li>
            Al subir presenta tu documento de identidad y el boleto, impreso o en el celular. Puedes consultarlo en{' '}
            <Link href="/boleto">Mi boleto</Link> con el código del pasaje.
          </li>
          <li>Llega a la terminal con anticipación: el bus sale de cada parada a la hora indicada en el boleto.</li>
        </ul>
      </Seccion>

      <Seccion titulo="7. Equipaje">
        <p>
          Cada pasajero puede llevar en la bodega del bus una pieza de equipaje de hasta 20 kg sin costo adicional. El exceso
          se cobra como pieza adicional. No se transportan sustancias peligrosas ni objetos prohibidos por la ley. Si tu
          equipaje registrado se pierde o se daña, la indemnización se rige por el reglamento de transporte terrestre de la
          autoridad de regulación (ATT).
        </p>
      </Seccion>

      <Seccion titulo="8. Anulaciones, cambios, retrasos y cancelaciones">
        <p>
          Puedes anular tu pasaje en la taquilla hasta 2 horas antes de que el bus salga de tu parada, con devolución del 100 %.
          Si Panamericana cancela el viaje o sale con más de 30 minutos de retraso por causas que le son atribuibles, tienes
          derecho a la devolución inmediata del 100 %. Los detalles están en la{' '}
          <Link href="/reembolsos">Política de Reembolsos</Link>.
        </p>
      </Seccion>

      <Seccion titulo="9. Encomiendas">
        <ul>
          <li>Las encomiendas se registran y se pagan en la taquilla de la terminal de origen, hasta 50 kg por envío.</li>
          <li>
            El remitente declara el contenido y es responsable de que sea verdadero y de que no incluya objetos prohibidos
            por la ley.
          </li>
          <li>
            Recibes un código de seguimiento para consultar el estado del envío en{' '}
            <Link href="/seguimiento">Seguimiento de encomiendas</Link>.
          </li>
          <li>La encomienda se entrega en la terminal de destino al destinatario, que presenta su documento de identidad.</li>
          <li>Una encomienda que todavía no salió puede cancelarse, con devolución del 100 % del costo.</li>
        </ul>
      </Seccion>

      <Seccion titulo="10. Uso del portal">
        <p>
          Al usar el portal te comprometes a dar datos verdaderos y a no reservar asientos sin intención de comprarlos, no
          interferir con el funcionamiento del sistema ni usar programas automáticos para consultar o reservar. Podemos
          limitar las reservas seguidas desde una misma conexión para que todos puedan comprar.
        </p>
      </Seccion>

      <Seccion titulo="11. Reclamos">
        <p>
          Puedes presentar tu reclamo en la taquilla o en nuestras oficinas (Oficina del Consumidor, ODECO), o escribirnos a{' '}
          <DatoDelNegocio dato="correo" />. Si no quedas conforme con la respuesta, puedes acudir a la Autoridad de Regulación
          y Fiscalización de Telecomunicaciones y Transportes (ATT) y a las instancias de defensa del consumidor, conforme a la
          Ley N° 453.
        </p>
      </Seccion>

      <Seccion titulo="12. Cambios a estos términos y ley aplicable">
        <p>
          Podemos actualizar estos términos; la versión vigente es la publicada en esta página al momento de tu compra. Se
          aplican las leyes del Estado Plurinacional de Bolivia.
        </p>
      </Seccion>
    </DocumentoLegal>
  );
}
