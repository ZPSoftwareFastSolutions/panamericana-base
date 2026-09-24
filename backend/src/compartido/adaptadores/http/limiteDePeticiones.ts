import type { RequestHandler } from 'express';
import { ErrorDeDominio } from '../../dominio/ErrorDeDominio';

export class DemasiadasPeticionesError extends ErrorDeDominio {
  readonly codigo = 'demasiadas_peticiones';
  readonly estadoHttp = 429;

  constructor() {
    super('Hiciste demasiadas reservas seguidas. Espera un momento y vuelve a intentar');
  }
}

/**
 * LIMITE DE PETICIONES POR IP (ventana fija).
 *
 * Protege endpoints publicos que retienen recursos, como la reserva de asientos:
 * sin limite, alguien podria reservar todo un bus una y otra vez sin pagar.
 * Los contadores viven en memoria: alcanza para un solo servidor (el MVP).
 */
export function limitarPorIp(opciones: {
  maximo: number;
  ventanaMs: number;
  ahora?: () => number;
}): RequestHandler {
  const ahora = opciones.ahora ?? Date.now;
  const contadores = new Map<string, { inicio: number; cantidad: number }>();

  return (req, _res, next) => {
    const momento = ahora();
    const ip = req.ip ?? 'desconocida';
    const actual = contadores.get(ip);

    if (!actual || momento - actual.inicio >= opciones.ventanaMs) {
      contadores.set(ip, { inicio: momento, cantidad: 1 });
      // de paso se olvidan las IP cuya ventana ya termino
      for (const [otra, datos] of contadores) {
        if (momento - datos.inicio >= opciones.ventanaMs) contadores.delete(otra);
      }
      next();
      return;
    }

    if (actual.cantidad >= opciones.maximo) {
      next(new DemasiadasPeticionesError());
      return;
    }
    actual.cantidad++;
    next();
  };
}
