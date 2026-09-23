import { BuscadorViajes } from '@/modulos/viajes/componentes/BuscadorViajes';

const BENEFICIOS = [
  { titulo: 'Compra en linea', texto: 'Elige tu viaje y paga desde el celular, sin filas.' },
  { titulo: 'Tu asiento, tu tramo', texto: 'Escoge el asiento exacto para el tramo que viajas.' },
  { titulo: 'Encomiendas', texto: 'Envia paquetes y sigue su recorrido con un codigo.' },
];

/**
 * PAGINA "/" (portada del portal publico).
 * Diseno pensado primero para celular: una columna, y en pantallas grandes se abre en columnas.
 */
export default function PaginaInicio() {
  return (
    <>
      <section className="bg-slate-900 px-4 pt-8 pb-16 text-white sm:pt-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          <h1 className="text-3xl font-bold sm:text-4xl">Viaja por Bolivia</h1>
          <p className="text-slate-300">
            Busca tu viaje entre La Paz, Oruro, Cochabamba y mas destinos.
          </p>
        </div>
      </section>

      <section className="-mt-10 px-4">
        <div className="mx-auto max-w-5xl">
          <BuscadorViajes />
        </div>
      </section>

      <section className="px-4 py-12">
        <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio.titulo} className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="font-semibold">{beneficio.titulo}</h2>
              <p className="mt-1 text-sm text-slate-600">{beneficio.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
