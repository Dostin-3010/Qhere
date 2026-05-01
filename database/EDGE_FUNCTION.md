# Edge Function

Entregable: Edge Function de Supabase para QHere.

Ubicacion:

```text
database/edge-functions/notify-attendance/index.ts
```

Descripcion:

La funcion `notify-attendance` recibe eventos de asistencia mediante HTTP `POST`. En una version productiva puede conectarse con proveedores de correo, WhatsApp, SMS o webhooks institucionales.

El backend principal del sistema sigue siendo Flask, por lo que esta Edge Function se entrega como integracion opcional/documentada de Supabase.
