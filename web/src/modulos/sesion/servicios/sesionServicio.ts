import { RUTAS_API } from '@panamericana/shared';
import type { SesionUsuario } from '@panamericana/shared';
import { ErrorDeApi, clienteHttp } from '@/compartido/servicios/clienteHttp';
import { clienteSupabase } from './clienteSupabase';

/**
 * SERVICIO de sesion.
 *  - Supabase Auth guarda la sesion y renueva el token solo.
 *  - Nuestra API (GET /v1/sesion) dice quien es el usuario y que roles tiene.
 */
export const sesionServicio = {
  async iniciar(correo: string, clave: string): Promise<void> {
    const { error } = await clienteSupabase().auth.signInWithPassword({ email: correo.trim(), password: clave });
    if (error) {
      throw new ErrorDeApi('credenciales_invalidas', 'Correo o contraseña incorrectos', 401);
    }
  },

  async cerrar(): Promise<void> {
    await clienteSupabase().auth.signOut();
  },

  /** token de la sesion actual (o null). Lo usa clienteHttp en cada peticion */
  async token(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const { data } = await clienteSupabase().auth.getSession();
    return data.session?.access_token ?? null;
  },

  perfil: () => clienteHttp.get<SesionUsuario>(RUTAS_API.sesion.actual),

  /** avisa cuando la sesion cambia (inicio, cierre, renovacion); devuelve como dejar de escuchar */
  escuchar(alCambiar: () => void): () => void {
    const { data } = clienteSupabase().auth.onAuthStateChange(() => alCambiar());
    return () => data.subscription.unsubscribe();
  },
};
