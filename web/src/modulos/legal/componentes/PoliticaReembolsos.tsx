import { DatoDelNegocio } from '@/compartido/componentes/DatoDelNegocio';
import { DocumentoLegal, Seccion } from './DocumentoLegal';

/**
 * POLITICA DE REEMBOLSOS. La anulacion por el pasajero devuelve el 100 % (el reglamento de transporte
 * exige al menos el 85 %); la cancelacion o demora mayor a 30 minutos atribuible al operador, el 100 %.
 */
export function PoliticaReembolsos() {
  return (
    <DocumentoLegal ruta="/reembolsos">
      <p>
        Aquí explicamos cuándo y cómo se devuelve el dinero de un pasaje o de una encomienda. Estas condiciones mejoran los
        mínimos que fija el reglamento de transporte terrestre de pasajeros.
      </p>

      <Seccion titulo="1. Si decides no viajar">
        <ul>
          <li>
            Puedes anular tu pasaje <strong>hasta 2 horas antes</strong> de la hora en que el bus sale de tu parada de subida.
          </li>
          <li>
            Te devolvemos <strong>el 100 % del precio pagado</strong>, sin cargos.
          </li>
          <li>
            La anulación se hace en la taquilla presentando el código del pasaje y el documento de identidad del pasajero o
            del comprador. El dinero se entrega en ese momento.
          </li>
          <li>El asiento queda libre para otra persona.</li>
          <li>Pasado ese plazo, o si no te presentas al viaje, el pasaje ya no se puede anular ni devolver.</li>
        </ul>
      </Seccion>

      <Seccion titulo="2. Cambio de fecha u horario">
        <p>
          Para viajar en otra fecha u horario, anula tu pasaje en la taquilla dentro del plazo anterior (recibes el 100 %) y
          compra uno nuevo para el viaje que prefieras, según la disponibilidad de asientos.
        </p>
      </Seccion>

      <Seccion titulo="3. Si el viaje se cancela o se retrasa">
        <ul>
          <li>
            Si Panamericana cancela el viaje, tienes derecho a la <strong>devolución inmediata del 100 %</strong> del pasaje.
          </li>
          <li>
            Si el bus sale con <strong>más de 30 minutos de retraso</strong> por causas atribuibles a Panamericana, puedes pedir
            la devolución inmediata del 100 %.
          </li>
          <li>En estos casos la devolución se hace en la taquilla aunque ya haya pasado el plazo de anulación.</li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Reservas que no se pagaron">
        <p>
          Una reserva del portal que no se paga en 10 minutos vence sola: los asientos se liberan y no se cobra nada, así que
          no hay nada que devolver.
        </p>
      </Seccion>

      <Seccion titulo="5. Encomiendas">
        <p>
          Una encomienda que todavía no salió de la terminal de origen puede cancelarse en la taquilla, con devolución del
          100 % del costo al remitente. Una vez despachada ya no se puede cancelar.
        </p>
      </Seccion>

      <Seccion titulo="6. Consultas y reclamos">
        <p>
          Si tienes una duda o no estás de acuerdo con una devolución, escríbenos a <DatoDelNegocio dato="correo" />, llámanos
          al <DatoDelNegocio dato="telefono" /> o acércate a la taquilla. También puedes acudir a la Autoridad de Regulación y
          Fiscalización de Telecomunicaciones y Transportes (ATT).
        </p>
      </Seccion>
    </DocumentoLegal>
  );
}
