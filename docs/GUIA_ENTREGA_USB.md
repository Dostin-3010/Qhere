# Guia de Entrega en Memoria USB

## Proyecto

Nombre: QHere - Control de Asistencia Escolar con QR

## Carpeta final recomendada

```text
ENTREGA_QHERE/
|-- 01_PROYECTO_COMPLETO/
|   |-- backend/
|   |-- frontend/
|   |-- database/
|   |-- docs/
|   |-- README.md
|-- 02_BASE_DE_DATOS/
|   |-- full_supabase_script.sql
|   |-- schema.sql
|   |-- migrations/
|   |-- rpc_functions.sql
|   |-- realtime_setup.sql
|   |-- edge-functions/
|   |-- backup/
|   |-- DIAGRAMA_BASE_DATOS.md
|-- 03_DOCUMENTACION/
|   |-- README.md
|   |-- ACTA_PROYECTO.md
|   |-- MANUAL_TECNICO.md
|   |-- MANUAL_USUARIO.md
|   |-- CRONOGRAMA_ACTIVIDADES.md
|   |-- ANALISIS_Y_DISENO.md
|   |-- TRAZABILIDAD_RF.md
|-- 04_CAPTURAS/
|   |-- PNG/
|   |-- CAPTURAS_APLICACION.pdf
|-- 05_PRESENTACION/
|   |-- PRESENTACION_PROPUESTA.md
|   |-- PRESENTACION_PROPUESTA.pdf
|-- VERIFICACION_FINAL.txt
```

## Checklist antes de copiar a USB

- Ejecutar `npm run build` dentro de `frontend`.
- Ejecutar `python -m compileall backend` desde la raiz del proyecto.
- Confirmar que `backend/.env` y `frontend/.env` tengan las variables correctas.
- Ejecutar el SQL completo en Supabase si el entorno esta limpio.
- Probar login, panel director, centro, estudiantes, docentes, padres, excusas y escaneo QR.
- Agregar capturas PNG reales de la app en `04_CAPTURAS/PNG`.
- Verificar que la memoria USB tenga la carpeta completa y el archivo `.zip`.

## Nota sobre FastAPI y Odoo

El enunciado menciona FastAPI y Odoo como parte de una plantilla general. Este proyecto fue desarrollado realmente con Flask, React y Supabase. No se declara uso productivo de FastAPI ni Odoo para evitar documentar tecnologias que no forman parte del sistema entregado.
