import { NEGOCIO, NOMBRES_DATOS_NEGOCIO } from '@panamericana/shared';
import type { DatosNegocio } from '@panamericana/shared';

/**
 * un dato del negocio (razon social, NIT, telefono...) tal como esta en shared/src/negocio.ts.
 * Si la empresa todavia no lo confirmo, se ve resaltado como "[por completar]" (el texto de al lado
 * ya dice que dato es): el sitio oficial no se puede construir asi (ver app/layout.tsx).
 */
export function DatoDelNegocio({ dato }: { dato: keyof DatosNegocio }) {
  const valor = NEGOCIO[dato];
  if (valor) return <>{valor}</>;
  return (
    <span title={`Falta: ${NOMBRES_DATOS_NEGOCIO[dato]}`} className="rounded bg-amber-100 px-1 text-amber-900">
      [por completar]
    </span>
  );
}
