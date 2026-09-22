-- datos de prueba para desarrollo (contexto: bolivia · montos en bolivianos · hora de la paz)
-- reglas: palabras sql en minusculas y nombres de campos en snake_case
-- los ids son fijos para que el archivo se pueda volver a ejecutar sin duplicar filas
-- modelo v2.0: los datos personales viven en personas; usuarios, clientes y choferes son roles

-- personas (ci = carnet de identidad, celular de 8 digitos)
insert into personas (id, tipo_documento, numero_documento, nombres, apellidos, telefono, correo) values
  ('00000000-0000-4000-8000-00000000a001', 'ci', '3948271', 'Ana', 'Quispe', '70012345', 'ana.quispe@panamericana.test'),
  ('00000000-0000-4000-8000-00000000a002', 'ci', '5271830', 'Luis', 'Rojas', '70098765', 'luis.rojas@panamericana.test'),
  ('00000000-0000-4000-8000-00000000a101', 'ci', '4827351', 'Maria', 'Flores', '71234567', null),
  ('00000000-0000-4000-8000-00000000a102', 'ci', '6093184', 'Jorge', 'Mendoza', '76543210', null),
  ('00000000-0000-4000-8000-00000000a501', 'ci', '5120478', 'Pedro', 'Ramos', '70011223', null)
on conflict (tipo_documento, numero_documento) do nothing;

-- usuarios internos (el correo es el de la cuenta de acceso)
insert into usuarios (id, persona_id, correo) values
  ('00000000-0000-4000-8000-000000000001',
   (select id from personas where tipo_documento = 'ci' and numero_documento = '3948271'),
   'ana.quispe@panamericana.test'),
  ('00000000-0000-4000-8000-000000000002',
   (select id from personas where tipo_documento = 'ci' and numero_documento = '5271830'),
   'luis.rojas@panamericana.test')
on conflict (id) do nothing;

insert into usuarios_roles (usuario_id, rol) values
  ('00000000-0000-4000-8000-000000000001', 'administrador'),
  ('00000000-0000-4000-8000-000000000002', 'vendedor')
on conflict (usuario_id, rol) do nothing;

-- clientes (pasajeros, remitentes y destinatarios)
insert into clientes (id, persona_id) values
  ('00000000-0000-4000-8000-000000000101',
   (select id from personas where tipo_documento = 'ci' and numero_documento = '4827351')),
  ('00000000-0000-4000-8000-000000000102',
   (select id from personas where tipo_documento = 'ci' and numero_documento = '6093184'))
on conflict (id) do nothing;

-- tripulacion (licencia de categoria c: profesional para buses)
insert into choferes (id, persona_id, numero_licencia, categoria_licencia, fecha_vencimiento_licencia) values
  ('00000000-0000-4000-8000-000000000501',
   (select id from personas where tipo_documento = 'ci' and numero_documento = '5120478'),
   '5120478', 'c', '2028-05-31')
on conflict (id) do nothing;

-- ciudades donde hay terminales
insert into ciudades (id, nombre, departamento) values
  ('00000000-0000-4000-8000-00000000c001', 'La Paz', 'lp'),
  ('00000000-0000-4000-8000-00000000c002', 'Oruro', 'or'),
  ('00000000-0000-4000-8000-00000000c003', 'Cochabamba', 'cb')
on conflict (departamento, nombre) do nothing;

-- terminales
insert into terminales (id, nombre, ciudad_id, direccion) values
  ('00000000-0000-4000-8000-000000000201', 'Terminal de Buses La Paz',
   (select id from ciudades where nombre = 'La Paz'), 'Plaza Antofagasta s/n'),
  ('00000000-0000-4000-8000-000000000202', 'Terminal de Buses Oruro',
   (select id from ciudades where nombre = 'Oruro'), 'Av. Tomas Barron s/n'),
  ('00000000-0000-4000-8000-000000000203', 'Terminal de Buses Cochabamba',
   (select id from ciudades where nombre = 'Cochabamba'), 'Av. Ayacucho esq. Av. Aroma')
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

-- ruta con una parada intermedia: la paz (1) -> oruro (2) -> cochabamba (3)
-- la duracion y la distancia ya no se guardan aqui: se calculan con la vista rutas_resumen
insert into rutas (id, nombre) values
  ('00000000-0000-4000-8000-000000000601', 'La Paz - Cochabamba')
on conflict (id) do nothing;

insert into rutas_paradas (ruta_id, terminal_id, orden, minutos_desde_origen, km_desde_origen) values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000201', 1, 0, 0.00),
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000202', 2, 210, 190.00),
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000203', 3, 420, 380.00)
on conflict (ruta_id, orden) do nothing;

-- viaje programado (la llegada estimada se calcula con la vista viajes_horarios)
insert into viajes (id, ruta_id, bus_id, fecha_salida) values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000601',
   '00000000-0000-4000-8000-000000000301', '2026-10-01T08:00:00Z')
on conflict (id) do nothing;

insert into viajes_choferes (viaje_id, chofer_id, rol) values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000501', 'conductor')
on conflict (viaje_id, chofer_id) do nothing;

-- precios del recorrido completo por tipo de asiento (en bolivianos)
insert into tarifas (viaje_id, tipo_asiento, precio) values
  ('00000000-0000-4000-8000-000000000701', 'normal', 80.00),
  ('00000000-0000-4000-8000-000000000701', 'semicama', 95.00),
  ('00000000-0000-4000-8000-000000000701', 'cama', 120.00)
on conflict (viaje_id, tipo_asiento) do nothing;

-- una venta con un pasaje del tramo 1 -> 2 (la paz a oruro)
-- el total de la venta se calcula con la vista ventas_totales
insert into ventas (id, codigo, cliente_id, usuario_id, canal, estado) values
  ('00000000-0000-4000-8000-000000000801', 'V-000001', '00000000-0000-4000-8000-000000000101',
   '00000000-0000-4000-8000-000000000002', 'taquilla', 'pagada')
on conflict (id) do nothing;

insert into pasajes (id, codigo, venta_id, viaje_id, asiento_id, cliente_id,
                     ruta_id, bus_id, orden_origen, orden_destino, precio, estado) values
  ('00000000-0000-4000-8000-000000000901', 'P-000001',
   '00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000701',
   '00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000101',
   '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000301',
   1, 2, 120.00, 'pagado')
on conflict (id) do nothing;

insert into pagos (id, venta_id, monto, metodo, estado, referencia_externa) values
  ('00000000-0000-4000-8000-000000000851', '00000000-0000-4000-8000-000000000801',
   120.00, 'efectivo', 'aprobado', 'SIMULADO-V-000001')
on conflict (id) do nothing;
