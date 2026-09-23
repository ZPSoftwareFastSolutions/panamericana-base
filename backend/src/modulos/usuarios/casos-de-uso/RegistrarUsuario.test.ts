import { describe, expect, it } from 'vitest';
import type { TipoDocumento } from '../../../compartido/dominio/Persona';
import { CorreoInvalidoError } from '../../../compartido/dominio/erroresPersona';
import type { Usuario } from '../dominio/Usuario';
import type { UsuarioRepositorio } from '../dominio/UsuarioRepositorio';
import { CorreoDuplicadoError, RolInvalidoError, UsuarioDuplicadoError } from '../dominio/errores';
import { RegistrarUsuario } from './RegistrarUsuario';

/** repositorio falso: guarda en memoria y trae el catalogo de roles de la base */
class UsuarioRepositorioEnMemoria implements UsuarioRepositorio {
  usuarios: Usuario[] = [];
  catalogoRoles = ['administrador', 'vendedor', 'encomiendas', 'cliente'];

  async listar(): Promise<Usuario[]> {
    return this.usuarios;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.find((usuario) => usuario.id === id) ?? null;
  }

  async existeCorreo(correo: string): Promise<boolean> {
    return this.usuarios.some((usuario) => usuario.correo === correo);
  }

  async existeDocumento(tipo: TipoDocumento, numero: string): Promise<boolean> {
    return this.usuarios.some((u) => u.tipo_documento === tipo && u.numero_documento === numero);
  }

  async rolesExistentes(roles: string[]): Promise<string[]> {
    return roles.filter((rol) => this.catalogoRoles.includes(rol));
  }

  async guardar(usuario: Usuario): Promise<void> {
    this.usuarios.push(usuario);
  }
}

const datosValidos = {
  correo: 'carla.vargas@panamericana.test',
  roles: ['vendedor'],
  tipo_documento: 'ci' as const,
  numero_documento: '6612345',
  nombres: 'Carla',
  apellidos: 'Vargas',
};

describe('RegistrarUsuario', () => {
  it('registra un usuario activo con uno o varios roles', async () => {
    const repositorio = new UsuarioRepositorioEnMemoria();

    const usuario = await new RegistrarUsuario(repositorio).ejecutar({
      ...datosValidos,
      correo: ' Carla.Vargas@Panamericana.TEST ',
      roles: ['vendedor', 'encomiendas', 'Vendedor'],
    });

    expect(usuario.activo).toBe(true);
    expect(usuario.correo).toBe('carla.vargas@panamericana.test');
    expect(usuario.roles).toEqual(['encomiendas', 'vendedor']);
    expect(repositorio.usuarios).toHaveLength(1);
  });

  it('usa el id de la cuenta de autenticacion cuando llega', async () => {
    const id = '11111111-1111-4111-8111-111111111111';

    const usuario = await new RegistrarUsuario(new UsuarioRepositorioEnMemoria()).ejecutar({
      ...datosValidos,
      id,
    });

    expect(usuario.id).toBe(id);
  });

  it('rechaza un rol que no existe en el catalogo', async () => {
    const registrar = new RegistrarUsuario(new UsuarioRepositorioEnMemoria());

    await expect(registrar.ejecutar({ ...datosValidos, roles: ['supervisor'] })).rejects.toThrow(
      RolInvalidoError,
    );
  });

  it('rechaza un usuario sin roles', async () => {
    const registrar = new RegistrarUsuario(new UsuarioRepositorioEnMemoria());

    await expect(registrar.ejecutar({ ...datosValidos, roles: [] })).rejects.toThrow(
      RolInvalidoError,
    );
  });

  it('no permite dos cuentas con el mismo correo', async () => {
    const registrar = new RegistrarUsuario(new UsuarioRepositorioEnMemoria());
    await registrar.ejecutar(datosValidos);

    await expect(
      registrar.ejecutar({ ...datosValidos, numero_documento: '6699999' }),
    ).rejects.toThrow(CorreoDuplicadoError);
  });

  it('no permite dos cuentas para la misma persona', async () => {
    const registrar = new RegistrarUsuario(new UsuarioRepositorioEnMemoria());
    await registrar.ejecutar(datosValidos);

    await expect(
      registrar.ejecutar({ ...datosValidos, correo: 'otra@panamericana.test' }),
    ).rejects.toThrow(UsuarioDuplicadoError);
  });

  it('rechaza un correo sin formato', async () => {
    const registrar = new RegistrarUsuario(new UsuarioRepositorioEnMemoria());

    await expect(registrar.ejecutar({ ...datosValidos, correo: 'carla.vargas' })).rejects.toThrow(
      CorreoInvalidoError,
    );
  });
});
