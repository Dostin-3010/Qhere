# QHere - Sistema de Control de Asistencia Escolar con QR

## Nombre del Proyecto

**QHere**

Sistema de Control de Asistencia Escolar con QR para centros educativos.

## Descripcion del Proyecto

QHere es una aplicacion web desarrollada para automatizar el control de asistencia escolar. El sistema permite registrar centros educativos, estudiantes, docentes, padres o tutores, cursos, grados, secciones, turnos, horarios, entradas, salidas, tardanzas, ausencias, justificaciones y reportes administrativos.

La asistencia puede registrarse mediante codigos QR unicos por estudiante o mediante asistencia manual de contingencia. El sistema tambien incluye autenticacion, control de acceso por roles, panel de administrador absoluto, panel de direccion, reportes exportables, auditoria y separacion de datos por centro educativo.

**Nota de alcance:** el enunciado general menciona Python + Flask + FastAPI + React + Supabase + Odoo. La implementacion real de QHere fue desarrollada con **Python Flask + React + Supabase**. FastAPI y Odoo no forman parte del codigo productivo entregado.

## Tecnologias Utilizadas

- **Frontend:** React 19, Vite, JavaScript, CSS.
- **Backend:** Python 3, Flask, Flask-CORS, Flask-JWT-Extended.
- **Base de datos:** Supabase con PostgreSQL.
- **Autenticacion:** Supabase Auth y control de roles.
- **Storage:** Supabase Storage para evidencias de justificaciones.
- **Realtime:** Supabase Realtime para eventos y actualizaciones.
- **Edge Function:** Supabase Edge Function para notificaciones de asistencia.
- **Exportaciones:** jsPDF, jsPDF AutoTable y XLSX.
- **QR:** html5-qrcode.
- **Versionamiento:** Git y GitHub.

## Caracteristicas del Sistema

- Registro y administracion de centros educativos.
- Solicitud de acceso para directores.
- Aprobacion de directores por administrador absoluto.
- Seleccion de centro educativo al iniciar sesion.
- Autenticacion segura con roles.
- Panel de administrador absoluto.
- Panel de direccion o administracion del centro.
- Gestion de estudiantes con matricula unica.
- Gestion de docentes y usuarios administrativos.
- Gestion de padres o tutores.
- Vinculacion entre estudiantes y tutores.
- Configuracion de cursos, grados, secciones, turnos y horarios.
- Generacion de QR unico por estudiante.
- Reemision de QR en caso de perdida.
- Escaneo QR desde panel web.
- Registro de entrada y salida.
- Prevencion de doble registro en el mismo turno.
- Control de tardanzas automaticas segun horario oficial.
- Asistencia manual de contingencia auditable.
- Justificaciones de ausencia o tardanza con evidencia.
- Aprobacion o rechazo de justificaciones.
- Alertas y notificaciones administrativas.
- Reporte diario por aula.
- Historial por estudiante.
- Reporte por docente.
- Exportacion de reportes en PDF y Excel.
- Control de duplicidad y fraude.
- Geolocalizacion opcional del escaneo.
- Control de dispositivos autorizados.
- Calendario escolar.
- Dashboard para direccion.
- Bitacora y auditoria.
- Seguridad y privacidad por rol.
- Diseno profesional, moderno y responsive.

## Requisitos del Sistema

Para ejecutar el proyecto localmente se recomienda:

- Windows 10/11, Linux o macOS.
- Node.js 20 o superior.
- npm 10 o superior.
- Python 3.11 o superior.
- Cuenta o proyecto activo en Supabase.
- Navegador moderno: Google Chrome, Microsoft Edge o Firefox.
- Conexion a internet para utilizar Supabase.
- Git instalado para clonar el repositorio.

## Instalacion del Proyecto

### 1. Clonar el repositorio de GitHub

```bash
git clone https://github.com/Dostin-3010/Qhere.git
cd Qhere
```

Si el repositorio se clona con otro nombre de carpeta, entrar a la carpeta correspondiente antes de continuar.

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

### 3. Instalar dependencias del backend

Desde la carpeta raiz del proyecto:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

En Linux o macOS:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuracion

### Configuracion de Supabase

1. Crear un proyecto en Supabase.
2. Ir a **SQL Editor**.
3. Ejecutar el archivo:

```text
database/full_supabase_script.sql
```

4. Confirmar que se creen las tablas, indices, funciones RPC y configuraciones necesarias.
5. Revisar los archivos complementarios:

```text
database/schema.sql
database/rpc_functions.sql
database/realtime_setup.sql
database/EDGE_FUNCTION.md
database/edge-functions/
```

### Variables de entorno del frontend

