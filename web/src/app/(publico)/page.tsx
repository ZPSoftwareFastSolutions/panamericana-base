import { BuscadorViajes } from '@/modulos/viajes/componentes/BuscadorViajes';

// solo lo que el sistema hace hoy (sin promesas ni cifras que no se puedan respaldar)
const BENEFICIOS = [
  { titulo: 'Compra en línea', texto: 'Elige tu viaje y tu asiento desde el celular o la computadora.' },
  { titulo: 'Tu asiento, tu tramo', texto: 'Compra solo el tramo que viajas, de una parada a otra de la ruta.' },
  { titulo: 'Encomiendas', texto: 'Envía paquetes desde la terminal y sigue su recorrido con un código.' },
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
          <p className="text-slate-200">Busca tu viaje, elige tu asiento y compra tu pasaje por tramos.</p>
        </div>
      </section>

      <section aria-label="Buscar viajes" className="-mt-10 px-4">
        <div className="mx-auto max-w-5xl">
          <BuscadorViajes />
        </div>
      </section>

      <section aria-label="Servicios" className="px-4 py-12">
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
