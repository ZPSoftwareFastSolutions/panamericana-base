import { FormularioLogin } from '@/modulos/sesion/componentes/FormularioLogin';

/** PAGINA /login: acceso del personal. "volver" es la pagina del panel a la que se regresa */
export default async function PaginaLogin({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const { volver } = await searchParams;

  return (
    <section className="flex justify-center px-4 py-12">
      <FormularioLogin volver={volver} />
    </section>
  );
}
