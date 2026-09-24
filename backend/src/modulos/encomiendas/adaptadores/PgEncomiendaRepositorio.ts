import type { Pool } from 'pg';
import { guardarCliente } from '../../../compartido/adaptadores/pg/personasSql';
import { enTransaccion } from '../../../compartido/adaptadores/pg/transaccion';
import type { EncomiendaNueva, EstadoEncomienda } from '../dominio/Encomienda';
import type { CambioDeEstado, EncomiendaDetalle, EncomiendaRepositorio } from '../dominio/EncomiendaRepositorio';

const persona = (alias: string) =>
  `json_build_object('tipo_documento', ${alias}.tipo_documento, 'numero_documento', ${alias}.numero_documento,
                     'nombres', ${alias}.nombres, 'apellidos', ${alias}.apellidos, 'telefono', ${alias}.telefono)`;

const terminal = (t: string, c: string) => `json_build_object('id', ${t}.id, 'nombre', ${t}.nombre, 'ciudad', ${c}.nombre)`;

// el estado NO esta en la tabla: sale del ultimo registro del historial (vista encomiendas_estado_actual)
const CONSULTA_ENCOMIENDAS = `
  select e.id, e.codigo_seguimiento, ea.estado, e.descripcion,
         e.peso_kg::float8 as peso_kg, e.costo::float8 as costo, e.creado_en,
         ${persona('pr')} as remitente,
         ${persona('pd')} as destinatario,
         ${terminal('tor', 'cor')} as terminal_origen,
         ${terminal('tde', 'cde')} as terminal_destino,
         case when v.id is null then null
              else json_build_object('id', v.id, 'fecha_salida', v.fecha_salida, 'ruta', r.nombre, 'bus', b.placa) end as viaje,
         case when ve.id is null then null else json_build_object('codigo', ve.codigo) end as venta,
         coalesce((select json_agg(json_build_object('estado', h.estado, 'observacion', h.observacion,
                                                     'fecha', h.creado_en,
                                                     'usuario', up.nombres || ' ' || up.apellidos)
                                   order by h.creado_en, h.id)
                     from historial_encomiendas h
                     join usuarios u on u.id = h.usuario_id
                     join personas up on up.id = u.persona_id
                    where h.encomienda_id = e.id), '[]') as historial
    from encomiendas e
    join encomiendas_estado_actual ea on ea.encomienda_id = e.id
    join clientes cr on cr.id = e.remitente_id
    join personas pr on pr.id = cr.persona_id
    join clientes cd on cd.id = e.destinatario_id
    join personas pd on pd.id = cd.persona_id
    join terminales tor on tor.id = e.terminal_origen_id
    join ciudades cor on cor.id = tor.ciudad_id
    join terminales tde on tde.id = e.terminal_destino_id
    join ciudades cde on cde.id = tde.ciudad_id
    left join viajes v on v.id = e.viaje_id
    left join rutas r on r.id = v.ruta_id
    left join buses b on b.id = v.bus_id
    left join ventas ve on ve.id = e.venta_id`;

type FilaEncomienda = Omit<EncomiendaDetalle, 'creado_en'> & { creado_en: Date };

const aDetalle = (fila: FilaEncomienda): EncomiendaDetalle => ({ ...fila, creado_en: fila.creado_en.toISOString() });

/** Aqui, y solo aqui, se escribe SQL del modulo encomiendas. */
export class PgEncomiendaRepositorio implements EncomiendaRepositorio {
  constructor(private readonly db: Pool) {}

  async terminalesActivas(ids: string[]): Promise<string[]> {
    const resultado = await this.db.query<{ id: string }>(
      'select id from terminales where activo and id = any($1::uuid[])',
      [ids],
    );
    return resultado.rows.map((fila) => fila.id);
  }

