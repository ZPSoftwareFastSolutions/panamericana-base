-- migracion 0005: encomiendas y su historial de seguimiento

create table if not exists encomiendas (
  id uuid primary key default gen_random_uuid(),
  codigo_seguimiento text not null unique,
  venta_id uuid references ventas (id),
  remitente_id uuid not null references clientes (id),
  destinatario_id uuid not null references clientes (id),
  terminal_origen_id uuid not null references terminales (id),
  terminal_destino_id uuid not null references terminales (id),
  viaje_id uuid references viajes (id),
  descripcion text not null,
  peso_kg numeric(6, 2) not null,
  costo numeric(10, 2) not null,
  estado text not null default 'registrada',
  usuario_id uuid not null references usuarios (id),
  fecha_entrega timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint encomiendas_estado_valido check (estado in ('registrada', 'en_transito', 'en_destino', 'entregada', 'cancelada')),
  constraint encomiendas_peso_valido check (peso_kg > 0),
  constraint encomiendas_costo_valido check (costo >= 0),
  constraint encomiendas_terminales_distintas check (terminal_origen_id <> terminal_destino_id)
);

create index if not exists encomiendas_venta_id_idx on encomiendas (venta_id);
create index if not exists encomiendas_viaje_id_idx on encomiendas (viaje_id);
create index if not exists encomiendas_remitente_id_idx on encomiendas (remitente_id);
create index if not exists encomiendas_destinatario_id_idx on encomiendas (destinatario_id);

create trigger encomiendas_actualizado_en
  before update on encomiendas
  for each row
  execute function public.set_actualizado_en();

alter table encomiendas enable row level security;

-- cada cambio de estado queda registrado para mostrar el seguimiento al cliente
create table if not exists historial_encomiendas (
  id uuid primary key default gen_random_uuid(),
  encomienda_id uuid not null references encomiendas (id) on delete cascade,
  estado text not null,
  observacion text,
  usuario_id uuid not null references usuarios (id),
  creado_en timestamptz not null default now(),
  constraint historial_encomiendas_estado_valido check (estado in ('registrada', 'en_transito', 'en_destino', 'entregada', 'cancelada'))
);

create index if not exists historial_encomiendas_encomienda_id_idx on historial_encomiendas (encomienda_id);

alter table historial_encomiendas enable row level security;
