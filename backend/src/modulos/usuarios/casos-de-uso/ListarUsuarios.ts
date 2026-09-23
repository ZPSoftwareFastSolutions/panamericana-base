import type { Usuario } from '../dominio/Usuario';
import type { UsuarioRepositorio } from '../dominio/UsuarioRepositorio';

/** Caso de uso: listar los usuarios internos con sus roles */
export class ListarUsuarios {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(): Promise<Usuario[]> {
    return this.usuarios.listar();
  }
}
