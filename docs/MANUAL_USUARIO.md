# Manual de Usuario

## 1. Objetivo

QHERE permite registrar asistencia escolar, justificar incidencias y consultar reportes segun el rol del usuario.

## 2. Ingreso al sistema

1. Abrir la aplicacion web.
2. Seleccionar el centro educativo si aplica.
3. Ingresar correo y contrasena.
4. El sistema redirige segun el rol del usuario.

## 3. Panel administrador

Funciones:

- Configurar centro educativo
- Crear grados, secciones y horarios
- Gestionar estudiantes
- Gestionar docentes y permisos
- Gestionar padres y vinculaciones
- Revisar excusas
- Consultar dashboard y alertas

### Flujo sugerido

1. Entrar a `Configuracion`.
2. Registrar datos del centro.
3. Crear secciones y horarios.
4. Definir calendario escolar.
5. Registrar docentes.
6. Registrar estudiantes.
7. Vincular padres/tutores.

## 4. Panel docente

Funciones:

- Escanear QR
- Registrar entrada y salida
- Registrar asistencia manual
- Revisar excusas
- Consultar ausencias y exportaciones

### Escaneo QR

1. Abrir panel docente.
2. Permitir acceso a camara.
3. Escanear el QR del estudiante.
4. Verificar mensaje de entrada, salida o duplicidad.

### Contingencia manual

1. Abrir registro manual.
2. Escribir matricula.
3. Indicar accion y motivo.
4. Guardar para generar trazabilidad auditable.

## 5. Panel padre/tutor

Funciones:

- Consultar historial del estudiante
- Revisar asistencia
- Enviar justificaciones con evidencia

### Enviar una justificacion

1. Ir a `Enviar excusa`.
2. Seleccionar fecha.
3. Escribir motivo.
4. Adjuntar imagen o PDF.
5. Enviar para revision docente/administrativa.

## 6. Reportes

El sistema permite consultar:

- Reporte diario por aula
- Historial por estudiante
- Resumen por docente
- Exportacion en Excel y PDF

## 7. Mensajes frecuentes

- `QR no valido`: el codigo no pertenece al formato esperado.
- `Ya tiene asistencia registrada`: evita duplicados.
- `Dispositivo pendiente de aprobacion`: el admin debe autorizarlo.
- `Fuera del perimetro permitido`: alerta geolocalizada si el centro configuro radio.
