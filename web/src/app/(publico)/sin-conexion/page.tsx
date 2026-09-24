import Link from 'next/link';

/** PAGINA /sin-conexion: la muestra la PWA cuando el celular no tiene internet */
export default function PaginaSinConexion() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-bold">Sin conexion</h1>
      <p className="text-slate-600">
        Para buscar viajes y comprar pasajes hace falta internet: los asientos y los precios cambian a cada momento.
      </p>
      <Link href="/" className="rounded bg-slate-900 px-4 py-2 font-medium text-white">
        Volver a intentar
      </Link>
    </section>
  );
}
