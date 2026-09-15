-- migracion 0001: tabla buses (modulo de referencia)
-- reglas: palabras sql en minusculas y nombres de campos en snake_case

create table if not exists buses (
  id uuid primary key default gen_random_uuid(),
  placa text not null unique,
  marca text not null,
  modelo text not null,
  anio_fabricacion integer,
  numero_pisos smallint not null,
  estado text not null default 'activo',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  constraint buses_numero_pisos_valido check (numero_pisos in (1, 2)),
  constraint buses_estado_valido check (estado in ('activo', 'mantenimiento', 'inactivo'))
);

-- la api automatica de supabase no debe exponer esta tabla:
-- se activa rls y no se crean politicas para anon ni authenticated
alter table buses enable row level security;
