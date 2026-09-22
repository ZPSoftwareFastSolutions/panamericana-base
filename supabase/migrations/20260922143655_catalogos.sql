-- migracion 0007: catalogos de dominio compartido
-- la clave primaria es el codigo legible: la api sigue devolviendo 'ci', 'cama', 'taquilla'

-- division politica de bolivia (ciudad -> departamento era una dependencia dentro de terminales)
create table if not exists departamentos (
  codigo text primary key,
  nombre text not null unique,
  creado_en timestamptz not null default now()
);

alter table departamentos enable row level security;

insert into departamentos (codigo, nombre) values
  ('lp', 'La Paz'),
  ('cb', 'Cochabamba'),
  ('sc', 'Santa Cruz'),
  ('or', 'Oruro'),
  ('pt', 'Potosi'),
  ('ch', 'Chuquisaca'),
  ('tj', 'Tarija'),
  ('be', 'Beni'),
  ('pd', 'Pando')
on conflict (codigo) do nothing;

create table if not exists ciudades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  departamento text not null references departamentos (codigo),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint ciudades_nombre_unico unique (departamento, nombre)
);

create index if not exists ciudades_departamento_idx on ciudades (departamento);

create trigger ciudades_actualizado_en
  before update on ciudades
  for each row
  execute function public.set_actualizado_en();

alter table ciudades enable row level security;

-- las ciudades que ya usan las terminales registradas
insert into ciudades (nombre, departamento)
select distinct t.ciudad, d.codigo
  from terminales t
  join departamentos d on lower(d.nombre) = lower(t.ciudad)
on conflict (departamento, nombre) do nothing;

-- documentos de identidad aceptados en bolivia
create table if not exists tipos_documento (
  codigo text primary key,
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table tipos_documento enable row level security;

insert into tipos_documento (codigo, nombre) values
  ('ci', 'Carnet de identidad'),
  ('ce', 'Cedula de identidad de extranjero'),
  ('pasaporte', 'Pasaporte')
on conflict (codigo) do nothing;

-- tipos de asiento: lo usan asientos y tarifas
create table if not exists tipos_asiento (
  codigo text primary key,
  nombre text not null,
  orden smallint not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  constraint tipos_asiento_orden_valido check (orden > 0)
);

alter table tipos_asiento enable row level security;

insert into tipos_asiento (codigo, nombre, orden) values
  ('normal', 'Normal', 1),
  ('semicama', 'Semicama', 2),
  ('cama', 'Cama', 3)
on conflict (codigo) do nothing;

-- categorias de licencia de conducir (la descripcion la completa el administrador)
create table if not exists categorias_licencia (
  codigo text primary key,
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table categorias_licencia enable row level security;

insert into categorias_licencia (codigo, nombre, descripcion) values
  ('a', 'Categoria A', null),
  ('b', 'Categoria B', null),
  ('c', 'Categoria C', 'Profesional: transporte publico de pasajeros'),
  ('m', 'Categoria M', null),
  ('p', 'Categoria P', null),
  ('t', 'Categoria T', null)
on conflict (codigo) do nothing;

-- canales por los que entra una venta
create table if not exists canales_venta (
  codigo text primary key,
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table canales_venta enable row level security;

insert into canales_venta (codigo, nombre) values
  ('web', 'Portal web'),
  ('movil', 'Aplicacion movil'),
  ('taquilla', 'Taquilla')
on conflict (codigo) do nothing;

-- formas de pago
create table if not exists metodos_pago (
  codigo text primary key,
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table metodos_pago enable row level security;

insert into metodos_pago (codigo, nombre) values
  ('efectivo', 'Efectivo'),
  ('tarjeta', 'Tarjeta de debito o credito'),
  ('transferencia', 'Transferencia bancaria'),
  ('billetera_digital', 'Billetera digital')
on conflict (codigo) do nothing;

-- roles de los usuarios internos
create table if not exists roles (
  codigo text primary key,
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table roles enable row level security;

insert into roles (codigo, nombre, descripcion) values
  ('administrador', 'Administrador', 'Configura la operacion y ve los reportes'),
  ('vendedor', 'Vendedor de taquilla', 'Vende y anula pasajes presenciales'),
  ('encomiendas', 'Encargado de encomiendas', 'Registra y despacha encomiendas'),
  ('cliente', 'Cliente', 'Compra por el portal')
on conflict (codigo) do nothing;
