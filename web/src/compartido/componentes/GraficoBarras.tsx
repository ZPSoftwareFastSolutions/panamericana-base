/**
 * GRAFICO DE BARRAS agrupadas en SVG, sin librerias: una categoria por grupo (por ejemplo, un dia)
 * y una barra por serie (por ejemplo, pasajes estimados y capacidad).
 * Se adapta al ancho de la pantalla; cada barra muestra su valor al pasar el mouse.
 */
export type SerieDelGrafico = { nombre: string; color: string; valores: number[] };

type Propiedades = {
  categorias: string[];
  series: SerieDelGrafico[];
  /** marca en rojo la categoria (por ejemplo, un dia con alerta de refuerzo) */
  resaltadas?: boolean[];
  titulo: string;
  /** alto del grafico en pixeles */
  alto?: number;
};

export function GraficoBarras({ categorias, series, resaltadas = [], titulo, alto = 180 }: Propiedades) {
  const maximo = Math.max(1, ...series.flatMap((s) => s.valores));
  const anchoGrupo = 100 / Math.max(1, categorias.length);
  const anchoBarra = (anchoGrupo * 0.8) / Math.max(1, series.length);

  return (
    <figure className="flex flex-col gap-2">
      <svg
        role="img"
        aria-label={titulo}
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="w-full rounded bg-slate-50"
        style={{ height: alto }}
      >
        {categorias.map((categoria, i) =>
          series.map((serie, j) => {
            const valor = serie.valores[i] ?? 0;
            const altura = (valor / maximo) * 58;
            return (
              <rect
                key={`${categoria}-${serie.nombre}`}
                x={i * anchoGrupo + anchoGrupo * 0.1 + j * anchoBarra}
                y={60 - altura}
                width={anchoBarra * 0.9}
                height={altura}
                fill={resaltadas[i] && j === 0 ? '#dc2626' : serie.color}
              >
                <title>{`${categoria} · ${serie.nombre}: ${valor}`}</title>
              </rect>
            );
          }),
        )}
      </svg>
      <div className="flex justify-between gap-1 text-[10px] text-slate-500">
        {categorias.map((c) => (
          <span key={c} className="flex-1 text-center">
            {c}
          </span>
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-3 text-xs text-slate-600">
        {series.map((s) => (
          <span key={s.nombre} className="flex items-center gap-1">
            <i className="h-3 w-3 rounded" style={{ background: s.color }} /> {s.nombre}
          </span>
        ))}
        {resaltadas.some(Boolean) && (
          <span className="flex items-center gap-1">
            <i className="h-3 w-3 rounded bg-red-600" /> refuerzo sugerido
          </span>
        )}
      </figcaption>
    </figure>
  );
}
