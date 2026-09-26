'use client';

import Link from 'next/link';
import { useSesion } from '../hooks/useSesion';

const ACCESOS = [
  { rol: 'administrador', titulo: 'Panel de indicadores', texto: 'Ventas, ocupación y demanda estimada', ruta: '/admin/panel' },
  { rol: 'vendedor', titulo: 'Taquilla', texto: 'Vender en efectivo y anular pasajes', ruta: '/admin/taquilla' },
  { rol: 'administrador', titulo: 'Taquilla', texto: 'Vender en efectivo y anular pasajes', ruta: '/admin/taquilla' },
  { rol: 'encomiendas', titulo: 'Encomiendas', texto: 'Registrar, despachar y entregar envíos', ruta: '/admin/encomiendas' },
  { rol: 'administrador', titulo: 'Encomiendas', texto: 'Registrar, despachar y entregar envíos', ruta: '/admin/encomiendas' },
  { rol: 'administrador', titulo: 'Programar viajes', texto: 'Ruta, bus, horario y tarifas', ruta: '/admin/viajes' },
  { rol: 'administrador', titulo: 'Rutas y paradas', texto: 'Recorridos que se venden por tramos', ruta: '/admin/rutas' },
  { rol: 'vendedor', titulo: 'Clientes', texto: 'Pasajeros, remitentes y destinatarios', ruta: '/admin/clientes' },
  { rol: 'encomiendas', titulo: 'Clientes', texto: 'Remitentes y destinatarios', ruta: '/admin/clientes' },
];

/** pagina de inicio del panel: saludo y accesos segun el rol */
export function Bienvenida() {
  const { data: usuario } = useSesion();
  if (!usuario) return null;

  const accesos = ACCESOS.filter((a) => usuario.roles.includes(a.rol)).filter(
    (a, i, lista) => lista.findIndex((b) => b.ruta === a.ruta) === i,
  );

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Hola, {usuario.nombres}</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accesos.map((acceso) => (
          <li key={acceso.ruta}>
            <Link href={acceso.ruta} className="block rounded-lg border border-slate-300 bg-white p-4 hover:border-slate-900">
              <h2 className="font-semibold">{acceso.titulo}</h2>
              <p className="text-sm text-slate-600">{acceso.texto}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
