-- migracion 0003: asientos, choferes, terminales, rutas, paradas, viajes y tarifas

-- asientos fisicos de cada bus (fila y columna permiten dibujar el croquis)
create table if not exists asientos (
  id uuid primary key default gen_random_uuid(),
  bus_id uuid not null references buses (id) on delete cascade,
  numero smallint not null,
  piso smallint not null,
  fila smallint not null,
  columna smallint not null,
  tipo text not null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint asientos_piso_valido check (piso in (1, 2)),
  constraint asientos_tipo_valido check (tipo in ('normal', 'semicama', 'cama')),
  constraint asientos_numero_unico unique (bus_id, numero),
  constraint asientos_posicion_unica unique (bus_id, piso, fila, columna)
);

create index if not exists asientos_bus_id_idx on asientos (bus_id);

create trigger asientos_actualizado_en
  before update on asientos
  for each row
  execute function public.set_actualizado_en();

alter table asientos enable row level security;

-- tripulacion
create table if not exists choferes (
  id uuid primary key default gen_random_uuid(),
  tipo_documento text not null,
  numero_documento text not null,
  nombres text not null,
  apellidos text not null,
  numero_licencia text not null unique,
  categoria_licencia text not null,
  fecha_vencimiento_licencia date not null,
  telefono text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint choferes_tipo_documento_valido check (tipo_documento in ('dni', 'ce', 'pasaporte')),
  constraint choferes_documento_unico unique (tipo_documento, numero_documento)
);

create trigger choferes_actualizado_en
  before update on choferes
  for each row
  execute function public.set_actualizado_en();

alter table choferes enable row level security;

-- terminales de salida, paso y llegada
create table if not exists terminales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  ciudad text not null,
  direccion text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create trigger terminales_actualizado_en
  before update on terminales
  for each row
  execute function public.set_actualizado_en();

alter table terminales enable row level security;

-- una ruta es una secuencia de paradas: el origen y el destino son la primera y la ultima
create table if not exists rutas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  distancia_km numeric(7, 2),
  duracion_estimada_min integer not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint rutas_duracion_valida check (duracion_estimada_min > 0),
  constraint rutas_distancia_valida check (distancia_km is null or distancia_km > 0)
);

create trigger rutas_actualizado_en
  before update on rutas
  for each row
  execute function public.set_actualizado_en();

alter table rutas enable row level security;

create table if not exists rutas_paradas (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid not null references rutas (id) on delete cascade,
  terminal_id uuid not null references terminales (id),
  orden smallint not null,
  minutos_desde_origen integer not null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint rutas_paradas_orden_valido check (orden >= 1),
  constraint rutas_paradas_minutos_valido check (minutos_desde_origen >= 0),
  constraint rutas_paradas_orden_unico unique (ruta_id, orden),
  constraint rutas_paradas_terminal_unico unique (ruta_id, terminal_id)
);

create index if not exists rutas_paradas_ruta_id_idx on rutas_paradas (ruta_id);
create index if not exists rutas_paradas_terminal_id_idx on rutas_paradas (terminal_id);

create trigger rutas_paradas_actualizado_en
  before update on rutas_paradas
  for each row
  execute function public.set_actualizado_en();

alter table rutas_paradas enable row level security;

-- un bus recorriendo una ruta en una fecha y hora
create table if not exists viajes (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid not null references rutas (id),
  bus_id uuid not null references buses (id),
  fecha_salida timestamptz not null,
  fecha_llegada_estimada timestamptz not null,
  precio_base numeric(10, 2) not null,
  estado text not null default 'programado',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint viajes_estado_valido check (estado in ('programado', 'en_ruta', 'finalizado', 'cancelado')),
  constraint viajes_precio_valido check (precio_base > 0),
  constraint viajes_fechas_validas check (fecha_llegada_estimada > fecha_salida)
);

create index if not exists viajes_ruta_id_idx on viajes (ruta_id);
create index if not exists viajes_bus_id_idx on viajes (bus_id);
create index if not exists viajes_fecha_salida_idx on viajes (fecha_salida);

create trigger viajes_actualizado_en
  before update on viajes
  for each row
  execute function public.set_actualizado_en();

alter table viajes enable row level security;

-- tripulacion asignada a cada viaje
create table if not exists viajes_choferes (
  id uuid primary key default gen_random_uuid(),
  viaje_id uuid not null references viajes (id) on delete cascade,
  chofer_id uuid not null references choferes (id),
  rol text not null,
  creado_en timestamptz not null default now(),
  constraint viajes_choferes_rol_valido check (rol in ('conductor', 'ayudante')),
  constraint viajes_choferes_unico unique (viaje_id, chofer_id)
);

create index if not exists viajes_choferes_viaje_id_idx on viajes_choferes (viaje_id);
create index if not exists viajes_choferes_chofer_id_idx on viajes_choferes (chofer_id);

alter table viajes_choferes enable row level security;

-- precio por tipo de asiento; si no hay fila, se usa viajes.precio_base
create table if not exists tarifas (
  id uuid primary key default gen_random_uuid(),
  viaje_id uuid not null references viajes (id) on delete cascade,
  tipo_asiento text not null,
  precio numeric(10, 2) not null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint tarifas_tipo_valido check (tipo_asiento in ('normal', 'semicama', 'cama')),
  constraint tarifas_precio_valido check (precio > 0),
  constraint tarifas_unica unique (viaje_id, tipo_asiento)
);

create trigger tarifas_actualizado_en
  before update on tarifas
  for each row
  execute function public.set_actualizado_en();

alter table tarifas enable row level security;
