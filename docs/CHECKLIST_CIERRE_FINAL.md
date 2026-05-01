# Checklist de Cierre Final

## Flujos criticos a probar

- Iniciar sesion eligiendo centro educativo correcto.
- Entrar como director y abrir `Panel`, `Centro`, `Estudiantes`, `Docentes`, `Padres` y `Excusas`.
- Crear un curso y un grado desde `Centro`.
- Crear una o varias secciones del curso en un turno valido.
- Guardar horarios por turno.
- Registrar un estudiante con matricula unica y seccion asignada.
- Intentar registrar otra matricula repetida y confirmar que el sistema la rechaza.
- Crear un docente con permisos y secciones asignadas.
- Crear un padre o tutor.
- Vincular un estudiante a un padre o tutor.
- Abrir el QR del estudiante y confirmar que se genera.
- Revisar que el dashboard de direccion cargue metricas sin quedarse en blanco.
- Confirmar que el administrador absoluto puede ver solicitudes y centros.

## Verificacion tecnica

- `frontend`: ejecutar `npm run build`
- `backend`: ejecutar `python -m compileall backend`
- Revisar que `frontend/.env` apunte al backend correcto.
- Revisar que `backend/.env` tenga las variables reales de Supabase.
- Confirmar que el centro activo del login sea el mismo que usa el director al navegar.

## Base de datos

- Verificar que existan datos en `schools`, `grade_sections`, `students`, `profiles`, `parents` y `attendance`.
- Confirmar que las secciones del centro tengan `school_id`.
- Confirmar que los estudiantes tengan `grade_section_id`.
- Confirmar que los docentes tengan `secciones_ids`.
- Si se va a usar aprobacion de directores, revisar migraciones pendientes del esquema `profiles`.

## Evidencias para entrega

- Capturas PNG de login, panel director, gestion de centro, estudiantes, docentes, padres, excusas, QR y reportes.
- Exportar esas capturas a un PDF.
- Verificar `README`, manual tecnico, manual de usuario, cronograma, acta y trazabilidad RF.
- Preparar carpeta final para USB.

## Pendientes tipicos antes de entregar

- Revisar textos con caracteres raros o acentos mal codificados.
- Unificar estilos entre dashboards si todavia hay pantallas visualmente distintas.
- Hacer una pasada final de responsive en laptop y movil.
- Validar que los mensajes de error sean claros para demo.
