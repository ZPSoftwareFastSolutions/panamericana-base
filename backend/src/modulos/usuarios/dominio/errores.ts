import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class CorreoDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'correo_duplicado';
  readonly estadoHttp = 409;

  constructor(correo: string) {
    super(`Ya existe un usuario con el correo ${correo}`);
  }
}

export class UsuarioDuplicadoError extends ErrorDeDominio {
  readonly codigo = 'usuario_duplicado';
  readonly estadoHttp = 409;

  constructor(tipo_documento: string, numero_documento: string) {
    super(`La persona con ${tipo_documento.toUpperCase()} ${numero_documento} ya tiene una cuenta`);
  }
}

export class RolInvalidoError extends ErrorDeDominio {
  readonly codigo = 'rol_invalido';
  readonly estadoHttp = 400;

  constructor(roles: string[]) {
    super(
      roles.length === 0
        ? 'El usuario debe tener al menos un rol'
        : `Estos roles no existen: ${roles.join(', ')}`,
    );
  }
}
