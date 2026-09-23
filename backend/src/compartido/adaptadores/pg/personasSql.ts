import type { PoolClient } from 'pg';
import type { Persona } from '../../dominio/Persona';

/**
 * Guarda una persona y devuelve su id.
 *
 * Si ya existe una persona con ese documento (por ejemplo, un chofer que ahora
 * compra un pasaje), NO se crea otra: se reutiliza la existente. Sus nombres no se
 * tocan (el documento identifica a la persona) y solo se completan el celular, el
 * correo y la fecha de nacimiento si llegaron nuevos. Asi el dato vive una sola vez.
 *
 * Por eso los casos de uso, despues de guardar, vuelven a leer el registro:
 * devuelven lo que REALMENTE quedo en la base.
 *
 * Se llama dentro de enTransaccion(), junto con el insert del rol (cliente, usuario o chofer).
 */
export async function guardarPersona(conexion: PoolClient, persona: Persona): Promise<string> {
  const resultado = await conexion.query<{ id: string }>(
    `insert into personas (tipo_documento, numero_documento, nombres, apellidos,
                           telefono, correo, fecha_nacimiento)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (tipo_documento, numero_documento)
     do update set telefono = coalesce(excluded.telefono, personas.telefono),
                   correo = coalesce(excluded.correo, personas.correo),
                   fecha_nacimiento = coalesce(excluded.fecha_nacimiento, personas.fecha_nacimiento)
     returning id`,
    [
      persona.tipo_documento,
      persona.numero_documento,
      persona.nombres,
      persona.apellidos,
      persona.telefono,
      persona.correo,
      persona.fecha_nacimiento,
    ],
  );

  const fila = resultado.rows[0];
  if (!fila) {
    throw new Error('La base no devolvio el id de la persona');
  }
  return fila.id;
}
