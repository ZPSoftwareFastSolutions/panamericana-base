-- migracion: documentos de identidad de bolivia
-- ci = carnet de identidad · ce = cedula de identidad de extranjero · pasaporte
-- el orden importa: primero se quita la regla vieja, luego se convierten los datos y al final se crea la regla nueva

alter table clientes drop constraint clientes_tipo_documento_valido;
alter table choferes drop constraint choferes_tipo_documento_valido;

update clientes set tipo_documento = 'ci' where tipo_documento = 'dni';
update choferes set tipo_documento = 'ci' where tipo_documento = 'dni';

alter table clientes
  add constraint clientes_tipo_documento_valido check (tipo_documento in ('ci', 'ce', 'pasaporte'));

alter table choferes
  add constraint choferes_tipo_documento_valido check (tipo_documento in ('ci', 'ce', 'pasaporte'));
