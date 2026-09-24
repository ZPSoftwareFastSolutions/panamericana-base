import Link from 'next/link';
import { CompraDeAsientos } from '@/modulos/ventas/componentes/CompraDeAsientos';

/** PAGINA /viajes/[id]?desde=2&hasta=3 : croquis del tramo y datos de los pasajeros */
export default async function PaginaElegirAsiento({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { id } = await params;
  const { desde, hasta } = await searchParams;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm text-slate-600 underline">
        ← Nueva busqueda
      </Link>
      <h1 className="text-xl font-bold">Elige tus asientos</h1>
      <CompraDeAsientos viajeId={id} desde={Number(desde)} hasta={Number(hasta)} />
    </section>
  );
}
