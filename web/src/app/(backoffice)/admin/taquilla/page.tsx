import type { Metadata } from 'next';
import { AnulacionPasaje } from '@/modulos/taquilla/componentes/AnulacionPasaje';
import { VentaTaquilla } from '@/modulos/taquilla/componentes/VentaTaquilla';

export const metadata: Metadata = {
  title: 'Taquilla',
};

/** /admin/taquilla — venta presencial en efectivo y anulacion de pasajes */
export default function PaginaTaquilla() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Taquilla</h1>
        <p className="text-slate-600">Vende sobre el mismo inventario que el portal: un asiento nunca se vende dos veces.</p>
        <VentaTaquilla />
      </section>
      <section className="flex flex-col gap-3 border-t border-slate-200 pt-6">
        <h2 className="text-xl font-semibold">Anular un pasaje</h2>
        <AnulacionPasaje />
      </section>
    </div>
  );
}
