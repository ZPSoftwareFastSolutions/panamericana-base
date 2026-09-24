/**
 * La cuenta de un usuario interno con sus roles.
 * El id es el mismo en Supabase Auth (el "sub" del token) y en la tabla usuarios.
 */
export type Cuenta = {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  roles: string[];
};

/** regla de acceso: sin roles exigidos basta con la cuenta; si no, debe tener al menos uno */
export function puedeAcceder(cuenta: Cuenta, rolesPermitidos: string[]): boolean {
  if (rolesPermitidos.length === 0) return true;
  return cuenta.roles.some((rol) => rolesPermitidos.includes(rol));
}
