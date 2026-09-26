import { describe, expect, it } from 'vitest';
import type { Cuenta } from '../dominio/Cuenta';
import type { CuentaRepositorio, VerificadorDeToken } from '../dominio/puertos';
import { NoAutenticadoError, SinPermisoError } from '../dominio/errores';
import { IdentificarUsuario } from './IdentificarUsuario';

const ANA: Cuenta = {
  id: 'id-ana',
  correo: 'ana.quispe@panamericana.test',
  nombres: 'Ana',
  apellidos: 'Quispe',
  roles: ['administrador'],
};

/** verificador falso: acepta el token "token-<id>" y rechaza cualquier otro */
const verificadorFalso: VerificadorDeToken = {
  async verificar(token) {
    if (!token.startsWith('token-')) throw new Error('firma inválida');
    return { id: token.slice('token-'.length) };
  },
};

function repositorio(cuentas: Cuenta[]): CuentaRepositorio {
  return { buscarActiva: async (id) => cuentas.find((cuenta) => cuenta.id === id) ?? null };
}

describe('IdentificarUsuario', () => {
  const identificar = new IdentificarUsuario(verificadorFalso, repositorio([ANA]));

  it('devuelve la cuenta con sus roles cuando el token es válido', async () => {
    await expect(identificar.ejecutar('token-id-ana', ['administrador'])).resolves.toEqual(ANA);
  });

  it('sin roles exigidos basta con una cuenta activa', async () => {
    await expect(identificar.ejecutar('token-id-ana')).resolves.toEqual(ANA);
  });

  it('sin token responde "no autenticado" (401)', async () => {
    await expect(identificar.ejecutar(undefined)).rejects.toThrow(NoAutenticadoError);
  });

  it('un token falso o vencido responde "no autenticado"', async () => {
    await expect(identificar.ejecutar('otro-token')).rejects.toThrow(NoAutenticadoError);
  });

  it('una cuenta desactivada o sin registro no entra', async () => {
    await expect(identificar.ejecutar('token-id-desconocido')).rejects.toThrow(NoAutenticadoError);
  });

  it('un rol que no está entre los permitidos responde "sin permiso" (403)', async () => {
    await expect(identificar.ejecutar('token-id-ana', ['vendedor'])).rejects.toThrow(
      SinPermisoError,
    );
  });
});
