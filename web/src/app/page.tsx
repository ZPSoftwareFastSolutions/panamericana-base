import Link from 'next/link';

export default function PaginaInicio() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Panamericana</h1>
      <p className="text-slate-600">
        Portal en construccion. Por ahora esta disponible el panel administrativo.
      </p>
      <Link href="/admin/buses" className="text-blue-700 underline">
        Ir al panel administrativo
      </Link>
    </main>
  );
}
