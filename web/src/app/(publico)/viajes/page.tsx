import { BuscadorViajes } from '@/modulos/viajes/componentes/BuscadorViajes';
import { ResultadosBusqueda } from '@/modulos/viajes/componentes/ResultadosBusqueda';

type Parametros = { origen?: string; destino?: string; fecha?: string };

/** PAGINA /viajes?origen=&destino=&fecha= : resultados de la busqueda */
export default async function PaginaViajes({ searchParams }: { searchParams: Promise<Parametros> }) {
  const { origen = '', destino = '', fecha = '' } = await searchParams;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <BuscadorViajes inicial={{ origen, destino, fecha }} />
      <h1 className="text-xl font-bold">Viajes disponibles</h1>
      <ResultadosBusqueda origen={origen} destino={destino} fecha={fecha} />
    </section>
  );
}
