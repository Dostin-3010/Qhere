# Manual de Usuario - QHere

## 1. Presentacion del Sistema

QHere es un sistema web de control de asistencia escolar mediante codigos QR. Permite administrar centros educativos, estudiantes, docentes, padres o tutores, cursos, secciones, turnos, horarios, asistencia, justificaciones y reportes.

El sistema esta organizado por roles para que cada usuario vea solamente las funciones que le corresponden.

![Pantalla principal](../entrega_assets/manual_capturas/01_home.png)

## 2. Roles del Sistema

### Administrador absoluto

Usuario principal del sistema. Tiene control global para revisar solicitudes de directores, crear centros educativos y asignar directores.

### Director o administrador del centro

Usuario encargado de administrar un centro educativo. Puede gestionar estudiantes, docentes, padres, cursos, secciones, turnos, horarios, excusas y reportes.

### Docente

Usuario encargado de registrar asistencia, revisar estudiantes asignados, consultar ausencias y gestionar excusas segun sus permisos.

### Padre o tutor

Usuario encargado de consultar informacion relacionada con estudiantes vinculados y enviar justificaciones.

### Estudiante

Usuario que puede consultar informacion relacionada con sus excusas o asistencia, segun el acceso configurado.

## 3. Acceso al Sistema

### 3.1 Abrir la aplicacion

1. Abrir el navegador.
2. Entrar a la URL del sistema.
3. Verificar que aparezca la pagina principal de QHere.

![Pagina de inicio](../entrega_assets/manual_capturas/01_home.png)

### 3.2 Iniciar sesion

1. Presionar el boton de acceso o ir a la pantalla de login.
2. Seleccionar el centro educativo si el sistema lo solicita.
3. Escribir correo electronico.
4. Escribir contrasena.
5. Presionar el boton para iniciar sesion.

![Inicio de sesion](../entrega_assets/manual_capturas/02_login.png)

### 3.3 Acceso con Google

Si el proveedor Google esta configurado en Supabase:

1. Presionar **Continuar con Google**.
2. Seleccionar la cuenta de Google.
3. Autorizar el acceso.
4. Esperar la redireccion al sistema.

Si aparece el mensaje **Unsupported provider**, significa que el proveedor Google no esta activo en Supabase.

## 4. Solicitud de Acceso Directivo

Este apartado permite que un director solicite acceso al sistema y registre la informacion inicial del centro educativo.

### Pasos

1. Entrar a **Solicitar acceso como director**.
2. Completar nombre completo.
3. Escribir correo personal o institucional.
4. Crear una contrasena.
5. Completar telefono.
6. Escribir nombre del centro educativo.
7. Completar correo, telefono y direccion del centro.
8. Enviar la solicitud.
9. Esperar aprobacion del administrador absoluto.

![Solicitud de direccion](../entrega_assets/manual_capturas/03_solicitud_director.png)

### Resultado esperado

La solicitud queda registrada como pendiente. El administrador absoluto puede aprobarla, rechazarla o revisar su historial.

## 5. Panel de Administrador Absoluto

El panel de administrador absoluto es exclusivo para la cuenta principal del sistema. Desde aqui se controlan los centros educativos y las solicitudes directivas.

![Panel super administrador](../entrega_assets/manual_capturas/04_super_admin_dashboard.png)

### 5.1 Revisar indicadores generales

En la parte superior se muestran indicadores como:

- Centros registrados.
- Cuentas directivas creadas.
- Solicitudes pendientes.

Estos datos permiten conocer el estado general del sistema.

### 5.2 Revisar solicitudes de direccion

1. Ir a la seccion **Solicitudes de direccion**.
2. Leer los datos del solicitante.
3. Confirmar el centro educativo solicitado.
4. Decidir si se aprueba o rechaza.

### 5.3 Aprobar una solicitud

1. Seleccionar la solicitud pendiente.
2. Presionar **Aprobar**.
3. Confirmar la accion.
4. El director queda habilitado para usar el sistema.

### 5.4 Rechazar una solicitud

1. Seleccionar la solicitud pendiente.
2. Presionar **Rechazar**.
3. Confirmar la accion.
4. La solicitud queda registrada en el historial.

### 5.5 Registrar centros educativos

1. Ir a **Gestion de centros**.
2. Escribir nombre del centro.
3. Completar datos basicos si aplica.
4. Guardar el centro.

### 5.6 Asignar un director a un centro

1. Seleccionar un centro educativo.
2. Seleccionar el director disponible.
3. Presionar **Asignar**.
4. Confirmar que el director tenga el centro vinculado.

## 6. Panel Administrativo del Centro

El panel administrativo del centro permite gestionar la operacion escolar diaria.

![Dashboard administrativo](../entrega_assets/manual_capturas/05_admin_dashboard.png)

### 6.1 Dashboard

Desde el dashboard se visualizan resumenes de:

- Estudiantes registrados.
- Docentes registrados.
- Padres o tutores registrados.
- Asistencia del dia.
- Tardanzas o ausencias.
- Alertas administrativas.

