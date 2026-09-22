-- migracion 0009: se quitan las columnas que se pueden calcular y se reemplazan por vistas
-- un dato calculado guardado en dos lugares termina desincronizado

-- los kilometros pasan a medirse por parada, igual que los minutos
alter table rutas_paradas add column if not exists km_desde_origen numeric(7, 2);
alter table rutas_paradas add constraint rutas_paradas_km_valido check (km_desde_origen is null or km_desde_origen >= 0);

update rutas_paradas rp
   set km_desde_origen = round(r.distancia_km * rp.minutos_desde_origen / nullif(r.duracion_estimada_min, 0), 2)
  from rutas r
 where r.id = rp.ruta_id
   and r.distancia_km is not null;

-- el precio base del viaje era, en realidad, la tarifa del asiento normal
insert into tarifas (viaje_id, tipo_asiento, precio)
select v.id, 'normal', v.precio_base
  from viajes v
on conflict (viaje_id, tipo_asiento) do nothing;

-- el estado de una encomienda pasa a deducirse de su historial
insert into historial_encomiendas (encomienda_id, estado, observacion, usuario_id, creado_en)
select e.id, e.estado, 'estado inicial registrado al normalizar el modelo', e.usuario_id, e.creado_en
  from encomiendas e
 where not exists (select 1 from historial_encomiendas h where h.encomienda_id = e.id);

alter table rutas drop column duracion_estimada_min;
alter table rutas drop column distancia_km;

alter table viajes drop column fecha_llegada_estimada;
alter table viajes drop column precio_base;

alter table ventas drop column total;

alter table encomiendas drop column estado;
alter table encomiendas drop column fecha_entrega;

-- vistas: los datos calculados se leen aqui, con los mismos nombres de campo de antes
-- security_invoker respeta el rls de las tablas de origen; ademas no se exponen a la api automatica

create or replace view rutas_resumen
with (security_invoker = true) as
select rp.ruta_id,
       count(*) as total_paradas,
       max(rp.minutos_desde_origen) as duracion_estimada_min,
       max(rp.km_desde_origen) as distancia_km
  from rutas_paradas rp
 group by rp.ruta_id;

create or replace view viajes_horarios
with (security_invoker = true) as
select v.id as viaje_id,
       rp.ruta_id,
       rp.orden,
       rp.terminal_id,
       rp.minutos_desde_origen,
       v.fecha_salida + make_interval(mins => rp.minutos_desde_origen) as fecha_paso_estimada
  from viajes v
  join rutas_paradas rp on rp.ruta_id = v.ruta_id;

create or replace view ventas_totales
with (security_invoker = true) as
select v.id as venta_id,
       coalesce((select sum(p.precio) from pasajes p
                  where p.venta_id = v.id and p.estado in ('reservado', 'pagado')), 0)
     + coalesce((select sum(e.costo) from encomiendas e where e.venta_id = v.id), 0) as total
  from ventas v;

create or replace view encomiendas_estado_actual
with (security_invoker = true) as
select distinct on (h.encomienda_id)
       h.encomienda_id,
       h.estado,
       h.creado_en as fecha_estado,
       h.observacion,
       h.usuario_id
  from historial_encomiendas h
 order by h.encomienda_id, h.creado_en desc, h.id desc;

revoke all on rutas_resumen, viajes_horarios, ventas_totales, encomiendas_estado_actual from anon, authenticated;
