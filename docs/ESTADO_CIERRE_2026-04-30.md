# Estado de Cierre - 2026-04-30

## Ajustes cerrados en esta fase

- El modulo `Centro` ya no se siente como una reconfiguracion inicial del proyecto.
- Los datos institucionales quedaron separados de la estructura academica.
- Se agrego catalogo de cursos y catalogo de grados dentro de `Centro`.
- El centro configurado entra directo a la parte academica en lugar de reiniciar el asistente.
- El alta de estudiantes valida nombre, matricula y seccion obligatoria.
- El alta de estudiantes ahora bloquea matriculas repetidas desde la interfaz antes del insert.
- Se corrigieron textos visibles con codificacion danada en varios paneles.
- El frontend compila correctamente con `npm run build`.
- El backend compila correctamente con `python -m compileall backend`.

## Riesgos ya controlados

- Consultas a columnas inexistentes como `students.school_id` en las vistas criticas.
- Dependencia obligatoria de `profiles.school_id` para cargar datos del centro activo.
- Pantallas vacias por errores de esquema conocidos en la base real.

## Pendientes que aun requieren prueba manual

- Flujo completo de crear centro, asignar director y aprobar direccion.
- Flujo completo de crear docente, crear padre y vincular hijos.
- Escaneo QR y registros reales de entrada y salida.
- Reportes PDF y Excel.
- Alertas internas o por correo, segun configuracion disponible.
- Revision visual final de responsive y consistencia entre dashboards.

## Recomendacion inmediata

Hacer una pasada funcional completa con un centro real:

1. Entrar como director.
2. Crear curso, grado y seccion.
3. Registrar estudiante.
4. Registrar docente.
5. Registrar padre.
6. Vincular hijo.
7. Abrir QR del estudiante.
8. Revisar dashboard del director.