### 6.2 Menu lateral

El menu principal permite navegar por:

- Dashboard.
- Estudiantes.
- Docentes.
- Padres.
- Excusas.
- Centro.

## 7. Gestion del Centro Educativo

El apartado de centro permite configurar la estructura academica y operativa del centro.

![Gestion del centro](../entrega_assets/manual_capturas/06_admin_center.png)

### 7.1 Datos generales

En esta seccion se consultan o editan datos administrativos del centro, como:

- Nombre del centro.
- Telefono.
- Correo institucional.
- Direccion.
- Director o directora.
- Periodo academico.
- Perimetro de escaneo si se usa geolocalizacion.

### 7.2 Cursos y grados

1. Entrar a la pestana de cursos.
2. Agregar el nombre del curso.
3. Agregar grados relacionados.
4. Guardar la informacion.

Los cursos y grados permiten organizar la oferta academica antes de registrar estudiantes.

### 7.3 Secciones

1. Seleccionar el curso o grado correspondiente.
2. Crear secciones desde la A hasta la J segun se necesite.
3. Guardar las secciones activas.

### 7.4 Turnos

1. Ir al apartado de turnos.
2. Crear turno de manana, tarde o noche.
3. Definir hora oficial de entrada.
4. Definir hora de salida.
5. Guardar.

### 7.5 Horarios

Los horarios permiten controlar tardanzas y asistencia por turno.

1. Seleccionar curso, grado o seccion.
2. Elegir turno.
3. Definir hora de entrada.
4. Definir hora de salida.
5. Guardar horario.

### 7.6 Calendario escolar

1. Entrar a calendario.
2. Marcar dias laborables.
3. Registrar feriados o eventos.
4. Guardar configuracion.

## 8. Gestion de Estudiantes

Este apartado permite registrar y administrar estudiantes del centro educativo.

![Gestion de estudiantes](../entrega_assets/manual_capturas/07_admin_students.png)

### 8.1 Registrar estudiante

1. Entrar a **Estudiantes**.
2. Presionar **Nuevo estudiante**.
3. Completar nombre.
4. Completar matricula.
5. Seleccionar curso, grado o seccion.
6. Registrar datos de contacto.
7. Vincular padre o tutor si aplica.
8. Guardar.

### 8.2 Validacion de matricula

La matricula debe ser unica. Si ya existe, el sistema debe impedir el registro duplicado.

### 8.3 Editar estudiante

1. Buscar el estudiante.
2. Abrir opciones de edicion.
3. Cambiar los datos necesarios.
4. Guardar cambios.

### 8.4 Generar o reemitir QR

1. Abrir el registro del estudiante.
2. Seleccionar la opcion de QR.
3. Generar o reemitir el codigo.
4. Entregar el QR al estudiante.

## 9. Gestion de Docentes

Este apartado permite registrar docentes y asignar permisos.

![Gestion de docentes](../entrega_assets/manual_capturas/08_admin_teachers.png)

### 9.1 Registrar docente

1. Entrar a **Docentes**.
2. Presionar **Nuevo docente**.
3. Completar nombre.
4. Completar correo.
5. Completar telefono si aplica.
6. Asignar rol o permisos.
7. Asignar secciones o materias.
8. Guardar.

### 9.2 Permisos disponibles

Segun la configuracion del centro, un docente puede tener permisos para:

- Pasar asistencia.
- Ver reportes.
- Editar informacion de matricula.
- Revisar justificaciones.

## 10. Gestion de Padres y Tutores

Este apartado permite registrar padres o tutores y vincularlos con estudiantes.

![Gestion de padres](../entrega_assets/manual_capturas/09_admin_parents.png)

### 10.1 Registrar padre o tutor

1. Entrar a **Padres**.
2. Presionar **Nuevo padre / tutor**.
3. Completar nombre.
4. Completar correo.
5. Completar telefono.
6. Guardar.

### 10.2 Vincular con estudiante

1. Abrir el padre o tutor.
2. Seleccionar estudiante.
3. Confirmar vinculacion.
4. Verificar que el estudiante aparezca relacionado.

## 11. Gestion de Excusas y Justificaciones

Este modulo permite revisar justificaciones enviadas por padres, tutores o usuarios autorizados.

![Gestion de excusas](../entrega_assets/manual_capturas/10_admin_excuses.png)

### 11.1 Revisar una excusa

1. Entrar a **Excusas**.
2. Seleccionar la excusa pendiente.
3. Revisar motivo.
4. Revisar evidencia adjunta.
5. Aprobar o rechazar.

### 11.2 Aprobar excusa

Al aprobar una excusa, el estado del registro cambia y queda evidencia de quien la reviso.

### 11.3 Rechazar excusa

Al rechazar una excusa, se conserva el historial para fines de auditoria.

## 12. Panel Docente

El panel docente permite registrar asistencia y revisar informacion de los grupos asignados.

