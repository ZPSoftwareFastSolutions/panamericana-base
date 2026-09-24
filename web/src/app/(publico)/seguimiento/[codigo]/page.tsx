import { SeguimientoEncomienda } from '@/modulos/encomiendas/componentes/SeguimientoEncomienda';

/** PAGINA /seguimiento/[codigo]: estado e historial de una encomienda (sin datos personales) */
export default async function PaginaSeguimiento({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Seguimiento de encomienda</h1>
      <SeguimientoEncomienda codigo={decodeURIComponent(codigo)} />
    </section>
  );
}
