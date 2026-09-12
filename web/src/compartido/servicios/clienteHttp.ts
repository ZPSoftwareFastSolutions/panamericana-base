import type { RespuestaError } from '@panamericana/shared';

/**
 * CLIENTE HTTP: el unico lugar de la web que habla con el backend.
 * Ningun componente debe usar fetch directamente.
 */
const URL_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** error con el codigo y mensaje que devolvio la API */
export class ErrorDeApi extends Error {
  constructor(
    readonly codigo: string,
    mensaje: string,
    readonly estado: number,
  ) {
    super(mensaje);
    this.name = 'ErrorDeApi';
  }
}

async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
  });

  if (!respuesta.ok) {
    const error = (await respuesta.json().catch(() => null)) as RespuestaError | null;
    throw new ErrorDeApi(
      error?.codigo ?? 'error_desconocido',
      error?.mensaje ?? 'No se pudo completar la operacion',
      respuesta.status,
    );
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  return (await respuesta.json()) as T;
}

export const clienteHttp = {
  get: <T,>(ruta: string) => pedir<T>(ruta),
  post: <T,>(ruta: string, cuerpo: unknown) =>
    pedir<T>(ruta, { method: 'POST', body: JSON.stringify(cuerpo) }),
  put: <T,>(ruta: string, cuerpo: unknown) =>
    pedir<T>(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  eliminar: <T,>(ruta: string) => pedir<T>(ruta, { method: 'DELETE' }),
};
