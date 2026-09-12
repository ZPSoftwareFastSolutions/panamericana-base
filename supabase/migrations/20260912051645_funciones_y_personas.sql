-- migracion 0002: funcion comun de auditoria, usuarios y clientes

-- mantiene actualizado_en al dia en cada update
create or replace function public.set_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger buses_actualizado_en
  before update on buses
  for each row
  execute function public.set_actualizado_en();

-- personas que inician sesion (las contrasenas las gestiona supabase auth)
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  correo text not null unique,
  rol text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint usuarios_rol_valido check (rol in ('administrador', 'vendedor', 'encomiendas', 'cliente'))
);

create trigger usuarios_actualizado_en
  before update on usuarios
  for each row
  execute function public.set_actualizado_en();

alter table usuarios enable row level security;

-- pasajeros, remitentes y destinatarios (no necesitan cuenta)
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique references usuarios (id) on delete set null,
  tipo_documento text not null,
  numero_documento text not null,
  nombres text not null,
  apellidos text not null,
  telefono text,
  correo text,
  fecha_nacimiento date,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint clientes_tipo_documento_valido check (tipo_documento in ('dni', 'ce', 'pasaporte')),
  constraint clientes_documento_unico unique (tipo_documento, numero_documento)
);

create index if not exists clientes_usuario_id_idx on clientes (usuario_id);

create trigger clientes_actualizado_en
  before update on clientes
  for each row
  execute function public.set_actualizado_en();

alter table clientes enable row level security;
