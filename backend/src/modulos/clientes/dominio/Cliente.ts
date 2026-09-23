import { crearPersona } from '../../../compartido/dominio/Persona';
import type { DatosPersona, TipoDocumento } from '../../../compartido/dominio/Persona';

/** para registrar un cliente solo hacen falta sus datos personales */
export type DatosNuevoCliente = DatosPersona;

/**
 * Entidad del dominio: un cliente (pasajero, remitente o destinatario).
 *
 * En la base son dos tablas: personas (los datos) y clientes (el rol).
 * Aqui se ve como un solo objeto, porque para el resto del sistema es una sola cosa.
 * Las reglas de los datos personales (CI, celular, correo) estan en compartido/dominio/Persona.ts
 */
export class Cliente {
  private constructor(
    readonly id: string,
    readonly tipo_documento: TipoDocumento,
    readonly numero_documento: string,
    readonly nombres: string,
    readonly apellidos: string,
    readonly telefono: string | null,
    readonly correo: string | null,
    readonly fecha_nacimiento: string | null,
  ) {}

  /** crea un cliente nuevo aplicando las reglas de la persona */
  static crear(datos: DatosNuevoCliente, hoy: Date = new Date()): Cliente {
    const persona = crearPersona(datos, hoy);

    return new Cliente(
      crypto.randomUUID(),
      persona.tipo_documento,
      persona.numero_documento,
      persona.nombres,
      persona.apellidos,
      persona.telefono,
      persona.correo,
      persona.fecha_nacimiento,
    );
  }

  /** reconstruye un cliente que ya existe en la base (no vuelve a validar) */
  static reconstruir(datos: {
    id: string;
    tipo_documento: TipoDocumento;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    correo: string | null;
    fecha_nacimiento: string | null;
  }): Cliente {
    return new Cliente(
      datos.id,
      datos.tipo_documento,
      datos.numero_documento,
      datos.nombres,
      datos.apellidos,
      datos.telefono,
      datos.correo,
      datos.fecha_nacimiento,
    );
  }
}
