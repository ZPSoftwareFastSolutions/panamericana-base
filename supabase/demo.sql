-- datos de DEMOSTRACION: viajes para hoy y los proximos 6 dias (los dias se cuentan en hora de La Paz)
-- se puede ejecutar varias veces: cada viaje tiene un id fijo calculado con su fecha y hora
-- (un uuid v4 valido: se marcan la version 4 y la variante 8 sobre un md5)
-- requiere haber cargado seed.sql (ruta La Paz - Oruro - Cochabamba y los buses 2045KLP y 3187HTR)

with salidas as (
  select d::date as fecha, h.hora, h.bus_id
    from generate_series((now() at time zone 'America/La_Paz')::date, (now() at time zone 'America/La_Paz')::date + 6, interval '1 day') as d
   cross join (values
     ('08:00'::time, '00000000-0000-4000-8000-000000000302'::uuid),  -- 3187HTR, llega 15:00
     ('21:00'::time, '00000000-0000-4000-8000-000000000302'::uuid),  -- 3187HTR, viaje nocturno
     ('14:00'::time, '00000000-0000-4000-8000-000000000301'::uuid)   -- 2045KLP, dos pisos
   ) as h(hora, bus_id)
)
insert into viajes (id, ruta_id, bus_id, fecha_salida)
select overlay(overlay(md5('demo-viaje-' || s.fecha || '-' || s.hora) placing '4' from 13) placing '8' from 17)::uuid,
       '00000000-0000-4000-8000-000000000601',
       s.bus_id,
       (s.fecha + s.hora) at time zone 'America/La_Paz'
  from salidas s
 where (s.fecha + s.hora) at time zone 'America/La_Paz' > now()
   -- misma regla que el sistema: un bus no puede tener dos viajes con horarios cruzados
   and not exists (
     select 1
       from viajes v join rutas_resumen rr on rr.ruta_id = v.ruta_id
      where v.bus_id = s.bus_id
        and v.estado in ('programado', 'en_ruta')
        and v.id <> overlay(overlay(md5('demo-viaje-' || s.fecha || '-' || s.hora) placing '4' from 13) placing '8' from 17)::uuid
        and v.fecha_salida < ((s.fecha + s.hora) at time zone 'America/La_Paz')
                             + make_interval(mins => (select duracion_estimada_min from rutas_resumen
                                                        where ruta_id = '00000000-0000-4000-8000-000000000601'))
        and ((s.fecha + s.hora) at time zone 'America/La_Paz') < v.fecha_salida + make_interval(mins => rr.duracion_estimada_min)
   )
on conflict (id) do nothing;

-- tarifas del recorrido completo para cada tipo de asiento de su bus
insert into tarifas (viaje_id, tipo_asiento, precio)
select v.id, t.tipo, t.precio
  from viajes v
  join (values ('normal', 80.00), ('semicama', 95.00), ('cama', 120.00)) as t(tipo, precio)
    on exists (select 1 from asientos a where a.bus_id = v.bus_id and a.tipo = t.tipo)
 where v.id in (
   select overlay(overlay(md5('demo-viaje-' || d::date || '-' || h.hora) placing '4' from 13) placing '8' from 17)::uuid
     from generate_series((now() at time zone 'America/La_Paz')::date, (now() at time zone 'America/La_Paz')::date + 6, interval '1 day') as d
    cross join (values ('08:00'::time), ('21:00'::time), ('14:00'::time)) as h(hora)
 )
on conflict (viaje_id, tipo_asiento) do nothing;