  async guardar(encomienda: EncomiendaNueva, usuario_id: string): Promise<void> {
    await enTransaccion(this.db, async (conexion) => {
      const remitente_id = await guardarCliente(conexion, encomienda.remitente);
      const destinatario_id = await guardarCliente(conexion, encomienda.destinatario);

      // se cobra en origen: la venta nace pagada, en taquilla y con su pago en efectivo
      await conexion.query(
        `insert into ventas (id, codigo, cliente_id, usuario_id, canal, estado)
         values ($1, $2, $3, $4, 'taquilla', 'pagada')`,
        [encomienda.venta.id, encomienda.venta.codigo, remitente_id, usuario_id],
      );
      await conexion.query(
        `insert into encomiendas (id, codigo_seguimiento, venta_id, remitente_id, destinatario_id,
                                  terminal_origen_id, terminal_destino_id, descripcion, peso_kg, costo, usuario_id)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          encomienda.id,
          encomienda.codigo_seguimiento,
          encomienda.venta.id,
          remitente_id,
          destinatario_id,
          encomienda.terminal_origen_id,
          encomienda.terminal_destino_id,
          encomienda.descripcion,
          encomienda.peso_kg,
          encomienda.costo,
          usuario_id,
        ],
      );
      await conexion.query(
        `insert into pagos (venta_id, monto, metodo, estado, referencia_externa)
         values ($1, $2, 'efectivo', 'aprobado', $3)`,
        [encomienda.venta.id, encomienda.costo, `EFECTIVO-${encomienda.venta.codigo}`],
      );
      await conexion.query(
        `insert into historial_encomiendas (encomienda_id, estado, usuario_id) values ($1, 'registrada', $2)`,
        [encomienda.id, usuario_id],
      );
    });
  }

  async listar(estado?: EstadoEncomienda): Promise<EncomiendaDetalle[]> {
    const resultado = await this.db.query<FilaEncomienda>(
      `${CONSULTA_ENCOMIENDAS}
        where ($1::text is null or ea.estado = $1)
        order by e.creado_en desc
        limit 200`,
      [estado ?? null],
    );
    return resultado.rows.map(aDetalle);
  }

  async buscarPorCodigo(codigo: string): Promise<EncomiendaDetalle | null> {
    const resultado = await this.db.query<FilaEncomienda>(`${CONSULTA_ENCOMIENDAS} where e.codigo_seguimiento = $1`, [
      codigo,
    ]);
    return resultado.rows[0] ? aDetalle(resultado.rows[0]) : null;
  }

  async viajeSirve(viaje_id: string, terminal_origen_id: string, terminal_destino_id: string): Promise<boolean> {
    const resultado = await this.db.query(
      `select 1
         from viajes v
         join rutas_paradas po on po.ruta_id = v.ruta_id and po.terminal_id = $2
         join rutas_paradas pd on pd.ruta_id = v.ruta_id and pd.terminal_id = $3 and pd.orden > po.orden
        where v.id = $1 and v.estado in ('programado', 'en_ruta')`,
      [viaje_id, terminal_origen_id, terminal_destino_id],
    );
    return (resultado.rowCount ?? 0) > 0;
  }

  async registrarCambio(cambio: CambioDeEstado): Promise<boolean> {
    return enTransaccion(this.db, async (conexion) => {
      // la encomienda se bloquea: dos cambios simultaneos se atienden de a uno
      const encomienda = await conexion.query<{ venta_id: string | null; costo: string; codigo_seguimiento: string }>(
        'select venta_id, costo, codigo_seguimiento from encomiendas where id = $1 for update',
        [cambio.encomienda_id],
      );
      const fila = encomienda.rows[0];
      if (!fila) return false;

      // con el turno tomado se vuelve a mirar el estado: si otro lo cambio, no se guarda nada
      const actual = await conexion.query<{ estado: string }>(
        'select estado from encomiendas_estado_actual where encomienda_id = $1',
        [cambio.encomienda_id],
      );
      if (actual.rows[0]?.estado !== cambio.estado_esperado) return false;

      if (cambio.viaje_id) {
        await conexion.query('update encomiendas set viaje_id = $2 where id = $1', [
          cambio.encomienda_id,
          cambio.viaje_id,
        ]);
      }
      await conexion.query(
        `insert into historial_encomiendas (encomienda_id, estado, observacion, usuario_id) values ($1, $2, $3, $4)`,
        [cambio.encomienda_id, cambio.estado_nuevo, cambio.observacion, cambio.usuario_id],
      );

      if (cambio.reembolsar && fila.venta_id) {
        await conexion.query(
          `insert into pagos (venta_id, monto, metodo, estado, referencia_externa)
           values ($1, $2, 'efectivo', 'reembolsado', $3)`,
          [fila.venta_id, fila.costo, `REEMBOLSO-${fila.codigo_seguimiento}`],
        );
        await conexion.query(`update ventas set estado = 'anulada' where id = $1`, [fila.venta_id]);
      }
      return true;
    });
  }
}
