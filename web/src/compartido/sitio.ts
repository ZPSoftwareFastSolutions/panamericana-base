/**
 * DIRECCION PUBLICA DEL SITIO (dominio oficial), por ejemplo https://www.panamericana.com.bo
 * Se configura con NEXT_PUBLIC_SITIO_URL recien en el despliegue oficial. Mientras no exista:
 *  - robots.txt pide a los buscadores NO indexar nada (el sitio aun no es oficial);
 *  - el mapa del sitio sale vacio.
 * Con el dominio configurado, la web no se construye si faltan datos del negocio (ver app/layout.tsx).
 */
export const SITIO_URL: string | null = process.env.NEXT_PUBLIC_SITIO_URL?.replace(/\/$/, '') || null;
