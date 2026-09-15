-- datos de prueba para desarrollo
-- reglas: palabras sql en minusculas y nombres de campos en snake_case
-- los ids son fijos para que el archivo se pueda volver a ejecutar sin duplicar filas

-- usuarios internos
insert into usuarios (id, nombres, apellidos, correo, rol) values
  ('00000000-0000-4000-8000-000000000001', 'Ana', 'Quispe', 'ana.quispe@panamericana.test', 'administrador'),
  ('00000000-0000-4000-8000-000000000002', 'Luis', 'Rojas', 'luis.rojas@panamericana.test', 'vendedor')
on conflict (id) do nothing;

-- clientes
insert into clientes (id, tipo_documento, numero_documento, nombres, apellidos, telefono) values
  ('00000000-0000-4000-8000-000000000101', 'dni', '70000001', 'Maria', 'Flores', '987654321'),
  ('00000000-0000-4000-8000-000000000102', 'dni', '70000002', 'Jorge', 'Mendoza', '987654322')
on conflict (id) do nothing;

-- terminales
insert into terminales (id, nombre, ciudad, direccion) values
  ('00000000-0000-4000-8000-000000000201', 'Terminal Norte', 'Ciudad A', 'Av. Principal 100'),
  ('00000000-0000-4000-8000-000000000202', 'Terminal Centro', 'Ciudad B', 'Jr. Comercio 250'),
  ('00000000-0000-4000-8000-000000000203', 'Terminal Sur', 'Ciudad C', 'Av. Costanera 420')
on conflict (id) do nothing;

-- flota
insert into buses (id, placa, marca, modelo, anio_fabricacion, numero_pisos) values
  ('00000000-0000-4000-8000-000000000301', 'ABC-123', 'Volvo', 'B450R', 2021, 2),
  ('00000000-0000-4000-8000-000000000302', 'XYZ-789', 'Scania', 'K410', 2019, 1)
on conflict (id) do nothing;

insert into asientos (id, bus_id, numero, piso, fila, columna, tipo) values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000301', 1, 1, 1, 1, 'cama'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000301', 2, 1, 1, 2, 'cama'),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000301', 3, 1, 2, 1, 'semicama'),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000301', 4, 1, 2, 2, 'semicama')
on conflict (id) do nothing;

-- tripulacion
insert into choferes (id, tipo_documento, numero_documento, nombres, apellidos, numero_licencia, categoria_licencia, fecha_vencimiento_licencia) values
  ('00000000-0000-4000-8000-000000000501', 'dni', '60000001', 'Pedro', 'Ramos', 'Q-1234567', 'A-IIIb', '2028-05-31')
on conflict (id) do nothing;

-- ruta con una parada intermedia: Ciudad A (1) -> Ciudad B (2) -> Ciudad C (3)
insert into rutas (id, nombre, distancia_km, duracion_estimada_min) values
  ('00000000-0000-4000-8000-000000000601', 'Ciudad A - Ciudad C', 480.50, 420)
on conflict (id) do nothing;

insert into rutas_paradas (id, ruta_id, terminal_id, orden, minutos_desde_origen) values
  ('00000000-0000-4000-8000-000000000611', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000201', 1, 0),
  ('00000000-0000-4000-8000-000000000612', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000202', 2, 180),
  ('00000000-0000-4000-8000-000000000613', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000203', 3, 420)
on conflict (id) do nothing;

-- viaje programado
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

-- una venta con un pasaje del tramo 1 -> 2 (Ciudad A a Ciudad B)
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
