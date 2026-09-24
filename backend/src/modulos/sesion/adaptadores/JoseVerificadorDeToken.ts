import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { VerificadorDeToken } from '../dominio/puertos';

/**
 * Verifica los tokens que emite Supabase Auth.
 *
 * Supabase firma con una clave ECC P-256 (algoritmo ES256) y publica sus claves
 * publicas en el JWKS. Aqui NO hay ningun secreto: solo se comprueba la firma
 * con la clave publica, el emisor, la audiencia y el vencimiento.
 * La libreria guarda el JWKS en memoria y lo vuelve a pedir si Supabase rota la clave.
 */
export class JoseVerificadorDeToken implements VerificadorDeToken {
  private readonly claves;
  private readonly emisor: string;

  constructor(urlSupabase: string) {
    this.emisor = `${urlSupabase}/auth/v1`;
    this.claves = createRemoteJWKSet(new URL(`${this.emisor}/.well-known/jwks.json`));
  }

  async verificar(token: string): Promise<{ id: string }> {
    const { payload } = await jwtVerify(token, this.claves, {
      issuer: this.emisor,
      audience: 'authenticated',
      algorithms: ['ES256'],
    });

    if (!payload.sub) {
      throw new Error('El token no trae el id del usuario');
    }
    return { id: payload.sub };
  }
}
