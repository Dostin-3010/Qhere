# ACTA DE PROYECTO

## Titulo del Proyecto

**QHere - Sistema de Control de Asistencia Escolar con QR**

## Presentado por

**Dustin Polanco**  
Desarrollador del proyecto

**Jose Rijo**  
Administrador del proyecto

## Resumen

QHere es un sistema web desarrollado para automatizar el control de asistencia escolar en centros educativos. La solucion permite registrar estudiantes, docentes, padres o tutores, cursos, secciones, turnos, horarios, entradas, salidas, tardanzas, ausencias y justificaciones mediante una plataforma centralizada.

El sistema reemplaza el proceso manual de tomar asistencia por un flujo tecnologico mas rapido, seguro y auditable. Cada estudiante puede tener un codigo QR unico, el cual permite registrar su entrada o salida desde un panel web controlado por roles. Ademas, la direccion del centro puede consultar reportes, revisar justificaciones, administrar usuarios y supervisar la informacion por centro educativo.

QHere fue construido con Python Flask, React, Vite, Supabase y PostgreSQL, integrando autenticacion, base de datos, almacenamiento, reportes y funcionalidades administrativas.

## Problematica(s) que Atiende

| Problematica | Solucion propuesta | Objetivos relacionados |
| --- | --- | --- |
| El registro manual de asistencia consume mucho tiempo en el aula o en la entrada del centro. | Implementar escaneo QR para registrar asistencia de manera rapida. | Reducir el tiempo operativo del registro diario. |
| Los registros fisicos pueden perderse, alterarse o contener errores. | Guardar la informacion en una base de datos digital con trazabilidad. | Mejorar la seguridad y confiabilidad de los datos. |
| Es dificil saber en tiempo real quien entro, quien salio, quien llego tarde o quien falto. | Crear paneles de consulta y reportes por estudiante, curso, docente y fecha. | Facilitar la supervision administrativa. |
| Algunos estudiantes pueden intentar evadir o duplicar registros. | Validar duplicidad, turno, horario y codigo QR unico por estudiante. | Disminuir fraude y registros repetidos. |
| Las justificaciones de ausencia o tardanza pueden llegar tarde o sin evidencia. | Permitir registrar justificaciones con motivo y evidencia digital. | Organizar el proceso de aprobacion de excusas. |
| La direccion no cuenta con reportes rapidos para la toma de decisiones. | Generar reportes exportables en PDF y Excel. | Apoyar la gestion del centro educativo. |
| No siempre se conoce quien realizo una accion dentro del sistema. | Registrar auditoria, usuario, fecha, dispositivo y accion realizada. | Mantener control y responsabilidad operativa. |

## Justificacion

La implementacion de QHere proporciona al centro educativo una herramienta moderna para controlar la asistencia estudiantil de forma eficiente. Al digitalizar el proceso, se reducen los errores del registro manual y se agiliza la consulta de informacion por parte de la direccion, docentes y personal administrativo.

El sistema beneficia al centro porque centraliza los datos de asistencia, permite validar entradas y salidas, facilita la identificacion de tardanzas recurrentes y organiza las justificaciones con evidencia. Tambien beneficia a los docentes, ya que disminuye el tiempo invertido en procesos repetitivos y permite consultar informacion de sus grupos asignados.

Para los padres o tutores, QHere ofrece una mejor trazabilidad de la asistencia de sus hijos y un canal mas organizado para las justificaciones. Para la administracion, representa una mejora en rapidez, seguridad, control, calidad de la informacion y toma de decisiones.

Con este proyecto se introduce una solucion tecnologica que combina escaneo QR, autenticacion por roles, gestion academica, reportes y base de datos en la nube, adaptada a las necesidades de un centro educativo.

## Objetivo General

Desarrollar una aplicacion web para administrar y controlar la asistencia escolar mediante codigos QR, permitiendo a los centros educativos gestionar estudiantes, docentes, tutores, horarios, justificaciones, reportes y auditoria desde una plataforma segura y organizada.

## Objetivos Especificos

- Registrar centros educativos con su periodo academico, datos institucionales, cursos, secciones, grados, turnos y horarios.
- Registrar estudiantes con matricula unica, datos de contacto, tutor y curso asignado.
- Crear docentes y usuarios administrativos con permisos segun su rol.
- Generar codigos QR unicos para los estudiantes.
- Registrar entrada y salida mediante escaneo QR desde panel web.
- Permitir asistencia manual de contingencia cuando no sea posible usar QR.
- Calcular tardanzas de acuerdo con los horarios oficiales.
- Gestionar justificaciones de ausencia o tardanza con evidencia.
- Aprobar o rechazar justificaciones desde el panel correspondiente.
- Generar reportes diarios, mensuales, por estudiante, por docente y por curso.
- Exportar informacion en formatos PDF y Excel.
- Mantener bitacora de acciones importantes del sistema.
- Proteger datos sensibles mediante control de acceso por roles.

