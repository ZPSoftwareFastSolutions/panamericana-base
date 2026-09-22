-- migracion 0008: una sola tabla de personas; usuarios, clientes y choferes pasan a ser roles
-- antes, los mismos datos personales vivian repetidos en las tres tablas

create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  tipo_documento text not null references tipos_documento (codigo),
  numero_documento text not null,
  nombres text not null,
  apellidos text not null,
  telefono text,
  correo text,
  fecha_nacimiento date,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint personas_documento_unico unique (tipo_documento, numero_documento)
);

create trigger personas_actualizado_en
  before update on personas
  for each row
  execute function public.set_actualizado_en();

alter table personas enable row level security;

-- 1) las personas que ya existen como clientes
insert into personas (tipo_documento, numero_documento, nombres, apellidos, telefono, correo, fecha_nacimiento, creado_en)
select c.tipo_documento, c.numero_documento, c.nombres, c.apellidos, c.telefono, c.correo, c.fecha_nacimiento, c.creado_en
  from clientes c
on conflict (tipo_documento, numero_documento) do nothing;

-- 2) los choferes que no son ya una persona registrada
insert into personas (tipo_documento, numero_documento, nombres, apellidos, telefono, creado_en)
select ch.tipo_documento, ch.numero_documento, ch.nombres, ch.apellidos, ch.telefono, ch.creado_en
  from choferes ch
on conflict (tipo_documento, numero_documento) do nothing;

-- 3) los usuarios internos no guardaban documento: se registra el de las dos cuentas de prueba
insert into personas (tipo_documento, numero_documento, nombres, apellidos, correo, creado_en)
select 'ci',
       case u.id
         when '00000000-0000-4000-8000-000000000001'::uuid then '3948271'
         when '00000000-0000-4000-8000-000000000002'::uuid then '5271830'
         else 'pendiente-' || left(replace(u.id::text, '-', ''), 8)
       end,
       u.nombres, u.apellidos, u.correo, u.creado_en
  from usuarios u
 where not exists (select 1 from personas p where p.correo = u.correo)
on conflict (tipo_documento, numero_documento) do nothing;

-- enlace de cada rol con su persona
alter table clientes add column if not exists persona_id uuid references personas (id);
alter table choferes add column if not exists persona_id uuid references personas (id);
alter table usuarios add column if not exists persona_id uuid references personas (id);

update clientes c
   set persona_id = p.id
  from personas p
 where p.tipo_documento = c.tipo_documento
   and p.numero_documento = c.numero_documento;

update choferes ch
   set persona_id = p.id
  from personas p
 where p.tipo_documento = ch.tipo_documento
   and p.numero_documento = ch.numero_documento;

update usuarios u
   set persona_id = (select p.id from personas p where p.correo = u.correo order by p.creado_en limit 1);

alter table clientes alter column persona_id set not null;
alter table choferes alter column persona_id set not null;
alter table usuarios alter column persona_id set not null;

alter table clientes add constraint clientes_persona_unica unique (persona_id);
alter table choferes add constraint choferes_persona_unica unique (persona_id);
alter table usuarios add constraint usuarios_persona_unica unique (persona_id);

-- un usuario puede tener mas de un rol
create table if not exists usuarios_roles (
  usuario_id uuid not null references usuarios (id) on delete cascade,
  rol text not null references roles (codigo),
  creado_en timestamptz not null default now(),
  constraint usuarios_roles_pk primary key (usuario_id, rol)
);

create index if not exists usuarios_roles_rol_idx on usuarios_roles (rol);

alter table usuarios_roles enable row level security;

insert into usuarios_roles (usuario_id, rol)
select u.id, u.rol from usuarios u
on conflict do nothing;

-- los datos personales ya no viven aqui
alter table clientes
  drop column tipo_documento,
  drop column numero_documento,
  drop column nombres,
  drop column apellidos,
  drop column telefono,
  drop column correo,
  drop column fecha_nacimiento,
  drop column usuario_id;

alter table choferes
  drop column tipo_documento,
  drop column numero_documento,
  drop column nombres,
  drop column apellidos,
  drop column telefono;

alter table usuarios
  drop column nombres,
  drop column apellidos,
  drop column rol;
