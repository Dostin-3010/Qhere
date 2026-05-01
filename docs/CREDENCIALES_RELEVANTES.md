# Credenciales Relevantes

## Importante

Por seguridad, este documento no debe incluir claves privadas completas, contrasenas reales ni `service_role` de Supabase si la carpeta se comparte publicamente. Para la memoria USB de entrega se pueden completar los campos de demostracion de forma controlada.

## Cuentas de demostracion sugeridas

| Rol | Correo | Contrasena | Centro |
|---|---|---|---|
| Administrador absoluto | duspolsyttt@gmail.com | Completar antes de entregar | Acceso global |
| Director | Completar | Completar | Centro de prueba |
| Docente | Completar | Completar | Centro de prueba |
| Padre/Tutor | Completar | Completar | Centro de prueba |

## Variables de entorno principales

### Backend

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SECRET_KEY=
FLASK_DEBUG=True
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_USE_TLS=True
```

### Frontend

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://127.0.0.1:5000
```

## Acceso administrativo

- El panel absoluto se limita al correo configurado como administrador absoluto.
- El director debe estar aprobado y vinculado a un centro educativo.
- Los docentes, padres y estudiantes se registran o vinculan desde el panel directivo.
