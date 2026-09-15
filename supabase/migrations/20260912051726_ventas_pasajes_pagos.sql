-- migracion 0004: ventas, pasajes (con proteccion por tramos) y pagos

-- btree_gist permite combinar "=" con rangos en una restriccion de exclusion
create extension if not exists btree_gist with schema extensions;

set search_path = public, extensions;

-- una operacion de compra: agrupa varios pasajes y/o encomiendas y se cobra una sola vez
create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  cliente_id uuid references clientes (id),
  usuario_id uuid references usuarios (id),
  canal text not null,
  total numeric(10, 2) not null default 0,
  estado text not null default 'pendiente',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint ventas_canal_valido check (canal in ('web', 'movil', 'taquilla')),
  constraint ventas_estado_valido check (estado in ('pendiente', 'pagada', 'anulada', 'expirada')),
  constraint ventas_total_valido check (total >= 0)
);

create index if not exists ventas_cliente_id_idx on ventas (cliente_id);
create index if not exists ventas_usuario_id_idx on ventas (usuario_id);

create trigger ventas_actualizado_en
  before update on ventas
  for each row
  execute function public.set_actualizado_en();

alter table ventas enable row level security;

-- un pasaje ocupa un asiento en un tramo del viaje (de la parada orden_origen a orden_destino)
create table if not exists pasajes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  venta_id uuid not null references ventas (id) on delete cascade,
  viaje_id uuid not null references viajes (id),
  asiento_id uuid not null references asientos (id),
  cliente_id uuid not null references clientes (id),
  parada_origen_id uuid not null references rutas_paradas (id),
  parada_destino_id uuid not null references rutas_paradas (id),
  orden_origen smallint not null,
  orden_destino smallint not null,
  precio numeric(10, 2) not null,
  estado text not null default 'reservado',
  reservado_hasta timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint pasajes_estado_valido check (estado in ('reservado', 'pagado', 'anulado', 'expirado')),
  constraint pasajes_precio_valido check (precio >= 0),
  constraint pasajes_tramo_valido check (orden_destino > orden_origen),

  -- para el mismo viaje y asiento, dos pasajes activos no pueden tener tramos que se crucen
  constraint pasajes_asiento_sin_traslape exclude using gist (
    viaje_id with =,
    asiento_id with =,
    int4range(orden_origen::integer, orden_destino::integer) with &&
  ) where (estado in ('reservado', 'pagado'))
);

create index if not exists pasajes_venta_id_idx on pasajes (venta_id);
create index if not exists pasajes_viaje_id_idx on pasajes (viaje_id);
create index if not exists pasajes_cliente_id_idx on pasajes (cliente_id);

create trigger pasajes_actualizado_en
  before update on pasajes
  for each row
  execute function public.set_actualizado_en();

alter table pasajes enable row level security;

-- el pago corresponde a la venta completa, no a un pasaje suelto
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas (id) on delete cascade,
  monto numeric(10, 2) not null,
  metodo text not null,
  estado text not null default 'pendiente',
  referencia_externa text,
  creado_en timestamptz not null default now(),
  constraint pagos_metodo_valido check (metodo in ('efectivo', 'tarjeta', 'transferencia', 'billetera_digital')),
  constraint pagos_estado_valido check (estado in ('pendiente', 'aprobado', 'rechazado', 'reembolsado')),
  constraint pagos_monto_valido check (monto > 0)
);

create index if not exists pagos_venta_id_idx on pagos (venta_id);

alter table pagos enable row level security;