Crear el archivo `frontend/.env`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
VITE_API_URL=http://localhost:5000/api
```

### Variables de entorno del backend

Crear el archivo `backend/.env`:

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=TU_SUPABASE_SERVICE_ROLE_KEY
SECRET_KEY=CAMBIA_ESTA_CLAVE
FLASK_DEBUG=True
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_USE_TLS=True
```

Si no se configura SMTP, las notificaciones pueden gestionarse desde el panel administrativo o mantenerse como registros internos del sistema.

### Configuracion de Google Login Opcional

Para usar inicio de sesion con Google:

1. Crear credenciales OAuth en Google Cloud Console.
2. Activar el proveedor Google en Supabase Auth.
3. Agregar como redirect URL:

```text
https://TU-PROYECTO.supabase.co/auth/v1/callback
```

4. Agregar como origen autorizado de JavaScript:

```text
http://localhost:5173
http://127.0.0.1:5173
```

5. Copiar el Client ID y Client Secret de Google en Supabase.

## Paso de Ejecucion del Proyecto Paso a Paso

### 1. Ejecutar el backend

```bash
cd backend
venv\Scripts\activate
python run.py
```

El backend debe iniciar en:

```text
http://localhost:5000
```

### 2. Ejecutar el frontend

Abrir otra terminal desde la raiz del proyecto:

```bash
cd frontend
npm run dev
```

El frontend normalmente inicia en:

```text
http://localhost:5173
```

Si el puerto esta ocupado, ejecutar:

```bash
npm run dev -- --host localhost --port 5177 --force
```

### 3. Abrir la aplicacion

Entrar desde el navegador a:

```text
http://localhost:5173
```

o al puerto alternativo indicado por Vite.

### 4. Flujo recomendado de prueba

1. Entrar a la pagina principal.
2. Solicitar acceso como director.
3. Iniciar sesion como administrador absoluto.
4. Aprobar la solicitud del director.
5. Registrar o asignar el centro educativo.
6. Iniciar sesion como director.
7. Elegir el centro educativo.
8. Configurar cursos, grados, secciones, turnos y horarios.
9. Registrar estudiantes, docentes y padres/tutores.
10. Generar o revisar QR de estudiantes.
11. Probar asistencia por QR o asistencia manual.
12. Registrar justificaciones.
13. Revisar reportes y exportaciones.

## Estructura del Proyecto

```text
qhere/
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |-- repositories/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- config.py
|   |   |-- extensions.py
|   |   |-- supabase_client.py
|   |-- process_notification_queue.py
|   |-- requirements.txt
|   |-- run.py
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- utils/
|   |-- package.json
|   |-- vite.config.js
|
|-- database/
|   |-- edge-functions/
|   |-- migrations/
|   |-- EDGE_FUNCTION.md
|   |-- full_supabase_script.sql
|   |-- future_tables.sql
|   |-- realtime_setup.sql
|   |-- rpc_functions.sql
|   |-- schema.sql
|
|-- docs/
|   |-- ACTA_PROYECTO.md
|   |-- ACTA_PROYECTO_QHERE_COMPLETA.md
|   |-- ANALISIS_Y_DISENO.md
|   |-- CRONOGRAMA_ACTIVIDADES.md
|   |-- CRONOGRAMA_ACTIVIDADES_QHERE.xlsx
|   |-- DIAGRAMA_BASE_DATOS.md
|   |-- MANUAL_TECNICO.md
|   |-- MANUAL_USUARIO.md
|   |-- PRESENTACION_PROPUESTA.md
|   |-- TRAZABILIDAD_RF.md
|
|-- entrega_assets/
|-- tools/
|-- README.md
```

## Uso del Sistema

### Administrador absoluto

El administrador absoluto tiene acceso al panel maestro del sistema. Desde este panel puede:

- Ver solicitudes de directores.
- Aprobar o rechazar solicitudes.
- Registrar centros educativos.
- Asignar directores a centros.
- Consultar el estado general de la plataforma.

### Director o administrador del centro

El director gestiona la operacion del centro educativo:

- Configura cursos, grados, secciones, turnos y horarios.
- Registra estudiantes.
- Registra docentes.
- Registra padres o tutores.
- Revisa asistencia.
- Aprueba o rechaza justificaciones.
- Consulta reportes administrativos.

### Docente

El docente puede:

- Escanear QR de estudiantes.
- Registrar asistencia.
- Consultar estudiantes asignados.
- Revisar reportes relacionados con sus grupos.
- Gestionar justificaciones segun permisos asignados.

### Padre, tutor o estudiante

Segun el acceso habilitado, puede:

- Consultar informacion relacionada con asistencia.
- Enviar o revisar justificaciones.
- Ver historial de excusas o incidencias.

## Credenciales Relevantes

Las credenciales finales dependen del proyecto Supabase utilizado para la demostracion. Se recomienda entregar usuarios de prueba con los siguientes roles:

```text
Administrador absoluto:
Correo: duspolsyttt@gmail.com
Rol: super_admin

Director:
Correo: director.demo@qhere.local
Rol: admin/director

Docente:
Correo: docente.demo@qhere.local
Rol: teacher

Padre o tutor:
Correo: padre.demo@qhere.local
Rol: parent
```

**Importante:** no publicar contrasenas reales ni claves `service_role` en GitHub. Las contrasenas de demostracion deben entregarse de forma privada o en el documento local `docs/CREDENCIALES_RELEVANTES.md`.

## API Utilizada y su Implementacion Paso a Paso

### API del Backend Flask

El backend expone una API REST bajo el prefijo:

```text
http://localhost:5000/api
```

Principales endpoints:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/register

GET  /api/students
GET  /api/students/:id
POST /api/students
PUT  /api/students/:id
DELETE /api/students/:id

GET  /api/teachers
GET  /api/teachers/:id
GET  /api/teachers/:id/students
GET  /api/teachers/:id/attendance

GET  /api/excuses
POST /api/excuses
POST /api/excuses/upload-evidence
PATCH /api/excuses/:id/review

POST /api/attendance/scan
POST /api/attendance/manual

POST /api/management/director-requests
POST /api/management/users
GET  /api/management/super-admin/overview
POST /api/management/super-admin/schools
POST /api/management/super-admin/schools/:id/assign-director
POST /api/management/super-admin/directors/:profile_id/:action
```

### Implementacion de la API

1. El frontend captura la accion del usuario desde React.
2. Los archivos de `frontend/src/api/` preparan la solicitud HTTP.
3. La solicitud se envia al backend Flask usando la URL configurada en `VITE_API_URL`.
4. Flask recibe la solicitud en los archivos de `backend/app/routes/`.
5. Las rutas validan datos y permisos.
6. Los servicios de `backend/app/services/` procesan la logica principal.
7. Los repositorios de `backend/app/repositories/` consultan o modifican datos en Supabase.
8. Supabase guarda los registros en PostgreSQL.
9. El backend responde al frontend con JSON.
10. React actualiza la interfaz del usuario.

### API de Supabase

Supabase se utiliza para:

- Autenticacion de usuarios.
- Base de datos PostgreSQL.
- Storage para evidencias.
- RPC para funciones de base de datos.
- Realtime para actualizaciones.
- Edge Function para notificaciones.

### Implementacion de Supabase

1. Crear proyecto en Supabase.
2. Ejecutar `database/full_supabase_script.sql`.
3. Configurar variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_KEY`.
4. Configurar politicas, roles y tablas segun el script.
5. Activar Realtime segun `database/realtime_setup.sql`.
6. Subir la Edge Function ubicada en `database/edge-functions/notify-attendance/`.
7. Probar autenticacion y operaciones CRUD desde el sistema.

## Base de Datos

Archivos principales:

- `database/schema.sql`: estructura principal.
- `database/full_supabase_script.sql`: script completo de entrega.
- `database/rpc_functions.sql`: funciones RPC.
- `database/realtime_setup.sql`: configuracion de Realtime.
- `database/EDGE_FUNCTION.md`: guia de Edge Function.
- `database/edge-functions/`: codigo de Edge Function.
- `database/migrations/`: migraciones complementarias.
- `docs/DIAGRAMA_BASE_DATOS.md`: diagrama y explicacion de la base de datos.

## Documentacion Incluida

- `docs/ACTA_PROYECTO.md`
- `docs/ACTA_PROYECTO_QHERE_COMPLETA.md`
- `docs/ANALISIS_Y_DISENO.md`
- `docs/CRONOGRAMA_ACTIVIDADES.md`
- `docs/CRONOGRAMA_ACTIVIDADES_QHERE.xlsx`
- `docs/DIAGRAMA_BASE_DATOS.md`
- `docs/MANUAL_TECNICO.md`
- `docs/MANUAL_USUARIO.md`
- `docs/PRESENTACION_PROPUESTA.md`
- `docs/TRAZABILIDAD_RF.md`
- `docs/GUIA_ENTREGA_USB.md`
- `docs/CREDENCIALES_RELEVANTES.md`
- `docs/CAPTURAS_REQUERIDAS.md`

## Verificacion Rapida

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
python -m compileall app
```

### Lint del frontend

```bash
cd frontend
npm run lint
```

## Autor del Desarrollo

**Jose Luis Polanco**

Responsable del desarrollo frontend, backend, base de datos, documentacion tecnica y preparacion de entrega del proyecto QHere.

## Autor / Administrador del Proyecto

**Jose Rijo**

Administrador del proyecto, seguimiento academico y supervision general de la entrega.
