
# QHERE

Sistema web de control de asistencia escolar con QR para centros educativos. El proyecto permite gestionar centros, estudiantes, docentes, padres/tutores, asistencia por escaneo o contingencia manual, justificaciones con evidencia y reportes operativos para direccion.

## Tecnologias

- Frontend: React 19 + Vite
- Backend: Python 3 + Flask
- Base de datos y auth: Supabase
- Exportaciones: XLSX + jsPDF

Nota de alcance: el enunciado general menciona FastAPI y Odoo, pero esta implementacion final usa Flask + React + Supabase. FastAPI y Odoo no forman parte del codigo productivo entregado.

## Caracteristicas principales

- Autenticacion segura con roles `admin`, `teacher` y `parent`
- Configuracion de centro educativo, grados, secciones, turnos y calendario
- Registro de estudiantes con matricula unica y QR regenerable
- Gestion de docentes con permisos operativos
- Gestion de padres/tutores y vinculacion con estudiantes
- Registro de entrada y salida por QR
- Asistencia manual de contingencia con auditoria
- Tardanzas automaticas por horario oficial
- Justificaciones con evidencia y flujo de aprobacion
- Reportes y exportacion en PDF/Excel
- Control de dispositivos autorizados
- Captura opcional de geolocalizacion del escaneo
- Dashboard administrativo con alertas y bitacora

## Requisitos del sistema

- Node.js 20 o superior
- npm 10 o superior
- Python 3.11 o superior
- Proyecto Supabase configurado

## Variables de entorno

### Frontend

Archivo `frontend/.env`

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
VITE_API_URL=http://localhost:5000/api
```

### Backend

Archivo `backend/.env`

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=TU_SUPABASE_SERVICE_ROLE_KEY
SECRET_KEY=CAMBIA_ESTA_CLAVE
FLASK_DEBUG=True
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=clave
SMTP_FROM_EMAIL=notificaciones@tu-centro.edu
SMTP_USE_TLS=True
```

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd qhere
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## Ejecucion paso a paso

1. Levanta el backend en `http://localhost:5000`.
2. Levanta el frontend en `http://localhost:5173`.
3. Configura o restaura la base con `database/schema.sql` y las migraciones.
4. Ingresa al sistema con un usuario administrador de Supabase Auth que tenga perfil `admin`.
5. Completa la configuracion del centro en `/admin/setup`.
6. Registra estudiantes, docentes y padres.
7. Usa el panel docente para escaneo, asistencia manual y reportes.

## Base de datos

- Script principal: `database/schema.sql`
- Script completo de entrega: `database/full_supabase_script.sql`
- RPC: `database/rpc_functions.sql`
- Realtime: `database/realtime_setup.sql`
- Edge Function opcional: `database/edge-functions/`
- Tablas de funcionalidades futuras / opcionales: `database/future_tables.sql`
- Migraciones: `database/migrations/`
- Diagrama: `docs/DIAGRAMA_BASE_DATOS.md`

## Estructura del proyecto

```text
qhere/
|-- backend/
|   |-- app/
|   |   |-- routes/
|   |   |-- repositories/
|   |   |-- services/
|   |   |-- utils/
|   |-- run.py
|   |-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |-- package.json
|-- database/
|   |-- schema.sql
|   |-- future_tables.sql
|   |-- migrations/
|-- docs/
```

## Uso del sistema

- `Admin`: configura centro, horarios, calendario, estudiantes, docentes, padres, excusas y alertas operativas.
- `Teacher`: registra asistencia por QR o manual, revisa excusas y consulta reportes.
- `Parent`: consulta historial y envia justificaciones con evidencia.

## API principal

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/attendance/scan`
- `POST /api/attendance/manual`
- `GET /api/students`
- `GET /api/teachers`
- `GET /api/excuses`
- `POST /api/excuses/upload-evidence`

## Procesamiento de correos

La cola de alertas por correo se procesa con:

```bash
cd backend
python process_notification_queue.py
```

## Credenciales relevantes

- Las credenciales activas de demostracion deben definirse segun el entorno Supabase que se entregue.
- Se recomienda entregar un usuario `admin`, uno `teacher` y uno `parent`.
- No se deben publicar claves `service_role` en documentacion abierta.

## Documentacion incluida

- `docs/ACTA_PROYECTO.md`
- `docs/CRONOGRAMA_ACTIVIDADES.md`
- `docs/MANUAL_TECNICO.md`
- `docs/MANUAL_USUARIO.md`
- `docs/ANALISIS_Y_DISENO.md`
- `docs/TRAZABILIDAD_RF.md`
- `docs/DIAGRAMA_BASE_DATOS.md`
- `docs/PRESENTACION_PROPUESTA.md`
- `docs/GUIA_ENTREGA_USB.md`
- `docs/CREDENCIALES_RELEVANTES.md`

## Autores

- Desarrollador: Dustin Polanco
- Administrador de proyecto: Rijo
