## Tarjeta

PAN-

## Qué hace este cambio

<!-- 2 o 3 líneas -->

## Checklist

### Arquitectura
- [ ] El código está en la capa correcta (`ARQUITECTURA_CLEAN.md`, sección 8)
- [ ] El dominio no importa librerías externas
- [ ] El caso de uso no recibe `req` ni `res`
- [ ] Las instancias se crean solo en `contenedor.ts`

### Base de datos (si aplica)
- [ ] Palabras SQL en minúsculas (R1)
- [ ] Nombres de tablas y campos idénticos al modelo aprobado (R2, R3)
- [ ] El cambio de esquema es una migración en `supabase/migrations/`, no un cambio manual en el panel (R5)

### Contrato y pruebas
- [ ] El endpoint está en `docs/api/openapi.yaml`
- [ ] Hay pruebas del caso de uso y pasan
- [ ] Los errores devuelven el código HTTP correcto

### Seguridad
- [ ] No hay claves, contraseñas ni archivos `.env` en el cambio
