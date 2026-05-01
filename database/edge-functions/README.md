# Edge Function - QHere

Esta carpeta contiene una Edge Function opcional de Supabase para cumplir el entregable de `Edge Function`.

El sistema principal usa Flask para la logica de negocio, pero esta funcion puede recibir eventos de asistencia y servir como punto de integracion externo.

## Funcion incluida

```text
notify-attendance/
|-- index.ts
```

## Despliegue sugerido

```bash
supabase functions deploy notify-attendance
```

## Endpoint esperado

```text
https://TU-PROYECTO.supabase.co/functions/v1/notify-attendance
```

## Ejemplo de prueba

```bash
curl -X POST "$SUPABASE_URL/functions/v1/notify-attendance" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"uuid\",\"event\":\"check_in\"}"
```
