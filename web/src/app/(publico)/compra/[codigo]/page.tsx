import type { Metadata } from 'next';
import { Checkout } from '@/modulos/ventas/componentes/Checkout';

export const metadata: Metadata = {
  title: 'Tu compra',
  robots: { index: false, follow: false },
};

/** PAGINA /compra/[codigo]: pago simulado y confirmacion con los codigos de los pasajes */
export default async function PaginaCompra({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Tu compra</h1>
      <Checkout codigo={decodeURIComponent(codigo)} />
    </section>
  );
}
