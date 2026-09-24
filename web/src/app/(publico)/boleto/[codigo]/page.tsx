import { Boleto } from '@/modulos/ventas/componentes/Boleto';

/** PAGINA /boleto/[codigo]: boleto electronico con QR, listo para imprimir */
export default async function PaginaBoleto({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <Boleto codigo={decodeURIComponent(codigo)} />
    </section>
  );
}
