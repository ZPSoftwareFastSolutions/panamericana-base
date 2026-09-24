import { existsSync } from 'node:fs';
import type { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearPool } from '../../../infraestructura/baseDeDatos';
import { ReservarAsientos } from '../casos-de-uso/ReservarAsientos';
import { AsientoNoDisponibleError } from '../dominio/errores';
import { PgVentaRepositorio } from './PgVentaRepositorio';

/**
 * PRUEBA DE INTEGRACION: compras simultaneas contra la base REAL (npm run test:integracion).
 *
 * Usa el caso de uso y el repositorio de verdad (sin dobles) para demostrar el requisito critico:
 * nunca se vende dos veces el mismo asiento en tramos que se cruzan, ni siquiera si muchas
 * personas lo intentan en el mismo instante. Crea un bus y un viaje de prueba y los borra al final.
 */

if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');

const RUTA = '00000000-0000-4000-8000-000000000601'; // La Paz (1) -> Oruro (2) -> Cochabamba (3)
const PLACA = '9905QAT';
const PREFIJO_DOCUMENTO = '94';

let db: Pool;
let viaje = '';
const asientos: string[] = [];

// la prueba usa los numeros 0 a 101; se borran SOLO esos documentos (la base es compartida)
const documento = (n: number) => `${PREFIJO_DOCUMENTO}${String(n).padStart(5, '0')}`;
const DOCUMENTOS_DE_PRUEBA = Array.from({ length: 102 }, (_, n) => documento(n));

const pasajero = (asiento_id: string, n: number) => ({
  asiento_id,
  tipo_documento: 'ci',
  numero_documento: documento(n),
  nombres: 'Prueba',
  apellidos: `Concurrencia ${n}`,
});

async function limpiar() {
  await db.query(
    `delete from pagos where venta_id in (select p.venta_id from pasajes p join viajes v on v.id = p.viaje_id
                                           join buses b on b.id = v.bus_id where b.placa = $1)`,
    [PLACA],
  );
  await db.query(
    `delete from ventas where id in (select p.venta_id from pasajes p join viajes v on v.id = p.viaje_id
                                     join buses b on b.id = v.bus_id where b.placa = $1)`,
    [PLACA],
  );
  await db.query(`delete from clientes where persona_id in (select id from personas where numero_documento = any($1))`, [
    DOCUMENTOS_DE_PRUEBA,
  ]);
  await db.query(`delete from personas where numero_documento = any($1)`, [DOCUMENTOS_DE_PRUEBA]);
  await db.query(`delete from viajes where bus_id in (select id from buses where placa = $1)`, [PLACA]);
  await db.query(`delete from buses where placa = $1`, [PLACA]);
}

describe.skipIf(!process.env.DATABASE_URL)('Compras simultaneas contra la base real', () => {
  beforeAll(async () => {
    db = crearPool(process.env.DATABASE_URL!);
    await limpiar(); // por si una corrida anterior se corto a la mitad
    const bus = await db.query<{ id: string }>(
      `insert into buses (placa, marca, modelo, numero_pisos) values ($1, 'Prueba', 'Concurrencia', 1) returning id`,
      [PLACA],
    );
    for (const numero of [1, 2, 3]) {
      const asiento = await db.query<{ id: string }>(
        `insert into asientos (bus_id, numero, piso, fila, columna, tipo) values ($1, $2, 1, 1, $3, 'semicama') returning id`,
        [bus.rows[0]!.id, numero, [1, 2, 4][numero - 1]],
      );
      asientos.push(asiento.rows[0]!.id);
    }
    const creado = await db.query<{ id: string }>(
      `insert into viajes (ruta_id, bus_id, fecha_salida) values ($1, $2, now() + interval '2 days') returning id`,
      [RUTA, bus.rows[0]!.id],
    );
    viaje = creado.rows[0]!.id;
    await db.query(`insert into tarifas (viaje_id, tipo_asiento, precio) values ($1, 'semicama', 100)`, [viaje]);
  });

  afterAll(async () => {
    await limpiar();
    await db.end();
  });

  const reservar = () => new ReservarAsientos(new PgVentaRepositorio(db), 10);

  it('20 personas a la vez por el mismo asiento y tramo: exactamente una gana', async () => {
    const intentos = await Promise.allSettled(
      Array.from({ length: 20 }, (_, i) =>
        reservar().ejecutar({ viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(asientos[0]!, i)] }),
      ),
    );

    const ganadas = intentos.filter((r) => r.status === 'fulfilled');
    const perdidas = intentos.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    expect(ganadas).toHaveLength(1);
    expect(perdidas).toHaveLength(19);
    expect(perdidas.every((r) => r.reason instanceof AsientoNoDisponibleError)).toBe(true);

    const vendidos = await db.query(`select count(*)::int as n from pasajes where viaje_id = $1 and asiento_id = $2`, [
      viaje,
      asientos[0],
    ]);
    expect(vendidos.rows[0].n).toBe(1);
  });

  it('el mismo asiento en tramos que NO se cruzan (1-2 y 2-3) se vende dos veces, a la vez', async () => {
    const [primero, segundo] = await Promise.allSettled([
      reservar().ejecutar({ viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(asientos[1]!, 100)] }),
      reservar().ejecutar({ viaje_id: viaje, orden_origen: 2, orden_destino: 3, pasajeros: [pasajero(asientos[1]!, 101)] }),
    ]);

    expect([primero!.status, segundo!.status]).toEqual(['fulfilled', 'fulfilled']);
  });

  it('la base rechaza por si sola un pasaje que se cruza aunque el programa no lo revise (23P01)', async () => {
    // se copia el pasaje vendido del tramo 1-2 como si fuera del tramo 1-3, saltandose el caso de uso
    const error = await db
      .query(
        `insert into pasajes (codigo, venta_id, viaje_id, asiento_id, cliente_id, ruta_id, bus_id,
                              orden_origen, orden_destino, precio, estado)
         select 'P-PRUEBA23', venta_id, viaje_id, asiento_id, cliente_id, ruta_id, bus_id, 1, 3, precio, 'pagado'
           from pasajes where viaje_id = $1 and asiento_id = $2 limit 1`,
        [viaje, asientos[0]],
      )
      .then(() => null)
      .catch((e: { code?: string }) => e.code);

    expect(error).toBe('23P01');
  });
});