![Panel docente](../entrega_assets/manual_capturas/11_teacher_dashboard.png)

### 12.1 Escanear QR

1. Entrar al panel docente.
2. Abrir el escaner QR.
3. Permitir acceso a la camara.
4. Apuntar la camara al QR del estudiante.
5. Esperar confirmacion del sistema.

### 12.2 Registro de entrada

Cuando el estudiante no tiene entrada en el turno actual, el sistema registra la hora de entrada.

### 12.3 Registro de salida

Cuando el estudiante ya tiene entrada, el sistema puede registrar la salida si corresponde.

### 12.4 Evitar doble registro

Si el estudiante ya fue registrado en el mismo turno, el sistema muestra una alerta de duplicidad.

### 12.5 Asistencia manual

1. Abrir asistencia manual.
2. Buscar estudiante o escribir matricula.
3. Seleccionar entrada, salida o incidencia.
4. Escribir motivo de contingencia.
5. Guardar.

## 13. Bandeja de Excusas del Docente

![Bandeja docente](../entrega_assets/manual_capturas/12_teacher_inbox.png)

### Pasos

1. Entrar a la bandeja de excusas.
2. Revisar las excusas pendientes.
3. Ver motivo y evidencia.
4. Aprobar o rechazar segun el caso.

## 14. Ausencias de Estudiantes

![Ausencias de estudiantes](../entrega_assets/manual_capturas/13_teacher_absences.png)

### Uso

1. Entrar al apartado de ausencias.
2. Filtrar por fecha, curso o seccion.
3. Revisar estudiantes ausentes o tardios.
4. Exportar reporte si el rol lo permite.

## 15. Panel de Padre o Tutor

![Panel padre](../entrega_assets/manual_capturas/14_parent_dashboard.png)

El padre o tutor puede consultar informacion de asistencia y justificaciones de los estudiantes vinculados.

### Funciones principales

- Ver estudiantes vinculados.
- Consultar historial.
- Enviar excusas.
- Revisar estado de justificaciones.

## 16. Enviar Excusa

![Enviar excusa](../entrega_assets/manual_capturas/15_parent_send_excuse.png)

### Pasos

1. Entrar a **Enviar excusa**.
2. Seleccionar estudiante.
3. Seleccionar fecha.
4. Escribir motivo.
5. Adjuntar imagen o PDF como evidencia.
6. Enviar.

## 17. Historial de Excusas

![Historial de excusas](../entrega_assets/manual_capturas/16_parent_history.png)

### Uso

1. Entrar a historial.
2. Revisar excusas enviadas.
3. Ver estado: pendiente, aprobada o rechazada.
4. Consultar evidencia si esta disponible.

## 18. Panel de Estudiante

![Panel estudiante](../entrega_assets/manual_capturas/17_student_dashboard.png)

El estudiante puede ver informacion relacionada con su asistencia o excusas, segun los permisos configurados.

## 19. Mis Excusas

![Mis excusas](../entrega_assets/manual_capturas/18_student_excuses.png)

### Uso

1. Entrar a **Mis excusas**.
2. Revisar historial.
3. Consultar estado de cada solicitud.

## 20. Reportes del Sistema

El sistema permite generar reportes administrativos para direccion y docentes.

### Reporte diario por aula

Muestra estudiantes presentes, ausentes y tardios por curso o seccion.

### Reporte por estudiante

Muestra historial mensual, porcentaje de asistencia y motivos de ausencia.

### Reporte por docente

Permite consultar asistencia del grupo asignado y estadisticas.

### Exportacion

1. Seleccionar rango de fechas.
2. Aplicar filtros.
3. Presionar exportar PDF o Excel.
4. Guardar el archivo generado.

## 21. Recomendaciones de Uso

- Mantener actualizados estudiantes, docentes y tutores.
- Revisar que los horarios oficiales esten correctamente configurados.
- Verificar que cada estudiante tenga QR vigente.
- Aprobar o rechazar justificaciones a tiempo.
- Usar asistencia manual solo cuando falle el QR o exista contingencia.
- Revisar reportes diariamente.

## 22. Mensajes Frecuentes

### QR no valido

El codigo escaneado no pertenece al formato esperado o no corresponde a un estudiante registrado.

### Ya tiene asistencia registrada

El estudiante ya fue registrado en el mismo turno y el sistema evita duplicidad.

### Tu cuenta directiva no tiene un centro asignado

El administrador absoluto debe asignar un centro educativo al director.

### La asignacion no es valida

El centro o usuario seleccionado no cumple con los datos requeridos para la asignacion.

### Failed to fetch

Puede indicar problema de conexion, variables de entorno, backend apagado o error de permisos.

### Column does not exist

Indica que falta ejecutar el script completo de base de datos en Supabase.

## 23. Cierre del Manual

QHere permite centralizar la asistencia escolar y mejorar el control administrativo del centro educativo. El uso correcto del sistema depende de mantener configurados los centros, usuarios, horarios y relaciones entre estudiantes, docentes y tutores.
