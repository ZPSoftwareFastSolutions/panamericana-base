import type { Cuenta } from '../dominio/Cuenta';
import { puedeAcceder } from '../dominio/Cuenta';
import type { CuentaRepositorio, VerificadorDeToken } from '../dominio/puertos';
import { NoAutenticadoError, SinPermisoError } from '../dominio/errores';

/**
 * Caso de uso: identificar a quien hace la peticion.
 * Pasos: 1) hay token · 2) el token es valido (firma, emisor, audiencia, vencimiento)
 *        3) la cuenta existe y esta activa · 4) tiene alguno de los roles exigidos
 */
export class IdentificarUsuario {
  constructor(
    private readonly verificador: VerificadorDeToken,
    private readonly cuentas: CuentaRepositorio,
  ) {}

  async ejecutar(token: string | undefined, rolesPermitidos: string[] = []): Promise<Cuenta> {
    if (!token) {
      throw new NoAutenticadoError();
    }

    let id: string;
    try {
      ({ id } = await this.verificador.verificar(token));
    } catch {
      throw new NoAutenticadoError('La sesión no es valida o ya venció. Vuelve a iniciar sesión');
    }

    const cuenta = await this.cuentas.buscarActiva(id);
    if (!cuenta) {
      throw new NoAutenticadoError('Tu cuenta no está registrada o fue desactivada');
    }

    if (!puedeAcceder(cuenta, rolesPermitidos)) {
      throw new SinPermisoError();
    }
    return cuenta;
  }
}
