import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorCroquis } from '@/modulos/croquis/componentes/EditorCroquis';

export const metadata: Metadata = {
  title: 'Croquis del bus',
};

/** PAGINA /admin/buses/[id]/croquis: generar el croquis de un bus y cambiar el tipo de sus asientos */
export default async function PaginaCroquis({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Croquis del bus</h1>
        <Link href="/admin/buses" className="text-blue-700 hover:underline">
          Volver a buses
        </Link>
      </div>
      <EditorCroquis busId={id} />
    </section>
  );
}
