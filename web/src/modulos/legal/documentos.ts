/**
 * DOCUMENTOS LEGALES del portal: el pie de pagina, el mapa del sitio y las casillas de
 * consentimiento enlazan a estas direcciones. Al cambiar un texto, actualizar su fecha.
 */
export const DOCUMENTOS_LEGALES = [
  { ruta: '/terminos', titulo: 'Términos y Condiciones', actualizado: '2026-09-26' },
  { ruta: '/privacidad', titulo: 'Política de Privacidad', actualizado: '2026-09-26' },
  { ruta: '/reembolsos', titulo: 'Política de Reembolsos', actualizado: '2026-09-26' },
  { ruta: '/cookies', titulo: 'Política de Cookies', actualizado: '2026-09-26' },
] as const;

export type RutaLegal = (typeof DOCUMENTOS_LEGALES)[number]['ruta'];

export function documentoLegal(ruta: RutaLegal) {
  return DOCUMENTOS_LEGALES.find((d) => d.ruta === ruta)!;
}
