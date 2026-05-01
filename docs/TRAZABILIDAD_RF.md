# Trazabilidad de Requerimientos

## Requerimientos funcionales

| RF | Requerimiento | Estado | Evidencia tecnica |
|---|---|---|---|
| RF-01 | Registro de centros educativos | Implementado | `schools`, `grade_sections`, `schedules`, `school_calendar`, pantalla `SchoolSetup.jsx` |
| RF-02 | Gestion de estudiantes | Implementado | `students`, `ManageStudents.jsx`, indice unico `students_matricula_key` |
| RF-03 | Gestion de docentes y roles | Implementado | `profiles.role`, `profiles.permisos`, `ManageTeachers.jsx` |
| RF-04 | Generacion de QR por estudiante | Implementado | `qr_token`, `qrAttendance.js`, modal QR en estudiantes |
| RF-05 | App/panel de escaneo | Implementado | `TeacherDashboard.jsx`, `POST /api/attendance/scan` |
| RF-06 | Registro de entrada | Implementado | `attendance`, validacion de duplicidad en `attendance_routes.py` |
| RF-07 | Registro de salida | Implementado | `hora_salida`, flujo `check_out` en `attendance_routes.py` |
| RF-08 | Control por turno | Implementado | `turno`, `schedules`, horarios especiales en `grade_sections` |
| RF-09 | Justificaciones con evidencia | Implementado | `excuses`, bucket `excuses`, `SendExcuse.jsx` |
| RF-10 | Aprobacion de justificacion | Implementado | `ExcuseInbox.jsx`, `adminExcuses.jsx`, `status` de excusa |
| RF-11 | Asistencia manual de contingencia | Implementado | `POST /api/attendance/manual`, auditoria |
| RF-12 | Tardanzas automaticas | Implementado | `minutos_tarde`, `limite_tardanza_aplicado` |
| RF-13 | Alertas a tutores | Implementado con configuracion SMTP | cola `notification_queue` + `process_notification_queue.py` |
| RF-14 | Reporte diario por aula | Implementado | `StudentAbsences.jsx`, consultas de asistencia |
| RF-15 | Reporte por estudiante | Implementado | historial por estudiante en paneles y dashboard |
| RF-16 | Reporte por docente | Implementado | resumen docente y panel administrativo |
| RF-17 | Exportacion Excel/PDF | Implementado | dependencias `xlsx`, `jspdf`, exportes en reportes |
| RF-18 | Control de duplicidad y fraude | Implementado | validacion de duplicados, QR seguro, auditoria |
| RF-19 | Geolocalizacion del escaneo | Implementado opcional | `attendance_geo_events`, radio permitido y captura geo |
| RF-20 | Control de dispositivos autorizados | Implementado | `authorized_devices`, aprobacion desde dashboard admin |
| RF-21 | Calendario escolar | Implementado | `school_calendar`, `SchoolSetup.jsx` |
| RF-22 | Integracion con calificaciones | Base preparada | tabla `gradebook_entries` y lectura de resumen en dashboard |
| RF-23 | Panel para direccion | Implementado | `AdminDashboard.jsx` |
| RF-24 | Bitacora / auditoria | Implementado | `audit_log`, `_insert_audit()` |
| RF-25 | Seguridad y privacidad | Implementado base | control por rol, validaciones y politicas de storage; RLS total queda segun despliegue |

## Requisitos generales

| Requisito | Estado | Evidencia |
|---|---|---|
| Autenticacion segura por roles | Implementado | Supabase Auth + `profiles` |
| Reportes administrativos | Implementado | dashboard, reportes y exportes |
| Diseno moderno y responsive | Implementado | React + layouts administrativos |
| Filtrado de entrada y salida | Implementado | filtros y validaciones por fecha/estado |
| CRUD completo | Implementado base | escuelas, estudiantes, docentes, padres, excusas |
| Buenas practicas / POO | Implementado base | separacion por rutas, repositorios y servicios |
| Envio de correos / notificaciones | Implementado con configuracion SMTP | cola `notification_queue` + procesador SMTP |
| Acta de proyecto | Documentado | `docs/ACTA_PROYECTO.md` |
| Cronograma | Documentado | `docs/CRONOGRAMA_ACTIVIDADES.md` |
| Manual de usuario | Documentado | `docs/MANUAL_USUARIO.md` |
| Manual tecnico | Documentado | `docs/MANUAL_TECNICO.md` |
| README | Documentado | `README.md` |
| Analisis y diseno | Documentado | `docs/ANALISIS_Y_DISENO.md` |
