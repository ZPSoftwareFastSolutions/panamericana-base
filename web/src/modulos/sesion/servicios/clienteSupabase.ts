import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase SOLO para iniciar y cerrar sesion.
 * Los datos NUNCA se leen de Supabase directo: siempre pasan por nuestra API.
 * Usa la clave publicable (sb_publishable_...), que esta hecha para el navegador.
 */
let cliente: SupabaseClient | null = null;

export function clienteSupabase(): SupabaseClient {
  if (!cliente) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !clave) {
      throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en web/.env.local');
    }
    cliente = createClient(url, clave, { auth: { persistSession: true, autoRefreshToken: true } });
  }
  return cliente;
}
