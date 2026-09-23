import { DatoObligatorioError } from '../../../compartido/dominio/erroresComunes';
import { crearPersona, normalizarCorreo } from '../../../compartido/dominio/Persona';
import type { DatosPersona, TipoDocumento } from '../../../compartido/dominio/Persona';
import { RolInvalidoError } from './errores';

export type DatosNuevoUsuario = Omit<DatosPersona, 'correo' | 'fecha_nacimiento'> & {
  /** id de la cuenta en el servicio de autenticacion; si no llega, se genera uno */
  id?: string;
  correo: string;
  roles: string[];
};

/**
 * Entidad del dominio: un usuario interno que inicia sesion.
 *
 * En la base son tres tablas: personas (los datos), usuarios (la cuenta) y
 * usuarios_roles (uno o varios roles). Aqui se ve como un solo objeto.
 * Que los roles EXISTAN en el catalogo lo comprueba el caso de uso (necesita la base).
 */
export class Usuario {
  private constructor(
    readonly id: string,
    readonly correo: string,
    readonly activo: boolean,
    readonly roles: string[],
    readonly tipo_documento: TipoDocumento,
    readonly numero_documento: string,
    readonly nombres: string,
    readonly apellidos: string,
    readonly telefono: string | null,
  ) {}

  static crear(datos: DatosNuevoUsuario): Usuario {
    // el correo de la cuenta es obligatorio (en la persona es opcional)
    const correo = normalizarCorreo(datos.correo);
    if (!correo) throw new DatoObligatorioError('correo');

    const persona = crearPersona({ ...datos, correo });

    // sin repetidos y en minusculas: ["Vendedor", "vendedor"] -> ["vendedor"]
    const roles = [...new Set(datos.roles.map((rol) => rol.trim().toLowerCase()))].filter(Boolean);
    if (roles.length === 0) throw new RolInvalidoError([]);

    return new Usuario(
      datos.id ?? crypto.randomUUID(),
      correo,
      true,
      roles.sort(),
      persona.tipo_documento,
      persona.numero_documento,
      persona.nombres,
      persona.apellidos,
      persona.telefono,
    );
  }

  /** reconstruye un usuario que ya existe en la base (no vuelve a validar) */
  static reconstruir(datos: {
    id: string;
    correo: string;
    activo: boolean;
    roles: string[];
    tipo_documento: TipoDocumento;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    telefono: string | null;
  }): Usuario {
    return new Usuario(
      datos.id,
      datos.correo,
      datos.activo,
      datos.roles,
      datos.tipo_documento,
      datos.numero_documento,
      datos.nombres,
      datos.apellidos,
      datos.telefono,
    );
  }
}
