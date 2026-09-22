-- migracion 0010: claves naturales, catalogos como clave foranea e integridad del tramo en la base

-- 1) el tramo del pasaje se identifica por (ruta, orden): parada_origen_id y orden_origen eran el mismo dato
alter table pasajes add column if not exists ruta_id uuid;
alter table pasajes add column if not exists bus_id uuid;

update pasajes p
   set ruta_id = v.ruta_id,
       bus_id = v.bus_id
  from viajes v
 where v.id = p.viaje_id;

alter table pasajes alter column ruta_id set not null;
alter table pasajes alter column bus_id set not null;

alter table pasajes drop column parada_origen_id;
alter table pasajes drop column parada_destino_id;

-- 2) claves primarias naturales en las tablas puente
alter table rutas_paradas drop constraint rutas_paradas_orden_unico;
alter table rutas_paradas drop column id;
alter table rutas_paradas add constraint rutas_paradas_pk primary key (ruta_id, orden);

alter table viajes_choferes drop constraint viajes_choferes_unico;
alter table viajes_choferes drop column id;
alter table viajes_choferes add constraint viajes_choferes_pk primary key (viaje_id, chofer_id);

alter table tarifas drop constraint tarifas_unica;
alter table tarifas drop column id;
alter table tarifas add constraint tarifas_pk primary key (viaje_id, tipo_asiento);

-- 3) la base garantiza que parada, ruta, asiento y bus corresponden al viaje del pasaje
alter table viajes add constraint viajes_id_ruta unique (id, ruta_id);
alter table viajes add constraint viajes_id_bus unique (id, bus_id);
alter table asientos add constraint asientos_id_bus unique (id, bus_id);

alter table pasajes
  add constraint pasajes_viaje_ruta foreign key (viaje_id, ruta_id) references viajes (id, ruta_id),
  add constraint pasajes_viaje_bus foreign key (viaje_id, bus_id) references viajes (id, bus_id),
  add constraint pasajes_asiento_del_bus foreign key (asiento_id, bus_id) references asientos (id, bus_id),
  add constraint pasajes_parada_origen foreign key (ruta_id, orden_origen) references rutas_paradas (ruta_id, orden),
  add constraint pasajes_parada_destino foreign key (ruta_id, orden_destino) references rutas_paradas (ruta_id, orden);

create index if not exists pasajes_ruta_id_idx on pasajes (ruta_id);
create index if not exists pasajes_bus_id_idx on pasajes (bus_id);

-- 4) los dominios compartidos dejan de ser listas repetidas en cada check
alter table terminales add column if not exists ciudad_id uuid references ciudades (id);

update terminales t
   set ciudad_id = c.id
  from ciudades c
 where lower(c.nombre) = lower(t.ciudad);

alter table terminales alter column ciudad_id set not null;
alter table terminales drop column ciudad;
create index if not exists terminales_ciudad_id_idx on terminales (ciudad_id);

alter table asientos drop constraint asientos_tipo_valido;
alter table asientos add constraint asientos_tipo_fk foreign key (tipo) references tipos_asiento (codigo);

alter table tarifas drop constraint tarifas_tipo_valido;
alter table tarifas add constraint tarifas_tipo_asiento_fk foreign key (tipo_asiento) references tipos_asiento (codigo);

alter table ventas drop constraint ventas_canal_valido;
alter table ventas add constraint ventas_canal_fk foreign key (canal) references canales_venta (codigo);

alter table pagos drop constraint pagos_metodo_valido;
alter table pagos add constraint pagos_metodo_fk foreign key (metodo) references metodos_pago (codigo);

update choferes set categoria_licencia = lower(categoria_licencia);
alter table choferes add constraint choferes_categoria_fk foreign key (categoria_licencia) references categorias_licencia (codigo);
