'use client';

/**
 * BOTON reutilizable. Usarlo en lugar de <button> para que todo el sistema se vea igual.
 * Mide al menos 44 px de alto (se toca comodo en el celular) y el borde de foco lo pone globals.css.
 *
 * Ejemplo: <Boton type="submit" cargando={registrar.isPending}>Registrar</Boton>
 */
type PropiedadesBoton = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** principal = accion importante (oscuro) · secundario = accion alternativa (borde) */
  variante?: 'principal' | 'secundario';
  /** mientras es true, el boton se desactiva y muestra textoCargando */
  cargando?: boolean;
  textoCargando?: string;
};

const ESTILOS = {
  principal: 'bg-slate-900 text-white hover:bg-slate-700',
  secundario: 'border border-slate-500 bg-white text-slate-900 hover:bg-slate-100',
};

export function Boton({
  variante = 'principal',
  cargando = false,
  textoCargando = 'Procesando...',
  disabled,
  className = '',
  children,
  ...resto
}: PropiedadesBoton) {
  return (
    <button
      {...resto}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`min-h-11 rounded px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
    >
      {cargando ? textoCargando : children}
    </button>
  );
}
