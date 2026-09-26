import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sin conexión',
  robots: { index: false, follow: false },
};

/** PAGINA /sin-conexion: la muestra la PWA cuando el celular no tiene internet */
export default function PaginaSinConexion() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-bold">Sin conexión</h1>
      <p className="text-slate-600">
        Para buscar viajes y comprar pasajes hace falta internet: los asientos y los precios cambian a cada momento.
      </p>
      <Link href="/" className="inline-flex min-h-11 items-center rounded bg-slate-900 px-4 py-2 font-medium text-white">
        Volver a intentar
      </Link>
    </section>
  );
}
