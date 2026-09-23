import { Usuario } from '../dominio/Usuario';
import type { DatosNuevoUsuario } from '../dominio/Usuario';
import type { UsuarioRepositorio } from '../dominio/UsuarioRepositorio';
import { CorreoDuplicadoError, RolInvalidoError, UsuarioDuplicadoError } from '../dominio/errores';

/**
 * Caso de uso: registrar un usuario interno.
 * Pasos: 1) validar datos · 2) los roles existen · 3) correo y persona sin cuenta previa · 4) guardar
 */
export class RegistrarUsuario {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(entrada: DatosNuevoUsuario): Promise<Usuario> {
    const usuario = Usuario.crear(entrada);

    // los roles son datos del catalogo: se comparan contra la base, no contra una lista fija
    const existentes = await this.usuarios.rolesExistentes(usuario.roles);
    const inexistentes = usuario.roles.filter((rol) => !existentes.includes(rol));
    if (inexistentes.length > 0) {
      throw new RolInvalidoError(inexistentes);
    }

    if (await this.usuarios.existeCorreo(usuario.correo)) {
      throw new CorreoDuplicadoError(usuario.correo);
    }
    if (await this.usuarios.existeDocumento(usuario.tipo_documento, usuario.numero_documento)) {
      throw new UsuarioDuplicadoError(usuario.tipo_documento, usuario.numero_documento);
    }

    await this.usuarios.guardar(usuario);

    // si la persona ya existia (por ejemplo, era cliente), la base conserva sus nombres
    return (await this.usuarios.buscarPorId(usuario.id)) ?? usuario;
  }
}
