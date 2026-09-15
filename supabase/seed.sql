-- datos de prueba para desarrollo (contexto: bolivia · montos en bolivianos · hora de la paz)
-- reglas: palabras sql en minusculas y nombres de campos en snake_case
-- los ids son fijos para que el archivo se pueda volver a ejecutar sin duplicar filas

-- usuarios internos
insert into usuarios (id, nombres, apellidos, correo, rol) values
  ('00000000-0000-4000-8000-000000000001', 'Ana', 'Quispe', 'ana.quispe@panamericana.test', 'administrador'),
  ('00000000-0000-4000-8000-000000000002', 'Luis', 'Rojas', 'luis.rojas@panamericana.test', 'vendedor')
on conflict (id) do nothing;

-- clientes (ci = carnet de identidad, celular de 8 digitos)
insert into clientes (id, tipo_documento, numero_documento, nombres, apellidos, telefono) values
  ('00000000-0000-4000-8000-000000000101', 'ci', '4827351', 'Maria', 'Flores', '71234567'),
  ('00000000-0000-4000-8000-000000000102', 'ci', '6093184', 'Jorge', 'Mendoza', '76543210')
on conflict (id) do nothing;

-- terminales
insert into terminales (id, nombre, ciudad, direccion) values
  ('00000000-0000-4000-8000-000000000201', 'Terminal de Buses La Paz', 'La Paz', 'Plaza Antofagasta s/n'),
  ('00000000-0000-4000-8000-000000000202', 'Terminal de Buses Oruro', 'Oruro', 'Av. Tomas Barron s/n'),
  ('00000000-0000-4000-8000-000000000203', 'Terminal de Buses Cochabamba', 'Cochabamba', 'Av. Ayacucho esq. Av. Aroma')
on conflict (id) do nothing;

-- flota (placa boliviana: 3 o 4 digitos y 3 letras)
insert into buses (id, placa, marca, modelo, anio_fabricacion, numero_pisos) values
  ('00000000-0000-4000-8000-000000000301', '2045KLP', 'Volvo', 'B450R', 2021, 2),
  ('00000000-0000-4000-8000-000000000302', '3187HTR', 'Scania', 'K410', 2019, 1)
on conflict (id) do nothing;

insert into asientos (id, bus_id, numero, piso, fila, columna, tipo) values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000301', 1, 1, 1, 1, 'cama'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000301', 2, 1, 1, 2, 'cama'),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000301', 3, 1, 2, 1, 'semicama'),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000301', 4, 1, 2, 2, 'semicama')
on conflict (id) do nothing;

-- tripulacion (licencia de categoria c: profesional para buses)
insert into choferes (id, tipo_documento, numero_documento, nombres, apellidos, numero_licencia, categoria_licencia, fecha_vencimiento_licencia, telefono) values
  ('00000000-0000-4000-8000-000000000501', 'ci', '5120478', 'Pedro', 'Ramos', '5120478', 'C', '2028-05-31', '70011223')
on conflict (id) do nothing;

-- ruta con una parada intermedia: la paz (1) -> oruro (2) -> cochabamba (3)
insert into rutas (id, nombre, distancia_km, duracion_estimada_min) values
  ('00000000-0000-4000-8000-000000000601', 'La Paz - Cochabamba', 380.00, 420)
on conflict (id) do nothing;

insert into rutas_paradas (id, ruta_id, terminal_id, orden, minutos_desde_origen) values
  ('00000000-0000-4000-8000-000000000611', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000201', 1, 0),
  ('00000000-0000-4000-8000-000000000612', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000202', 2, 210),
  ('00000000-0000-4000-8000-000000000613', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000203', 3, 420)
on conflict (id) do nothing;

-- viaje programado (precios en bolivianos)
insert into viajes (id, ruta_id, bus_id, fecha_salida, fecha_llegada_estimada, precio_base) values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000301',
   '2026-10-01T08:00:00Z', '2026-10-01T15:00:00Z', 80.00)
on conflict (id) do nothing;

insert into viajes_choferes (viaje_id, chofer_id, rol) values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000501', 'conductor')
on conflict (viaje_id, chofer_id) do nothing;

insert into tarifas (viaje_id, tipo_asiento, precio) values
  ('00000000-0000-4000-8000-000000000701', 'semicama', 95.00),
  ('00000000-0000-4000-8000-000000000701', 'cama', 120.00)
on conflict (viaje_id, tipo_asiento) do nothing;

-- una venta con un pasaje del tramo 1 -> 2 (la paz a oruro)
insert into ventas (id, codigo, cliente_id, usuario_id, canal, total, estado) values
  ('00000000-0000-4000-8000-000000000801', 'V-000001', '00000000-0000-4000-8000-000000000101',
   '00000000-0000-4000-8000-000000000002', 'taquilla', 120.00, 'pagada')
on conflict (id) do nothing;

insert into pasajes (id, codigo, venta_id, viaje_id, asiento_id, cliente_id,
                     parada_origen_id, parada_destino_id, orden_origen, orden_destino, precio, estado) values
  ('00000000-0000-4000-8000-000000000901', 'P-000001',
   '00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000701',
   '00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000101',
   '00000000-0000-4000-8000-000000000611', '00000000-0000-4000-8000-000000000612', 1, 2, 120.00, 'pagado')
on conflict (id) do nothing;
