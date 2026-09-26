/**
 * GRAFICO DE BARRAS agrupadas en SVG, sin librerias: una categoria por grupo (por ejemplo, un dia)
 * y una barra por serie (por ejemplo, pasajes estimados y capacidad).
 * Se adapta al ancho de la pantalla; cada barra muestra su valor al pasar el mouse y los mismos
 * datos van en una tabla oculta para lectores de pantalla (el dibujo solo no alcanza).
 * Los colores salen de los tokens de globals.css (contraste 3:1 o mas sobre el fondo).
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

const COLOR_ALERTA = 'var(--color-grafico-alerta)';

export function GraficoBarras({
  categorias,
  series,
  resaltadas = [],
  titulo,
  alto = 180,
}: Propiedades) {
  const maximo = Math.max(1, ...series.flatMap((s) => s.valores));
  const anchoGrupo = 100 / Math.max(1, categorias.length);
  const anchoBarra = (anchoGrupo * 0.8) / Math.max(1, series.length);

  return (
    <figure className="flex flex-col gap-2">
      <svg
        aria-hidden="true"
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
                style={{ fill: resaltadas[i] && j === 0 ? COLOR_ALERTA : serie.color }}
              >
                <title>{`${categoria} · ${serie.nombre}: ${valor}`}</title>
              </rect>
            );
          }),
        )}
      </svg>
      <div aria-hidden="true" className="flex justify-between gap-1 text-xs text-slate-600">
        {categorias.map((c) => (
          <span key={c} className="flex-1 text-center">
            {c}
          </span>
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="sr-only">{titulo}.</span>
        {series.map((s) => (
          <span key={s.nombre} className="flex items-center gap-1">
            <i aria-hidden="true" className="h-3 w-3 rounded" style={{ background: s.color }} />{' '}
            {s.nombre}
          </span>
        ))}
        {resaltadas.some(Boolean) && (
          <span className="flex items-center gap-1">
            <i
              aria-hidden="true"
              className="h-3 w-3 rounded"
              style={{ background: COLOR_ALERTA }}
            />{' '}
            refuerzo sugerido
          </span>
        )}
      </figcaption>
      {/* las tablas no respetan el ancho de 1 px de sr-only: se oculta el contenedor */}
      <div className="sr-only">
        <table>
          <caption>{titulo}</caption>
          <thead>
            <tr>
              <th scope="col">Día</th>
              {series.map((s) => (
                <th key={s.nombre} scope="col">
                  {s.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categorias.map((c, i) => (
              <tr key={c}>
                <th scope="row">
                  {c}
                  {resaltadas[i] ? ' (refuerzo sugerido)' : ''}
                </th>
                {series.map((s) => (
                  <td key={s.nombre}>{s.valores[i] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
