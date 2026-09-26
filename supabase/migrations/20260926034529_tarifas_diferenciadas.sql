-- tarifas diferenciadas que la normativa boliviana exige en el transporte interdepartamental
-- (catalogo con el codigo como clave, igual que los demas catalogos)
create table if not exists tipos_pasajero (
  codigo text primary key,
  nombre text not null,
  descuento_porcentaje numeric(5, 2) not null,
  requisito text,
  base_legal text,
  orden smallint not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  constraint tipos_pasajero_descuento_valido check (descuento_porcentaje >= 0 and descuento_porcentaje < 100),
  constraint tipos_pasajero_orden_valido check (orden > 0)
);

alter table tipos_pasajero enable row level security;

insert into tipos_pasajero (codigo, nombre, descuento_porcentaje, requisito, base_legal, orden) values
  ('general', 'General', 0, null, null, 1),
  ('adulto_mayor', 'Persona adulta mayor (60 años o más)', 20, 'Cédula de identidad', 'Ley N° 1886, artículo 6', 2),
  ('discapacidad', 'Persona con discapacidad grave o muy grave', 50, 'Carnet de discapacidad vigente', 'Ley N° 223 y DS N° 1893, artículo 34 (tarifa preferencial regulada por la ATT)', 3),
  ('menor', 'Niña o niño de 3 a 12 años', 50, 'Cédula de identidad o certificado de nacimiento', 'Reglamento regulatorio de transporte terrestre de pasajeros, artículo 81', 4)
on conflict (codigo) do nothing;

-- cada pasaje guarda con que tarifa se vendio; el precio del pasaje ya es el precio con descuento
alter table pasajes
  add column if not exists tipo_pasajero text not null default 'general'
    constraint pasajes_tipo_pasajero_fk references tipos_pasajero (codigo);
