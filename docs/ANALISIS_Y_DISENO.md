# Analisis y Diseno del Sistema

## 1. Problema

Los centros educativos necesitan registrar asistencia con rapidez, evidencia y capacidad de auditoria, evitando registros duplicados y mejorando la comunicacion con la familia.

## 2. Actores

- Administrador
- Docente
- Padre/Tutor

## 3. Casos de uso principales

- Configurar centro educativo
- Registrar estudiantes
- Registrar docentes y permisos
- Vincular padres con estudiantes
- Generar y reemitir QR
- Registrar entrada/salida
- Registrar contingencia manual
- Enviar y aprobar excusas
- Consultar reportes y dashboard

## 4. Reglas de negocio

- La matricula del estudiante es unica.
- No se debe registrar doble entrada para el mismo dia.
- La salida requiere una entrada previa.
- Las tardanzas se calculan contra el horario oficial.
- La asistencia manual debe incluir motivo.
- Los datos sensibles se restringen segun el rol.

## 5. Diseno logico

### Modulos

- Autenticacion y perfiles
- Configuracion academica
- Gestion de usuarios
- Asistencia
- Excusas
- Reportes
- Auditoria

### Entidades clave

- School
- Profile
- GradeSection
- Schedule
- Student
- Parent
- Attendance
- Excuse
- AuditLog

## 6. Diseno fisico

- PostgreSQL administrado por Supabase
- Storage para evidencias
- API Flask para operaciones de asistencia
- SPA React para experiencia de usuario

## 7. Decision tecnica relevante

- Se uso Supabase para acelerar autenticacion, datos y storage
- Se uso Flask para la logica de asistencia, auditoria y reglas operativas
- Se uso React + Vite para interfaz moderna y responsive