## Alcance del Proyecto

El alcance de QHere cubre los requerimientos funcionales RF-01 al RF-25 definidos para el proyecto, incluyendo registro de centros, estudiantes, docentes, tutores, QR, panel de escaneo, entrada, salida, turnos, justificaciones, contingencia manual, tardanzas, alertas, reportes, exportaciones, geolocalizacion opcional, dispositivos autorizados, calendario, dashboard, auditoria y seguridad.

## Elementos de la Cadena de Valor de la Implementacion

### Resultados Esperados

- La direccion podra consultar informacion de asistencia con mayor rapidez.
- Los docentes tendran una herramienta mas eficiente para controlar sus grupos.
- El centro educativo contara con datos organizados, historicos y exportables.
- Los estudiantes tendran registros mas claros de entradas, salidas, tardanzas y ausencias.
- Los padres o tutores podran tener mejor seguimiento de las justificaciones.

### Impactos Previstos

- Modernizacion del proceso de asistencia escolar.
- Reduccion del uso de registros manuales.
- Mayor control sobre la puntualidad estudiantil.
- Mejor organizacion administrativa.
- Mayor trazabilidad de acciones dentro del sistema.

### Efectos a Lograr

- Registro de asistencia mas rapido y seguro.
- Validacion de datos por centro educativo.
- Reportes administrativos disponibles en menos tiempo.
- Disminucion de errores y duplicidad.
- Evidencia digital de justificaciones.

### Productos, Servicios y Mejoras Evidenciables

- Plataforma web QHere.
- Panel de administrador absoluto.
- Panel de direccion del centro educativo.
- Registro de estudiantes, docentes y tutores.
- Modulo de asistencia por QR.
- Modulo de asistencia manual.
- Modulo de justificaciones.
- Reportes en pantalla, PDF y Excel.
- Scripts de base de datos.
- Documentacion tecnica y de usuario.
- Cronograma de actividades.
- Presentacion tipo propuesta.

## Actividades Claves

- Levantamiento y analisis de requerimientos.
- Diseno de estructura de base de datos.
- Construccion del backend en Python Flask.
- Construccion del frontend en React y Vite.
- Configuracion de Supabase, autenticacion y tablas.
- Implementacion de roles y acceso por centro educativo.
- Desarrollo de gestion de estudiantes, docentes y tutores.
- Implementacion de QR y asistencia.
- Implementacion de justificaciones y reportes.
- Creacion de documentacion de entrega.
- Generacion de cronograma, capturas y presentacion.
- Empaquetado final para memoria USB.

## Fundamentacion Tecnologica

QHere introduce una mejora tecnologica frente al proceso tradicional de asistencia escolar. En lugar de depender exclusivamente de listas fisicas, hojas de calculo o registros manuales, el sistema integra una plataforma web con base de datos en la nube, autenticacion por roles y registro digital de acciones.

El frontend fue desarrollado con React y Vite para ofrecer una experiencia rapida, moderna y responsive. El backend utiliza Python Flask para exponer servicios y organizar la logica del sistema. Supabase y PostgreSQL se utilizan para almacenar los datos, manejar autenticacion, permitir consultas y facilitar la administracion del sistema.

La innovacion principal consiste en unir control de asistencia por QR, gestion academica, aprobacion directiva, reportes, auditoria, justificaciones y separacion de datos por centro educativo dentro de una misma solucion.

## Entregables del Proyecto

- Proyecto completo con frontend y backend.
- Base de datos con script completo, tablas, indices, RPC, Realtime y Edge Function.
- Diagrama de base de datos.
- README del proyecto.
- Acta de proyecto.
- Manual tecnico.
- Manual de usuario.
- Cronograma de actividades.
- Analisis y diseno del sistema.
- Capturas de pantalla en PNG y PDF.
- Presentacion tipo propuesta.
- Paquete final para entrega en memoria USB.

## Criterios de Aceptacion

- El sistema permite iniciar sesion y aplicar control de acceso por rol.
- El administrador absoluto puede revisar solicitudes directivas y gestionar centros.
- El director o administrador del centro puede gestionar estudiantes, docentes, tutores, cursos, secciones, turnos y horarios.
- El sistema puede registrar asistencia mediante QR o contingencia manual.
- El sistema puede generar reportes y exportaciones.
- La documentacion de entrega esta completa y organizada.

## Riesgos Considerados

- Configuracion incorrecta de variables de entorno.
- Falta de ejecucion del script completo de Supabase.
- Problemas de permisos de camara en dispositivos de escaneo.
- Dependencia de la conexion a internet para Supabase.
- Configuracion externa pendiente para proveedores de correo o mensajeria.

## Cierre

QHere queda definido como una solucion academica completa para centros educativos que requieren modernizar el control de asistencia. El proyecto permite mejorar la rapidez, seguridad, organizacion y trazabilidad de los procesos de asistencia escolar mediante una plataforma web funcional, documentada y preparada para entrega.

